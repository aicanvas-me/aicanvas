import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the session, the admin client and Paddle. The verification chain
// (paid status, user match, replay guard, plan mapping) runs for real.
const upserts: Record<string, unknown>[] = []
vi.mock('@/app/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) } }),
}))
vi.mock('@/app/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }),
      upsert: async (patch: Record<string, unknown>) => {
        upserts.push(patch)
        return { error: null }
      },
    }),
  }),
}))

import { POST } from './route'

function paddleTxn(extra: Record<string, unknown>) {
  return {
    data: {
      status: 'completed',
      custom_data: { user_id: 'u1' },
      created_at: new Date().toISOString(),
      customer_id: 'ctm_1',
      items: [{ price: { id: 'pri_month', billing_cycle: { interval: 'month' } } }],
      ...extra,
    },
  }
}

function post() {
  return POST(
    new NextRequest('http://localhost/api/checkout/completed', {
      method: 'POST',
      body: JSON.stringify({ transactionId: 'txn_1' }),
    }),
  )
}

beforeEach(() => {
  upserts.length = 0
  process.env.PADDLE_API_KEY = 'test'
})

describe('POST /api/checkout/completed', () => {
  it('writes the period end from the transaction so the row expires on its own', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(
      paddleTxn({ subscription_id: 'sub_1', billing_period: { starts_at: '2026-08-01T00:00:00Z', ends_at: '2026-09-01T00:00:00Z' } }),
    )))
    expect((await post()).status).toBe(200)
    expect(upserts[0]).toMatchObject({
      user_id: 'u1',
      status: 'active',
      plan: 'monthly',
      paddle_subscription_id: 'sub_1',
      current_period_end: '2026-09-01T00:00:00Z',
    })
  })

  it('leaves the period end unset when the transaction carries none', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(paddleTxn({}))))
    expect((await post()).status).toBe(200)
    expect(upserts[0]).not.toHaveProperty('current_period_end')
    expect(upserts[0]).not.toHaveProperty('paddle_subscription_id')
  })

  it('refuses a transaction that belongs to another user', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(paddleTxn({ custom_data: { user_id: 'someone-else' } }))))
    expect((await post()).status).toBe(403)
    expect(upserts).toHaveLength(0)
  })
})
