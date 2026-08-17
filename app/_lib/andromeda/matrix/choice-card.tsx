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
  const [value, setValue] = useState('autonomous')

  return (
    // Two columns: a choice group is a comparison, and side by side is how
    // two options get compared. One short line each keeps the pair scannable
    // at a glance instead of turning the row into a paragraph.
    <ChoiceCardGroup
      aria-label="Flight control mode"
      value={value}
      onValueChange={setValue}
      className="grid grid-cols-2 gap-[var(--andromeda-3)]"
    >
      <ChoiceCard
        control="radio"
        value="autonomous"
        title="Autonomous flight"
        description="Applies approved vectors."
      />
      <ChoiceCard
        control="radio"
        value="crew"
        title="Crew-directed flight"
        description="Crew confirms each vector."
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
    title: 'Retain telemetry',
    description: 'Archive the sensor stream.',
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
            title="Retain telemetry"
            description="Archive the sensor stream."
            defaultChecked
          />
          <ChoiceCard
            control="checkbox"
            title="Relay diagnostics"
            description="Forward fault codes home."
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
            title="Beacon uplink"
            description="Transmit status to the relay."
            defaultChecked
          />
          <ChoiceCard
            control="toggle"
            title="Night watch"
            description="Dim the deck between shifts."
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
