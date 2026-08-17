// v2 component: imported through the build-time shim.
import { MediaCard } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

// Two photos for the whole section, alternating. The cases differ by ACTION and
// LAYOUT; a third and fourth picture would read as a difference that isn't one.
// PLANET is also the component's own default image.
const PLANET = 'https://ik.imagekit.io/aitoolkit/andromeda/signal-room/mix-01.webp'
const DRIFT = 'https://ik.imagekit.io/aitoolkit/andromeda/signal-room/mix-03.webp'

export const mediaCard: MatrixSpec = {
  slug: 'media-card',
  Component: MediaCard,
  sizes: null,
  variants: [
    { label: 'Play action', props: { code: 'MIX-01', title: 'Your mix', meta: 'Updates daily', action: 'play', image: PLANET } },
    {
      label: 'CTA action',
      props: {
        code: 'CH-04',
        title: 'Deep focus',
        meta: 'Ambient · 2h',
        action: 'cta',
        ctaLabel: 'Open',
        image: DRIFT,
      },
    },
    { label: 'No action', props: { code: 'CH-09', title: 'Static art', meta: 'Cover only', action: 'none', image: PLANET } },
    { label: 'Playing', props: { code: 'MIX-01', title: 'Your mix', meta: 'Now playing', playing: true, image: DRIFT } },
    // stacked is a structurally different render path (image block + plain-surface caption block, no scrim) — worth its own case, not just a prop tweak
    {
      label: 'Stacked',
      props: {
        layout: 'stacked',
        code: 'CH-12',
        title: 'Reactor telemetry',
        // A sentence, not a label: stacked's meta is body copy, and a two-word
        // stub would not show that the line wraps and reads as a description.
        meta: 'Continuous readings from the outer coil array, refreshed every few seconds.',
        action: 'cta',
        // Visible text in stacked, not just an aria label — the case has to show that.
        ctaLabel: 'Discover more',
        image: PLANET,
      },
    },
    // Same caption, code moved onto the photo — the only thing allowed there.
    {
      label: 'Stacked, tag on image',
      props: {
        layout: 'stacked-pinned',
        code: 'CH-12',
        title: 'Reactor telemetry',
        meta: 'Continuous readings from the outer coil array, refreshed every few seconds.',
        action: 'cta',
        ctaLabel: 'Discover more',
        image: DRIFT,
      },
    },
  ],
  states: [],
  gaps: {
    'Card hover':
      'the reveal is a rule in the component\'s own scoped stylesheet, and this source is vault-side — the companion line that would fire it at rest belongs in that repo, not this one',
  },
}
