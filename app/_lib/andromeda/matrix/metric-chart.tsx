// v2 component: imported through the build-time shim.
import { MetricChart } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

export const metricChart: MatrixSpec = {
  slug: 'metric-chart',
  Component: MetricChart,
  sizes: null,
  wide: true,
  baseProps: { label: '/// Station', title: 'Orbital altitude', unit: 'km' },
  // Configurations, not variants: the LATEST reading picks the colour. The
  // default series ends at 425km and altitude is low-is-bad, so the three
  // thresholds below move the same data through healthy, warning and fault
  // without touching the series.
  variants: [
    { label: 'Within limits', props: { thresholds: { warning: 410, fault: 400 } } },
    { label: 'Nearing limit', props: { thresholds: { warning: 430, fault: 400 } } },
    { label: 'Critical', props: { thresholds: { warning: 440, fault: 430 } } },
    { label: 'No badge', props: { badgeText: null } },
    { label: 'With description', props: { description: 'Mean altitude over the last 24 hours' } },
  ],
  states: [],
  gaps: {
    'Point hover': 'the readout follows a recharts pointer event, so there is no rest form to force',
  },
}
