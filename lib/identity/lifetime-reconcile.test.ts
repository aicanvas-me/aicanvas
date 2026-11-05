import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fakeSupabase } from './__fixtures__/fake-supabase'
import { foldAdjustments, reconcileLifetime } from './lifetime'
import { resendPendingAlerts } from './billing-events'

// The daily self-heal for Lifetime and the alert re-send, against the
// in-memory database and a routed Paddle/Resend fetch mock.

const USER = '11111111-1111-4111-8111-111111111111'
const LIFETIME = 'pri_lifetime'
const db = fakeSupabase()
const admin = db.client as unknown as Parameters<typeof reconcileLifetime>[0]

let txnList: Record<string, unknown>[] = []
let adjList: Record<string, unknown>[] = []
const subs: Record<string, Record<string, unknown>> = {}
const cancels: string[] = []
let resendOk = true
const listUrls: string[] = []

const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
  const url = String(input)
  if (url.includes('api.resend.com')) return resendOk ? Response.json({ id: 'e' }) : new Response('down', { status: 500 })
  if (url.includes('/transactions?')) {
    listUrls.push(url)
    return Response.json({ data: txnList, meta: { pagination: { has_more: false, next: null } } })
  }
  if (url.includes('/adjustments?')) {
    listUrls.push(url)
    return Response.json({ data: adjList, meta: { pagination: { has_more: false, next: null } } })
  }
  const cancel = url.match(/\/subscriptions\/([^/]+)\/cancel$/)
  if (cancel) {
    cancels.push(cancel[1])
    return Response.json({ data: { ...subs[cancel[1]], scheduled_change: { action: 'cancel', effective_at: '2026-11-24T00:00:00Z' } } })
  }
  const sub = url.match(/\/subscriptions\/([^/]+)$/)
  if (sub) return Response.json({ data: subs[sub[1]] })
  return new Response('unrouted', { status: 599 })
})

const lifetimeTxn = (id = 'txn_1') => ({
  id,
  status: 'completed',
  customer_id: 'ctm_1',
  custom_data: { user_id: USER },
  items: [{ price: { id: LIFETIME, billing_cycle: null } }],
})
const mails = () => fetchMock.mock.calls.filter(([u]) => String(u).includes('api.resend.com'))

beforeEach(() => {
  db.reset()
  db.users[USER] = { email: 'buyer@example.com', user_metadata: {} }
  txnList = []
  adjList = []
  cancels.length = 0
  listUrls.length = 0
  resendOk = true
  for (const k of Object.keys(subs)) delete subs[k]
  process.env.PADDLE_API_KEY = 'pdl_test'
  process.env.RESEND_API_KEY = 're_test'
  process.env.NEXT_PUBLIC_PADDLE_PRICE_LIFETIME = LIFETIME
  fetchMock.mockClear()
  vi.stubGlobal('fetch', fetchMock)
})

describe('foldAdjustments', () => {
  it('a full approved refund revokes; partial and pending do not', () => {
    expect(foldAdjustments([{ action: 'refund', type: 'full', status: 'approved', created_at: '1' }])).toEqual({ revoked: true, reason: 'refund' })
    expect(foldAdjustments([{ action: 'refund', type: 'partial', status: 'approved', created_at: '1' }]).revoked).toBe(false)
    expect(foldAdjustments([{ action: 'refund', type: 'full', status: 'pending_approval', created_at: '1' }]).revoked).toBe(false)
  })

  it("the dashboard's full refund (type partial, every item full) revokes; a partial item does not", () => {
    // Shape of the real sandbox refund adj_01m6p0jkxhep20qfs5sqf8cazc (2026-11-05).
    const dashboardFull = { action: 'refund', type: 'partial', items: [{ type: 'full', amount: '1070' }], created_at: '1' }
    expect(foldAdjustments([{ ...dashboardFull, status: 'approved' }])).toEqual({ revoked: true, reason: 'refund' })
    expect(foldAdjustments([{ ...dashboardFull, status: 'pending_approval' }]).revoked).toBe(false)
    const partialItem = { action: 'refund', type: 'partial', items: [{ type: 'partial', amount: '500' }], created_at: '1' }
    expect(foldAdjustments([{ ...partialItem, status: 'approved' }]).revoked).toBe(false)
    expect(foldAdjustments([{ action: 'refund', type: 'partial', items: [], status: 'approved', created_at: '1' }]).revoked).toBe(false)
  })

  it('a reversed chargeback and its reversal leave it live', () => {
    expect(
      foldAdjustments([
        { action: 'chargeback_reverse', status: 'approved', created_at: '2' },
        { action: 'chargeback', status: 'reversed', created_at: '1' },
      ]),
    ).toEqual({ revoked: false, reason: null })
  })

  it('an open chargeback revokes', () => {
    expect(foldAdjustments([{ action: 'chargeback', status: 'approved', created_at: '1' }])).toEqual({ revoked: true, reason: 'chargeback' })
  })
})

