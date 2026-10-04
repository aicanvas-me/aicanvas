import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Only the identity layer is stubbed. The registry reads the REAL registry-data/ files through
// the real /r handler in process, so these cases prove what an agent receives end to end.
vi.mock('@/app/lib/entitlement', () => ({ getEntitlement: vi.fn() }))
vi.mock('@/app/lib/track-pull', () => ({ trackPull: vi.fn() }))
// The admin client answers the browser sign-in checks: Supabase's verdict on the sign-in
// (getUser) and the account's current API key (user_api_keys).
const admin = vi.hoisted(() => ({
  getUser: vi.fn(),
  key: { data: null, error: null } as { data: { token: string } | null; error: unknown },
}))
vi.mock('@/app/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    auth: {
      getUser: admin.getUser,
      admin: { getUserById: async () => ({ data: { user: { email: 'maria@example.com' } } }) },
    },
    from: () => {
      const query = { select: () => query, eq: () => query, maybeSingle: async () => admin.key }
      return query
    },
  }),
}))

import { POST } from './route'
import { getEntitlement } from '@/app/lib/entitlement'
import { trackPull } from '@/app/lib/track-pull'

const mockedGetEntitlement = vi.mocked(getEntitlement)
const TOKEN = 'aic_' + 'c'.repeat(48)
const FREE_SLUG = 'peel-corner-reveal'
const PREMIUM_SLUG = 'filter-menu'

function rpc(method: string, params: unknown, auth: string | null = `Bearer ${TOKEN}`) {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    accept: 'application/json, text/event-stream',
  }
  if (auth) headers.authorization = auth
  return POST(
    new Request('https://mcp.aicanvas.me/', {
      method: 'POST',
      headers,
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    }),
  )
}

async function call(name: string, args: Record<string, unknown> = {}) {
  const res = await rpc('tools/call', { name, arguments: args })
  expect(res.status).toBe(200)
  const body = await res.json()
  return body.result as {
    content: Array<{ text: string }>
    structuredContent?: Record<string, unknown>
    isError?: boolean
  }
}

function asPlan(tier: 'free' | 'premium') {
  mockedGetEntitlement.mockResolvedValue({ tier, userId: 'user-1' })
}

beforeEach(() => {
  process.env.HOSTED_MCP = 'on'
  mockedGetEntitlement.mockReset()
  vi.mocked(trackPull).mockReset()
})

afterEach(() => {
  delete process.env.HOSTED_MCP
  delete process.env.HOSTED_MCP_OAUTH
  delete process.env.FREE_ACCOUNT_GATE
})

describe('hosted MCP: the door', () => {
  it('answers 404 while HOSTED_MCP is off', async () => {
    delete process.env.HOSTED_MCP
    const res = await rpc('tools/list', {})
    expect(res.status).toBe(404)
    expect(mockedGetEntitlement).not.toHaveBeenCalled()
  })

  it('asks for a credential with a 401 when none is sent', async () => {
    const res = await rpc('tools/list', {}, null)
    expect(res.status).toBe(401)
    expect(res.headers.get('WWW-Authenticate')).toContain('Bearer')
    expect(mockedGetEntitlement).not.toHaveBeenCalled()
  })

  it('answers invalid_token when the key matches no account (rotated)', async () => {
    mockedGetEntitlement.mockResolvedValue({ tier: 'anonymous', userId: null, tokenUnknown: true })
    const res = await rpc('tools/list', {})
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe('invalid_token')
  })

  it('answers 503, never a downgrade, when the subscription read fails', async () => {
    mockedGetEntitlement.mockRejectedValue(new Error('db down'))
    const res = await rpc('tools/list', {})
    expect(res.status).toBe(503)
  })

  it('initializes with instructions for the agent', async () => {
    asPlan('free')
    const res = await rpc('initialize', {
      protocolVersion: '2025-03-26',
      capabilities: {},
      clientInfo: { name: 'test', version: '0' },
    })
    const body = await res.json()
    expect(body.result.serverInfo.name).toBe('aicanvas-mcp')
    expect(body.result.instructions).toContain('get_install_command')
  })

  it('lists whoami next to the shared tools', async () => {
    asPlan('free')
    const res = await rpc('tools/list', {})
    const names = (await res.json()).result.tools.map((t: { name: string }) => t.name)
    expect(names).toContain('whoami')
    expect(names).toContain('get_install_command')
  })
})

