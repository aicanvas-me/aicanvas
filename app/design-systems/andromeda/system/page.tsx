// The public Andromeda system page: a gallery of every component, linking to
// its own page. The one-page stacked view moved to ./preview, which is dev-only.
//
// Counts come from component-counts.ts, which is generated from the matrix
// declarations and checked by the coverage test — the specs themselves cannot be
// imported here, because this is a SERVER component and they would drag every
// design-system component (three.js included) into an index page that renders
// none of them.
import { SiteFooter } from '../../../components/SiteFooter'
import { ANDROMEDA_COMPONENT_META } from '../../../_lib/andromeda/andromeda-meta'
import { DESIGN_SYSTEMS } from '../../../../scripts/lib/design-systems.config.mjs'
import { AndromedaGallery } from './AndromedaGallery'
import { CATEGORY } from './categories'
import { COMPONENT_COUNTS } from './component-counts'

export const metadata = {
  title: 'System · Andromeda Design System',
  description:
    'Every Andromeda component: forms, data display, charts, overlays, feedback, navigation and surfaces, each with its variants and its interaction states.',
  alternates: { canonical: '/design-systems/andromeda/system' },
}

// The catalog descriptions are two or three sentences, written for a component
// page. A card wants the first one.
const firstSentence = (text: string) => {
  const end = text.indexOf('. ')
  return end === -1 ? text : text.slice(0, end + 1)
}

export default function ShowcasePage() {
  const andromeda = DESIGN_SYSTEMS.find((s: { slug: string }) => s.slug === 'andromeda')

  // Plain data only — the client gallery filters and groups, so nothing but
  // strings and numbers crosses the boundary.
  const components = ANDROMEDA_COMPONENT_META.map((m) => ({
    slug: m.slug,
    name: m.name,
    category: CATEGORY[m.slug] ?? 'Other',
    description: firstSentence(m.description),
    variants: COMPONENT_COUNTS[m.slug]?.variants ?? 0,
    states: COMPONENT_COUNTS[m.slug]?.states ?? 0,
  }))

  return (
    <>
      <AndromedaGallery components={components} templateCount={andromeda?.templates.length ?? 0} />
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
        <SiteFooter />
      </div>
    </>
  )
}
