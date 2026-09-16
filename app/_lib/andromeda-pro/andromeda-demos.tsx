// @ts-nocheck — design-systems components are not type-checked yet
// (see design-systems/CLAUDE.md). Demos consume those components, so this
// file inherits the same posture.
//
// CAPTURE-ONLY as of 2026-08-09. Its single remaining consumer is
// app/andromeda-capture/[slug]/CaptureFrame.tsx, which shoots the 16:9 card
// posters. The system page and the component pages now render from the matrix
// declarations (app/_lib/andromeda-pro/matrix/) instead. Flipping capture over too
// would silently re-shoot every card poster, so until that is a deliberate
// change, this file is curation for the posters and nothing else. Do not add a
// new consumer.
'use client'

import { Fragment, useState } from 'react'
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

import { tokens } from '../../lib/andromeda-pro.generated'
import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from '../../lib/andromeda-pro.generated'
import { Avatar } from '../../lib/andromeda-pro.generated'
import { Badge } from '../../lib/andromeda-pro.generated'
import { Button } from '../../lib/andromeda-pro.generated'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../lib/andromeda-pro.generated'
import { Checkbox } from '../../lib/andromeda-pro.generated'
import { ChoiceCard } from '../../lib/andromeda-pro.generated'
import { CornerMarkers } from '../../lib/andromeda-pro.generated'
import { DateRangePicker } from '../../lib/andromeda-pro.generated'
import { Drawer, DrawerBody, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '../../lib/andromeda-pro.generated'
import { EmptyState, EmptyStateAction, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle } from '../../lib/andromeda-pro.generated'
import { IconButton } from '../../lib/andromeda-pro.generated'
import { Input } from '../../lib/andromeda-pro.generated'
import { SearchField } from '../../lib/andromeda-pro.generated'
import { NavItem } from '../../lib/andromeda-pro.generated'
import { PanelHeader } from '../../lib/andromeda-pro.generated'
import { PanelMenu } from '../../lib/andromeda-pro.generated'
import { SegmentedControl } from '../../lib/andromeda-pro.generated'
import { ProgressBar } from '../../lib/andromeda-pro.generated'
import { HeatGrid } from '../../lib/andromeda-pro.generated'
import { RadarChart } from '../../lib/andromeda-pro.generated'
import { TrendChart } from '../../lib/andromeda-pro.generated'
import { Radio, RadioGroup } from '../../lib/andromeda-pro.generated'
import { Slider } from '../../lib/andromeda-pro.generated'
import { Spinner } from '../../lib/andromeda-pro.generated'
import { StatTile } from '../../lib/andromeda-pro.generated'
import { Tag } from '../../lib/andromeda-pro.generated'
import { Textarea } from '../../lib/andromeda-pro.generated'
import { Toggle } from '../../lib/andromeda-pro.generated'
import { Tooltip } from '../../lib/andromeda-pro.generated'
import { UserCard } from '../../lib/andromeda-pro.generated'
import { UserMenu } from '../../lib/andromeda-pro.generated'
import { Planet } from '../../lib/andromeda-pro.generated'
import {
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableStyles,
} from '../../lib/andromeda-pro.generated'
// v2 components come from the build-time-injected shim (real re-exports when
// injected, placeholder panels on degraded builds) — never import them from
// design-systems/ directly. See scripts/inject-premium.mjs.
import { MetricChart, Gauge, Waveform, MediaCard, DataTable, FunnelChart, Orb, Nodes, Burst } from '../../lib/andromeda-pro.generated'
import { MusicPlayerDemo as WiredMusicPlayer } from './matrix/music-player'

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
            color: `var(--at-text-faint, ${tokens.color.text.faint})`,
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

// ─── Size ramp ───────────────────────────────────────────────────────────────

// THE way a component's size ladder is shown, on both the component page and
// the system showcase. One definition, imported by both, so the two surfaces
// cannot drift apart.
//
// A two-row grid, not a flex row of stacked columns. Stacked columns have
// different total heights (a 24px control and a 40px control make 42px and 58px
// columns), so no value of alignItems can put BOTH the controls and the captions
// on a shared line — centring walks both edges, flex-end walks the tops. Here
// row 1 holds every control and row 2 holds every caption, so the caption
// baseline is shared by construction.
//
// The grid also means no slot-height constant. Row 1 auto-sizes to the
// tallest control, which is the only thing that survives Spinner (14/20/28) and
// Gauge (80/110/144) using the same helper.
// direction='column' stacks the ramp instead, for components too wide to sit
// three-across (UserCard, and anything else block-scale). The shared caption
// LINE simply becomes a shared caption COLUMN — same guarantee, same grid, one
// axis flipped.
// No longer exported: the system page and the component pages used to import
// this, and its lack of a state axis IS the drift this project removed. It
// survives as a private helper of the poster demos below.
function SizeRamp({ sizes = ['sm', 'md', 'lg'], render, direction = 'row' }) {
  const column = direction === 'column'
  return (
    <div
      style={{
        display: 'grid',
        ...(column
          ? { gridTemplateColumns: 'max-content max-content', gridAutoFlow: 'row' }
          : { gridTemplateRows: 'auto auto', gridAutoFlow: 'column', gridAutoColumns: 'max-content' }),
        columnGap: tokens.spacing[column ? 3 : 5],
        rowGap: tokens.spacing[column ? 3 : 2],
        alignItems: 'center',
        justifyItems: column ? 'start' : 'center',
      }}
    >
      {sizes.map((s) => (
        <Fragment key={s}>
          {render(s)}
          <span
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              // Pins the caption box so font metrics cannot reintroduce drift.
              lineHeight: tokens.typography.lineHeight.none,
              color: `var(--at-text-faint, ${tokens.color.text.faint})`,
              textTransform: 'uppercase',
              // One notch below the cell label's `widest`, so it reads as
              // subordinate to the label above the ramp.
              letterSpacing: tokens.typography.tracking.wider,
            }}
          >
            {s}
          </span>
        </Fragment>
      ))}
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
        <SizeRamp render={(s) => <IconButton size={s} aria-label={`Settings (${s})`} icon={Gear} />} />
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
        <SizeRamp render={(s) => <Button size={s}>Deploy</Button>} />
      </Row>
      <Row label="With icon">
        <Button icon={Bell}>Notifications</Button>
        <Button variant="outline" icon={Gear}>Settings</Button>
        <Button variant="destructive" icon={Bell}>Delete</Button>
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
    <div style={{ width: '100%', maxWidth: 640 }}>
      <Row label="Variants">
        <Badge variant="default">Default</Badge>
        <Badge variant="accent">Live</Badge>
        <Badge variant="warning">Caution</Badge>
        <Badge variant="fault">Fault</Badge>
        <Badge variant="subtle">Subtle</Badge>
        <Badge variant="outline">Outline</Badge>
      </Row>
      <Row label="Sizes">
        <SizeRamp render={(s) => <Badge size={s} variant="accent">Live</Badge>} />
      </Row>
    </div>
  )
}

function AvatarDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <Row label="Sizes">
        <SizeRamp render={(s) => <Avatar name="Reza Quinn" size={s} />} />
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
        // auto-fit, not '1fr 1fr': the pair stacks to one column rather than
        // crushing both when the preview gets narrow.
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
                color: `var(--at-text-muted, ${tokens.color.text.muted})`,
                textTransform: 'uppercase',
                letterSpacing: tokens.typography.tracking.widest,
              }}
            >
              /// Default
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
                color: `var(--at-text-muted, ${tokens.color.text.muted})`,
                textTransform: 'uppercase',
                letterSpacing: tokens.typography.tracking.widest,
              }}
            >
              /// Glow
            </span>
            <CardTitle>Highlight card</CardTitle>
          </div>
          <Badge variant="accent">Live</Badge>
        </CardHeader>
        <CardContent>
          <CardDescription>Tinted accent gradient surface.</CardDescription>
        </CardContent>
        <CardFooter>
          <Button size="sm">Save</Button>
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
        { label: 'Accent', props: { color: tokens.color.accent[300] } },
      ].map(({ label, props }) => (
        <div
          key={label}
          style={{
            position: 'relative',
            width: 180,
            height: 100,
            background: `var(--at-surface-raised, ${tokens.color.surface.raised})`,
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
              color: `var(--at-text-muted, ${tokens.color.text.muted})`,
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
    <div style={{ width: '100%', maxWidth: 720 }}>
      <Row label="Sizes">
        <SizeRamp
          direction="column"
          render={(s) => <Input size={s} placeholder="Enter a display name" style={{ width: 260 }} />}
        />
      </Row>
      <div
        style={{
          display: 'grid',
          // auto-fit so the pair stacks instead of squeezing on a narrow card
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: tokens.spacing[5],
          width: '100%',
        }}
      >
        <Input label="Display name" placeholder="Enter a display name" />
        <Input label="Search" icon={MagnifyingGlass} placeholder="Search" />
        <Input label="Email" icon={Envelope} placeholder="you@company.com" />
        <Input label="Validation" defaultValue="INVALID" error="Field cannot be empty" />
      </div>
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
      <Row label="Sizes">
        <SizeRamp
          direction="column"
          render={(s) => <SearchField size={s} placeholder="Search anything" style={{ width: 320 }} />}
        />
      </Row>
      <SearchField placeholder="Search anything" />
      <SearchField placeholder="Search tracks, channels, waveforms" shortcut="⌘ F" />
      <SearchField placeholder="No shortcut" shortcut={null} />
      <SearchField defaultValue="invoice 2043" />
    </div>
  )
}

function NavItemDemo() {
  const items = [
    { icon: Compass, label: 'Overview' },
    { icon: Pulse, label: 'Activity' },
    { icon: ChartLine, label: 'Reports' },
    { icon: Bell, label: 'Alerts' },
    { icon: Users, label: 'Members' },
    { icon: Database, label: 'Logs' },
    { icon: Gear, label: 'Settings' },
  ]
  return (
    <div style={{ display: 'flex', gap: tokens.spacing[5], alignItems: 'flex-start' }}>
      <div
        style={{
          width: 260,
          background: `var(--at-surface-raised, ${tokens.color.surface.raised})`,
          position: 'relative',
        }}
      >
        <CornerMarkers />
        {items.map((item, i) => (
          <NavItem key={item.label} icon={item.icon} label={item.label} active={i === 0} />
        ))}
      </div>

      {/* The same list collapsed to an icon rail. Same component, no edge
          square — a rail is too narrow for one to read as an edge, so the
          accent glyph marks the current row. The label is still there for
          screen readers. */}
      <div
        style={{
          width: 56,
          background: `var(--at-surface-raised, ${tokens.color.surface.raised})`,
          position: 'relative',
        }}
      >
        <CornerMarkers />
        {items.map((item, i) => (
          <Tooltip
            key={item.label}
            label={item.label}
            position="right"
            // inline-flex by default, which would shrink-wrap the row and
            // leave the hover fill and tap target narrower than the rail.
            style={{ display: 'flex', width: '100%' }}
          >
            <NavItem collapsed icon={item.icon} label={item.label} active={i === 0} />
          </Tooltip>
        ))}
      </div>
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
const _tdFract = (x) => x - Math.floor(x)
const _tdNoise = (i, s) => _tdFract(Math.sin((i + 1) * 12.9898 + s * 78.233) * 43758.5453)
const _tdClamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
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
    <div style={{ position: 'relative', background: `var(--at-surface-raised, ${tokens.color.surface.raised})`, padding: tokens.spacing[5], width: '100%', maxWidth: 640 }}>
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

// Two funnels, because the interesting thing about this chart is not its
// shape but what its colour is allowed to mean.
//
// The first declares no tones, so every band rests in neutral ink: nothing
// about any single stage is a reading, so nothing earns colour.
// The second derives a tone per stage from that stage's own step conversion,
// which is the only sanctioned reason a band changes colour — never to tell
// the five stages apart, which the labels already do.
// Fault is reserved for the ONE step that actually falls out. At a 0.75 cut
// every ordinary step read as a failure and three of five bands went red, which
// left the genuinely bad step with nothing louder to say.
const FUNNEL_TONE = (share: number) =>
  share >= 0.85 ? 'accent' : share >= 0.6 ? 'warning' : 'fault'

const FUNNEL_STAGES = [
  { id: 'awareness', label: 'Awareness', value: 4100 },
  { id: 'interest', label: 'Interest', value: 2957 },
  { id: 'consideration', label: 'Consideration', value: 2184 },
  { id: 'intent', label: 'Intent', value: 1038 },
  { id: 'purchase', label: 'Purchase', value: 820 },
]

const FUNNEL_TONED = FUNNEL_STAGES.map((stage, i) => ({
  ...stage,
  tone: i === 0 ? 'accent' : FUNNEL_TONE(stage.value / FUNNEL_STAGES[i - 1].value),
}))

function MetricChartDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <MetricChart label="/// API" title="Response time" unit="ms" />
    </div>
  )
}

function FunnelChartDemo() {
  return (
    <div style={{ width: '100%' }}>
      <Row label="Overall conversion">
        <FunnelChart stages={FUNNEL_STAGES} height={160} style={{ width: '100%' }} />
      </Row>
      <Row label="Step conversion, tone from the data">
        <FunnelChart
          stages={FUNNEL_TONED}
          percentOf="previous"
          height={160}
          style={{ width: '100%' }}
        />
      </Row>
    </div>
  )
}

function GaugeDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <Row label="Sizes">
        <SizeRamp render={(s) => <Gauge size={s} value={68} />} />
      </Row>
      <Row label="Variants">
        <Gauge variant="accent" value={82} label="CPU" />
        <Gauge variant="warning" value={64} label="BATTERY" />
        <Gauge variant="fault" value={12} label="DISK FREE" />
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
      <MediaCard
        code="MIX-01"
        title="Your Mix"
        meta="Updates daily"
        action="play"
        image="https://ik.imagekit.io/aitoolkit/andromeda/signal-room/mix-01.webp"
      />
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
      <DataTable selectedRowKey="track-02" />
    </div>
  )
}

