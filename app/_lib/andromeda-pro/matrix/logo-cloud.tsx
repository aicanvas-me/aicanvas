// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
// v2 component: imported through the build-time shim.
import { LogoCloud, tokens } from '../../../lib/andromeda-pro.generated'
import { type MatrixSpec } from './types'

const LOGOS = ['Northwind', 'Lumen', 'Parallax', 'Vantage', 'Kestrel', 'Meridian'].map((name) => ({ name }))

// Each case is a full row, so the band has a window wide enough to loop in.
export const logoCloud: MatrixSpec = {
  slug: 'logo-cloud',
  sizes: null,
  wide: true,
  render: (_size, props) => (
    <div style={{ width: '100%' }}>
      <LogoCloud logos={LOGOS} {...props} />
    </div>
  ),
  // The mark lift lives in the component's scoped stylesheet, so this is the
  // at-rest twin of that rule, declaration for declaration.
  forcedStateCss: `
    :where([data-andromeda-matrix]) [data-force~="hover"] .andromeda-logo-cloud [data-slot='marquee-item'] {
      color: var(--andromeda-text-primary, ${tokens.color.text.primary}) !important;
    }
  `,
  variants: [
    { label: 'Default', props: { label: 'Teams that already run their money on Andromeda' } },
    { label: 'No label', props: { 'aria-label': 'Customers' } },
  ],
  states: [
    { label: 'Hover', force: 'hover', props: { label: 'Teams that already run their money on Andromeda' } },
  ],
  gaps: {
    'Hover glide': 'the band slows to a stop on hover through the Marquee underneath, a playbackRate tween a still cell cannot show',
  },
}
