import 'server-only'
import { componentCodes } from '@/app/lib/component-codes.generated'
import { getAndromedaComponent } from '@/app/_lib/andromeda/andromeda-registry'
import { andromedaPageSlug } from '@/app/_lib/andromeda/andromeda-meta'

/**
 * Raw source for a component slug, or null if unknown. Standalones come from the
 * generated code map; design-system components resolve through
 * andromedaPageSlug(), which handles the rare slugOverride (Button.tsx ships as
 * `andromeda-button-system` because the free standalone owns `andromeda-button`).
 * Templates and whole-system aggregates never reach here: the gate 402s those.
 */
export async function getComponentCode(slug: string): Promise<string | null> {
  const map = componentCodes as Record<string, string>
  if (map[slug] != null) return map[slug]

  if (slug.startsWith('andromeda-')) {
    const entry = getAndromedaComponent(andromedaPageSlug(slug))
    if (entry) return entry.code
  }

  return null
}
