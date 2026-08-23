#!/usr/bin/env node
/**
 * AI Canvas MCP server
 * --------------------
 * Exposes the AI Canvas standalone component registry to AI editors
 * (Claude Code, Cursor, Claude Desktop, Codex). The AI can search,
 * inspect, and install components without leaving the chat.
 *
 * Data flow:
 *   - aicanvas.me/r/aicanvas-mcp.json   → metadata for the 80+ standalone
 *     components plus the Andromeda design system, its components, and templates
 *   - aicanvas.me/r/<slug>.json         → full source code per component
 *
 * Both are static files, served from Vercel's CDN. Stateless server.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

// ── Configuration ────────────────────────────────────────────────────────────

const REGISTRY_BASE =
  process.env.AICANVAS_REGISTRY_BASE ?? 'https://aicanvas.me/r'
const META_URL = `${REGISTRY_BASE}/aicanvas-mcp.json`
const META_TTL_MS = 5 * 60 * 1000 // 5 minutes — meta updates with deploys
const MCP_VERSION = '0.2.4'
const USER_AGENT = `aicanvas-mcp/${MCP_VERSION}`
// Optional per-user token (the website bakes it into the copied MCP config).
// Identifies the account so free-component source pulls are authorized and any
// premium content you own unlocks. Absent = anonymous: metadata browsing still
// works, but source pulls of free components need a free account.
const USER_TOKEN = process.env.AICANVAS_TOKEN ?? ''

function registryHeaders(): Record<string, string> {
  return {
    Accept: 'application/json',
    'User-Agent': USER_AGENT,
    ...(USER_TOKEN ? { Authorization: `Bearer ${USER_TOKEN}` } : {}),
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

interface ComponentMeta {
  slug: string
  name: string
  description: string
  categories: string[]
  tags: string[]
  image?: string
  badge?: string
  dualTheme?: boolean
  dependencies: string[]
  homepageUrl: string
  sourceUrl: string
  installCommand: string
}

// NOTE: fields mirror what scripts/generate-registry.mjs emits into
// aicanvas-mcp.json — keep in sync (systems carry tokenFileCount, not fileCount).
interface SystemMeta {
  slug: string
  name: string
  description: string
  componentCount: number
  tokenFileCount: number
  dependencies: string[]
  // registryDependencies, tokens*, and componentSlugs are emitted by the
  // generator so an agent doing a MANUAL (non-CLI) write knows the shared
  // foundation it must also install and can enumerate the system's components.
  registryDependencies?: string[]
  tokensInstallCommand?: string
  tokensSourceUrl?: string
  componentSlugs?: string[]
  templateSlugs: string[]
  homepageUrl: string
  sourceUrl: string
  installCommand: string
}

// A single design-system COMPONENT (e.g. andromeda-heat-grid). Kept in its own
// `systemComponents` bucket — installable + searchable via the MCP, but NOT part
// of the standalone components[] catalog or its categories.
interface SystemComponentMeta {
  slug: string
  name: string
  description: string
  system: string
  dependencies: string[]
  registryDependencies?: string[]
  homepageUrl: string
  sourceUrl: string
  installCommand: string
}

interface TemplateMeta {
  slug: string
  name: string
  system: string
  domain?: string
  description: string
  fileCount: number
  dependencies: string[]
  // The base components + tokens a manual write must also install. The CLI
  // resolves these automatically; a hand-written file copy does not.
  registryDependencies?: string[]
  homepageUrl: string
  sourceUrl: string
  installCommand: string
}

// One ranked result from `search_components`. Standalones and design-system
// components keep their own shape; templates carry a `kind` tag so the caller
// knows to reach for `get_template` instead of `get_component`.
type SearchHit =
  | ComponentMeta
  | SystemComponentMeta
  | (TemplateMeta & { kind: 'template' })

interface MetaPayload {
  name: string
  homepage: string
  generatedAt: string
  componentCount: number
  categories: Array<{ label: string; count: number }>
  components: ComponentMeta[]
  // Older deploys may not include these fields — treat as optional.
  systems?: SystemMeta[]
  templates?: TemplateMeta[]
  systemComponents?: SystemComponentMeta[]
}

interface ShadcnRegistryItem {
  name: string
  type: string
  title: string
  description: string
  dependencies: string[]
  files: Array<{ path: string; content: string; type: string; target: string }>
}

// ── Cached fetchers ──────────────────────────────────────────────────────────

let metaCache: { data: MetaPayload; fetchedAt: number } | null = null

async function fetchMeta(): Promise<MetaPayload> {
  if (metaCache && Date.now() - metaCache.fetchedAt < META_TTL_MS) {
    return metaCache.data
  }
  const res = await fetch(META_URL, { headers: registryHeaders() })
  if (!res.ok) {
    throw new Error(
      `Failed to fetch AI Canvas registry meta from ${META_URL}: ${res.status} ${res.statusText}`,
    )
  }
  const data = (await res.json()) as MetaPayload
  metaCache = { data, fetchedAt: Date.now() }
  return data
}

async function fetchComponentSource(slug: string): Promise<ShadcnRegistryItem> {
  const url = `${REGISTRY_BASE}/${encodeURIComponent(slug)}.json`
  const res = await fetch(url, { headers: registryHeaders() })
  if (res.status === 402) {
    const j = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(
      j.message ??
        'This is premium AI Canvas content. Upgrade at https://aicanvas.me/pricing, ' +
        'then use the AI Canvas MCP config from your account (your token is included) ' +
        'and update with: npx @aicanvas/mcp@latest',
    )
  }
  // Free component pulled without an account: the registry returns a 200
  // placeholder (not a 402), tagged with this header. Surface a warm sign-up
  // CTA instead of handing the placeholder back as if it were real source.
  if (res.headers.get('x-aicanvas-content-type') === 'free-account-required') {
    const j = (await res.json().catch(() => ({}))) as { title?: string }
    const name =
      typeof j.title === 'string'
        ? j.title.replace(/\s*\(free account required\)\s*$/i, '')
        : slug
    throw new Error(
      `Almost there! "${name}" is free with an AI Canvas account (free, unlimited installs). ` +
        `Sign up at https://aicanvas.me/account/sign-up, then use the AI Canvas MCP config from ` +
        `your account (your token is included) and ask again.`,
    )
  }
  // NOTE: premium standalones ALSO return a 200 placeholder (header
  // 'premium-standalone'), but that header value is NOT unique to the
  // placeholder — an entitled subscriber's REAL source carries it too (the
  // success path stamps the contentType). Keying the MCP on it would strip a
  // paying subscriber's real component. So premium is deliberately NOT
  // intercepted here. Closing that footgun safely needs premiumStub to emit a
  // distinct header (like freeAccountStub's 'free-account-required'); tracked
  // as a separate, billing-reviewed follow-up.
  if (!res.ok) {
    throw new Error(
      `Failed to fetch source for "${slug}" from ${url}: ${res.status} ${res.statusText}`,
    )
  }
  return (await res.json()) as ShadcnRegistryItem
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

type ScoredField = { text: string; weight: number }

// Token scoring shared by standalone and design-system search: whole-word
// hits count double, substrings count once. Tokens of two characters or fewer
// are dropped because they match inside unrelated words ("no" hits
// "notification").
function scoreFields(query: string, fields: ScoredField[]): number {
  const q = normalize(query)
  if (!q) return 0
  const tokens = q.split(/\s+/).filter((t) => t.length > 2)
  if (tokens.length === 0) return 0
  let score = 0
  for (const tok of tokens) {
    for (const f of fields) {
      if (!f.text) continue
      if (new RegExp(`\\b${escapeRegExp(tok)}\\b`).test(f.text)) {
        score += f.weight * 2
      } else if (f.text.includes(tok)) {
        score += f.weight
      }
    }
  }
  return score
}

// Searchable surface of a standalone: slug carries the most weight, then name,
// then categories, then description and tags.
function scoreMatch(query: string, c: ComponentMeta): number {
  return scoreFields(query, [
    { text: normalize(c.slug), weight: 5 },
    { text: normalize(c.name), weight: 4 },
    { text: normalize(c.description), weight: 1 },
    { text: normalize(c.categories.join(' ')), weight: 2 },
    { text: normalize(c.tags.join(' ')), weight: 1 },
  ])
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Searchable surface of a design-system component: slug, name, description
// and the system name, so they rank alongside standalones.
function scoreSystemComponent(query: string, c: SystemComponentMeta): number {
  return scoreFields(query, [
    { text: normalize(c.slug), weight: 5 },
    { text: normalize(c.name), weight: 4 },
    { text: normalize(c.description), weight: 1 },
    { text: normalize(c.system), weight: 2 },
  ])
}

function asTextContent(value: unknown): { type: 'text'; text: string } {
  return {
    type: 'text',
    text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
  }
}

function errorResult(message: string) {
  return {
    content: [asTextContent(`Error: ${message}`)],
    isError: true as const,
  }
}

// ── Server ───────────────────────────────────────────────────────────────────

const server = new McpServer(
  { name: 'aicanvas-mcp', version: MCP_VERSION },
  { capabilities: { tools: {}, logging: {} } },
)

// ── Tool: list_categories ────────────────────────────────────────────────────

server.registerTool(
  'list_categories',
  {
    title: 'List AI Canvas categories',
    description:
      'Return every category in the AI Canvas standalone component library, with the number of components in each. Use to orient before listing or searching, e.g. "what kinds of components are available?"',
    inputSchema: {},
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async () => {
    try {
      const meta = await fetchMeta()
      const lines = [
        `AI Canvas: ${meta.componentCount} components across ${meta.categories.length} categories.`,
        '',
        ...meta.categories.map(
          (c) => `  ${c.label.padEnd(24)}  ${String(c.count).padStart(3)} components`,
        ),
      ]
      return {
        content: [asTextContent(lines.join('\n'))],
        structuredContent: {
          componentCount: meta.componentCount,
          categories: meta.categories,
        },
      }
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Tool: list_components ────────────────────────────────────────────────────

server.registerTool(
  'list_components',
  {
    title: 'List AI Canvas components',
    description:
      'Return AI Canvas components, optionally filtered by category. Use after `list_categories` to drill into one, or pass no filter to browse everything. Each result includes slug, name, description, categories, screenshot URL, install command, and homepage URL, enough to evaluate without a separate `get_component` call. Pagination via `limit` and `offset`.',
    inputSchema: {
      category: z
        .string()
        .optional()
        .describe(
          'Optional category label, e.g. "Cards & Modals", "Backgrounds", "Typography". Case-insensitive. Omit to list all components.',
        ),
      limit: z
        .number()
        .int()
        .min(1)
        .max(200)
        .optional()
        .describe('Max number of components to return. Default 25.'),
      offset: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe('Number of components to skip (for pagination). Default 0.'),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ category, limit = 25, offset = 0 }) => {
    try {
      const meta = await fetchMeta()
      let pool = meta.components
      if (category) {
        const wanted = normalize(category)
        pool = pool.filter((c) =>
          c.categories.some((cat) => normalize(cat) === wanted),
        )
      }
      const total = pool.length
      const slice = pool.slice(offset, offset + limit)
      const summary =
        category != null
          ? `${total} components in category "${category}"` +
            (total > slice.length
              ? ` (showing ${slice.length} from offset ${offset})`
              : '')
          : `${total} components total` +
            (total > slice.length
              ? ` (showing ${slice.length} from offset ${offset})`
              : '')

      return {
        content: [asTextContent(summary + '\n\n' + JSON.stringify(slice, null, 2))],
        structuredContent: {
          total,
          offset,
          limit,
          returned: slice.length,
          components: slice,
        },
      }
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Tool: search_components ──────────────────────────────────────────────────

server.registerTool(
  'search_components',
  {
    title: 'Search AI Canvas components',
    description:
      'Fuzzy keyword search across standalone components, design-system components, AND ready-made templates (whole example screens). Matches on slug, name, description, categories, and tags; returns best matches ranked by relevance. Use when the user describes what they want in their own words, e.g. "an animated card stack", "background with waves", "a mission control dashboard". Results include screenshot URLs and install commands for immediate evaluation. A result tagged `"kind": "template"` is a full screen. Fetch it with `get_template`, not `get_component`.',
    inputSchema: {
      query: z
        .string()
        .min(1)
        .describe(
          'Free-text search query. Multiple words are tokenized and matched independently.',
        ),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .describe('Max number of matches to return. Default 10.'),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ query, limit = 10 }) => {
    try {
      const meta = await fetchMeta()
      // Rank standalones AND design-system components together so DS slugs
      // (e.g. "andromeda-heat-grid") surface in search. Each result object stays
      // usable: standalones keep their full shape; DS components carry their
      // metadata (slug, name, description, system, install command, …).
      const standaloneRanked = meta.components.map((c) => ({
        item: c as SearchHit,
        score: scoreMatch(query, c),
      }))
      const systemRanked = (meta.systemComponents ?? []).map((c) => ({
        item: c as SearchHit,
        score: scoreSystemComponent(query, c),
      }))
      // Templates rank in the same list, otherwise the most natural query for a
      // whole screen ("dashboard", "mission control") matches nothing at all.
      // Tagged so the agent calls `get_template`, not `get_component`. The domain
      // ("Sci-Fi", "Telecom") folds into the system field to stay searchable.
      const templateRanked = (meta.templates ?? []).map((t) => ({
        item: { ...t, kind: 'template' as const } as SearchHit,
        score: scoreSystemComponent(query, {
          ...t,
          system: t.domain ? `${t.system} ${t.domain}` : t.system,
        }),
      }))

      const ranked = [...standaloneRanked, ...systemRanked, ...templateRanked]
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((r) => r.item)

      const summary =
        ranked.length === 0
          ? `No matches for "${query}". Try \`list_categories\` to browse standalones, \`list_systems\` for design systems, or \`list_templates\` for ready-made screens.`
          : `${ranked.length} match${ranked.length === 1 ? '' : 'es'} for "${query}"`

      return {
        content: [asTextContent(summary + '\n\n' + JSON.stringify(ranked, null, 2))],
        structuredContent: { query, count: ranked.length, components: ranked },
      }
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Tool: get_component ──────────────────────────────────────────────────────

server.registerTool(
  'get_component',
  {
    title: 'Get an AI Canvas component (full metadata + source code)',
    description:
      'Return the complete record for a single component: metadata + the entire .tsx source code as a string. Use after the user picks one from a search/list result and wants to see the implementation, or before installing if they want to inspect first. The source is the exact file the CLI install would write into a project.',
    inputSchema: {
      slug: z
        .string()
        .min(1)
        .describe(
          'The component slug, e.g. "ai-job-cards", "wave-lines", "halo-type". Use exact slugs from list/search results.',
        ),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ slug }) => {
    try {
      const meta = await fetchMeta()
      const component = meta.components.find((c) => c.slug === slug)
      // Fall back to design-system components (kept out of components[]).
      const systemComponent = component
        ? undefined
        : (meta.systemComponents ?? []).find((c) => c.slug === slug)

      if (!component && !systemComponent) {
        return errorResult(
          `No component found with slug "${slug}". Use \`search_components\` or \`list_components\` to find standalone slugs, ` +
            `or \`list_systems\` / \`get_system\` for design-system components (e.g. "andromeda-heat-grid").`,
        )
      }

      const source = await fetchComponentSource(slug)
      const code = source.files[0]?.content ?? ''
      const filePath = source.files[0]?.path ?? `components/aicanvas/${slug}.tsx`

      if (systemComponent) {
        const result = { ...systemComponent, filePath, code }
        return {
          content: [
            asTextContent(
              [
                `# ${systemComponent.name}`,
                '',
                systemComponent.description,
                '',
                `Design system: ${systemComponent.system}`,
                `Dependencies: ${systemComponent.dependencies.join(', ') || '(none)'}`,
                `Registry dependencies: ${(systemComponent.registryDependencies ?? []).join(', ') || '(none)'}`,
                `Install: ${systemComponent.installCommand}`,
                `Homepage: ${systemComponent.homepageUrl}`,
                '',
                'Note: a manual (non-CLI) write must ALSO install the shared tokens this component depends on (see registry dependencies above and `get_system`). The CLI install resolves them automatically.',
                '',
                `--- ${filePath} ---`,
                code,
              ].join('\n'),
            ),
          ],
          structuredContent: result,
        }
      }

      const result = {
        ...component!,
        filePath,
        code,
      }

      return {
        content: [
          asTextContent(
            [
              `# ${component!.name}`,
              '',
              component!.description,
              '',
              `Categories: ${component!.categories.join(', ') || '(none)'}`,
              `Dependencies: ${component!.dependencies.join(', ') || '(none)'}`,
              `Install: ${component!.installCommand}`,
              `Homepage: ${component!.homepageUrl}`,
              '',
              `--- ${filePath} ---`,
              code,
            ].join('\n'),
          ),
        ],
        structuredContent: result,
      }
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Tool: get_install_command ────────────────────────────────────────────────

server.registerTool(
  'get_install_command',
  {
    title: 'Get the AI Canvas install command for a component',
    description:
      'Return the shadcn CLI command to install a single component into the user\'s project. After calling this, suggest the user run the command (or run it yourself if you have shell access). Requires shadcn-aware setup (Tailwind v4, components.json). For projects without that, fall back to `get_component` and write the file manually.',
    inputSchema: {
      slug: z
        .string()
        .min(1)
        .describe('The component slug, e.g. "ai-job-cards".'),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ slug }) => {
    try {
      const meta = await fetchMeta()
      const component =
        meta.components.find((c) => c.slug === slug) ??
        (meta.systemComponents ?? []).find((c) => c.slug === slug)
      if (!component) {
        return errorResult(
          `No component found with slug "${slug}". Use \`search_components\` to find standalone slugs, ` +
            `or \`list_systems\` / \`get_system\` for design-system components.`,
        )
      }
      // The meta installCommand is the bare `@aicanvas/<slug>` form, which runs
      // in the USER'S shell — where this server's AICANVAS_TOKEN does not exist.
      // Unauthenticated, the registry serves a 200 placeholder instead of the
      // component. With a token, emit the authenticated URL form; without one,
      // say what the bare command needs so the agent can relay it honestly.
      const installCommand = USER_TOKEN
        ? `npx shadcn@latest add "${REGISTRY_BASE}/${encodeURIComponent(component.slug)}.json?token=${encodeURIComponent(USER_TOKEN)}"`
        : component.installCommand
      const authNote = USER_TOKEN
        ? 'This command contains your personal AI Canvas token. Treat it like a secret: run it, do not commit or share it.'
        : 'Note: installing requires a free AI Canvas account. Without one this command writes a placeholder file, not the component. Sign up at https://aicanvas.me/account/sign-up, then reinstall this MCP with your token (setup: https://aicanvas.me/mcp).'
      const out = {
        slug: component.slug,
        name: component.name,
        installCommand,
        sourceUrl: component.sourceUrl,
        homepageUrl: component.homepageUrl,
        dependencies: component.dependencies,
      }
      return {
        content: [
          asTextContent(
            [
              `Install ${component.name}:`,
              '',
              `  ${installCommand}`,
              '',
              authNote,
              '',
              `Dependencies: ${component.dependencies.join(', ') || '(none, React only)'}`,
              `Source: ${component.sourceUrl}`,
              `Preview: ${component.homepageUrl}`,
            ].join('\n'),
          ),
        ],
        structuredContent: out,
      }
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Tool: list_systems ───────────────────────────────────────────────────────

server.registerTool(
  'list_systems',
  {
    title: 'List AI Canvas design systems',
    description:
      'Return every design system available on AI Canvas. A design system is a coordinated set of components plus shared tokens and utilities, installable in one CLI command. Use when the user asks about "themes", "design systems", or wants more than a single component.',
    inputSchema: {},
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async () => {
    try {
      const meta = await fetchMeta()
      const systems = meta.systems ?? []
      if (systems.length === 0) {
        return {
          content: [asTextContent('No design systems available in this registry build.')],
          structuredContent: { systems: [] },
        }
      }
      const lines = [
        `${systems.length} design system${systems.length === 1 ? '' : 's'} on AI Canvas:`,
        '',
        ...systems.map((s) =>
          `  ${s.name.padEnd(16)}  ${String(s.componentCount).padStart(2)} components, ${s.templateSlugs.length} templates`,
        ),
        '',
        'Use `get_system` to fetch the full source of a system, or `list_templates` to see the ready-made screens built from one.',
      ]
      return {
        content: [asTextContent(lines.join('\n'))],
        structuredContent: { systems },
      }
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Tool: get_system ─────────────────────────────────────────────────────────

server.registerTool(
  'get_system',
  {
    title: 'Get a complete AI Canvas design system (every file)',
    description:
      'Return all files for a design system in a single response (every component, plus shared tokens and utilities), ready to write into the user\'s project. Use when the user wants to adopt a whole system rather than pick individual components.',
    inputSchema: {
      slug: z
        .string()
        .min(1)
        .describe('Design system slug, e.g. "andromeda". Use `list_systems` to discover.'),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ slug }) => {
    try {
      const meta = await fetchMeta()
      const system = (meta.systems ?? []).find((s) => s.slug === slug)
      if (!system) {
        return errorResult(
          `No design system found with slug "${slug}". Use \`list_systems\` to see what's available.`,
        )
      }
      const item = await fetchComponentSource(slug)

      // The system's own design-system components, with their per-component
      // install commands — so an agent can install (or hand-write) any subset.
      const components = (meta.systemComponents ?? []).filter(
        (c) =>
          c.system === system.slug ||
          (system.componentSlugs ?? []).includes(c.slug),
      )

      const summary = [
        `# ${system.name} design system`,
        '',
        system.description,
        '',
        `Files: ${item.files.length}`,
        `Dependencies: ${system.dependencies.join(', ') || '(none)'}`,
        `Registry dependencies: ${(system.registryDependencies ?? []).join(', ') || '(none)'}`,
        `Install (whole system): ${system.installCommand}`,
        ...(system.tokensInstallCommand
          ? [`Install (shared tokens only): ${system.tokensInstallCommand}`]
          : []),
        ...(system.tokensSourceUrl ? [`Tokens source: ${system.tokensSourceUrl}`] : []),
        `Homepage: ${system.homepageUrl}`,
        '',
        'Note: the shared tokens ship as a SEPARATE registry dependency. For a manual (non-CLI) file write you must ALSO install the tokens (see "Install (shared tokens only)" above); the CLI resolves them automatically.',
        '',
        `--- components (${components.length}) ---`,
        ...components.map((c) => `  ${c.slug.padEnd(28)}  ${c.installCommand}`),
        '',
        `--- file index ---`,
        ...item.files.map((f) => `  ${f.path}`),
      ].join('\n')

      return {
        content: [asTextContent(summary)],
        structuredContent: {
          ...system,
          components,
          files: item.files,
        },
      }
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Tool: list_templates ─────────────────────────────────────────────────────

server.registerTool(
  'list_templates',
  {
    title: 'List AI Canvas design-system templates',
    description:
      'Return every ready-made template on AI Canvas. A template is a complete example screen built from one design system (a dashboard, a console, a control room), installable in one CLI command. Use to discover what full screens exist before fetching one with `get_template`, or when the user asks for "a dashboard" / "an admin screen" rather than a single component.',
    inputSchema: {
      system: z
        .string()
        .optional()
        .describe(
          'Optional design system slug to filter by, e.g. "andromeda". Omit to list templates from every system.',
        ),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ system }) => {
    try {
      const meta = await fetchMeta()
      const all = meta.templates ?? []
      const templates = system
        ? all.filter((t) => t.system.toLowerCase() === system.toLowerCase())
        : all

      if (templates.length === 0) {
        return {
          content: [
            asTextContent(
              system
                ? `No templates found for design system "${system}". Use \`list_systems\` to see which systems exist.`
                : 'No templates available in this registry build.',
            ),
          ],
          structuredContent: { templates: [] },
        }
      }

      const lines = [
        `${templates.length} template${templates.length === 1 ? '' : 's'}${system ? ` in ${system}` : ' on AI Canvas'}:`,
        '',
        ...templates.map(
          (t) =>
            `  ${t.slug.padEnd(32)}  ${t.system}${t.domain ? ` · ${t.domain}` : ''}, ${t.fileCount} files`,
        ),
        '',
        'Use `get_template` with a slug above to fetch every file for one template.',
      ]
      return {
        content: [asTextContent(lines.join('\n'))],
        structuredContent: { templates },
      }
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Tool: get_template ───────────────────────────────────────────────────────

server.registerTool(
  'get_template',
  {
    title: 'Get a complete AI Canvas design-system template (every file)',
    description:
      'Return all files for a single template: the example composition plus every component it uses plus shared tokens. Use for "I want exactly this dashboard" / "give me the entire mission-control screen". One CLI command installs all files.',
    inputSchema: {
      slug: z
        .string()
        .min(1)
        .describe(
          'Template slug, e.g. "andromeda-mission-control", "andromeda-signal-room". Use `list_templates` to discover.',
        ),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ slug }) => {
    try {
      const meta = await fetchMeta()
      const template = (meta.templates ?? []).find((t) => t.slug === slug)
      if (!template) {
        return errorResult(
          `No template found with slug "${slug}". Use \`list_templates\` to see available templates.`,
        )
      }
      const item = await fetchComponentSource(slug)
      const summary = [
        `# ${template.name} (${template.system}${template.domain ? ` · ${template.domain}` : ''})`,
        '',
        template.description,
        '',
        `Files: ${item.files.length}`,
        `Dependencies: ${template.dependencies.join(', ') || '(none)'}`,
        `Registry dependencies: ${(template.registryDependencies ?? []).join(', ') || '(none)'}`,
        `Install: ${template.installCommand}`,
        `Preview: ${template.homepageUrl}`,
        '',
        'Note: a manual (non-CLI) file write must ALSO install the registry dependencies above (the base components + shared tokens) for the composition to build. The CLI install resolves them automatically.',
        '',
        `--- file index ---`,
        ...item.files.map((f) => `  ${f.path}`),
      ].join('\n')

      return {
        content: [asTextContent(summary)],
        structuredContent: {
          ...template,
          files: item.files,
        },
      }
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Boot ─────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  // stdio transport runs forever — closes when host kills stdin
}

main().catch((err) => {
  // stderr only — stdout is reserved for JSON-RPC
  console.error('aicanvas-mcp fatal:', err)
  process.exit(1)
})