describe('reconcileLifetime', () => {
  it('lists only completed one-time transactions from the last 30 days', async () => {
    await reconcileLifetime(admin, new Date('2026-10-29T03:00:00Z'))
    expect(listUrls[0]).toContain('status=completed')
    expect(listUrls[0]).toContain('subscription_id=null')
    expect(listUrls[0]).toContain('billed_at[GTE]=2026-09-29T03:00:00.000Z')
  })

  it('grants a purchase the webhook missed and emails once across runs', async () => {
    txnList = [lifetimeTxn(), { ...lifetimeTxn('txn_other'), items: [{ price: { id: 'pri_other', billing_cycle: null } }] }]
    const first = await reconcileLifetime(admin)
    expect(first.granted).toBe(1)
    expect(db.rows('user_lifetime_access')).toHaveLength(1)
    expect(mails()).toHaveLength(1)
    await reconcileLifetime(admin)
    expect(db.rows('user_lifetime_access')).toHaveLength(1)
    expect(mails()).toHaveLength(1)
  })

  it('writes a missed refund revoke', async () => {
    txnList = [lifetimeTxn()]
    adjList = [{ transaction_id: 'txn_1', action: 'refund', type: 'full', status: 'approved', created_at: '2026-10-20T00:00:00Z' }]
    const out = await reconcileLifetime(admin)
    expect(out.revokes).toBe(1)
    expect(db.rows('user_lifetime_access')[0].revoke_reason).toBe('refund')
  })

  it('restores a row whose chargeback Paddle shows reversed', async () => {
    txnList = [lifetimeTxn()]
    db.rows('user_lifetime_access').push({
      id: 1, user_id: USER, paddle_transaction_id: 'txn_1', source: 'purchase', granted_at: '2026-10-01T00:00:00Z',
      revoked_at: '2026-10-10T00:00:00Z', revoke_reason: 'chargeback', last_adjustment_at: '2026-10-10T00:00:00Z', welcome_claimed_at: '2026-10-01T00:00:00Z',
    })
    adjList = [
      { transaction_id: 'txn_1', action: 'chargeback', status: 'reversed', created_at: '2026-10-10T00:00:00Z' },
      { transaction_id: 'txn_1', action: 'chargeback_reverse', status: 'approved', created_at: '2026-10-15T00:00:00Z' },
    ]
    const out = await reconcileLifetime(admin)
    expect(out.restores).toBe(1)
    expect(db.rows('user_lifetime_access')[0].revoked_at).toBeNull()
  })

  it('schedules the cancel a webhook missed, and skips gift holders', async () => {
    const GIFTED = '22222222-2222-4222-8222-222222222222'
    db.rows('user_lifetime_access').push(
      { id: 1, user_id: USER, paddle_transaction_id: 'txn_old', source: 'purchase', granted_at: '2026-09-01T00:00:00Z', revoked_at: null, welcome_claimed_at: 'x' },
      { id: 2, user_id: GIFTED, paddle_transaction_id: 'txn_g', source: 'purchase', granted_at: '2026-09-01T00:00:00Z', revoked_at: null, welcome_claimed_at: 'x' },
      { id: 3, user_id: GIFTED, paddle_transaction_id: null, source: 'gift', gift_for_subscription_id: 'sub_g', granted_at: '2026-09-01T00:00:00Z', revoked_at: null },
    )
    db.rows('user_subscriptions').push(
      { user_id: USER, status: 'active', plan: 'monthly', paddle_subscription_id: 'sub_1' },
      { user_id: GIFTED, status: 'active', plan: 'annual', paddle_subscription_id: 'sub_g' },
    )
    subs.sub_1 = { id: 'sub_1', status: 'active', scheduled_change: null }
    subs.sub_g = { id: 'sub_g', status: 'active', scheduled_change: null }
    await reconcileLifetime(admin)
    expect(cancels).toEqual(['sub_1'])
  })
})

describe('resendPendingAlerts', () => {
  const old = '2026-10-29T09:00:00Z'
  const now = new Date('2026-10-29T10:00:00Z')
  const pending = (id: number, tries: number, created_at = old) => ({
    id, paddle_event_id: `evt_${id}`, alert_key: `k${id}`, alerted_at: null, created_at,
    summary: { alert: { subject: '[Billing] x', text: 'y' }, alert_tries: tries },
  })

  it('re-sends a failed alert and marks it sent', async () => {
    db.rows('billing_events').push(pending(1, 1))
    expect(await resendPendingAlerts(admin, now)).toEqual({ resent: 1, failed: 0 })
    expect(db.rows('billing_events')[0].alerted_at).toBe(now.toISOString())
    expect(db.rows('billing_events')[0].summary.alert_tries).toBe(2)
  })

  it('stops after 3 tries in all', async () => {
    resendOk = false
    db.rows('billing_events').push(pending(1, 1))
    await resendPendingAlerts(admin, now)
    await resendPendingAlerts(admin, now)
    await resendPendingAlerts(admin, now)
    expect(mails()).toHaveLength(2)
    expect(db.rows('billing_events')[0].summary.alert_tries).toBe(3)
  })

  it('leaves alerts younger than 10 minutes to the webhook', async () => {
    db.rows('billing_events').push(pending(1, 1, '2026-10-29T09:55:00Z'))
    expect(await resendPendingAlerts(admin, now)).toEqual({ resent: 0, failed: 0 })
  })
})
