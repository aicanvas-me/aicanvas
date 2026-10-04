import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createHash } from 'node:crypto'

// An in-memory stand-in for the few PostgREST calls mcp-oauth makes, so the token rules
// (single-use codes, PKCE, refresh rotation and its grace window) run for real.
type Row = Record<string, unknown>
const db = vi.hoisted(() => ({ tables: {} as Record<string, Row[]> }))

class Query {
  private filters: Array<(r: Row) => boolean> = []
  private op: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private values: Row = {}
  constructor(private table: string) {}
  select() {
    return this
  }
  insert(row: Row) {
    this.op = 'insert'
    this.values = row
    return this
  }
  update(values: Row) {
    this.op = 'update'
    this.values = values
    return this
  }
  delete() {
    this.op = 'delete'
    return this
  }
  eq(col: string, v: unknown) {
    this.filters.push((r) => r[col] === v)
    return this
  }
  is(col: string, v: unknown) {
    this.filters.push((r) => (r[col] ?? null) === v)
    return this
  }
  lt(col: string, v: string) {
    this.filters.push((r) => typeof r[col] === 'string' && (r[col] as string) < v)
    return this
  }
  private run() {
    const rows = (db.tables[this.table] ??= [])
    if (this.op === 'insert') {
      const clash = rows.some((r) => r.request_nonce === this.values.request_nonce || r.code_hash === this.values.code_hash)
      if (clash) return { data: null, error: { code: '23505' } }
      rows.push({ id: `grant-${rows.length + 1}`, ...this.values })
      return { data: null, error: null }
    }
    const hits = rows.filter((r) => this.filters.every((f) => f(r)))
    if (this.op === 'update') hits.forEach((r) => Object.assign(r, this.values))
    if (this.op === 'delete') db.tables[this.table] = rows.filter((r) => !hits.includes(r))
    return { data: hits.map((r) => ({ ...r })), error: null }
  }
  maybeSingle() {
    const { data } = this.run()
    return Promise.resolve({ data: data?.[0] ?? null, error: null })
  }
  then<T>(resolve: (v: ReturnType<Query['run']>) => T, reject?: (e: unknown) => T) {
    return Promise.resolve(this.run()).then(resolve, reject)
  }
}

