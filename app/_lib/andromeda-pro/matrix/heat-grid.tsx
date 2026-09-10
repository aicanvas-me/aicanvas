// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
'use client'

import { useState } from 'react'
import { HeatGrid } from '../../../lib/andromeda-pro.generated'
import { Button } from '../../../lib/andromeda-pro.generated'
import { Slider } from '../../../lib/andromeda-pro.generated'
import { tokens } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

// The one thing a still cell cannot show: the gauge stays live after its first
// fill, so a later value CROSSFADES in place instead of re-filling. Carried
// over from the system page's hand-written section during the 2026-08-09
// collapse, because no arrangement of static cells demonstrates it.
function LiveHeatGrid() {
  const [value, setValue] = useState(60)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[8], flexWrap: 'wrap' }}>
      <HeatGrid value={value} label="Live gauge" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], minWidth: 240 }}>
        <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
          {[0, 40, 60, 80, 100].map((v) => (
            <Button key={v} size="sm" variant={value === v ? 'default' : 'outline'} onClick={() => setValue(v)}>
              {v}%
            </Button>
          ))}
        </div>
        <Slider value={value} onValueChange={setValue} min={0} max={100} label="Fill" unit="%" />
      </div>
    </div>
  )
}

export const heatGrid: MatrixSpec = {
  slug: 'heat-grid',
  Component: HeatGrid,
  // Geometry is per-cell (cellSize, gap), not a named size ladder.
  sizes: null,
  variants: [
    { label: 'Live', node: <LiveHeatGrid /> },
    { label: 'Low', props: { value: 25, label: 'Low' } },
    { label: 'Mid', props: { value: 60, label: 'Window risk' } },
    { label: 'High', props: { value: 85, label: 'High' } },
    { label: 'Dense', props: { value: 60, cellSize: 16, gap: 2, cols: 12, label: 'Dense' } },
    { label: 'No readout', props: { value: 60, showValue: false } },
  ],
  states: [],
}
