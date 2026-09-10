import { Textarea } from '../../../lib/andromeda-pro.generated'
import { CONTROL_STATES, type MatrixSpec } from './types'

export const textarea: MatrixSpec = {
  slug: 'textarea',
  Component: Textarea,
  sizes: ['sm', 'md', 'lg'],
  // A field is w-full by design; without this it renders at its intrinsic
  // width in the middle of a case that already owns the room.
  fill: true,
  // One card per row instead of two across — same reasoning as Input: a
  // w-full field halves its room the moment it shares a row with a second
  // card, fighting `fill` immediately after granting it.
  wide: true,
  // Without this, wide's Instance flex ('1 1 100%') stacks the Rest/forced
  // pair in a state card instead of sitting them side by side.
  statePairColumns: true,
  // The 260px pin landed on the wrapper div (Textarea forwards `style` there,
  // not to the <textarea>), so it capped the whole field regardless of how
  // much room `fill`/`wide` granted it — same trap the Slider spec had.
  baseProps: { label: 'Notes', placeholder: 'Add a note', rows: 3 },
  variants: [
    { label: 'Default', props: {} },
    // Same shape as Input: error is a string prop that derives the cva state
    // axis, so this case is what covers that axis.
    { label: 'Error', props: { error: 'Brief must be at least 80 characters' } },
  ],
  states: [
    ...CONTROL_STATES,
    { label: 'Error focus', props: { error: 'Brief must be at least 80 characters' }, force: 'focus' },
    { label: 'Filled', props: { defaultValue: 'Re-entry corridor confirmed. Awaiting go for deorbit burn.' } },
  ],
}
