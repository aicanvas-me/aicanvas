import { describe, it, expect, afterEach, vi } from 'vitest'

vi.mock('@/app/lib/supabase/admin', () => ({ createAdminClient: () => ({}) }))

import { GET } from './route'
import { GET as resourceGET } from '../../oauth-protected-resource/[[...path]]/route'

afterEach(() => {
  delete process.env.HOSTED_MCP
  delete process.env.HOSTED_MCP_OAUTH
})

describe('authorization server metadata', () => {
  it('answers 404 while sign-in is off', () => {
    process.env.HOSTED_MCP = 'on'
    expect(GET(new Request('https://mcp.aicanvas.me/.well-known/oauth-authorization-server')).status).toBe(404)
  })

  it('names its own endpoints, S256 only, public clients, and the issuer the resource document points at', async () => {
    process.env.HOSTED_MCP = 'on'
    process.env.HOSTED_MCP_OAUTH = 'on'
    const meta = await GET(new Request('https://mcp.aicanvas.me/.well-known/oauth-authorization-server')).json()
    const prm = await resourceGET(new Request('https://mcp.aicanvas.me/.well-known/oauth-protected-resource')).json()
    expect(meta.issuer).toBe(prm.authorization_servers[0])
    expect(meta).toMatchObject({
      authorization_endpoint: 'https://mcp.aicanvas.me/authorize',
      token_endpoint: 'https://mcp.aicanvas.me/token',
      registration_endpoint: 'https://mcp.aicanvas.me/register',
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none'],
    })
  })

  it('answers the same document at the path form, and points local runs at /api/mcp/oauth', async () => {
    process.env.HOSTED_MCP = 'on'
    process.env.HOSTED_MCP_OAUTH = 'on'
    const root = await GET(new Request('http://localhost:3001/.well-known/oauth-authorization-server')).json()
    const path = await GET(new Request('http://localhost:3001/.well-known/oauth-authorization-server/api/mcp')).json()
    expect(path).toEqual(root)
    expect(root.token_endpoint).toBe('http://localhost:3001/api/mcp/oauth/token')
  })
})