function MusicPlayerDemo() {
  return (
    <div style={{ width: '100%' }}>
      <WiredMusicPlayer playing />
    </div>
  )
}

function PlanetDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 640, height: 460, position: 'relative', margin: '0 auto' }}>
      <Planet />
    </div>
  )
}

// Orb, Nodes and Burst are Objects: set-pieces, one per surface, framed by the
// system's own Card instead of floating on a bare page. One shared frame — the
// only thing that differs between the three is the title and the body.
// The box is deliberately large: an Object fills a surface, and at 280px it
// reads as a widget instead.
function ObjectPanel({ title, children }) {
  return (
    <Card style={{ width: '100%', maxWidth: 640, margin: '0 auto' }}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <div style={{ padding: tokens.spacing[4] }}>
        <div style={{ height: 420, position: 'relative' }}>{children}</div>
      </div>
    </Card>
  )
}

function OrbDemo() {
  return (
    <ObjectPanel title="Core">
      <Orb />
    </ObjectPanel>
  )
}

function NodesDemo() {
  return (
    <ObjectPanel title="Signal lattice">
      <Nodes />
    </ObjectPanel>
  )
}

function BurstDemo() {
  return (
    <ObjectPanel title="Convergence">
      <Burst />
    </ObjectPanel>
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
      <Row label="Sizes">
        <SizeRamp render={(s) => <Tag size={s} variant="accent">Accent</Tag>} />
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
    <div style={{ width: '100%', maxWidth: 640 }}>
      <Row label="States">
        <Checkbox label="Unchecked" />
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Disabled" disabled />
        <Checkbox label="Disabled checked" disabled defaultChecked />
      </Row>
      <Row label="Sizes">
        <SizeRamp sizes={['md', 'lg']} render={(s) => <Checkbox size={s} label={s} defaultChecked />} />
      </Row>
    </div>
  )
}

