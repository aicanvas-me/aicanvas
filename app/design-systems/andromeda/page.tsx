// /design-systems/andromeda is the Andromeda system landing — the page the
// sidebar's "Andromeda" link points at. It renders the overview (hero →
// featured showcase → templates → components). The raw component grid lives at
// /design-systems/andromeda/system; the former /overview preview URL
// 308-redirects (permanent) here (next.config.ts).
import { AndromedaOverview } from './AndromedaOverview'
import { ANDROMEDA_COMPONENT_META } from '../../_lib/andromeda/andromeda-meta'

export const metadata = {
  title: 'Andromeda Design System for Dashboards and Control Panels',
  description:
    `A complete, token-driven design system for dashboards, control panels, and data-dense tools. Around ${ANDROMEDA_COMPONENT_META.length} components and 4 templates, all live.`,
  alternates: { canonical: '/design-systems/andromeda' },
}

export default function AndromedaPage() {
  return <AndromedaOverview />
}
