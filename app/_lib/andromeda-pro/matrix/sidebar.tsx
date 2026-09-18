// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
'use client'

import { useState } from 'react'
import { Bell, BookOpen, ChartLine, Compass, Gear, Pulse, Users } from '@phosphor-icons/react'
import { Sidebar } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

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
  variants: [
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
