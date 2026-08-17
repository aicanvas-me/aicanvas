// @ts-nocheck — authors JSX against untyped design-system components.
// v2 component: imported through the build-time shim.
import { Orb } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

export const orb: MatrixSpec = {
  slug: 'orb',
  sizes: null,
  // An Object is sized by its slot, never by the viewport: a positioned box is
  // the whole stage. No Card here — the in-surface usage is the demo's job.
  // Full-surface piece, so it gets a full-row card and room to read; a 260px
  // stub reads as a widget, which is the one thing an Object is not.
  render: (_size, props) => (
    <div style={{ width: 760, maxWidth: '100%', height: 440, position: 'relative' }}>
      <Orb {...props} />
    </div>
  ),
  wide: true,
  // ONE canonical look (2026-08-11 ruling): no variant grid. Density, pause and
  // colour are props a caller reaches for, not looks this page sells.
  variants: [{ label: 'The Orb', props: {} }],
  states: [],
  gaps: {
    'Reduced motion':
      'a media query, not a prop — prefers-reduced-motion composes one still frame and starts no rAF, so no cell can force it',
  },
}