function ChoiceCardDemo() {
  // Capture scene: the selection moment — one committed card between two
  // resting siblings, the approved matrix look at md.
  return (
    <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ChoiceCard control="radio" title="Standard" description="Balanced speed and cost." value="standard" />
      <ChoiceCard control="radio" title="Express" description="Faster, at a higher cost." value="express" defaultChecked />
      <ChoiceCard control="radio" title="Custom" description="Full control over every setting." value="custom" />
    </div>
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
      <Row label="Sizes">
        <SizeRamp sizes={['md', 'lg']} render={(s) => <Radio size={s} label={s} defaultChecked />} />
      </Row>
      <Row label="Standalone">
        <Radio label="Standalone" defaultChecked />
        <Radio label="Off" />
      </Row>
    </div>
  )
}

function TableDemo() {
  // Every header states that it sorts; only the active one states a direction.
  // The primitive paints the marker and sets aria-sort — the reordering below
  // is the caller's job, which is exactly the split this demo is showing.
  const [sort, setSort] = useState<{ key: 'lvl' | 'vol'; dir: 'asc' | 'desc' } | null>({ key: 'lvl', dir: 'asc' })
  const marker = (key: 'lvl' | 'vol') =>
    sort?.key === key ? sort.dir : ('sortable' as const)
  const toggle = (key: 'lvl' | 'vol') =>
    setSort((prev) => (prev?.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  const rows = [
    { id: 'AB-00032734', part: 'X60 BJGJ29839281', source: 'US, Denver - 24071',       lvl: 66, vol: '10.9985' },
    { id: 'AB-00032612', part: 'X62 BAGJ28599202', source: 'US, New York - 25018',     lvl: 86, vol: '7.28699' },
    { id: 'AB-00032736', part: 'X61 BHH09027512',  source: 'US, San Francisco - 27381', lvl: 75, vol: '8.85221' },
  ]
  return (
    <div style={{ width: '100%', position: 'relative', background: `var(--at-surface-raised, ${tokens.color.surface.raised})` }}>
      <TableStyles />
      <Table>
        <TableHead>
          <TableRow hoverable={false}>
            <TableHeader>Order ID</TableHeader>
            <TableHeader>Part ID</TableHeader>
            <TableHeader>Source Location</TableHeader>
            <TableHeader sort={marker('lvl')} style={{ cursor: 'pointer' }} onClick={() => toggle('lvl')}>
              Source Level
            </TableHeader>
            <TableHeader sort={marker('vol')} style={{ cursor: 'pointer' }} onClick={() => toggle('vol')}>
              Total Volume
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={r.id} selected={i === 1}>
              <TableCell muted>{r.id}</TableCell>
              <TableCell>{r.part}</TableCell>
              <TableCell muted>{r.source}</TableCell>
              <TableCell>{r.lvl}%</TableCell>
              <TableCell>{r.vol}</TableCell>
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
    <div style={{ width: '100%', maxWidth: 640 }}>
      <Row label="States">
        <Toggle label="Off" />
        <Toggle label="On" defaultChecked />
        <Toggle label="Disabled" disabled />
        <Toggle label="Disabled on" disabled defaultChecked />
      </Row>
      <Row label="Sizes">
        <SizeRamp sizes={['md', 'lg']} render={(s) => <Toggle size={s} label={s} defaultChecked />} />
      </Row>
    </div>
  )
}

function SpinnerDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <Row label="Sizes">
        <SizeRamp render={(s) => <Spinner size={s} />} />
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
      <Row label="Sizes">
        <SizeRamp
          direction="column"
          // Slider's ladder starts at md; sm would index an entry that is gone.
          sizes={['md', 'lg']}
          render={(s) => <Slider size={s} value={64} showValue={false} style={{ width: 300 }} />}
        />
      </Row>
      <Slider label="Volume" unit="%" value={a} onValueChange={setA} />
      <Slider label="Rotation" unit="°" min={-30} max={30} value={b} onValueChange={setB} />
      <Slider label="Locked" value={50} disabled />
    </div>
  )
}

