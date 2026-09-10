'use client'

import { useState } from 'react'
import {
  tokens,
  Badge,
  Button,
  Card,
  CardContent,
  DataTable,
  PanelHeader,
  SegmentedControl,
  StatTile,
  TrendChart,
} from '../../lib/andromeda-v2.generated'

/* Range is the chart's own scope, so the control lives in the chart panel's
   header and the KPI window is stated on each tile instead. */
const RANGE_OPTIONS = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
]

const THROUGHPUT = {
  '24h': [
    { t: '00:00', completed: 168, capacity: 400 },
    { t: '02:00', completed: 132, capacity: 400 },
    { t: '04:00', completed: 121, capacity: 400 },
    { t: '06:00', completed: 214, capacity: 400 },
    { t: '08:00', completed: 388, capacity: 600 },
    { t: '10:00', completed: 512, capacity: 600 },
    { t: '12:00', completed: 604, capacity: 600 },
    { t: '14:00', completed: 571, capacity: 600 },
    { t: '16:00', completed: 538, capacity: 600 },
    { t: '18:00', completed: 442, capacity: 600 },
    { t: '20:00', completed: 331, capacity: 400 },
    { t: '22:00', completed: 246, capacity: 400 },
    { t: '24:00', completed: 189, capacity: 400 },
  ],
  '7d': [
    { t: 'Mon', completed: 362, capacity: 450 },
    { t: 'Tue', completed: 398, capacity: 450 },
    { t: 'Wed', completed: 421, capacity: 450 },
    { t: 'Thu', completed: 409, capacity: 450 },
    { t: 'Fri', completed: 447, capacity: 450 },
    { t: 'Sat', completed: 214, capacity: 300 },
    { t: 'Sun', completed: 186, capacity: 300 },
  ],
  '30d': [
    { t: 'Aug 03', completed: 318, capacity: 420 },
    { t: 'Aug 06', completed: 332, capacity: 420 },
    { t: 'Aug 09', completed: 341, capacity: 420 },
    { t: 'Aug 12', completed: 298, capacity: 420 },
    { t: 'Aug 15', completed: 356, capacity: 450 },
    { t: 'Aug 18', completed: 372, capacity: 450 },
    { t: 'Aug 21', completed: 364, capacity: 450 },
    { t: 'Aug 24', completed: 389, capacity: 450 },
    { t: 'Aug 27', completed: 401, capacity: 480 },
    { t: 'Aug 30', completed: 394, capacity: 480 },
  ],
}

const X_INTERVAL = { '24h': 3, '7d': 0, '30d': 2 }

/* Series ink comes from the role, never from a picked colour: `capacity` is the
   planned figure (baseline), `completed` is the measured one (live). */
const SERIES = [
  { key: 'capacity', label: 'Capacity', role: 'baseline' as const },
  { key: 'completed', label: 'Completed', role: 'live' as const },
]

const KPIS = [
  { label: 'Jobs completed', value: 4182, delta: 6.4, polarity: 'higher-is-better' as const },
  { label: 'Success rate', value: 99.2, unit: '%', delta: 0.4, polarity: 'higher-is-better' as const },
  { label: 'Median duration', value: 42.6, unit: 's', delta: -8.1, polarity: 'lower-is-better' as const },
  { label: 'Queue depth', value: 137, delta: 12, polarity: 'lower-is-better' as const },
  { label: 'Active workers', value: 24, delta: 2, polarity: 'none' as const },
]

/* One colour ledger for the whole section: brand = live/active, success = a good
   outcome, warning = degraded, danger = a failure, neutral = no judgment. */
const STATUS = {
  completed: { label: 'Completed', variant: 'success' as const },
  running: { label: 'Running', variant: 'accent' as const },
  retrying: { label: 'Retrying', variant: 'warning' as const },
  failed: { label: 'Failed', variant: 'fault' as const },
  queued: { label: 'Queued', variant: 'subtle' as const },
}

