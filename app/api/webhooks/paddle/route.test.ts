import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHmac } from 'node:crypto'
import { NextRequest } from 'next/server'

// The subscription row lives in memory. A read takes its snapshot when it is
// CALLED and resolves a tick later, so two deliveries that arrive together both
// see the row as it was before either wrote it, which is the real interleaving
// (Paddle sends subscription.created and subscription.activated at the same
// instant). The claim is one synchronous check-and-set, like one UPDATE under
// a row lock. Signature verification and the stale guard run for real.
let row: Record<string, unknown> | null = null
let claimFails = false
const claims = { attempted: 0, won: 0, filters: [] as unknown[][] }
const upserts: Record<string, unknown>[] = []
const users: Record<string, { email: string; user_metadata: Record<string, unknown> }> = {}

vi.mock('@/app/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => {
            const snapshot = row ? { ...row } : null
            return new Promise((resolve) => setTimeout(() => resolve({ data: snapshot, error: null }), 5))
          },
        }),
      }),
      upsert: async (patch: Record<string, unknown>) => {
        upserts.push(patch)
        row = { ...(row ?? {}), ...patch }
        return { error: null }
      },
      update: (patch: Record<string, unknown>) => ({
        eq: (col: string, val: unknown) => ({
          is: (col2: string, val2: unknown) => ({
            select: async () => {
              claims.attempted++
              claims.filters.push([col, val, col2, val2])
              if (claimFails) return { data: null, error: { message: 'claim failed' } }
              if (row && row.welcome_claimed_at == null) {
                row = { ...row, ...patch }
                claims.won++
                return { data: [{ user_id: row.user_id }], error: null }
              }
              return { data: [], error: null }
            },
          }),
        }),
      }),
    }),
    auth: {
      admin: {
        getUserById: async (id: string) => ({
          data: { user: users[id] ? { id, ...users[id] } : null },
          error: null,
        }),
      },
    },
  }),
}))
vi.mock('@/app/lib/analytics-server', () => ({ phCapture: async () => {} }))

import { POST } from './route'

const SECRET = 'pdl_ntfset_test'

function event(occurredAt: string) {
  return JSON.stringify({
    event_type: 'subscription.activated',
    occurred_at: occurredAt,
    data: {
      id: 'sub_1',
      status: 'active',
      customer_id: 'ctm_1',
      custom_data: { user_id: 'u1' },
      current_billing_period: { ends_at: '2026-10-24T08:19:04Z' },
      items: [{ price: { billing_cycle: { interval: 'month' } } }],
    },
  })
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

const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
  async () => Response.json({ id: 'email_1' }),
)

function sentSubjects(): string[] {
  return fetchMock.mock.calls
    .filter(([url]) => String(url).includes('api.resend.com'))
    .map(([, init]) => (JSON.parse(String(init?.body)) as { subject: string }).subject)
}

beforeEach(() => {
  row = null
  claimFails = false
  claims.attempted = 0
  claims.won = 0
  claims.filters.length = 0
  upserts.length = 0
  for (const k of Object.keys(users)) delete users[k]
  users.u1 = { email: 'buyer@example.com', user_metadata: {} }
  process.env.PADDLE_WEBHOOK_SECRET = SECRET
  process.env.RESEND_API_KEY = 're_test'
  fetchMock.mockClear()
  vi.stubGlobal('fetch', fetchMock)
})

describe('POST /api/webhooks/paddle first-activation email', () => {
  it('two activation deliveries at the same instant send exactly one email', async () => {
    const [a, b] = await Promise.all([
      post(event('2026-09-24T08:19:05.000Z')),
      post(event('2026-09-24T08:19:05.500Z')),
    ])
    expect(a.status).toBe(200)
    expect(b.status).toBe(200)
    expect(claims.attempted).toBe(2)
    expect(claims.won).toBe(1)
    expect(claims.filters).toEqual([
      ['user_id', 'u1', 'welcome_claimed_at', null],
      ['user_id', 'u1', 'welcome_claimed_at', null],
    ])
    expect(sentSubjects()).toEqual(['You just got superpowers'])
    expect(row).toMatchObject({ user_id: 'u1', status: 'active', paddle_subscription_id: 'sub_1' })
  })

  it('a row first activated by the previous code (user flag set, no column claim) is not welcomed again', async () => {
    users.u1.user_metadata = { premium_welcome_sent: true }
    row = { user_id: 'u1', status: 'past_due', last_event_at: '2026-09-01T00:00:00Z', welcome_claimed_at: null }
    expect((await post(event('2026-09-24T08:19:05.000Z'))).status).toBe(200)
    expect(claims.attempted).toBe(0)
    expect(sentSubjects()).toEqual([])
    expect(row).toMatchObject({ status: 'active' })
  })

  it('an account provisioned at checkout gets the claim email instead of the welcome', async () => {
    users.u1.user_metadata = { anon_provisioned: true }
    expect((await post(event('2026-09-24T08:19:05.000Z'))).status).toBe(200)
    expect(sentSubjects()).toEqual(['Access your AI Canvas Premium account'])
  })

  it('a row that was already welcomed is never welcomed again', async () => {
    row = {
      user_id: 'u1',
      status: 'past_due',
      last_event_at: '2026-09-01T00:00:00Z',
      welcome_claimed_at: '2026-08-01T00:00:00Z',
    }
    expect((await post(event('2026-09-24T08:19:05.000Z'))).status).toBe(200)
    expect(claims.attempted).toBe(1)
    expect(claims.won).toBe(0)
    expect(sentSubjects()).toEqual([])
    expect(row).toMatchObject({ status: 'active' })
  })

  it('a renewal (active to active) neither claims nor sends', async () => {
    row = { user_id: 'u1', status: 'active', last_event_at: '2026-08-24T00:00:00Z', welcome_claimed_at: null }
    expect((await post(event('2026-09-24T08:19:05.000Z'))).status).toBe(200)
    expect(claims.attempted).toBe(0)
    expect(sentSubjects()).toEqual([])
  })

  it('a claim that fails to persist sends nothing, and the subscription row still lands', async () => {
    claimFails = true
    expect((await post(event('2026-09-24T08:19:05.000Z'))).status).toBe(200)
    expect(sentSubjects()).toEqual([])
    expect(upserts).toHaveLength(1)
    expect(row).toMatchObject({ user_id: 'u1', status: 'active' })
  })
})
