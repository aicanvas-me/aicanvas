import { COMPONENTS } from '../lib/component-registry'
import { COLLECTIONS, collectionMembers } from '../lib/collections'
import { SITE_URL } from '../lib/config'
import { DESIGN_SYSTEMS } from '../../scripts/lib/design-systems.config.mjs'
import { existsSync } from 'fs'

export const dynamic = 'force-static'

function categoryOf(tags: { label: string; accent?: boolean }[]): string {
  return tags.find((t) => t.accent)?.label ?? 'Other'
}

export function GET() {
  const total = COMPONENTS.length

  const intro = `# AI Canvas

> AI Canvas is an open-core, shadcn-compatible registry of ${total} animated React components, design systems, and templates built with Tailwind CSS and Motion. The free library is MIT, and Premium components, design systems, and templates are proprietary. Many components ship with a comprehensive AI remix prompt, so developers can install the code directly or recreate their own variation in any AI builder. On free components that prompt is public in full; on premium components and blocks only part of it is public (the setup and the constants), and the rest of the build spec requires a Premium subscription.

## Overview
- [Homepage](${SITE_URL}): Browse all components.
- [All components](${SITE_URL}/components): Full component list.
- [About](${SITE_URL}/about): About AI Canvas.
- [Registry index](${SITE_URL}/r/registry.json): Machine-readable registry index.

## Install
Install command: \`npx shadcn@latest add @aicanvas/<component-name>\`. The @aicanvas registry is listed in the official shadcn directory, so the CLI resolves it with no extra setup.

One-command installs require a free AI Canvas account. Signed out, the command still exits 0 but writes a small placeholder file titled "(free account required)" instead of the real component. Check for that title before reporting success. Premium components, design systems, and templates additionally require a Premium subscription.

To authenticate installs: sign in and copy your personal token from ${SITE_URL}/account/settings, set it as AICANVAS_TOKEN in .env.local, and configure the registry once in the project's components.json:

\`\`\`json
{ "registries": { "@aicanvas": { "url": "${SITE_URL}/r/{name}.json", "params": { "token": "\${AICANVAS_TOKEN}" } } } }
\`\`\`

After that, every \`npx shadcn@latest add @aicanvas/<component-name>\` is authenticated. Alternatively, each component page shows a ready tokenized install command when signed in.

## MCP server
AI agents can browse and install AI Canvas components through the official MCP server, [@aicanvas/mcp on npm](https://www.npmjs.com/package/@aicanvas/mcp). Run it with \`npx -y @aicanvas/mcp\` (stdio transport). It exposes read-only tools: list_categories, list_components, search_components, get_component, get_install_command, list_systems, get_system, list_templates, get_template. Setup guide: ${SITE_URL}/mcp
`

  const grouped = new Map<string, typeof COMPONENTS>()
  for (const c of COMPONENTS) {
    const cat = categoryOf(c.tags)
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(c)
  }

  const sections: string[] = []
  for (const [category, items] of grouped) {
    // Premium standalones must carry the same label the DS/template lines have,
    // so an assistant never presents a premium install as free.
    const lines = items.map(
      (c) =>
        `- [${c.name}](${SITE_URL}/components/${c.slug}): ${c.description} Install${c.badge === 'Premium' ? ' (Premium, requires an AI Canvas token)' : ' (free account)'}: \`npx shadcn@latest add @aicanvas/${c.slug}\`. Registry: ${SITE_URL}/r/${c.slug}.json`,
    )
    sections.push(`## ${category}\n${lines.join('\n')}`)
  }

  // Design systems + their templates (slug prefix stripped for page URLs,
  // mirroring sitemap.ts). Each system points at the browse route it actually
  // has: Legacy redirects /showcase to its grid, Pro never had that route.
  // A system whose source tree is absent on this build (skipIfMissing) is left
  // out entirely rather than advertised as installable.
  const SYSTEM_BROWSE: Record<string, string> = {
    andromeda: '/showcase',
    'andromeda-pro': '/components',
  }
  const systems = DESIGN_SYSTEMS.filter(
    (s: { slug: string; skipIfMissing?: boolean; rootDir: string }) =>
      !s.skipIfMissing || existsSync(s.rootDir),
  ).map(
    (s: {
      slug: string
      name: string
      templates?: { slug: string; name: string; domain?: string }[]
    }) => {
      const templates = (s.templates ?? []).map((t) => {
        const pageSlug = t.slug.replace(new RegExp(`^${s.slug}-`), '')
        const kind = t.domain ? `${t.domain} template` : 'template'
        return `  - [${t.name}](${SITE_URL}/design-systems/${s.slug}/templates/${pageSlug}): Premium ${kind} built entirely from ${s.name} components. Install (Premium, requires an AI Canvas token): \`npx shadcn@latest add @aicanvas/${t.slug}\``
      })
      // The full-system aggregate and the templates are Premium (the individual
      // component pages are free); label them so an assistant never presents
      // these installs as free.
      return [
        `- [${s.name}](${SITE_URL}/design-systems/${s.slug}): Complete Premium design system (tokens + components). Browse free: ${SITE_URL}/design-systems/${s.slug}${SYSTEM_BROWSE[s.slug] ?? ''}. Install (Premium, requires an AI Canvas token): \`npx shadcn@latest add @aicanvas/${s.slug}\``,
        ...templates,
      ].join('\n')
    },
  ).join('\n')

  // Only advertise collections that actually render (the page 404s below 3
  // members); keeps llms.txt in lockstep with the route's own gate.
  const collections = COLLECTIONS.filter(
    (c) => collectionMembers(c, COMPONENTS).length >= 3,
  )
    .map(
      (c) =>
        `- [${c.h1}](${SITE_URL}/components/collection/${c.slug}): ${c.description}`,
    )
    .join('\n')

  const body = `${intro}\n## Design systems and templates\n${systems}\n\n## Collections\n${collections}\n\n## Components\n\n${sections.join('\n\n')}\n`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
