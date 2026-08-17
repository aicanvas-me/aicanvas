// @ts-nocheck — authors JSX against untyped design-system components.
// v2 component: imported through the build-time shim.
import { Burst } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

export const burst: MatrixSpec = {
  slug: 'burst',
  sizes: null,
  // Full-surface piece: a full-row card, sized so the convergence has somewhere
  // to converge from.
  render: (_size, props) => (
    <div style={{ width: 760, maxWidth: '100%', height: 440, position: 'relative' }}>
      <Burst {...props} />
    </div>
  ),
  wide: true,
  // TWO sanctioned faces (2026-08-12 ruling, supersedes the one-canonical-look
  // ruling of 08-11 for this Object): the field is either gathered around a low
  // focus or mirrored about the frame centre. Density stays a prop, not a look.
  variants: [
    { label: 'Irregular', props: { variant: 'irregular' } },
    { label: 'Symmetry', props: { variant: 'symmetry' } },
  ],
  states: [],
  gaps: {
    'Reduced motion':
      'a media query, not a prop — prefers-reduced-motion paints one composed still frame, with no rAF at all, so no cell can force it',
  },
}
