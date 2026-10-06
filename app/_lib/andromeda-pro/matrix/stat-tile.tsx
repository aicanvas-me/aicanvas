import { StatTile, tokens } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

export const statTile: MatrixSpec = {
  slug: 'stat-tile',
  Component: StatTile,
  sizes: null,
  // StatTile is flex-1 so a row of tiles shares a dashboard strip evenly. Alone
  // in a preview canvas that same rule stretched one tile across the whole
  // hero. The cap is one tile's width in a four-up strip.
  baseProps: { style: { maxWidth: `calc(${tokens.spacing[10]} * 8)` } },
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
    {
      label: 'Large, prefix and suffix',
      props: { label: 'Volume', code: 'VOL-06', size: 'lg', prefix: '$', value: '12', suffix: 'B', delta: 3.1, deltaLabel: 'vs last year' },
    },
    {
      // Bare drops the frame so a row of figures can share one surface the
      // caller owns; the caption sits under the figure on one line.
      label: 'Bare, caption below',
      props: { bare: true, labelPosition: 'bottom', size: 'lg', label: 'People and teams on board', value: '3.4', suffix: 'M' },
    },
  ],
  states: [],
}
