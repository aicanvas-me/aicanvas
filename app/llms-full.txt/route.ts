import { COMPONENTS } from '../lib/component-registry'
import { SITE_URL } from '../lib/config'
import { ICON_CATEGORIES } from '../icons/_lib/categories'
import { icons } from '../icons/_lib/server-data'
import { classifyContent } from '@/lib/registry/content-type'
import { loadContentLookup } from '@/lib/registry/lookup'

export const dynamic = 'force-static'

function categoryOf(tags: { label: string; accent?: boolean }[]): string {
  return tags.find((t) => t.accent)?.label ?? 'Other'
}

export function GET() {
  const total = COMPONENTS.length

  const intro = `# AI Canvas

> AI Canvas is the design layer for AI coding agents: design systems your agent builds with and you reshape to your project, plus ${total} standalone React components and blocks that fit any of them, all installed as editable source with shadcn or MCP. The free library is MIT, and Premium components, design systems, and templates are proprietary. Many components include an AI remix prompt for recreating a variation in an AI builder. For free components, the full prompt is public. For premium components and blocks, the setup and constants are public, while the rest of the build specification requires a Premium subscription.

## Overview
- [Homepage](${SITE_URL}): Design systems and standalone React components for AI coding agents.
- [All components](${SITE_URL}/components): Browse ${total} standalone shadcn components and blocks for React.
- [About](${SITE_URL}/about): Learn how AI Canvas works with Claude Code, Cursor, and Codex.
- [Registry index](${SITE_URL}/r/registry.json): Machine-readable registry index.

## Install
Install command: \`npx shadcn@latest add @aicanvas/<component-name>\`. One-command installs require a free AI Canvas account: signed out, the command exits 0 but writes a placeholder file titled "(free account required)" instead of the real component. To authenticate, sign in and copy your token from ${SITE_URL}/account/settings, set AICANVAS_TOKEN in .env.local, and add \`{ "registries": { "@aicanvas": { "url": "${SITE_URL}/r/{name}.json", "params": { "token": "\${AICANVAS_TOKEN}" } } } }\` to components.json. Full setup notes: ${SITE_URL}/llms.txt

No account needed to read: every free component's complete source is inlined below and can be copied into a project directly.
`

  const parts: string[] = [intro, '## Components']

  for (const c of COMPONENTS) {
    const category = categoryOf(c.tags)
    const installLabel =
      c.badge === 'Premium'
        ? 'Install (Premium, requires an AI Canvas token):'
        : 'Install (free account):'
    const head = `---\n\n## ${c.name}\n\nCategory: ${category}\nSlug: \`${c.slug}\`\nURL: ${SITE_URL}/components/${c.slug}\n\n${c.description}\n\n${installLabel}\n\n\`\`\`bash\nnpx shadcn@latest add @aicanvas/${c.slug}\n\`\`\``
    // Premium (closed-source) components carry badge:'Premium' (set by the inject
    // shim). This route is PUBLIC + un-authenticated, so it must NEVER emit their
    // source — list them for discovery, but withhold the bytes (the /r gate is the
    // only place premium source is served, and only to a premium token). Free
    // components keep their full source here, unchanged.
    parts.push(
      c.badge === 'Premium'
        ? `${head}\n\n_Premium component — source is gated. Preview, details, and install at ${SITE_URL}/components/${c.slug}._`
        : `${head}\n\n\`\`\`tsx\n${c.code}\n\`\`\``,
    )
  }

  // Names only, never geometry: install and usage notes are in llms.txt.
  if (icons.length) {
    const lookup = loadContentLookup()
    const tier = (slug: string) => (classifyContent(slug, lookup) === 'standalone' ? 'free account' : 'Premium')
    const byCategory = ICON_CATEGORIES.map(([slug, label]) => {
      const names = icons.filter((icon) => icon.category === slug).map((icon) => icon.name)
      return names.length ? `${label}: ${names.join(', ')}` : ''
    }).filter(Boolean)
    parts.push(`---\n\n## Icons\n\n${icons.length} React icons at ${SITE_URL}/icons, four styles each: Line (${tier('icon-search')}), Duotone, Solid and Solid duotone (${tier('icon-search-duotone')}). Install one with \`npx shadcn@latest add @aicanvas/icon-<name>\` (add -duotone, -solid or -solid-duotone for the other styles). Setup and usage: ${SITE_URL}/llms.txt\n\n${byCategory.join('\n\n')}`)
  }

  const body = parts.join('\n\n') + '\n'

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
