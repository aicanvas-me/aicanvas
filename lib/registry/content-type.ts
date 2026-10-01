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
  /**
   * Bare system names, e.g. andromeda. `<system>-all` is premium on every
   * system; the bare `<system>` components bundle is premium only on a paid one.
   */
  systemSlugs: Set<string>
  /**
   * Bare system names whose EVERY item is paid-to-install — components and the
   * token foundation included, not just the aggregates (e.g. andromeda-pro).
   * A free MIT system is absent from this set and keeps the free lane.
   */
  paidSystemSlugs: Set<string>
  /** Slugs of premium-only STANDALONE components (closed-source, born premium). */
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
const META_SLUGS = new Set(['registry', 'aicanvas-mcp', 'aicanvas-props'])

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
    // A paid system's foundation is NOT the free shared dependency the
    // exception below was written for: it is that system's tokens, and handing
    // it out publicly hands out the palette the system is sold on.
    if (slug === `${system}-tokens`) {
      return lookup.paidSystemSlugs.has(system) ? 'premium-standalone' : 'meta'
    }
    // `<system>-all` pulls the templates and the brain in with the components,
    // and those are paid on both systems, so it stays premium either way.
    if (slug === `${system}-all`) return 'design-system'
    // The bare aggregate is that system's COMPONENTS in one install, nothing
    // else. On a paid system that is the product. On a free MIT system it is
    // the same source the per-component files already hand out, so paywalling
    // it only stopped people from taking what is already theirs: it rides the
    // free lane and asks for an account, exactly like one component does.
    if (slug === system) {
      return lookup.paidSystemSlugs.has(system) ? 'design-system' : 'design-system-component'
    }
  }

  // A paid system's individual components gate binary and fail-closed, exactly
  // like a premium standalone: free to explore on the site, paid to install.
  // The PREFIX alone decides, never manifest membership. The source lookup
  // resolves page-style aliases the manifest does not list (a component's page
  // slug under the system prefix), so a membership check let those aliases fall
  // through to a free lane and hand out paid source. No free item may carry a
  // paid system's prefix, so fail-closed costs nothing.
  for (const system of lookup.paidSystemSlugs) {
    if (slug.startsWith(`${system}-`)) return 'premium-standalone'
  }

  // Individual design-system components are FREE like standalones: the source is
  // public, and the one-command install just needs a free account (unlimited,
  // uncounted). Only templates and the whole-system aggregates above are premium.
  if (lookup.designSystemSlugs.has(slug)) return 'design-system-component'

  // Premium-only standalones gate like a design system: binary access, never
  // free-metered.
  if (lookup.premiumSlugs.has(slug)) return 'premium-standalone'

  return 'standalone'
}
