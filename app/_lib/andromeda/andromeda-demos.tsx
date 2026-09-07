'use client'

import { useState } from 'react'
import {
  ArrowClockwise,
  Bell,
  ChartBar,
  ChartLine,
  Clock,
  Compass,
  Copy,
  Database,
  EnvelopeOpen,
  Envelope,
  Export,
  EyeSlash,
  Gear,
  Info,
  Keyboard,
  MagnifyingGlass,
  Pencil,
  Pulse,
  SignOut,
  Sliders,
  Star,
  Trash,
  UserCircle,
  Users,
  Warning,
} from '@phosphor-icons/react'

import { tokens } from '../../../design-systems/andromeda/tokens'
import { themeColor } from '../../../design-systems/andromeda/components/lib/utils'
import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from '../../../design-systems/andromeda/components/Alert'
import { Avatar } from '../../../design-systems/andromeda/components/Avatar'
import { Badge } from '../../../design-systems/andromeda/components/Badge'
import { Button } from '../../../design-systems/andromeda/components/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../design-systems/andromeda/components/Card'
import { Checkbox } from '../../../design-systems/andromeda/components/Checkbox'
import { CornerMarkers } from '../../../design-systems/andromeda/components/CornerMarkers'
import { DateRangePicker } from '../../../design-systems/andromeda/components/DateRangePicker'
import { Drawer, DrawerBody, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '../../../design-systems/andromeda/components/Drawer'
import { EmptyState, EmptyStateAction, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle } from '../../../design-systems/andromeda/components/EmptyState'
import { IconButton } from '../../../design-systems/andromeda/components/IconButton'
import { Input } from '../../../design-systems/andromeda/components/Input'
import { SearchField } from '../../../design-systems/andromeda/components/SearchField'
import { NavItem } from '../../../design-systems/andromeda/components/NavItem'
import { PanelHeader } from '../../../design-systems/andromeda/components/PanelHeader'
import { PanelMenu } from '../../../design-systems/andromeda/components/PanelMenu'
import { SegmentedControl } from '../../../design-systems/andromeda/components/SegmentedControl'
import { ProgressBar } from '../../../design-systems/andromeda/components/ProgressBar'
import { HeatGrid } from '../../../design-systems/andromeda/components/HeatGrid'
import { RadarChart } from '../../../design-systems/andromeda/components/RadarChart'
import { TrendChart } from '../../../design-systems/andromeda/components/TrendChart'
import { Radio, RadioGroup } from '../../../design-systems/andromeda/components/Radio'
import { Slider } from '../../../design-systems/andromeda/components/Slider'
import { Spinner } from '../../../design-systems/andromeda/components/Spinner'
import { StatTile } from '../../../design-systems/andromeda/components/StatTile'
import { Tag } from '../../../design-systems/andromeda/components/Tag'
import { Textarea } from '../../../design-systems/andromeda/components/Textarea'
import { Toggle } from '../../../design-systems/andromeda/components/Toggle'
import { Tooltip } from '../../../design-systems/andromeda/components/Tooltip'
import { UserCard } from '../../../design-systems/andromeda/components/UserCard'
import { UserMenu } from '../../../design-systems/andromeda/components/UserMenu'
import { Planet } from '../../../design-systems/andromeda/components/Planet'
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableStyles,
} from '../../../design-systems/andromeda/components/Table'
// v2 components come from the build-time-injected shim (real re-exports when
// injected, placeholder panels on degraded builds) — never import them from
// design-systems/ directly. See scripts/inject-premium.mjs.
import { MetricChart, Gauge, Waveform, MediaCard, DataTable, MusicPlayer } from '../../lib/andromeda-v2.generated'

// ─── Layout helpers ──────────────────────────────────────────────────────────

