export type ContentType =
  | 'standalone'
  | 'premium-standalone'
  | 'design-system-component'
  | 'design-system'
  | 'template'
  | 'brain'
  | 'meta'

export interface ContentLookup {
  designSystemSlugs: Set<string>
  templateSlugs: Set<string>
  /** Bare system names, e.g. andromeda; their whole-system aggregates are premium. */
  systemSlugs: Set<string>
  /** Premium-only STANDALONE components, closed-source, born premium. */
  premiumSlugs: Set<string>
  brainSlugs: Set<string>
  /**
   * Set when the manifest was missing. The fallback cannot tell which standalones
   * are premium, so routes MUST fail closed for non-meta content rather than risk
   * serving a premium standalone for free.
   */
  degraded?: boolean
}

// Catalog/index files the CLI and MCP need to browse — never gated.
const META_SLUGS = new Set(['registry', 'aicanvas-mcp'])

/**
 * Classify a registry slug (with or without a trailing `.json`).
 *
 * Besides per-component files, `generate-registry.mjs` emits three whole-system
 * aggregates per design system: `<system>`, `<system>-all` and `<system>-tokens`.
 * They are matched EXACTLY, never by a `<system>-` prefix, because a standalone
 * can legitimately share a system's name prefix (`andromeda-button` is a free
 * standalone) and a broad prefix would wrongly gate it.
 */
export function classifyContent(slugOrFile: string, lookup: ContentLookup): ContentType {
  const slug = slugOrFile.replace(/\.json$/, '')

  if (META_SLUGS.has(slug)) return 'meta'
  if (lookup.templateSlugs.has(slug)) return 'template'

  // Design-system brains (the .md rules corpus) gate like premium-standalone.
  if (lookup.brainSlugs.has(slug)) return 'brain'

  // The token foundation (`<system>-tokens`) is the ONE exception to the premium
  // aggregates: every free DS component pulls it in, so gating it would break
  // their installs. Classifying it 'meta' keeps it free.
  for (const system of lookup.systemSlugs) {
    if (slug === `${system}-tokens`) return 'meta'
    if (slug === system || slug === `${system}-all`) return 'design-system'
  }

  // Individual design-system components are FREE like standalones; only templates
  // and the whole-system aggregates are premium.
  if (lookup.designSystemSlugs.has(slug)) return 'design-system-component'

  // Premium-only standalones gate like a design system: binary access, never
  // free-metered.
  if (lookup.premiumSlugs.has(slug)) return 'premium-standalone'

  return 'standalone'
}
