import 'server-only'
import type { createAdminClient } from '@/app/lib/supabase/admin'
import { CONTACT_INBOX, NOREPLY_FROM } from '@/app/lib/config'
import { paddleApiBase } from '@/app/lib/paddle/server'
import { fetchPaddleCustomerEmail } from './paddle-provision'
import { hasLifetimeItem, hasOneTimeItem, lifetimePriceId } from './lifetime'

// Our own billing timeline and the maintainer's billing alerts.
//
// Every verified Paddle event is logged to billing_events (migration 0022)
// before any other handling: the Paddle dashboard shows only the EFFECTIVE
// cancel date, so without this there is no record of when a customer clicked
// cancel. A purchase, a cancel, a refund or chargeback status change and a
// failed payment each send one plain-text email to CONTACT_INBOX. Alerts never
// change access and never fail the webhook: every step here is try/catch and
// logs instead.

type AdminClient = ReturnType<typeof createAdminClient>

// `any`: raw Paddle JSON.
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PaddleEvent {
  event_id?: string
  event_type?: string
  occurred_at?: string
  data?: any
}

const isSubscriptionEvent = (t: string | undefined) => !!t && t.startsWith('subscription.')
const isAdjustmentEvent = (t: string | undefined) => !!t && t.startsWith('adjustment.')
const isTransactionEvent = (t: string | undefined) => !!t && t.startsWith('transaction.')

/** The few fields worth keeping from each event: enough to answer "what
 *  happened when" in a dispute, never the whole payload. */
export function summarizeEvent(evt: PaddleEvent): Record<string, unknown> {
  const d = evt.data ?? {}
  if (isAdjustmentEvent(evt.event_type)) {
    return {
      adjustment_id: d.id ?? null,
      action: d.action ?? null,
      type: d.type ?? null,
      status: d.status ?? null,
      amount: d.totals?.total ?? null,
      currency: d.totals?.currency_code ?? d.currency_code ?? null,
      customer_id: d.customer_id ?? null,
    }
  }
  if (isTransactionEvent(evt.event_type)) {
    return {
      status: d.status ?? null,
      origin: d.origin ?? null,
      price_ids: Array.isArray(d.items) ? d.items.map((i: any) => i?.price?.id ?? null) : [],
      amount: d.details?.totals?.total ?? null,
      currency: d.details?.totals?.currency_code ?? d.currency_code ?? null,
      customer_id: d.customer_id ?? null,
    }
  }
  return {
    status: d.status ?? null,
    scheduled_change: d.scheduled_change ?? null,
    current_billing_period: d.current_billing_period ?? null,
    customer_id: d.customer_id ?? null,
  }
}

/** Insert-or-ignore on Paddle's event_id, which stays the same across Paddle's
 *  retries and replays. Returns false (and logs) when nothing could be written. */
export async function logBillingEvent(admin: AdminClient, evt: PaddleEvent): Promise<boolean> {
  if (!evt.event_id) return false
  try {
    const d = evt.data ?? {}
    const { error } = await admin.from('billing_events').upsert(
      {
        paddle_event_id: evt.event_id,
        event_type: evt.event_type ?? 'unknown',
        occurred_at: evt.occurred_at ?? null,
        subscription_id: isSubscriptionEvent(evt.event_type) ? d.id ?? null : d.subscription_id ?? null,
        transaction_id: isAdjustmentEvent(evt.event_type) ? d.transaction_id ?? null : isTransactionEvent(evt.event_type) ? d.id ?? null : null,
        summary: summarizeEvent(evt),
      },
      { onConflict: 'paddle_event_id', ignoreDuplicates: true },
    )
    if (error) {
      console.error('[billing events] log write failed (non-fatal):', error)
      return false
    }
    return true
  } catch (e) {
    console.error('[billing events] log write failed (non-fatal):', e)
    return false
  }
}

export type AlertKind = 'sale' | 'cancel_scheduled' | 'canceled' | 'adjustment' | 'past_due'

/** A checkout (web) or a transaction made in the dashboard or API (api). Every
 *  other origin is a renewal or a change to an existing subscription. */
const SALE_ORIGINS = new Set(['web', 'api'])

/** Pure: does this event alert, and under which key. The key is unique in the
 *  table, so Paddle's double deliveries and its incidental subscription.updated
 *  events (two in the same second is normal) send one email per real change. */
