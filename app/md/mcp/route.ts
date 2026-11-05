import { SITE_URL } from '@/app/lib/config'
import { mcpMarkdown } from '@/lib/agent-markdown/site'
import { markdownResponse } from '@/lib/agent-markdown/response'

// Markdown twin of /mcp. Signed-out view: plain install commands, no token.
// When the hosted MCP ships, this and app/mcp/page.tsx change together.
export const dynamic = 'force-static'

export function GET() {
  return markdownResponse(mcpMarkdown({ siteUrl: SITE_URL }))
}
