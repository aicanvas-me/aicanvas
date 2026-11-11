import 'server-only'
import { randomBytes } from 'node:crypto'
import type { createAdminClient } from '@/app/lib/supabase/admin'
import { checkedOutSignedOut, fetchPaddleTransaction, hasLifetimeItem, lifetimePriceId } from './lifetime'
import { fetchPaddleCustomerEmail, findUserIdByEmail } from './paddle-provision'
import { getPremiumForUser } from './premium'

// Signs in a brand-new buyer on the browser that just paid, so they never need
// the email link. ONLY for an account this checkout created that nobody has
// signed into: an address that already had an account still gets "check your
// inbox", so paying with someone's email never opens their existing account.
// ACCEPTED RESIDUAL (his ruling 2026-11-11, "Accept risk"): a stranger who pays
// with another person's address is signed in to the NEW account under it, and
// keeps that session if the owner later signs in with the same address.

type AdminClient = ReturnType<typeof createAdminClient>

// The browser asks seconds after payment; an older transaction is a replay.
const MAX_TXN_AGE_MS = 15 * 60 * 1000
const PAID = new Set(['paid', 'completed'])

export type CheckoutSignIn =
  | { status: 'ready'; email: string; password: string }
  | { status: 'pending' }
  | { status: 'refused' }

type Purchase = 'live' | 'pending' | 'refused'

/** Is this transaction's access already on the account? Lifetime: its own row,
 *  granted and not revoked. A subscription: the one premium check, since on a
 *  brand-new account Premium can only come from this checkout. 'pending' while
 *  the webhook is still writing it. */
async function purchaseOn(admin: AdminClient, txn: any, userId: string): Promise<Purchase> { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (hasLifetimeItem(txn, lifetimePriceId())) {
    const { data, error } = await admin
      .from('user_lifetime_access')
      .select('user_id, granted_at, revoked_at')
      .eq('paddle_transaction_id', txn.id)
      .maybeSingle()
    if (error || !data) return 'pending'
    if (data.user_id !== userId || data.revoked_at) return 'refused'
    return data.granted_at ? 'live' : 'pending'
  }
  if (typeof txn?.subscription_id !== 'string' || !txn.subscription_id) return 'refused'
  const state = await getPremiumForUser(admin, userId).catch(() => null)
  return state?.premium ? 'live' : 'pending'
}

/**
 * Everything is checked server-side against Paddle and our own rows: the
 * transaction is real, paid, fresh and was bought signed out; the account under
 * its checkout email was made by the webhook after this transaction started,
 * nobody has signed into it, and the purchase is already on it. Then a one-time
 * claim per transaction (billing_events' unique key), and a random password the
 * route signs in with and nobody ever sees. A password, not a link: minting a
 * link replaces the one the purchase email carries.
 * 'pending' means ask again shortly (the webhook is still working); 'refused'
 * means this buyer signs in from the email.
 */
export async function prepareCheckoutSignIn(admin: AdminClient, transactionId: string): Promise<CheckoutSignIn> {
  const read = await fetchPaddleTransaction(transactionId)
  if (read === 'transient') return { status: 'pending' }
  if (read === 'missing') return { status: 'refused' }
  const txn = read.txn
  if (txn?.id !== transactionId) return { status: 'refused' }
  if (!PAID.has(txn?.status)) return { status: txn?.status === 'canceled' ? 'refused' : 'pending' }
  const startedAt = Date.parse(txn?.created_at ?? '')
  if (!startedAt || Date.now() - startedAt > MAX_TXN_AGE_MS) return { status: 'refused' }
  if (!checkedOutSignedOut(txn)) return { status: 'refused' }
  if (typeof txn?.customer_id !== 'string' || !txn.customer_id) return { status: 'refused' }

  const lookup = await fetchPaddleCustomerEmail(txn.customer_id)
  if ('transient' in lookup) return { status: 'pending' }
  if ('missing' in lookup) return { status: 'refused' }
  const userId = await findUserIdByEmail(lookup.email)
  if (!userId) return { status: 'pending' }
  const { data: { user }, error: userErr } = await admin.auth.admin.getUserById(userId)
  if (userErr || !user?.email) return { status: 'pending' }
  if (!user.user_metadata?.anon_provisioned || user.last_sign_in_at) return { status: 'refused' }
  if (!(Date.parse(user.created_at) >= startedAt)) return { status: 'refused' }

  const purchase = await purchaseOn(admin, txn, userId)
  if (purchase !== 'live') return { status: purchase }

  const { data: claimed, error: claimErr } = await admin
    .from('billing_events')
    .upsert(
      {
        paddle_event_id: `checkout-signin:${transactionId}`,
        event_type: 'checkout.signin',
        transaction_id: transactionId,
        user_id: userId,
        summary: { note: 'the browser that paid was signed in' },
      },
      { onConflict: 'paddle_event_id', ignoreDuplicates: true },
    )
    .select('id')
  if (claimErr) {
    console.error('[checkout sign-in] claim failed:', claimErr)
    return { status: 'refused' }
  }
  if (!claimed || claimed.length === 0) return { status: 'refused' }

  // password_unknown: settings and /welcome offer "Add a password" instead of
  // asking for a current password the buyer never had.
  const password = `${randomBytes(24).toString('base64url')}Aa1!`
  const { error: pwErr } = await admin.auth.admin.updateUserById(userId, {
    password,
    user_metadata: { ...(user.user_metadata ?? {}), password_unknown: true },
  })
  if (pwErr) {
    console.error('[checkout sign-in] password write failed:', pwErr.message)
    return { status: 'refused' }
  }
  return { status: 'ready', email: user.email, password }
}