function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        marginBottom: tokens.spacing[5],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {label ? (
        <div
          style={{
            marginBottom: tokens.spacing[3],
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: themeColor.text.faint,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.widest,
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: tokens.spacing[3],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Per-slug demos ──────────────────────────────────────────────────────────

function IconButtonDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <Row label="Variants">
        <IconButton variant="default" aria-label="Notifications" icon={Bell} />
        <IconButton variant="outline" aria-label="Settings" icon={Gear} />
        <IconButton variant="ghost" aria-label="Refresh" icon={ArrowClockwise} />
        <IconButton variant="destructive" aria-label="Delete" icon={Trash} />
      </Row>
      <Row label="Sizes">
        <IconButton size="sm" aria-label="Settings" icon={Gear} />
        <IconButton size="md" aria-label="Settings" icon={Gear} />
        <IconButton size="lg" aria-label="Settings" icon={Gear} />
      </Row>
      <Row label="Disabled">
        <IconButton aria-label="Settings" icon={Gear} disabled />
        <IconButton variant="default" aria-label="Notifications" icon={Bell} disabled />
      </Row>
    </div>
  )
}

function ButtonDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <Row label="Variants">
        <Button variant="default">Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </Row>
      <Row label="Sizes">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </Row>
      <Row label="With icon">
        <Button icon={Bell}>Notifications</Button>
        <Button variant="outline" icon={Gear}>Settings</Button>
        <Button variant="destructive" icon={Bell}>Abort</Button>
      </Row>
      <Row label="Disabled">
        <Button disabled>Default</Button>
        <Button variant="outline" disabled>Outline</Button>
      </Row>
    </div>
  )
}

function BadgeDemo() {
  return (
    <Row>
      <Badge variant="default">Default</Badge>
      <Badge variant="accent">Live</Badge>
      <Badge variant="warning">Caution</Badge>
      <Badge variant="fault">Fault</Badge>
      <Badge variant="subtle">Subtle</Badge>
      <Badge variant="outline">Outline</Badge>
    </Row>
  )
}

function AvatarDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <Row label="Sizes">
        <Avatar name="Reza Quinn" size="sm" />
        <Avatar name="Reza Quinn" size="md" />
        <Avatar name="Reza Quinn" size="lg" />
      </Row>
      <Row label="With status">
        <Avatar name="Reza Quinn" status="online" />
        <Avatar name="Mira Voss" status="caution" />
        <Avatar name="Kai Ortiz" status="fault" />
        <Avatar name="June Park" status="offline" />
      </Row>
    </div>
  )
}

function CardDemo() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacing[5],
        width: '100%',
        maxWidth: 720,
      }}
    >
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
            <span
              style={{
                fontFamily: tokens.typography.fontMono,
                fontSize: tokens.typography.size.xs,
                color: themeColor.text.muted,
                textTransform: 'uppercase',
                letterSpacing: tokens.typography.tracking.widest,
              }}
            >
              {'/// Default'}
            </span>
            <CardTitle>Default card</CardTitle>
          </div>
          <Badge variant="default">Idle</Badge>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Sharp corners with bracket markers. The brackets are the frame.
          </CardDescription>
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="outline">Configure</Button>
        </CardFooter>
      </Card>
      <Card variant="glow">
        <CardHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
            <span
              style={{
                fontFamily: tokens.typography.fontMono,
                fontSize: tokens.typography.size.xs,
                color: themeColor.text.muted,
                textTransform: 'uppercase',
                letterSpacing: tokens.typography.tracking.widest,
              }}
            >
              {'/// Glow'}
            </span>
            <CardTitle>Highlight card</CardTitle>
          </div>
          <Badge variant="accent">Live</Badge>
        </CardHeader>
        <CardContent>
          <CardDescription>Tinted accent gradient surface.</CardDescription>
        </CardContent>
        <CardFooter>
          <Button size="sm">Engage</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function CornerMarkersDemo() {
  return (
    <div style={{ display: 'flex', gap: tokens.spacing[5], flexWrap: 'wrap' }}>
      {[
        { label: 'Default', props: {} },
        { label: 'Larger', props: { size: 18 } },
        { label: 'Inset 6px', props: { offset: 6 } },
        { label: 'Accent', props: { color: themeColor.accent[300] } },
      ].map(({ label, props }) => (
        <div
          key={label}
          style={{
            position: 'relative',
            width: 180,
            height: 100,
            background: themeColor.surface.raised,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CornerMarkers {...props} />
          <span
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              color: themeColor.text.muted,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.widest,
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

function InputDemo() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacing[5],
        width: '100%',
        maxWidth: 720,
      }}
    >
      <Input label="Callsign" placeholder="ENTER CALLSIGN" />
      <Input label="Search" icon={MagnifyingGlass} placeholder="QUERY DATABASE" />
      <Input label="Email" icon={Envelope} placeholder="OPERATOR@DOMAIN.COM" />
      <Input label="Validation" defaultValue="INVALID" error="Field cannot be empty" />
    </div>
  )
}

function SearchFieldDemo() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[5],
        width: '100%',
        maxWidth: 520,
      }}
    >
      <SearchField placeholder="Search anything" />
      <SearchField placeholder="Search tracks, channels, waveforms" shortcut="⌘ F" />
      <SearchField placeholder="No shortcut" shortcut={null} />
      <SearchField defaultValue="orbital launch" />
    </div>
  )
}

