// @ts-nocheck — authors JSX against untyped design-system components.
// v2 component: imported through the build-time shim.
import { VoidBackdrop, GridBackdrop } from '../../../lib/andromeda-v2.generated'
import { BackdropStage } from './backdrop-stage'
import type { MatrixSpec } from './types'

export const voidBackdrop: MatrixSpec = {
  slug: 'void-backdrop',
  sizes: null,
  render: (_size, props) => (
    <BackdropStage caption="Void">
      <VoidBackdrop {...props} />
      {/* The sanctioned stack, shown in every cell: Void carries the falloff,
          one structural backdrop carries the structure. Alone, a falloff on a
          360px stage is invisible — with the grid on it, it is the whole
          point. */}
      <GridBackdrop cell={40} major={0} fade="none" />
    </BackdropStage>
  ),
  variants: [
    { label: 'Default', props: {} },
    { label: 'Top', props: { origin: 'top' } },
    { label: 'Top left', props: { origin: 'top-left' } },
    { label: 'Bottom', props: { origin: 'bottom' } },
  ],
  states: [],
}
