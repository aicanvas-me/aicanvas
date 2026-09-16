// v2 component: imported through the build-time shim.
import { MediaCard } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'
import { SAMPLE_COVERS } from '../sample-pictures'

// Two photos for the whole section, alternating. The cases differ by ACTION and
// LAYOUT; a third and fourth picture would read as a difference that isn't one.
// The component has no default image; every case passes one.
const CONDUCTOR = SAMPLE_COVERS.starlightConductor
const OVERLOOK = SAMPLE_COVERS.earthOverlook

export const mediaCard: MatrixSpec = {
  slug: 'media-card',
  Component: MediaCard,
  sizes: null,
  variants: [
    { label: 'Play action', props: { code: 'MIX-01', title: 'Your mix', meta: 'Updates daily', action: 'play', image: CONDUCTOR.dark, lightImage: CONDUCTOR.light } },
    {
      label: 'CTA action',
      props: {
        code: 'CH-04',
        title: 'Deep focus',
        meta: 'Ambient · 2h',
        action: 'cta',
        ctaLabel: 'Open',
        image: OVERLOOK.dark,
        lightImage: OVERLOOK.light,
      },
    },
    { label: 'No action', props: { code: 'CH-09', title: 'Static art', meta: 'Cover only', action: 'none', image: CONDUCTOR.dark, lightImage: CONDUCTOR.light } },
    { label: 'Playing', props: { code: 'MIX-01', title: 'Your mix', meta: 'Now playing', playing: true, image: OVERLOOK.dark, lightImage: OVERLOOK.light } },
    // stacked is a structurally different render path (image block + plain-surface caption block, no scrim) — worth its own case, not just a prop tweak
    {
      label: 'Stacked',
      props: {
        layout: 'stacked',
        code: 'CH-12',
        title: 'Late night',
        // A sentence, not a label: stacked's meta is body copy, and a two-word
        // stub would not show that the line wraps and reads as a description.
        meta: 'Continuous readings from the outer coil array, refreshed every few seconds.',
        action: 'cta',
        // Visible text in stacked, not just an aria label — the case has to show that.
        ctaLabel: 'Discover more',
        image: CONDUCTOR.dark,
        lightImage: CONDUCTOR.light,
      },
    },
    // Same caption, code moved onto the photo — the only thing allowed there.
    {
      label: 'Stacked, tag on image',
      props: {
        layout: 'stacked-pinned',
        code: 'CH-12',
        title: 'Late night',
        meta: 'Continuous readings from the outer coil array, refreshed every few seconds.',
        action: 'cta',
        ctaLabel: 'Discover more',
        image: OVERLOOK.dark,
        lightImage: OVERLOOK.light,
      },
    },
  ],
  states: [],
  gaps: {
    'Card hover':
      'the reveal is a rule in the component\'s own scoped stylesheet, and this source is vault-side — the companion line that would fire it at rest belongs in that repo, not this one',
  },
}
