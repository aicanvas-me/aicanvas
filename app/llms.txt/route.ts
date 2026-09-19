import { COMPONENTS } from '../lib/component-registry'
import { COLLECTIONS, collectionMembers } from '../lib/collections'
import { SITE_URL } from '../lib/config'
import { availableDesignSystems } from '../lib/available-design-systems'
import { classifyContent } from '@/lib/registry/content-type'
import { loadContentLookup } from '@/lib/registry/lookup'

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

One-command installs require a free AI Canvas account. Signed out, the command still exits 0 but writes a small placeholder file titled "(free account required)" instead of the real component. Check for that title before reporting success. Premium components, templates, and the design-system installs marked Premium below additionally require a Premium subscription.

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
  // has, and the final one: /showcase was renamed to /system, so naming it here
  // saves every agent a redirect. Pro never had a /system route.
  // A system whose source tree is absent on this build (skipIfMissing) is left
  // out entirely rather than advertised as installable.
  const SYSTEM_BROWSE: Record<string, string> = {
    andromeda: '/system',
    'andromeda-pro': '/components',
  }
  // Who may install what comes from the /r gate itself (its manifest and
  // classifier), so this file never promises an install the gate refuses.
  const lookup = loadContentLookup()
  const installTier = (slug: string) => {
    const type = classifyContent(slug, lookup)
    if (type === 'meta') return 'no account needed'
    if (type === 'standalone' || type === 'design-system-component') return 'free account'
    return 'Premium, requires an AI Canvas token'
  }
  // The longest system name a slug starts with owns it, so Legacy's
  // `andromeda-` never claims an `andromeda-pro-` component.
  const systemOf = (slug: string) =>
    [...lookup.systemSlugs]
      .filter((sys) => slug.startsWith(`${sys}-`))
      .sort((a, b) => b.length - a.length)[0]
  const systems = availableDesignSystems().map(
    (s: {
      slug: string
      name: string
      slugOverrides?: Record<string, string>
      templates?: { slug: string; name: string; category?: string }[]
    }) => {
      const templates = (s.templates ?? []).map((t) => {
        const pageSlug = t.slug.replace(new RegExp(`^${s.slug}-`), '')
        const kind = t.category ? `${t.category} template` : 'template'
        return `  - [${t.name}](${SITE_URL}/design-systems/${s.slug}/templates/${pageSlug}): Premium ${kind} built entirely from ${s.name} components. Install (Premium, requires an AI Canvas token): \`npx shadcn@latest add @aicanvas/${t.slug}\``
      })
      // Every install the system offers, grouped under the tier the gate gives
      // it. The component form carries one real slug from the manifest, plus any
      // component shipped under an override slug instead of that form.
      const example = [...lookup.designSystemSlugs].sort().find((slug) => systemOf(slug) === s.slug)
      const overrides = Object.entries(s.slugOverrides ?? {})
        .map(([file, slug]) => `; ${file.replace(/^.*\/|\.tsx?$/g, '')} is \`${slug}\``)
        .join('')
      const installs: [string, string][] = [
        [`${s.slug}-tokens`, `\`npx shadcn@latest add @aicanvas/${s.slug}-tokens\` (foundation only: tokens, utilities, system icon)`],
        [s.slug, `\`npx shadcn@latest add @aicanvas/${s.slug}\` (every component)`],
        [`${s.slug}-all`, `\`npx shadcn@latest add @aicanvas/${s.slug}-all\` (every component plus the templates)`],
      ]
      if (example) {
        installs.unshift([example, `\`npx shadcn@latest add @aicanvas/${s.slug}-<component-name>\` (one component, for example \`${example}\`${overrides})`])
      }
      const byTier = new Map<string, string[]>()
      for (const [slug, text] of installs) {
        const tier = installTier(slug)
        byTier.set(tier, [...(byTier.get(tier) ?? []), text])
      }
      const install = [...byTier].map(([tier, texts]) => `Install (${tier}): ${texts.join(', ')}.`).join(' ')
      // Listed only when this build shipped the brain, per the manifest the gate reads.
      const brain = `${s.slug}-brain`
      const brainLine = lookup.brainSlugs.has(brain)
        ? [`  - [Brain](${SITE_URL}/design-systems/${s.slug}/brain): Rule files an AI agent reads to build on-brand ${s.name} UI (tokens, layout, motion, per-component rules). Install or update (${installTier(brain)}): \`npx shadcn@latest add --overwrite @aicanvas/${brain}\``]
        : []
      return [
        `- [${s.name}](${SITE_URL}/design-systems/${s.slug}): Design system (tokens + components). Browse free: ${SITE_URL}/design-systems/${s.slug}${SYSTEM_BROWSE[s.slug] ?? ''}. ${install}`,
        ...brainLine,
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
