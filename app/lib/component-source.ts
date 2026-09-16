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
export type DesignSystem = 'andromeda' | 'andromeda-pro'

export async function getComponentCode(
  slug: string,
  system?: DesignSystem,
): Promise<string | null> {
  const map = componentCodes as Record<string, string>
  if (map[slug] != null) return map[slug]

  if (slug.startsWith('andromeda-')) {
    // Legacy and Pro share the `andromeda-` registry namespace but not their
    // component lists, so the SYSTEM decides which tree answers. Callers that
    // name one get exactly that tree; a caller that names none (the CLI, older
    // links) keeps the old behaviour: Pro first, then Legacy for the names only
    // Legacy has (table, data-table, and the metric/trend/radar charts).
    const fromPro = () => getAndromedaComponent(andromedaPageSlug(slug))?.code
    const fromLegacy = () => getLegacyComponent(legacyPageSlug(slug))?.code

    if (system === 'andromeda') return fromLegacy() ?? null
    if (system === 'andromeda-pro') return fromPro() ?? null
    return fromPro() ?? fromLegacy() ?? null
  }

  return null
}