export function alertKeyFor(evt: PaddleEvent): { kind: AlertKind; key: string } | null {
  const d = evt.data ?? {}
  const t = evt.event_type
  if (t === 'transaction.completed' && SALE_ORIGINS.has(d.origin) && d.id) {
    return { kind: 'sale', key: `sale:${d.id}` }
  }
  if (t === 'subscription.canceled' && d.status === 'canceled' && d.id) {
    return { kind: 'canceled', key: `canceled:${d.id}` }
  }
  if ((t === 'subscription.updated' || t === 'subscription.canceled') && d.scheduled_change?.action === 'cancel' && d.id) {
    return { kind: 'cancel_scheduled', key: `cancel_scheduled:${d.id}:${d.scheduled_change.effective_at ?? ''}` }
  }
  if ((t === 'adjustment.created' || t === 'adjustment.updated') && d.id) {
    return { kind: 'adjustment', key: `adjustment:${d.id}:${d.status ?? ''}` }
  }
  if (t === 'subscription.past_due' && d.id) {
    return { kind: 'past_due', key: `past_due:${d.id}:${d.current_billing_period?.starts_at ?? ''}` }
  }
  return null
}

function paddleDashboardBase(): string {
  return paddleApiBase().includes('sandbox') ? 'https://sandbox-vendors.paddle.com' : 'https://vendors.paddle.com'
}

function fmt(iso: unknown): string {
  if (typeof iso !== 'string' || !iso) return 'unknown'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? 'unknown' : d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
}

function daysSince(iso: unknown, now: Date): string {
  if (typeof iso !== 'string' || !iso) return 'unknown'
  const t = new Date(iso).getTime()
  return isNaN(t) ? 'unknown' : String(Math.floor((now.getTime() - t) / 86_400_000))
}

const ZERO_DECIMAL = new Set(['JPY', 'KRW'])

/** Paddle amounts are strings in the currency's minor unit. */
export function formatAmount(total: unknown, currency: unknown): string {
  const n = Number(total)
  if (typeof total !== 'string' || !isFinite(n) || typeof currency !== 'string') return 'unknown'
  return `${(ZERO_DECIMAL.has(currency) ? n : n / 100).toFixed(ZERO_DECIMAL.has(currency) ? 0 : 2)} ${currency}`
}

function planOf(d: any): string {
  const interval = d?.items?.[0]?.price?.billing_cycle?.interval
  return interval === 'year' ? 'Yearly' : interval === 'month' ? 'Monthly' : 'unknown'
}

/** What the webhook learned while handling the event, for the email body. */
export interface AlertContext {
  userId?: string | null
  /** A Lifetime purchase this adjustment touched, and what happened to it. */
  lifetime?: { revokedNow: boolean; revoked: boolean; grantedAt: string | null } | null
}

