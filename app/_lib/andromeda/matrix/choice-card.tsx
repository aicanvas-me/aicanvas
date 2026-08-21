// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
'use client'

import { useState } from 'react'
import {
  ChoiceCard,
  ChoiceCardGroup,
} from '../../../lib/andromeda-v2.generated'
import { tokens } from '../../../lib/andromeda-v2.generated'
import { CONTROL_STATES, type MatrixSpec } from './types'

function LiveRadioChoiceCards() {
  const [value, setValue] = useState('automatic')

  return (
    // Two columns: a choice group is a comparison, and side by side is how
    // two options get compared. One short line each keeps the pair scannable
    // at a glance instead of turning the row into a paragraph.
    <ChoiceCardGroup
      aria-label="Deployment mode"
      value={value}
      onValueChange={setValue}
      className="grid grid-cols-2 gap-[var(--andromeda-3)]"
    >
      <ChoiceCard
        control="radio"
        value="automatic"
        title="Automatic"
        description="Deploys every approved change."
      />
      <ChoiceCard
        control="radio"
        value="manual"
        title="Manual"
        description="You confirm each change."
      />
    </ChoiceCardGroup>
  )
}

export const choiceCard: MatrixSpec = {
  slug: 'choice-card',
  Component: ChoiceCard,
  sizes: ['md', 'lg'],
  wide: true,
  // Rest and forced side by side: a choice card fills its container, so
  // left to the flex row the pair stacks and stops reading as one comparison.
  statePairColumns: true,
  baseProps: {
    control: 'checkbox',
    title: 'Keep activity history',
    description: 'Store events for 90 days.',
  },
  variants: [
    { label: 'Radio group', node: <LiveRadioChoiceCards /> },
    // Every configuration shows a PAIR, because one card alone cannot show
    // what a choice card is for: the selected and unselected states have to
    // sit beside each other to be read against one another. The trade is the
    // size ramp — an authored case spans the size axis — and the states below
    // still exercise md and lg.
    {
      label: 'Checkbox',
      node: (
        <div
          style={{
            display: 'grid',
            width: '100%',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            // Read from tokens, not var(--andromeda-3): andromedaVars() emits
            // that custom property on each component ROOT, which here are this
            // wrapper's children, and a custom property inherits down rather
            // than up. The wrapper's own gap resolved to nothing.
            gap: tokens.spacing[3],
          }}
        >
          <ChoiceCard
            control="checkbox"
            title="Keep activity history"
            description="Store events for 90 days."
            defaultChecked
          />
          <ChoiceCard
            control="checkbox"
            title="Send crash reports"
            description="Share errors so we can fix them."
          />
        </div>
      ),
    },
    {
      label: 'Toggle',
      node: (
        <div
          style={{
            display: 'grid',
            width: '100%',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            // Read from tokens, not var(--andromeda-3): andromedaVars() emits
            // that custom property on each component ROOT, which here are this
            // wrapper's children, and a custom property inherits down rather
            // than up. The wrapper's own gap resolved to nothing.
            gap: tokens.spacing[3],
          }}
        >
          <ChoiceCard
            control="toggle"
            title="Status updates"
            description="Post status to your team channel."
            defaultChecked
          />
          <ChoiceCard
            control="toggle"
            title="Night mode"
            description="Dim the interface after hours."
          />
        </div>
      ),
    },
  ],
  states: [
    ...CONTROL_STATES,
    { label: 'Selected', props: { defaultChecked: true } },
    {
      label: 'Selected hover',
      props: { defaultChecked: true },
      force: 'hover',
    },
    {
      label: 'Disabled selected',
      props: { disabled: true, defaultChecked: true },
    },
  ],
}
