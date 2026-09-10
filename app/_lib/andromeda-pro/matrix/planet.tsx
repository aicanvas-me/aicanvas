// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
import { Planet } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

export const planet: MatrixSpec = {
  slug: 'planet',
  sizes: null,
  // Three.js needs a sized, positioned box to fill, and this one is a
  // full-surface piece: a full-row card, not a 260px stub.
  render: (_size, props) => (
    <div style={{ width: 760, maxWidth: '100%', height: 440, position: 'relative' }}>
      <Planet {...props} />
    </div>
  ),
  wide: true,
  // Two sanctioned faces, both shown: a shell of particles, and a porous shell
  // around a dead-centred inner core. Count, pause and colour stay props a caller
  // reaches for, never variant cells — the 2026-08-11 ruling still holds for
  // those; only the face is a look worth showing twice.
  variants: [
    {
      label: 'Shell',
      props: {},
      clientOnly: 'the particle field is built in an effect against a canvas; SSR emits an empty container',
    },
    {
      label: 'Mantle',
      props: { variant: 'mantle' },
      clientOnly: 'the particle field is built in an effect against a canvas; SSR emits an empty container',
    },
  ],
  states: [],
  gaps: {
    Rotation: 'perpetual motion with no rest frame — `paused` composes a still, but the canonical look is the turning one',
  },
}
