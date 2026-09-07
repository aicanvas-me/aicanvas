// ============================================================
// RESOURCE PLANNING · CapacityPanel
// Top-left card. Three KPI cells separated by 1px borders, each with
// a different micro-visual: skewed bar grid, gradient threshold bar,
// and a sparkline.
// ============================================================

'use client';

import type { ReactNode } from 'react';
import { AreaChart, Area, YAxis, ResponsiveContainer } from 'recharts';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { mq } from '../../components/lib/responsive';
import { CornerMarkers } from '../../components/CornerMarkers';
import { PanelHeader } from '../../components/PanelHeader';
import { PanelMenu } from '../../components/PanelMenu';
import { ArrowClockwise, Sliders, Export, EyeSlash } from '@phosphor-icons/react';
import { clusterUtilisation, missionSuccessRate, activeAllocations } from './data';

// ── Reusable cell wrapper ─────────────────────────────────────────
// `rp-cap-cell` carries the responsive separator swap: the desktop
// vertical border (borderRight, set inline below) is dropped below
// `mq.md` and replaced with a horizontal one (borderBottom) when the
// three cells stack — see <style> in CapacityPanel.
type CellProps = {
  label: string;
  children: ReactNode;
  last?: boolean;
};

function Cell({ label, children, last = false }: CellProps) {
  return (
    <div
      className={last ? 'rp-cap-cell rp-cap-cell-last' : 'rp-cap-cell'}
      style={{
        flex: '1 1 0',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: tokens.spacing[3],
        padding: `${tokens.spacing[5]} ${tokens.spacing[5]}`,
        borderRight: last ? 'none' : `${tokens.border.thin} ${themeColor.border.subtle}`,
      }}
    >
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
      {children}
    </div>
  );
}

// ── Headline number ───────────────────────────────────────────────
// The delta speaks StatTile's language: the ▲/▼ glyph is the direction of the
// move, the colour is the judgment of it, and `polarity` is what separates the
// two (see color-philosophy → "delta colour is a judgment").
type BigValueProps = {
  value: string;
  suffix?: string;
  delta?: number;
  polarity?: 'higher-is-better' | 'lower-is-better' | 'none';
};

function BigValue({ value, suffix, delta, polarity = 'higher-is-better' }: BigValueProps) {
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta);
  // Decide neutral on the number the reader actually sees, not the raw one:
  // this panel rounds to 1dp, so a delta of 0.04 would otherwise print
  // "▲ 0.0%" in accent — a judgment colour and a direction glyph on a figure
  // that reads as no change at all.
  const shown = hasDelta ? Math.abs(delta).toFixed(1) : null;
  const flat = hasDelta && Number(shown) === 0;
  const up = hasDelta && delta > 0;
  const good = polarity === 'lower-is-better' ? !up : up;
  const deltaColor = !hasDelta || flat || polarity === 'none'
    ? themeColor.text.muted
    : good
      ? themeColor.accent[300]
      : themeColor.red[300];

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing[2] }}>
      <span
        className="rp-cap-value"
        style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size['3xl'],
          fontWeight: tokens.typography.weight.bold,
          color: themeColor.text.primary,
          letterSpacing: tokens.typography.tracking.tight,
          lineHeight: tokens.typography.lineHeight.tight,
        }}
      >
        {value}
      </span>
      {suffix ? (
        <span
          style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.md,
            color: themeColor.text.muted,
            letterSpacing: tokens.typography.tracking.wide,
          }}
        >
          {suffix}
        </span>
      ) : null}
      {hasDelta ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: tokens.spacing[1],
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.sm,
            color: deltaColor,
            letterSpacing: tokens.typography.tracking.wide,
          }}
          aria-label={flat ? 'no change' : `${up ? 'up' : 'down'} ${shown} percent`}
        >
          {flat ? `${shown}%` : `${up ? '▲' : '▼'} ${shown}%`}
        </span>
      ) : null}
    </div>
  );
}

// ── Shared visualisation slot ─────────────────────────────────────
// Every viz in the CapacityPanel renders into a 40px-tall slot, anchored
// to the bottom of its cell, so the three cells line up perfectly across
// the row regardless of which visual they contain.
const VIZ_HEIGHT = 40;

// ── Skewed-bar grid (cluster utilisation) ────────────────────────
function BarGrid({ values }: { values: number[] }) {
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: `${VIZ_HEIGHT}px`, width: '100%' }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: '1 1 0',
            minWidth: 0,
            height: `${Math.max(8, v * VIZ_HEIGHT)}px`,
            transform: 'skewX(-12deg)',
            background: themeColor.accent[400],
          }}
        />
      ))}
    </div>
  );
}

