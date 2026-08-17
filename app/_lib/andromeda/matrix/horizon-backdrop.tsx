// @ts-nocheck — authors JSX against untyped design-system components.
// v2 component: imported through the build-time shim.
import { HorizonBackdrop } from '../../../lib/andromeda-v2.generated'
import { BackdropStage } from './backdrop-stage'
import type { MatrixSpec } from './types'

export const horizonBackdrop: MatrixSpec = {
  slug: 'horizon-backdrop',
  sizes: null,
  render: (_size, props) => (
    <BackdropStage caption="Horizon">
      <HorizonBackdrop {...props} />
    </BackdropStage>
  ),
  variants: [
    { label: 'Default', props: {} },
    { label: 'High horizon', props: { horizon: 0.62 } },
    { label: 'Dense', props: { lines: 28, horizon: 0.35 } },
    // Drop the brighter rule when a real baseline already sits at that
    // altitude — two lines at one height read as a mistake.
    { label: 'No horizon line', props: { showHorizon: false } },
  ],
  states: [],
}
