import { NextRequest, NextResponse } from 'next/server'
import { verifyPaddleSignature } from '@/lib/identity/paddle-signature'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { mapSubscriptionFields } from '@/lib/identity/sub-mapping'
import { welcomeToPremiumEmail, claimPremiumAccountEmail } from '@/app/lib/email/messages'
import { NOREPLY_FROM } from '@/app/lib/config'
import { fetchPaddleCustomerEmail, provisionUserByEmail, signInLinkFor } from '@/lib/identity/paddle-provision'
import { phCapture } from '@/app/lib/analytics-server'
import {
  applyLifetimeAdjustment,
  cancelSubscriptionForLifetime,
  checkedOutSignedOut,
  grantFromTransaction,
  sendLifetimeEmail,
} from '@/lib/identity/lifetime'
import { logBillingEvent, sendBillingAlert, type AlertContext, type PaddleEvent } from '@/lib/identity/billing-events'

export const runtime = 'nodejs'

type AdminClient = ReturnType<typeof createAdminClient>

/* eslint-disable @typescript-eslint/no-explicit-any */

/** A handler's response plus what the billing alert needs to know. */
interface Handled {
  res: NextResponse
  userId?: string | null
  lifetime?: AlertContext['lifetime']
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

// Lifetime is a one-time price: its purchase is a transaction, its refunds and
// chargebacks are adjustments.
const LIFETIME_EVENTS = new Set(['transaction.completed', 'adjustment.created', 'adjustment.updated'])

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
  let evt: PaddleEvent
  try {
    evt = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  if (!evt.event_type) return NextResponse.json({ ok: true, ignored: 'unknown' })

  const admin = createAdminClient()

  // Our own record of every verified event, before any handling. It never
  // fails the webhook.
  await logBillingEvent(admin, evt)

  let handled: Handled
  if (LIFETIME_EVENTS.has(evt.event_type)) handled = await handleLifetimeEvent(admin, evt)
  else if (SUBSCRIPTION_EVENTS.has(evt.event_type)) handled = await handleSubscriptionEvent(admin, evt)
  else handled = { res: NextResponse.json({ ok: true, ignored: evt.event_type }) }

  // The maintainer's billing alert, after access handling and only when that
  // did not fail: a failed delivery comes back, and the alert goes with it. One
  // email per change (the alert key); it never changes access or the response.
  if (handled.res.status < 500) {
    await sendBillingAlert(admin, evt, { userId: handled.userId, lifetime: handled.lifetime })
  }
  return handled.res
}


/**
 * Lifetime: transaction.completed grants (only for the Lifetime price; every
 * renewal and other transaction is ignored), adjustments revoke or restore.
 * These payloads never pass through the subscription mapper or reach the
 * subscription row.
 */
async function handleLifetimeEvent(admin: AdminClient, evt: PaddleEvent): Promise<Handled> {
  const data: any = evt.data ?? {}

  if (evt.event_type === 'transaction.completed') {
    const out = await grantFromTransaction(admin, data)
    if (out.status === 'transient') return { res: NextResponse.json({ error: out.reason }, { status: 500 }) }
    if (out.status === 'ignored') return { res: NextResponse.json({ ok: true, ignored: out.reason }) }
    if (out.status === 'unmatched') return { res: NextResponse.json({ ok: true, unmatched: true }) }
    const userId = out.row.user_id
    // A refund or chargeback landed before the purchase: the grant stays
    // revoked, so no cancel and no email.
    if (!out.live) return { res: NextResponse.json({ ok: true, revoked: true }), userId }
    // A duplicate delivery runs both again: the cancel checks Paddle first and
    // the email has its own send-once claim.
    const d1 = await cancelSubscriptionForLifetime(admin, userId)
    await sendLifetimeEmail(admin, out.row, d1.scheduledCancel, checkedOutSignedOut(data))
    if (out.inserted) await phCapture('Lifetime Purchased', {})
    return { res: NextResponse.json({ ok: true, lifetime: true }), userId }
  }

  const out = await applyLifetimeAdjustment(admin, data, evt.occurred_at ?? null)
  if (out.status === 'transient') return { res: NextResponse.json({ error: out.reason }, { status: 500 }) }
  if (out.status === 'ignored') return { res: NextResponse.json({ ok: true, ignored: out.reason }) }
  const lifetime = {
    revokedNow: out.status === 'applied' && out.revokedNow,
    revoked: out.row.revoked_at != null,
    grantedAt: out.row.granted_at,
  }
  if (out.status === 'stale') return { res: NextResponse.json({ ok: true, stale: true }), userId: out.row.user_id, lifetime }
  if (out.revokedNow) await phCapture('Lifetime Revoked', { reason: out.row.revoke_reason })
  return { res: NextResponse.json({ ok: true, effect: out.effect }), userId: out.row.user_id, lifetime }
}

async function handleSubscriptionEvent(admin: AdminClient, evt: PaddleEvent): Promise<Handled> {
  const data: any = evt.data ?? {}
  const fields = mapSubscriptionFields(data)
  if (!fields.status) return { res: NextResponse.json({ ok: true, ignored_status: data.status }) }

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
      return { res: NextResponse.json({ error: 'customer lookup failed' }, { status: 500 }) }
    }
    if ('email' in lookup) {
      const provisioned = await provisionUserByEmail(admin, lookup.email)
      if (provisioned === 'transient') {
        return { res: NextResponse.json({ error: 'provisioning failed' }, { status: 500 }) }
      }
      userId = provisioned.userId
    }
  }

  if (!userId) {
    console.error('[paddle webhook] unmatched event — no user_id, unknown customer, or no checkout email:', evt.event_type, data.customer_id)
    return { res: NextResponse.json({ ok: true, unmatched: true }) }
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
    return { res: NextResponse.json({ ok: true, stale: true }), userId }
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
    return { res: NextResponse.json({ error: 'write failed' }, { status: 500 }) }
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
  // transition, so renewals and existing subscribers are excluded; the row's
  // welcome_claimed_at column adds idempotency (claimed atomically below), and
  // the user's premium_welcome_sent flag, the guard older deploys read, is
  // still honoured and written.
  //
  // Which email: a buyer who checked out signed out, or an `anon_provisioned`
  // account (created here from the checkout email), gets the CLAIM email with
  // a one-time sign-in link; a signed-in upgrade gets the plain welcome.
  // anon_provisioned lives on the USER, so the correct email is chosen no
  // matter which event flips the subscription active (a non-active event may
  // have provisioned the row first). The send stays best-effort and never
  // fails the webhook: a lost claim email is NOT a lockout, because /welcome
  // mails a fresh link to the email the buyer paid with on request.
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
      // An account activated by an older deploy after migration 0021 ran (in
      // the gap before this code went live, or after a rollback) carries the
      // flag that deploy wrote on the user and no claim on its row. Honour the
      // flag too, so no subscriber is ever welcomed twice.
      if (apiKey && user?.email && !user.user_metadata?.premium_welcome_sent) {
        // Claim the send FIRST, with one conditional UPDATE that only matches
        // while welcome_claimed_at is still null. Paddle delivers
        // subscription.created and subscription.activated at the same instant;
        // a flag that was read and then written let both deliveries send. Here
        // the second UPDATE waits on the row lock, re-reads the claimed row,
        // matches nothing and returns no row. A claim that does not persist
        // sends nothing: a missed welcome is not a lockout, a double is a
        // broken promise.
        const { data: claimed, error: claimErr } = await admin
          .from('user_subscriptions')
          .update({ welcome_claimed_at: new Date().toISOString() })
          .eq('user_id', userId)
          .is('welcome_claimed_at', null)
          .select('user_id')
        if (claimErr) {
          console.error('[paddle webhook] welcome claim failed (non-fatal):', claimErr)
        } else if (claimed && claimed.length > 0) {
          // Keep the flag older deploys read in step, so a rollback cannot
          // welcome this subscriber again. Best-effort: the claim above is what
          // stops this code sending twice.
          const { error: flagErr } = await admin.auth.admin.updateUserById(userId, {
            user_metadata: { ...(user.user_metadata ?? {}), premium_welcome_sent: true },
          })
          if (flagErr) {
            console.error('[paddle webhook] welcome flag write failed (non-fatal):', flagErr.message)
          }
          // The link is minted after the claim above, so no delivery replaces it.
          const mail = user.user_metadata?.anon_provisioned || !data.custom_data?.user_id
            ? claimPremiumAccountEmail({ signInUrl: await signInLinkFor(admin, user.email) })
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

  return { res: NextResponse.json({ ok: true }), userId }
}
