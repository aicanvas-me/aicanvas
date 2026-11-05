import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let user: { id: string } | null = { id: 'u1' }
let row: Record<string, unknown> | null = null
let rowError: unknown = null

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user } }) },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: row, error: rowError }) }) }),
    }),
  }),
}))

const { GET } = await import('./route')

const LIVE_ROW = { paddle_subscription_id: 'sub_1', status: 'active', current_period_end: '2099-01-01T00:00:00Z' }

beforeEach(() => {
  user = { id: 'u1' }
  row = null
  rowError = null
  process.env.PADDLE_API_KEY = 'test-key'
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('GET /api/me/subscription', () => {
  it('no subscription row is a plain null, not unavailable', async () => {
    const body = await (await GET()).json()
    expect(body).toEqual({ subscription: null })
  })

  it('a database error says unavailable', async () => {
    rowError = { message: 'down' }
    expect(await (await GET()).json()).toEqual({ subscription: null, unavailable: true })
  })

  it('a missing Paddle key says unavailable', async () => {
    delete process.env.PADDLE_API_KEY
    row = LIVE_ROW
    expect(await (await GET()).json()).toEqual({ subscription: null, unavailable: true })
  })

  it('a failed Paddle read says unavailable', async () => {
    row = LIVE_ROW
    vi.stubGlobal('fetch', vi.fn(async () => new Response('down', { status: 503 })))
    expect(await (await GET()).json()).toEqual({ subscription: null, unavailable: true })
  })

  it('a live subscription returns its display fields', async () => {
    row = LIVE_ROW
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          data: {
            status: 'active',
            items: [{ price: { billing_cycle: { interval: 'month', frequency: 1 } } }],
            current_billing_period: { ends_at: '2026-12-05T00:00:00Z' },
            scheduled_change: { action: 'cancel' },
            started_at: '2026-11-05T00:00:00Z',
          },
        }),
      ),
    )
    const body = await (await GET()).json()
    expect(body.unavailable).toBeUndefined()
    expect(body.subscription).toMatchObject({ scheduledChange: 'cancel', startedAt: '2026-11-05T00:00:00Z' })
  })

  it('signed out is 401', async () => {
    user = null
    expect((await GET()).status).toBe(401)
  })
})