function TextareaDemo() {
  return (
    <div style={{ width: '100%', maxWidth: 720 }}>
      <Row label="Sizes">
        <SizeRamp
          direction="column"
          render={(s) => <Textarea size={s} placeholder="Add a description" rows={2} style={{ width: 300 }} />}
        />
      </Row>
      <div
        style={{
          display: 'grid',
          // auto-fit so the pair stacks instead of squeezing on a narrow card
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: tokens.spacing[5],
          width: '100%',
        }}
      >
        <Textarea label="Description" placeholder="Add a description" rows={4} />
        <Textarea label="Validation" defaultValue="TOO SHORT" error="Brief must be at least 80 characters" rows={4} />
      </div>
    </div>
  )
}

function AlertDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3], width: '100%', maxWidth: 640 }}>
      <Alert variant="default">
        <AlertIcon><Info weight="light" /></AlertIcon>
        <AlertContent>
          <AlertTitle>All good</AlertTitle>
          <AlertDescription>Every service is running normally.</AlertDescription>
        </AlertContent>
      </Alert>
      <Alert variant="accent">
        <AlertIcon><Pulse weight="light" /></AlertIcon>
        <AlertContent>
          <AlertTitle>New activity</AlertTitle>
          <AlertDescription>3 new events in the last hour.</AlertDescription>
        </AlertContent>
      </Alert>
      <Alert variant="warning">
        <AlertIcon><Warning weight="light" /></AlertIcon>
        <AlertContent>
          <AlertTitle>Caution</AlertTitle>
          <AlertDescription>Storage is at 88% of your limit.</AlertDescription>
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
        Nothing has happened in the last 30 days. New events arrive
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
      <RadarChart label="/// Services" title="Service health" />
      <RadarChart
        label="/// Performance"
        title="System Performance"
        description="Current performance by area"
        data={[
          { axis: 'CPU', score: 94 },
          { axis: 'MEMORY', score: 81 },
          { axis: 'STORAGE', score: 76 },
          { axis: 'NETWORK', score: 88 },
          { axis: 'SECURITY', score: 65 },
          { axis: 'API', score: 90 },
        ]}
        series={[{ key: 'score', label: 'Score', color: tokens.color.accent[300] }]}
      />
    </div>
  )
}

