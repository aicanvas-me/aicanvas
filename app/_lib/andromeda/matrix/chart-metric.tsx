// v2 component: imported through the build-time shim.
import { MetricChart } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

export const metricChart: MatrixSpec = {
  slug: 'chart-metric',
  Component: MetricChart,
  sizes: null,
  wide: true,
  // A reading anyone can price at a glance. Orbital altitude needed the reader
  // to know which direction was bad before the colours meant anything; response
  // time is high-is-bad to everyone, and the series already sits in the 413-428
  // band that reads naturally as milliseconds.
  baseProps: { label: '/// API', title: 'Response time', unit: 'ms' },
  // Two cases, the same pair the funnel shows: the panel with nothing declared,
  // and the panel colouring itself from the data. Response time is high-is-bad,
  // so warning sits BELOW fault in the pair (see toneFromValue: the order of the
  // two numbers is what states the direction).
  variants: [
    { label: 'Neutral', props: { variant: 'neutral', badgeText: null } },
    { label: 'Tone from data', props: { thresholds: { warning: 440, fault: 460 } } },
  ],
  states: [],
  gaps: {
    'Point hover': 'the readout follows a recharts pointer event, so there is no rest form to force',
  },
}
