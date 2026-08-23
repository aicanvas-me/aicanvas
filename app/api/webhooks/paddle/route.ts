import { NextRequest, NextResponse } from 'next/server'
import { verifyPaddleSignature } from '@/lib/identity/paddle-signature'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { mapSubscriptionFields } from '@/lib/identity/sub-mapping'
import { welcomeToPremiumEmail, claimPremiumAccountEmail } from '@/app/lib/email/messages'
import { NOREPLY_FROM, SITE_URL } from '@/app/lib/config'
import { paddleApiBase } from '@/app/lib/paddle/server'
import { phCapture } from '@/app/lib/analytics-server'

export const runtime = 'nodejs'

type AdminClient = ReturnType<typeof createAdminClient>

/** Resolve the email a buyer entered at Paddle checkout (anonymous purchases
 *  carry no user_id). Subscription events only include customer_id, so we read
 *  the email from the Paddle API. Crucially this DISTINGUISHES a transient
 *  failure (rate limit / 5xx / network) — which the caller turns into a 500 so
 *  Paddle re-delivers — from a genuine miss, so one API hiccup never permanently
 *  strands a charged customer (the webhook is the SOLE provisioning path for an
 *  anonymous buyer). */
type EmailLookup = { email: string } | { transient: true } | { missing: true }
async function fetchPaddleCustomerEmail(customerId: string): Promise<EmailLookup> {
  const apiKey = process.env.PADDLE_API_KEY
  if (!apiKey) return { transient: true }
  try {
    const res = await fetch(`${paddleApiBase()}/customers/${customerId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10_000), // a hang is transient too: Paddle retries
    })
    // 429/5xx = transient. A 404 right after subscription.activated is usually
    // the customer record not yet being queryable (eventual consistency), so
    // treat it as transient too — a Paddle retry recovers it rather than
    // permanently stranding a charged buyer. Other 4xx = a genuine miss.
    if (res.status === 429 || res.status === 404 || res.status >= 500) return { transient: true }
    if (!res.ok) return { missing: true }
    const { data } = await res.json()
    // A 200 with no email is also treated as transient (eventual consistency):
    // a real anonymous checkout always yields a customer carrying an email, so
    // an empty one is a not-yet-consistent read, not a permanent absence.
    return typeof data?.email === 'string' && data.email ? { email: data.email } : { transient: true }
  } catch {
    return { transient: true }
  }
}

/** Provision (or link) a Supabase account from the checkout email. We use
 *  createUser so we can tell a genuinely NEW buyer (created) from an email that
 *  already has an account (email_exists): only the new account is flagged
 *  `anon_provisioned`, which is what later routes the first-activation email to
 *  the sign-in CLAIM (vs the logged-in welcome) regardless of which event
 *  activates.
 *
 *  We deliberately DO NOT mint or email a one-time magic-link token here. The
 *  claim is the existing self-service sign-in (the buyer requests a fresh OTP),
 *  so there is no single-slot token a concurrent webhook delivery could
 *  invalidate — the previous design's created+activated race that could email a
 *  dead claim link is gone. generateLink is used ONLY to resolve an EXISTING
 *  user's id (its token is never sent). Returns 'transient' on a recoverable
 *  failure so the caller forces a Paddle retry instead of stranding the buyer.
 *
 *  SECURITY / ACCEPTED RESIDUAL: Paddle does not prove the buyer controls the
 *  email typed at one-off checkout, so this provisions an account from an
 *  attacker-controllable address. The DANGEROUS half is closed — the claim path
 *  is self-service OTP (no emailed token), so the account is reachable ONLY by
 *  whoever controls the inbox; an attacker who pays with someone else's email
 *  gets no session and no premium. What remains is self-limiting griefing (each
 *  attempt costs a full paid subscription): an unsolicited account/premium under
 *  a victim's address. Do NOT widen this (e.g. never email a one-time token to
 *  this address, never grant access without an OTP). A fuller fix (defer account
 *  creation until the buyer proves mailbox control) is tracked for a tested pass. */
async function provisionUserByEmail(
  admin: AdminClient,
  email: string,
): Promise<{ userId: string; createdNew: boolean } | 'transient'> {
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { anon_provisioned: true },
  })
  if (!createErr && created?.user?.id) return { userId: created.user.id, createdNew: true }

  const errCode = (createErr as { code?: string } | null)?.code
  const errStatus = (createErr as { status?: number } | null)?.status
  const alreadyExists = errCode === 'email_exists' || errCode === 'user_already_exists' || errStatus === 422
  if (!alreadyExists) {
    console.error('[paddle webhook] createUser failed (transient):', createErr?.message)
    return 'transient'
  }
  // Email already has an account — resolve its id. generateLink returns the
  // existing user; we use ONLY data.user.id (the token is irrelevant, never sent).
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${SITE_URL}/account` },
  })
  if (linkErr || !link?.user?.id) {
    console.error('[paddle webhook] existing-user resolve failed (transient):', linkErr?.message)
    return 'transient'
  }
  return { userId: link.user.id, createdNew: false }
}

