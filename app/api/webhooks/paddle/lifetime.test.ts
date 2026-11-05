import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHmac } from 'node:crypto'
import { NextRequest } from 'next/server'
import { fakeSupabase } from '@/lib/identity/__fixtures__/fake-supabase'

// Lifetime purchases, refunds, chargebacks and the billing alerts, end to end
// through the real webhook route. The database is the in-memory fake (unique
// columns enforced like Postgres); Paddle and Resend are a routed fetch mock.

const db = fakeSupabase()
vi.mock('@/app/lib/supabase/admin', () => ({ createAdminClient: () => db.client }))
const captured: string[] = []
vi.mock('@/app/lib/analytics-server', () => ({
  phCapture: async (event: string) => {
    captured.push(event)
  },
}))

import { POST } from './route'

const SECRET = 'pdl_ntfset_test'
const USER = '11111111-1111-4111-8111-111111111111'
const LIFETIME = 'pri_lifetime'
const MONTHLY_CYCLE = { interval: 'month', frequency: 1 }

let eventSeq = 0
function envelope(event_type: string, data: Record<string, unknown>, occurred_at: string, event_id?: string) {
  return JSON.stringify({ event_id: event_id ?? `evt_${++eventSeq}`, event_type, occurred_at, data })
}

function purchase(opts: {
  txn?: string
  price?: string
  cycle?: unknown
  userId?: string | null
  customer?: string
  at?: string
  eventId?: string
} = {}) {
  return envelope(
    'transaction.completed',
    {
      id: opts.txn ?? 'txn_1',
      status: 'completed',
      customer_id: opts.customer ?? 'ctm_1',
      subscription_id: null,
      custom_data: opts.userId === null ? null : { user_id: opts.userId ?? USER },
      items: [{ price: { id: opts.price ?? LIFETIME, billing_cycle: opts.cycle === undefined ? null : opts.cycle } }],
    },
    opts.at ?? '2026-10-29T10:00:00Z',
    opts.eventId,
  )
}

function adjustment(opts: {
  type?: 'adjustment.created' | 'adjustment.updated'
  id?: string
  action?: string
  kind?: string | null
  items?: { type: string }[]
  status?: string
  txn?: string
  sub?: string | null
  at: string
  eventId?: string
}) {
  return envelope(
    opts.type ?? 'adjustment.created',
    {
      id: opts.id ?? 'adj_1',
      action: opts.action ?? 'refund',
      type: opts.kind === undefined ? 'full' : opts.kind,
      ...(opts.items ? { items: opts.items } : {}),
      status: opts.status ?? 'approved',
      transaction_id: opts.txn ?? 'txn_1',
      subscription_id: opts.sub ?? null,
      customer_id: 'ctm_1',
      currency_code: 'USD',
      totals: { total: '12500', currency_code: 'USD' },
    },
    opts.at,
    opts.eventId,
  )
}

function post(body: string) {
  const ts = Math.floor(Date.now() / 1000)
  const h1 = createHmac('sha256', SECRET).update(`${ts}:${body}`).digest('hex')
  return POST(
    new NextRequest('http://localhost/api/webhooks/paddle', {
      method: 'POST',
      body,
      headers: { 'paddle-signature': `ts=${ts};h1=${h1}` },
    }),
  )
}

// Paddle state the fetch mock serves.
const paddleSubs: Record<string, Record<string, unknown>> = {}
const paddleTxns: Record<string, Record<string, unknown>> = {}
const paddleCustomers: Record<string, string> = {}
const cancels: { sub: string; body: unknown }[] = []
let cancelStatus = 200
let resendOk = true

