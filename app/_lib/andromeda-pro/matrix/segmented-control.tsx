// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
'use client'

import { useState } from 'react'
import { ChartBar, ChartLine } from '@phosphor-icons/react'
import { SegmentedControl } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

const noop = () => {}

const ICONS = [
  { value: 'line', icon: ChartLine, ariaLabel: 'Line chart' },
  { value: 'bars', icon: ChartBar, ariaLabel: 'Bar chart' },
]
// Both slots at once. A segment carrying words is padded and free-width, so
// this case is also what proves the icon-only square cell has not swallowed it.
const ICON_LABELS = [
  { value: 'line', icon: ChartLine, label: 'Line' },
  { value: 'bars', icon: ChartBar, label: 'Bars' },
]
const PERIODS = [
  { value: '1d', label: '1D' },
  { value: '1w', label: '1W' },
  { value: '1m', label: '1M' },
  { value: 'all', label: 'ALL' },
]

// The sliding indicator is the component's whole character, and it only exists
// between two selections. Carried over from the system page's hand-written
// section in the 2026-08-09 collapse.
function LiveSegmentedControl() {
  const [period, setPeriod] = useState('1w')
  return (
    <SegmentedControl
      ariaLabel="Chart period"
      options={PERIODS}
      value={period}
      onChange={setPeriod}
    />
  )
}

export const segmentedControl: MatrixSpec = {
  slug: 'segmented-control',
  sizes: ['sm', 'md', 'lg'],
  // One card per row. Three rungs of a four-segment control do not fit half a
  // row, and the control shrinks while its segments keep their text width — so
  // the labels bleed over the neighbouring rung and the case reads as broken.
  wide: true,
  // The hero shows one control at its own width, so it sits centred there.
  soloCentered: true,
  // Each instance auto-scopes its sliding indicator with useId, including the
  // repeated controls this matrix renders.
  render: (size, props, c) => (
    <SegmentedControl
      size={size}
      ariaLabel="Chart display"
      options={PERIODS}
      value="1w"
      onChange={noop}
      {...props}
    />
  ),
  variants: [
    { label: 'Live', node: <LiveSegmentedControl /> },
    { label: 'Labels', props: {} },
    { label: 'Icons', props: { options: ICONS, value: 'line' } },
    { label: 'Icon and label', props: { options: ICON_LABELS, value: 'line' } },
    // Selection is a prop, so it costs nothing to show it selected somewhere
    // other than the first segment — which is where the indicator's position
    // actually becomes informative.
    { label: 'Last selected', props: { value: 'all' } },
  ],
  states: [],
  gaps: {
    Hover:
      'segments are DATA (an options array), not elements the caller can reach, and the hover rule in the component\'s stylesheet is per-segment — marking one would mean lighting every unselected segment at once',
  },
}
