import { Checkbox } from '../../../lib/andromeda-v2.generated'
import { CONTROL_STATES, type MatrixSpec } from './types'

export const checkbox: MatrixSpec = {
  slug: 'checkbox',
  Component: Checkbox,
  sizes: ['md', 'lg'],
  baseProps: { label: 'Email notifications' },
  variants: [
    { label: 'Unchecked', props: {} },
    { label: 'Checked', props: { defaultChecked: true } },
  ],
  states: [
    ...CONTROL_STATES,
    // Focus and hover live on the visible box, which is the peer sibling of the
    // invisible input, so the forced marker on the canvas reaches both.
    { label: 'Checked hover', props: { defaultChecked: true }, force: 'hover' },
    { label: 'Pressed', force: 'active' },
    { label: 'Disabled checked', props: { disabled: true, defaultChecked: true } },
  ],
  gaps: {
    'Check pop-in': 'the checkmark scales in on the transition into checked; a checked box at rest has no pop to show',
  },
}
