// v2 component: imported through the build-time shim.
import { FunnelChart } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

const STAGES = [
  { id: 'awareness', label: 'Awareness', value: 4100 },
  { id: 'interest', label: 'Interest', value: 2957 },
  { id: 'consideration', label: 'Consideration', value: 2184 },
  { id: 'intent', label: 'Intent', value: 1038 },
  { id: 'purchase', label: 'Purchase', value: 820 },
]

// Tone is DERIVED from each stage's own step conversion. That is the only
// sanctioned reason a band takes colour — never to tell the five stages apart,
// which the labels already do.
const TONE = (share: number) => (share >= 0.85 ? 'accent' : share >= 0.75 ? 'warning' : 'fault')
const TONED = STAGES.map((stage, i) => ({
  ...stage,
  tone: i === 0 ? 'accent' : TONE(stage.value / STAGES[i - 1].value),
}))

export const funnelChart: MatrixSpec = {
  slug: 'funnel-chart',
  Component: FunnelChart,
  sizes: null,
  wide: true,
  baseProps: { height: 160, style: { width: '100%' } },
  variants: [
    { label: 'Neutral', props: { stages: STAGES } },
    { label: 'Tone from data', props: { stages: TONED, percentOf: 'previous' } },
  ],
  states: [],
  gaps: {
    'Stage hover': 'hovering one stage fades the rest back, which is a subtractive effect driven by pointer state on the bands — no rest form, and the source is vault-side so no companion line can be added from here',
  },
}
