import { Toggle } from '../../../lib/andromeda-v2.generated'
import { CONTROL_STATES, type MatrixSpec } from './types'

export const toggle: MatrixSpec = {
  slug: 'toggle',
  Component: Toggle,
  sizes: ['sm', 'md', 'lg'],
  baseProps: { label: 'Auto' },
  variants: [
    { label: 'Off', props: {} },
    { label: 'On', props: { defaultChecked: true } },
  ],
  states: [
    ...CONTROL_STATES,
    // The two hover borders differ by state: border.bright when off,
    // accent-100 when on, so both are worth their own cell.
    { label: 'On hover', props: { defaultChecked: true }, force: 'hover' },
    { label: 'Disabled on', props: { disabled: true, defaultChecked: true } },
  ],
  gaps: {
    'Thumb travel': 'the knob slides between ends on the change; both ends are shown as Off and On, the motion between them is not a state',
  },
}
