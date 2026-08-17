// v2 component: imported through the build-time shim, never from design-systems/
// directly, so a degraded (free-only) build still compiles.
import { Gauge } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

export const gauge: MatrixSpec = {
  slug: 'gauge',
  Component: Gauge,
  sizes: ['sm', 'md', 'lg'],
  // Configurations, not variants: the reading picks the colour. Each case
  // passes `thresholds` and a value, never a tone — the same law FunnelChart's
  // `tone` and TrendChart's `role` already follow. The threshold ORDER carries
  // the direction, so CPU (high is bad) and fuel/O2 (low is bad) read from one
  // prop with no polarity flag.
  variants: [
    { label: 'Within limits', props: { value: 82, label: 'CPU', thresholds: { warning: 90, fault: 95 } } },
    { label: 'Low fuel', props: { value: 64, label: 'FUEL', thresholds: { warning: 70, fault: 30 } } },
    { label: 'Critical', props: { value: 12, label: 'O2', thresholds: { warning: 40, fault: 20 } } },
    { label: 'No readout', props: { value: 68, showValue: false } },
  ],
  // A gauge is a readout, not a control. Its arc animates to the value on
  // mount, which is a transition and not a state.
  states: [],
}
