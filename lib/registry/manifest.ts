import type { ContentLookup } from './content-type'

/**
 * Systems that are paid-to-install no matter what the manifest says. This is
 * the paywall's floor: a build whose manifest is old, partial or degraded still
 * gates these. Add a system here when it ships as paid.
 */
const KNOWN_PAID_SYSTEMS = ['andromeda-pro'] as const

/** Shape of registry-data/_manifest.json (written by generate-registry.mjs). */
export interface GateManifest {
  systemSlugs: string[]
  /**
   * Systems whose every item is paid-to-install (design-systems.config.mjs
   * `paidToInstall`). Absent on a manifest written before this key existed.
   */
  paidSystemSlugs?: string[]
  designSystemSlugs: string[]
  templateSlugs: string[]
  /** Premium-only standalone slugs (from registry-data/_premium.json at build). */
  premiumSlugs: string[]
  /** Gated brain item slugs, e.g. andromeda-brain (from _premium.json brains). */
  brainSlugs?: string[]
}

/** Pure: build the classifier lookup from a manifest object. */
export function buildLookup(manifest: GateManifest): ContentLookup {
  return {
    designSystemSlugs: new Set(manifest.designSystemSlugs),
    templateSlugs: new Set(manifest.templateSlugs),
    systemSlugs: new Set(manifest.systemSlugs),
    // FAIL CLOSED, unlike the tolerant defaults below. An absent key means the
    // manifest predates the tier field, and defaulting to "nothing is paid"
    // would hand Andromeda Pro's whole library out for free. The known paid
    // systems are the floor; the manifest can only ADD to them.
    paidSystemSlugs: new Set([...KNOWN_PAID_SYSTEMS, ...(manifest.paidSystemSlugs ?? [])]),
    // Tolerate an older manifest with no premiumSlugs key (defensive): no
    // premium slugs simply means nothing gates as premium-standalone.
    premiumSlugs: new Set(manifest.premiumSlugs ?? []),
    // Same tolerance for brainSlugs: absent key = no brain item is servable
    // (inject writes the servable JSON and the manifest key in the same build).
    brainSlugs: new Set(manifest.brainSlugs ?? []),
  }
}
