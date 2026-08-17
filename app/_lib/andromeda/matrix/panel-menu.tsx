// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
import { ArrowClockwise, Copy, Database, Export, EyeSlash, Pencil, Sliders, Star, Clock, Trash } from '@phosphor-icons/react'
import { PanelMenu } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

const noop = () => {}

const ITEMS = [
  { label: 'Refresh', icon: ArrowClockwise, onSelect: noop },
  { label: 'Configure', icon: Sliders, onSelect: noop },
  { label: 'Export', icon: Export, onSelect: noop },
  { type: 'separator' },
  { label: 'Hide', icon: EyeSlash, onSelect: noop },
]

const SUBMENU_ITEMS = [
  { label: 'Edit', icon: Pencil, onSelect: noop },
  { label: 'Copy', icon: Copy, onSelect: noop },
  {
    label: 'Move to',
    icon: Database,
    submenu: [
      { label: 'Starred', icon: Star, onSelect: noop },
      { label: 'Archive', icon: Database, onSelect: noop },
      { label: 'Snoozed', icon: Clock, onSelect: noop },
    ],
  },
  { type: 'separator' },
  { label: 'Delete', icon: Trash, destructive: true, onSelect: noop },
]

const SELECTED_ITEMS = ITEMS.map((item, i) => (i === 1 ? { ...item, selected: true } : item))

export const panelMenu: MatrixSpec = {
  slug: 'panel-menu',
  sizes: ['sm', 'md', 'lg'],
  overflow: true,
  // One card per row. Two cards across leaves three 220px boxes fighting over
  // half a row: they shrink, and the open menus — which keep their own width —
  // slide over each other and past the card. A full row fits all three.
  wide: true,
  // wide's '1 1 100%' would otherwise stack the Rest/selected pair vertically,
  // reading as two examples instead of one comparison.
  statePairColumns: true,
  // A kebab is narrower than the menu it opens, so this box supplies the
  // horizontal room. HEIGHT is not reserved here any more: the renderer takes
  // it from the mounted panel, and a hardcoded minHeight on top of that reserve
  // is pure dead space. minWidth 0 lets the box shrink below 220 instead of
  // spilling past the card border on a phone — an open case turns the body's
  // horizontal scroll off, so a box that cannot shrink has nowhere to go.
  render: (size, props) => (
    <div style={{ width: 220, minWidth: 0 }}>
      <PanelMenu size={size} align="left" items={ITEMS} ariaLabel="Panel options" {...props} />
    </div>
  ),
  variants: [
    { label: 'Closed', props: {} },
    { label: 'Open', props: { staticOpen: true } },
    { label: 'With submenu', props: { staticOpen: true, items: SUBMENU_ITEMS } },
  ],
  // Selection IS a prop, so it is a case above rather than a state; hover is
  // not, for the reason in the gaps.
  states: [{ label: 'Item selected', props: { staticOpen: true, items: SELECTED_ITEMS } }],
  gaps: {
    'Item hover':
      'rows are DATA (an items array), not elements the caller can reach, and the hover rule in the component\'s stylesheet is per-row — marking one would mean lighting all of them, which reads as broken rather than hovered',
    'Flip up': 'the menu chooses up or down from the trigger rect against the viewport at layout time, so the placement is computed, not a prop',
    'Submenu flyout': 'the nested panel opens on pointer or ArrowRight and is positioned the same computed way',
  },
}