describe('hosted MCP: browser sign-in', () => {
  const STORED_KEY = 'aic_' + 'a'.repeat(48)
  const jwt = (claims: Record<string, unknown>) =>
    ['header', Buffer.from(JSON.stringify(claims)).toString('base64url'), 'signature'].join('.')
  const AGENT = jwt({ sub: 'user-1', client_id: 'client-1' })
  const WEBSITE = jwt({ sub: 'user-1' })

  beforeEach(() => {
    process.env.HOSTED_MCP_OAUTH = 'on'
    admin.getUser.mockReset()
    admin.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    admin.key = { data: { token: STORED_KEY }, error: null }
  })

  it('points an agent with no credential at the discovery document', async () => {
    const res = await rpc('tools/list', {}, null)
    expect(res.status).toBe(401)
    expect(res.headers.get('WWW-Authenticate')).toBe(
      'Bearer resource_metadata="https://mcp.aicanvas.me/.well-known/oauth-protected-resource"',
    )
  })

  it('serves a signed-in agent with the account\'s current API key', async () => {
    asPlan('free')
    const res = await rpc('tools/list', {}, `Bearer ${AGENT}`)
    expect(res.status).toBe(200)
    const sent = mockedGetEntitlement.mock.calls[0][0] as Request
    expect(sent.headers.get('authorization')).toBe(`Bearer ${STORED_KEY}`)
  })

  it('refuses a website session token, which names no agent, without asking Supabase', async () => {
    const res = await rpc('tools/list', {}, `Bearer ${WEBSITE}`)
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe('invalid_token')
    expect(admin.getUser).not.toHaveBeenCalled()
  })

  it('refuses a sign-in that has ended, and says how to sign in again', async () => {
    admin.getUser.mockResolvedValue({ data: { user: null }, error: { status: 400, message: 'Auth session missing!' } })
    const res = await rpc('tools/list', {}, `Bearer ${AGENT}`)
    expect(res.status).toBe(401)
    expect(res.headers.get('WWW-Authenticate')).toContain('error="invalid_token"')
    expect(res.headers.get('WWW-Authenticate')).toContain('resource_metadata=')
    expect(mockedGetEntitlement).not.toHaveBeenCalled()
  })

  it('answers 503, never a sign-in prompt, when Supabase cannot answer', async () => {
    admin.getUser.mockResolvedValue({ data: { user: null }, error: { status: 0, message: 'fetch failed' } })
    const res = await rpc('tools/list', {}, `Bearer ${AGENT}`)
    expect(res.status).toBe(503)
  })

  it('refuses a signed-in account that has no live API key', async () => {
    admin.key = { data: null, error: null }
    const res = await rpc('tools/list', {}, `Bearer ${AGENT}`)
    expect(res.status).toBe(401)
    expect(mockedGetEntitlement).not.toHaveBeenCalled()
  })

  it('takes keys only while HOSTED_MCP_OAUTH is off', async () => {
    delete process.env.HOSTED_MCP_OAUTH
    const res = await rpc('tools/list', {}, `Bearer ${AGENT}`)
    expect(res.status).toBe(401)
    expect(res.headers.get('WWW-Authenticate')).toBe('Bearer realm="aicanvas", error="invalid_request"')
    expect(admin.getUser).not.toHaveBeenCalled()
  })

  it('still takes an API key with sign-in on', async () => {
    asPlan('premium')
    const res = await rpc('tools/list', {})
    expect(res.status).toBe(200)
    expect(admin.getUser).not.toHaveBeenCalled()
  })
})

describe('hosted MCP: a free account', () => {
  beforeEach(() => asPlan('free'))

  it('labels premium items locked and free items included, with no command on a locked one', async () => {
    const r = await call('list_components', { limit: 200 })
    const items = r.structuredContent!.components as Array<{ slug: string; access: string; installCommand?: string }>
    const premium = items.find((c) => c.slug === PREMIUM_SLUG)!
    const free = items.find((c) => c.slug === FREE_SLUG)!
    expect(premium.access).toBe('locked')
    expect(premium.installCommand).toBeUndefined()
    expect(free.access).toBe('included')
    expect(free.installCommand).toContain(`token=${TOKEN}`)
  })

  it('returns a preview and an upgrade line for a locked component, never a placeholder as source', async () => {
    const r = await call('get_component', { slug: PREMIUM_SLUG })
    expect(r.isError).toBeFalsy()
    expect(r.content[0].text).toContain('(locked)')
    expect(r.content[0].text).toContain('https://aicanvas.me/pricing')
    expect(r.structuredContent!.code).toBeUndefined()
  })

  it('refuses an install command for a locked component', async () => {
    const r = await call('get_install_command', { slug: PREMIUM_SLUG })
    expect(r.isError).toBe(true)
    expect(r.content[0].text).toContain('https://aicanvas.me/pricing')
  })

  it('returns the real source of a free component through /r in process', async () => {
    process.env.FREE_ACCOUNT_GATE = 'on' // as in production: the gate resolves the caller
    const r = await call('get_component', { slug: FREE_SLUG })
    expect(r.isError).toBeFalsy()
    expect(String(r.structuredContent!.code)).toContain('export default')
    expect(vi.mocked(trackPull)).toHaveBeenCalledWith('user-1', FREE_SLUG, 'standalone')
  })

  it('hands out an install command that carries the key', async () => {
    const r = await call('get_install_command', { slug: FREE_SLUG })
    expect(r.structuredContent!.installCommand).toBe(
      `npx shadcn@latest add "https://aicanvas.me/r/${FREE_SLUG}.json?token=${TOKEN}"`,
    )
  })

  it('says who is signed in and on which plan', async () => {
    const r = await call('whoami')
    expect(r.content[0].text).toContain('maria@example.com')
    expect(r.structuredContent).toEqual({ email: 'maria@example.com', plan: 'free' })
  })
})

describe('hosted MCP: a premium account', () => {
  beforeEach(() => asPlan('premium'))

  it('gets the real source of a premium component', async () => {
    const r = await call('get_component', { slug: PREMIUM_SLUG })
    expect(r.isError).toBeFalsy()
    expect(r.content[0].text).not.toContain('(locked)')
    expect(String(r.structuredContent!.code)).toContain('export default')
    expect(String(r.structuredContent!.code)).not.toContain('PREMIUM_NOTICE')
  })

  it('labels everything included', async () => {
    const r = await call('list_components', { limit: 200 })
    const items = r.structuredContent!.components as Array<{ access: string }>
    expect(items.every((c) => c.access === 'included')).toBe(true)
  })
})
