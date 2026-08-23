import 'server-only'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ContentLookup } from './content-type'
import { buildLookup, type GateManifest } from './manifest'

let cached: ContentLookup | null = null

/**
 * Load the classifier lookup from registry-data/_manifest.json — written by
 * scripts/generate-registry.mjs from what it ACTUALLY emits, so the paywall
 * classifier can never drift from the registry contents (the previous
 * approach read a designSystem flag off the component registry, which no
 * entry set, silently classifying every design-system component as a free
 * standalone). The underscore name keeps it unservable via /r (filename
 * regex rejects it); outputFileTracingIncludes bundles it on Vercel.
 *
 * If the manifest is missing (build misconfiguration), fall back to a
 * minimal hardcoded set so SYSTEM aggregates and templates still gate, and
 * log loudly. The fallback cannot know which standalones are premium, so it is
 * marked `degraded: true` — routes must then fail CLOSED for non-meta content
 * rather than risk serving a premium standalone for free.
 */
export function loadContentLookup(): ContentLookup {
  if (cached) return cached
  try {
    const raw = readFileSync(join(process.cwd(), 'registry-data', '_manifest.json'), 'utf8')
    cached = buildLookup(JSON.parse(raw) as GateManifest)
  } catch (err) {
    console.error('[registry gate] _manifest.json missing/unreadable — DEGRADED, failing closed:', err)
    // Not cached on purpose: the next request retries the read, so a transient
    // failure does not leave this instance degraded for the rest of its life.
    const fallback = buildLookup({
      systemSlugs: ['andromeda'],
      designSystemSlugs: [],
      templateSlugs: [
        'andromeda-mission-control',
        'andromeda-service-order',
        'andromeda-resource-planning',
        'andromeda-signal-room',
      ],
      premiumSlugs: [],
      brainSlugs: [],
    })
    fallback.degraded = true
    return fallback
  }
  return cached
}