// Only react to subscription lifecycle events; the STATUS comes from the
// payload's data.status, NEVER from the event name. (An event-name map is a
// resurrection bug: `subscription.updated` fires for incidental changes on
// past_due/canceled subscriptions too, and mapping it to 'active' would
// silently re-grant premium to lapsed accounts.)
const SUBSCRIPTION_EVENTS = new Set([
  'subscription.activated',
  'subscription.created',
  'subscription.updated',
  'subscription.trialing',
  'subscription.past_due',
  'subscription.paused',
  'subscription.resumed',
  'subscription.canceled',
])

export async function POST(req: NextRequest) {
  // Fail CLOSED on misconfiguration: HMAC with an empty key is publicly
  // computable, so an unset secret must never fall back to ''.
  const secret = process.env.PADDLE_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'webhook not configured' }, { status: 503 })

  const raw = await req.text() // RAW body — required for the signature.
  const ok = verifyPaddleSignature(
    raw,
    req.headers.get('paddle-signature'),
    secret,
    Math.floor(Date.now() / 1000),
  )
  if (!ok) return NextResponse.json({ error: 'bad signature' }, { status: 401 })

  // 400 (not 500) on malformed JSON so Paddle stops retrying a permanently
  // broken payload.
  let evt: { event_type?: string; occurred_at?: string; data?: Record<string, unknown> }
  try {
    evt = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  if (!evt.event_type || !SUBSCRIPTION_EVENTS.has(evt.event_type)) {
    return NextResponse.json({ ok: true, ignored: evt.event_type ?? 'unknown' })
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const data: any = evt.data ?? {}
  const fields = mapSubscriptionFields(data)
  if (!fields.status) return NextResponse.json({ ok: true, ignored_status: data.status })

  const admin = createAdminClient()

  // Attribute the event to a user: custom_data.user_id (set at checkout) is
  // primary; fall back to an existing row's paddle_customer_id so renewals /
  // portal-driven changes without custom_data still land. Unmatched events are
  // logged loudly (silent drops orphan paying customers).
  let userId: string | undefined = data.custom_data?.user_id
  if (!userId && data.customer_id) {
    const { data: byCustomer } = await admin
      .from('user_subscriptions')
      .select('user_id')
      .eq('paddle_customer_id', data.customer_id)
      .maybeSingle()
    userId = byCustomer?.user_id
  }

  // Anonymous checkout: no user_id was passed and we've never seen this
  // customer. Provision (or link) an account from the email the buyer entered at
  // Paddle checkout. Gate to an ACTIVATING event only — a stray
  // canceled/past_due/updated event for an unknown customer must never create an
  // orphan account. A transient Paddle-API / Supabase failure returns 500 so
  // Paddle re-delivers within its retry window rather than 200-and-dropping a
  // charged customer (whose row would otherwise never exist for reconcile to
  // heal). The first activating event provisions; once the upsert below stores
  // paddle_customer_id, later events resolve via the fallback above.
  if (!userId && data.customer_id && fields.status === 'active') {
    const lookup = await fetchPaddleCustomerEmail(data.customer_id)
    if ('transient' in lookup) {
      return NextResponse.json({ error: 'customer lookup failed' }, { status: 500 })
    }
    if ('email' in lookup) {
      const provisioned = await provisionUserByEmail(admin, lookup.email)
      if (provisioned === 'transient') {
        return NextResponse.json({ error: 'provisioning failed' }, { status: 500 })
      }
      userId = provisioned.userId
    }
  }

  if (!userId) {
    console.error('[paddle webhook] unmatched event — no user_id, unknown customer, or no checkout email:', evt.event_type, data.customer_id)
    return NextResponse.json({ ok: true, unmatched: true })
  }

  const occurredAt: string | null = evt.occurred_at ?? null

  // Idempotency / ordering guard: Paddle retries re-sign with a fresh
  // timestamp, so the signature window does not stop replays or late
  // out-of-order events. Compare as INSTANTS (stored value is a Postgres
  // timestamptz whose text form differs from Paddle's ISO string — a string
  // compare would misorder them). Discard anything not newer than stored.
  // Read the prior row once: its watermark guards ordering, and its status lets
  // the "welcome to Premium" email fire ONLY on a real non-active→active
  // transition — so an existing subscriber is never re-welcomed on a renewal
  // (active→active) or any later active event.
  const { data: existing } = await admin
    .from('user_subscriptions')
    .select('status, last_event_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (
    occurredAt &&
    existing?.last_event_at &&
    new Date(existing.last_event_at).getTime() >= new Date(occurredAt).getTime()
  ) {
    return NextResponse.json({ ok: true, stale: true })
  }
  const wasActive = existing?.status === 'active'

  // Conditional patch: spread only the fields the event carries (via the shared
  // mapper — same mapping the daily reconcile uses, so the two can't drift) so a
  // partial payload can never null out ids / period end. last_event_at is written
  // ONLY when occurred_at is present — writing a null would CLEAR the watermark
  // and disable the ordering/idempotency guard for every later event, letting an
  // old replayed event overwrite newer state. Omitting it preserves the existing
  // value (an upsert only sets columns present in the payload).
  const patch: Record<string, unknown> = {
    user_id: userId,
    updated_at: new Date().toISOString(),
    ...(occurredAt ? { last_event_at: occurredAt } : {}),
    ...fields,
  }

  const { error } = await admin
    .from('user_subscriptions')
    .upsert(patch, { onConflict: 'user_id' })

  // A failed write must NOT 200 — Paddle's retry schedule is the recovery
  // mechanism for transient DB errors.
  if (error) {
    console.error('[paddle webhook] upsert failed:', error)
    return NextResponse.json({ error: 'write failed' }, { status: 500 })
  }

  // Anonymous conversion/churn counters (no user id, no email — just a
  // count plus the prior status so dashboards can split new signups from
  // dunning recoveries, and count past_due -> canceled churn). Placed after
  // the successful upsert; the stale-guard absorbs sequential Paddle
  // retries (a same-instant concurrent double delivery could still count
  // twice — accepted, it is an analytics counter, not billing state).
  // phCapture never throws and carries a 3s network timeout, so it cannot
  // fail or stall the webhook.
  const prior = existing?.status ?? 'none'
  if (fields.status === 'active' && !wasActive) {
    await phCapture('Subscription Activated', { prior })
  } else if (fields.status === 'canceled' && prior !== 'canceled') {
    await phCapture('Subscription Canceled', { prior })
  }

  // First-activation email. Fires once, only on a genuine non-active -> active
  // transition, so renewals and existing subscribers are excluded; a
  // user_metadata flag adds idempotency.
  //
  // Which email: an `anon_provisioned` account (created here from the checkout
  // email) has no session/password, so it gets the sign-in CLAIM email; everyone
  // else (signed-in upgrade, or an email that already had an account) gets the
  // plain welcome. The flag lives on the USER, so the correct email is chosen no
  // matter which event flips the subscription active (a non-active event may have
  // provisioned the row first). The send stays best-effort and never fails the
  // webhook: a lost claim email is NOT a lockout, because /welcome already told
  // the anonymous buyer to sign in with the email they paid with, and the sign-in
  // page self-serves a fresh OTP on demand.
  //
  // We gate on 'active' only, NOT 'trialing' (which tier.ts also counts as
  // premium): AI Canvas sells no-trial plans, so a first activation never carries
  // 'trialing'. If a trial product is ever added, switch this to
  // PREMIUM_STATUSES.has(fields.status).
  if (fields.status === 'active' && !wasActive) {
    try {
      const apiKey = process.env.RESEND_API_KEY
      const {
        data: { user },
      } = await admin.auth.admin.getUserById(userId)
      if (apiKey && user?.email && !user.user_metadata?.premium_welcome_sent) {
        // Claim the flag FIRST and only send if it persisted: a flag-write
        // failure must never leave the door open to a later double-send.
        const { error: flagErr } = await admin.auth.admin.updateUserById(userId, {
          user_metadata: { ...(user.user_metadata ?? {}), premium_welcome_sent: true },
        })
        if (!flagErr) {
          const mail = user.user_metadata?.anon_provisioned
            ? claimPremiumAccountEmail()
            : welcomeToPremiumEmail()
          const sendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            signal: AbortSignal.timeout(10_000),
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: NOREPLY_FROM, to: [user.email], subject: mail.subject, html: mail.html }),
          })
          if (!sendRes.ok) {
            console.error('[paddle webhook] activation email send failed (non-fatal), status', sendRes.status)
          }
        }
      }
    } catch (e) {
      console.error('[paddle webhook] activation email failed (non-fatal):', e)
    }
  }

  return NextResponse.json({ ok: true })
}
