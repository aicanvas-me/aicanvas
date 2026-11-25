import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Only the database clients, the zip files and the pull note are mocked: token parsing,
// the revoked filter, Lifetime and the tier derivation run for real (app/lib/entitlement.ts).
type Row = Record<string, unknown> | null
const rows: { user_api_keys: Row; user_subscriptions: Row } = { user_api_keys: null, user_subscriptions: null }
let lifetimeRows: Record<string, unknown>[] = []
const failing = new Set<string>()
function table(name: string) {
  const filters: [string, unknown][] = []
  const matches = (row: Record<string, unknown>) => filters.every(([c, v]) => !(c in row) || row[c] === v)
  const error = failing.has(name) ? { message: `${name} read failed` } : null
  const q = {
    select: () => q,
    eq: (col: string, val: unknown) => { filters.push([col, val]); return q },
    maybeSingle: async () => {
      if (error) return { data: null, error }
      const row = rows[name as keyof typeof rows]
      return { data: row !== null && matches(row) ? row : null, error: null }
    },
    then: (resolve: (v: { data: unknown; error: unknown }) => void) =>
      resolve(error ? { data: null, error } : { data: lifetimeRows.filter(matches), error: null }),
    update: () => ({ eq: () => ({ then: (cb: () => void) => Promise.resolve().then(cb) }) }),
  }
  return q
}
let sessionUser: { id: string } | null = null
vi.mock('@/app/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: (name: string) => table(name) }) }))
vi.mock('@/app/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: sessionUser } }) } }),
}))
vi.mock('@/app/lib/track-pull', () => ({ trackPull: vi.fn() }))

const ZIP = Buffer.from('PK\u0005\u0006 fake zip bytes')
const files: Record<string, Buffer | string> = {}
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(async (path: string, enc?: string) => {
    const name = String(path).split(/[\\/]/).pop()!
    if (!(name in files)) throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
    const v = files[name]
    return enc ? String(v) : Buffer.from(v)
  }),
}))

import { GET } from './route'
import { trackPull } from '@/app/lib/track-pull'

const TOKEN = 'aic_' + 'a'.repeat(48)
const get = (slug = 'whoosh', opts: { token?: string; query?: boolean } = {}) =>
  GET(
    new Request(`https://aicanvas.me/api/skills/${slug}/download${opts.query ? `?token=${opts.token}` : ''}`, {
      headers: opts.token && !opts.query ? { Authorization: `Bearer ${opts.token}` } : {},
    }),
    { params: Promise.resolve({ slug }) },
  )

beforeEach(() => {
  rows.user_api_keys = null
  rows.user_subscriptions = null
  lifetimeRows = []
  failing.clear()
  sessionUser = null
  for (const k of Object.keys(files)) delete files[k]
  files['_skills.json'] = JSON.stringify({ whoosh: { version: '1.0.0', sha256: 'abc', bytes: ZIP.length } })
  files['whoosh.zip'] = ZIP
  vi.mocked(trackPull).mockClear()
})
afterEach(() => { delete process.env.SKILL_DOWNLOADS })

const premiumToken = () => {
  rows.user_api_keys = { user_id: 'u1' }
  rows.user_subscriptions = { status: 'active', current_period_end: null }
}

describe('GET /api/skills/[slug]/download', () => {
  it('gives a Premium subscriber the zip, never shared-cached, and notes the pull with the version', async () => {
    premiumToken()
    const res = await get('whoosh', { token: TOKEN })
    expect(res.status).toBe(200)
    expect(Buffer.from(await res.arrayBuffer())).toEqual(ZIP)
    expect(res.headers.get('Content-Type')).toBe('application/zip')
    expect(res.headers.get('Cache-Control')).toBe('private, no-store')
    expect(res.headers.get('X-AICanvas-Skill-Version')).toBe('1.0.0')
    expect(res.headers.get('X-AICanvas-Skill-Sha256')).toBe('abc')
    expect(trackPull).toHaveBeenCalledWith('u1', 'whoosh@1.0.0', 'skill')
  })

  it('gives a Lifetime buyer with no subscription the zip', async () => {
    rows.user_api_keys = { user_id: 'u2' }
    lifetimeRows = [{ user_id: 'u2', granted_at: '2026-11-10T00:00:00Z', revoked_at: null }]
    expect((await get('whoosh', { token: TOKEN })).status).toBe(200)
  })

  it('gives a signed-in Premium browser session the zip', async () => {
    sessionUser = { id: 'u5' }
    rows.user_subscriptions = { status: 'active', current_period_end: null }
    expect((await get()).status).toBe(200)
  })

  it('refuses a free account (403) and a signed-out caller (401), both with the upgrade link', async () => {
    rows.user_api_keys = { user_id: 'u3' }
    const free = await get('whoosh', { token: TOKEN })
    expect(free.status).toBe(403)
    expect((await free.json()).upgrade).toContain('/pricing')
    const anon = await get()
    expect(anon.status).toBe(401)
    expect((await anon.json()).error).toBe('sign-in-required')
  })

  it('refuses a revoked token and a rotated one, saying the token changed', async () => {
    rows.user_api_keys = { user_id: 'u4', revoked: true }
    rows.user_subscriptions = { status: 'active', current_period_end: null }
    const revoked = await get('whoosh', { token: TOKEN })
    expect(revoked.status).toBe(401)
    expect((await revoked.json()).error).toBe('token-changed')
    rows.user_api_keys = null
    expect((await get('whoosh', { token: 'aic_' + 'b'.repeat(48) })).status).toBe(401)
  })

  it('answers 503, never free and never a grant, when an entitlement read fails', async () => {
    premiumToken()
    failing.add('user_api_keys')
    expect((await get('whoosh', { token: TOKEN })).status).toBe(503)
    failing.clear()
    rows.user_api_keys = { user_id: 'u6' }
    failing.add('user_subscriptions')
    failing.add('user_lifetime_access')
    expect((await get('whoosh', { token: TOKEN })).status).toBe(503)
    expect(trackPull).not.toHaveBeenCalled()
  })

  it('refuses a token in the address, even a Premium one', async () => {
    premiumToken()
    const res = await get('whoosh', { token: TOKEN, query: true })
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('token-in-url')
  })

  it('answers 404 for an unknown or malformed slug, 503 when the build has no skill zips', async () => {
    premiumToken()
    expect((await get('nope', { token: TOKEN })).status).toBe(404)
    expect((await get('..%2Fsecret', { token: TOKEN })).status).toBe(404)
    expect((await get('__proto__', { token: TOKEN })).status).toBe(404)
    delete files['_skills.json']
    expect((await get('whoosh', { token: TOKEN })).status).toBe(503)
  })

  it('the kill switch answers 503 before reading anything', async () => {
    premiumToken()
    process.env.SKILL_DOWNLOADS = 'off'
    expect((await get('whoosh', { token: TOKEN })).status).toBe(503)
  })
})