/** Pure: the alert email for an event. */
export function buildAlert(
  kind: AlertKind,
  evt: PaddleEvent,
  ctx: { email: string | null; lifetime?: AlertContext['lifetime']; paidAt?: string | null; upgraded?: boolean },
  now: Date = new Date(),
): { subject: string; text: string } {
  const d = evt.data ?? {}
  const who = ctx.email ?? 'unknown customer'
  const dash = paddleDashboardBase()
  const lines: string[] = []
  let subject: string

  if (kind === 'sale') {
    const plan = hasLifetimeItem(d, lifetimePriceId()) ? 'Lifetime' : hasOneTimeItem(d) ? 'One-time' : planOf(d)
    const totals = d.details?.totals ?? {}
    const currency = totals.currency_code ?? d.currency_code
    const amount = formatAmount(totals.total, currency)
    subject = `[Billing] New sale: ${plan}, ${amount}, ${who}`
    lines.push(
      `Plan: ${plan}`,
      `Customer: ${who}`,
      `Amount paid: ${amount} (tax ${formatAmount(totals.tax, currency)})`,
    )
    if (typeof totals.earnings === 'string') {
      lines.push(`Earnings: ${formatAmount(totals.earnings, currency)} (after tax and Paddle's fee)`)
    }
    if (d.discount_id) lines.push(`Discount: ${d.discount_id}`)
    lines.push(
      `Paid at: ${fmt(d.billed_at ?? evt.occurred_at)}`,
      `Transaction: ${d.id} (${dash}/transactions-v2/${d.id})`,
    )
    if (d.subscription_id) lines.push(`Subscription: ${d.subscription_id} (${dash}/subscriptions-v2/${d.subscription_id})`)
  } else if (kind === 'cancel_scheduled') {
    const upgrade = `USER UPGRADED FROM ${planOf(d).toUpperCase()} TO LIFETIME`
    subject = ctx.upgraded ? `[Billing] ${upgrade}: ${who}` : `[Billing] Cancel scheduled: ${planOf(d)}, ${who}`
    if (ctx.upgraded) lines.push(upgrade, '')
    lines.push(
      `Plan: ${planOf(d)}`,
      `Customer: ${who}`,
      `Current period started (last payment): ${fmt(d.current_billing_period?.starts_at)}`,
      `Cancel requested at: ${fmt(evt.occurred_at)}`,
      `Takes effect at: ${fmt(d.scheduled_change?.effective_at)}`,
      `Days since last payment: ${daysSince(d.current_billing_period?.starts_at, now)}`,
      `Subscription: ${d.id} (${dash}/subscriptions-v2/${d.id})`,
      '',
      'A refund request, if any, arrives by email from Paddle (assist+seller@paddle.com).',
    )
  } else if (kind === 'canceled') {
    subject = `[Billing] Cancel took effect: ${planOf(d)}, ${who}`
    lines.push(
      `Plan: ${planOf(d)}`,
      `Customer: ${who}`,
      `Canceled at: ${fmt(d.canceled_at ?? evt.occurred_at)}`,
      `Subscription: ${d.id} (${dash}/subscriptions-v2/${d.id})`,
    )
  } else if (kind === 'past_due') {
    subject = `[Billing] Payment failed (past due): ${planOf(d)}, ${who}`
    lines.push(
      `Plan: ${planOf(d)}`,
      `Customer: ${who}`,
      `Billing period started: ${fmt(d.current_billing_period?.starts_at)}`,
      `Subscription: ${d.id} (${dash}/subscriptions-v2/${d.id})`,
      '',
      'Paddle retries the payment on its own schedule; premium continues while past due.',
    )
  } else {
    const product = ctx.lifetime ? 'Lifetime' : d.subscription_id ? 'Subscription' : 'unknown product'
    subject = `[Billing] ${d.action ?? 'adjustment'} ${d.status ?? ''}: ${product}, ${who}`.replace(/\s+,/, ',')
    lines.push(
      `Action: ${d.action ?? 'unknown'}`,
      `Type: ${d.type ?? 'unknown'}`,
      `Status: ${d.status ?? 'unknown'}`,
      `Amount: ${formatAmount(d.totals?.total, d.totals?.currency_code ?? d.currency_code)}`,
      `Product: ${product}`,
      `Customer: ${who}`,
      `Days since the payment: ${daysSince(ctx.paidAt ?? ctx.lifetime?.grantedAt ?? null, now)}`,
      `Transaction: ${d.transaction_id ?? 'unknown'} (${dash}/transactions-v2/${d.transaction_id ?? ''})`,
    )
    if (d.subscription_id) lines.push(`Subscription: ${d.subscription_id}`)
    if (ctx.lifetime?.revokedNow) {
      lines.push('', 'Lifetime was revoked by this adjustment. If the buyer had a subscription, it was set to cancel when they bought Lifetime: tell them by reply to re-subscribe.')
    } else if (ctx.lifetime) {
      lines.push('', `Lifetime is ${ctx.lifetime.revoked ? 'revoked' : 'still active'} after this adjustment.`)
    }
  }
  return { subject, text: lines.join('\n') }
}

/** Our own account for this customer first (subscription row, then a Lifetime
 *  row), Paddle's customer record last. */
async function customerEmail(admin: AdminClient, userId: string | null | undefined, customerId: unknown): Promise<string | null> {
  try {
    let id = userId ?? null
    if (!id && typeof customerId === 'string' && customerId) {
      const subs = await admin.from('user_subscriptions').select('user_id').eq('paddle_customer_id', customerId).limit(1)
      id = subs.data?.[0]?.user_id ?? null
      if (!id) {
        const life = await admin.from('user_lifetime_access').select('user_id').eq('paddle_customer_id', customerId).limit(1)
        id = life.data?.[0]?.user_id ?? null
      }
    }
    if (id) {
      const { data } = await admin.auth.admin.getUserById(id)
      if (data?.user?.email) return data.user.email
    }
    if (typeof customerId === 'string' && customerId) {
      const lookup = await fetchPaddleCustomerEmail(customerId)
      if ('email' in lookup) return lookup.email
    }
  } catch {
    /* the alert still goes out, naming the customer as unknown */
  }
  return null
}

/** Best effort: when the payment was made, for "days since the payment". Our
 *  Paddle key may not be allowed to read transactions; that is fine here. */
