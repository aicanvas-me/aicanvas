// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
'use client'

import { useState } from 'react'
import { Gear, Keyboard, SignOut, UserCircle } from '@phosphor-icons/react'
import { TopBar } from '../../../lib/andromeda-pro.generated'
import { Button } from '../../../lib/andromeda-pro.generated'
import { UserMenu } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

const LABELS = ['Overview', 'Requests', 'History']

// Same rows, same avatar, same status as the UserMenu spec — the identity slot
// must not read as a different product on the two pages that show it.
const ITEMS = [
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'preferences', label: 'Preferences', icon: Gear },
  { id: 'shortcuts', label: 'Keyboard shortcuts', icon: Keyboard },
  { id: 'sep1', type: 'separator' },
  { id: 'signout', label: 'Sign out', icon: SignOut, destructive: true },
]

const SRC =
  'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

// The active link is the bar's only own state, and it is the whole point of the
// nav region: the 2px marker only means something once it MOVES. Same shape the
// other live specs use (segmented-control, date-range-picker) — a named local
// component holding useState, mounted by the case.
//
// The bar has no intrinsic width of its own; it fills a template's full-bleed
// row. So the cell hands it the whole `wide` card at width 100%, which is the
// contract Table's cell uses, instead of a fixed frame.
function LiveTopBar(props: Record<string, unknown>) {
  const [active, setActive] = useState(LABELS[0])
  return (
    <div style={{ width: '100%' }}>
      <TopBar
        links={LABELS.map((label) => ({
          label,
          active: label === active,
          onClick: () => setActive(label),
        }))}
        {...props}
      />
    </div>
  )
}

export const topBar: MatrixSpec = {
  slug: 'top-bar',
  sizes: null,
  wide: true,
  render: (_size, props) => <LiveTopBar {...props} />,
  // The menu opens by CLICK here rather than staticOpen, so the test's popover
  // rule does not demand this line — the behaviour does. Without it the case
  // body is a scroll container and the section is paint-contained, and the
  // panel the reader just opened is clipped on both surfaces.
  overflow: true,
  variants: [
    {
      label: 'Actions',
      // Both buttons ride ONE cta slot. Cluster order is fixed by the
      // component, and the slot is what keeps the secondary on the correct
      // side of the primary. `outline` is the system's secondary button — its
      // colours come from the --button-secondary-* tokens, and it is what the
      // resource-planning template's own bar action uses.
      //
      // sm, because the bar is sm: the slots are the caller's, so matching the
      // cluster to the bar's rung is the caller's line to hold (TopBar.rules.md).
      props: {
        cta: (
          <>
            <Button size="sm" variant="outline">
              Export
            </Button>
            <Button size="sm">Refresh</Button>
          </>
        ),
      },
    },
    {
      label: 'User menu',
      props: {
        user: <UserMenu name="OPS-01" src={SRC} status="online" size="sm" items={ITEMS} />,
      },
    },
    {
      // The other half of the size prop, and the only case that shows what it
      // actually buys: the nav type steps 12 → 14 while the strip stays 60px.
      // Cluster at md to match, which is the rule this card is here to model.
      label: 'Size md',
      props: {
        size: 'md',
        cta: <Button size="md">Refresh</Button>,
        user: <UserMenu name="OPS-01" src={SRC} status="online" size="md" items={ITEMS} />,
      },
    },
  ],
  // The bar itself is chrome; its links carry the only interaction it owns, and
  // the Actions case shows that live rather than as a forced cell.
  states: [],
}
