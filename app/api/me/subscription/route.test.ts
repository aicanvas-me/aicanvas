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

const FUTURE = '2099-01-01T00:00:00Z'
const PAST = '2020-01-01T00:00:00Z'
const LIVE_ROW = { paddle_subscription_id: 'sub_1', status: 'active', current_period_end: FUTURE }
const NONE = { subscription: null }
const UNKNOWN = { subscription: null, unavailable: true }

const body = async () => (await GET()).json()

beforeEach(() => {
  user = { id: 'u1' }
  row = null
  rowError = null
  vi.stubEnv('PADDLE_API_KEY', 'test-key')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('GET /api/me/subscription', () => {
  it('no subscription row is "none"', async () => {
    expect(await body()).toEqual(NONE)
  })

  it('no row is "none" even without a Paddle key', async () => {
    vi.stubEnv('PADDLE_API_KEY', '')
    expect(await body()).toEqual(NONE)
  })

  it('a canceled row is "none"', async () => {
    row = { ...LIVE_ROW, status: 'canceled', current_period_end: PAST }
    expect(await body()).toEqual(NONE)
  })

  it('a paused row or a live row past its period end is "unknown", so it stays manageable', async () => {
    row = { ...LIVE_ROW, status: 'paused' }
    expect(await body()).toEqual(UNKNOWN)
    row = { ...LIVE_ROW, status: 'past_due', current_period_end: PAST }
    expect(await body()).toEqual(UNKNOWN)
  })

  it('a database error is "unknown"', async () => {
    rowError = { message: 'down' }
    expect(await body()).toEqual(UNKNOWN)
  })

  it('a missing Paddle key with a live row is "unknown"', async () => {
    vi.stubEnv('PADDLE_API_KEY', '')
    row = LIVE_ROW
    expect(await body()).toEqual(UNKNOWN)
  })

  it('a failed or throwing Paddle read is "unknown"', async () => {
    row = LIVE_ROW
    vi.stubGlobal('fetch', vi.fn(async () => new Response('down', { status: 503 })))
    expect(await body()).toEqual(UNKNOWN)
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('timeout') }))
    expect(await body()).toEqual(UNKNOWN)
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
    const b = await body()
    expect(b.unavailable).toBeUndefined()
    expect(b.subscription).toMatchObject({ scheduledChange: 'cancel', startedAt: '2026-11-05T00:00:00Z' })
  })

  it('signed out is 401', async () => {
    user = null
    expect((await GET()).status).toBe(401)
  })
})
