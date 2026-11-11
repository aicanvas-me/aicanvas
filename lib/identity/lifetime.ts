import 'server-only'
import type { createAdminClient } from '@/app/lib/supabase/admin'
import { paddleApiBase } from '@/app/lib/paddle/server'
import { NOREPLY_FROM } from '@/app/lib/config'
import { lifetimeEmail } from '@/app/lib/email/messages'
import { fetchPaddleCustomerEmail, provisionUserByEmail, signInLinkFor } from './paddle-provision'
import { LIVE_SUB_STATUSES } from './tier'

// Lifetime: a one-time Paddle price that grants Premium with no expiry. Rows
// live in user_lifetime_access (migration 0022), never in user_subscriptions.
// The webhook, the checkout fast path and the daily reconcile all grant through
// this module, so the three can never write a different row.

type AdminClient = ReturnType<typeof createAdminClient>

export interface LifetimeRow {
  id: number
  user_id: string
  paddle_transaction_id: string | null
  source: 'purchase' | 'gift'
  granted_at: string | null
  revoked_at: string | null
  revoke_reason: 'refund' | 'chargeback' | null
  last_adjustment_at: string | null
  welcome_claimed_at: string | null
}

const ROW_COLUMNS =
  'id, user_id, paddle_transaction_id, source, granted_at, revoked_at, revoke_reason, last_adjustment_at, welcome_claimed_at'

/** The Lifetime price id. ONE NEXT_PUBLIC_ variable so the buy button and the
 *  server can never disagree. Read directly: server code must never import
 *  app/lib/paddle/client.ts (a 'use client' module with paddle-js). An empty
 *  value counts as missing. */
export function lifetimePriceId(): string | null {
  const v = process.env.NEXT_PUBLIC_PADDLE_PRICE_LIFETIME
  return v ? v : null
}

// `any`: raw Paddle JSON (a webhook payload or an API read).
/* eslint-disable @typescript-eslint/no-explicit-any */
function items(txn: any): any[] {
  return Array.isArray(txn?.items) ? txn.items : []
}

/** A one-time item is a price with no billing cycle. Subscription renewals fire
 *  transaction.completed too, and their prices always carry a cycle. */
export function hasOneTimeItem(txn: any): boolean {
  return items(txn).some((i) => i?.price && i.price.billing_cycle == null)
}

/** The transaction bought Lifetime: some item is the Lifetime price, one-time.
 *  Every item is scanned, never only the first. */
