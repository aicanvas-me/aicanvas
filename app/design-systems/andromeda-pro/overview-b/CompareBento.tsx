'use client'

// The six tiles on the compare stage. Every part here is a pure-CSS Andromeda
// Pro component, so a layer's local --at-* set retints it. No charts, canvas or
// Objects: those re-resolve their ink from documentElement and would not follow
// a layer. Tiles paint from the layer's tokens, never from the site chrome.
//
// Phones show three tiles (Buttons, Controls, Data) so the stage stays short.
//
// A tile is named for what it holds, not for its lead component: the tile with
// a switch, a checkbox and a radio is Controls, not Toggle.

import type { CSSProperties, ReactNode } from 'react'
import { GearSix } from '@phosphor-icons/react'
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertTitle,
  Avatar,
  Badge,
  Button,
  Checkbox,
  IconButton,
  Input,
  ProgressBar,
  Radio,
  RadioGroup,
  SearchField,
  StatTile,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableStyles,
  Tag,
  Toggle,
  tokens,
} from '../../../lib/andromeda-pro.generated'

// What each tile shows. The section copy counts tiles and components from this
// list, so the numbers on the page always match the stage.
// `wide`: the tile spans both columns of the two-column stage (sm to xl). Beside
// the site rail a half-width Data tile clips its status column, and Status
// spans with it so the last row has no hole. Three columns wait for xl: at lg
// the rail leaves each tile too narrow for the field and the progress bar.
export const BENTO_TILES = [
  { name: 'Buttons', parts: ['Button', 'IconButton'], onPhone: true, wide: false },
  { name: 'Fields', parts: ['Input', 'SearchField'], onPhone: false, wide: false },
  { name: 'Controls', parts: ['Toggle', 'Checkbox', 'Radio'], onPhone: true, wide: false },
  { name: 'Metrics', parts: ['StatTile', 'ProgressBar'], onPhone: false, wide: false },
  { name: 'Data', parts: ['Table', 'Badge'], onPhone: true, wide: true },
  { name: 'Status', parts: ['Tag', 'Avatar', 'Alert'], onPhone: false, wide: true },
] as const

type TileName = (typeof BENTO_TILES)[number]['name']

const TILE_STYLE: CSSProperties = {
  background: 'var(--at-surface-raised)',
  border: '1px solid var(--at-border-base)',
  borderRadius: 4,
}

// The Input's own focus treatment, drawn statically: the stage is inert, so
// nothing inside it can actually take focus.
const FOCUS_LOOK: CSSProperties = {
  borderColor: 'var(--andromeda-focus-ring)',
  boxShadow: '0 0 0 var(--andromeda-border-width, 1px) var(--andromeda-focus-ring)',
}

// One row per state, never the same badge twice: four rows of Online proved
// nothing the first row had not already shown.
const NODES = [
  { name: 'orion-01', status: 'Online', variant: 'success' },
  { name: 'vega-03', status: 'Degraded', variant: 'warning' },
  { name: 'lyra-04', status: 'Down', variant: 'fault' },
] as const

// A caption for a run of controls. Sans, one rung under the tile's own mono
// label, so a group reads as a group without a second box or rule.
function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs" style={{ color: 'var(--at-text-muted)' }}>
      {children}
    </p>
  )
}

function Tile({ name, children }: { name: TileName; children: ReactNode }) {
  const tile = BENTO_TILES.find((t) => t.name === name)
  const onPhone = tile?.onPhone ?? true
  return (
    <div
      className={`${onPhone ? 'flex' : 'hidden sm:flex'} ${tile?.wide ? 'sm:col-span-2 xl:col-span-1' : ''} min-w-0 flex-col gap-4 p-4`}
      style={TILE_STYLE}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: 'var(--at-text-muted)', fontFamily: tokens.typography.fontMono }}
      >
        {name}
      </p>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">{children}</div>
    </div>
  )
}

export function CompareBento() {
  return (
    <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
      <Tile name="Buttons">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Deploy</Button>
          <Button size="sm" variant="outline">
            Preview
          </Button>
          <Button size="sm" variant="ghost">
            Cancel
          </Button>
          <IconButton size="sm" aria-label="Settings" icon={GearSix} />
        </div>
      </Tile>

      <Tile name="Fields">
        <Input label="Callsign" defaultValue="ORION-7" size="sm" style={FOCUS_LOOK} />
        <SearchField size="sm" placeholder="Search nodes" ariaLabel="Search nodes" />
      </Tile>

      <Tile name="Controls">
        <div className="flex flex-col gap-2.5">
          <Toggle label="Telemetry" defaultChecked />
          <Toggle label="Autopilot" />
          <Checkbox label="Log every event" defaultChecked />
        </div>
        <div className="flex flex-col gap-2">
          <GroupLabel>Uplink route</GroupLabel>
          <RadioGroup defaultValue="primary" className="flex-row gap-4" aria-label="Uplink route">
            <Radio value="primary" label="Primary" />
            <Radio value="backup" label="Backup" />
          </RadioGroup>
        </div>
      </Tile>

      <Tile name="Metrics">
        {/* liveRoll, not the count-up: the count-up starts when the tile scrolls
            into view, and the light copy sits under a clip that never reads as
            in view, so it stayed on 0 while the dark copy reached 98.4. */}
        <StatTile label="Uplink" value={98.4} unit="%" delta={1.2} deltaLabel="vs last hour" liveRoll />
        <ProgressBar label="Buffer" value={62} />
      </Tile>

      <Tile name="Data">
        <TableStyles />
        <Table>
          <TableHead>
            <TableRow hoverable={false}>
              <TableHeader>Node</TableHeader>
              <TableHeader align="right">Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {NODES.map((n) => (
              <TableRow key={n.name} hoverable={false}>
                <TableCell>{n.name}</TableCell>
                <TableCell align="right">
                  <Badge variant={n.variant}>{n.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Tile>

      <Tile name="Status">
        <div className="flex flex-wrap gap-2">
          <Tag>eu-west</Tag>
          <Tag variant="accent">primary</Tag>
          <Tag variant="warning">canary</Tag>
        </div>
        <div className="flex flex-col gap-2">
          <GroupLabel>On call</GroupLabel>
          <div className="flex items-center gap-3">
            <Avatar name="Ada Park" status="online" size="sm" />
            <Avatar name="Leo Moss" status="caution" size="sm" />
            <Avatar name="Rin Sato" status="offline" size="sm" />
          </div>
        </div>
        <Alert variant="accent">
          <AlertContent>
            <AlertTitle>Sync complete</AlertTitle>
            <AlertDescription>All 12 nodes report in.</AlertDescription>
          </AlertContent>
        </Alert>
      </Tile>
    </div>
  )
}
