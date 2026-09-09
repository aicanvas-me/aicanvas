import { Avatar } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

// The portrait Mission Control already gives Reza Quinn, so the photo case and
// the template agree on who this avatar is. Remote URL on purpose: Avatar's
// `src` path has an onError fallback to initials, and only a real network image
// exercises it.
const PORTRAIT =
  'https://images.unsplash.com/photo-1669287731461-bd8ce3126710?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

export const avatar: MatrixSpec = {
  slug: 'avatar',
  Component: Avatar,
  sizes: ['sm', 'md', 'lg'],
  baseProps: { name: 'Reza Quinn' },
  variants: [
    { label: 'Initials', props: {} },
    { label: 'Online', props: { status: 'online' } },
    { label: 'Caution', props: { status: 'caution' } },
    { label: 'Fault', props: { status: 'fault' } },
    { label: 'Offline', props: { status: 'offline' } },
    // `src` is a prop, not a cva variant, so this case covers nothing in the
    // enum — it is here because a photo is the other half of what Avatar does
    // and five initials cases never showed it.
    { label: 'Image', props: { src: PORTRAIT } },
  ],
  states: [
    // The whole hover treatment is a 1.05 scale on the tile — no colour moves —
    // so this cell is only legible next to its own Rest baseline.
    { label: 'Hover', force: 'hover' },
  ],
}
