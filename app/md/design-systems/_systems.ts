import 'server-only'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as legacy from '@/app/_lib/andromeda/andromeda-meta'
import * as pro from '@/app/_lib/andromeda-pro/andromeda-meta'
import { ANDROMEDA_PROPS } from '@/app/lib/andromeda-props.generated'
import { availableDesignSystems } from '@/app/lib/available-design-systems'
import { SITE_URL } from '@/app/lib/config'
import { loadContentLookup } from '@/lib/registry/lookup'
import { installTier } from '@/lib/registry/premium-gate'
import type { SystemComponent, SystemInput } from '@/lib/agent-markdown/design-system'

// Data for the design-system markdown twins. Reads the LIGHT meta modules
// only: the andromeda-registry modules carry component source, which no twin
// may ever publish.

interface SystemSource {
  meta: { name: string; tagline: string; description: string; font: string }
  components: { slug: string; name: string; description: string; sourceFile: string }[]
  templates: { folder: string; name: string; description: string }[]
  registrySlug: (pageSlug: string) => string
  /** Sub-pages that sit beside [component]; their markdown is the overview. */
  pages: { path: string; label: string }[]
}

const SOURCES: Record<string, SystemSource> = {
  andromeda: {
    meta: legacy.ANDROMEDA_META,
    components: legacy.ANDROMEDA_COMPONENT_META,
    templates: legacy.ANDROMEDA_TEMPLATE_META,
    registrySlug: legacy.andromedaRegistrySlug,
    pages: [
      { path: 'system', label: 'Every component, live' },
      { path: 'brain', label: 'AI Brain' },
    ],
  },
  'andromeda-pro': {
    meta: pro.ANDROMEDA_META,
    components: pro.ANDROMEDA_COMPONENT_META,
    templates: pro.ANDROMEDA_TEMPLATE_META,
    registrySlug: pro.andromedaRegistrySlug,
    pages: [
      { path: 'components', label: 'Every component, live' },
      { path: 'foundation', label: 'Foundation: tokens, type and color' },
      { path: 'image-pack', label: 'Image pack' },
      { path: 'brain', label: 'AI Brain' },
    ],
  },
}

/**
 * Paths under a system that are real pages but not components. A markdown
 * request for one of them is answered with the system overview, so an agent
 * asking with Accept: text/markdown never gets a 404 for a page that exists.
 * Pro's `system` and `overview-b` redirect in HTML; they are covered too.
 */
export function overviewAliases(system: string): string[] {
  const own = SOURCES[system]?.pages.map((p) => p.path) ?? []
  return system === 'andromeda-pro' ? [...own, 'system', 'overview-b'] : own
}

/** Systems this build serves (Pro drops out on a build without the vault). */
export function systemSlugs(): string[] {
  return availableDesignSystems()
    .map((s: { slug: string }) => s.slug)
    .filter((slug: string) => slug in SOURCES)
}

/** Paid to install. A degraded lookup fails closed: every system reads as paid. */
export function isPaidSystem(system: string): boolean {
  const lookup = loadContentLookup()
  return lookup.degraded === true || lookup.paidSystemSlugs.has(system)
}

export function systemComponents(system: string): SystemComponent[] {
  const src = SOURCES[system]
  if (!src) return []
  return src.components.map((c) => ({
    slug: c.slug,
    registrySlug: src.registrySlug(c.slug),
    name: c.name,
    description: c.description,
  }))
}

export function systemPropTables(system: string, pageSlug: string) {
  const c = SOURCES[system]?.components.find((x) => x.slug === pageSlug)
  if (!c) return []
  return ANDROMEDA_PROPS[system]?.[c.sourceFile.replace(/\.tsx?$/, '')] ?? []
}

/**
 * The FULL prompt from the bundle, exactly as the Pro component page reads it.
 * Callers must pass it through publicSystemPrompt() before publishing.
 * Only the Pro page has a prompt bundle; Legacy pages show none.
 */
export function systemPrompt(system: string, pageSlug: string): string | null {
  if (system !== 'andromeda-pro') return null
  const c = SOURCES[system].components.find((x) => x.slug === pageSlug)
  if (!c) return null
  try {
    const raw = readFileSync(join(process.cwd(), 'registry-data', '_andromeda-pro-prompts.json'), 'utf8')
    const { prompts } = JSON.parse(raw) as { prompts: Record<string, string> }
    return prompts[c.sourceFile.replace(/\.tsx?$/, '')] ?? null
  } catch {
    return null
  }
}

export function systemInput(system: string): SystemInput | null {
  const src = SOURCES[system]
  if (!src || !systemSlugs().includes(system)) return null
  const lookup = loadContentLookup()
  const components = systemComponents(system)
  const example = components[0]?.registrySlug
  const installs = [
    example && {
      tier: installTier(example, lookup),
      command: `npx shadcn@latest add @aicanvas/${system}-<component>`,
      note: `One component, for example \`${example}\``,
    },
    {
      tier: installTier(`${system}-tokens`, lookup),
      command: `npx shadcn@latest add @aicanvas/${system}-tokens`,
      note: 'Foundation only: tokens, utilities, system icon',
    },
    { tier: installTier(system, lookup), command: `npx shadcn@latest add @aicanvas/${system}`, note: 'Every component' },
    {
      tier: installTier(`${system}-all`, lookup),
      command: `npx shadcn@latest add @aicanvas/${system}-all`,
      note: 'Every component plus the templates',
    },
  ].filter((i): i is { tier: string; command: string; note: string } => !!i)

  const brainSlug = `${system}-brain`
  return {
    slug: system,
    name: src.meta.name,
    tagline: src.meta.tagline,
    description: src.meta.description,
    font: src.meta.font,
    paid: isPaidSystem(system),
    components,
    templates: src.templates.map((t) => ({
      folder: t.folder,
      registrySlug: `${system}-${t.folder}`,
      name: t.name,
      description: t.description,
      installTier: installTier(`${system}-${t.folder}`, lookup),
    })),
    installs,
    brain: lookup.brainSlugs.has(brainSlug) ? { installTier: installTier(brainSlug, lookup) } : undefined,
    pages: src.pages,
    siteUrl: SITE_URL,
  }
}
