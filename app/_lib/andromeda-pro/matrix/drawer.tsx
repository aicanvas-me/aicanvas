// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
'use client'

import { useState } from 'react'
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from '../../../lib/andromeda-pro.generated'
import { Button } from '../../../lib/andromeda-pro.generated'
import { Input } from '../../../lib/andromeda-pro.generated'
import { Toggle } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

// Andromeda law: dividers sit inset 12px from panel edges (rules.md "Section
// dividers"). DrawerBody already pads content by var(--andromeda-3) = 12px,
// so a full-width hairline here lands exactly on that inset with no extra
// positioning needed.
const CHECKLIST_STYLE = {
  groupLabel: {
    fontFamily: 'var(--andromeda-font-mono)',
    fontSize: 'var(--andromeda-text-sm)',
    textTransform: 'uppercase' as const,
    letterSpacing: 'var(--andromeda-tracking-wider)',
    color: 'var(--andromeda-text-muted)',
  },
  lead: {
    margin: 0,
    fontFamily: 'var(--andromeda-font-sans)',
    fontSize: 'var(--andromeda-text-md)',
    color: 'var(--andromeda-text-secondary)',
  },
  // Native markers, not mark spans. A nested <ul> starts flush with its
  // parent li's text by default, so the sub list's indent continues from
  // the parent bullet's text with no extra math needed.
  list: {
    listStyle: 'disc' as const,
    listStylePosition: 'outside' as const,
    paddingLeft: '1.1em',
    margin: 0,
  },
  subList: {
    listStyle: 'circle' as const,
    listStylePosition: 'outside' as const,
    paddingLeft: '1.1em',
    margin: 0,
  },
  // ::marker inherits color from the li itself; the text span below sets its
  // own color, so only the marker takes this dimmer tone.
  // Rhythm between items is a margin, not a flex gap: `display:flex` on a
  // <ul> suppresses the native ::marker, which is the bullet itself. The
  // li color only tints the marker — the text span keeps its own.
  li:    { color: 'var(--andromeda-text-faint)',   marginBottom: 'var(--andromeda-2)' },
  liLast:{ color: 'var(--andromeda-text-faint)',   marginBottom: 0 },
  subLi: { color: 'var(--andromeda-border-bright)', marginBottom: 'var(--andromeda-1)' },
  bulletText: {
    fontFamily: 'var(--andromeda-font-sans)',
    fontSize: 'var(--andromeda-text-md)',
    color: 'var(--andromeda-text-secondary)',
  },
  subBulletText: {
    fontFamily: 'var(--andromeda-font-sans)',
    fontSize: 'var(--andromeda-text-sm)',
    color: 'var(--andromeda-text-muted)',
  },
  divider: { height: 1, background: 'var(--andromeda-border-subtle)' },
}

// The one component whose open state cannot be a static cell: an open drawer is
// a full-viewport portal, so a pair of them pinned open would bury the page. Each
// case is therefore its own trigger — the honest inline representation, and the
// only one that lets the reviewer see both sides without leaving the page.
function DrawerCase({ side }: { side: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Open {side}
      </Button>
      <Drawer open={open} onOpenChange={setOpen} side={side} size={420}>
        <DrawerHeader>
          <DrawerTitle>Workspace settings</DrawerTitle>
          <DrawerDescription>Configure how this workspace behaves</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Display name" placeholder="Enter a display name" />
            <Toggle label="Auto-save" defaultChecked />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--andromeda-3)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--andromeda-2)' }}>
                <span style={CHECKLIST_STYLE.groupLabel}>CHECKLIST</span>
                <p style={CHECKLIST_STYLE.lead}>Confirm each item before saving.</p>
                <ul style={CHECKLIST_STYLE.list}>
                  <li style={CHECKLIST_STYLE.li}>
                    <span style={CHECKLIST_STYLE.bulletText}>Display name is available</span>
                  </li>
                  <li style={CHECKLIST_STYLE.li}>
                    <span style={CHECKLIST_STYLE.bulletText}>Auto-save is connected</span>
                    <ul style={CHECKLIST_STYLE.subList}>
                      <li style={CHECKLIST_STYLE.subLi}>
                        <span style={CHECKLIST_STYLE.subBulletText}>Backups run nightly</span>
                      </li>
                      <li style={CHECKLIST_STYLE.subLi}>
                        <span style={CHECKLIST_STYLE.subBulletText}>Sync is up to date</span>
                      </li>
                    </ul>
                  </li>
                  <li style={CHECKLIST_STYLE.liLast}>
                    <span style={CHECKLIST_STYLE.bulletText}>Usage is within your plan</span>
                  </li>
                </ul>
              </div>
              <div aria-hidden style={CHECKLIST_STYLE.divider} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--andromeda-2)' }}>
                <span style={CHECKLIST_STYLE.groupLabel}>LIMITS</span>
                <ul style={CHECKLIST_STYLE.list}>
                  <li style={CHECKLIST_STYLE.li}>
                    <span style={CHECKLIST_STYLE.bulletText}>50 GB of storage</span>
                  </li>
                  <li style={CHECKLIST_STYLE.li}>
                    <span style={CHECKLIST_STYLE.bulletText}>10 seats included</span>
                  </li>
                  <li style={CHECKLIST_STYLE.liLast}>
                    <span style={CHECKLIST_STYLE.bulletText}>20% of storage kept free</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button size="sm" onClick={() => setOpen(false)}>
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DrawerFooter>
      </Drawer>
    </>
  )
}

export const drawer: MatrixSpec = {
  slug: 'drawer',
  sizes: null,
  render: (_size, props) => <DrawerCase side={props.side} />,
  variants: [
    { label: 'Right', props: { side: 'right' } },
    { label: 'Left', props: { side: 'left' } },
  ],
  states: [],
  gaps: {
    Open: 'the panel renders through a portal behind a mount gate, so it exists only in the browser and only over the whole viewport — each cell above opens the real thing',
  },
}