function NavItemDemo() {
  return (
    <div
      style={{
        width: 260,
        background: themeColor.surface.raised,
        position: 'relative',
      }}
    >
      <CornerMarkers />
      <NavItem icon={Compass} label="Overview" active />
      <NavItem icon={Pulse} label="Activity" />
      <NavItem icon={Users} label="Members" />
      <NavItem icon={Database} label="Logs" />
      <NavItem icon={Gear} label="Settings" />
    </div>
  )
}

function ProgressBarDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5], width: '100%', maxWidth: 520 }}>
      <ProgressBar label="Storage Used" value={72} variant="default" />
      <ProgressBar label="Bandwidth" value={48} variant="warning" />
      <ProgressBar label="Memory Critical" value={91} variant="fault" />
    </div>
  )
}

// Organic demo telemetry — deterministic (no Math.random) so SSR/client agree.
const _tdFract = (x: number) => x - Math.floor(x)
const _tdNoise = (i: number, s: number) => _tdFract(Math.sin((i + 1) * 12.9898 + s * 78.233) * 43758.5453)
const _tdClamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const TREND_DATA = Array.from({ length: 18 }, (_, i) => {
  const planned = _tdClamp(
    Math.round(120 + Math.sin(i / 4) * 14 + Math.sin(i / 1.7 + 1) * 9 + (_tdNoise(i, 1) - 0.5) * 26),
    78,
    150,
  )
  return {
    t: i + 1,
    planned,
    actual: Math.round(planned * (0.78 + _tdNoise(i, 2) * 0.18)),
    reserve: Math.round(20 + (_tdNoise(i, 3) - 0.5) * 5),
  }
})

function TrendChartDemo() {
  return (
    <div style={{ position: 'relative', background: themeColor.surface.raised, padding: tokens.spacing[5], width: '100%', maxWidth: 640 }}>
      <CornerMarkers />
      <TrendChart
        data={TREND_DATA}
        title="Throughput vs plan"
        yLabel="Requests / sec"
        height={220}
        series={[
          { key: 'planned', label: 'Planned', role: 'baseline' },
          { key: 'actual', label: 'Actual', role: 'live' },
          { key: 'reserve', label: 'Reserve', role: 'context' },
        ]}
      />
    </div>
  )
}

function HeatGridDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
      <HeatGrid value={60} label="Window risk" />
      <div style={{ display: 'flex', gap: tokens.spacing[8], flexWrap: 'wrap' }}>
        <HeatGrid value={25} cellSize={16} gap={2} label="Low" />
        <HeatGrid value={85} cellSize={16} gap={2} label="High" />
      </div>
    </div>
  )
}

function MetricChartDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <MetricChart label="/// Station" title="Orbital Altitude" unit="km" />
    </div>
  )
}

function GaugeDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <Row label="Sizes">
        <Gauge size="sm" />
        <Gauge size="md" />
        <Gauge size="lg" />
      </Row>
      <Row label="Variants">
        <Gauge variant="accent" value={82} label="CPU" />
        <Gauge variant="warning" value={64} label="FUEL" />
        <Gauge variant="fault" value={12} label="O2" />
      </Row>
    </div>
  )
}

function WaveformDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Waveform />
      <Waveform height={80} showBars={false} />
    </div>
  )
}

function MediaCardDemo() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 720,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
      }}
    >
      <MediaCard code="MIX-01" title="Your Mix" meta="Updates daily" action="play" />
      <MediaCard
        code="CH-04"
        title="Deep Focus"
        meta="Ambient · 2h"
        action="cta"
        ctaLabel="Open"
        image="https://ik.imagekit.io/aitoolkit/andromeda/signal-room/mix-03.webp"
      />
    </div>
  )
}

function DataTableDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 720 }}>
      <DataTable />
    </div>
  )
}

function MusicPlayerDemo() {
  return (
    <div style={{ width: '100%' }}>
      <MusicPlayer />
    </div>
  )
}

function PlanetDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 360, height: 300, position: 'relative', margin: '0 auto' }}>
      <Planet />
    </div>
  )
}

function StatTileDemo() {
  return (
    <div style={{ display: 'flex', gap: tokens.spacing[5], flexWrap: 'wrap' }}>
      <StatTile label="Throughput" code="REQ-01" value="7842" unit="rps" delta={2.4} deltaLabel="vs prior period" />
      {/* Latency falling is an improvement — polarity keeps the ▼ accent, not fault. */}
      <StatTile label="Latency" code="LAT-02" value="412" unit="ms" delta={-1.2} polarity="lower-is-better" deltaLabel="vs prior period" />
      <StatTile label="Errors" code="ERR-03" value="1.04" unit="%" />
    </div>
  )
}

function TagDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <Row label="Variants">
        <Tag variant="default">Default</Tag>
        <Tag variant="accent">Accent</Tag>
        <Tag variant="warning">Warning</Tag>
        <Tag variant="fault">Fault</Tag>
      </Row>
      <Row label="Dismissible">
        <Tag variant="default" onClose={() => {}}>Removable</Tag>
        <Tag variant="accent" onClose={() => {}}>Active filter</Tag>
      </Row>
    </div>
  )
}

function CheckboxDemo() {
  return (
    <Row label="States">
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled checked" disabled defaultChecked />
    </Row>
  )
}

function RadioDemo() {
  const [value, setValue] = useState('default')
  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <Row label="Group">
        <RadioGroup
          value={value}
          onValueChange={setValue}
          style={{ flexDirection: 'row', gap: tokens.spacing[4] }}
        >
          <Radio value="default" label="Default" />
          <Radio value="alternate" label="Alternate" />
          <Radio value="ground" label="Ground" />
          <Radio value="disabled" label="Restricted" disabled />
        </RadioGroup>
      </Row>
      <Row label="Standalone">
        <Radio label="Standalone" defaultChecked />
        <Radio label="Off" />
      </Row>
    </div>
  )
}

function TableDemo() {
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')
  const rows = [
    { id: 'AB-00032734', part: 'X60 BJGJ29839281', source: 'US, Denver - 24071',       lvl: 66, vol: '10.9985' },
    { id: 'AB-00032612', part: 'X62 BAGJ28599202', source: 'US, New York - 25018',     lvl: 86, vol: '7.28699' },
    { id: 'AB-00032736', part: 'X61 BHH09027512',  source: 'US, San Francisco - 27381', lvl: 75, vol: '8.85221' },
  ]
  return (
    <div style={{ width: '100%', position: 'relative', background: themeColor.surface.raised }}>
      <TableStyles />
      <Table>
        <TableHead>
          <TableRow hoverable={false}>
            <TableHeader>Order ID</TableHeader>
            <TableHeader>Part ID</TableHeader>
            <TableHeader>Source Location</TableHeader>
            <TableHeader
              sort={sort}
              style={{ cursor: 'pointer' }}
              onClick={() => setSort(s => s === 'asc' ? 'desc' : 'asc')}
            >
              Source Level
            </TableHeader>
            <TableHeader align="right">Total Volume</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={r.id} selected={i === 1}>
              <TableCell muted>{r.id}</TableCell>
              <TableCell>{r.part}</TableCell>
              <TableCell muted>{r.source}</TableCell>
              <TableCell>{r.lvl}%</TableCell>
              <TableCell align="right">{r.vol}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function TooltipDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[8] }}>
      <Row label="Position · top (default)">
        <Tooltip label="Refresh">
          <IconButton aria-label="Refresh" icon={ArrowClockwise} />
        </Tooltip>
        <Tooltip label="Settings">
          <IconButton aria-label="Settings" icon={Gear} />
        </Tooltip>
        <Tooltip label="Notifications">
          <IconButton aria-label="Notifications" icon={Bell} />
        </Tooltip>
      </Row>
      <Row label="Position · bottom">
        <Tooltip label="Refresh" position="bottom">
          <IconButton aria-label="Refresh" icon={ArrowClockwise} />
        </Tooltip>
        <Tooltip label="Settings" position="bottom">
          <IconButton aria-label="Settings" icon={Gear} />
        </Tooltip>
      </Row>
    </div>
  )
}

function ToggleDemo() {
  return (
    <Row label="States">
      <Toggle label="Off" />
      <Toggle label="On" defaultChecked />
      <Toggle label="Disabled" disabled />
      <Toggle label="Disabled on" disabled defaultChecked />
    </Row>
  )
}

function SpinnerDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <Row label="Sizes">
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
      </Row>
      <Row label="Variants">
        <Spinner variant="default" />
        <Spinner variant="accent" />
        <Spinner variant="warning" />
        <Spinner variant="fault" />
      </Row>
    </div>
  )
}

function SliderDemo() {
  const [a, setA] = useState(64)
  const [b, setB] = useState(38)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5], width: '100%', maxWidth: 520 }}>
      <Slider label="Throttle" unit="%" value={a} onValueChange={setA} />
      <Slider label="Thrust Vector" unit="°" min={-30} max={30} value={b} onValueChange={setB} />
      <Slider label="Locked" value={50} disabled />
    </div>
  )
}

function TextareaDemo() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacing[5],
        width: '100%',
        maxWidth: 720,
      }}
    >
      <Textarea label="Description" placeholder="ENTER DESCRIPTION…" rows={4} />
      <Textarea label="Validation" defaultValue="TOO SHORT" error="Brief must be at least 80 characters" rows={4} />
    </div>
  )
}

function AlertDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3], width: '100%', maxWidth: 640 }}>
      <Alert variant="default">
        <AlertIcon><Info weight="light" /></AlertIcon>
        <AlertContent>
          <AlertTitle>System nominal</AlertTitle>
          <AlertDescription>All systems reporting in.</AlertDescription>
        </AlertContent>
      </Alert>
      <Alert variant="accent">
        <AlertIcon><Pulse weight="light" /></AlertIcon>
        <AlertContent>
          <AlertTitle>New activity</AlertTitle>
          <AlertDescription>Burst received from VHCL-04.</AlertDescription>
        </AlertContent>
      </Alert>
      <Alert variant="warning">
        <AlertIcon><Warning weight="light" /></AlertIcon>
        <AlertContent>
          <AlertTitle>Caution</AlertTitle>
          <AlertDescription>Heat shield within 12% of operational limit.</AlertDescription>
        </AlertContent>
      </Alert>
      <Alert variant="fault">
        <AlertIcon><Warning weight="light" /></AlertIcon>
        <AlertContent>
          <AlertTitle>Connection lost</AlertTitle>
          <AlertDescription>Reconnecting. ETA 8 seconds.</AlertDescription>
        </AlertContent>
      </Alert>
    </div>
  )
}

function EmptyStateDemo() {
  return (
    <EmptyState>
      <EmptyStateIcon><EnvelopeOpen weight="light" /></EmptyStateIcon>
      <EmptyStateTitle>No activity</EmptyStateTitle>
      <EmptyStateDescription>
        Awaiting signal from the deep-space array. The next pass is in
        approximately 14 minutes.
      </EmptyStateDescription>
      <EmptyStateAction>
        <Button variant="outline" size="sm">Refresh</Button>
        <Button size="sm">Open log</Button>
      </EmptyStateAction>
    </EmptyState>
  )
}

function RadarChartDemo() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[5], width: '100%' }}>
      <RadarChart label="/// Systems" title="Ship Diagnostics" />
      {/* The series carries no explicit color: an unnamed series already draws
          the accent, and leaving it out lets RadarChart resolve the themed
          value rather than baking a dark literal into an SVG attribute. */}
      <RadarChart
        label="/// Performance"
        title="System Performance"
        description="Current system readiness"
        data={[
          { axis: 'CPU', score: 94 },
          { axis: 'MEMORY', score: 81 },
          { axis: 'STORAGE', score: 76 },
          { axis: 'NETWORK', score: 88 },
          { axis: 'SECURITY', score: 65 },
          { axis: 'API', score: 90 },
        ]}
        series={[{ key: 'score', label: 'Readiness' }]}
      />
    </div>
  )
}

