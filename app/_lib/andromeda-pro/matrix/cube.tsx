// @ts-nocheck — authors JSX against untyped design-system components.
// v2 component: imported through the build-time shim.
import { Cube } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

export const cube: MatrixSpec = {
  slug: 'cube',
  sizes: null,
  // Full-surface piece, framed exactly like the other Objects: a full-row card
  // and a positioned box that is the whole stage.
  render: (_size, props) => (
    <div style={{ width: 760, maxWidth: '100%', height: 440, position: 'relative' }}>
      <Cube {...props} />
    </div>
  ),
  wide: true,
  // Default is the canonical look. Dense is the one other lattice the source
  // ships, and Paused shows the composed still frame a caller can hold.
  variants: [
    { label: 'Default', props: {} },
    { label: 'Dense', props: { density: 'dense' } },
    { label: 'Paused', props: { paused: true } },
  ],
  states: [],
  gaps: {
    'Reduced motion':
      'a media query, not a prop — prefers-reduced-motion paints one composed still frame and starts no rAF, so no cell can force it',
  },
}
