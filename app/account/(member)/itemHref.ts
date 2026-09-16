import { andromedaPageSlug } from '../../_lib/andromeda/andromeda-meta'
import { andromedaPageSlug as andromedaProPageSlug } from '../../_lib/andromeda-pro/andromeda-meta'

// Each design system maps its OWN registry slug back to its own page slug, and
// the two maps disagree: Andromeda Pro renames several components for its docs
// (andromeda-pro-table -> table-basic, andromeda-pro-radar-chart -> chart-radar).
// Running a row through the wrong system's map produces a 404, so branch on the
// row's system rather than assuming one.
export function itemHref(row: { system: string | null; slug: string }): string {
  if (row.system === 'andromeda') return `/design-systems/andromeda/${andromedaPageSlug(row.slug)}`
  if (row.system === 'andromeda-pro') return `/design-systems/andromeda-pro/${andromedaProPageSlug(row.slug)}`
  return `/components/${row.slug}`
}
