import 'server-only'
import type { createAdminClient } from '@/app/lib/supabase/admin'
import { SITE_URL } from '@/app/lib/config'
import { paddleApiBase } from '@/app/lib/paddle/server'

// Shared by the Paddle webhook and the daily reconcile: the only two places
// that may create an account from a Paddle checkout email.

type AdminClient = ReturnType<typeof createAdminClient>

/** Resolve the email a buyer entered at Paddle checkout (anonymous purchases
 *  carry no user_id). Subscription events only include customer_id, so we read
 *  the email from the Paddle API. Crucially this DISTINGUISHES a transient
 *  failure (rate limit / 5xx / network / our API key refused) — which the
 *  caller turns into a 500 so Paddle re-delivers — from a genuine miss, so one
 *  API hiccup or a dead key never permanently strands a charged customer (the
 *  webhook is the SOLE provisioning path for an anonymous buyer). */
export type EmailLookup = { email: string } | { transient: true } | { missing: true }
export async function fetchPaddleCustomerEmail(customerId: string): Promise<EmailLookup> {
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
    // permanently stranding a charged buyer. 401/403 means Paddle refused OUR
    // key (expired, rotated or mis-scoped), which says nothing about the buyer:
    // transient, so Paddle keeps re-delivering while the key is replaced instead
    // of a 200 that leaves a charged buyer with no account. Other 4xx = a
    // genuine miss.
    if (res.status === 401 || res.status === 403) {
      console.error('[paddle provision] Paddle refused PADDLE_API_KEY on customer lookup, status', res.status)
      return { transient: true }
    }
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
 *  Nothing here is emailed. The purchase email's sign-in link is minted later,
 *  by signInLinkFor, after that email's send-once claim. An EXISTING user's id
 *  is found by an admin lookup that mints nothing, because any new token
 *  replaces the one a concurrent delivery already emailed. Returns 'transient'
 *  on a recoverable failure so the caller forces a Paddle retry instead of
 *  stranding the buyer.
 *
 *  SECURITY / ACCEPTED RESIDUAL: Paddle does not prove the buyer controls the
 *  email typed at one-off checkout, so this provisions an account from an
 *  attacker-controllable address. The DANGEROUS half is closed: the account is
 *  reachable ONLY through a one-time link mailed to that inbox (the purchase
 *  email's link from signInLinkFor below, or one the buyer requests on
 *  /welcome), so an attacker who pays with someone else's email gets no session
 *  and no premium. What remains is self-limiting griefing (each attempt costs a
 *  full payment): an unsolicited account/premium under a victim's address. Do
 *  NOT widen this: a sign-in link only ever goes to the account's own address,
 *  never back to the browser, and access is never granted without one. A fuller
 *  fix (defer account creation until the buyer proves mailbox control) is
 *  tracked for a tested pass. */
export async function provisionUserByEmail(
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
    console.error('[paddle provision] createUser failed (transient):', createErr?.message)
    return 'transient'
  }
  // Email already has an account: resolve its id without minting a token.
  const found = await findUserIdByEmail(email)
  if (found) return { userId: found, createdNew: false }
  // Lookup failed: generateLink also returns the user, but mints a token that
  // replaces any sign-in link already emailed (the buyer then asks /welcome).
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${SITE_URL}/account` },
  })
  if (linkErr || !link?.user?.id) {
    console.error('[paddle provision] existing-user resolve failed (transient):', linkErr?.message)
    return 'transient'
  }
  return { userId: link.user.id, createdNew: false }
}

/** An account's id by email through Supabase Auth's admin user search (the
 *  `filter` the dashboard uses: a substring match, so the exact address is
 *  picked from the results). Mints nothing. null on any miss or failure, and
 *  the caller falls back to its old resolve. */
async function findUserIdByEmail(email: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) return null
  try {
    const res = await fetch(`${url}/auth/v1/admin/users?filter=${encodeURIComponent(email)}&per_page=50`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    const { users } = (await res.json()) as { users?: { id?: string; email?: string }[] }
    const want = email.toLowerCase()
    return users?.find((u) => u.email?.toLowerCase() === want)?.id ?? null
  } catch {
    return null
  }
}

/** Who the purchase email speaks to. "We created your account" holds only for an
 *  account this checkout path made that nobody has signed into yet. */
export function claimAccountOf(user: {
  email?: string
  last_sign_in_at?: string | null
  user_metadata?: Record<string, unknown>
}): { email: string; created: boolean } {
  return { email: user.email ?? '', created: Boolean(user.user_metadata?.anon_provisioned) && !user.last_sign_in_at }
}

/** A one-time sign-in link for the purchase email, landing on /welcome. Call it
 *  only AFTER the email's send-once claim: a newer link replaces the older one,
 *  so a second minting would kill the link already sent. The link goes through
 *  /account/auth/confirm like the template's, so it needs a Continue press and
 *  lives as long as the project's email links (mailer_otp_exp, 1 hour on prod).
 *  null on any failure: the email then points at /welcome instead. */
export async function signInLinkFor(admin: AdminClient, email: string): Promise<string | null> {
  try {
    const callback = `${SITE_URL}/account/auth/callback?next=${encodeURIComponent('/welcome')}`
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: callback },
    })
    const hash = data?.properties?.hashed_token
    if (error || !hash) {
      console.error('[paddle provision] sign-in link failed (non-fatal):', error?.message)
      return null
    }
    // redirect_to stays LAST and raw: nextFromRedirectTo reads it as the tail.
    return `${SITE_URL}/account/auth/confirm?token_hash=${encodeURIComponent(hash)}&type=email&redirect_to=${callback}`
  } catch (e) {
    console.error('[paddle provision] sign-in link failed (non-fatal):', e)
    return null
  }
}
