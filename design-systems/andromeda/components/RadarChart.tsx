'use client';

import { forwardRef, useId, useState, useEffect, useRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { useInView, motion } from 'framer-motion';
import {
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn, andromedaVars, themeColor } from './lib/utils';
import { useResolvedColors } from './lib/theme';
import type { ColorSpec } from './lib/theme';
import { useReducedMotion } from './lib/motion';
import { tokens } from '../tokens';
import { CornerMarkers } from './CornerMarkers';

// Returns seconds: Framer Motion takes seconds, tokens store ms.
const ms = (v: string) => parseInt(v, 10) / 1000;
// Mirrors tokens.motion.easing.out; change both.
const EASE_OUT: [number, number, number, number] = [0, 0, 0.2, 1];

type RadarRow = Record<string, string | number>;

type RadarSeries = {
  key: string;
  label: string;
  color?: string;
};

// Plot colours must come from c.*: raw token values stay dark-theme on light pages.
const RADAR_VARS = {
  borderSubtle: ['--andromeda-border-subtle', tokens.color.border.subtle],
  accent300:    ['--andromeda-accent-300',    tokens.color.accent[300]],
  red300:       ['--andromeda-red-300',       tokens.color.red[300]],
} as const satisfies ColorSpec;

type RadarColors = Record<keyof typeof RADAR_VARS, string>;

type RadarSeriesInternal = RadarSeries & { stop?: keyof RadarColors };

const DEFAULT_DATA: RadarRow[] = [
  { axis: 'HULL',   nominal: 92, critical: 68 },
  { axis: 'POWER',  nominal: 78, critical: 45 },
  { axis: 'NAV',    nominal: 88, critical: 80 },
  { axis: 'COMMS',  nominal: 60, critical: 30 },
  { axis: 'LIFE',   nominal: 95, critical: 90 },
  { axis: 'THRUST', nominal: 72, critical: 55 },
];

const DEFAULT_SERIES: RadarSeriesInternal[] = [
  { key: 'nominal',  label: 'Nominal',  stop: 'accent300' },
  { key: 'critical', label: 'Critical', stop: 'red300' },
];

type RadarTooltipEntry = {
  dataKey?: string;
  value?: string | number;
  color?: string;
};

type SpaceTooltipProps = {
  active?: boolean;
  payload?: readonly RadarTooltipEntry[];
  label?: string | number;
  series?: RadarSeries[];
  onFirstActive?: () => void;
};

function SpaceTooltip({ active, payload, label, series, onFirstActive }: SpaceTooltipProps) {
  useEffect(() => {
    if (active && payload?.length) onFirstActive?.();
  }, [active]);

  if (!active || !payload?.length) return null;

  return (
    <div style={{
      background: themeColor.surface.raised,
      border: `${tokens.border.thin} ${themeColor.border.base}`,
      padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      position: 'relative',
      animation: 'andromeda-tooltip-in var(--andromeda-duration-normal, 140ms) var(--andromeda-easing-out, cubic-bezier(0, 0, 0.2, 1)) both',
      minWidth: 120,
    }}>
      <div style={{
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.typography.size.xs,
        color: themeColor.text.muted,
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
            <span style={{ color: themeColor.text.secondary, textTransform: 'uppercase', letterSpacing: tokens.typography.tracking.wider }}>
              {s?.label ?? entry.dataKey}
            </span>
            <span style={{ color: themeColor.text.primary, marginLeft: 'auto', paddingLeft: tokens.spacing[3] }}>
              {entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

type SpaceTickProps = {
  x: number;
  y: number;
  payload: { value: string | number };
  cx: number;
  cy: number;
};

function SpaceTick(props: Partial<SpaceTickProps>) {
  const { x, y, payload, cx, cy } = props as SpaceTickProps;
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
        fontSize: '9px',
        fill: themeColor.text.muted,
        textTransform: 'uppercase',
        letterSpacing: tokens.typography.tracking.wider,
      }}
    >
      {payload.value}
    </text>
  );
}

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

function useTooltipTransition() {
  const [shown, setShown] = useState(false);
  const shownRef = useRef(false);

  const onFirstActivation = () => {
    if (shownRef.current) return;
    shownRef.current = true;
    requestAnimationFrame(() => setShown(true));
  };

  return { shown, onFirstActivation };
}

type RadarChartProps = ComponentPropsWithoutRef<'div'> & {
  data?: RadarRow[];
  series?: RadarSeries[];
  label?: string;
  title?: string;
  description?: string;
};

export const RadarChart = forwardRef<HTMLDivElement, RadarChartProps>(function RadarChart(
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

  const chartId = `andromeda-radar-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const internalRef = useRef<HTMLDivElement | null>(null);
  const setRefs = (node: HTMLDivElement | null) => {
    internalRef.current = node;
    if (typeof outerRef === 'function') outerRef(node);
    else if (outerRef) outerRef.current = node;
  };
  const inView = useInView(internalRef, { once: true, margin: '-10% 0px' });
  const reducedMotion = useReducedMotion();

  const c = useResolvedColors(internalRef, RADAR_VARS);
  const plotColor = (s: RadarSeries) =>
    s.color ?? c[(s as RadarSeriesInternal).stop ?? 'accent300'];

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
        background: themeColor.surface.raised,
        ...style,
      }}
      {...props}
    >
      <CornerMarkers />

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
          background: themeColor.border.subtle,
          pointerEvents: 'none',
        }} />
        <span style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.xs,
          color: themeColor.text.muted,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.widest,
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.md,
          fontWeight: tokens.typography.weight.medium,
          color: themeColor.text.primary,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.wider,
        }}>
          {title}
        </span>
        {description ? (
          <span style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: themeColor.text.faint,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.wide,
            marginTop: '2px',
          }}>
            {description}
          </span>
        ) : null}
      </div>

      <div
        role="img"
        aria-label="Systems radar chart"
        style={{ padding: `${tokens.spacing[4]} ${tokens.spacing[2]}`, position: 'relative' }}
      >

        {/* ResponsiveContainer needs this box to have a real width and height. */}
        <motion.div style={{ width: '100%', height: 280 }} {...revealProps}>
        <ResponsiveContainer width="100%" height={280}>
          <ReRadarChart id={chartId} data={data} margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
            <PolarGrid
              stroke={c.borderSubtle}
              strokeWidth={parseInt(tokens.border.width)}
              gridType="polygon"
            />

            <PolarAngleAxis
              dataKey="axis"
              tick={<SpaceTick />}
              tickLine={false}
              axisLine={{ stroke: c.borderSubtle, strokeWidth: parseInt(tokens.border.width) }}
            />

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

            {series.map((s, i) => (
              <Radar
                key={s.key}
                dataKey={s.key}
                stroke={plotColor(s)}
                strokeWidth={1.5}
                fill={plotColor(s)}
                fillOpacity={i === 0 ? 0.12 : 0.06}
                dot={false}
                activeDot={{
                  r: 3,
                  fill: plotColor(s),
                  strokeWidth: 0,
                }}
              />
            ))}
          </ReRadarChart>
        </ResponsiveContainer>
        </motion.div>
      </div>

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
          background: themeColor.border.subtle,
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
              background: plotColor(s),
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              color: themeColor.text.muted,
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
