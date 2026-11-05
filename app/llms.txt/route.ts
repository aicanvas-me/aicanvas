import { COMPONENTS } from '../lib/component-registry'
import { COLLECTIONS, collectionMembers } from '../lib/collections'
import { SITE_URL } from '../lib/config'
import { availableDesignSystems } from '../lib/available-design-systems'
import { loadContentLookup } from '@/lib/registry/lookup'
import { installTier as gateInstallTier, systemOfSlug } from '@/lib/registry/premium-gate'
import { MCP_TOOLS } from '@/lib/agent-markdown/site'
import { ICON_COUNT } from '../icons/_lib/categories'

export const dynamic = 'force-static'

function categoryOf(tags: { label: string; accent?: boolean }[]): string {
  return tags.find((t) => t.accent)?.label ?? 'Other'
}

export function GET() {
  const total = COMPONENTS.length

  // Who may install what comes from the /r gate itself (its manifest and
  // classifier), so this file never promises an install the gate refuses.
  const lookup = loadContentLookup()
  const installTier = (slug: string) => gateInstallTier(slug, lookup)

  const intro = `# AI Canvas

> AI Canvas is the design layer for AI coding agents: design systems your agent builds with and you reshape to your project, plus ${total} standalone React components and blocks that fit any of them, all installed as editable source with shadcn or MCP. The free components and Andromeda Legacy are MIT; Premium components, Andromeda Pro, its templates and the AI Brain are proprietary, and the Line icons are free under the AI Canvas Premium License, not MIT, with a one-line credit kept in the code. Many components include an AI remix prompt for recreating a variation in an AI builder. For free components, the full prompt is public. For premium components and blocks, the setup and constants are public, while the rest of the build specification requires Premium.

Component and design-system links below point at each page's markdown version (the page URL plus \`.md\`): description, install command, props and, where the page shows one, the remix prompt. These pages also answer in markdown at their own URL when the request sends \`Accept: text/markdown\`: the home page (or ${SITE_URL}/index.md), /mcp (or ${SITE_URL}/mcp.md), /components, each /components/<slug>, each /design-systems/<system> and each /design-systems/<system>/<component>. Other pages, such as templates, answer in HTML only.

## Overview
- [Homepage](${SITE_URL}): Design systems and standalone React components for AI coding agents.
- [All components](${SITE_URL}/components.md): Every one of the ${total} standalone shadcn components and blocks for React, by category, as markdown.
- [About](${SITE_URL}/about): Learn how AI Canvas works with Claude Code, Cursor, and Codex.
- [Docs](${SITE_URL}/docs): Installation, components.json, design systems, the AI Brain, the MCP server and the files for agents.
- [Registry index](${SITE_URL}/r/registry.json): Machine-readable registry index (see Read API below).

## Install
Install command: \`npx shadcn@latest add @aicanvas/<component-name>\`. The @aicanvas registry is listed in the official shadcn directory, so the CLI resolves it with no extra setup.

One-command installs require a free AI Canvas account. Signed out, the command still exits 0 but writes a small placeholder file titled "(free account required)" instead of the real component. Check for that title before reporting success. Premium components and every install marked Premium below additionally require Premium.

To authenticate installs: sign in and copy your personal token from ${SITE_URL}/account/settings, set it as AICANVAS_TOKEN in .env.local, and configure the registry once in the project's components.json:

\`\`\`json
{ "registries": { "@aicanvas": { "url": "${SITE_URL}/r/{name}.json", "params": { "token": "\${AICANVAS_TOKEN}" } } } }
\`\`\`

After that, every \`npx shadcn@latest add @aicanvas/<component-name>\` is authenticated. Alternatively, each component page shows a ready tokenized install command when signed in.

## MCP server
AI agents can browse AI Canvas and get install commands through the official, read-only MCP server, [@aicanvas/mcp on npm](https://www.npmjs.com/package/@aicanvas/mcp). Run it with \`npx -y @aicanvas/mcp\` (stdio transport). It exposes read-only tools: ${MCP_TOOLS.join(', ')}. The documented props of every component are also served as one file at ${SITE_URL}/r/aicanvas-props.json. Setup guide: ${SITE_URL}/mcp.md

## Read API
Public JSON over plain GET: no key, no account, read-only, cached for 5 minutes. Use these to list and search the catalog without the MCP server.
- [registry.json](${SITE_URL}/r/registry.json): The shadcn registry index. \`items[]\` lists every installable item with \`name\` (the install slug), \`type\` (\`registry:ui\` component, \`registry:block\` page section, \`registry:lib\` helper), \`title\`, \`description\`, \`dependencies\` and \`files\` (target paths only, no source).
- [aicanvas-mcp.json](${SITE_URL}/r/aicanvas-mcp.json): The catalog the MCP server reads. \`components[]\` carry \`slug\`, \`name\`, \`description\`, \`categories\`, \`tags\`, \`image\`, \`dependencies\`, \`homepageUrl\` and \`installCommand\`; it also lists \`systems\`, \`systemComponents\`, \`templates\` and \`brains\`.
- [aicanvas-props.json](${SITE_URL}/r/aicanvas-props.json): \`props\` maps a component's slug to its documented prop tables. Components that take no props are absent.
- Per-item files, \`${SITE_URL}/r/<slug>.json\`, are the install payloads the shadcn CLI fetches. They need the token described under Install: without it, a free item returns a placeholder titled "(free account required)" and a Premium item returns a Premium placeholder, both with no source.
- Markdown pages, \`${SITE_URL}/components/<slug>.md\` and \`${SITE_URL}/components.md\`, are the readable form of the same catalog.
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
    // so an assistant never presents a premium install as free. The label comes
    // from the gate's own classifier, the same one the page and its markdown
    // twin use, and each link goes to the twin (agents read it far cheaper).
    const lines = items.map(
      (c) =>
        `- [${c.name}](${SITE_URL}/components/${c.slug}.md): ${c.description} Install (${installTier(c.slug)}): \`npx shadcn@latest add @aicanvas/${c.slug}\`. Registry: ${SITE_URL}/r/${c.slug}.json`,
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
  const systemOf = (slug: string) => systemOfSlug(slug, lookup)
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
        const tier = installTier(t.slug)
        return `  - [${t.name}](${SITE_URL}/design-systems/${s.slug}/templates/${pageSlug}): ${tier === 'free account' ? 'Free' : 'Premium'} ${kind} built entirely from ${s.name} components. Install (${tier}): \`npx shadcn@latest add @aicanvas/${t.slug}\``
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
        ? [`  - [AI Brain](${SITE_URL}/design-systems/${s.slug}/brain): Rule files an AI agent reads to build on-brand ${s.name} UI (tokens, layout, motion, per-component rules). Install or update (${installTier(brain)}): \`npx shadcn@latest add --overwrite @aicanvas/${brain}\``]
        : []
      return [
        `- [${s.name}](${SITE_URL}/design-systems/${s.slug}.md): Design system (tokens + components). Browse free: ${SITE_URL}/design-systems/${s.slug}${SYSTEM_BROWSE[s.slug] ?? ''}. ${install}`,
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

  // Tiers come from the gate, so the paid styles are never listed as free. A build
  // without the icon set lists no icons.
  const iconsSection = ICON_COUNT
    ? `\n## Icons
- [Icons](${SITE_URL}/icons): ${ICON_COUNT} React icons in four styles: Line, Duotone, Solid and Solid duotone. Each icon installs as one editable file plus a shared IconBase runtime in components/icons/.
- Install one icon (${installTier('icon-search')}): \`npx shadcn@latest add @aicanvas/icon-<name>\`, for example \`icon-search\`. The other styles add a suffix (${installTier('icon-search-duotone')}): \`icon-<name>-duotone\`, \`icon-<name>-solid\`, \`icon-<name>-solid-duotone\`.
- Install every Line icon at once (${installTier('icons')}): \`npx shadcn@latest add @aicanvas/icons\`.
- Licence: Line icons are free under the AI Canvas Premium License, not MIT. Without Premium, keep the one-line AI Canvas notice at the top of each Line icon file and name AI Canvas in your credits or licence file when you publish source; Premium members need neither.
- Use: \`import { Search } from '@/components/icons/search'\`, then \`<Search size={20} />\`. The export is the name in PascalCase plus the style (\`SearchDuotone\`, \`SearchSolid\`, \`SearchSolidDuotone\`). Props: size, color, weight (thin, light, regular, bold or extrabold; default regular; Line and Duotone only). \`<IconProvider weight="...">\` from components/icons/IconBase sets the defaults for every icon inside it.
- [Icon catalog](${SITE_URL}/r/icons-index.json) (${installTier('icons-index')}): every icon's name, category and tags as JSON. The MCP tools search_icons and get_icon_install read it.\n`
    : ''

  const body = `${intro}${iconsSection}\n## Design systems and templates\n${systems}\n\n## Collections\n${collections}\n\n## Components\n\n${sections.join('\n\n')}\n`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
