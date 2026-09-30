import { Avatar } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'
import { SAMPLE_AVATARS } from '../sample-pictures'

// The portrait Mission Control already gives Reza Quinn, so the photo case and
// the template agree on who this avatar is. A dark/light pair, so the case also
// shows the picture following the theme. Remote URL on purpose: Avatar's `src`
// path has an onError fallback to initials, and only a real network image
// exercises it.
const PORTRAIT = SAMPLE_AVATARS.butterflyVisor

export const avatar: MatrixSpec = {
  slug: 'avatar',
  Component: Avatar,
  sizes: ['sm', 'md', 'lg'],
  baseProps: { name: 'Reza Quinn' },
  variants: [
    // `src` is a prop, not a cva variant, so this case covers nothing in the
    // enum — it is here because a photo is the other half of what Avatar does
    // and five initials cases never showed it. It leads because the page hero
    // shows the first case, and a picture is how the avatar is mostly seen.
    { label: 'Image', props: { src: PORTRAIT.dark, lightSrc: PORTRAIT.light } },
    { label: 'Initials', props: {} },
    { label: 'Online', props: { status: 'online' } },
    { label: 'Caution', props: { status: 'caution' } },
    { label: 'Fault', props: { status: 'fault' } },
    { label: 'Offline', props: { status: 'offline' } },
  ],
  states: [
    // The whole hover treatment is a 1.05 scale on the tile — no colour moves —
    // so this cell is only legible next to its own Rest baseline.
    { label: 'Hover', force: 'hover' },
  ],
}