export function hasLifetimeItem(txn: any, priceId: string | null): boolean {
  if (!priceId) return false
  return items(txn).some((i) => i?.price?.id === priceId && i.price.billing_cycle == null)
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type UserResolution = { userId: string } | 'transient' | 'unmatched'

/**
 * Who bought it: custom_data.user_id (set at checkout when signed in), else a
 * subscription row with this Paddle customer, else an earlier Lifetime row with
 * this customer, else the checkout email (creates or links the account, the
 * same path an anonymous subscription takes). 'transient' means Paddle should
 * re-deliver; a read error is transient, never a reason to provision.
 */
/** The checkout carried no signed-in user (custom_data.user_id is set only when
 *  the buyer was signed in), so the buyer needs a way in from the email. */
export function checkedOutSignedOut(txn: any): boolean {
  const id = txn?.custom_data?.user_id
  return !(typeof id === 'string' && UUID.test(id))
}

export async function resolveLifetimeUser(admin: AdminClient, txn: any): Promise<UserResolution> {
  const fromCheckout = txn?.custom_data?.user_id
  if (typeof fromCheckout === 'string' && UUID.test(fromCheckout)) return { userId: fromCheckout }

  const customerId = txn?.customer_id
  if (typeof customerId !== 'string' || !customerId) return 'unmatched'

  const subs = await admin.from('user_subscriptions').select('user_id').eq('paddle_customer_id', customerId).limit(1)
  if (subs.error) return 'transient'
  const subUser = subs.data?.[0]?.user_id
  if (subUser) return { userId: subUser }

  const life = await admin.from('user_lifetime_access').select('user_id').eq('paddle_customer_id', customerId).limit(1)
  if (life.error) return 'transient'
  const lifeUser = life.data?.[0]?.user_id
  if (lifeUser) return { userId: lifeUser }

  const lookup = await fetchPaddleCustomerEmail(customerId)
  if ('transient' in lookup) return 'transient'
  if ('missing' in lookup) return 'unmatched'
  const provisioned = await provisionUserByEmail(admin, lookup.email)
  if (provisioned === 'transient') return 'transient'
  return { userId: provisioned.userId }
}

export async function readLifetimeRow(
  admin: AdminClient,
  transactionId: string,
): Promise<{ row: LifetimeRow | null } | { error: unknown }> {
  const { data, error } = await admin
    .from('user_lifetime_access')
    .select(ROW_COLUMNS)
    .eq('paddle_transaction_id', transactionId)
    .maybeSingle()
  if (error) return { error }
  return { row: (data as LifetimeRow | null) ?? null }
}

/**
 * Grant a purchase. Two idempotent statements (supabase-js cannot express a
 * coalesce inside an upsert): insert the row unless one exists for this
 * transaction, then fill granted_at on a tombstone a refund left behind.
 * revoked_at is NEVER touched here, so a refund that landed first stays
 * applied. A duplicate delivery is not a reason to stop: the caller re-reads the
 * row and carries on (the cancel and the email have their own send-once guards).
 */
export async function grantLifetimePurchase(
  admin: AdminClient,
  args: { userId: string; transactionId: string; customerId: string | null },
): Promise<{ row: LifetimeRow; inserted: boolean } | { error: unknown }> {
  const now = new Date().toISOString()
  const ins = await admin
    .from('user_lifetime_access')
    .upsert(
      {
        user_id: args.userId,
        paddle_transaction_id: args.transactionId,
        paddle_customer_id: args.customerId,
        source: 'purchase',
        granted_at: now,
      },
      { onConflict: 'paddle_transaction_id', ignoreDuplicates: true },
    )
    .select('id')
  if (ins.error) return { error: ins.error }
  const inserted = (ins.data ?? []).length > 0

  const fill = await admin
    .from('user_lifetime_access')
    .update({ granted_at: now })
    .eq('paddle_transaction_id', args.transactionId)
    .is('granted_at', null)
  if (fill.error) return { error: fill.error }

  const read = await readLifetimeRow(admin, args.transactionId)
  if ('error' in read) return { error: read.error }
  if (!read.row) return { error: new Error('lifetime row missing after grant') }
  return { row: read.row, inserted }
}

export interface ScheduledCancel {
  plan: 'monthly' | 'annual' | null
  effectiveAt: string | null
}

/**
 * A subscriber who bought Lifetime should not be charged again. Schedule
 * their subscription to cancel at the END of the paid period, never
 * immediately (a canceled Paddle subscription cannot be reinstated, and they
 * paid for the current period). Monthly and annual alike. Users holding a gift
 * row are skipped: their subscriptions are canceled only on the maintainer's
 * word.
 *
 * Never throws and never undoes the grant: a failure is logged and the daily
 * reconcile tries again. Returns the scheduled cancel (new or already there)
 * so the Lifetime email can say when the old plan stops.
 */
export async function cancelSubscriptionForLifetime(
  admin: AdminClient,
  userId: string,
): Promise<{ scheduledCancel: ScheduledCancel | null; failed: boolean }> {
  const none = { scheduledCancel: null, failed: false }
  try {
    const gift = await admin
      .from('user_lifetime_access')
      .select('id')
      .eq('user_id', userId)
      .eq('source', 'gift')
      .limit(1)
    if (gift.error) {
      console.error('[lifetime] gift check failed, cancel deferred to reconcile:', gift.error)
      return { scheduledCancel: null, failed: true }
    }
    if ((gift.data ?? []).length > 0) return none

    const { data: sub, error } = await admin
      .from('user_subscriptions')
      .select('status, plan, paddle_subscription_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) {
      console.error('[lifetime] subscription read failed, cancel deferred to reconcile:', error)
      return { scheduledCancel: null, failed: true }
    }
    if (!sub?.paddle_subscription_id || !LIVE_SUB_STATUSES.includes(sub.status)) return none
    const plan: ScheduledCancel['plan'] = sub.plan === 'annual' || sub.plan === 'monthly' ? sub.plan : null

    const apiKey = process.env.PADDLE_API_KEY
    if (!apiKey) {
      console.error('[lifetime] PADDLE_API_KEY missing, subscription cancel deferred to reconcile')
      return { scheduledCancel: null, failed: true }
    }
    const base = `${paddleApiBase()}/subscriptions/${sub.paddle_subscription_id}`
    const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }

    const getRes = await fetch(base, { headers, signal: AbortSignal.timeout(10_000) })
    if (!getRes.ok) {
      console.error('[lifetime] subscription read at Paddle failed, status', getRes.status)
      return { scheduledCancel: null, failed: true }
    }
    const live = (await getRes.json())?.data
    if (live?.status === 'canceled') return none
    if (live?.scheduled_change?.action === 'cancel') {
      return { scheduledCancel: { plan, effectiveAt: live.scheduled_change.effective_at ?? null }, failed: false }
    }
    // Paddle cancels a paused subscription only immediately, which is never
    // done automatically. Left for the maintainer; reconcile repeats the warning.
    if (live?.status === 'paused') {
      console.warn('[lifetime] Lifetime buyer has a PAUSED subscription; Paddle allows only an immediate cancel, left for a manual decision:', sub.paddle_subscription_id)
      return none
    }

    const cancelRes = await fetch(`${base}/cancel`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ effective_from: 'next_billing_period' }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!cancelRes.ok) {
      console.error('[lifetime] subscription cancel at Paddle failed, status', cancelRes.status)
      return { scheduledCancel: null, failed: true }
    }
    const canceled = (await cancelRes.json())?.data
    return { scheduledCancel: { plan, effectiveAt: canceled?.scheduled_change?.effective_at ?? null }, failed: false }
  } catch (e) {
    console.error('[lifetime] subscription cancel failed, deferred to reconcile:', e)
    return { scheduledCancel: null, failed: true }
  }
}

