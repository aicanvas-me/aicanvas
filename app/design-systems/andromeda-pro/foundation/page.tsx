// The Andromeda foundation: the primitives (color ladders, type ramp, spacing)
// and the WHAT of the three-layer token architecture. The HOW — the family
// shape law, the palette-generation recipe — is brain material and never
// appears here (plan ruling 2026-08-17).
import { FoundationView } from './FoundationView'
import { AndromedaThemeWrap } from '../AndromedaThemeWrap'

export const metadata = {
  title: 'Foundation · Andromeda Design System',
  description:
    'The Andromeda primitives: the depth-numbered neutral ladder, four hue families, the paired type ramp, the spacing grid, and the three-layer token architecture every component is built on.',
  alternates: { canonical: '/design-systems/andromeda-pro/foundation' },
}

// The wrap is what makes the palette toggle possible: it defines the --at-*
// set on documentElement, and every swatch below paints through that channel.
// The page chrome around them stays sand: the Andromeda theme is the design
// system's own axis, never the site's.
export default function FoundationPage() {
  return (
    <AndromedaThemeWrap>
      <FoundationView />
    </AndromedaThemeWrap>
  )
}
