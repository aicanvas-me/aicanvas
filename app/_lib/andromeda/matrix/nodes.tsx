// @ts-nocheck — authors JSX against untyped design-system components.
// v2 component: imported through the build-time shim.
import { Nodes } from '../../../lib/andromeda-v2.generated'
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
  // ONE canonical look (2026-08-11 ruling): default density, default seed, so
  // every render of the cell is the same composition.
  variants: [{ label: 'The lattice', props: {} }],
  states: [],
  gaps: {
    'Reduced motion':
      'a media query, not a prop — prefers-reduced-motion draws one composed frame with cascades mid-flight and never starts a rAF, so no cell can force it',
  },
}
