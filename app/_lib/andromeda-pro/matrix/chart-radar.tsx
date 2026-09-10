import { RadarChart } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

const DATA = [
  { axis: 'CPU', score: 94 },
  { axis: 'MEMORY', score: 81 },
  { axis: 'STORAGE', score: 76 },
  { axis: 'NETWORK', score: 88 },
  { axis: 'SECURITY', score: 65 },
  { axis: 'API', score: 90 },
]

export const radarChart: MatrixSpec = {
  slug: 'chart-radar',
  Component: RadarChart,
  sizes: null,
  wide: true,
  variants: [
    { label: 'Defaults', props: { label: '/// Services', title: 'Service health' } },
    {
      label: 'Own data',
      props: {
        label: '/// Performance',
        title: 'System performance',
        description: 'Current performance by area',
        data: DATA,
        // No `color`: recharts writes stroke/fill as SVG ATTRIBUTES, where a
        // var() string cannot resolve, so a colour pinned here is frozen at the
        // dark ramp. Left off, the chart resolves its own live series ink.
        series: [{ key: 'score', label: 'Score' }],
      },
    },
  ],
  states: [],
  gaps: {
    'Axis hover': 'the readout follows a recharts pointer event, so there is no rest form to force',
  },
}
