import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock only the two database clients. The token parsing, the revoked filter
// and the tier derivation all run for real: eq() filters are honoured against
// the row's own columns, so a filter on a column the row carries must match.
type Row = Record<string, unknown> | null
const rows: { user_api_keys: Row; user_subscriptions: Row } = {
  user_api_keys: null,
  user_subscriptions: null,
}
// Lifetime rows are a list (a user may hold a purchase and a gift).
let lifetimeRows: Record<string, unknown>[] = []
function table(name: keyof typeof rows | 'user_lifetime_access') {
  const filters: [string, unknown][] = []
  const matches = (row: Record<string, unknown>) => filters.every(([c, v]) => !(c in row) || row[c] === v)
  const q = {
    select: () => q,
    eq: (col: string, val: unknown) => {
      filters.push([col, val])
      return q
    },
    maybeSingle: async () => {
      const row = rows[name as keyof typeof rows]
      const hit = row !== null && matches(row)
      return { data: hit ? row : null, error: null }
    },
    // A list read (no maybeSingle) is awaited directly.
    then: (resolve: (v: { data: unknown; error: null }) => void) =>
      resolve({ data: lifetimeRows.filter(matches), error: null }),
    update: () => ({ eq: () => ({ then: (cb: () => void) => Promise.resolve().then(cb) }) }),
  }
  return q
}
vi.mock('@/app/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: (name: keyof typeof rows) => table(name) }),
}))
vi.mock('@/app/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: null } }) } }),
}))

import { getEntitlement } from './entitlement'

const TOKEN = 'aic_' + 'a'.repeat(48)
const req = () => new Request(`https://aicanvas.me/r/x.json?token=${TOKEN}`)

beforeEach(() => {
  rows.user_api_keys = null
  rows.user_subscriptions = null
  lifetimeRows = []
})

describe('getEntitlement (token path)', () => {
  it('a token past its old expiry date still resolves to the account and its tier', async () => {
    rows.user_api_keys = { user_id: 'u1', expires_at: '2020-01-01T00:00:00Z' }
    rows.user_subscriptions = { status: 'active', current_period_end: null }
    expect(await getEntitlement(req())).toEqual({ tier: 'premium', userId: 'u1' })
  })

  it('a token with no subscription is the free tier, not anonymous', async () => {
    rows.user_api_keys = { user_id: 'u2' }
    expect(await getEntitlement(req())).toEqual({ tier: 'free', userId: 'u2' })
  })

  it('an unknown token is anonymous, flagged so the registry can say it changed', async () => {
    expect(await getEntitlement(req())).toEqual({ tier: 'anonymous', userId: null, tokenUnknown: true })
  })

  it('a revoked token is anonymous even with an active subscription', async () => {
    rows.user_api_keys = { user_id: 'u4', revoked: true }
    rows.user_subscriptions = { status: 'active', current_period_end: null }
    expect(await getEntitlement(req())).toEqual({ tier: 'anonymous', userId: null, tokenUnknown: true })
  })

  it('a lapsed subscription is free even with a valid token', async () => {
    rows.user_api_keys = { user_id: 'u3' }
    rows.user_subscriptions = { status: 'canceled', current_period_end: '2020-01-01T00:00:00Z' }
    expect(await getEntitlement(req())).toEqual({ tier: 'free', userId: 'u3' })
  })

  it('a live Lifetime row is premium with no subscription', async () => {
    rows.user_api_keys = { user_id: 'u5' }
    lifetimeRows = [{ user_id: 'u5', granted_at: '2026-10-29T10:00:00Z', revoked_at: null }]
    expect(await getEntitlement(req())).toEqual({ tier: 'premium', userId: 'u5' })
  })

  it('a revoked Lifetime row with a lapsed subscription is free', async () => {
    rows.user_api_keys = { user_id: 'u6' }
    rows.user_subscriptions = { status: 'canceled', current_period_end: '2020-01-01T00:00:00Z' }
    lifetimeRows = [{ user_id: 'u6', granted_at: '2026-10-29T10:00:00Z', revoked_at: '2026-10-30T10:00:00Z' }]
    expect(await getEntitlement(req())).toEqual({ tier: 'free', userId: 'u6' })
  })

  it('another user\'s Lifetime row grants nothing', async () => {
    rows.user_api_keys = { user_id: 'u7' }
    lifetimeRows = [{ user_id: 'someone-else', granted_at: '2026-10-29T10:00:00Z', revoked_at: null }]
    expect(await getEntitlement(req())).toEqual({ tier: 'free', userId: 'u7' })
  })
})
