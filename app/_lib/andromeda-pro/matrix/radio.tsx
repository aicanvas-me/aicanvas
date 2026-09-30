// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
'use client'

import { Radio, RadioGroup } from '../../../lib/andromeda-pro.generated'
import { CONTROL_STATES, type MatrixSpec } from './types'

export const radio: MatrixSpec = {
  slug: 'radio',
  Component: Radio,
  sizes: ['md', 'lg'],
  baseProps: { label: 'Alternate' },
  variants: [
    { label: 'Off', props: {} },
    { label: 'On', props: { defaultChecked: true } },
    {
      label: 'With description',
      props: {
        defaultChecked: true,
        description: 'Runs on the schedule you set, without asking again.',
      },
    },
  ],
  states: [
    ...CONTROL_STATES,
    { label: 'On hover', props: { defaultChecked: true }, force: 'hover' },
    { label: 'Pressed', force: 'active' },
    { label: 'Disabled on', props: { disabled: true, defaultChecked: true } },
    // The GROUP's own disabled prop, which cascades to every radio in it. Shown
    // as a composition because that is the only shape it exists in: one radio
    // cannot demonstrate a prop that belongs to the set.
    {
      label: 'Disabled group',
      node: (
        <RadioGroup
          disabled
          defaultValue="weekly"
          aria-label="Report frequency"
          className="flex flex-col gap-[var(--andromeda-2)]"
        >
          <Radio value="daily" label="Daily" />
          <Radio value="weekly" label="Weekly" />
        </RadioGroup>
      ),
    },
  ],
  gaps: {
    'Group selection': 'exclusive selection is RadioGroup composition, not a state of one radio; the group is shown on the component page',
  },
}