type TransactionLookup = { txn: any } | 'transient' | 'missing'

/** Read a transaction from Paddle. Our key refused (401/403), a rate limit, a
 *  5xx or a hang are transient: Paddle re-delivers. A 404 is a genuine miss. */
export async function fetchPaddleTransaction(transactionId: string): Promise<TransactionLookup> {
  const apiKey = process.env.PADDLE_API_KEY
  if (!apiKey) return 'transient'
  try {
    const res = await fetch(`${paddleApiBase()}/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10_000),
    })
    if (res.status === 401 || res.status === 403) {
      console.error('[lifetime] Paddle refused PADDLE_API_KEY on transaction read, status', res.status)
      return 'transient'
    }
    if (res.status === 429 || res.status >= 500) return 'transient'
    if (!res.ok) return 'missing'
    const data = (await res.json())?.data
    return data ? { txn: data } : 'transient'
  } catch {
    return 'transient'
  }
}

export type AdjustmentEffect = { kind: 'revoke'; reason: 'refund' | 'chargeback' } | { kind: 'restore' } | { kind: 'none' }

function isFullRefund(adj: any): boolean {
  if (adj?.type === 'full') return true
  const items = adj?.items
  return Array.isArray(items) && items.length > 0 && items.every((i: any) => i?.type === 'full')
}

/**
 * Pure: what a Paddle adjustment does to a Lifetime row.
 * - A FULL refund that is APPROVED revokes. Pending, rejected and partial
 *   refunds change nothing (a partial refund keeps Lifetime). Full means
 *   `type: 'full'` or every refunded item `full`: the dashboard's "Full refund"
 *   arrives as `type: 'partial'` with its one item `full` (sandbox, 2026-11-05).
 * - A chargeback revokes whatever status Paddle gives it (undocumented), except
 *   one already reversed or rejected: Paddle may update the original chargeback
 *   to `reversed` after the reversal, and that must not undo the restore.
 * - A chargeback reversal restores, but only a row a chargeback revoked.
 * - Everything else (warnings, credits, their reversals) changes nothing.
 */
export function adjustmentEffect(adj: any, row: Pick<LifetimeRow, 'revoke_reason'>): AdjustmentEffect {
  const action = adj?.action
  const status = adj?.status
  if (action === 'refund' && status === 'approved' && isFullRefund(adj)) return { kind: 'revoke', reason: 'refund' }
  if (action === 'chargeback' && status !== 'reversed' && status !== 'rejected') return { kind: 'revoke', reason: 'chargeback' }
  if (action === 'chargeback_reverse' && status !== 'rejected' && row.revoke_reason === 'chargeback') return { kind: 'restore' }
  return { kind: 'none' }
}

export type AdjustmentOutcome =
  | { status: 'ignored'; reason: string }
  | { status: 'stale'; row: LifetimeRow }
  | { status: 'transient'; reason: string }
  | { status: 'applied'; effect: AdjustmentEffect['kind']; revokedNow: boolean; row: LifetimeRow }

/**
 * Apply an adjustment.created / adjustment.updated to the Lifetime row of its
 * transaction. Monthly and yearly refunds land here too and are ignored: an
 * adjustment that names a subscription is never Lifetime, so those never cost a
 * Paddle read. A refund that arrives before the purchase it refunds leaves a
 * tombstone (granted_at NULL) carrying the revoke, so the later grant stays
 * revoked. Events apply in occurred_at order: the row's last_adjustment_at is
 * the watermark, advanced on every adjustment for the transaction, ignored ones
 * included, and written with a compare-and-set so two deliveries cannot both win.
 * Gift rows carry no transaction, so no adjustment ever reaches them.
 */
export async function applyLifetimeAdjustment(
  admin: AdminClient,
  adj: any,
  occurredAt: string | null,
): Promise<AdjustmentOutcome> {
  const transactionId = adj?.transaction_id
  if (typeof transactionId !== 'string' || !transactionId) return { status: 'ignored', reason: 'no transaction id' }

  const first = await readLifetimeRow(admin, transactionId)
  if ('error' in first) return { status: 'transient', reason: 'lifetime read failed' }
  let row = first.row

  if (!row) {
    if (adj?.subscription_id) return { status: 'ignored', reason: 'subscription adjustment' }
    const lookup = await fetchPaddleTransaction(transactionId)
    if (lookup === 'transient') return { status: 'transient', reason: 'transaction read failed' }
    if (lookup === 'missing') return { status: 'ignored', reason: 'unknown transaction' }
    const txn = lookup.txn
    if (!hasOneTimeItem(txn)) return { status: 'ignored', reason: 'not a one-time purchase' }
    const priceId = lifetimePriceId()
    if (!priceId) {
      console.error('[lifetime] NEXT_PUBLIC_PADDLE_PRICE_LIFETIME is not set; a one-time adjustment cannot be matched')
      return { status: 'transient', reason: 'lifetime price not configured' }
    }
    if (!hasLifetimeItem(txn, priceId)) return { status: 'ignored', reason: 'not lifetime' }

    const user = await resolveLifetimeUser(admin, txn)
    if (user === 'transient') return { status: 'transient', reason: 'user resolve failed' }
    if (user === 'unmatched') {
      console.error('[lifetime] adjustment for an unmatched Lifetime transaction:', transactionId)
      return { status: 'ignored', reason: 'unmatched' }
    }
    const tomb = await admin.from('user_lifetime_access').upsert(
      {
        user_id: user.userId,
        paddle_transaction_id: transactionId,
        paddle_customer_id: typeof txn?.customer_id === 'string' ? txn.customer_id : null,
        source: 'purchase',
        granted_at: null,
      },
      { onConflict: 'paddle_transaction_id', ignoreDuplicates: true },
    )
    if (tomb.error) return { status: 'transient', reason: 'tombstone write failed' }
    const again = await readLifetimeRow(admin, transactionId)
    if ('error' in again || !again.row) return { status: 'transient', reason: 'lifetime re-read failed' }
    row = again.row
  }

  if (
    occurredAt &&
    row.last_adjustment_at &&
    new Date(row.last_adjustment_at).getTime() >= new Date(occurredAt).getTime()
  ) {
    return { status: 'stale', row }
  }

  const effect = adjustmentEffect(adj, row)
  const patch: Record<string, unknown> = {}
  // Written only when present: a null would clear the watermark.
  if (occurredAt) patch.last_adjustment_at = occurredAt
  let revokedNow = false
  if (effect.kind === 'revoke' && !row.revoked_at) {
    patch.revoked_at = new Date().toISOString()
    patch.revoke_reason = effect.reason
    revokedNow = true
  }
  if (effect.kind === 'restore') {
    patch.revoked_at = null
    patch.revoke_reason = null
  }
  if (Object.keys(patch).length === 0) return { status: 'applied', effect: effect.kind, revokedNow, row }

  const base = admin.from('user_lifetime_access').update(patch).eq('id', row.id)
  const guarded = row.last_adjustment_at
    ? base.eq('last_adjustment_at', row.last_adjustment_at)
    : base.is('last_adjustment_at', null)
  const { data, error } = await guarded.select('id')
  if (error) return { status: 'transient', reason: 'adjustment write failed' }
  // Another delivery moved the watermark first: let Paddle re-deliver, and the
  // stale check sorts the order out.
  if (!data || data.length === 0) return { status: 'transient', reason: 'concurrent adjustment' }

  if (revokedNow && effect.kind === 'revoke' && effect.reason === 'refund') {
    // D1 cannot be undone: if this buyer had a subscription, it was set to
    // cancel at the purchase. They are told by reply to re-subscribe.
    console.warn('[lifetime] full refund revoked Lifetime; if the buyer had a subscription it was set to cancel, tell them to re-subscribe:', transactionId)
  }
  return { status: 'applied', effect: effect.kind, revokedNow, row: { ...row, ...patch } as LifetimeRow }
}

/**
 * The Lifetime email, once per purchase row. Claimed FIRST with one conditional
 * UPDATE on welcome_claimed_at (the 0021 pattern), so two deliveries arriving
 * together cannot both send. Not gated on the subscription welcome flag: a
 * former subscriber still gets it. Best effort: never throws, never fails the
 * webhook; a lost email is not a lockout (sign-in self-serves a fresh code).
 * A buyer who checked out signed out (or an account made from a checkout email)
 * gets the sign-in link in it, minted only after the claim so it is never replaced.
 */
export async function sendLifetimeEmail(
  admin: AdminClient,
  row: LifetimeRow,
  scheduledCancel: ScheduledCancel | null,
  signedOut: boolean,
): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) return
    const { data: { user } } = await admin.auth.admin.getUserById(row.user_id)
    if (!user?.email) return
    const { data: claimed, error: claimErr } = await admin
      .from('user_lifetime_access')
      .update({ welcome_claimed_at: new Date().toISOString() })
      .eq('id', row.id)
      .is('welcome_claimed_at', null)
      .select('id')
    if (claimErr) {
      console.error('[lifetime] email claim failed (non-fatal):', claimErr)
      return
    }
    if (!claimed || claimed.length === 0) return
    const claim = signedOut || Boolean(user.user_metadata?.anon_provisioned)
    const signInUrl = claim ? await signInLinkFor(admin, user.email) : null
    const mail = lifetimeEmail({ claim, signInUrl, planStops: scheduledCancel })
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(10_000),
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: NOREPLY_FROM, to: [user.email], subject: mail.subject, html: mail.html }),
    })
    if (!res.ok) console.error('[lifetime] email send failed (non-fatal), status', res.status)
  } catch (e) {
    console.error('[lifetime] email failed (non-fatal):', e)
  }
}

export type PurchaseOutcome =
  | { status: 'ignored'; reason: string }
  | { status: 'transient'; reason: string }
  | { status: 'unmatched' }
  | { status: 'granted'; live: boolean; inserted: boolean; row: LifetimeRow }

/**
 * transaction.completed from the webhook (or a transaction the reconcile found).
 * Acts only on a Lifetime purchase; every other transaction, monthly and yearly
 * renewals included, is ignored. A one-time transaction while the Lifetime
 * price is not configured is transient (loud log, Paddle re-delivers) so a
 * buyer is never charged and dropped. A transaction payload never reaches the
 * subscription row.
 */
export async function grantFromTransaction(admin: AdminClient, txn: any): Promise<PurchaseOutcome> {
  if (!hasOneTimeItem(txn)) return { status: 'ignored', reason: 'not a one-time purchase' }
  const priceId = lifetimePriceId()
  if (!priceId) {
    console.error('[lifetime] NEXT_PUBLIC_PADDLE_PRICE_LIFETIME is not set; a one-time purchase cannot be granted:', txn?.id)
    return { status: 'transient', reason: 'lifetime price not configured' }
  }
  if (!hasLifetimeItem(txn, priceId)) return { status: 'ignored', reason: 'not lifetime' }
  const transactionId = txn?.id
  if (typeof transactionId !== 'string' || !transactionId) return { status: 'ignored', reason: 'no transaction id' }

  const user = await resolveLifetimeUser(admin, txn)
  if (user === 'transient') return { status: 'transient', reason: 'user resolve failed' }
  if (user === 'unmatched') {
    console.error('[lifetime] unmatched Lifetime purchase, no user and no checkout email:', transactionId)
    return { status: 'unmatched' }
  }

  // An existing holder buying again (anonymously, say) still gets the row: it is
  // harmless, and the log lets the maintainer refund the second payment.
  const prior = await admin
    .from('user_lifetime_access')
    .select('paddle_transaction_id, granted_at, revoked_at')
    .eq('user_id', user.userId)
  if (!prior.error && (prior.data ?? []).some((r) => r.paddle_transaction_id !== transactionId && r.granted_at != null && r.revoked_at == null)) {
    console.warn('[lifetime] Lifetime bought by an account that already holds it; consider a refund:', transactionId)
  }

  const granted = await grantLifetimePurchase(admin, {
    userId: user.userId,
    transactionId,
    customerId: typeof txn?.customer_id === 'string' ? txn.customer_id : null,
  })
  if ('error' in granted) {
    console.error('[lifetime] grant failed:', granted.error)
    return { status: 'transient', reason: 'grant failed' }
  }
  const live = granted.row.granted_at != null && granted.row.revoked_at == null
  return { status: 'granted', live, inserted: granted.inserted, row: granted.row }
}

/** Pure: the revoke state Paddle's full adjustment list implies for one
 *  transaction, folded oldest first with the same rules as the webhook. */
export function foldAdjustments(adjs: any[]): { revoked: boolean; reason: 'refund' | 'chargeback' | null } {
  let reason: 'refund' | 'chargeback' | null = null
  const sorted = [...adjs].sort((a, b) => String(a?.created_at ?? '').localeCompare(String(b?.created_at ?? '')))
  for (const adj of sorted) {
    const effect = adjustmentEffect(adj, { revoke_reason: reason })
    if (effect.kind === 'revoke' && reason == null) reason = effect.reason
    if (effect.kind === 'restore') reason = null
  }
  return { revoked: reason != null, reason }
}

async function paddleList(firstUrl: string, apiKey: string, maxPages = 20): Promise<any[] | 'failed'> {
  const out: any[] = []
  let url: string | null = firstUrl
  for (let page = 0; url && page < maxPages; page++) {
    const res: Response = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(10_000) })
    if (!res.ok) {
      console.error('[lifetime reconcile] Paddle list failed, status', res.status, firstUrl.split('?')[0])
      return 'failed'
    }
    const j = await res.json()
    out.push(...(Array.isArray(j?.data) ? j.data : []))
    url = j?.meta?.pagination?.has_more ? j.meta.pagination.next ?? null : null
  }
  return out
}

const RECONCILE_DAYS = 30

/**
 * The daily self-heal for Lifetime, in the reconcile cron:
 * 1. Lifetime purchases completed in the last 30 days at Paddle get their row
 *    if a webhook was missed (same grant, same user chain), then the cancel of
 *    an old subscription and the email, each with its own send-once guard.
 * 2. Their adjustments are re-read and the revoke state Paddle implies is
 *    written where ours differs (compare-and-set, so a webhook landing during
 *    the read wins).
 * 3. Every live purchase whose holder still has a live subscription gets the
 *    cancel scheduled if it is not yet (gift holders excluded).
 * Never throws; a failed step is counted and retried tomorrow. Listing
 * transactions needs a Paddle key allowed to read transactions.
 */
export async function reconcileLifetime(
  admin: AdminClient,
  now: Date = new Date(),
): Promise<{ granted: number; revokes: number; restores: number; cancelChecks: number; failed: number }> {
  const stats = { granted: 0, revokes: 0, restores: 0, cancelChecks: 0, failed: 0 }
  try {
    const apiKey = process.env.PADDLE_API_KEY
    const priceId = lifetimePriceId()
    if (!apiKey || !priceId) {
      console.error('[lifetime reconcile] PADDLE_API_KEY or the Lifetime price is not set; skipped')
      stats.failed++
      return stats
    }
    const since = new Date(now.getTime() - RECONCILE_DAYS * 86_400_000).toISOString()
    const txns = await paddleList(
      `${paddleApiBase()}/transactions?status=completed&subscription_id=null&billed_at[GTE]=${since}&order_by=billed_at[ASC]`,
      apiKey,
    )
    const lifetimeTxns = txns === 'failed' ? [] : txns.filter((t) => hasLifetimeItem(t, priceId))
    if (txns === 'failed') stats.failed++

    for (const txn of lifetimeTxns) {
      const out = await grantFromTransaction(admin, txn)
      if (out.status !== 'granted') {
        if (out.status !== 'ignored') stats.failed++
        continue
      }
      if (out.inserted) stats.granted++
      if (out.live && !out.row.welcome_claimed_at) {
        const d1 = await cancelSubscriptionForLifetime(admin, out.row.user_id)
        await sendLifetimeEmail(admin, out.row, d1.scheduledCancel, checkedOutSignedOut(txn))
      }
    }

    const ids: string[] = lifetimeTxns.map((t) => t.id).filter((id: unknown) => typeof id === 'string')
    for (let i = 0; i < ids.length; i += 20) {
      const chunk = ids.slice(i, i + 20)
      const adjs = await paddleList(`${paddleApiBase()}/adjustments?transaction_id=${chunk.join(',')}&per_page=50`, apiKey)
      if (adjs === 'failed') {
        stats.failed++
        continue
      }
      for (const txId of chunk) {
        const read = await readLifetimeRow(admin, txId)
        if ('error' in read || !read.row) continue
        const row = read.row
        const want = foldAdjustments(adjs.filter((a) => a?.transaction_id === txId))
        const isRevoked = row.revoked_at != null
        if (want.revoked === isRevoked) continue
        const patch = want.revoked
          ? { revoked_at: now.toISOString(), revoke_reason: want.reason }
          : { revoked_at: null, revoke_reason: null }
        const base = admin.from('user_lifetime_access').update(patch).eq('id', row.id)
        const guarded = row.last_adjustment_at ? base.eq('last_adjustment_at', row.last_adjustment_at) : base.is('last_adjustment_at', null)
        const { data, error } = await guarded.select('id')
        if (error || !data || data.length === 0) {
          stats.failed++
          continue
        }
        if (want.revoked) stats.revokes++
        else stats.restores++
      }
    }

    const live = await admin
      .from('user_lifetime_access')
      .select('user_id')
      .eq('source', 'purchase')
      .not('granted_at', 'is', null)
      .is('revoked_at', null)
    if (live.error) {
      stats.failed++
      return stats
    }
    const holders = [...new Set((live.data ?? []).map((r) => r.user_id as string))]
    if (holders.length > 0) {
      const subs = await admin
        .from('user_subscriptions')
        .select('user_id')
        .in('user_id', holders)
        .in('status', LIVE_SUB_STATUSES)
        .not('paddle_subscription_id', 'is', null)
      if (subs.error) {
        stats.failed++
        return stats
      }
      for (const s of subs.data ?? []) {
        stats.cancelChecks++
        const d1 = await cancelSubscriptionForLifetime(admin, s.user_id as string)
        if (d1.failed) stats.failed++
      }
    }
  } catch (e) {
    console.error('[lifetime reconcile] failed:', e)
    stats.failed++
  }
  return stats
}
