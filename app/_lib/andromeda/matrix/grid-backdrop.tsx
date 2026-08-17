// @ts-nocheck — authors JSX against untyped design-system components.
// v2 component: imported through the build-time shim.
import { GridBackdrop } from '../../../lib/andromeda-v2.generated'
import { BackdropStage } from './backdrop-stage'
import type { MatrixSpec } from './types'

export const gridBackdrop: MatrixSpec = {
  slug: 'grid-backdrop',
  sizes: null,
  // A backdrop fills its nearest positioned ancestor, so it has no size of its
  // own to ramp — the stage is the size.
  render: (_size, props) => (
    <BackdropStage caption="Grid">
      <GridBackdrop {...props} />
    </BackdropStage>
  ),
  variants: [
    { label: 'Default', props: {} },
    { label: 'Fine', props: { cell: 24, major: 4 } },
    // 2x the spacing[12] pitch - backdrop pitches are scale values or whole multiples of it
    { label: 'Coarse', props: { cell: 96, major: 3 } },
    { label: 'No major', props: { major: 0 } },
    // The section case: no mask, because a boxed region carries its own edge.
    { label: 'Section', props: { cell: 32, major: 0, fade: 'none' } },
  ],
  states: [],
}
