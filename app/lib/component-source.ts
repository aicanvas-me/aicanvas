import 'server-only'
import { componentCodes } from '@/app/lib/component-codes.generated'
import { getAndromedaComponent } from '@/app/_lib/andromeda-pro/andromeda-registry'
import { andromedaPageSlug } from '@/app/_lib/andromeda-pro/andromeda-meta'
import { getAndromedaComponent as getLegacyComponent } from '@/app/_lib/andromeda/andromeda-registry'
import { andromedaPageSlug as legacyPageSlug } from '@/app/_lib/andromeda/andromeda-meta'

/**
 * Returns the raw source string for a component slug, or null if unknown.
 *
 * - Standalones: from the generated code map (does not duplicate source).
 * - Individual design-system components (now free-metered, e.g.
 *   `andromeda-checkbox`): resolved from the system registry via
 *   andromedaPageSlug(), which also handles the rare per-component slugOverride
 *   (e.g. Button.tsx ships as `andromeda-button-system` because the free
 *   standalone owns `andromeda-button`). Pro is tried first, then Legacy, for
 *   the components only Legacy has. Templates + whole-system aggregates
 *   are NOT served here — the gate 402s those before the source is ever needed.
 */
export async function getComponentCode(slug: string): Promise<string | null> {
  const map = componentCodes as Record<string, string>
  if (map[slug] != null) return map[slug]

  if (slug.startsWith('andromeda-')) {
    const entry = getAndromedaComponent(andromedaPageSlug(slug))
    if (entry) return entry.code
    // Andromeda Legacy and Andromeda Pro share the `andromeda-` registry
    // namespace but not their component lists, so a slug Pro does not know may
    // still be a Legacy one: table, data-table, and the metric/trend/radar
    // charts all live only in Legacy and returned null here before.
    const legacy = getLegacyComponent(legacyPageSlug(slug))
    if (legacy) return legacy.code
  }

  return null
}
