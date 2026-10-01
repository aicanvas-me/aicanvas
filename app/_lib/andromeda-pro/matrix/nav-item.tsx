// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
import { Compass, PencilSimple, PushPin } from '@phosphor-icons/react'
import { NavItem } from '../../../lib/andromeda-pro.generated'
import { PanelMenu } from '../../../lib/andromeda-pro.generated'
import { Tooltip } from '../../../lib/andromeda-pro.generated'
import { tokens } from '../../../lib/andromeda-pro.generated'
import { CONTROL_STATES, type MatrixSpec } from './types'

const noop = () => {}

// The trailing slot is sized for a sm control, and its menu holds things to
// do TO the row's item. The ariaLabel names the item, as the rules require.
const ACTION = (
  <PanelMenu
    size="sm"
    ariaLabel="Overview options"
    items={[
      { label: 'Rename', icon: PencilSimple, onSelect: noop },
      { label: 'Pin', icon: PushPin, onSelect: noop },
    ]}
  />
)

// A nav row has no intrinsic width — it fills its rail. Without a container it
// shrink-wraps to its label and the hover fill reads as a chip, not a row.
const rail = (props: Record<string, unknown>) => (
  <div style={{ width: props.collapsed ? 52 : 220, background: `var(--at-surface-raised, ${tokens.color.surface.raised})` }}>
    {props.collapsed ? (
      <Tooltip label="Overview" position="right" style={{ width: '100%' }}>
        <NavItem icon={Compass} label="Overview" {...props} />
      </Tooltip>
    ) : (
      <NavItem icon={Compass} label="Overview" {...props} />
    )}
  </div>
)

export const navItem: MatrixSpec = {
  slug: 'nav-item',
  sizes: null,
  render: (_size, props) => rail(props),
  // The action slot's reveal lives in the component's own unlayered
  // stylesheet (a real :hover on the row wrapper), which the gated Tailwind
  // variants cannot reach. This is the at-rest twin of that one reveal rule,
  // declaration for declaration.
  forcedStateCss: `
    :where([data-andromeda-matrix]) [data-force~="hover"] .andromeda-navitem-row > .andromeda-navitem-action {
      opacity: 1;
    }
  `,
  variants: [
    { label: 'Default', props: {} },
    { label: 'Active', props: { active: true } },
    { label: 'Collapsed', props: { collapsed: true } },
    { label: 'Collapsed active', props: { collapsed: true, active: true } },
    // The chosen item in a list (the open chat among chats), not the current
    // page: the pressed fill and primary ink, no brand colour, no edge marker.
    { label: 'Selected', props: { selected: true } },
    // The trigger rests at opacity 0 on pointer devices, so at rest this row
    // reads like Default; it shows on hover and focus. "Hover with action"
    // below forces the reveal, and the selected row always shows it.
    { label: 'With action', props: { action: ACTION } },
    { label: 'Selected with action', props: { selected: true, action: ACTION } },
  ],
  states: [
    ...CONTROL_STATES,
    { label: 'Pressed', force: 'active' },
    { label: 'Active hover', props: { active: true }, force: 'hover' },
    { label: 'Hover with action', props: { action: ACTION }, force: 'hover' },
  ],
  gaps: {
    'Active indicator slide': 'the accent edge marker moves between rows with a shared framer layoutId; a single row at rest has nothing to slide from',
  },
}
