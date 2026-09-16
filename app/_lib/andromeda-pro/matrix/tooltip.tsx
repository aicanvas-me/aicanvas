// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
import { ArrowClockwise } from '@phosphor-icons/react'
import { Tooltip } from '../../../lib/andromeda-pro.generated'
import { IconButton } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

export const tooltip: MatrixSpec = {
  slug: 'tooltip',
  sizes: null,
  // The bubble is position:absolute with no portal, so it needs BOTH escapes a
  // popover case needs: the body must not become a scroll container (an `auto`
  // on one axis computes the other to `auto`), and the showcase section must
  // not sit in a paint-contained box. No case passes staticOpen, so the
  // coverage test does not demand this line — the hover and the focus do, and
  // Matrix.tsx reserves the room the bubble lands in off the wrapper's
  // data-tooltip-placement.
  overflow: true,
  render: (_size, props) => (
    <Tooltip label="Refresh" {...props}>
      <IconButton aria-label="Refresh" icon={ArrowClockwise} />
    </Tooltip>
  ),
  // The four sides are the whole API surface. They look identical until the
  // bubble is up, which is what the gap below is about — the page is live, so
  // hovering any cell answers it.
  variants: [
    { label: 'Top', props: { position: 'top' } },
    { label: 'Bottom', props: { position: 'bottom' } },
    { label: 'Left', props: { position: 'left' } },
    { label: 'Right', props: { position: 'right' } },
  ],
  states: [],
  gaps: {
    Open: 'the bubble mounts from React state on mouseenter and animates through AnimatePresence — there is no open prop and no CSS rule an attribute could fire',
  },
}