const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input)
  if (url.includes('api.resend.com')) return resendOk ? Response.json({ id: 'email_1' }) : new Response('down', { status: 500 })
  const cancel = url.match(/\/subscriptions\/([^/]+)\/cancel$/)
  if (cancel) {
    cancels.push({ sub: cancel[1], body: JSON.parse(String(init?.body ?? '{}')) })
    if (cancelStatus !== 200) return new Response('no', { status: cancelStatus })
    const s = { ...(paddleSubs[cancel[1]] ?? {}), scheduled_change: { action: 'cancel', effective_at: '2026-11-24T08:00:00Z', resume_at: null } }
    paddleSubs[cancel[1]] = s
    return Response.json({ data: s })
  }
  const sub = url.match(/\/subscriptions\/([^/]+)$/)
  if (sub) return paddleSubs[sub[1]] ? Response.json({ data: paddleSubs[sub[1]] }) : new Response('nf', { status: 404 })
  const txn = url.match(/\/transactions\/([^/]+)$/)
  if (txn) return paddleTxns[txn[1]] ? Response.json({ data: paddleTxns[txn[1]] }) : new Response('nf', { status: 404 })
  const cust = url.match(/\/customers\/([^/]+)$/)
  if (cust) return paddleCustomers[cust[1]] ? Response.json({ data: { email: paddleCustomers[cust[1]] } }) : new Response('nf', { status: 404 })
  return new Response('unrouted', { status: 599 })
})

function emails(): { to: string[]; subject: string; text?: string; html?: string }[] {
  return fetchMock.mock.calls
    .filter(([u]) => String(u).includes('api.resend.com'))
    .map(([, init]) => JSON.parse(String(init?.body)))
}
const buyerEmails = () => emails().filter((e) => !e.subject.startsWith('[Billing]'))
const alerts = () => emails().filter((e) => e.subject.startsWith('[Billing]'))
const life = () => db.rows('user_lifetime_access')
const paddleCalls = () => fetchMock.mock.calls.filter(([u]) => String(u).includes('paddle.com'))

function monthlySubscriber(plan: 'monthly' | 'annual' = 'monthly', status = 'active') {
  db.rows('user_subscriptions').push({
    user_id: USER,
    status,
    plan,
    paddle_customer_id: 'ctm_1',
    paddle_subscription_id: 'sub_1',
    current_period_end: '2099-01-01T00:00:00Z',
    last_event_at: '2026-10-01T00:00:00Z',
  })
  paddleSubs.sub_1 = { id: 'sub_1', status, scheduled_change: null }
}

beforeEach(() => {
  db.reset()
  db.users[USER] = { email: 'buyer@example.com', user_metadata: {} }
  captured.length = 0
  cancels.length = 0
  cancelStatus = 200
  resendOk = true
  for (const o of [paddleSubs, paddleTxns, paddleCustomers]) for (const k of Object.keys(o)) delete o[k]
  process.env.PADDLE_WEBHOOK_SECRET = SECRET
  process.env.RESEND_API_KEY = 're_test'
  process.env.PADDLE_API_KEY = 'pdl_test'
  process.env.NEXT_PUBLIC_PADDLE_PRICE_LIFETIME = LIFETIME
  fetchMock.mockClear()
  vi.stubGlobal('fetch', fetchMock)
})

