import { andromedaPageSlug } from '../../_lib/andromeda/andromeda-meta'

export function itemHref(row: { system: string | null; slug: string }): string {
  return row.system === 'andromeda'
    ? `/design-systems/andromeda/${andromedaPageSlug(row.slug)}`
    : `/components/${row.slug}`
}
