// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
// v2 component: imported through the build-time shim.
import { Marquee, tokens } from '../../../lib/andromeda-pro.generated'
import { type MatrixSpec } from './types'

const WORDS = ['Payments', 'Cards', 'Payroll', 'Invoices', 'Treasury', 'Exchange']

// Each case is a full row, so the track has a window wide enough to loop in.
export const marquee: MatrixSpec = {
  slug: 'marquee',
  sizes: null,
  wide: true,
  render: (_size, props) => (
    <div style={{ width: '100%' }}>
      <Marquee aria-label="Products" separator {...props}>
        {WORDS.map((word) => (
          <span
            key={word}
            style={{
              fontSize: tokens.typography.size.textLg,
              fontWeight: tokens.typography.weight.medium,
              color: `var(--andromeda-text-secondary, ${tokens.color.text.secondary})`,
              whiteSpace: 'nowrap',
            }}
          >
            {word}
          </span>
        ))}
      </Marquee>
    </div>
  ),
  variants: [
    { label: 'Default', props: {} },
    { label: 'Reverse', props: { reverse: true } },
    { label: 'No fade', props: { fade: false } },
  ],
  states: [],
  gaps: {
    'Hover glide': 'hovering tweens the running animation\'s playbackRate to zero with framer animate; a still cell has no rate to show, so hover the track on the page',
    'Reduced motion': 'a media query, not a prop: prefers-reduced-motion drops the animation, the duplicate run and the mask, so no cell can force it',
  },
}
