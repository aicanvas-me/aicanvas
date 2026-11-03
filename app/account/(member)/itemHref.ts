import { andromedaPageSlug } from '../../_lib/andromeda/andromeda-meta'
import { andromedaPageSlug as andromedaProPageSlug } from '../../_lib/andromeda-pro/andromeda-meta'

// Free standalones that were retired into a design-system component. Rows saved
// or installed before the retirement still hold the old slug with no system, so
// they resolve to the design-system entry instead of a missing COMPONENTS entry.
// The row's stored slug is never rewritten: unsave and collection edits key on it.
const RETIRED_STANDALONES: Record<string, { system: string; slug: string }> = {
  'andromeda-button': { system: 'andromeda', slug: 'andromeda-button-system' },
}

export function resolveRetiredSlug(row: { system: string | null; slug: string }): { system: string | null; slug: string } {
  return (!row.system && RETIRED_STANDALONES[row.slug]) || row
}

// Each design system maps its OWN registry slug back to its own page slug, and
// the two maps disagree: Andromeda Pro renames several components for its docs
// (andromeda-pro-table -> table-basic, andromeda-pro-radar-chart -> chart-radar).
// Running a row through the wrong system's map produces a 404, so branch on the
// row's system rather than assuming one.
export function itemHref(row: { system: string | null; slug: string }): string {
  const { system, slug } = resolveRetiredSlug(row)
  if (system === 'andromeda') return `/design-systems/andromeda/${andromedaPageSlug(slug)}`
  if (system === 'andromeda-pro') return `/design-systems/andromeda-pro/${andromedaProPageSlug(slug)}`
  return `/components/${slug}`
}
