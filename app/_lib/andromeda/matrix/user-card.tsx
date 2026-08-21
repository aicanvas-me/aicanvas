// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
import { Gear, Keyboard, SignOut, UserCircle } from '@phosphor-icons/react'
import { UserCard } from '../../../lib/andromeda-v2.generated'
import { tokens } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

const ITEMS = [
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'preferences', label: 'Preferences', icon: Gear },
  { id: 'shortcuts', label: 'Keyboard shortcuts', icon: Keyboard },
  { id: 'sep1', type: 'separator' },
  { id: 'signout', label: 'Sign out', icon: SignOut },
]

const SRC =
  'https://images.unsplash.com/photo-1669287731461-bd8ce3126710?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

export const userCard: MatrixSpec = {
  slug: 'user-card',
  // Two rungs: the ladder stops at md for this card (see UserCard.tsx).
  sizes: ['sm', 'md'],
  overflow: true,
  // One card per row. Three 300px rails do not fit half a row: they shrank to
  // about half each, which put the name and role back in truncation and slid
  // the open panels — which keep their own width — over one another.
  wide: true,
  // A user card fills the foot of a rail, so it needs a rail-width box to sit
  // in. Room for the open panel is NOT reserved here any more: the renderer
  // takes it from the mounted panel, which also covers a case you open by
  // clicking, and this box could only ever add room BELOW an upward menu.
  // minWidth 0 lets the rail shrink below 220 instead of spilling past the card
  // border on a phone — an open case turns the body's horizontal scroll off, so
  // a box that cannot shrink has nowhere to go.
  render: (size, props) => (
    // 300, not the old 220. A rail-width box was cutting the name and role of
    // every rung once the type went up, and a gallery case that truncates its
    // own sample teaches the reader nothing except that the box is too small.
    // The card is width:100% and takes whatever it is given; the real rail is
    // still narrower, and truncation there is correct behaviour, just not the
    // thing this case exists to show.
    // 360, not 300: the open panel stretches to the card and then grows to fit
    // its widest row, so a box narrower than the panel let the panel of one rung
    // slide over its neighbour. The box has to be at least as wide as what it
    // opens.
    <div style={{ width: 360, minWidth: 0, background: `var(--at-surface-raised, ${tokens.color.surface.raised})` }}>
      <UserCard
        name="Reza Quinn"
        role="Flight Director"
        src={SRC}
        status="online"
        size={size}
        items={ITEMS}
        align="stretch"
        {...props}
      />
    </div>
  ),
  variants: [
    { label: 'Closed', props: {} },
    // Open cases pin md as node cases — a laddered staticOpen case mounts
    // one open panel per rung and they slide over one another (same cure as
    // user-menu). Closed and No role still walk the sm|md ladder.
    {
      label: 'Open up',
      node: (
        <div style={{ width: 360, minWidth: 0, background: `var(--at-surface-raised, ${tokens.color.surface.raised})` }}>
          <UserCard name="Reza Quinn" role="Flight Director" src={SRC} status="online" size="md" items={ITEMS} align="stretch" staticOpen placement="top" />
        </div>
      ),
    },
    {
      label: 'Open down',
      node: (
        <div style={{ width: 360, minWidth: 0, background: `var(--at-surface-raised, ${tokens.color.surface.raised})` }}>
          <UserCard name="Reza Quinn" role="Flight Director" src={SRC} status="online" size="md" items={ITEMS} align="stretch" staticOpen placement="bottom" />
        </div>
      ),
    },
    { label: 'No role', props: { role: undefined } },
  ],
  states: [],
  gaps: {
    'Item hover':
      'the panel rows are DATA (an items array), not elements the caller can reach, and the hover rule is per-row — marking one would mean lighting all of them',
  },
}
