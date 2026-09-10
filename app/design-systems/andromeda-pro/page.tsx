// /design-systems/andromeda-pro is the Andromeda Pro system landing — the page
// the sidebar's "Andromeda Pro" and "Overview" links point at. It renders the
// overview (hero → featured showcase → templates → components). The raw
// component grid lives at /design-systems/andromeda-pro/system; the former
// /overview preview URL 308-redirects (permanent) here (next.config.ts).
import { cookies } from 'next/headers'
import { AndromedaOverview } from './AndromedaOverview'
import { AndromedaThemeWrap } from './AndromedaThemeWrap'
import { ANDROMEDA_COMPONENT_META } from '../../_lib/andromeda-pro/andromeda-meta'

export const metadata = {
  title: 'Andromeda Pro Design System for Dashboards and Control Panels',
  description:
    `A complete, token-driven design system for dashboards, control panels, and data-dense tools. Around ${ANDROMEDA_COMPONENT_META.length} components and 4 templates, all live.`,
  alternates: { canonical: '/design-systems/andromeda-pro' },
}

// Wrapped so the one live Andromeda Pro surface on this page, the System card's
// foundation loop, follows the preview theme. The template and component
// thumbnails beside it are captured images and stay as shot.
//
// The site SEEDS the preview: opening this page with the site in light must show
// the live surface in light, exactly like a component page does. Without the
// seed the wrap defaults to dark and the surface stayed a black card on a light
// page. The preview's own toggle still wins from the first click onward.
export default async function AndromedaPage() {
  const siteTheme = (await cookies()).get('theme')?.value === 'light' ? 'light' : 'dark'
  return (
    <AndromedaThemeWrap initialTheme={siteTheme}>
      <AndromedaOverview />
    </AndromedaThemeWrap>
  )
}
