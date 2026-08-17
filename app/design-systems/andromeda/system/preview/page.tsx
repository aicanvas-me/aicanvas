// The Andromeda preview: all 40 components on one page, every variant and every
// state, with forced hover / focus / pressed sitting beside their own Rest
// baseline. INTERNAL. Not a product page — the public /system is a gallery of
// cards, the same shape Lumen uses.
//
// It lives under /design-systems/andromeda/system so it inherits that layout's
// rail and top bar for free.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AndromedaShowcase from './AndromedaShowcase'
import { ANDROMEDA_COMPONENT_META } from '../../../../_lib/andromeda/andromeda-meta'
import { DESIGN_SYSTEMS } from '../../../../../scripts/lib/design-systems.config.mjs'

// Never in production: the route does not exist there, so there is nothing to
// index, nothing to leak, and nothing to keep out of robots.ts or the sitemap.
const DEV_ONLY = process.env.NODE_ENV !== 'production'

// Belt and braces for the day that condition is flipped.
export const metadata: Metadata = {
  title: 'Andromeda preview (internal)',
  robots: { index: false, follow: false },
}

export default function AndromedaPreviewPage() {
  if (!DEV_ONLY) notFound()

  const andromeda = DESIGN_SYSTEMS.find((s: { slug: string }) => s.slug === 'andromeda')
  return (
    <AndromedaShowcase
      componentCount={ANDROMEDA_COMPONENT_META.length}
      templateCount={andromeda?.templates.length ?? 0}
    />
  )
}
