// /design-systems/andromeda-pro is the Andromeda Pro system landing, the page
// the sidebar's "Andromeda Pro" and "Overview" links point at: the deal first,
// then the proof (hero, compare bento, foundation layers, Brain, templates,
// component inventory). The raw component grid lives at
// /design-systems/andromeda-pro/system; the former /overview preview URL
// 308-redirects here (next.config.ts), and so does the /overview-b review URL.
//
// Everything countable is computed here, on the server, from the same sources
// the components index reads, so no number on the page is typed by hand. The
// site theme cookie seeds the Andromeda preview theme; the preview's own toggle
// still wins from the first click onward.
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { AndromedaThemeWrap } from './AndromedaThemeWrap'
import { ANDROMEDA_COMPONENT_META } from '../../_lib/andromeda-pro/andromeda-meta'
import { ANDROMEDA_COMPONENT_META as LEGACY_COMPONENT_META } from '../../_lib/andromeda/andromeda-meta'
import { CATEGORY } from './system/categories'
import { COMPONENT_COUNTS } from './system/component-counts'
import { firstSentence } from './system/first-sentence'
import { OverviewB } from './overview-b/OverviewB'
import { TEMPLATES, type Family, type OverviewComponent, type OverviewStats } from './overview-b/overview-data'

export const metadata: Metadata = {
  title: 'Andromeda Pro Design System for Dashboards and Control Panels',
  description:
    `A complete, token-driven design system for dashboards, control panels, and data-dense tools. Around ${ANDROMEDA_COMPONENT_META.length} components and ${TEMPLATES.length} templates, all live.`,
  alternates: { canonical: '/design-systems/andromeda-pro' },
}

export default async function AndromedaPage() {
  const siteTheme = (await cookies()).get('theme')?.value === 'light' ? 'light' : 'dark'

  // Same card data as the components index page.
  const components: OverviewComponent[] = ANDROMEDA_COMPONENT_META.map((m) => ({
    slug: m.slug,
    name: m.name,
    category: CATEGORY[m.slug] ?? 'Other',
    description: firstSentence(m.description),
    variants: COMPONENT_COUNTS[m.slug]?.variants ?? 0,
    states: COMPONENT_COUNTS[m.slug]?.states ?? 0,
  }))

  // Families in the taxonomy's own order, each counted from the live list.
  const order: string[] = []
  for (const name of Object.values(CATEGORY)) if (!order.includes(name)) order.push(name)
  if (components.some((c) => c.category === 'Other')) order.push('Other')
  const families: Family[] = order
    .map((name) => ({ name, count: components.filter((c) => c.category === name).length }))
    .filter((f) => f.count > 0)

  const stats: OverviewStats = {
    components: components.length,
    variants: Object.values(COMPONENT_COUNTS).reduce((sum, c) => sum + c.variants, 0),
    states: Object.values(COMPONENT_COUNTS).reduce((sum, c) => sum + c.states, 0),
    families: families.length,
    templates: TEMPLATES.length,
    // Dark and light: the two sets andromedaVars() and andromedaLightVars() emit.
    themes: 2,
  }

  return (
    <AndromedaThemeWrap initialTheme={siteTheme}>
      <OverviewB
        components={components}
        stats={stats}
        // Same source the Legacy overview counts from.
        legacyComponents={LEGACY_COMPONENT_META.length}
      />
    </AndromedaThemeWrap>
  )
}
