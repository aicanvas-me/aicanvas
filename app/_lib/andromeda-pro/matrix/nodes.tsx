// @ts-nocheck — authors JSX against untyped design-system components.
// v2 component: imported through the build-time shim.
import { Nodes } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

export const nodes: MatrixSpec = {
  slug: 'nodes',
  sizes: null,
  // Full-surface piece: a full-row card, sized so the lattice reads as a field
  // rather than a thumbnail.
  render: (_size, props) => (
    <div style={{ width: 760, maxWidth: '100%', height: 440, position: 'relative' }}>
      <Nodes {...props} />
    </div>
  ),
  wide: true,
  // One seed and one density throughout, so the two cells differ in exactly
  // one thing: how much ink the Object is allowed to spend. `ground` is what a
  // whole-screen use needs, where the lattice lies under text that has to be
  // read; `subject` is the default, for a panel the lattice IS the content of.
  variants: [
    { label: 'Subject', props: {} },
    { label: 'Ground', props: { emphasis: 'ground' } },
  ],
  states: [],
  gaps: {
    'Reduced motion':
      'a media query, not a prop — prefers-reduced-motion draws one composed frame with cascades mid-flight and never starts a rAF, so no cell can force it',
  },
}
