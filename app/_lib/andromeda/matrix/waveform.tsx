// v2 component: imported through the build-time shim.
import { Waveform } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

export const waveform: MatrixSpec = {
  slug: 'waveform',
  Component: Waveform,
  sizes: null,
  wide: true,
  variants: [
    { label: 'Bars', props: {} },
    { label: 'Line only', props: { height: 80, showBars: false } },
    { label: 'No centreline', props: { showCenterline: false } },
    // The only variant with a rest form worth trusting: everything else is a
    // frame out of a running animation.
    { label: 'Paused', props: { paused: true } },
  ],
  states: [],
  gaps: {
    Motion: 'the trace advances every frame with no rest form — a still cell shows an arbitrary moment, which is why the Paused case above exists',
  },
}