describe('Lifetime purchase (transaction.completed)', () => {
  it('grants a live row, sends one Lifetime email, counts once, and never touches the subscription row', async () => {
    const res = await post(purchase())
    expect(res.status).toBe(200)
    expect(life()).toHaveLength(1)
    expect(life()[0]).toMatchObject({ user_id: USER, paddle_transaction_id: 'txn_1', source: 'purchase' })
    expect(life()[0].granted_at).toBeTruthy()
    expect(life()[0].revoked_at ?? null).toBeNull()
    expect(buyerEmails().map((e) => e.subject)).toEqual(['Premium is yours for life'])
    expect(captured).toEqual(['Lifetime Purchased'])
    expect(db.rows('user_subscriptions')).toEqual([])
  })

  it('ignores a renewal (a price with a billing cycle), even with the Lifetime price unset', async () => {
    delete process.env.NEXT_PUBLIC_PADDLE_PRICE_LIFETIME
    const res = await post(purchase({ price: 'pri_monthly', cycle: MONTHLY_CYCLE }))
    expect(res.status).toBe(200)
    expect(life()).toEqual([])
  })

  it('ignores a one-time transaction for another price', async () => {
    const res = await post(purchase({ price: 'pri_other' }))
    expect(res.status).toBe(200)
    expect(life()).toEqual([])
    expect(buyerEmails()).toEqual([])
  })

  it('answers 500 for a one-time transaction while the Lifetime price is unset, so Paddle re-delivers', async () => {
    process.env.NEXT_PUBLIC_PADDLE_PRICE_LIFETIME = ''
    const res = await post(purchase())
    expect(res.status).toBe(500)
    expect(life()).toEqual([])
  })

  it('finds the Lifetime item anywhere in the transaction, not only first', async () => {
    const body = JSON.parse(purchase())
    body.data.items = [{ price: { id: 'pri_addon', billing_cycle: null } }, { price: { id: LIFETIME, billing_cycle: null } }]
    expect((await post(JSON.stringify(body))).status).toBe(200)
    expect(life()).toHaveLength(1)
  })

  it('an anonymous buyer gets an account from the checkout email and the claim email', async () => {
    paddleCustomers.ctm_anon = 'new-buyer@example.com'
    const res = await post(purchase({ userId: null, customer: 'ctm_anon' }))
    expect(res.status).toBe(200)
    const newId = Object.keys(db.users).find((id) => db.users[id].email === 'new-buyer@example.com')
    expect(newId).toBeTruthy()
    expect(life()[0].user_id).toBe(newId)
    expect(buyerEmails().map((e) => e.subject)).toEqual(['Access your AI Canvas Lifetime account'])
  })

  it('an unreachable Paddle customer read is 500, never a dropped buyer', async () => {
    const res = await post(purchase({ userId: null, customer: 'ctm_unknown' }))
    expect(res.status).toBe(500)
    expect(life()).toEqual([])
  })

  it('a duplicate delivery grants once and emails once', async () => {
    await post(purchase({ eventId: 'evt_dup' }))
    await post(purchase({ eventId: 'evt_dup' }))
    await post(purchase({ eventId: 'evt_other' }))
    expect(life()).toHaveLength(1)
    expect(buyerEmails()).toHaveLength(1)
    expect(captured).toEqual(['Lifetime Purchased'])
  })
})

describe('D1: a subscriber buys Lifetime', () => {
  it('schedules the monthly sub to cancel at the period end, once across duplicate deliveries, and says so in the email', async () => {
    monthlySubscriber()
    await post(purchase())
    await post(purchase())
    expect(cancels).toEqual([{ sub: 'sub_1', body: { effective_from: 'next_billing_period' } }])
    const mails = buyerEmails()
    expect(mails).toHaveLength(1)
    expect(mails[0].html).toContain('monthly plan stops on')
    expect(mails[0].html).toContain('2026-11-24 08:00 UTC')
    // Still premium through the subscription until then, and through Lifetime after.
    expect(db.rows('user_subscriptions')[0].status).toBe('active')
  })

  it('handles an annual sub the same way', async () => {
    monthlySubscriber('annual')
    await post(purchase())
    expect(cancels).toHaveLength(1)
    expect(buyerEmails()[0].html).toContain('yearly plan stops on')
  })

  it('handles a past_due sub the same way', async () => {
    monthlySubscriber('monthly', 'past_due')
    await post(purchase())
    expect(cancels).toEqual([{ sub: 'sub_1', body: { effective_from: 'next_billing_period' } }])
  })

  it('does not cancel again when Paddle already shows a scheduled cancel', async () => {
    monthlySubscriber()
    paddleSubs.sub_1.scheduled_change = { action: 'cancel', effective_at: '2026-11-20T00:00:00Z' }
    await post(purchase())
    expect(cancels).toEqual([])
    expect(buyerEmails()[0].html).toContain('2026-11-20 00:00 UTC')
  })

  it('a failed cancel never undoes the grant', async () => {
    monthlySubscriber()
    cancelStatus = 500
    const res = await post(purchase())
    expect(res.status).toBe(200)
    expect(life()[0].granted_at).toBeTruthy()
    expect(buyerEmails()[0].html).not.toContain('plan stops on')
  })

  it('never cancels for a user holding a gift', async () => {
    monthlySubscriber('annual')
    life().push({ id: 999, user_id: USER, source: 'gift', paddle_transaction_id: null, gift_for_subscription_id: 'sub_1', granted_at: '2026-11-05T00:00:00Z', revoked_at: null })
    await post(purchase())
    expect(cancels).toEqual([])
    expect(paddleCalls().filter(([u]) => String(u).includes('/subscriptions/'))).toEqual([])
  })

  it('never cancels a paused sub (Paddle allows only an immediate cancel)', async () => {
    monthlySubscriber('monthly', 'paused')
    await post(purchase())
    expect(cancels).toEqual([])
  })
})

