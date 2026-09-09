// Thin route wrapper. The full showcase body lives in AndromedaShowcase.tsx
// so the ideation Andromeda landing can render the same content without
// duplication. The component count reads from ANDROMEDA_COMPONENT_META — the
// same browsable catalog the overview grid and sitemap use — so every surface
// reports one consistent number; templateCount still reads from the config.
import AndromedaShowcase from './AndromedaShowcase'
import { ANDROMEDA_COMPONENT_META } from '../../../_lib/andromeda/andromeda-meta'
import { DESIGN_SYSTEMS } from '../../../../scripts/lib/design-systems.config.mjs'

export const metadata = {
  title: 'System · Andromeda Design System',
  description:
    'Every Andromeda primitive on one page, live and interactive: buttons, charts, tables, overlays, and more.',
  alternates: { canonical: '/design-systems/andromeda/system' },
}

export default function ShowcasePage() {
  const andromeda = DESIGN_SYSTEMS.find((s: { slug: string }) => s.slug === 'andromeda')
  const componentCount = ANDROMEDA_COMPONENT_META.length
  const templateCount = andromeda?.templates.length ?? 0

  return (
    <AndromedaShowcase
      componentCount={componentCount}
      templateCount={templateCount}
    />
  )
}
