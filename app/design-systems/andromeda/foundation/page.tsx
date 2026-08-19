// The Andromeda foundation: the primitives (color ladders, type ramp, spacing)
// and the WHAT of the three-layer token architecture. The HOW — the family
// shape law, the palette-generation recipe — is brain material and never
// appears here (plan ruling 2026-08-17).
import { FoundationView } from './FoundationView'

export const metadata = {
  title: 'Foundation · Andromeda Design System',
  description:
    'The Andromeda primitives: the depth-numbered neutral ladder, four hue families, the paired type ramp, the spacing grid, and the three-layer token architecture every component is built on.',
  alternates: { canonical: '/design-systems/andromeda/foundation' },
}

export default function FoundationPage() {
  return <FoundationView />
}
