// @ts-nocheck — design-systems/ is not type-checked (see design-systems/CLAUDE.md). Strip this after a proper typing pass.
// ============================================================
// COMPONENT: RadarChart
// Andromeda-styled radar/spider chart built on recharts primitives.
// No shadcn chart wrapper needed — everything is styled directly
// via andromeda tokens and inline SVG overrides.
//
// Props:
//   data        — array of { axis, [key]: number } objects
//   series      — array of { key, label, color? } descriptors
//   label       — card kicker label
//   title       — card title
//   description — card description line
//   className / style passthrough
//
// Defaults to two series, "Nominal" and "Critical", forming a
// ship-systems diagnostic if no data/series are provided.
// ============================================================

'use client';

import { forwardRef, useId, useState, useEffect, useRef } from 'react';
import { useInView, motion } from 'framer-motion';
import {
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn, andromedaVars } from './lib/utils';
import { useReducedMotion } from './lib/motion';
import { tokens } from '../tokens';
import { CornerMarkers } from './CornerMarkers';

// Framer wants seconds + a cubic-bezier array; tokens store ms strings and
// CSS cubic-bezier() strings. Convert at the boundary, same pattern as
// StatTile / lib/motion.
const ms = (v) => parseInt(v, 10) / 1000;
// Token-driven equivalent of tokens.motion.easing.out
// ('cubic-bezier(0, 0, 0.2, 1)') — fast start, soft landing. Keep in sync.
const EASE_OUT = [0, 0, 0.2, 1];

// ── Default demo data ────────────────────────────────────────────────────────
const DEFAULT_DATA = [
  { axis: 'HULL',   nominal: 92, critical: 68 },
  { axis: 'POWER',  nominal: 78, critical: 45 },
  { axis: 'NAV',    nominal: 88, critical: 80 },
  { axis: 'COMMS',  nominal: 60, critical: 30 },
  { axis: 'LIFE',   nominal: 95, critical: 90 },
  { axis: 'THRUST', nominal: 72, critical: 55 },
];

const DEFAULT_SERIES = [
  { key: 'nominal',  label: 'Nominal',  color: tokens.color.accent[300] },
  { key: 'critical', label: 'Critical', color: tokens.color.red[300] },
];