describe('Lifetime adjustments', () => {
  const at = (m: number) => `2026-10-30T10:${String(m).padStart(2, '0')}:00Z`

  it('a full approved refund revokes', async () => {
    await post(purchase())
    expect((await post(adjustment({ at: at(1) }))).status).toBe(200)
    expect(life()[0]).toMatchObject({ revoke_reason: 'refund', last_adjustment_at: at(1) })
    expect(life()[0].revoked_at).toBeTruthy()
    expect(captured).toContain('Lifetime Revoked')
  })

  it("the dashboard's full refund (type partial, its item full) revokes", async () => {
    await post(purchase())
    expect((await post(adjustment({ at: at(1), kind: 'partial', items: [{ type: 'full' }] }))).status).toBe(200)
    expect(life()[0]).toMatchObject({ revoke_reason: 'refund', last_adjustment_at: at(1) })
    expect(life()[0].revoked_at).toBeTruthy()
  })

  it.each([
    ['pending refund', { status: 'pending_approval' }],
    ['rejected refund', { status: 'rejected' }],
    ['partial refund', { kind: 'partial' }],
    ['partial refund of its item', { kind: 'partial', items: [{ type: 'partial' }] }],
    ['pending dashboard full refund', { kind: 'partial', items: [{ type: 'full' }], status: 'pending_approval' }],
    ['refund with no type', { kind: null }],
    ['chargeback warning', { action: 'chargeback_warning', status: 'approved' }],
    ['credit', { action: 'credit' }],
  ])('a %s keeps Lifetime', async (_name, change) => {
    await post(purchase())
    await post(adjustment({ at: at(1), ...change }))
    expect(life()[0].revoked_at ?? null).toBeNull()
    expect(life()[0].last_adjustment_at).toBe(at(1))
  })

  it('a chargeback revokes and its reversal restores', async () => {
    await post(purchase())
    await post(adjustment({ id: 'adj_cb', action: 'chargeback', kind: null, status: 'pending_approval', at: at(1) }))
    expect(life()[0].revoke_reason).toBe('chargeback')
    await post(adjustment({ id: 'adj_rev', action: 'chargeback_reverse', at: at(2) }))
    expect(life()[0].revoked_at).toBeNull()
    expect(life()[0].revoke_reason).toBeNull()
  })

  it('the original chargeback updated to reversed after the reversal does not revoke again', async () => {
    await post(purchase())
    await post(adjustment({ id: 'adj_cb', action: 'chargeback', at: at(1) }))
    await post(adjustment({ id: 'adj_rev', action: 'chargeback_reverse', at: at(2) }))
    await post(adjustment({ type: 'adjustment.updated', id: 'adj_cb', action: 'chargeback', status: 'reversed', at: at(3) }))
    expect(life()[0].revoked_at).toBeNull()
  })

  it('a chargeback reversal never restores a refund revoke', async () => {
    await post(purchase())
    await post(adjustment({ at: at(1) }))
    await post(adjustment({ id: 'adj_rev', action: 'chargeback_reverse', at: at(2) }))
    expect(life()[0].revoke_reason).toBe('refund')
    expect(life()[0].revoked_at).toBeTruthy()
  })

  it('applies in occurred_at order: an older event arriving late changes nothing', async () => {
    await post(purchase())
    await post(adjustment({ id: 'adj_cb', action: 'chargeback', at: at(1) }))
    await post(adjustment({ id: 'adj_rev', action: 'chargeback_reverse', at: at(3) }))
    // A re-delivery of the chargeback, older than the reversal.
    expect((await post(adjustment({ id: 'adj_cb', action: 'chargeback', at: at(2) }))).status).toBe(200)
    expect(life()[0].revoked_at).toBeNull()
    expect(life()[0].last_adjustment_at).toBe(at(3))
  })

  it('a refund that lands before the purchase leaves a tombstone, and the purchase stays revoked with no cancel and no email', async () => {
    monthlySubscriber()
    paddleTxns.txn_1 = {
      id: 'txn_1',
      customer_id: 'ctm_1',
      custom_data: { user_id: USER },
      items: [{ price: { id: LIFETIME, billing_cycle: null } }],
    }
    await post(adjustment({ at: at(1) }))
    expect(life()).toHaveLength(1)
    expect(life()[0].granted_at ?? null).toBeNull()
    expect(life()[0].revoke_reason).toBe('refund')
    await post(purchase({ at: '2026-10-29T10:00:00Z' }))
    expect(life()).toHaveLength(1)
    expect(life()[0].granted_at).toBeTruthy()
    expect(life()[0].revoked_at).toBeTruthy()
    expect(cancels).toEqual([])
    expect(buyerEmails()).toEqual([])
  })

  it('a chargeback and its reversal before the purchase leave it live', async () => {
    paddleTxns.txn_1 = { id: 'txn_1', customer_id: 'ctm_1', custom_data: { user_id: USER }, items: [{ price: { id: LIFETIME, billing_cycle: null } }] }
    await post(adjustment({ id: 'adj_cb', action: 'chargeback', at: at(1) }))
    await post(adjustment({ id: 'adj_rev', action: 'chargeback_reverse', at: at(2) }))
    await post(purchase())
    expect(life()[0].granted_at).toBeTruthy()
    expect(life()[0].revoked_at).toBeNull()
    expect(buyerEmails()).toHaveLength(1)
  })

  it('a monthly refund is ignored without a Paddle read, and still alerts', async () => {
    monthlySubscriber()
    const res = await post(adjustment({ sub: 'sub_1', txn: 'txn_monthly', at: at(1) }))
    expect(res.status).toBe(200)
    expect(life()).toEqual([])
    // The only Paddle read is the alert's best-effort payment date.
    expect(paddleCalls().map(([u]) => String(u).replace(/^https:\/\/[^/]+/, ''))).toEqual(['/transactions/txn_monthly'])
    expect(db.rows('user_subscriptions')[0].status).toBe('active')
    expect(alerts().map((a) => a.subject)).toEqual(['[Billing] refund approved: Subscription, buyer@example.com'])
  })

  it('an adjustment for a transaction Paddle does not know is ignored', async () => {
    expect((await post(adjustment({ txn: 'txn_ghost', at: at(1) }))).status).toBe(200)
    expect(life()).toEqual([])
  })

  it('a gift row is never touched by an adjustment', async () => {
    life().push({ id: 999, user_id: USER, source: 'gift', paddle_transaction_id: null, gift_for_subscription_id: 'sub_1', granted_at: '2026-11-05T00:00:00Z', revoked_at: null })
    await post(adjustment({ sub: 'sub_1', txn: 'txn_annual', at: at(1) }))
    expect(life()[0].revoked_at).toBeNull()
  })
})

