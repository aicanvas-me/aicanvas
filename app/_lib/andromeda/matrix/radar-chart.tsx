import { RadarChart } from '../../../lib/andromeda-v2.generated'
import { tokens } from '../../../lib/andromeda-v2.generated'
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
  slug: 'radar-chart',
  Component: RadarChart,
  sizes: null,
  wide: true,
  variants: [
    { label: 'Defaults', props: { label: '/// Systems', title: 'Ship diagnostics' } },
    {
      label: 'Own data',
      props: {
        label: '/// Performance',
        title: 'System performance',
        description: 'Current system readiness',
        data: DATA,
        series: [{ key: 'score', label: 'Readiness', color: tokens.color.accent[300] }],
      },
    },
  ],
  states: [],
  gaps: {
    'Axis hover': 'the readout follows a recharts pointer event, so there is no rest form to force',
  },
}
