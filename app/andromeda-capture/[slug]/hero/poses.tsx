// @ts-nocheck — renders JSX design-system components whose forwardRef wrappers
// carry no TypeScript prop types (same reason as the matrix specs).
'use client'

import type { ReactNode } from 'react'
import { ArrowClockwise, Envelope, Lightning } from '@phosphor-icons/react'
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

// One hero per component: the single state that best sells it, alone. Scale and
// any open-on-capture step live beside the slug in scripts/screenshot-andromeda.mjs.
const RANGE = { start: new Date(2026, 6, 22), end: new Date(2026, 7, 20) }

export const POSES: Record<string, ReactNode> = {
  button: (
    <Button size="lg" icon={Lightning}>
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
        <IconButton aria-label="Refresh" icon={ArrowClockwise} size="lg" />
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
      <Input size="lg" label="Email" icon={Envelope} defaultValue="ops@orbital.dev" />
    </div>
  ),
  gauge: <Gauge size="lg" value={82} label="CPU" thresholds={{ warning: 90, fault: 95 }} />,
  'date-range-picker': (
    <div style={{ height: 344 }}>
      <DateRangePicker value={RANGE} presetLabel="Last month" staticOpen />
    </div>
  ),
}
