// The Andromeda foundation: the primitives (color ladders, type ramp, spacing)
// and the WHAT of the three-layer token architecture. The HOW — the family
// shape law, the palette-generation recipe — is brain material and never
// appears here.
import { ShowcaseInstall } from '../../../_components/ShowcaseInstall'
import { FoundationView } from './FoundationView'

export const metadata = {
  title: 'Foundation · Andromeda Pro',
  description:
    'The Andromeda Pro primitives: the depth-numbered neutral ladder, four hue families, the paired type ramp, the spacing grid and the three-layer token architecture every component is built on.',
  alternates: { canonical: '/design-systems/andromeda-pro/foundation' },
}

// No theme wrap here: every colour specimen on this page shows its own light
// AND dark rendering inline (each scoped to a local --at-* wrapper), so there
// is no toggle state left for a page-level wrap to carry.
export default function FoundationPage() {
  return (
    <>
      <ShowcaseInstall
        installs={[
          { slug: 'andromeda-pro', label: 'All components' },
          { slug: 'andromeda-pro-all', label: 'Everything' },
        ]}
        phoneFallback={false}
      />
      <FoundationView />
    </>
  )
}
