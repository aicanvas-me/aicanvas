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
 *   - aicanvas.me/r/aicanvas-props.json → the documented props per component
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
const MCP_VERSION = '0.3.0'
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
  category?: string
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
      // Tagged so the agent calls `get_template`, not `get_component`. The
      // category ("Dashboard", "CRM") folds into the system field to stay
      // searchable, which is what an agent asking for a dashboard types.
      const templateRanked = (meta.templates ?? []).map((t) => ({
        item: { ...t, kind: 'template' as const } as SearchHit,
        score: scoreSystemComponent(query, {
          ...t,
          system: t.category ? `${t.system} ${t.category}` : t.system,
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
            `  ${t.slug.padEnd(32)}  ${t.system}${t.category ? ` · ${t.category}` : ''}, ${t.fileCount} files`,
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
        `# ${template.name} (${template.system}${template.category ? ` · ${template.category}` : ''})`,
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

// ── Prop tables (the documented API per component) ───────────────────────────
// A second registry file, separate from the catalog so search stays small. It
// carries the same rows the component pages render: every prop of a component
// with its type, whether it is required, its default and one sentence on what
// it does. Metadata, never source, so it needs no account.

const PROPS_URL = `${REGISTRY_BASE}/aicanvas-props.json`

interface PropRow {
  name: string
  type: string
  optional: boolean
  default: string
  description: string
}
interface PropTable {
  table: string
  props: PropRow[]
}
interface PropsPayload {
  name: string
  generatedAt: string
  componentCount: number
  props: Record<string, PropTable[]>
}

let propsCache: { data: PropsPayload; fetchedAt: number } | null = null

async function fetchProps(): Promise<PropsPayload> {
  if (propsCache && Date.now() - propsCache.fetchedAt < META_TTL_MS) {
    return propsCache.data
  }
  const res = await fetch(PROPS_URL, { headers: registryHeaders() })
  if (!res.ok) {
    throw new Error(
      `Failed to fetch AI Canvas prop tables from ${PROPS_URL}: ${res.status} ${res.statusText}`,
    )
  }
  const data = (await res.json()) as PropsPayload
  propsCache = { data, fetchedAt: Date.now() }
  return data
}

function findAnyComponent(
  meta: MetaPayload,
  slug: string,
): ComponentMeta | SystemComponentMeta | undefined {
  return (
    meta.components.find((c) => c.slug === slug) ??
    (meta.systemComponents ?? []).find((c) => c.slug === slug)
  )
}

function cell(s: string): string {
  return s.replace(/\|/g, '\\|')
}

function renderPropTables(tables: PropTable[]): string {
  return tables
    .map((t) =>
      [
        `## ${t.table}`,
        '',
        '| Prop | Type | Required | Default | Description |',
        '|---|---|---|---|---|',
        ...t.props.map(
          (p) =>
            `| ${p.name} | \`${cell(p.type)}\` | ${p.optional ? 'no' : 'yes'} | ${
              p.default ? '`' + cell(p.default) + '`' : ''
            } | ${cell(p.description)} |`,
        ),
      ].join('\n'),
    )
    .join('\n\n')
}

// A type that is purely a union of string literals, as a list of the options.
// Anything else (a generic, an object, a plain string) returns null.
function unionOptions(type: string): string[] | null {
  const cleaned = type.replace(/\s+/g, '')
  if (!/^('[^']*'\|?)+(\|?undefined)?$/.test(cleaned)) return null
  return (type.match(/'[^']+'/g) ?? []).map((s) => s.slice(1, -1))
}

// ── Tool: get_component_props ────────────────────────────────────────────────

server.registerTool(
  'get_component_props',
  {
    title: 'Get the documented props (API) of an AI Canvas component',
    description:
      'Return the prop table of one component: every prop with its type, whether it is required, its default and what it does. Free, needs no account, and far smaller than the full source. Call it before writing JSX for a component you have not read, or to answer "what can I configure on X". A component with no table takes no props: it is self-contained and adapted by editing its source.',
    inputSchema: {
      slug: z
        .string()
        .min(1)
        .describe(
          'Registry slug from a search or list result, e.g. "andromeda-button-system", "filter-menu".',
        ),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ slug }) => {
    try {
      const meta = await fetchMeta()
      const component = findAnyComponent(meta, slug)
      if (!component) {
        return errorResult(
          `No component found with slug "${slug}". Use \`search_components\` to find the slug.`,
        )
      }
      const props = await fetchProps()
      const tables = props.props[slug] ?? []
      if (tables.length === 0) {
        return {
          content: [
            asTextContent(
              `${component.name} takes no props: it is self-contained. Install it (${component.installCommand}) and adapt the source directly.`,
            ),
          ],
          structuredContent: { slug, name: component.name, tables: [] },
        }
      }
      return {
        content: [
          asTextContent(
            [
              `# ${component.name} props`,
              '',
              renderPropTables(tables),
              '',
              `Install: ${component.installCommand}`,
              `Homepage: ${component.homepageUrl}`,
            ].join('\n'),
          ),
        ],
        structuredContent: { slug, name: component.name, tables },
      }
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Usage scanner for validate_usage ─────────────────────────────────────────
// ponytail: a string scanner, not a TypeScript parse. It reads import lines and
// JSX opening tags with balanced braces, which covers ordinary component files.
// Its ceiling: props passed through a spread object, tags built at runtime, and
// JSX inside template strings are not seen. The TypeScript compiler would close
// that gap at the cost of a large download for every npx user.

interface ImportBinding {
  local: string
  imported: string
  path: string
}

function scanImports(code: string): ImportBinding[] {
  const out: ImportBinding[] = []
  const re =
    /import\s+(?:type\s+)?([A-Za-z_$][\w$]*)?\s*,?\s*(?:\{([^}]*)\})?\s*from\s*['"]([^'"]+)['"]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(code))) {
    const [, def, named, path] = m
    if (def) out.push({ local: def, imported: 'default', path })
    if (named) {
      for (const part of named.split(',')) {
        const seg = part.trim().replace(/^type\s+/, '')
        if (!seg) continue
        const [imported, local] = seg.split(/\s+as\s+/).map((s) => s.trim())
        out.push({ local: local ?? imported, imported, path })
      }
    }
  }
  return out
}

interface JsxAttr {
  name: string
  value: string | null
  kind: 'string' | 'expr' | 'bare'
}
interface JsxUsage {
  tag: string
  attrs: JsxAttr[]
  spread: boolean
  line: number
}

// Index just past the brace that closes the one opening at `i`.
function skipBrace(text: string, i: number): number {
  let depth = 0
  let quote: string | null = null
  for (; i < text.length; i++) {
    const ch = text[i]
    if (quote) {
      if (ch === quote && text[i - 1] !== '\\') quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch
      continue
    }
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return i + 1
    }
  }
  return text.length
}

function parseAttrs(text: string): { attrs: JsxAttr[]; spread: boolean } {
  const attrs: JsxAttr[] = []
  let spread = false
  let i = 0
  const n = text.length
  while (i < n) {
    const ch = text[i]
    if (/\s/.test(ch) || ch === '/') {
      i++
      continue
    }
    if (ch === '{') {
      if (text.slice(i + 1, i + 4) === '...') spread = true
      i = skipBrace(text, i)
      continue
    }
    const nm = /^[A-Za-z_$][\w$:.-]*/.exec(text.slice(i))
    if (!nm) {
      i++
      continue
    }
    const name = nm[0]
    i += name.length
    while (i < n && /\s/.test(text[i])) i++
    if (text[i] !== '=') {
      attrs.push({ name, value: null, kind: 'bare' })
      continue
    }
    i++
    while (i < n && /\s/.test(text[i])) i++
    if (text[i] === '"' || text[i] === "'") {
      const q = text[i]
      const end = text.indexOf(q, i + 1)
      attrs.push({ name, value: text.slice(i + 1, end < 0 ? n : end), kind: 'string' })
      i = end < 0 ? n : end + 1
      continue
    }
    if (text[i] === '{') {
      const end = skipBrace(text, i)
      attrs.push({ name, value: text.slice(i + 1, end - 1).trim(), kind: 'expr' })
      i = end
      continue
    }
    attrs.push({ name, value: null, kind: 'bare' })
  }
  return { attrs, spread }
}

function scanJsx(code: string): JsxUsage[] {
  const out: JsxUsage[] = []
  // PascalCase tags only: lowercase tags are DOM elements.
  const re = /<([A-Z][\w$]*)(?=[\s/>])/g
  let m: RegExpExecArray | null
  while ((m = re.exec(code))) {
    const start = re.lastIndex
    let i = start
    let depth = 0
    let quote: string | null = null
    for (; i < code.length; i++) {
      const ch = code[i]
      if (quote) {
        if (ch === quote && code[i - 1] !== '\\') quote = null
        continue
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        quote = ch
        continue
      }
      if (ch === '{') depth++
      else if (ch === '}') depth--
      else if (ch === '>' && depth === 0) break
    }
    const { attrs, spread } = parseAttrs(code.slice(start, i))
    out.push({ tag: m[1], attrs, spread, line: code.slice(0, m.index).split('\n').length })
    re.lastIndex = i
  }
  return out
}

interface ResolvedTag {
  slug: string
  table: PropTable
}

// Map each JSX tag in the file to a documented component. A default import
// whose path ends in a registry slug is that standalone; an import from a path
// that carries a design-system slug is looked up among that system's tables by
// the imported name. An explicit `tags` map from the caller wins over both.
function resolveTags(
  code: string,
  meta: MetaPayload,
  props: PropsPayload,
  forced: Record<string, string>,
): { index: Map<string, ResolvedTag>; unresolved: string[] } {
  const index = new Map<string, ResolvedTag>()
  const unresolved: string[] = []
  const systems = (meta.systems ?? []).map((s) => s.slug).sort((a, b) => b.length - a.length)
  const entries = Object.entries(props.props)
  // Which system a design-system slug belongs to, from the catalog, so a lookup
  // inside "andromeda" never sweeps in "andromeda-pro-*" slugs by prefix.
  const systemOf = new Map((meta.systemComponents ?? []).map((c) => [c.slug, c.system]))

  const tableFor = (slug: string, name: string): PropTable | undefined => {
    const tables = props.props[slug] ?? []
    return tables.find((t) => t.table === name) ?? (tables.length === 1 ? tables[0] : undefined)
  }

  for (const [tag, slug] of Object.entries(forced)) {
    const table = tableFor(slug, tag)
    if (table) index.set(tag, { slug, table })
    else unresolved.push(`<${tag}> (forced to "${slug}", which has no documented API)`)
  }

  for (const b of scanImports(code)) {
    if (index.has(b.local)) continue
    const segs = b.path.replace(/\.(tsx|ts|jsx|js)$/, '').split('/')
    const base = segs[segs.length - 1] === 'index' ? segs[segs.length - 2] : segs[segs.length - 1]
    const name = b.imported === 'default' ? base : b.imported

    // 1. Path ends in a registry slug: a standalone or a per-slug install.
    if (props.props[base]) {
      const table = tableFor(base, name) ?? tableFor(base, b.local)
      if (table) index.set(b.local, { slug: base, table })
      continue
    }
    // 2. Path carries a design-system slug: look the name up in that system.
    const system = systems.find((s) => segs.includes(s))
    const pool = system ? entries.filter(([slug]) => systemOf.get(slug) === system) : entries
    const hits = pool.filter(([, tables]) => tables.some((t) => t.table === name))
    if (hits.length === 1) {
      index.set(b.local, { slug: hits[0][0], table: hits[0][1].find((t) => t.table === name)! })
    } else if (hits.length > 1 || /aicanvas|andromeda/i.test(b.path)) {
      unresolved.push(
        `<${b.local}> from "${b.path}"` +
          (hits.length > 1
            ? ` matches ${hits.length} components (${hits.map(([s]) => s).join(', ')}); pass tags: { "${b.local}": "<slug>" }`
            : ' has no documented API here'),
      )
    }
  }
  return { index, unresolved }
}

const PASSTHROUGH = new Set(['key', 'ref', 'children'])

interface UsageIssue {
  severity: 'error' | 'warning' | 'info'
  line: number
  tag: string
  prop: string
  message: string
}

// ── Tool: validate_usage ─────────────────────────────────────────────────────

server.registerTool(
  'validate_usage',
  {
    title: 'Validate AI Canvas component usage in a file',
    description:
      'Check a file\'s JSX against the documented props of the AI Canvas components it imports. Reports props that do not exist on the component, required props that are missing, and string values outside a prop\'s allowed options, each with a line number. Run it on every file that uses AI Canvas components before you finish. Components are matched by import path (components/aicanvas/<slug> for standalones, components/aicanvas/<system>/... for design-system components); pass `tags` to map a tag to a slug by hand.',
    inputSchema: {
      code: z.string().min(1).describe('The full contents of the file to check.'),
      path: z.string().optional().describe('The file path, used only in the report.'),
      tags: z
        .record(z.string())
        .optional()
        .describe(
          'Optional map from JSX tag name to registry slug, e.g. { "Button": "andromeda-button-system" }, for tags the import scan cannot resolve.',
        ),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ code, path, tags }) => {
    try {
      const meta = await fetchMeta()
      const props = await fetchProps()
      const { index, unresolved } = resolveTags(code, meta, props, tags ?? {})
      const usages = scanJsx(code)
      const issues: UsageIssue[] = []
      const checked: Array<{ tag: string; slug: string; table: string; line: number }> = []

      for (const u of usages) {
        const r = index.get(u.tag)
        if (!r) continue
        checked.push({ tag: u.tag, slug: r.slug, table: r.table.table, line: u.line })
        const known = new Map(r.table.props.map((p) => [p.name, p]))
        for (const a of u.attrs) {
          if (PASSTHROUGH.has(a.name) || /^(data|aria)-/.test(a.name)) continue
          const p = known.get(a.name)
          if (!p) {
            issues.push({
              severity: u.spread ? 'info' : 'warning',
              line: u.line,
              tag: u.tag,
              prop: a.name,
              message: `"${a.name}" is not in the documented ${r.table.table} API (${r.slug}). It only works if the component spreads unknown props onto its root.`,
            })
            continue
          }
          const opts = unionOptions(p.type)
          const literal =
            a.kind === 'string'
              ? a.value
              : a.kind === 'expr' && a.value && /^(['"])[^'"]*\1$/.test(a.value)
                ? a.value.slice(1, -1)
                : null
          if (opts && literal !== null && !opts.includes(literal)) {
            issues.push({
              severity: 'error',
              line: u.line,
              tag: u.tag,
              prop: a.name,
              message: `"${literal}" is not an allowed value of ${a.name}. One of: ${opts.join(', ')}.`,
            })
          }
          if (a.kind === 'bare' && !/boolean/.test(p.type)) {
            issues.push({
              severity: 'warning',
              line: u.line,
              tag: u.tag,
              prop: a.name,
              message: `${a.name} is passed without a value, but its type is ${p.type}.`,
            })
          }
        }
        if (!u.spread) {
          for (const p of r.table.props) {
            if (!p.optional && !u.attrs.some((a) => a.name === p.name)) {
              issues.push({
                severity: 'error',
                line: u.line,
                tag: u.tag,
                prop: p.name,
                message: `required prop ${p.name} (${p.type}) is missing.`,
              })
            }
          }
        }
      }

      const errors = issues.filter((i) => i.severity === 'error').length
      const warnings = issues.filter((i) => i.severity === 'warning').length
      const where = path ?? 'the file'
      const lines: string[] = []
      if (checked.length === 0) {
        lines.push(
          `No AI Canvas component usages found in ${where}.`,
          'Components are matched by import path: components/aicanvas/<slug> (standalones) or components/aicanvas/<system>/... (design-system components). Pass `tags` to map a tag to a slug by hand.',
        )
      } else {
        lines.push(
          `Checked ${checked.length} AI Canvas component usage${checked.length === 1 ? '' : 's'} in ${where}: ${errors} error${errors === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'}.`,
        )
        if (issues.length === 0) lines.push('', 'Every prop matches the documented API.')
        else {
          lines.push('')
          for (const i of issues.sort((a, b) => a.line - b.line)) {
            lines.push(`- line ${i.line} <${i.tag}> ${i.severity}: ${i.message}`)
          }
        }
      }
      if (unresolved.length) {
        lines.push('', 'Not checked:', ...unresolved.map((u) => `- ${u}`))
      }
      return {
        content: [asTextContent(lines.join('\n'))],
        structuredContent: { path: path ?? null, checked, issues, unresolved, errors, warnings },
      }
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Tool: compose_page ───────────────────────────────────────────────────────

const ARTICLES = /^(a|an|the|some)\s+/i
// Grammar words score against every description; they say nothing about which
// screen a brief wants, so the template match drops them first.
const STOP_WORDS = new Set([
  'and', 'with', 'for', 'the', 'that', 'this', 'from', 'into', 'then', 'plus', 'some',
  'our', 'your', 'one', 'two', 'has', 'have', 'want', 'need', 'like', 'make', 'build',
  'plan', 'create', 'design', 'add', 'use', 'using', 'show', 'page', 'screen',
])
function withoutStopWords(text: string): string {
  return text
    .split(/\s+/)
    .filter((w) => !STOP_WORDS.has(w.toLowerCase()))
    .join(' ')
}

// A pick needs one whole word of the ask in the item's name or slug. Substring
// scoring alone let "plan" pick Planet and the Resource Planning template.
function namedHit(ask: string, item: { slug: string; name: string; category?: string }): boolean {
  const names = `${normalize(item.slug)} ${normalize(item.name)} ${normalize(item.category ?? '')}`
  return normalize(withoutStopWords(ask))
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .some((t) => new RegExp(`\\b${escapeRegExp(t)}\\b`).test(names))
}

function briefSegments(brief: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of brief.split(/,|;|\n|\band\b|\bwith\b|\bplus\b|\bthen\b/i)) {
    const seg = raw.trim().replace(ARTICLES, '').trim()
    const key = normalize(seg)
    if (key.length < 3 || seen.has(key)) continue
    seen.add(key)
    out.push(seg)
    if (out.length === 8) break
  }
  return out
}

server.registerTool(
  'compose_page',
  {
    title: 'Plan a page from AI Canvas components',
    description:
      'Turn a one-line brief ("a CRM dashboard with a pipeline board and an activity feed") into a build plan: the closest ready-made template if one fits, one AI Canvas component per part of the brief with two alternatives, the install commands in order (shared tokens first), which picks have a documented API to read, and the parts nothing in the catalog covers so you build only those. It plans; it generates no code. Follow it with get_component_props, then validate_usage on the result.',
    inputSchema: {
      brief: z.string().min(3).describe('What the page needs, in plain words. Separate parts with commas or "and".'),
      system: z
        .string()
        .optional()
        .describe(
          'Prefer components from this design system, e.g. "andromeda". Omit to rank standalones and design-system components together.',
        ),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ brief, system }) => {
    try {
      const meta = await fetchMeta()
      const props = await fetchProps().catch(() => null)
      const wanted = system?.toLowerCase()
      const systemMeta = wanted ? (meta.systems ?? []).find((s) => s.slug === wanted) : undefined
      if (wanted && !systemMeta) {
        return errorResult(
          `No design system with slug "${system}". Use \`list_systems\` to see what exists, or omit the filter.`,
        )
      }

      // The closest whole screen, scored against the entire brief. One whole-word
      // hit on the template's name or its category (Dashboard, CRM, Scheduling,
      // Media, Authentication) scores 8; anything below that is a stray token in
      // a description, not a screen the brief is asking for.
      const MIN_TEMPLATE_SCORE = 8
      const templates = (meta.templates ?? []).filter((t) => !wanted || t.system === wanted)
      const templatePick = templates
        .map((t) => ({
          item: t,
          score: scoreFields(withoutStopWords(brief), [
            { text: normalize(t.slug), weight: 5 },
            { text: normalize(t.name), weight: 4 },
            { text: normalize(t.category ?? ''), weight: 4 },
            { text: normalize(t.description), weight: 1 },
            { text: normalize(t.system), weight: 2 },
          ]),
        }))
        .filter((r) => r.score >= MIN_TEMPLATE_SCORE && namedHit(brief, r.item))
        .sort((a, b) => b.score - a.score)[0]?.item

      const segments = briefSegments(brief)
      const dsPool = (meta.systemComponents ?? []).filter((c) => !wanted || c.system === wanted)
      type Pick = ComponentMeta | SystemComponentMeta
      const sections = segments.map((ask) => {
        const query = withoutStopWords(ask)
        const ds = dsPool
          .map((c) => ({ item: c as Pick, score: scoreSystemComponent(query, c) }))
          .filter((r) => r.score > 0 && namedHit(ask, r.item))
        const sa = wanted
          ? []
          : meta.components
              .map((c) => ({ item: c as Pick, score: scoreMatch(query, c) }))
              .filter((r) => r.score > 0 && namedHit(ask, r.item))
        const ranked = [...ds, ...sa].sort((a, b) => b.score - a.score).map((r) => r.item)
        const pick = ranked[0]
        return {
          ask,
          pick: pick
            ? {
                slug: pick.slug,
                name: pick.name,
                installCommand: pick.installCommand,
                homepageUrl: pick.homepageUrl,
                hasProps: !!props?.props[pick.slug],
              }
            : null,
          alternatives: ranked.slice(1, 3).map((c) => ({ slug: c.slug, name: c.name })),
        }
      })
      const gaps = sections.filter((s) => !s.pick).map((s) => s.ask)
      const picks = sections.flatMap((s) => (s.pick ? [s.pick] : []))

      // Install order: shared tokens of every system used, then each pick once.
      const systemsUsed = new Set(
        picks.flatMap((p) => {
          const sc = (meta.systemComponents ?? []).find((c) => c.slug === p.slug)
          return sc ? [sc.system] : []
        }),
      )
      const install: string[] = []
      for (const s of systemsUsed) {
        const cmd = (meta.systems ?? []).find((x) => x.slug === s)?.tokensInstallCommand
        if (cmd && !install.includes(cmd)) install.push(cmd)
      }
      for (const p of picks) if (!install.includes(p.installCommand)) install.push(p.installCommand)

      const lines: string[] = [`# Plan for: ${brief}`, '']
      if (templatePick) {
        lines.push(
          `Closest ready-made screen: ${templatePick.name} (${templatePick.system}${templatePick.category ? ` · ${templatePick.category}` : ''}), ${templatePick.fileCount} files.`,
          `  Install: ${templatePick.installCommand}`,
          `  Preview: ${templatePick.homepageUrl}`,
          '  Start from it when the brief is mostly this screen; fetch it with `get_template`.',
          '',
        )
      }
      lines.push('## Parts')
      for (const s of sections) {
        if (s.pick) {
          lines.push(
            `- ${s.ask}: ${s.pick.name} (${s.pick.slug})${s.pick.hasProps ? ', documented API' : ', self-contained'}` +
              (s.alternatives.length
                ? `. Alternatives: ${s.alternatives.map((a) => a.slug).join(', ')}`
                : ''),
          )
        } else {
          lines.push(`- ${s.ask}: nothing in the catalog. Build it by hand.`)
        }
      }
      lines.push('', '## Steps')
      let n = 1
      if (install.length) {
        lines.push(`${n++}. Install, in this order:`, ...install.map((c) => `   ${c}`))
      }
      const withApi = picks.filter(
        (p, i) => p.hasProps && picks.findIndex((q) => q.slug === p.slug) === i,
      )
      if (withApi.length) {
        lines.push(
          `${n++}. Read the API before writing JSX: get_component_props on ${withApi.map((p) => p.slug).join(', ')}.`,
        )
      }
      if (gaps.length) {
        lines.push(
          `${n++}. Build by hand: ${gaps.join('; ')}. Hold it to get_audit_checklist.`,
        )
      }
      lines.push(
        `${n++}. Compose the page, then run validate_usage on the file.`,
        '',
        'This is a plan from the catalog. No code was generated.',
      )

      return {
        content: [asTextContent(lines.join('\n'))],
        structuredContent: {
          brief,
          system: wanted ?? null,
          template: templatePick
            ? {
                slug: templatePick.slug,
                name: templatePick.name,
                installCommand: templatePick.installCommand,
                homepageUrl: templatePick.homepageUrl,
              }
            : null,
          sections,
          gaps,
          install,
        },
      }
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err))
    }
  },
)

// ── Tool: get_audit_checklist ────────────────────────────────────────────────

const CHECKLIST_SHARED = [
  '## Install',
  '- Every AI Canvas piece came in through its CLI command (get_install_command), so its npm dependencies and registry dependencies such as shared tokens are present. A hand-copied file needs those installed too.',
  '- The packages named in the `// npm install` comment at the top of each component are installed.',
  '',
  '## Props',
  '- validate_usage on the file reports no errors. A warning is a prop outside the documented API: keep it only if the component spreads unknown props onto its root.',
  '',
  '## Themes',
  '- The result renders in light and dark. Design-system components read their theme from the shared tokens; standalones carry their own dark variants. Nothing is pinned to one theme by a hard-coded colour.',
  '',
  '## Layout',
  '- Works at 320px wide with no horizontal scroll. Hover-only interactions have a tap equivalent. Text meant to be read is at least 14px.',
  '- No fixed pixel widths or heights on layout containers. A component sizes from its parent; a canvas sizes from its container.',
  '',
  '## Motion',
  '- Animation respects prefers-reduced-motion. Every effect that starts a loop, a timer or a listener cleans it up on unmount.',
  '',
  '## Accessibility',
  '- Every interactive element is reachable by keyboard with a visible focus state. Icons that carry meaning have a label; decorative ones are hidden from assistive technology. Text contrast passes on both themes.',
]

const CHECKLIST_PAGE = [
  '# AI Canvas audit checklist: page',
  'Run this on the finished screen before calling it done.',
  '',
  ...CHECKLIST_SHARED,
  '',
  '## Composition',
  '- One design system per screen. Components from two systems are not mixed, and a system component is not restyled with utility classes that fight its tokens.',
  '- Repeated content goes through props or data, never by editing a component source per instance.',
  '- The shared tokens are installed once and imported from their installed path, not copied into the page.',
]

const CHECKLIST_COMPONENT = [
  '# AI Canvas audit checklist: component',
  'Run this on a component you adapted or built to the AI Canvas standard.',
  '',
  ...CHECKLIST_SHARED,
  '',
  '## Structure',
  "- `'use client'` is the first line when the file uses hooks, effects or browser APIs.",
  '- One default export, named after the file. The root element fills its container; nothing inside sets its own viewport height.',
  '- Props have sensible defaults so the component renders with none, and a className prop merges onto the root.',
]

server.registerTool(
  'get_audit_checklist',
  {
    title: 'Get the AI Canvas audit checklist',
    description:
      'Return the checklist to run on a finished page or component built with AI Canvas parts: install completeness, prop correctness (via validate_usage), both themes, layout at 320px, motion cleanup and reduced motion, keyboard and contrast, and composition rules. Use it as the last step of compose_page, or whenever the user asks "is this done right".',
    inputSchema: {
      scope: z
        .enum(['page', 'component'])
        .optional()
        .describe('"page" (default) for a composed screen, "component" for a single adapted or hand-built component.'),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  async ({ scope = 'page' }) => {
    const list = scope === 'component' ? CHECKLIST_COMPONENT : CHECKLIST_PAGE
    return {
      content: [asTextContent(list.join('\n'))],
      structuredContent: { scope, items: list.filter((l) => l.startsWith('- ')).map((l) => l.slice(2)) },
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
