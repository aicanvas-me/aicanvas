// @ts-nocheck — authors JSX against untyped design-system components.
// v2 component: imported through the build-time shim.
import { ContourBackdrop } from '../../../lib/andromeda-v2.generated'
import { BackdropStage } from './backdrop-stage'
import type { MatrixSpec } from './types'

export const contourBackdrop: MatrixSpec = {
  slug: 'contour-backdrop',
  sizes: null,
  render: (_size, props) => (
    <BackdropStage caption="Contour">
      <ContourBackdrop {...props} />
    </BackdropStage>
  ),
  variants: [
    // Every case names its seed. The terrain is generated, so a cell without a
    // fixed seed would differ between two screenshots of the same page.
    { label: 'Default', props: { seed: 7 } },
    { label: 'Coarse terrain', props: { seed: 7, scale: 0.0018 } },
    { label: 'Fine terrain', props: { seed: 12, scale: 0.008 } },
    { label: 'Dense lines', props: { seed: 3, lines: 18 } },
  ],
  states: [],
}
