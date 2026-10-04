import { issuerFor, resourceFor } from '@/app/lib/mcp-oauth'
import { hostedMcpOAuthEnabled } from '@/lib/flags'

export const dynamic = 'force-dynamic'

// RFC 9728 protected-resource metadata: tells an agent where the hosted MCP signs people
// in (its own authorization server, same origin). Answers at the root and at the /api/mcp path form, on either host.
export function GET(req: Request): Response {
  if (!hostedMcpOAuthEnabled()) return Response.json({ error: 'not found' }, { status: 404 })
  return Response.json(
    {
      resource: resourceFor(new URL(req.url)),
      authorization_servers: [issuerFor(new URL(req.url))],
      bearer_methods_supported: ['header'],
      resource_name: 'AI Canvas',
      resource_documentation: 'https://aicanvas.me/mcp',
    },
    { headers: { 'access-control-allow-origin': '*' } },
  )
}
