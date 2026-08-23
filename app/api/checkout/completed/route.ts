import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { paddleApiBase } from '@/app/lib/paddle/server'

export const runtime = 'nodejs'

// A checkout.completed callback fires seconds after payment; anything older
// is a replay (e.g. a saved request re-sent later to re-activate a canceled
// subscription) and must go through the webhook's authoritative state instead.
const MAX_TXN_AGE_MS = 60 * 60 * 1000

/**
 * Verified-optimistic activation. The overlay's checkout.completed callback
 * passes the transaction id; we confirm it against the Paddle API (status +
 * the custom_data.user_id we set at checkout open) BEFORE writing anything.
 *
 * A session alone must never grant durable premium: the endpoint is
 * discoverable in the public repo, and a forged call would never be reconciled
 * by a webhook (no checkout = no Paddle event). The webhook remains the durable
 * source of truth; this only fast-paths what Paddle will confirm anyway.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Anonymous checkout: there is no session to fast-path. Acknowledge so the
  // overlay shows the "check your email" claim flow; the webhook provisions the
  // account (keyed off the Paddle checkout email) and emails the magic link.
  // No DB write happens here — a session alone never grants premium.
  if (!user) return NextResponse.json({ status: 'pending-claim' })

  const apiKey = process.env.PADDLE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'not configured' }, { status: 503 })

  const { transactionId } = await req.json().catch(() => ({}))
  if (typeof transactionId !== 'string' || !transactionId.startsWith('txn_')) {
    return NextResponse.json({ error: 'missing transactionId' }, { status: 400 })
  }

  // Server-to-server: fetch the transaction and verify it is real, paid, ours.
  const res = await fetch(`${paddleApiBase()}/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null)
  // No answer is not "unknown": the webhook still provisions, the overlay may retry.
  if (!res) return NextResponse.json({ error: 'paddle unavailable' }, { status: 503 })
  if (!res.ok) return NextResponse.json({ error: 'unknown transaction' }, { status: 403 })
  const { data: txn } = await res.json()

  const paidStatuses = new Set(['completed', 'paid'])
  if (!paidStatuses.has(txn?.status)) {
    return NextResponse.json({ error: 'transaction not paid' }, { status: 403 })
  }
  if (txn?.custom_data?.user_id !== user.id) {
    return NextResponse.json({ error: 'transaction user mismatch' }, { status: 403 })
  }

  // Replay guard: only a FRESH transaction may fast-path activation.
  const txnCreated = txn?.created_at ? new Date(txn.created_at).getTime() : 0
  if (!txnCreated || Date.now() - txnCreated > MAX_TXN_AGE_MS) {
    return NextResponse.json({ error: 'transaction too old' }, { status: 403 })
  }

  const admin = createAdminClient()

  // Ordering guard: never override NEWER authoritative webhook state (e.g. the
  // user paid, then canceled; replaying the success callback must not
  // resurrect 'active').
  const { data: existing } = await admin
    .from('user_subscriptions')
    .select('status, last_event_at')
    .eq('user_id', user.id)
    .maybeSingle()
  if (
    existing?.last_event_at &&
    new Date(existing.last_event_at).getTime() >= txnCreated
  ) {
    return NextResponse.json({ ok: true, kept: existing.status })
  }

  // Plan: map the price id against the configured prices (authoritative),
  // fall back to the billing interval; otherwise leave plan unset for the
  // webhook to fill — never guess 'monthly'.
  const priceId: string | undefined = txn?.items?.[0]?.price?.id
  const interval: string | undefined = txn?.items?.[0]?.price?.billing_cycle?.interval
  const patch: Record<string, unknown> = {
    user_id: user.id,
    status: 'active',
    updated_at: new Date().toISOString(),
  }
  if (priceId && priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_YEARLY) patch.plan = 'annual'
  else if (priceId && priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY) patch.plan = 'monthly'
  else if (interval === 'year') patch.plan = 'annual'
  else if (interval === 'month') patch.plan = 'monthly'
  if (txn?.customer_id) patch.paddle_customer_id = txn.customer_id
  if (txn?.subscription_id) patch.paddle_subscription_id = txn.subscription_id
  // Period end from the transaction's billing period, so a row the webhook
  // never reaches still expires on its own instead of staying premium forever.
  const periodEnd: unknown = txn?.billing_period?.ends_at
  if (typeof periodEnd === 'string' && periodEnd) patch.current_period_end = periodEnd

  const { error } = await admin
    .from('user_subscriptions')
    .upsert(patch, { onConflict: 'user_id' })
  if (error) {
    console.error('[checkout/completed] upsert failed:', error)
    return NextResponse.json({ error: 'write failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
