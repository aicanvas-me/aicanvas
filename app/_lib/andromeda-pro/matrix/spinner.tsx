import { Spinner } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

export const spinner: MatrixSpec = {
  slug: 'spinner',
  Component: Spinner,
  sizes: ['sm', 'md', 'lg'],
  // The four colour variants read perfectly well at rest; only the rotation
  // does not, and that is the gap below — not a reason to skip the component.
  variants: [
    { label: 'Default', props: { variant: 'default' } },
    { label: 'Accent', props: { variant: 'accent' } },
    { label: 'Warning', props: { variant: 'warning' } },
    { label: 'Fault', props: { variant: 'fault' } },
  ],
  states: [],
  gaps: {
    Rotation: 'perpetual motion with no rest frame — the arc is mid-sweep at every instant, so a still cell shows an arbitrary angle',
  },
}