function SegmentedControlDemo() {
  const [chartType, setChartType] = useState('line')
  const [period, setPeriod] = useState('1w')
  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <Row label="Icons · sm">
        <SegmentedControl
          size="sm"
          value={chartType}
          onChange={setChartType}
          options={[
            { value: 'line', icon: ChartLine, ariaLabel: 'Line chart' },
            { value: 'bars', icon: ChartBar,  ariaLabel: 'Bar chart' },
          ]}
        />
      </Row>
      <Row label="Icons · lg">
        <SegmentedControl
          size="lg"
          value={chartType}
          onChange={setChartType}
          options={[
            { value: 'line', icon: ChartLine, ariaLabel: 'Line chart' },
            { value: 'bars', icon: ChartBar,  ariaLabel: 'Bar chart' },
          ]}
        />
      </Row>
      <Row label="Labels">
        <SegmentedControl
          size="md"
          value={period}
          onChange={setPeriod}
          options={[
            { value: '1d',  label: '1D' },
            { value: '1w',  label: '1W' },
            { value: '1m',  label: '1M' },
            { value: 'all', label: 'ALL' },
          ]}
        />
      </Row>
    </div>
  )
}

function PanelHeaderDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5], width: '100%', maxWidth: 640 }}>
      <Row label="Title only">
        <div style={{ width: '100%', position: 'relative', background: themeColor.surface.raised }}>
          <CornerMarkers />
          <PanelHeader title="Capacity" />
        </div>
      </Row>
      <Row label="Title + actions (PanelMenu)">
        <div style={{ width: '100%', position: 'relative', background: themeColor.surface.raised }}>
          <CornerMarkers />
          <PanelHeader
            title="Requests"
            actions={
              <PanelMenu
                ariaLabel="Requests options"
                items={[
                  { label: 'Refresh', icon: ArrowClockwise, onSelect: () => {} },
                  { label: 'Export',  icon: Export,         onSelect: () => {} },
                  { type: 'separator' },
                  { label: 'Hide',    icon: EyeSlash,       onSelect: () => {} },
                ]}
              />
            }
          />
        </div>
      </Row>
    </div>
  )
}

function PanelMenuDemo() {
  return (
    <div style={{ display: 'flex', gap: tokens.spacing[6], alignItems: 'flex-start', flexWrap: 'wrap', minHeight: 280 }}>
      <div style={{ width: 200 }}>
        <Row label="Default · panel actions">
          <PanelMenu
            align="left"
            staticOpen
            items={[
              { label: 'Refresh',   icon: ArrowClockwise, onSelect: () => {} },
              { label: 'Configure', icon: Sliders,        onSelect: () => {} },
              { label: 'Export',    icon: Export,         onSelect: () => {} },
              { type: 'separator' },
              { label: 'Hide',      icon: EyeSlash,       onSelect: () => {} },
            ]}
          />
        </Row>
      </div>
      <div style={{ width: 200 }}>
        <Row label="With submenu">
          <PanelMenu
            align="left"
            staticOpen
            items={[
              { label: 'Edit', icon: Pencil, onSelect: () => {} },
              { label: 'Copy', icon: Copy,   onSelect: () => {} },
              {
                label: 'Move to',
                icon: Database,
                submenu: [
                  { label: 'Starred', icon: Star,     onSelect: () => {} },
                  { label: 'Archive', icon: Database, onSelect: () => {} },
                  { label: 'Snoozed', icon: Clock,    onSelect: () => {} },
                ],
              },
              { type: 'separator' },
              { label: 'Delete', icon: Trash, destructive: true, onSelect: () => {} },
            ]}
          />
        </Row>
      </div>
    </div>
  )
}

function DateRangePickerDemo() {
  const [range, setRange] = useState({
    start: new Date(2026, 6, 20),
    end:   new Date(2026, 7, 20),
  })
  const [presetLabel, setPresetLabel] = useState<string | null>('Last month')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5], minHeight: 360 }}>
      <Row label="Range">
        <DateRangePicker
          value={range}
          presetLabel={presetLabel ?? undefined}
          onChange={(next) => {
            setRange(next)
            setPresetLabel(null)
          }}
        />
      </Row>
      <Row label="No preset">
        <DateRangePicker
          value={{ start: new Date(2026, 7, 1), end: new Date(2026, 7, 14) }}
          onChange={() => {}}
        />
      </Row>
    </div>
  )
}

function DrawerDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Row label="Trigger">
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
      </Row>
      <Drawer open={open} onOpenChange={setOpen} side="right" size={420}>
        <DrawerHeader>
          <DrawerTitle>System Parameters</DrawerTitle>
          <DrawerDescription>Configure flight envelope</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5] }}>
            <Input label="Callsign" placeholder="ENTER CALLSIGN" />
            <Slider label="Throttle" unit="%" defaultValue={64} />
            <Toggle label="Autopilot" defaultChecked />
            <Checkbox label="Confirm pre-flight checklist" defaultChecked />
            <Textarea label="Notes" rows={3} placeholder="ADD A NOTE…" />
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={() => setOpen(false)}>Engage</Button>
        </DrawerFooter>
      </Drawer>
    </>
  )
}

