import { beforeEach, describe, expect, it, vi } from 'vitest'

type Read = { data: unknown; error: unknown }

let user: { id: string } | null = { id: 'u1' }
let sub: Read
let life: Read

vi.mock('@/app/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user } }) },
    from: (table: string) => ({
      select: () => ({
        eq: () =>
          table === 'user_subscriptions' ? { maybeSingle: async () => sub } : Promise.resolve(life),
      }),
    }),
  }),
}))

const { GET } = await import('./route')

const ACTIVE = { status: 'active', current_period_end: '2099-01-01T00:00:00Z' }
const LIVE = [{ granted_at: '2026-10-29T10:00:00Z', revoked_at: null }]
const FAILED = { data: null, error: { message: 'read failed' } }

beforeEach(() => {
  user = { id: 'u1' }
  sub = { data: null, error: null }
  life = { data: [], error: null }
})

describe('GET /api/me/entitlement', () => {
  it('signed out is anonymous', async () => {
    user = null
    expect(await (await GET()).json()).toEqual({ tier: 'anonymous' })
  })

  it('no rows is free', async () => {
    expect(await (await GET()).json()).toEqual({ tier: 'free', lifetime: false })
  })

  it('a live Lifetime row is premium and Lifetime, even when the subscription read failed', async () => {
    sub = FAILED
    life = { data: LIVE, error: null }
    expect(await (await GET()).json()).toEqual({ tier: 'premium', lifetime: true })
  })

  it('an unknown Lifetime is a 503, never a buy button for an owner', async () => {
    sub = { data: ACTIVE, error: null }
    life = FAILED
    const res = await GET()
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ tier: null })
  })

  it('an unproven free answer is a 503', async () => {
    sub = FAILED
    expect((await GET()).status).toBe(503)
  })
})
