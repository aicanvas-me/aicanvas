import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { fakeSupabase } from '@/lib/identity/__fixtures__/fake-supabase'

// The checkout fast path for one-time purchases: Lifetime gets its own row and
// never a subscription row; the verification chain runs for real.
const USER = '11111111-1111-4111-8111-111111111111'
const LIFETIME = 'pri_lifetime'
const db = fakeSupabase()
vi.mock('@/app/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: USER } } }) } }),
}))
vi.mock('@/app/lib/supabase/admin', () => ({ createAdminClient: () => db.client }))

import { POST } from './route'

let price = LIFETIME
function stubPaddle() {
  vi.stubGlobal('fetch', async () =>
    Response.json({
      data: {
        id: 'txn_1',
        status: 'completed',
        custom_data: { user_id: USER },
        created_at: new Date().toISOString(),
        customer_id: 'ctm_1',
        subscription_id: null,
        items: [{ price: { id: price, billing_cycle: null } }],
      },
    }),
  )
}

const post = () =>
  POST(new NextRequest('http://localhost/api/checkout/completed', { method: 'POST', body: JSON.stringify({ transactionId: 'txn_1' }) }))

beforeEach(() => {
  db.reset()
  price = LIFETIME
  process.env.PADDLE_API_KEY = 'test'
  process.env.NEXT_PUBLIC_PADDLE_PRICE_LIFETIME = LIFETIME
  stubPaddle()
})

describe('POST /api/checkout/completed, one-time purchases', () => {
  it('grants Lifetime and returns before any subscription write', async () => {
    const res = await post()
    expect(res.status).toBe(200)
    expect(db.rows('user_lifetime_access')).toHaveLength(1)
    expect(db.rows('user_lifetime_access')[0]).toMatchObject({ user_id: USER, paddle_transaction_id: 'txn_1', source: 'purchase' })
    expect(db.rows('user_subscriptions')).toEqual([])
  })

  it('acknowledges another one-time price with 202 and writes nothing', async () => {
    price = 'pri_other'
    const res = await post()
    expect(res.status).toBe(202)
    expect(db.rows('user_lifetime_access')).toEqual([])
    expect(db.rows('user_subscriptions')).toEqual([])
  })

  it('a replay after a refund does not re-grant', async () => {
    db.rows('user_lifetime_access').push({
      id: 1, user_id: USER, paddle_transaction_id: 'txn_1', source: 'purchase',
      granted_at: '2026-10-29T10:00:00Z', revoked_at: '2026-10-29T10:30:00Z', revoke_reason: 'refund',
    })
    expect((await post()).status).toBe(200)
    expect(db.rows('user_lifetime_access')).toHaveLength(1)
    expect(db.rows('user_lifetime_access')[0].revoked_at).toBe('2026-10-29T10:30:00Z')
  })
})
