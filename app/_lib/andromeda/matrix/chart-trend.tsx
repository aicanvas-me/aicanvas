// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
import { TrendChart } from '../../../lib/andromeda-v2.generated'
import { CornerMarkers } from '../../../lib/andromeda-v2.generated'
import { tokens } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

// Deterministic demo telemetry — no Math.random, so SSR and client agree and
// the chart does not redraw differently on every render.
const fract = (x: number) => x - Math.floor(x)
const noise = (i: number, s: number) => fract(Math.sin((i + 1) * 12.9898 + s * 78.233) * 43758.5453)
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const DATA = Array.from({ length: 18 }, (_, i) => {
  const planned = clamp(
    Math.round(120 + Math.sin(i / 4) * 14 + Math.sin(i / 1.7 + 1) * 9 + (noise(i, 1) - 0.5) * 26),
    78,
    150,
  )
  return {
    t: i + 1,
    planned,
    actual: Math.round(planned * (0.78 + noise(i, 2) * 0.18)),
    reserve: Math.round(20 + (noise(i, 3) - 0.5) * 5),
  }
})

const framed = (props: Record<string, unknown>) => (
  <div style={{ position: 'relative', background: tokens.color.surface.raised, padding: tokens.spacing[5], width: '100%' }}>
    <CornerMarkers />
    <TrendChart data={DATA} height={200} {...props} />
  </div>
)

export const trendChart: MatrixSpec = {
  slug: 'chart-trend',
  sizes: null,
  wide: true,
  render: (_size, props) => framed(props),
  variants: [
    {
      // The role ledger is the point of this component: one series is the
      // measurement, the rest are context, and that is what decides the ink.
      label: 'Three roles',
      props: {
        title: 'Throughput vs plan',
        yLabel: 'Requests / sec',
        series: [
          { key: 'planned', label: 'Planned', role: 'baseline' },
          { key: 'actual', label: 'Actual', role: 'live' },
          { key: 'reserve', label: 'Reserve', role: 'context' },
        ],
      },
    },
    {
      label: 'Single series',
      props: {
        title: 'Actual throughput',
        yLabel: 'Requests / sec',
        series: [{ key: 'actual', label: 'Actual', role: 'live' }],
      },
    },
    {
      label: 'With threshold',
      props: {
        title: 'Against ceiling',
        yLabel: 'Requests / sec',
        series: [
          { key: 'actual', label: 'Actual', role: 'live' },
          { key: 'planned', label: 'Ceiling', role: 'threshold' },
        ],
      },
    },
  ],
  states: [],
  gaps: {
    'Point hover': 'the crosshair and readout follow a recharts pointer event, so there is no rest form and no attribute to fire one',
  },
}
