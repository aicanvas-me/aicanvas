export type ContentType =
  | 'standalone'
  | 'premium-standalone'
  | 'design-system-component'
  | 'design-system'
  | 'template'
  | 'brain'
  | 'meta'

export interface ContentLookup {
  /** Slugs of individual design-system components (carry a `designSystem` flag). */
  designSystemSlugs: Set<string>
  /** Slugs of design-system templates (e.g. andromeda-mission-control). */
  templateSlugs: Set<string>
  /** Bare system names whose whole-system aggregates are premium (e.g. andromeda). */
  systemSlugs: Set<string>
  /**
   * Bare system names whose EVERY item is paid-to-install — components and the
   * token foundation included, not just the aggregates (e.g. andromeda-pro).
   * A free MIT system is absent from this set and keeps the free lane.
   */
  paidSystemSlugs: Set<string>
  /** Slugs of premium-only STANDALONE components (closed-source, born premium). */
  premiumSlugs: Set<string>
  /** Slugs of gated design-system BRAIN items (e.g. andromeda-brain). */
  brainSlugs: Set<string>
  /**
   * True when this lookup came from the missing-manifest fallback. The fallback
   * cannot know which standalones are premium, so routes MUST fail closed for
   * non-meta content rather than risk serving a premium standalone for free.
   */
  degraded?: boolean
}

// Catalog/index files the CLI and MCP need to browse — never gated.
const META_SLUGS = new Set(['registry', 'aicanvas-mcp'])

/**
 * Classify a registry slug (with or without a trailing `.json`).
 *
 * The registry contains more than per-component files. `generate-registry.mjs`
 * also emits, per design system, three whole-system aggregates:
 *   <system>.json         (the system as one item)
 *   <system>-all.json     (system + every template, the entire premium catalog)
 *   <system>-tokens.json  (the token foundation)
 * These are matched EXACTLY, not by an `<system>-*` prefix, because a
 * standalone can legitimately share a system's name prefix — e.g.
 * `andromeda-button` is a free standalone, not part of the Andromeda system.
 * A broad prefix would wrongly gate it. Real design-system components and
 * templates are caught by the explicit lookup sets above instead.
 */
export function classifyContent(slugOrFile: string, lookup: ContentLookup): ContentType {
  const slug = slugOrFile.replace(/\.json$/, '')

  if (META_SLUGS.has(slug)) return 'meta'
  if (lookup.templateSlugs.has(slug)) return 'template'

  // Design-system brains (the .md rules corpus, e.g. andromeda-brain): premium,
  // gated mode-independently like premium-standalone. Explicit set, exact match.
  if (lookup.brainSlugs.has(slug)) return 'brain'

  // Whole-system aggregates stay premium-only (the "install the entire system"
  // items). Matched EXACTLY (see note above) so a standalone sharing the name
  // prefix — e.g. `andromeda-button` — is not caught here.
  // The token foundation (`<system>-tokens`) is the ONE exception: it is a free
  // shared dependency every free DS component pulls in. Gating it would break
  // free installs of those components, so classifying it 'meta' keeps it free +
  // uncounted, while the aggregates and templates stay premium.
  for (const system of lookup.systemSlugs) {
    // A paid system's foundation is NOT the free shared dependency the
    // exception below was written for: it is that system's tokens, and handing
    // it out publicly hands out the palette the system is sold on.
    if (slug === `${system}-tokens`) {
      return lookup.paidSystemSlugs.has(system) ? 'premium-standalone' : 'meta'
    }
    if (slug === system || slug === `${system}-all`) return 'design-system'
  }

  // A paid system's individual components gate binary and fail-closed, exactly
  // like a premium standalone: free to explore on the site, paid to install.
  for (const system of lookup.paidSystemSlugs) {
    if (slug.startsWith(`${system}-`) && lookup.designSystemSlugs.has(slug)) {
      return 'premium-standalone'
    }
  }

  // Individual design-system components are FREE like standalones: the source is
  // public, and the one-command install just needs a free account (unlimited,
  // uncounted). Only templates and the whole-system aggregates above are premium.
  if (lookup.designSystemSlugs.has(slug)) return 'design-system-component'

  // Premium-only standalones (closed-source, born premium). They gate like a
  // design system — binary access, never free-metered. The list is empty until
  // the first premium component ships, so this is inert today.
  if (lookup.premiumSlugs.has(slug)) return 'premium-standalone'

  return 'standalone'
}
