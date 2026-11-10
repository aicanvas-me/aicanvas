// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — the shim re-exports untyped design-system sources.
'use client'

import { useState, type ReactNode } from 'react'
import { Activity } from '@/app/_icons/icons/activity'
import { Bolt } from '@/app/_icons/icons/bolt'
import { Compass } from '@/app/_icons/icons/compass'
import { CircleUser } from '@/app/_icons/icons/circle-user'
import { Database } from '@/app/_icons/icons/database'
import { EyeOff } from '@/app/_icons/icons/eye-off'
import { Gear } from '@/app/_icons/icons/gear'
import { KeyboardIcon } from '@/app/_icons/icons/keyboard'
import { LogOut } from '@/app/_icons/icons/log-out'
import { Mail } from '@/app/_icons/icons/mail'
import { MailOpen } from '@/app/_icons/icons/mail-open'
import { RotateCw } from '@/app/_icons/icons/rotate-cw'
import { ShareIcon } from '@/app/_icons/icons/share'
import { SlidersVertical } from '@/app/_icons/icons/sliders-vertical'
import { Users } from '@/app/_icons/icons/users'
import { tokens } from '@/design-systems/andromeda/tokens'
import { themeColor } from '@/design-systems/andromeda/components/lib/utils'
import {
  Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle,
  Avatar, Badge, Button,
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
  Checkbox, CornerMarkers, DataTable, DateRangePicker,
  Drawer, DrawerBody, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle,
  EmptyState, EmptyStateAction, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle,
  Gauge, HeatGrid, IconButton, Input, MediaCard, MetricChart, MusicPlayer, NavItem,
  PanelHeader, PanelMenu, Planet, ProgressBar, RadarChart, Radio, RadioGroup,
  SearchField, SegmentedControl, Slider, Spinner, StatTile,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableStyles,
  Tag, Textarea, Toggle, Tooltip, TrendChart, UserCard, UserMenu, Waveform,
} from '@/app/lib/andromeda-v2.generated'

// One hero per Legacy component: the single state that best sells it, alone.
// Scale and open-on-capture steps live in scripts/screenshot-andromeda-hero.mjs.
const RANGE = { start: new Date(2026, 6, 22), end: new Date(2026, 7, 20) }
const AVATAR = 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?q=80&w=987&auto=format&fit=crop'
const MENU = [
  { id: 'profile', label: 'Profile', icon: CircleUser },
  { id: 'preferences', label: 'Preferences', icon: Gear },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: KeyboardIcon },
  { id: 'sep', type: 'separator' },
  { id: 'signout', label: 'Sign Out', icon: LogOut },
]
const eyebrow = {
  fontFamily: tokens.typography.fontMono,
  fontSize: tokens.typography.size.xs,
  color: themeColor.text.muted,
  textTransform: 'uppercase',
  letterSpacing: tokens.typography.tracking.widest,
}
const TREND = Array.from({ length: 18 }, (_, i) => {
  const planned = Math.round(120 + Math.sin(i / 4) * 14 + Math.sin(i / 1.7 + 1) * 9)
  return {
    t: i + 1,
    planned,
    actual: Math.round(planned * (0.8 + ((i * 7) % 5) * 0.03)),
    reserve: 20 + (i % 3),
  }
})

function RadioPose() {
  const [v, setV] = useState('alternate')
  return (
    <RadioGroup value={v} onValueChange={setV}>
      <Radio value="default" label="Default orbit" />
      <Radio value="alternate" label="Alternate orbit" />
      <Radio value="ground" label="Ground track" />
    </RadioGroup>
  )
}

function SegmentedPose() {
  const [v, setV] = useState('1w')
  return (
    <SegmentedControl
      size="md"
      value={v}
      onChange={setV}
      options={[
        { value: '1d', label: '1D' },
        { value: '1w', label: '1W' },
        { value: '1m', label: '1M' },
        { value: 'all', label: 'ALL' },
      ]}
    />
  )
}

function DrawerPose() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
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

