import { after } from 'next/server'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { createServer } from '@/mcp/src/tools'
import mcpPackage from '@/mcp/package.json'
import { agentContext, HOSTED_INSTRUCTIONS } from '@/app/lib/agent-context'
import { phCapture } from '@/app/lib/analytics-server'
import { agentForAccessToken, endConnection, isAccessToken, resourceMetadataUrl, siteOriginFor } from '@/app/lib/mcp-oauth'
import { hostedMcpEnabled, hostedMcpOAuthEnabled } from '@/lib/flags'
import { isWellFormedToken } from '@/lib/identity/token'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// The hosted MCP server (mcp.aicanvas.me). Stateless streamable HTTP: every request carries
// its credential and gets a fresh server, so the account's plan and token are read live on
// each call and an upgrade, a lapse or a rotated token applies on the same connection.
// Ships dark: HOSTED_MCP=on turns it on, anything else answers 404 (kill switch).

type Unauthorized = 'missing' | 'unknown_key' | 'ended_sign_in'

const DESCRIPTIONS: Record<Unauthorized, string> = {
  missing: 'Sign in to AI Canvas to use this server. Setup: https://aicanvas.me/mcp',
  unknown_key:
    'This AI Canvas key matches no account, usually because it was rotated. Sign in again, or use the current key from https://aicanvas.me/account/settings.',
  ended_sign_in: 'This AI Canvas sign-in has ended. Sign in again from your agent.',
}

// With sign-in on, every 401 names the discovery document, which is how an agent finds the
// browser sign-in (MCP authorization spec, RFC 9728). Without it the server takes keys only.
function unauthorized(req: Request, reason: Unauthorized): Response {
  const error = reason === 'missing' ? 'invalid_request' : 'invalid_token'
  const challenge = hostedMcpOAuthEnabled()
    ? `Bearer resource_metadata="${resourceMetadataUrl(new URL(req.url))}"${reason === 'missing' ? '' : `, error="${error}"`}`
    : `Bearer realm="aicanvas", error="${error}"`
  return Response.json(
    { error, error_description: DESCRIPTIONS[reason] },
    { status: 401, headers: { 'WWW-Authenticate': challenge } },
  )
}

function unavailable(err: unknown): Response {
  console.error('[hosted mcp] account read failed:', err)
  return Response.json({ error: 'temporarily_unavailable', error_description: 'Please retry shortly.' }, { status: 503 })
}

async function handle(req: Request): Promise<Response> {
  if (!hostedMcpEnabled()) return Response.json({ error: 'not found' }, { status: 404 })

  const auth = req.headers.get('authorization') ?? ''
  let bearer = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : ''

  // An AI agent's sign-in: our own token, swapped for the account's current API key, then
  // on as a key caller. It never reaches Supabase Auth or the data API.
  let grantId: string | null = null
  if (hostedMcpOAuthEnabled() && isAccessToken(bearer)) {
    let agent
    try {
      agent = await agentForAccessToken(bearer, new URL(req.url))
    } catch (err) {
      return unavailable(err)
    }
    if (!agent?.key) return unauthorized(req, 'ended_sign_in')
    bearer = agent.key
    grantId = agent.grantId
  }

  // An API key (aic_...) is the headless way in: CI, a remote shell, anything without a browser.
  if (!isWellFormedToken(bearer)) return unauthorized(req, 'missing')

  let ctx
  try {
    ctx = await agentContext(bearer, siteOriginFor(new URL(req.url)))
  } catch (err) {
    return unavailable(err)
  }
  if (!ctx) return unauthorized(req, grantId ? 'ended_sign_in' : 'unknown_key')

  if (grantId) {
    const id = grantId
    ctx.disconnect = () => endConnection(id)
  }
  // Anonymous usage count: how hosted calls sign in, nothing about who (constant distinct id).
  const signedInWith = grantId ? 'agent' : 'key'
  after(() => phCapture('mcp_hosted_call', { auth: signedInWith }))

  const server = createServer(ctx, { version: mcpPackage.version, instructions: HOSTED_INSTRUCTIONS })
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })
  await server.connect(transport)
  return transport.handleRequest(req)
}

export { handle as GET, handle as POST, handle as DELETE }
