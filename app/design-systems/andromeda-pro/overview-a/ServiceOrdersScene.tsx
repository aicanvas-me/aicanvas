'use client'

// The scene on the light and dark compare stage: a "Service orders" screen
// composed from real Andromeda Pro components.
//
// CSS-ONLY PARTS, deliberately. The stage paints this scene twice, each copy
// under its own --at-* set on a wrapper div. That retints anything that reads
// its colour through the var() cascade, but the canvas Objects and the chart
// family resolve their ink from documentElement and would ignore the wrapper.
// So no Gauge, chart, Orb, Planet, Nodes, Burst or FoundationLoopPro here.
//
// The StatTiles use liveRoll, which skips the count-up from zero: the numbers
// are there on first paint (and without JavaScript), so the stage's intro
// sweep is the only motion on it.
//
// Two compositions, swapped by the stage's own width (a container query, not
// the viewport, because the sidebar takes 240px on desktop): the full screen,
// and a lighter one for narrow stages so nothing forces a horizontal scroll.
import type { ReactNode } from 'react'
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  GridBackdrop,
  ProgressBar,
  SegmentedControl,
  StatTile,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableStyles,
  Toggle,
  TopBar,
  tokens,
  type BadgeProps,
  type DataTableProps,
} from '../../../lib/andromeda-pro.generated'

type BadgeVariant = NonNullable<BadgeProps['variant']>
type Columns = NonNullable<DataTableProps['columns']>

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  'In progress': 'accent',
  Scheduled: 'subtle',
  'Waiting parts': 'warning',
  Done: 'success',
}

const ORDERS = [
  { id: 'WO-4821', order: 'WO-4821', task: 'Pump seal replacement', site: 'Line 3', status: 'In progress' },
  { id: 'WO-4818', order: 'WO-4818', task: 'Conveyor belt inspection', site: 'Line 1', status: 'Scheduled' },
  { id: 'WO-4815', order: 'WO-4815', task: 'Compressor oil change', site: 'Plant A', status: 'Waiting parts' },
  { id: 'WO-4812', order: 'WO-4812', task: 'Boiler pressure test', site: 'Plant B', status: 'Scheduled' },
  { id: 'WO-4809', order: 'WO-4809', task: 'Chiller filter swap', site: 'Plant B', status: 'Done' },
]

function StatusBadge({ status }: { status: ReactNode }) {
  const label = String(status)
  return <Badge variant={STATUS_VARIANT[label] ?? 'default'}>{label}</Badge>
}

const ORDER_COLUMNS: Columns = [
  { key: 'order', header: 'Order', width: '112px' },
  { key: 'task', header: 'Task', primary: true },
  { key: 'site', header: 'Site', hideBelow: 'md', fold: 'meta' },
  { key: 'status', header: 'Status', align: 'right', render: (row) => <StatusBadge status={row.status} /> },
]

const RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

// The scene is inert (the stage owns every pointer and key), so a control's
// change handler has nothing to do.
const noop = () => {}

function DesktopScene() {
  return (
    <div className="relative">
      <GridBackdrop fade="edges" />
      <div className="relative z-[1] flex flex-col">
        <TopBar title="Service orders" user={<Avatar name="Maya Okafor" size="sm" status="online" />} />
        {/* Bottom padding keeps the stage's Dark and Light labels off the table. */}
        <div className="flex flex-col gap-4 px-6 pb-14 pt-6">
          <div className="grid grid-cols-3 gap-4">
            <StatTile liveRoll label="Open orders" value={128} />
            <StatTile liveRoll label="Due today" value={14} />
            <StatTile liveRoll label="On-time rate" value="96.4" unit="%" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SegmentedControl value="week" onChange={noop} options={RANGE_OPTIONS} ariaLabel="Date range" />
            <div className="flex flex-wrap items-center gap-5">
              <div className="w-48">
                <ProgressBar label="Crew capacity" value={72} />
              </div>
              <Toggle label="Auto-assign" defaultChecked />
              <Button>Dispatch crew</Button>
            </div>
          </div>
          <DataTable columns={ORDER_COLUMNS} rows={ORDERS} selectedRowKey={null} layout="auto" />
        </div>
      </div>
    </div>
  )
}

// Phone table geometry. On a 400px phone the table gets 310px (16px page
// gutters, the frame's 1px border and 12px padding, this scene's 16px), and at
// the stock 20px cell padding a nowrap Task beside a Waiting parts badge needs
// about 400. So the outer edges take 12px, where the row hairline already
// starts, the seam between the two columns takes 8px, and Task wraps onto a
// second line instead of pushing the badges out of view.
const PHONE_EDGE = tokens.spacing[3]
const PHONE_SEAM = tokens.spacing[2]
const PHONE_TASK = { padding: `${PHONE_EDGE} ${PHONE_SEAM} ${PHONE_EDGE} ${PHONE_EDGE}` }
const PHONE_TASK_TEXT = { ...PHONE_TASK, lineHeight: tokens.typography.leading.textSm }
const PHONE_STATUS = { padding: `${PHONE_EDGE} ${PHONE_EDGE} ${PHONE_EDGE} ${PHONE_SEAM}` }

function PhoneScene() {
  return (
    <div className="relative">
      <GridBackdrop fade="edges" />
      <div className="relative z-[1] flex flex-col gap-3 px-4 pb-12 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <StatTile liveRoll label="Open orders" value={128} />
          <StatTile liveRoll label="Due today" value={14} />
        </div>
        <TableStyles />
        <Table>
          <TableHead>
            <TableRow hoverable={false}>
              <TableHeader style={PHONE_TASK}>Task</TableHeader>
              <TableHeader align="right" style={PHONE_STATUS}>
                Status
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {ORDERS.slice(0, 3).map((o) => (
              <TableRow key={o.id} hoverable={false}>
                <TableCell nowrap={false} style={PHONE_TASK_TEXT}>
                  {o.task}
                </TableCell>
                <TableCell align="right" nowrap style={PHONE_STATUS}>
                  <StatusBadge status={o.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button className="w-full">Dispatch crew</Button>
      </div>
    </div>
  )
}

export function ServiceOrdersScene() {
  return (
    <div className="@container">
      <div className="hidden @2xl:block">
        <DesktopScene />
      </div>
      <div className="@2xl:hidden">
        <PhoneScene />
      </div>
    </div>
  )
}
