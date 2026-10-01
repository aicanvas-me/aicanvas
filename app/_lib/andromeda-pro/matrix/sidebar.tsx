// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
'use client'

import { useState } from 'react'
import { Bell, BookOpen, ChartLine, Compass, Gear, Pulse, SignOut, UserCircle, Users } from '@phosphor-icons/react'
import { Sidebar } from '../../../lib/andromeda-pro.generated'
import { tokens } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'
import { SAMPLE_AVATARS } from '../sample-pictures'

const NAV_ITEMS = [
  { label: 'Overview', icon: Compass },
  { label: 'Activity', icon: Pulse },
  { label: 'Reports', icon: ChartLine },
  { label: 'Alerts', icon: Bell },
  { label: 'Members', icon: Users },
]

const FOOTER_ITEMS = [
  { label: 'Docs', icon: BookOpen },
  { label: 'Settings', icon: Gear },
]

// The signed-in user at the foot of the rail, with the account menu that
// opens upward from it. The same row the AI Chat template's rail carries.
const USER = {
  name: 'Ilse Brandt',
  role: 'Revenue Desk',
  src: SAMPLE_AVATARS.butterflyVisor.dark,
  lightSrc: SAMPLE_AVATARS.butterflyVisor.light,
  items: [
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'preferences', label: 'Preferences', icon: Gear },
    { id: 'sep1', type: 'separator' },
    { id: 'signout', label: 'Sign out', icon: SignOut },
  ],
}

// The rail's own active row is the whole point of the component — the marker
// only means something once it MOVES between rows. Same shape the other live
// specs use (top-bar, segmented-control): a named local component holding
// useState, mounted by the case.
//
// The rail has no intrinsic height of its own; it fills a console's full-height
// left edge. So the case hands it a fixed-height frame to stand in — and one
// that shrink-wraps its WIDTH, because the rail sizes itself and a full-width
// wrapper would pad every case out with an empty console the component does
// not have anything to say about.
function LiveSidebar(props: Record<string, unknown>) {
  const [active, setActive] = useState('Overview')
  const items = NAV_ITEMS.map((item) => ({
    ...item,
    active: item.label === active,
    onClick: () => setActive(item.label),
  }))
  return (
    <div
      style={{
        height: 480,
        display: 'inline-flex',
        flexDirection: 'row',
      }}
    >
      <Sidebar title="Console" items={items} footerItems={FOOTER_ITEMS} {...props} />
    </div>
  )
}

export const sidebar: MatrixSpec = {
  slug: 'sidebar',
  // No size ladder — the rail has one fixed geometry per form.
  sizes: null,
  render: (_size, props) => <LiveSidebar {...props} />,
  // The row tooltips (icon-rail form) paint outside the case cell and would
  // otherwise be clipped by content-visibility's implied contain:paint.
  overflow: true,
  // The user row's account menu opens UPWARD, and the matrix reserves 171px
  // above any upward panel so it is not cut off. Inside the rail that room is
  // never needed: the menu opens over the rail's own nav, within its height.
  // Without this the whole rail jumped down the page on the click that opened
  // it. One more class in the selector, so it outranks the reserve rule.
  forcedStateCss: `
    .andromeda-matrix-body:has([data-slot="sidebar"] [data-placement="top"]) {
      padding-top: ${tokens.spacing[6]} !important;
    }
  `,
  variants: [
    // First, so it is the page hero: the fold toggle in the brand block and
    // the user's row at the foot, the way an app rail is built (the AI Chat
    // template's). No utility rows: the account row takes the foot.
    { label: 'Header toggle and user', props: { togglePlacement: 'header', user: USER, footerItems: undefined } },
    { label: 'Collapsible', props: {} },
    { label: 'Starts collapsed', props: { defaultCollapsed: true } },
    { label: 'Static expanded', props: { collapsible: false } },
    { label: 'Icon rail', props: { collapsible: false, defaultCollapsed: true } },
  ],
  states: [],
  gaps: {
    Fold: 'the width is a spring in a MotionValue, so a still cell has no travel to show',
  },
}