const USER_MENU_ITEMS = [
  { id: 'profile',     label: 'Profile',             icon: UserCircle },
  { id: 'preferences', label: 'Preferences',         icon: Gear },
  { id: 'shortcuts',   label: 'Keyboard Shortcuts',  icon: Keyboard },
  { id: 'sep1',        type: 'separator' as const },
  { id: 'signout',     label: 'Sign Out',            icon: SignOut },
]

const USER_AVATAR_SRC =
  'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

const USER_CARD_SRC =
  'https://images.unsplash.com/photo-1669287731461-bd8ce3126710?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

function UserMenuDemo() {
  return (
    <div style={{ display: 'flex', gap: tokens.spacing[8], alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
      <Row label="Open down">
        <UserMenu
          name="OPS-01"
          src={USER_AVATAR_SRC}
          status="online"
          items={USER_MENU_ITEMS}
          placement="bottom"
          align="end"
        />
      </Row>
      <Row label="Open up">
        <UserMenu
          name="OPS-01"
          src={USER_AVATAR_SRC}
          status="online"
          items={USER_MENU_ITEMS}
          placement="top"
          align="end"
        />
      </Row>
    </div>
  )
}

function UserCardDemo() {
  return (
    <div style={{ display: 'flex', gap: tokens.spacing[8], alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
      <div style={{ width: 224 }}>
        <Row label="Open up">
          <div style={{ width: '100%', background: themeColor.surface.raised }}>
            <UserCard
              name="Reza Quinn"
              role="Flight Director"
              src={USER_CARD_SRC}
              status="online"
              items={USER_MENU_ITEMS}
              placement="top"
              align="stretch"
            />
          </div>
        </Row>
      </div>
      <div style={{ width: 224 }}>
        <Row label="Open down">
          <div style={{ width: '100%', background: themeColor.surface.raised }}>
            <UserCard
              name="Reza Quinn"
              role="Flight Director"
              src={USER_CARD_SRC}
              status="online"
              items={USER_MENU_ITEMS}
              placement="bottom"
              align="stretch"
            />
          </div>
        </Row>
      </div>
    </div>
  )
}

// ─── Public switcher ─────────────────────────────────────────────────────────

const DEMOS: Record<string, () => React.ReactElement> = {
  alert: AlertDemo,
  avatar: AvatarDemo,
  badge: BadgeDemo,
  button: ButtonDemo,
  card: CardDemo,
  checkbox: CheckboxDemo,
  'corner-markers': CornerMarkersDemo,
  'date-range-picker': DateRangePickerDemo,
  drawer: DrawerDemo,
  'empty-state': EmptyStateDemo,
  gauge: GaugeDemo,
  'heat-grid': HeatGridDemo,
  'icon-button': IconButtonDemo,
  input: InputDemo,
  'metric-chart': MetricChartDemo,
  waveform: WaveformDemo,
  'media-card': MediaCardDemo,
  'data-table': DataTableDemo,
  'music-player': MusicPlayerDemo,
  'nav-item': NavItemDemo,
  'panel-header': PanelHeaderDemo,
  'panel-menu': PanelMenuDemo,
  planet: PlanetDemo,
  'search-field': SearchFieldDemo,
  'segmented-control': SegmentedControlDemo,
  'progress-bar': ProgressBarDemo,
  'radar-chart': RadarChartDemo,
  radio: RadioDemo,
  slider: SliderDemo,
  spinner: SpinnerDemo,
  'stat-tile': StatTileDemo,
  tag: TagDemo,
  'trend-chart': TrendChartDemo,
  textarea: TextareaDemo,
  toggle: ToggleDemo,
  table: TableDemo,
  tooltip: TooltipDemo,
  'user-card': UserCardDemo,
  'user-menu': UserMenuDemo,
}

export function AndromedaDemo({ slug }: { slug: string }) {
  const Demo = DEMOS[slug]
  if (!Demo) {
    return (
      <div
        style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.sm,
          color: themeColor.text.muted,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.wider,
        }}
      >
        {'/// No demo wired for "'}{slug}{'"'}
      </div>
    )
  }
  return <Demo />
}
