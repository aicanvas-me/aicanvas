import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { createServer } from '@/mcp/src/tools'
import mcpPackage from '@/mcp/package.json'
import { agentContext, HOSTED_INSTRUCTIONS } from '@/app/lib/agent-context'
import { hostedMcpEnabled } from '@/lib/flags'
import { isWellFormedToken } from '@/lib/identity/token'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// The hosted MCP server (mcp.aicanvas.me). Stateless streamable HTTP: every request carries
// its credential and gets a fresh server, so the account's plan and token are read live on
// each call and an upgrade, a lapse or a rotated token applies on the same connection.
// Ships dark: HOSTED_MCP=on turns it on, anything else answers 404 (kill switch).

function unauthorized(error: 'invalid_request' | 'invalid_token'): Response {
  return Response.json(
    {
      error,
      error_description:
        error === 'invalid_token'
          ? 'This AI Canvas key matches no account, usually because it was rotated. Sign in again, or use the current key from https://aicanvas.me/account/settings.'
          : 'Sign in to AI Canvas to use this server. Setup: https://aicanvas.me/mcp',
    },
    { status: 401, headers: { 'WWW-Authenticate': `Bearer realm="aicanvas", error="${error}"` } },
  )
}

async function handle(req: Request): Promise<Response> {
  if (!hostedMcpEnabled()) return Response.json({ error: 'not found' }, { status: 404 })

  const auth = req.headers.get('authorization') ?? ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : ''
  // An API key (aic_...) is the headless way in: CI, a remote shell, anything without a browser.
  if (!isWellFormedToken(bearer)) return unauthorized('invalid_request')

  let ctx
  try {
    ctx = await agentContext(bearer)
  } catch (err) {
    console.error('[hosted mcp] entitlement read failed:', err)
    return Response.json({ error: 'temporarily_unavailable', error_description: 'Please retry shortly.' }, { status: 503 })
  }
  if (!ctx) return unauthorized('invalid_token')

  const server = createServer(ctx, { version: mcpPackage.version, instructions: HOSTED_INSTRUCTIONS })
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })
  await server.connect(transport)
  return transport.handleRequest(req)
}

export { handle as GET, handle as POST, handle as DELETE }