// ── Gradient threshold bar (mission success) ─────────────────────
// Renders into the same 40px slot as the other viz. The bar pins to the
// top of the slot (so the marker sits comfortably above it) and the
// 0% / 100% labels pin to the bottom.
function ThresholdBar({ value }: { value: number }) {
  return (
    <div
      style={{
        position: 'relative',
        height: `${VIZ_HEIGHT}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          position: 'relative',
          marginTop: '8px',
          height: '12px',
          background: `linear-gradient(90deg, ${themeColor.red[400]} 0%, ${themeColor.orange[300]} 50%, ${themeColor.accent[300]} 100%)`,
          border: `${tokens.border.thin} ${themeColor.border.subtle}`,
          borderRadius: tokens.radius.frame,
        }}
      >
        {/* Marker — anchored above the bar with a downward arrow */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: '-8px',
            left: `calc(${value}% - 4px)`,
            width: 0,
            height: 0,
            borderLeft: `4px solid transparent`,
            borderRight: `4px solid transparent`,
            borderTop: `6px solid ${themeColor.text.primary}`,
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: themeColor.text.faint, letterSpacing: tokens.typography.tracking.wider }}>
          0%
        </span>
        <span style={{ fontFamily: tokens.typography.fontMono, fontSize: tokens.typography.size.xs, color: themeColor.text.faint, letterSpacing: tokens.typography.tracking.wider }}>
          100%
        </span>
      </div>
    </div>
  );
}

// ── Sparkline (active allocations) ───────────────────────────────
// The live measurement of the cell, so it takes the live-series ink and the
// same stroke, fill and marker conventions as TrendChart: accent-300 line at
// the chart line width, the accent fill topping out at the chart fill opacity,
// and one marker on the last point, the reading the big value shows.
function Sparkline({ data }: { data: Array<{ t: number; v: number }> }) {
  // Fit the range to the data with a little headroom either side, so the rise
  // reads without the line kissing the top and bottom of the slot.
  const values = data.map((d) => d.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.12 || 1;
  const lastIndex = data.length - 1;
  return (
    <div style={{ height: `${VIZ_HEIGHT}px`, width: '100%' }}>
      {/* Fixed height (not "100%"): the wrapper is exactly VIZ_HEIGHT anyway,
          and a known height stops recharts warning "width(-1) and height(-1)"
          on its first pre-measure render — same pattern as RadarChart. */}
      <ResponsiveContainer width="100%" height={VIZ_HEIGHT}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id="rp-spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   style={{ stopColor: themeColor.accent[300] }} stopOpacity={tokens.chart.fillOpacity} />
              <stop offset="100%" style={{ stopColor: themeColor.accent[300] }} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[min - pad, max + pad]} />
          <Area
            type="monotone"
            dataKey="v"
            style={{ stroke: themeColor.accent[300] }}
            strokeWidth={tokens.chart.lineWidth}
            fill="url(#rp-spark-fill)"
            dot={(props: { cx?: number; cy?: number; index?: number }) =>
              props.index === lastIndex && props.cx != null && props.cy != null ? (
                <circle
                  key="spark-end"
                  cx={props.cx}
                  cy={props.cy}
                  r={3}
                  style={{ fill: themeColor.accent[300], stroke: themeColor.surface.raised }}
                  strokeWidth={1.5}
                />
              ) : (
                <g key={`spark-${props.index ?? 'none'}`} />
              )
            }
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Composition ──────────────────────────────────────────────────
export function CapacityPanel() {
  return (
    <div
      style={{
        position: 'relative',
        background: themeColor.surface.raised,
        display: 'flex',
        flexDirection: 'column',
        // Fill the grid cell so the top-row panels (Capacity + Requests) always
        // share one height — the seams line up across the left/right divide.
        height: '100%',
      }}
    >
      <CornerMarkers />

      <PanelHeader
        title="Capacity"
        actions={
          <PanelMenu
            ariaLabel="Capacity options"
            items={[
              { label: 'Refresh',   icon: ArrowClockwise, onSelect: () => {} },
              { label: 'Configure', icon: Sliders,        onSelect: () => {} },
              { label: 'Export',    icon: Export,         onSelect: () => {} },
              { type: 'separator' },
              { label: 'Hide',      icon: EyeSlash,       onSelect: () => {} },
            ]}
          />
        }
      />

      {/* Three KPI cells — flex:1 so the row fills the panel height in
          a bento grid where both top panels share a single row height.
          Below `mq.md` the row stacks (flex-direction:column) and the
          inter-cell separators flip from vertical to horizontal. */}
      <div className="rp-cap-cells" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Cell label="Cluster utilisation">
          <BigValue value={`${clusterUtilisation.value.toFixed(1)}`} suffix="%" />
          <BarGrid values={clusterUtilisation.segments} />
        </Cell>
        <Cell label="Mission success rate">
          <BigValue value={`${missionSuccessRate.value.toFixed(1)}`} suffix="%" />
          <ThresholdBar value={missionSuccessRate.value} />
        </Cell>
        <Cell label="Active allocations" last>
          <BigValue value={activeAllocations.value.toLocaleString('en-US')} delta={activeAllocations.delta} />
          <Sparkline data={activeAllocations.series} />
        </Cell>
      </div>

      <style>{`
        ${mq.md} {
          /* Stack the three KPI cells top-to-bottom; swap the vertical
             inter-cell border for a horizontal one so the divider follows
             the new flow. */
          .rp-cap-cells { flex-direction: column !important; }
          .rp-cap-cell {
            border-right: none !important;
            border-bottom: ${tokens.border.thin} ${themeColor.border.subtle} !important;
          }
          .rp-cap-cell-last { border-bottom: none !important; }
        }
        ${mq.sm} {
          /* Step the hero KPI reading down one stop (3xl → 2xl) so it stops
             overpowering a phone. */
          .rp-cap-value { font-size: ${tokens.typography.size['2xl']} !important; }
        }
      `}</style>
    </div>
  );
}
