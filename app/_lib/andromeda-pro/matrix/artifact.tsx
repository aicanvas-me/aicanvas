// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowsOut, ChartBar, Check, Copy, DownloadSimple } from '@phosphor-icons/react'
// v2 component: imported through the build-time shim.
import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactClose,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
} from '../../../lib/andromeda-pro.generated'
import { Button } from '../../../lib/andromeda-pro.generated'
import { Drawer, DrawerBody, DrawerHeader } from '../../../lib/andromeda-pro.generated'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableStyles } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

// What the agent made: a small scored table. The same rows feed the table, the
// CSV the Download action saves and the text the Copy action puts on the
// clipboard, so every action hands over exactly what the frame shows.
const RISK_ROWS = [
  { account: 'Acme Corp', stage: 'Negotiation', value: '$540K', risk: 'High' },
  { account: 'Northwind', stage: 'Proposal', value: '$212K', risk: 'Medium' },
  { account: 'Globex', stage: 'Discovery', value: '$98K', risk: 'Low' },
]
const COLUMNS = ['Account', 'Stage', 'Value', 'Risk'] as const

const toCsv = () =>
  [COLUMNS.join(','), ...RISK_ROWS.map((r) => [r.account, r.stage, r.value, r.risk].join(','))].join('\n')

function RiskTable() {
  return (
    <>
      <TableStyles />
      <Table>
        <TableHead>
          <TableRow hoverable={false}>
            {COLUMNS.map((c) => (
              <TableHeader key={c} align={c === 'Value' ? 'right' : 'left'}>{c}</TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {RISK_ROWS.map((r) => (
            // Read-only rows: nothing happens on a click, so nothing lifts.
            <TableRow key={r.account} hoverable={false}>
              <TableCell>{r.account}</TableCell>
              <TableCell muted>{r.stage}</TableCell>
              <TableCell align="right">{r.value}</TableCell>
              <TableCell muted>{r.risk}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

/** Saves the table the frame shows as a CSV file. */
export function downloadRiskCsv() {
  const url = URL.createObjectURL(new Blob([toCsv()], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'q3-pipeline-risk.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// Copy gives its moment of feedback the rules allow: the glyph turns to a
// check and the label to "Copied" for about 1.6s.
function useCopied() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = () => {
    navigator.clipboard?.writeText(toCsv().replace(/,/g, '\t')).catch(() => {})
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }
  return [copied, copy] as const
}

/**
 * A wired artifact, every action live: Expand opens the same header and
 * content in a right Drawer, Download saves the table as CSV, Copy puts it on
 * the clipboard, Close folds the frame away and a button brings it back.
 * `description`, `icon` and the action set are what the cases vary.
 */
export function LiveArtifact({
  icon = true,
  description = true,
  actions = 'all',
}: {
  icon?: boolean
  description?: boolean
  actions?: 'all' | 'copy' | 'none'
}) {
  const [expanded, setExpanded] = useState(false)
  const [closed, setClosed] = useState(false)
  const [copied, copy] = useCopied()

  const heading = (
    <>
      <ArtifactTitle>Q3 pipeline risk</ArtifactTitle>
      {description ? <ArtifactDescription>3 accounts scored · $850K at stake</ArtifactDescription> : null}
    </>
  )

  if (closed) {
    return (
      <Button variant="outline" size="sm" icon={ChartBar} onClick={() => setClosed(false)}>
        Show Q3 pipeline risk
      </Button>
    )
  }

  return (
    <>
      <Artifact style={{ width: '100%' }}>
        <ArtifactHeader icon={icon ? ChartBar : undefined}>
          {heading}
          {actions === 'none' ? null : (
            <ArtifactActions>
              {actions === 'all' ? (
                <>
                  <ArtifactAction label="Expand" icon={ArrowsOut} onClick={() => setExpanded(true)} />
                  <ArtifactAction label="Download CSV" icon={DownloadSimple} hideBelow="sm" onClick={downloadRiskCsv} />
                </>
              ) : null}
              <ArtifactAction label={copied ? 'Copied' : 'Copy table'} icon={copied ? Check : Copy} onClick={copy} />
              {actions === 'all' ? <ArtifactClose onClick={() => setClosed(true)} /> : null}
            </ArtifactActions>
          )}
        </ArtifactHeader>
        <ArtifactContent>
          <RiskTable />
        </ArtifactContent>
      </Artifact>
      {actions === 'all' ? (
        <Drawer open={expanded} onOpenChange={setExpanded} side="right" size={640} aria-label="Q3 pipeline risk">
          <DrawerHeader>
            <ArtifactHeader icon={icon ? ChartBar : undefined}>
              {heading}
              <ArtifactActions>
                <ArtifactAction label="Download CSV" icon={DownloadSimple} onClick={downloadRiskCsv} />
                <ArtifactClose label="Close expanded view" onClick={() => setExpanded(false)} />
              </ArtifactActions>
            </ArtifactHeader>
          </DrawerHeader>
          <DrawerBody>
            <ArtifactContent>
              <RiskTable />
            </ArtifactContent>
          </DrawerBody>
        </Drawer>
      ) : null}
    </>
  )
}

export const artifact: MatrixSpec = {
  slug: 'artifact',
  sizes: null,
  // It holds a table, and a table in half a row is a table that scrolls.
  wide: true,
  // The hero centres the case: its own width is fixed, so a wide
  // cell would lay it from the left edge.
  soloCentered: true,
  // The action tooltips hang under the bar; the body must not become a
  // scroll container that clips them.
  overflow: true,
  // Flex and centred, so the Show button a closed case turns into sits in
  // the middle of the slot; the open frame still fills it at width 100%.
  render: (_size, props) => (
    <div style={{ width: '100%', maxWidth: 640, display: 'flex', justifyContent: 'center' }}>
      <LiveArtifact {...props} />
    </div>
  ),
  // No variant prop: the frame is one design, and what changes is how much
  // the title bar carries.
  variants: [
    { label: 'Full title bar', props: {} },
    { label: 'Title and one action', props: { icon: false, description: false, actions: 'copy' } },
    { label: 'No actions', props: { actions: 'none' } },
  ],
  states: [],
  gaps: {
    'Action hover':
      'each action is an IconButton ghost, whose hover, focus and pressed states are forced on the Icon Button page; the bar adds none of its own',
    'Action tooltip':
      'the label bubble mounts from React state on mouseenter or focus and portals out of the clipping frame, so there is no attribute to force it',
    Expanded: 'the expanded view is a Drawer, which portals to <body> and traps focus; Expand in the first case opens it',
  },
}
