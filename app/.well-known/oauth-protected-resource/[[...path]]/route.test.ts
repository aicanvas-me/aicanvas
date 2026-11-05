import { describe, it, expect, afterEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/app/lib/supabase/admin', () => ({ createAdminClient: () => ({}) }))

import { GET } from './route'

afterEach(() => {
  delete process.env.HOSTED_MCP
  delete process.env.HOSTED_MCP_OAUTH
})

describe('protected-resource metadata', () => {
  it('answers 404 while sign-in is off', async () => {
    process.env.HOSTED_MCP = 'on'
    expect(GET(new Request('https://mcp.aicanvas.me/.well-known/oauth-protected-resource')).status).toBe(404)
  })

  it('names the MCP address and its own origin as the sign-in server', async () => {
    process.env.HOSTED_MCP = 'on'
    process.env.HOSTED_MCP_OAUTH = 'on'
    const res = GET(new Request('https://mcp.aicanvas.me/.well-known/oauth-protected-resource'))
    const body = await res.json()
    expect(body.resource).toBe('https://mcp.aicanvas.me')
    expect(body.authorization_servers).toEqual(['https://mcp.aicanvas.me'])
  })

  it('names the /api/mcp address on any other host, for local and preview testing', async () => {
    process.env.HOSTED_MCP = 'on'
    process.env.HOSTED_MCP_OAUTH = 'on'
    const res = GET(new Request('http://localhost:3021/.well-known/oauth-protected-resource/api/mcp'))
    expect((await res.json()).resource).toBe('http://localhost:3021/api/mcp')
  })
})
