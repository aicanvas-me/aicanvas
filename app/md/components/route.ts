import { COMPONENTS, isBlockEntry } from '../../lib/component-registry'
import { SITE_URL } from '../../lib/config'
import { classifyPremium } from '@/lib/registry/premium-gate'
import { markdownResponse } from '@/lib/agent-markdown/response'

// Markdown twin of /components: every component and block, grouped by
// category, each linking to its own markdown twin. Reached through the
// rewrites in next.config.ts (/components.md, or Accept: text/markdown).
export const dynamic = 'force-static'

export function GET() {
  const groups = new Map<string, string[]>()
  for (const c of COMPONENTS) {
    const category = c.tags.find((t) => t.accent)?.label ?? 'Other'
    const labels = [isBlockEntry(c) ? 'block' : null, classifyPremium(c.slug).isPremium ? 'Premium' : null]
      .filter(Boolean)
      .join(', ')
    const line = `- [${c.name}](${SITE_URL}/components/${c.slug}.md)${labels ? ` (${labels})` : ''}: ${c.description.replace(/\s+/g, ' ').trim()}`
    groups.set(category, [...(groups.get(category) ?? []), line])
  }

  const sections = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, lines]) => `## ${category}\n\n${lines.join('\n')}`)

  const body = [
    `> AI Canvas component index for agents. Full site index and install setup: ${SITE_URL}/llms.txt`,
    `# AI Canvas components and blocks`,
    `${COMPONENTS.length} animated React components and blocks, shadcn-compatible, built with Tailwind CSS and Motion. Free ones are MIT; Premium ones need a Premium subscription to install. Install any of them with \`npx shadcn@latest add @aicanvas/<slug>\`, or through the AI Canvas MCP server (${SITE_URL}/mcp). Each link below is that component's markdown page: description, install, props, and, for free components, the source and the remix prompt.`,
    ...sections,
  ].join('\n\n')

  return markdownResponse(body + '\n')
}
