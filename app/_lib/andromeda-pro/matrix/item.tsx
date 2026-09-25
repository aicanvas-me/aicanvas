// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
'use client'

import { useState } from 'react'
import { Check, Database, FileCsv } from '@phosphor-icons/react'
// v2 component: imported through the build-time shim.
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../../../lib/andromeda-pro.generated'
import { tokens } from '../../../lib/andromeda-pro.generated'
import { REST, CONTROL_STATES, type MatrixSpec } from './types'

// The row as a control: a menuitemcheckbox that turns itself on and off, so
// every interactive case on the page does what it shows. `checked` is only
// where it starts.
function CheckRow({ size, variant, checked: startChecked = false, active, disabled, description }) {
  const [checked, setChecked] = useState(Boolean(startChecked))
  return (
    <Item asChild size={size} variant={variant}>
      <button
        type="button"
        role="menuitemcheckbox"
        aria-checked={checked}
        data-active={active ? '' : undefined}
        disabled={disabled}
        onClick={() => setChecked((c) => !c)}
      >
        <ItemMedia>
          <Database weight="regular" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Warehouse</ItemTitle>
          {description ? <ItemDescription>Synced 4 minutes ago</ItemDescription> : null}
        </ItemContent>
        {checked ? (
          <ItemActions>
            <Check size={size === 'sm' ? tokens.iconSize.sm : tokens.iconSize.md} weight="regular" aria-hidden />
          </ItemActions>
        ) : null}
      </button>
    </Item>
  )
}

// The row at rest: a plain div, which stays still under the pointer because
// it promises no click (Item.rules.md).
function StaticRow({ size, variant, description, boxed }) {
  return (
    <Item size={size} variant={variant}>
      <ItemMedia variant={boxed ? 'icon' : 'plain'}>
        <FileCsv weight="regular" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>q3-pipeline-risk.csv</ItemTitle>
        {description ? <ItemDescription>3 rows · written by the agent</ItemDescription> : null}
      </ItemContent>
    </Item>
  )
}

export const item: MatrixSpec = {
  slug: 'item',
  sizes: ['sm', 'md'],
  // Two 260px rungs side by side do not fit half a row.
  wide: true,
  statePairColumns: true,
  // A row fills its list, so it needs a width of its own. State cases and
  // their Rest baseline render the row AS a control, the only form that has
  // states at all; variant cases render the plain row.
  render: (size, props, c) => {
    const { interactive, ...rest } = props
    const asControl = interactive || c?.label === REST.label
    return (
      <div style={{ width: 260, maxWidth: '100%' }}>
        {asControl ? <CheckRow size={size ?? 'md'} {...rest} /> : <StaticRow size={size ?? 'md'} {...rest} />}
      </div>
    )
  },
  // Item paints its states from its own scoped stylesheet, not from Tailwind
  // variants, so these are the at-rest twins of its hover, pressed and focus
  // rules, declaration for declaration.
  forcedStateCss: `
    :where([data-andromeda-matrix]) [data-force~="hover"] .andromeda-item:is(button, a[href], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"]):not([aria-checked="true"]) {
      background-color: var(--andromeda-surface-hover) !important;
    }

    :where([data-andromeda-matrix]) [data-force~="active"] .andromeda-item:is(button, a[href], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"]) {
      background-color: var(--andromeda-surface-active) !important;
    }

    :where([data-andromeda-matrix]) [data-force~="focus"] .andromeda-item {
      outline: none;
      box-shadow: inset 0 0 0 var(--andromeda-border-width, 1px) var(--andromeda-focus-ring);
    }
  `,
  variants: [
    { label: 'Default', props: { variant: 'default' } },
    { label: 'Outline', props: { variant: 'outline' } },
    { label: 'With description', props: { variant: 'default', description: true } },
    { label: 'Media icon', props: { variant: 'outline', description: true, boxed: true } },
    { label: 'As a control', props: { variant: 'default', interactive: true } },
  ],
  states: [
    ...CONTROL_STATES.map((s) => ({ ...s, props: { ...s.props, interactive: true } })),
    { label: 'Pressed', props: { interactive: true }, force: 'active' },
    { label: 'Checked', props: { interactive: true, checked: true } },
    { label: 'Cursor row', props: { interactive: true, active: true } },
  ],
}