async function transactionPaidAt(transactionId: unknown): Promise<string | null> {
  const apiKey = process.env.PADDLE_API_KEY
  if (!apiKey || typeof transactionId !== 'string' || !transactionId) return null
  try {
    const res = await fetch(`${paddleApiBase()}/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5_000),
    })
    if (!res.ok) return null
    const t = (await res.json())?.data
    return typeof t?.billed_at === 'string' ? t.billed_at : null
  } catch {
    return null
  }
}

/** Best effort: this user holds a live, bought Lifetime (a gift never counts). */
async function hasBoughtLifetime(admin: AdminClient, userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false
  try {
    const { data } = await admin
      .from('user_lifetime_access')
      .select('id')
      .eq('user_id', userId)
      .eq('source', 'purchase')
      .is('revoked_at', null)
      .limit(1)
    return (data ?? []).length > 0
  } catch {
    return false
  }
}

async function sendAlertEmail(alert: { subject: string; text: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: NOREPLY_FROM, to: [CONTACT_INBOX], subject: alert.subject, text: alert.text }),
  })
  return res.ok
}

/**
 * Claim the alert key on this event's log row, then send. The claim is one
 * conditional UPDATE (alert_key is still null on this row); a unique violation
 * means another event already claimed the same key, so nothing is sent. The
 * rendered email is stored with the claim so the reconcile cron can re-send it
 * without rebuilding it. A failed send leaves alerted_at null for that re-send.
 * Never throws.
 */
export async function sendBillingAlert(admin: AdminClient, evt: PaddleEvent, ctx: AlertContext = {}): Promise<void> {
  try {
    const hit = alertKeyFor(evt)
    if (!hit || !evt.event_id) return
    const d = evt.data ?? {}
    const email = await customerEmail(admin, ctx.userId, d.customer_id)
    const paidAt = hit.kind === 'adjustment' && !ctx.lifetime ? await transactionPaidAt(d.transaction_id) : null
    const upgraded = hit.kind === 'cancel_scheduled' && (await hasBoughtLifetime(admin, ctx.userId))
    const alert = buildAlert(hit.kind, evt, { email, lifetime: ctx.lifetime ?? null, paidAt, upgraded })
    const summary = { ...summarizeEvent(evt), alert, alert_tries: 0 }

    const { data: claimed, error: claimErr } = await admin
      .from('billing_events')
      .update({ alert_key: hit.key, summary, ...(ctx.userId ? { user_id: ctx.userId } : {}) })
      .eq('paddle_event_id', evt.event_id)
      .is('alert_key', null)
      .select('id')
    if (claimErr) {
      // 23505: the same change was already alerted from another event.
      if ((claimErr as { code?: string }).code !== '23505') console.error('[billing alert] claim failed (non-fatal):', claimErr)
      return
    }
    if (!claimed || claimed.length === 0) return

    const sent = await sendAlertEmail(alert).catch(() => false)
    await admin
      .from('billing_events')
      .update({ ...(sent ? { alerted_at: new Date().toISOString() } : {}), summary: { ...summary, alert_tries: 1 } })
      .eq('paddle_event_id', evt.event_id)
    if (!sent) console.error('[billing alert] send failed, the reconcile cron re-sends it:', hit.key)
  } catch (e) {
    console.error('[billing alert] failed (non-fatal):', e)
  }
}

const MAX_ALERT_TRIES = 3

/** Reconcile pass: re-send claimed alerts whose send failed, once they are 10
 *  minutes old, at most 3 tries in all. */
export async function resendPendingAlerts(admin: AdminClient, now: Date = new Date()): Promise<{ resent: number; failed: number }> {
  let resent = 0, failed = 0
  const cutoff = new Date(now.getTime() - 10 * 60_000).toISOString()
  const { data: rows, error } = await admin
    .from('billing_events')
    .select('id, alert_key, summary')
    .not('alert_key', 'is', null)
    .is('alerted_at', null)
    .lt('created_at', cutoff)
    .limit(50)
  if (error) {
    console.error('[billing alert] pending list failed:', error)
    return { resent, failed: 1 }
  }
  for (const row of rows ?? []) {
    const summary = (row.summary ?? {}) as { alert?: { subject: string; text: string }; alert_tries?: number }
    const tries = typeof summary.alert_tries === 'number' ? summary.alert_tries : 0
    if (!summary.alert || tries >= MAX_ALERT_TRIES) continue
    const sent = await sendAlertEmail(summary.alert).catch(() => false)
    await admin
      .from('billing_events')
      .update({ ...(sent ? { alerted_at: now.toISOString() } : {}), summary: { ...summary, alert_tries: tries + 1 } })
      .eq('id', row.id)
    if (sent) resent++
    else failed++
  }
  return { resent, failed }
}
