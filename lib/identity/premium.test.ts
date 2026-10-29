import { describe, it, expect } from 'vitest'
import { getPremiumForUser } from './premium'

type Life = { granted_at: string | null; revoked_at: string | null }

// A client with one subscription row and a list of Lifetime rows for the user.
// Either read can be made to fail.
function client(opts: {
  sub?: { status: string; current_period_end: string | null } | null
  life?: Life[]
  subError?: boolean
  lifeError?: boolean
}) {
  return {
    from: (table: string) => ({
      select: () => ({
        eq: () => {
          if (table === 'user_subscriptions') {
            return {
              maybeSingle: async () =>
                opts.subError ? { data: null, error: { message: 'sub read failed' } } : { data: opts.sub ?? null, error: null },
            }
          }
          return Promise.resolve(
            opts.lifeError ? { data: null, error: { message: 'lifetime read failed' } } : { data: opts.life ?? [], error: null },
          )
        },
      }),
    }),
  } as unknown as Parameters<typeof getPremiumForUser>[0]
}

const GRANTED = '2026-10-29T10:00:00Z'
const FUTURE = '2099-01-01T00:00:00Z'
const PAST = '2020-01-01T00:00:00Z'

describe('getPremiumForUser', () => {
  it('a premium subscription alone is premium, not Lifetime', async () => {
    expect(await getPremiumForUser(client({ sub: { status: 'active', current_period_end: FUTURE } }), 'u')).toEqual({
      premium: true,
      lifetime: false,
    })
  })

  it('a live Lifetime row alone is premium and Lifetime', async () => {
    expect(await getPremiumForUser(client({ life: [{ granted_at: GRANTED, revoked_at: null }] }), 'u')).toEqual({
      premium: true,
      lifetime: true,
    })
  })

  it('both is premium and Lifetime', async () => {
    const c = client({ sub: { status: 'active', current_period_end: FUTURE }, life: [{ granted_at: GRANTED, revoked_at: null }] })
    expect(await getPremiumForUser(c, 'u')).toEqual({ premium: true, lifetime: true })
  })

  it('a Lifetime row keeps premium after the subscription lapsed', async () => {
    const c = client({ sub: { status: 'canceled', current_period_end: PAST }, life: [{ granted_at: GRANTED, revoked_at: null }] })
    expect(await getPremiumForUser(c, 'u')).toEqual({ premium: true, lifetime: true })
  })

  it('a revoked Lifetime row grants nothing', async () => {
    const c = client({ life: [{ granted_at: GRANTED, revoked_at: '2026-10-30T10:00:00Z' }] })
    expect(await getPremiumForUser(c, 'u')).toEqual({ premium: false, lifetime: false })
  })

  it('a tombstone (refund before the grant) grants nothing', async () => {
    expect(await getPremiumForUser(client({ life: [{ granted_at: null, revoked_at: null }] }), 'u')).toEqual({
      premium: false,
      lifetime: false,
    })
  })

  it('a revoked purchase next to a live gift is still Lifetime', async () => {
    const c = client({
      life: [
        { granted_at: GRANTED, revoked_at: '2026-10-30T10:00:00Z' },
        { granted_at: GRANTED, revoked_at: null },
      ],
    })
    expect(await getPremiumForUser(c, 'u')).toEqual({ premium: true, lifetime: true })
  })

  it('no rows is free', async () => {
    expect(await getPremiumForUser(client({}), 'u')).toEqual({ premium: false, lifetime: false })
  })

  it('a failed subscription read throws, never free', async () => {
    await expect(getPremiumForUser(client({ subError: true, life: [{ granted_at: GRANTED, revoked_at: null }] }), 'u')).rejects.toBeTruthy()
  })

  it('a failed Lifetime read throws, never free', async () => {
    await expect(getPremiumForUser(client({ lifeError: true, sub: { status: 'active', current_period_end: FUTURE } }), 'u')).rejects.toBeTruthy()
  })
})
