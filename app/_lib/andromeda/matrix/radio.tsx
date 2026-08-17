import { Radio } from '../../../lib/andromeda-v2.generated'
import { CONTROL_STATES, type MatrixSpec } from './types'

export const radio: MatrixSpec = {
  slug: 'radio',
  Component: Radio,
  sizes: ['md', 'lg'],
  baseProps: { label: 'Alternate' },
  variants: [
    { label: 'Off', props: {} },
    { label: 'On', props: { defaultChecked: true } },
  ],
  states: [
    ...CONTROL_STATES,
    { label: 'On hover', props: { defaultChecked: true }, force: 'hover' },
    { label: 'Pressed', force: 'active' },
    { label: 'Disabled on', props: { disabled: true, defaultChecked: true } },
  ],
  gaps: {
    'Group selection': 'exclusive selection is RadioGroup composition, not a state of one radio; the group is shown on the component page',
  },
}