describe('billing log and alerts', () => {
  const sub = (event_type: string, data: Record<string, unknown>, at: string, eventId?: string) =>
    envelope(event_type, { id: 'sub_1', customer_id: 'ctm_1', items: [{ price: { billing_cycle: MONTHLY_CYCLE } }], current_billing_period: { starts_at: '2026-10-24T08:00:00Z', ends_at: '2026-11-24T08:00:00Z' }, ...data }, at, eventId)

  beforeEach(() => monthlySubscriber())

  it('logs each event once, by Paddle event id', async () => {
    const body = sub('subscription.updated', { status: 'active' }, '2026-10-29T11:00:00Z', 'evt_same')
    await post(body)
    await post(body)
    expect(db.rows('billing_events').map((r) => r.paddle_event_id)).toEqual(['evt_same'])
  })

  it('a scheduled cancel alerts once across duplicate and sibling deliveries', async () => {
    const change = { status: 'active', scheduled_change: { action: 'cancel', effective_at: '2026-11-24T08:00:00Z' } }
    await post(sub('subscription.updated', change, '2026-10-29T11:00:00Z', 'evt_a'))
    await post(sub('subscription.updated', change, '2026-10-29T11:00:00Z', 'evt_a'))
    await post(sub('subscription.updated', change, '2026-10-29T11:00:00.5Z', 'evt_b'))
    expect(alerts()).toHaveLength(1)
    expect(alerts()[0].to).toEqual(['aicanvas.me@gmail.com'])
    expect(alerts()[0].subject).toBe('[Billing] Cancel scheduled: Monthly, buyer@example.com')
    expect(alerts()[0].text).toContain('Takes effect at: 2026-11-24 08:00 UTC')
  })

  it('an incidental subscription.updated with no scheduled cancel sends nothing', async () => {
    await post(sub('subscription.updated', { status: 'active', scheduled_change: null }, '2026-10-29T11:00:00Z'))
    expect(alerts()).toEqual([])
  })

  it('the cancel taking effect alerts', async () => {
    await post(sub('subscription.canceled', { status: 'canceled', canceled_at: '2026-11-24T08:00:00Z' }, '2026-11-24T08:00:01Z'))
    expect(alerts().map((a) => a.subject)).toEqual(['[Billing] Cancel took effect: Monthly, buyer@example.com'])
  })

  it('a failed payment alerts once per billing period', async () => {
    await post(sub('subscription.past_due', { status: 'past_due' }, '2026-10-29T11:00:00Z'))
    await post(sub('subscription.past_due', { status: 'past_due' }, '2026-10-29T12:00:00Z'))
    expect(alerts()).toHaveLength(1)
  })

  it('an adjustment alerts once per status change and never changes a subscriber\'s access', async () => {
    await post(adjustment({ id: 'adj_m', sub: 'sub_1', txn: 'txn_m', status: 'pending_approval', at: '2026-10-29T11:00:00Z' }))
    await post(adjustment({ type: 'adjustment.updated', id: 'adj_m', sub: 'sub_1', txn: 'txn_m', status: 'approved', at: '2026-10-29T12:00:00Z' }))
    await post(adjustment({ type: 'adjustment.updated', id: 'adj_m', sub: 'sub_1', txn: 'txn_m', status: 'approved', at: '2026-10-29T12:00:00Z' }))
    expect(alerts()).toHaveLength(2)
    expect(alerts()[1].text).toContain('Amount: 125.00 USD')
    expect(db.rows('user_subscriptions')[0].status).toBe('active')
  })

  it('a Lifetime refund alert says Lifetime was revoked', async () => {
    db.rows('user_subscriptions').length = 0
    await post(purchase())
    await post(adjustment({ at: '2026-10-30T10:00:00Z' }))
    const a = alerts().find((e) => e.subject.includes('Lifetime'))
    expect(a?.text).toContain('Lifetime was revoked by this adjustment')
  })

  it('a failed alert send still answers 200 and leaves the alert for the re-send', async () => {
    resendOk = false
    const res = await post(sub('subscription.updated', { status: 'active', scheduled_change: { action: 'cancel', effective_at: '2026-11-24T08:00:00Z' } }, '2026-10-29T11:00:00Z', 'evt_fail'))
    expect(res.status).toBe(200)
    const row = db.rows('billing_events').find((r) => r.paddle_event_id === 'evt_fail')
    expect(row?.alerted_at ?? null).toBeNull()
    expect(row?.alert_key).toBe('cancel_scheduled:sub_1:2026-11-24T08:00:00Z')
    expect(row?.summary.alert_tries).toBe(1)
  })

  it('a log write failure never fails the webhook', async () => {
    db.failing.add('billing_events:upsert')
    expect((await post(sub('subscription.updated', { status: 'active' }, '2026-10-29T11:00:00Z'))).status).toBe(200)
  })
})
