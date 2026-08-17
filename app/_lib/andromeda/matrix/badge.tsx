import { Badge } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

export const badge: MatrixSpec = {
  slug: 'badge',
  Component: Badge,
  sizes: ['sm', 'md', 'lg'],
  children: 'Nominal',
  variants: [
    { label: 'Default', props: { variant: 'default' } },
    { label: 'Accent', props: { variant: 'accent' } },
    { label: 'Warning', props: { variant: 'warning' } },
    { label: 'Fault', props: { variant: 'fault' } },
    { label: 'Subtle', props: { variant: 'subtle' } },
    { label: 'Outline', props: { variant: 'outline' } },
  ],
  // A badge is a label, not a control: the source declares no hover, focus,
  // active or disabled treatment at all, so it gets no states grid rather than
  // a row of cells identical to their baseline.
  states: [],
  gaps: {
    'Dot blink': 'the status dot pulses on a loop with no rest frame; it holds steady under reduced motion',
  },
}