const JOBS = [
  { id: 'jb_8f21c4', name: 'Nightly index rebuild', service: 'Search indexer', region: 'eu-central-1', status: 'completed', duration: '4m 12s' },
  { id: 'jb_8f21c3', name: 'Invoice export', service: 'Billing', region: 'us-east-1', status: 'running', duration: '1m 06s' },
  { id: 'jb_8f21c1', name: 'Webhook replay', service: 'Integrations', region: 'us-east-1', status: 'retrying', duration: '2m 48s' },
  { id: 'jb_8f21be', name: 'Media transcode', service: 'Media', region: 'eu-west-1', status: 'failed', duration: '0m 51s' },
  { id: 'jb_8f21bd', name: 'Daily usage rollup', service: 'Analytics', region: 'us-east-1', status: 'completed', duration: '6m 33s' },
  { id: 'jb_8f21bb', name: 'Customer data sync', service: 'Integrations', region: 'ap-south-1', status: 'queued', duration: 'Not started' },
]

const JOB_COLUMNS = [
  { key: 'name', header: 'Job', primary: true, width: '32%' },
  { key: 'service', header: 'Service', width: '20%', hideBelow: 'md' as const, fold: 'meta' as const },
  { key: 'region', header: 'Region', width: '18%', hideBelow: 'md' as const, fold: 'info' as const },
  {
    key: 'status',
    header: 'Status',
    width: '15%',
    render: (row: { status: keyof typeof STATUS }) => (
      <Badge variant={STATUS[row.status].variant}>{STATUS[row.status].label}</Badge>
    ),
    sortValue: (row: { status: keyof typeof STATUS }) => STATUS[row.status].label,
  },
  { key: 'duration', header: 'Duration', width: '15%', align: 'right' as const },
]

export const BrainTest = () => {
  const [range, setRange] = useState('24h')
  const [openJob, setOpenJob] = useState<string | null>(null)

  return (
    <section
      style={{
        fontFamily: tokens.typography.fontSans,
        background: `var(--andromeda-surface-base, var(--at-surface-base, ${tokens.color.surface.base}))`,
        color: `var(--andromeda-text-secondary, var(--at-text-secondary, ${tokens.color.text.secondary}))`,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[3],
        padding: tokens.spacing[6],
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <PanelHeader
        title="Relay operations"
        actions={<Button variant="default">New job</Button>}
      />

      {/* Recipe 1: a bare strip of framed tiles, seams collapsed to one hairline.
          No Card around it — each tile already owns its corners. */}
      <div style={{ display: 'flex' }}>
        {KPIS.map((kpi, i) => (
          <StatTile
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            unit={kpi.unit}
            delta={kpi.delta}
            deltaLabel="vs last week"
            polarity={kpi.polarity}
            style={{ flex: 1, minWidth: 0, marginLeft: i === 0 ? 0 : -1 }}
          />
        ))}
      </div>

      <Card>
        <PanelHeader
          size="sm"
          title="Throughput"
          actions={
            <SegmentedControl
              size="sm"
              value={range}
              onChange={setRange}
              options={RANGE_OPTIONS}
              ariaLabel="Throughput range"
            />
          }
        />
        <CardContent>
          <TrendChart
            data={THROUGHPUT[range as keyof typeof THROUGHPUT]}
            series={SERIES}
            xKey="t"
            modes={['area']}
            xInterval={X_INTERVAL[range as keyof typeof X_INTERVAL]}
            yLabel="Jobs / hr"
            valueFormatter={(value: number) => `${value} / hr`}
          />
        </CardContent>
      </Card>

      <Card>
        <PanelHeader size="sm" title="Recent jobs" />
        <CardContent>
          <DataTable
            columns={JOB_COLUMNS}
            rows={JOBS}
            getRowKey={(row: { id: string }) => row.id}
            onRowClick={(row: { id: string }) => setOpenJob(row.id === openJob ? null : row.id)}
            selectedRowKey={openJob}
          />
        </CardContent>
      </Card>
    </section>
  )
}
