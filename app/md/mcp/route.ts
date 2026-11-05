import { SITE_URL } from '@/app/lib/config'
import { HOSTED_MCP_URL } from '@/app/lib/hosted-mcp'
import { mcpMarkdown } from '@/lib/agent-markdown/site'
import { markdownResponse } from '@/lib/agent-markdown/response'
import { hostedMcpOAuthEnabled } from '@/lib/flags'

// Markdown twin of /mcp. Signed-out view: plain install commands, no token. The hosted
// sign-in section follows the same flag as the page; the two change together.
export const dynamic = 'force-static'

export function GET() {
  return markdownResponse(mcpMarkdown({ siteUrl: SITE_URL, hostedUrl: hostedMcpOAuthEnabled() ? HOSTED_MCP_URL : null }))
}
