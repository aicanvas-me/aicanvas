// ============================================================
// RESOURCE PLANNING · AllocationChart
// Thin composition over the global TrendChart: the panel frame
// (surface + corner markers) wraps a TrendChart configured for the
// allocation-vs-usage series. Colour follows the multi-series
// hierarchy via `role` — allocated = baseline (white), used = live
// (accent), reserved = context (faint). The "Vs. previous period"
// switch rides in the chart's footer slot.
// ============================================================

'use client';

import { useState } from 'react';
import type { ComponentProps } from 'react';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { CornerMarkers } from '../../components/CornerMarkers';
import { Toggle } from '../../components/Toggle';
import { TrendChart } from '../../components/TrendChart';
import { allocationSeries } from './data';

const SERIES: ComponentProps<typeof TrendChart>['series'] = [
  { key: 'allocated', label: 'Allocated', role: 'baseline' },
  { key: 'used',      label: 'Used',      role: 'live' },
  { key: 'reserved',  label: 'Reserved',  role: 'context' },
];

export function AllocationChart() {
  const [vsPrev, setVsPrev] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        background: themeColor.surface.raised,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        padding: `${tokens.spacing[4]} ${tokens.spacing[5]}`,
      }}
    >
      <CornerMarkers />
      <TrendChart
        data={allocationSeries}
        series={SERIES}
        title="Allocation vs usage"
        yLabel="Compute units, PFLOPS"
        height="fill"
        tooltipLabelFormatter={(l) => `AUG ${String(l).padStart(2, '0')}`}
        footerSlot={
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.sm,
              color: themeColor.text.muted,
              letterSpacing: tokens.typography.tracking.wide,
            }}
          >
            <Toggle checked={vsPrev} onCheckedChange={setVsPrev} />
            Vs. previous period
          </span>
        }
      />
    </div>
  );
}
