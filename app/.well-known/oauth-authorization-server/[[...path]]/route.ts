import { authorizationServerMetadata } from '@/app/lib/mcp-oauth'
import { hostedMcpOAuthEnabled } from '@/lib/flags'

export const dynamic = 'force-dynamic'

// RFC 8414 metadata for the hosted MCP's own sign-in. The root form is what agents read
// after the protected-resource document; any path form answers the same, for agents that
// fall back to the MCP address itself.
export function GET(req: Request): Response {
  if (!hostedMcpOAuthEnabled()) return Response.json({ error: 'not found' }, { status: 404 })
  return Response.json(authorizationServerMetadata(new URL(req.url)), { headers: { 'access-control-allow-origin': '*' } })
}
