// Overview variant A, "Showroom": live first, price last. An unlisted preview
// of a redesigned Andromeda Pro overview, kept beside the real one so the two
// can be compared on the running site. Not in the sitemap, and noindex.
//
// Card and template data are assembled HERE, on the server, the same way
// components/page.tsx does it, and cross to the client view as plain strings
// and numbers. The card component itself is only rendered client-side: it
// imports Phosphor, which must never enter the RSC graph.
import { cookies } from 'next/headers'
import { AndromedaThemeWrap } from '../AndromedaThemeWrap'
import { ANDROMEDA_COMPONENT_META } from '../../../_lib/andromeda-pro/andromeda-meta'
import { COMPONENT_COUNTS } from '../system/component-counts'
import { firstSentence } from '../system/first-sentence'
import type { AndromedaComponentCardData } from '../system/AndromedaComponentCard'
import { OverviewA } from './OverviewA'
import { buildTemplates } from './template-data'

export const metadata = {
  title: 'Andromeda Pro Design System (Overview A)',
  description:
    'Andromeda Pro, the premium design system for dashboards and control rooms. Every component runs live in light and dark.',
  robots: { index: false, follow: false },
}

// The nine cards the Components section shows, in this order. A slug that is
// missing from the metadata is skipped quietly rather than rendering a hole.
const FEATURED = [
  'table-data',
  'date-range-picker',
  'stat-tile',
  'button',
  'input',
  'segmented-control',
  'chart-trend',
  'drawer',
  'nav-item',
]

export default async function AndromedaOverviewAPage() {
  const siteTheme = (await cookies()).get('theme')?.value === 'light' ? 'light' : 'dark'

  const bySlug = new Map(ANDROMEDA_COMPONENT_META.map((m) => [m.slug, m]))
  const featured: AndromedaComponentCardData[] = FEATURED.flatMap((slug) => {
    const m = bySlug.get(slug)
    if (!m) return []
    return [
      {
        slug: m.slug,
        name: m.name,
        description: firstSentence(m.description),
        variants: COMPONENT_COUNTS[m.slug]?.variants ?? 0,
        states: COMPONENT_COUNTS[m.slug]?.states ?? 0,
      },
    ]
  })

  const templates = buildTemplates()

  // Every number the copy states comes from the data, so it cannot drift.
  const counts = {
    components: ANDROMEDA_COMPONENT_META.length,
    variants: ANDROMEDA_COMPONENT_META.reduce(
      (sum, m) => sum + (COMPONENT_COUNTS[m.slug]?.variants ?? 0),
      0,
    ),
    templates: templates.length,
  }

  return (
    <AndromedaThemeWrap initialTheme={siteTheme}>
      <OverviewA featured={featured} templates={templates} counts={counts} />
    </AndromedaThemeWrap>
  )
}
