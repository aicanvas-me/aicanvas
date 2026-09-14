// @ts-nocheck — authors JSX against untyped design-system components.
// v2 component: imported through the build-time shim.
import { ContourBackdrop } from '../../../lib/andromeda-pro.generated'
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
  // The hero is the backdrop alone, filling a positioned box the way it fills
  // the section it is installed behind. No caption, no panel: those are the
  // legibility check the cases below carry. 272px keeps the hero frame at its
  // 420px floor.
  soloRender: (_size, props) => (
    <div style={{ position: 'relative', width: '100%', height: 272 }}>
      <ContourBackdrop {...props} />
    </div>
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
