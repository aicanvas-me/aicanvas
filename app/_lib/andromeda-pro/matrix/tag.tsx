import { Tag } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

const noop = () => {}

export const tag: MatrixSpec = {
  slug: 'tag',
  Component: Tag,
  sizes: ['sm', 'md', 'lg'],
  children: 'Filter',
  variants: [
    { label: 'Default', props: { variant: 'default' } },
    { label: 'Accent', props: { variant: 'accent' } },
    { label: 'Warning', props: { variant: 'warning' } },
    { label: 'Fault', props: { variant: 'fault' } },
    { label: 'Dismissible', props: { onClose: noop } },
  ],
  states: [
    // Every forceable state on a Tag belongs to its CLOSE button, which is the
    // only interactive part: the glyph rests dimmed and comes to full opacity
    // on hover or keyboard focus. A tag with no onClose has nothing to force,
    // so all three cases carry it.
    { label: 'Close hover', props: { onClose: noop }, force: 'hover' },
    { label: 'Close focus visible', props: { onClose: noop }, force: 'focus' },
    { label: 'Close pressed', props: { onClose: noop }, force: 'active' },
  ],
}