function SegmentedControlDemo() {
  const [chartType, setChartType] = useState('line')
  const [period, setPeriod] = useState('1w')
  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <Row label="Sizes">
        <SizeRamp
          render={(s) => (
            <SegmentedControl
              size={s}
              // Distinct per instance: the sliding indicator is a shared
              // layoutId, and three ramp instances would fight over one.
              layoutGroupId={`andromeda-segmented-size-${s}`}
              value={chartType}
              onChange={setChartType}
              options={[
                { value: 'line', icon: ChartLine, ariaLabel: 'Line chart' },
                { value: 'bars', icon: ChartBar,  ariaLabel: 'Bar chart' },
              ]}
            />
          )}
        />
      </Row>
      <Row label="Control group">
        {/* Stacked: a four-segment lg strip runs past 250px, so three of them
            will not sit three-across in this cell. */}
        <SizeRamp
          direction="column"
          render={(s) => (
            <SegmentedControl
              size={s}
              layoutGroupId={`andromeda-segmented-labels-${s}`}
              value={period}
              onChange={setPeriod}
              options={[
                { value: '1d',  label: '1D' },
                { value: '1w',  label: '1W' },
                { value: '1m',  label: '1M' },
                { value: 'all', label: 'ALL' },
              ]}
            />
          )}
        />
      </Row>
    </div>
  )
}

function PanelHeaderDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5], width: '100%', maxWidth: 640 }}>
      <Row label="Title only">
        <div style={{ width: '100%', position: 'relative', background: `var(--at-surface-raised, ${tokens.color.surface.raised})` }}>
          <CornerMarkers />
          <PanelHeader title="Capacity" />
        </div>
      </Row>
      <Row label="Title + actions (PanelMenu)">
        <div style={{ width: '100%', position: 'relative', background: `var(--at-surface-raised, ${tokens.color.surface.raised})` }}>
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
      <Row label="Sizes">
        {/* Stacked, and each rung gets its own fixed-width panel: a block
            header has no intrinsic width, so a max-content ramp column would
            otherwise shrink every panel to its own title. The actions control
            matches the header rung by name, which is the pairing the
            component's JSDoc prescribes. */}
        <SizeRamp
          direction="column"
          render={(s) => (
            <div style={{ width: 320, maxWidth: '100%', position: 'relative', background: `var(--at-surface-raised, ${tokens.color.surface.raised})` }}>
              <CornerMarkers />
              <PanelHeader
                size={s}
                title={{ sm: 'Capacity', md: 'Requests', lg: 'Fleet Overview' }[s]}
                actions={<IconButton size={s} variant="ghost" aria-label={`Refresh (${s})`} icon={ArrowClockwise} />}
              />
            </div>
          )}
        />
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
            defaultOpen
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
            defaultOpen
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
      <div style={{ width: 200 }}>
        <Row label="Trigger size">
          <SizeRamp
            render={(s) => (
              <PanelMenu
                size={s}
                align="left"
                ariaLabel={`Panel options (${s})`}
                items={[
                  { label: 'Refresh', icon: ArrowClockwise, onSelect: () => {} },
                  { label: 'Export',  icon: Export,         onSelect: () => {} },
                ]}
              />
            )}
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
          presetLabel={presetLabel}
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

function DrawerDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Row label="Trigger">
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
      </Row>
      <Drawer open={open} onOpenChange={setOpen} side="right" size={420}>
        <DrawerHeader>
          <DrawerTitle>Workspace settings</DrawerTitle>
          <DrawerDescription>Configure how this workspace behaves</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5] }}>
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
          <Button size="sm" onClick={() => setOpen(false)}>Save</Button>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
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
      <Row label="Sizes">
        <SizeRamp
          render={(s) => (
            <UserMenu
              name="OPS-01"
              src={USER_AVATAR_SRC}
              status="online"
              size={s}
              items={USER_MENU_ITEMS}
              ariaLabel={`User menu (${s})`}
            />
          )}
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
          <div style={{ width: '100%', background: `var(--at-surface-raised, ${tokens.color.surface.raised})` }}>
            <UserCard
              name="Reza Quinn"
              role="Product Designer"
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
          <div style={{ width: '100%', background: `var(--at-surface-raised, ${tokens.color.surface.raised})` }}>
            <UserCard
              name="Reza Quinn"
              role="Product Designer"
              src={USER_CARD_SRC}
              status="online"
              items={USER_MENU_ITEMS}
              placement="bottom"
              align="stretch"
            />
          </div>
        </Row>
      </div>
      <div style={{ width: 224 }}>
        <Row label="Sizes">
          {/* Stacked: three 200px cards will not sit three-across in this cell. */}
          <SizeRamp
            direction="column"
            render={(s) => (
              <div style={{ width: 200, background: `var(--at-surface-raised, ${tokens.color.surface.raised})` }}>
                <UserCard
                  name="Reza Quinn"
                  role="Product Designer"
                  src={USER_CARD_SRC}
                  status="online"
                  size={s}
                  items={USER_MENU_ITEMS}
                  placement="top"
                  align="stretch"
                  ariaLabel={`User card (${s})`}
                />
              </div>
            )}
          />
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
  'choice-card': ChoiceCardDemo,
  'corner-markers': CornerMarkersDemo,
  'date-range-picker': DateRangePickerDemo,
  drawer: DrawerDemo,
  'empty-state': EmptyStateDemo,
  'chart-funnel': FunnelChartDemo,
  gauge: GaugeDemo,
  'heat-grid': HeatGridDemo,
  'icon-button': IconButtonDemo,
  input: InputDemo,
  waveform: WaveformDemo,
  'media-card': MediaCardDemo,
  'table-data': DataTableDemo,
  'music-player': MusicPlayerDemo,
  'nav-item': NavItemDemo,
  'panel-header': PanelHeaderDemo,
  'panel-menu': PanelMenuDemo,
  planet: PlanetDemo,
  orb: OrbDemo,
  nodes: NodesDemo,
  burst: BurstDemo,
  'search-field': SearchFieldDemo,
  'segmented-control': SegmentedControlDemo,
  'progress-bar': ProgressBarDemo,
  'chart-metric': MetricChartDemo,
  'chart-radar': RadarChartDemo,
  radio: RadioDemo,
  slider: SliderDemo,
  spinner: SpinnerDemo,
  'stat-tile': StatTileDemo,
  tag: TagDemo,
  'chart-trend': TrendChartDemo,
  textarea: TextareaDemo,
  toggle: ToggleDemo,
  'table-basic': TableDemo,
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
          color: `var(--at-text-muted, ${tokens.color.text.muted})`,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.wider,
        }}
      >
        /// No demo wired for "{slug}"
      </div>
    )
  }
  return <Demo />
}
