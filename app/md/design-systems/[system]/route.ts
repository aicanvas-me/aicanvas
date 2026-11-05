import { systemMarkdown } from '@/lib/agent-markdown/design-system'
import { markdownResponse } from '@/lib/agent-markdown/response'
import { systemInput, systemSlugs } from '../_systems'

// Markdown twin of /design-systems/<system>. Reached through the rewrites in
// next.config.ts; static and anonymous like every twin.
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return systemSlugs().map((system) => ({ system }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ system: string }> }) {
  const { system } = await params
  const input = systemInput(system)
  if (!input) return new Response('Not found\n', { status: 404 })
  return markdownResponse(systemMarkdown(input))
}