// ── Custom tooltip ───────────────────────────────────────────────────────────
function SpaceTooltip({ active, payload, label, series, onFirstActive }) {
  useEffect(() => {
    if (active && payload?.length) onFirstActive?.();
  }, [active]);

  if (!active || !payload?.length) return null;

  return (
    <div style={{
      // Solid raised surface so text is always legible against any chart color
      background: tokens.color.surface.raised,
      // tokens.border.thin === 'var(--andromeda-border-width, 1px) solid'; keep
      // color.border.base to stay pixel-identical (siblings use bright, but
      // switching here would change default rendering — hard rule 1).
      border: `${tokens.border.thin} ${tokens.color.border.base}`,
      padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      position: 'relative',
      // Slide-in from slightly above, fade in — triggered on every mount
      animation: 'andromeda-tooltip-in var(--andromeda-duration-normal, 140ms) var(--andromeda-easing-out, cubic-bezier(0, 0, 0.2, 1)) both',
      minWidth: 120,
    }}>
      <div style={{
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.typography.size.xs,
        color: tokens.color.text.muted,
        textTransform: 'uppercase',
        letterSpacing: tokens.typography.tracking.widest,
        marginBottom: tokens.spacing[1],
      }}>
        {label}
      </div>
      {payload.map((entry) => {
        const s = series?.find(s => s.key === entry.dataKey);
        return (
          <div key={entry.dataKey} style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
          }}>
            <span style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              background: entry.color,
              flexShrink: 0,
            }} />
            <span style={{ color: tokens.color.text.secondary, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.wider }}>
              {s?.label ?? entry.dataKey}
            </span>
            <span style={{ color: tokens.color.text.primary, marginLeft: 'auto', paddingLeft: tokens.spacing[3] }}>
              {entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Custom polar angle tick ──────────────────────────────────────────────────
function SpaceTick({ x, y, payload, cx, cy }) {
  // Nudge label slightly away from center
  const dx = x - cx;
  const dy = y - cy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = x + (dx / len) * 10;
  const ny = y + (dy / len) * 10;

  return (
    <text
      x={nx}
      y={ny}
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontFamily: tokens.typography.fontMono,
        // Identity constant: the 9px polar tick is off the text scale
        fontSize: '9px',
        fill: tokens.color.text.muted,
        textTransform: 'uppercase',
        letterSpacing: tokens.typography.tracking.wider,
      }}
    >
      {payload.value}
    </text>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * @typedef {object} RadarSeries
 * @property {string} key Key in each data row whose numeric value this series plots.
 * @property {string} label Series name shown in the legend and tooltip.
 * @property {string} [color] Stroke and fill color for this series, defaults to the accent color.
 *
 * @typedef {object} RadarChartProps
 * @property {object[]} [data] Array of data rows, each an axis label plus one numeric value per series.
 * @property {RadarSeries[]} [series] Series descriptors defining which data keys to plot and how.
 * @property {string} [label='/// Diagnostics'] Kicker text shown above the title in the card header.
 * @property {string} [title='Systems Radar'] Main heading shown in the card header.
 * @property {string} [description] Optional line of text shown beneath the title.
 * @property {string} [className] Additional CSS classes for the root element.
 * @property {React.CSSProperties} [style] Inline styles merged onto the root element.
 */

// After the tooltip first becomes active, we enable CSS transition on the
// wrapper so movement between segments is smooth. On first appearance the
// transition is suppressed so the tooltip snaps to the cursor (no fly from 0,0).
function useTooltipTransition() {
  const [shown, setShown] = useState(false);
  const shownRef = useRef(false);

  const onFirstActivation = () => {
    if (shownRef.current) return;
    shownRef.current = true;
    // One rAF: let recharts place wrapper at cursor, then enable transition.
    requestAnimationFrame(() => setShown(true));
  };

  return { shown, onFirstActivation };
}

/** @type {React.ForwardRefExoticComponent<RadarChartProps & React.HTMLAttributes<HTMLDivElement>>} */
export const RadarChart = forwardRef(function RadarChart(
  {
    data = DEFAULT_DATA,
    series = DEFAULT_SERIES,
    label = '/// Diagnostics',
    title = 'Systems Radar',
    description,
    className,
    style,
    ...props
  },
  outerRef,
) {
  const { shown, onFirstActivation } = useTooltipTransition();

  // Stable chart id — see TrendChart. Without one, recharts' internal clipPath
  // id comes from a module-level counter that desynchronises between the server
  // render and hydration, producing a React mismatch on every SSR page.
  const chartId = `andromeda-radar-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  // Scroll-aware scan reveal. The chart wipes itself in top-to-bottom the
  // first time it enters the viewport — a measurement revealing itself, not
  // decoration. Gated on useInView so a RadarChart below the fold doesn't
  // burn its reveal off-screen (same contract as StatTile / ProgressBar).
  // `margin: '-10% 0px'` triggers slightly before it's fully on-screen.
  const internalRef = useRef(null);
  const setRefs = (node) => {
    internalRef.current = node;
    if (typeof outerRef === 'function') outerRef(node);
    else if (outerRef) outerRef.current = node;
  };
  const inView = useInView(internalRef, { once: true, margin: '-10% 0px' });
  const reducedMotion = useReducedMotion();

  // Reduced motion: render the chart fully visible immediately — no wipe,
  // no transition. Otherwise wipe from hidden (inset top→bottom) to fully
  // revealed once in view.
  const revealProps = reducedMotion
    ? { initial: false, animate: { clipPath: 'inset(0 0 0% 0)', opacity: 1 } }
    : {
        initial: { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
        animate: inView
          ? { clipPath: 'inset(0 0 0% 0)', opacity: 1 }
          : { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
        transition: { duration: ms(tokens.motion.duration.cascade), ease: EASE_OUT },
      };

  return (
    <div
      ref={setRefs}
      className={cn('relative', className)}
      style={{
        ...andromedaVars(),
        background: 'var(--andromeda-surface-raised, #141415)',
        ...style,
      }}
      {...props}
    >
      <CornerMarkers />

      {/* Header */}
      <div style={{
        position: 'relative',
        padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}>
        <span aria-hidden style={{
          position: 'absolute',
          left: tokens.spacing[3],
          right: tokens.spacing[3],
          bottom: 0,
          height: '1px',
          background: tokens.color.border.subtle,
          pointerEvents: 'none',
        }} />
        <span style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.xs,
          color: tokens.color.text.muted,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.widest,
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.md,
          fontWeight: tokens.typography.weight.medium,
          color: tokens.color.text.primary,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.wider,
        }}>
          {title}
        </span>
        {description ? (
          <span style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: tokens.color.text.faint,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.wide,
            marginTop: '2px',
          }}>
            {description}
          </span>
        ) : null}
      </div>

      {/* Chart area */}
      <div
        role="img"
        aria-label="Systems radar chart"
        style={{ padding: `${tokens.spacing[4]} ${tokens.spacing[2]}`, position: 'relative' }}
      >

        {/* Scan-reveal wrapper. width/height 100% so ResponsiveContainer
            still measures the chart correctly — the motion.div must not
            collapse the sizing box. The clipPath wipe + opacity is driven
            by `revealProps` above (static when reduced motion). */}
        <motion.div style={{ width: '100%', height: 280 }} {...revealProps}>
        <ResponsiveContainer width="100%" height={280}>
          <ReRadarChart id={chartId} data={data} margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
            {/* Grid rings */}
            {/* RAW: recharts attribute sink — var() cannot resolve; revarnish maps the literal */}
            <PolarGrid
              stroke={tokens.color.border.subtle}
              strokeWidth={parseInt(tokens.border.width)}
              gridType="polygon"
            />

            {/* Axis labels */}
            <PolarAngleAxis
              dataKey="axis"
              tick={<SpaceTick />}
              tickLine={false}
              // RAW: recharts attribute sink — var() cannot resolve; revarnish maps the literal
              axisLine={{ stroke: tokens.color.border.subtle, strokeWidth: parseInt(tokens.border.width) }}
            />

            {/* isAnimationActive always off — recharts never tweens position.
                CSS transition on wrapperStyle handles smooth between-segment
                glide, but only after first activation (shown=true), so the
                first appearance snaps to cursor with no travel from (0,0). */}
            <Tooltip
              cursor={false}
              isAnimationActive={false}
              content={<SpaceTooltip series={series} onFirstActive={onFirstActivation} />}
              wrapperStyle={{
                outline: 'none',
                transition: shown
                  ? 'transform var(--andromeda-duration-slow, 200ms) var(--andromeda-easing-standard, cubic-bezier(0.4, 0, 0.2, 1))'
                  : 'none',
              }}
            />

            {/* Series */}
            {/* RAW: recharts attribute sink — var() cannot resolve; revarnish maps the literal */}
            {series.map((s, i) => (
              <Radar
                key={s.key}
                dataKey={s.key}
                stroke={s.color ?? tokens.color.accent[300]}
                strokeWidth={1.5}
                fill={s.color ?? tokens.color.accent[300]}
                fillOpacity={i === 0 ? 0.12 : 0.06}
                dot={false}
                activeDot={{
                  r: 3,
                  fill: s.color ?? tokens.color.accent[300],
                  strokeWidth: 0,
                }}
              />
            ))}
          </ReRadarChart>
        </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'relative',
        padding: `${tokens.spacing[2]} ${tokens.spacing[4]} ${tokens.spacing[3]}`,
        display: 'flex',
        gap: tokens.spacing[4],
      }}>
        <span aria-hidden style={{
          position: 'absolute',
          left: tokens.spacing[3],
          right: tokens.spacing[3],
          top: 0,
          height: '1px',
          background: tokens.color.border.subtle,
          pointerEvents: 'none',
        }} />
        {series.map(s => (
          <div key={s.key} style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
          }}>
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 2,
              background: s.color ?? 'var(--andromeda-accent-300, #0FCFB2)',
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              color: tokens.color.text.muted,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.wider,
            }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes andromeda-tooltip-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
});
