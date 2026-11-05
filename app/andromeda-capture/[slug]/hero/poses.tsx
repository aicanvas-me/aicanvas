// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — renders JSX design-system components whose forwardRef wrappers
// carry no TypeScript prop types (same reason as the matrix specs).
'use client'

import type { ReactNode } from 'react'
import { Bolt } from '@/app/_icons/icons/bolt'
import { Mail } from '@/app/_icons/icons/mail'
import { Refresh } from '@/app/_icons/icons/refresh'
import {
  Badge,
  Button,
  Checkbox,
  DateRangePicker,
  Gauge,
  IconButton,
  Input,
  Slider,
  Toggle,
  Tooltip,
} from '../../../lib/andromeda-pro.generated'
import { PickerCombobox } from '../../../_lib/andromeda-pro/matrix/combobox'
import { MatrixSolo } from '../../../_lib/andromeda-pro/matrix/Matrix'
import { SPEC_BY_SLUG } from '../../../_lib/andromeda-pro/matrix'

// One hero per component: the single state that best sells it, alone. Hand-built
// poses come first; every other slug shows one matrix case through MatrixSolo.
// Scale and open-on-capture steps live in scripts/screenshot-andromeda-hero.mjs.
const RANGE = { start: new Date(2026, 6, 22), end: new Date(2026, 7, 20) }

export const POSES: Record<string, ReactNode> = {
  button: (
    <Button size="lg" icon={Bolt}>
      Deploy
    </Button>
  ),
  combobox: (
    // Height = field + the three results "a" finds, so the open pair is centered.
    <div style={{ width: 360, height: 162 }}>
      <PickerCombobox />
    </div>
  ),
  toggle: <Toggle size="lg" label="Auto-scale" defaultChecked />,
  checkbox: (
    <div>
      <Checkbox
        size="lg"
        label="Email notifications"
        description="Only incidents on your own services."
        defaultChecked
      />
    </div>
  ),
  slider: (
    <div style={{ width: 340 }}>
      <Slider size="lg" label="Price range" unit=" USD" min={0} max={1000} step={10} value={[190, 800]} />
    </div>
  ),
  // The top padding matches the bubble, so the pair (not the button) is centered.
  tooltip: (
    <div style={{ paddingTop: 32 }}>
      <Tooltip label="Refresh" position="top">
        <IconButton aria-label="Refresh" icon={Refresh} size="lg" />
      </Tooltip>
    </div>
  ),
  badge: (
    <Badge size="lg" variant="accent">
      Live
    </Badge>
  ),
  input: (
    <div style={{ width: 340 }}>
      <Input size="lg" label="Email" icon={Mail} defaultValue="ops@orbital.dev" />
    </div>
  ),
  gauge: <Gauge size="lg" value={82} label="CPU" thresholds={{ warning: 90, fault: 95 }} />,
  'date-range-picker': (
    <div style={{ height: 344 }}>
      <DateRangePicker value={RANGE} presetLabel="Last month" staticOpen />
    </div>
  ),
}

// The matrix case each remaining component shows. Absent = the component page's own hero.
const CASE: Record<string, string> = {
  accordion: 'Open by default',
  alert: 'Accent',
  avatar: 'Image',
  card: 'Glow',
  'chart-funnel': 'Tone from data',
  'chart-metric': 'Tone from data',
  'choice-card': 'Radio group',
  collapsible: 'Open',
  'empty-state': 'With actions',
  'heat-grid': 'Live',
  item: 'With description',
  'media-card': 'Play action',
  message: 'Assistant',
  'music-player': 'Playing',
  'nav-item': 'Active',
  'panel-header': 'With actions',
  'panel-menu': 'Open',
  'payment-card': 'Brand',
  // Opened by a click in the script: mounted open, its fade-in never runs.
  popover: 'Closed',
  'pricing-card': 'Featured',
  'prompt-input': 'With draft',
  radio: 'With description',
  'segmented-control': 'Live',
  spinner: 'Accent',
  'stat-tile': 'Rising',
  stepper: 'Mid-way',
  'strength-meter': 'Strong',
  suggestion: 'With icon',
  'table-data': 'Selected row',
  tag: 'Dismissible',
  tool: 'Done open',
  'user-card': 'Open down',
  'user-menu': 'Open down',
}

// A block that spans its container gets a set column; the script then fits it.
const WIDTH: Record<string, number> = {
  accordion: 520, artifact: 560, 'bento-grid': 640, card: 420, 'chart-funnel': 640,
  'chart-metric': 640, 'chart-radar': 420, 'chart-trend': 720, 'choice-card': 440, collapsible: 480,
  'empty-state': 520, footer: 820, 'logo-cloud': 900, marquee: 640, message: 520,
  'music-player': 420, navbar: 800, 'panel-header': 520, 'progress-bar': 420, 'prompt-input': 560,
  'search-field': 420, 'section-heading': 720, 'strength-meter': 360, 'table-basic': 900,
  'table-data': 900, tabs: 360, textarea: 420, tool: 520, 'top-bar': 760, waveform: 640,
  burst: 520, cube: 420, nodes: 560, orb: 420, planet: 420,
}

// A full-height column gets a shorter frame so it reads at card size.
const HEIGHT: Record<string, number> = { sidebar: 440 }

export function hasPose(slug: string) {
  return slug in POSES || slug in SPEC_BY_SLUG
}

export function Pose({ slug }: { slug: string }) {
  if (slug in POSES) return POSES[slug]
  return (
    <div style={{ width: WIDTH[slug], height: HEIGHT[slug] }}>
      <MatrixSolo spec={SPEC_BY_SLUG[slug]} label={CASE[slug]} />
    </div>
  )
}
