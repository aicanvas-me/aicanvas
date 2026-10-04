// @ts-nocheck — authors JSX against untyped design-system components.
// v2 component: imported through the build-time shim.
import { Skeleton } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

export const skeleton: MatrixSpec = {
  slug: 'skeleton',
  sizes: ['sm', 'md'],
  // The bars are percentages of the block, so the block needs a width of its
  // own: in the centred inline-flex canvas it would otherwise resolve to the
  // width of nothing.
  render: (size, props) => (
    <div style={{ width: 240, maxWidth: '100%' }}>
      <Skeleton size={size} {...props} />
    </div>
  ),
  // Configurations, not variants: the widths decide what the block stands in
  // for. A ragged last line reads as prose, equal bars read as rows.
  variants: [
    { label: 'Prose', props: {} },
    { label: 'Rows', props: { widths: ['100%', '100%', '100%'] } },
  ],
  states: [],
  gaps: {
    Sweep: 'a perpetual CSS animation with no rest frame — the band is mid-pass at every instant, so a still cell shows an arbitrary position',
  },
}
