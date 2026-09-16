// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
'use client'

import { useState } from 'react'
import { Slider } from '../../../lib/andromeda-pro.generated'
import { tokens } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

// Static cells show where the thumb can sit; only a live one shows the readout
// tracking it. Carried over from the system page's former hand-written
// section.
function LiveSlider() {
  const [volume, setVolume] = useState(64)
  const [vector, setVector] = useState(12)
  const [budget, setBudget] = useState<[number, number]>([190, 800])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5], width: '100%' }}>
      <Slider label="Volume" unit="%" value={volume} onValueChange={setVolume} />
      <Slider label="Rotation" unit="°" min={-30} max={30} value={vector} onValueChange={setVector} />
      <Slider label="Price range" unit=" USD" min={0} max={1000} step={10} value={budget} onValueChange={setBudget} />
    </div>
  )
}

export const slider: MatrixSpec = {
  slug: 'slider',
  Component: Slider,
  // The ladder starts at md for this control: see the SIZES note in Slider.tsx.
  sizes: ['md', 'lg'],
  // A slider is w-full by design, and a hard 300px here made every rung the
  // same width as the sm one no matter how much room its case owned.
  fill: true,
  // The other half of `fill`, same pairing Input and Textarea use: one card per
  // row. Sharing a row with a second card leaves each rung about a sixth of the
  // page, where a label and its readout collide instead of sitting on one line.
  wide: true,
  // wide's equal columns would otherwise stack the Rest/forced pair vertically,
  // reading as two examples rather than one comparison.
  statePairColumns: true,
  baseProps: { value: 64 },
  variants: [
    { label: 'Live', node: <LiveSlider /> },
    { label: 'Default', props: { showValue: false } },
    { label: 'Labelled', props: { label: 'Volume', unit: '%' } },
    { label: 'At minimum', props: { value: 0, showValue: false } },
    // A tuple enters two-thumb mode. Worth its own case at every rung: the pair
    // anchors by its inner edges, and sm is where a 6px thumb makes that read.
    { label: 'Two thumbs', props: { label: 'Price range', unit: ' USD', min: 0, max: 1000, step: 10, value: [190, 800] } },
  ],
  states: [
    // Both live on the thumb: a 1.25 scale on hover and an accent ring on
    // focus-visible. Neither moves a colour on the track, so the Rest cell
    // beside them is doing most of the work.
    { label: 'Hover', force: 'hover' },
    { label: 'Focus visible', force: 'focus' },
    { label: 'Disabled', props: { disabled: true } },
  ],
  gaps: {
    Dragging: 'the value follows a pointermove handler; a dragged slider is a different value, not a different painted state',
  },
}