vi.mock('@/app/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: (t: string) => new Query(t) }) }))

import {
  agentForAccessToken,
  approve,
  authorize,
  cleanName,
  deny,
  exchange,
  readClient,
  readRequest,
  redirectMatches,
  registerClient,
  revoke,
} from './mcp-oauth'

const LOCAL = new URL('http://localhost:3001/api/mcp/oauth/authorize')
const PROD = new URL('https://mcp.aicanvas.me/authorize')
const CALLBACK = 'http://localhost:56486/callback'
const VERIFIER = 'v'.repeat(43)
const CHALLENGE = createHash('sha256').update(VERIFIER).digest('base64url')

function register(redirects = [CALLBACK], name = 'Claude Code (aicanvas)') {
  const r = registerClient({ client_name: name, redirect_uris: redirects, token_endpoint_auth_method: 'none' })
  if (!r.ok) throw new Error(r.description)
  return r.clientId
}

function authorizeUrl(base: URL, clientId: string, extra: Record<string, string> = {}) {
  const url = new URL(base)
  const params = {
    response_type: 'code',
    client_id: clientId,
    redirect_uri: CALLBACK,
    code_challenge: CHALLENGE,
    code_challenge_method: 'S256',
    state: 'st-1',
    resource: base.host === 'mcp.aicanvas.me' ? 'https://mcp.aicanvas.me/' : 'http://localhost:3001/api/mcp',
    ...extra,
  }
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return url
}

function pendingRequest(clientId: string, base = LOCAL) {
  const outcome = authorize(authorizeUrl(base, clientId), 'DE')
  if (outcome.kind !== 'redirect') throw new Error(outcome.message)
  const request = readRequest(new URL(outcome.location).searchParams.get('request'))
  if (!request) throw new Error('no request')
  return request
}

async function connect(clientId = register()) {
  const location = await approve(pendingRequest(clientId), 'user-1')
  const code = new URL(location!).searchParams.get('code')!
  const res = await exchange(
    new URLSearchParams({ grant_type: 'authorization_code', code, code_verifier: VERIFIER, client_id: clientId, redirect_uri: CALLBACK }),
    new URL('http://localhost:3001/api/mcp/oauth/token'),
    'DE',
  )
  return { clientId, code, res }
}

const TOKEN_URL = new URL('http://localhost:3001/api/mcp/oauth/token')
const MCP_URL = new URL('http://localhost:3001/api/mcp')
const refreshWith = (clientId: string, token: unknown) =>
  exchange(new URLSearchParams({ grant_type: 'refresh_token', refresh_token: String(token), client_id: clientId }), TOKEN_URL, null)

beforeEach(() => {
  process.env.MCP_OAUTH_SECRET = 's'.repeat(40)
  db.tables = { mcp_grants: [], user_api_keys: [{ user_id: 'user-1', token: 'aic_' + 'b'.repeat(48), revoked: false }] }
})

afterEach(() => vi.useRealTimers())

describe('registration', () => {
  it('signs a registration into a compact client_id and stores nothing', () => {
    const clientId = register()
    expect(clientId.length).toBeLessThan(300)
    expect(readClient(clientId)).toMatchObject({ n: 'Claude Code (aicanvas)', r: [CALLBACK] })
    expect(db.tables.mcp_grants).toHaveLength(0)
  })

  it('rejects a tampered client_id', () => {
    const clientId = register()
    expect(readClient(clientId.slice(0, 10) + (clientId[10] === 'A' ? 'B' : 'A') + clientId.slice(11))).toBeNull()
  })

  it('accepts https, http to this computer and app schemes; refuses the rest', () => {
    for (const ok of ['http://127.0.0.1:0/cb', 'http://localhost/cb', 'cursor://x/cb', 'https://claude.ai/api/mcp/auth_callback']) {
      expect(registerClient({ redirect_uris: [ok] }).ok).toBe(true)
    }
    for (const bad of ['http://evil.example/cb', 'javascript:alert(1)', 'data:text/html,x', 'https://a@b.example/', 'https://x.example/cb#frag', 'file:///etc']) {
      expect(registerClient({ redirect_uris: [bad] })).toMatchObject({ ok: false, error: 'invalid_redirect_uri' })
    }
    expect(registerClient({ redirect_uris: Array(6).fill(CALLBACK) }).ok).toBe(false)
    expect(registerClient({ redirect_uris: ['https://x.example/' + 'a'.repeat(300)] }).ok).toBe(false)
  })

  it('strips hidden and reversing characters from the name and caps it', () => {
    const rlo = String.fromCharCode(0x202e)
    const zwsp = String.fromCharCode(0x200b)
    expect(cleanName(`Claude${zwsp} ${rlo}edoC`)).toBe('Claude edoC')
    expect(cleanName('x'.repeat(500))).toHaveLength(64)
    expect(cleanName('')).toBe('An app')
  })

  it('matches a loopback redirect on any port, never across host names', () => {
    expect(redirectMatches('http://localhost:61234/callback', 'http://localhost:56486/callback')).toBe(true)
    expect(redirectMatches('http://127.0.0.1:5000/callback', 'http://localhost:5000/callback')).toBe(false)
    expect(redirectMatches('https://x.example:444/cb', 'https://x.example/cb')).toBe(false)
  })
})

describe('authorization request', () => {
  it('never redirects for an unknown client or an unregistered return address', () => {
    expect(authorize(authorizeUrl(LOCAL, 'nope.nope'), null).kind).toBe('error-page')
    expect(authorize(authorizeUrl(LOCAL, register(), { redirect_uri: 'http://localhost:1/other' }), null).kind).toBe('error-page')
  })

  it('sends PKCE and resource errors back to the agent', () => {
    const plain = authorize(authorizeUrl(LOCAL, register(), { code_challenge_method: 'plain' }), null)
    expect(plain.kind === 'redirect' && new URL(plain.location).searchParams.get('error')).toBe('invalid_request')
    const other = authorize(authorizeUrl(LOCAL, register(), { resource: 'https://other.example' }), null)
    expect(other.kind === 'redirect' && new URL(other.location).searchParams.get('error')).toBe('invalid_target')
  })

  it('accepts a resource with or without a trailing slash, never another path', () => {
    const slash = authorize(authorizeUrl(LOCAL, register(), { resource: 'http://localhost:3001/api/mcp/' }), null)
    expect(slash.kind === 'redirect' && slash.location.includes('/oauth/consent?request=')).toBe(true)
    const other = authorize(authorizeUrl(LOCAL, register(), { resource: 'http://localhost:3001/api/mcp/other' }), null)
    expect(other.kind === 'redirect' && new URL(other.location).searchParams.get('error')).toBe('invalid_target')
  })

  it('accepts the production address with or without its trailing slash', () => {
    const outcome = authorize(authorizeUrl(PROD, register()), null)
    expect(outcome.kind === 'redirect' && outcome.location.startsWith('https://aicanvas.me/oauth/consent?request=')).toBe(true)
  })

  it('signs the request for the consent page; tampered, expired or swapped blobs are refused', () => {
    const clientId = register()
    const outcome = authorize(authorizeUrl(LOCAL, clientId), 'DE')
    const signed = outcome.kind === 'redirect' ? new URL(outcome.location).searchParams.get('request')! : ''
    expect(readRequest(signed)).toMatchObject({ ru: CALLBACK, st: 'st-1', co: 'DE', res: 'http://localhost:3001/api/mcp' })
    expect(readRequest(signed.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A')))).toBeNull()
    expect(readRequest(clientId)).toBeNull() // a client_id never passes as a request
    vi.useFakeTimers({ now: Date.now() + 11 * 60 * 1000 })
    expect(readRequest(signed)).toBeNull()
  })

  it('Cancel sends access_denied with the state, and stores nothing', () => {
    const url = new URL(deny(pendingRequest(register())))
    expect(url.searchParams.get('error')).toBe('access_denied')
    expect(url.searchParams.get('state')).toBe('st-1')
    expect(db.tables.mcp_grants).toHaveLength(0)
  })

  it('a request can be answered once', async () => {
    const request = pendingRequest(register())
    expect(await approve(request, 'user-1')).toContain('code=aicm_ac_')
    expect(await approve(request, 'user-1')).toBeNull()
  })
})

describe('tokens', () => {
  it('a code with the right verifier gives a token pair that resolves to the current API key', async () => {
    const { res } = await connect()
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ token_type: 'Bearer', expires_in: 3600 })
    expect(res.connected).toMatchObject({ userId: 'user-1', browserCountry: 'DE', agentCountry: 'DE' })
    const agent = await agentForAccessToken(String(res.body.access_token), MCP_URL)
    expect(agent).toMatchObject({ userId: 'user-1', key: 'aic_' + 'b'.repeat(48) })
    expect(JSON.stringify(db.tables.mcp_grants)).not.toContain(String(res.body.access_token))
  })

  it('a code presented twice ends the connection it made', async () => {
    const { clientId, code, res } = await connect()
    const again = await exchange(
      new URLSearchParams({ grant_type: 'authorization_code', code, code_verifier: VERIFIER, client_id: clientId, redirect_uri: CALLBACK }),
      TOKEN_URL,
      null,
    )
    expect(again.body.error).toBe('invalid_grant')
    expect(await agentForAccessToken(String(res.body.access_token), MCP_URL)).toBeNull()
  })

  it('refuses a wrong verifier, another client, another return address, or an expired code', async () => {
    const clientId = register()
    const code = new URL((await approve(pendingRequest(clientId), 'user-1'))!).searchParams.get('code')!
    const base = { grant_type: 'authorization_code', code, code_verifier: VERIFIER, client_id: clientId, redirect_uri: CALLBACK }
    const tryWith = (over: Record<string, string>) => exchange(new URLSearchParams({ ...base, ...over }), TOKEN_URL, null)
    expect((await tryWith({ code_verifier: 'w'.repeat(43) })).body.error).toBe('invalid_grant')
    expect((await tryWith({ client_id: register([CALLBACK], 'Another agent') })).body.error).toBe('invalid_grant')
    expect((await tryWith({ redirect_uri: 'http://localhost:1/callback' })).body.error).toBe('invalid_grant')
    expect((await tryWith({ client_id: 'forged.id' })).status).toBe(401)
    vi.useFakeTimers({ now: Date.now() + 3 * 60 * 1000 })
    expect((await tryWith({})).body.error).toBe('invalid_grant')
  })

  it('refresh rotates; the previous token works once within 30 s; an older one is refused and noted', async () => {
    const { clientId, res } = await connect()
    const r1 = await refreshWith(clientId, res.body.refresh_token)
    expect(r1.status).toBe(200)
    // A second window refreshing with the same token inside the grace window still gets in.
    const r2 = await refreshWith(clientId, res.body.refresh_token)
    expect(r2.status).toBe(200)
    // Both windows' tokens stay usable: the newest rotates normally...
    expect((await refreshWith(clientId, r2.body.refresh_token)).status).toBe(200)
    // ...and a token two generations old is refused, the connection kept and flagged.
    vi.useFakeTimers({ now: Date.now() + 60 * 1000 })
    const stale = await refreshWith(clientId, r1.body.refresh_token)
    expect(stale.body.error).toBe('invalid_grant')
    expect(db.tables.mcp_grants).toHaveLength(1)
  })

  it('an old refresh token after the grace window is refused and flagged, the connection kept', async () => {
    const { clientId, res } = await connect()
    await refreshWith(clientId, res.body.refresh_token)
    vi.useFakeTimers({ now: Date.now() + 31 * 1000 })
    expect((await refreshWith(clientId, res.body.refresh_token)).body.error).toBe('invalid_grant')
    expect(db.tables.mcp_grants[0].stale_refresh_seen_at).toBeTruthy()
  })

  it('an access token is refused after an hour and on another server', async () => {
    const { res } = await connect()
    expect(await agentForAccessToken(String(res.body.access_token), new URL('https://mcp.aicanvas.me/'))).toBeNull()
    vi.useFakeTimers({ now: Date.now() + 61 * 60 * 1000 })
    expect(await agentForAccessToken(String(res.body.access_token), MCP_URL)).toBeNull()
  })

  it('revoke ends the connection from either token', async () => {
    const { res } = await connect()
    await revoke(String(res.body.refresh_token))
    expect(db.tables.mcp_grants).toHaveLength(0)
    expect(await agentForAccessToken(String(res.body.access_token), MCP_URL)).toBeNull()
  })
})
