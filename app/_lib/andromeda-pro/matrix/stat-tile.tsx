import { StatTile } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

export const statTile: MatrixSpec = {
  slug: 'stat-tile',
  Component: StatTile,
  sizes: null,
  variants: [
    {
      label: 'Rising',
      props: { label: 'Throughput', code: 'REQ-01', value: '7842', unit: 'rps', delta: 2.4, deltaLabel: 'vs prior period' },
    },
    {
      // Latency falling IS the improvement, so polarity keeps the ▼ on accent
      // rather than fault. This case exists to make that rule visible.
      label: 'Falling, lower is better',
      props: {
        label: 'Latency',
        code: 'LAT-02',
        value: '412',
        unit: 'ms',
        delta: -1.2,
        polarity: 'lower-is-better',
        deltaLabel: 'vs prior period',
      },
    },
    {
      label: 'Falling, higher is better',
      props: { label: 'Uptime', code: 'UP-04', value: '99.1', unit: '%', delta: -0.4, deltaLabel: 'vs prior period' },
    },
    { label: 'No delta', props: { label: 'Errors', code: 'ERR-03', value: '1.04', unit: '%', polarity: 'lower-is-better' } },
    { label: 'Live drift', props: { label: 'Signal', code: 'SIG-05', value: '48.2', unit: 'dB', live: true } },
  ],
  states: [],
}