export const POSES: Record<string, ReactNode> = {
  alert: (
    <div style={{ width: 420 }}>
      <Alert variant="accent">
        <AlertIcon><Activity size="1em" /></AlertIcon>
        <AlertContent>
          <AlertTitle>New activity</AlertTitle>
          <AlertDescription>Burst received from VHCL-04.</AlertDescription>
        </AlertContent>
      </Alert>
    </div>
  ),
  avatar: <Avatar name="Reza Quinn" size="lg" src={AVATAR} status="online" />,
  badge: <Badge variant="accent">Live</Badge>,
  button: <Button size="lg" icon={Bolt}>Deploy</Button>,
  card: (
    <div style={{ width: 360 }}>
      <Card variant="glow">
        <CardHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
            <span style={eyebrow}>{'/// Glow'}</span>
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
  ),
  checkbox: <Checkbox label="Email notifications" defaultChecked />,
  'corner-markers': (
    <div
      style={{
        position: 'relative',
        width: 240,
        height: 130,
        background: themeColor.surface.raised,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CornerMarkers size={18} color={themeColor.accent[300]} />
      <span style={eyebrow}>Accent</span>
    </div>
  ),
  'date-range-picker': (
    <div style={{ height: 344 }}>
      <DateRangePicker value={RANGE} presetLabel="Last month" staticOpen />
    </div>
  ),
  drawer: <DrawerPose />,
  'empty-state': (
    <div style={{ width: 460 }}>
      <EmptyState>
        <EmptyStateIcon><MailOpen size="1em" /></EmptyStateIcon>
        <EmptyStateTitle>No activity</EmptyStateTitle>
        <EmptyStateDescription>
          Awaiting signal from the deep-space array. The next pass is in about 14 minutes.
        </EmptyStateDescription>
        <EmptyStateAction>
          <Button variant="outline" size="sm">Refresh</Button>
          <Button size="sm">Open log</Button>
        </EmptyStateAction>
      </EmptyState>
    </div>
  ),
  gauge: <Gauge size="lg" variant="accent" value={82} label="CPU" />,
  'heat-grid': <HeatGrid value={60} label="Window risk" />,
  'icon-button': <IconButton size="lg" variant="outline" aria-label="Settings" icon={Gear} />,
  input: (
    <div style={{ width: 340 }}>
      <Input label="Email" icon={Mail} defaultValue="ops@orbital.dev" />
    </div>
  ),
  'metric-chart': (
    <div style={{ width: 520 }}>
      <MetricChart label="/// Station" title="Orbital Altitude" unit="km" />
    </div>
  ),
  waveform: (
    <div style={{ width: 480 }}>
      <Waveform />
    </div>
  ),
  'media-card': (
    <div style={{ width: 260 }}>
      <MediaCard code="MIX-01" title="Your Mix" meta="Updates daily" action="play" />
    </div>
  ),
  'data-table': (
    <div style={{ width: 720 }}>
      <DataTable />
    </div>
  ),
  'music-player': (
    <div style={{ width: 520 }}>
      <MusicPlayer />
    </div>
  ),
  'nav-item': (
    <div style={{ width: 260, background: themeColor.surface.raised, position: 'relative' }}>
      <CornerMarkers />
      <NavItem icon={Compass} label="Overview" active />
      <NavItem icon={Activity} label="Activity" />
      <NavItem icon={Users} label="Members" />
      <NavItem icon={Database} label="Logs" />
      <NavItem icon={Gear} label="Settings" />
    </div>
  ),
  'panel-header': (
    <div style={{ width: 460, position: 'relative', background: themeColor.surface.raised }}>
      <CornerMarkers />
      <PanelHeader
        title="Requests"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Badge variant="accent">Live</Badge>
            <IconButton size="sm" variant="ghost" aria-label="Refresh" icon={RotateCw} />
            <PanelMenu
              staticOpen
              ariaLabel="Requests options"
              items={[
                { label: 'Refresh', icon: RotateCw, onSelect: () => {} },
                { label: 'Export', icon: ShareIcon, onSelect: () => {} },
                { type: 'separator' },
                { label: 'Hide', icon: EyeOff, onSelect: () => {} },
              ]}
            />
          </div>
        }
      />
    </div>
  ),
  'panel-menu': (
    <div style={{ width: 200 }}>
      <PanelMenu
        align="left"
        staticOpen
        items={[
          { label: 'Refresh', icon: RotateCw, onSelect: () => {} },
          { label: 'Configure', icon: SlidersVertical, onSelect: () => {} },
          { label: 'Export', icon: ShareIcon, onSelect: () => {} },
          { type: 'separator' },
          { label: 'Hide', icon: EyeOff, onSelect: () => {} },
        ]}
      />
    </div>
  ),
  planet: (
    <div style={{ width: 360, height: 340, position: 'relative' }}>
      <Planet paused particleCount={9000} particleSize={0.05} />
    </div>
  ),
  'progress-bar': (
    <div style={{ width: 420 }}>
      <ProgressBar label="Storage Used" value={72} variant="default" />
    </div>
  ),
  'radar-chart': (
    <div style={{ width: 360 }}>
      <RadarChart label="/// Systems" title="Ship Diagnostics" />
    </div>
  ),
  radio: <RadioPose />,
  'search-field': (
    <div style={{ width: 420 }}>
      <SearchField placeholder="Search tracks, channels" shortcut="⌘ F" />
    </div>
  ),
  'segmented-control': <SegmentedPose />,
  slider: (
    <div style={{ width: 340 }}>
      <Slider label="Throttle" unit="%" defaultValue={64} />
    </div>
  ),
  spinner: <Spinner size="lg" variant="accent" />,
  'stat-tile': (
    <StatTile label="Throughput" code="REQ-01" value="7842" unit="rps" delta={2.4} deltaLabel="vs prior period" />
  ),
  tag: <Tag variant="accent" onClose={() => {}}>Active filter</Tag>,
  textarea: (
    <div style={{ width: 420 }}>
      <Textarea
        label="Description"
        rows={4}
        defaultValue="Reroute telemetry through relay 3 before the next pass."
      />
    </div>
  ),
  toggle: <Toggle label="Auto-scale" defaultChecked />,
  table: (
    <div style={{ width: 900, position: 'relative', background: themeColor.surface.raised }}>
      <TableStyles />
      <Table>
        <TableHead>
          <TableRow hoverable={false}>
            <TableHeader>Order ID</TableHeader>
            <TableHeader>Part ID</TableHeader>
            <TableHeader>Source Location</TableHeader>
            <TableHeader sort="asc">Source Level</TableHeader>
            <TableHeader align="right">Total Volume</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {[
            ['AB-00032734', 'X60 BJGJ29839281', 'US, Denver - 24071', 66, '10.9985'],
            ['AB-00032612', 'X62 BAGJ28599202', 'US, New York - 25018', 86, '7.28699'],
            ['AB-00032736', 'X61 BHH09027512', 'US, San Francisco - 27381', 75, '8.85221'],
          ].map(([id, part, src, lvl, vol], i) => (
            <TableRow key={id} selected={i === 1}>
              <TableCell muted>{id}</TableCell>
              <TableCell>{part}</TableCell>
              <TableCell muted>{src}</TableCell>
              <TableCell>{lvl}%</TableCell>
              <TableCell align="right">{vol}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
  // The top padding matches the bubble, so the pair (not the button) is centered.
  tooltip: (
    <div style={{ paddingTop: 32 }}>
      <Tooltip label="Refresh" position="top">
        <IconButton aria-label="Refresh" icon={RotateCw} size="lg" />
      </Tooltip>
    </div>
  ),
  'trend-chart': (
    <div style={{ position: 'relative', background: themeColor.surface.raised, padding: tokens.spacing[5], width: 560 }}>
      <CornerMarkers />
      <TrendChart
        data={TREND}
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
  ),
  'user-card': (
    <div style={{ width: 240 }}>
      <UserCard
        name="Reza Quinn"
        role="Flight Director"
        src={AVATAR}
        status="online"
        items={MENU}
        placement="bottom"
        align="stretch"
        staticOpen
      />
    </div>
  ),
  'user-menu': (
    <div>
      <UserMenu name="OPS-01" src={AVATAR} status="online" items={MENU} placement="bottom" align="end" staticOpen />
    </div>
  ),
}

export function hasPose(slug: string) {
  return slug in POSES
}

export function Pose({ slug }: { slug: string }) {
  return POSES[slug]
}
