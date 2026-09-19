// ============================================================
// COMPONENT: MetricChart
// The framed single-series live-telemetry chart panel: a self-framed
// surface (CornerMarkers + kicker/title header + status Badge) around
// ONE area chart that fits its y-domain to the data by default.
//
// The line between this and TrendChart is the FRAME, not the domain.
// TrendChart renders content only, for a Card you compose yourself,
// and baselines at 0; this brings its own frame and fits the axis,
// because a lone measurement (altitude, NRR %, latency, throughput)
// is usually a sliver against a zero floor. Both take a `domain`, so
// a non-zero floor is not on its own a reason to restructure a
// working card into this component.
//
// Props:
//   label       — card kicker label
//   title       — card title (uppercase mono)
//   description — optional card description line
//   data        — array of { [xKey], [dataKey] } points
//   dataKey     — value key (default 'v')
//   xKey        — x-axis key (default 't')
//   unit        — unit suffix shown after the tooltip value
//   variant     — 'accent' | 'warning' | 'fault' — changes the
//                 header Badge ONLY; chart ink stays neutral
//                 (the Andromeda charts rule: colour is measurement,
//                 never decoration — text.primary stroke always)
//   badgeText   — badge label (default 'Live'; null hides the badge)
//   domain      — recharts y-domain (default fitted:
//                 ['dataMin - 1', 'dataMax + 1'])
//   xInterval   — x tick interval (default 3)
//   height      — plot height in px (default 224) or 'fill' to grow
//                 into a flex parent panel
//   className / style passthrough
//
// Defaults to a built-in 24h altitude-like series so the component
// renders meaningfully with zero props. The left-to-right draw
// reveal is gated on useInView (once) and honours
// prefers-reduced-motion (reduced → final state instantly).
// ============================================================

'use client';

import { forwardRef, useId, useRef } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AxisDomainItem } from 'recharts';
import { motion, useInView } from 'framer-motion';
import { tokens } from '../tokens';
import { cn, andromedaVars } from './lib/utils';
import { useReducedMotion } from './lib/motion';
import { useResolvedColors } from './lib/theme';
import type { ColorSpec } from './lib/theme';
import { CornerMarkers } from './CornerMarkers';
import { Badge } from './Badge';
import type { BadgeProps } from './Badge';

// Framer wants seconds + a cubic-bezier array; tokens store ms strings and
// CSS cubic-bezier() strings. Convert at the boundary, same pattern as
// RadarChart / TrendChart / lib/motion.
const ms = (v: string) => parseInt(v, 10) / 1000;
// Token-driven equivalent of tokens.motion.easing.out
// ('cubic-bezier(0, 0, 0.2, 1)') — fast start, soft landing. Keep in sync.
const EASE_OUT: [number, number, number, number] = [0, 0, 0.2, 1];

// ── Plot colors ──────────────────────────────────────────────────────────────
// Every color recharts needs, as [custom property, literal]. recharts hands its
// color props to SVG presentation ATTRIBUTES, which never substitute a var(),
// so these are read back resolved from the panel's own root instead.
const CHART_VARS = {
  textPrimary:   ['--andromeda-text-primary',   tokens.color.text.primary],
  textMuted:     ['--andromeda-text-muted',     tokens.color.text.muted],
  borderSubtle:  ['--andromeda-border-subtle',  tokens.color.border.subtle],
  borderBright:  ['--andromeda-border-bright',  tokens.color.border.bright],
  surfaceRaised: ['--andromeda-surface-raised', tokens.color.surface.raised],
} as const satisfies ColorSpec;

type MetricChartVariant = 'accent' | 'warning' | 'fault';

// The variant only routes to the Badge — the chart ink is ALWAYS neutral
// (text.primary stroke, 0.12 → 0 gradient fill). Colour enters the panel
// through the badge dot, nowhere else.
const BADGE_VARIANT: Record<MetricChartVariant, NonNullable<BadgeProps['variant']>> = {
  accent:  'accent',
  warning: 'warning',
  fault:   'fault',
};

// Fitted default domain — the whole reason this component exists. A zero
// floor on non-zero data (altitude ~420, NRR ~100%) crams the signal into
// a sliver; dataMin/dataMax ± 1 keeps the curve filling the plot.
const DEFAULT_DOMAIN: [AxisDomainItem, AxisDomainItem] = ['dataMin - 1', 'dataMax + 1'];

// ── Default demo data ────────────────────────────────────────────────────────
// 24h of altitude-like telemetry (slow decay, a reboost burn mid-afternoon,
// settle). Non-zero floor on purpose — it demos the fitted domain.
const DEFAULT_DATA = [
  { t: '00:00', v: 421 }, { t: '01:00', v: 420 }, { t: '02:00', v: 420 },
  { t: '03:00', v: 419 }, { t: '04:00', v: 418 }, { t: '05:00', v: 418 },
  { t: '06:00', v: 417 }, { t: '07:00', v: 416 }, { t: '08:00', v: 416 },
  { t: '09:00', v: 415 }, { t: '10:00', v: 414 }, { t: '11:00', v: 414 },
  { t: '12:00', v: 415 }, { t: '13:00', v: 417 }, { t: '14:00', v: 420 },
  { t: '15:00', v: 423 }, { t: '16:00', v: 425 }, { t: '17:00', v: 426 },
  { t: '18:00', v: 427 }, { t: '19:00', v: 427 }, { t: '20:00', v: 426 },
  { t: '21:00', v: 426 }, { t: '22:00', v: 425 }, { t: '23:00', v: 425 },
];

const AXIS_TICK = {
  fontFamily: tokens.typography.fontMono,
  // recharts expects a number; derive it from the xs token ('10px') so the
  // chart axis follows the system scale.
  fontSize: parseInt(tokens.typography.size.xs, 10),
  letterSpacing: '0.05em',
};

// ── Tooltip ──────────────────────────────────────────────────────
// The TrendChart contract: compact, non-blocking, pinned out of the plot
// (position + allowEscapeViewBox live on the RechartsTooltip element below).
// Label row + value row; the unit rides muted after the value.
// recharts clones the returned element with the hover state, so every prop it
// injects is optional here.
type MetricTooltipProps = {
  active?: boolean;
  payload?: readonly { value?: number }[];
  label?: string | number;
  unit?: string;
};

function MetricTooltip({ active, payload, label, unit }: MetricTooltipProps) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div
      style={{
        background: `var(--andromeda-surface-overlay, ${tokens.color.surface.overlay})`,
        border: `${tokens.border.thin} var(--andromeda-border-bright, ${tokens.color.border.bright})`,
        padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
        fontFamily: tokens.typography.fontMono,
        maxWidth: '220px',
        // Compact + non-interactive: the readout must never swallow the plot
        // on small charts, and must not eat the pointer. The crosshair +
        // activeDot mark WHERE; this box only states the value.
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontSize: tokens.typography.size.xs,
          color: `var(--andromeda-text-muted, ${tokens.color.text.muted})`,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.widest,
          marginBottom: tokens.spacing[1],
        }}
      >
        {String(label)}
      </div>
      <div
        style={{
          fontSize: tokens.typography.size.md,
          color: `var(--andromeda-text-primary, ${tokens.color.text.primary})`,
          fontWeight: tokens.typography.weight.medium,
          letterSpacing: tokens.typography.tracking.wide,
        }}
      >
        {value?.toLocaleString?.('en-US') ?? value}
        {unit ? (
          <span
            style={{
              color: `var(--andromeda-text-muted, ${tokens.color.text.muted})`,
              fontSize: tokens.typography.size.xs,
              marginLeft: tokens.spacing[1],
            }}
          >
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * @typedef {object} MetricChartProps
 * @property {string} [label='/// Telemetry']   Card kicker label.
 * @property {string} [title='Metric']          Card title.
 * @property {string} [description]             Optional description line.
 * @property {object[]} [data]                  Points of { [xKey], [dataKey] }.
 * @property {string} [dataKey='v']
 * @property {string} [xKey='t']
 * @property {string} [unit]                    Shown muted after the tooltip value.
 * @property {'accent'|'warning'|'fault'} [variant='accent']  Badge only — chart ink stays neutral.
 * @property {string|null} [badgeText='Live']   null hides the badge.
 * @property {Array} [domain=['dataMin - 1', 'dataMax + 1']]  recharts y-domain (fitted).
 * @property {number} [xInterval=3]
 * @property {number|'fill'} [height=224]       Plot height; 'fill' grows into a flex parent.
 * @property {string} [className]
 * @property {React.CSSProperties} [style]
 */

type MetricChartOwnProps = {
  label?: string;
  title?: string;
  description?: string;
  data?: Array<Record<string, string | number>>;
  dataKey?: string;
  xKey?: string;
  unit?: string;
  variant?: MetricChartVariant;
  badgeText?: string | null;
  domain?: [AxisDomainItem, AxisDomainItem];
  xInterval?: number;
  height?: number | 'fill';
  className?: string;
  style?: CSSProperties;
};

type MetricChartProps = MetricChartOwnProps &
  Omit<ComponentPropsWithoutRef<'div'>, keyof MetricChartOwnProps>;

/** @type {React.ForwardRefExoticComponent<MetricChartProps & React.HTMLAttributes<HTMLDivElement>>} */
export const MetricChart = forwardRef<HTMLDivElement, MetricChartProps>(function MetricChart(
  {
    label = '/// Telemetry',
    title = 'Metric',
    description,
    data = DEFAULT_DATA,
    dataKey = 'v',
    xKey = 't',
    unit,
    variant = 'accent',
    badgeText = 'Live',
    domain = DEFAULT_DOMAIN,
    xInterval = 3,
    height = 224,
    className,
    style,
    ...props
  },
  outerRef,
) {
  // Unique gradient id — useId, NOT title-derived, so two panels with the
  // same title never collide. Sanitised because useId's delimiters (":"/"«»")
  // are not safe inside an SVG url(#…) reference.
  const gradientId = `andromeda-metric-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  // Stable chart id for the same reason, one level deeper: recharts derives its
  // internal clipPath id from a module-level counter when no `id` is passed, and
  // that counter cannot agree between the server render and hydration — every
  // SSR page carrying a chart reported a React mismatch.
  const chartId = `andromeda-metric-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  // Scroll-aware draw reveal. The line materialises left-to-right across
  // time the first time the panel enters the viewport — a measurement
  // arriving, not decoration. Gated on useInView so a panel below the fold
  // doesn't burn its reveal off-screen (same contract as TrendChart /
  // RadarChart). `margin: '-10% 0px'` triggers slightly before it's fully
  // on-screen.
  const internalRef = useRef<HTMLDivElement | null>(null);
  const setRefs = (node: HTMLDivElement | null) => {
    internalRef.current = node;
    if (typeof outerRef === 'function') outerRef(node);
    else if (outerRef) outerRef.current = node;
  };
  const inView = useInView(internalRef, { once: true, margin: '-10% 0px' });
  const reducedMotion = useReducedMotion();
  // Plot colors, resolved off the panel's own root (see CHART_VARS).
  const c = useResolvedColors(internalRef, CHART_VARS);

  // Wipe from hidden (inset right→left) to fully revealed once in view. Reduced
  // motion starts from the same hidden state, so server and client markup
  // match, then shows the chart fully drawn at once: no wipe, no wait for view.
  const revealProps = {
    initial: { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
    animate: reducedMotion || inView
      ? { clipPath: 'inset(0 0% 0 0)', opacity: 1 }
      : { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
    transition: reducedMotion
      ? { duration: 0 }
      : { duration: ms(tokens.motion.duration.cascade), ease: EASE_OUT },
  };

  // height={number} → fixed; height="fill" → grow to fill a flex parent panel.
  const fill = height === 'fill';
  const plotHeight = fill ? '100%' : height;

  const badgeVariant = BADGE_VARIANT[variant] ?? 'accent';

  return (
    <div
      ref={setRefs}
      className={cn('relative', className)}
      style={{
        ...andromedaVars(),
        background: `var(--andromeda-surface-raised, ${tokens.color.surface.raised})`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flex: fill ? 1 : undefined,
        ...style,
      }}
      {...props}
    >
      <CornerMarkers />

      {/* Header — kicker + title column on the left, status Badge on the right */}
      <div
        style={{
          position: 'relative',
          padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: tokens.spacing[3],
        }}
      >
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: tokens.spacing[3],
            right: tokens.spacing[3],
            bottom: 0,
            height: '1px',
            background: `var(--andromeda-border-subtle, ${tokens.color.border.subtle})`,
            pointerEvents: 'none',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
          <span
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              color: `var(--andromeda-text-muted, ${tokens.color.text.muted})`,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.widest,
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.md,
              fontWeight: tokens.typography.weight.medium,
              color: `var(--andromeda-text-primary, ${tokens.color.text.primary})`,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.wider,
            }}
          >
            {title}
          </span>
          {description ? (
            <span
              style={{
                fontFamily: tokens.typography.fontMono,
                fontSize: tokens.typography.size.xs,
                color: `var(--andromeda-text-faint, ${tokens.color.text.faint})`,
                textTransform: 'uppercase',
                letterSpacing: tokens.typography.tracking.wide,
                marginTop: '2px',
              }}
            >
              {description}
            </span>
          ) : null}
        </div>
        {badgeText ? <Badge variant={badgeVariant}>{badgeText}</Badge> : null}
      </div>

      {/* Plot */}
      <div
        role="img"
        aria-label={unit ? `${title} telemetry chart, measured in ${unit}` : `${title} telemetry chart`}
        style={{
          position: 'relative',
          padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
          flex: fill ? 1 : undefined,
          minHeight: fill ? 0 : undefined,
        }}
      >
        {/* Draw-reveal wrapper. width/height 100% so ResponsiveContainer
            still measures the chart correctly — the motion.div must not
            collapse the sizing box. The clipPath wipe + opacity is driven
            by `revealProps` above (hidden on first paint, then shown instantly when reduced motion). */}
        <motion.div style={{ width: '100%', height: plotHeight }} {...revealProps}>
          {/* initialDimension: recharts' size detector measures -1×-1 on its
              first render (before its ResizeObserver reports) and logs a
              "width(-1) and height(-1)" console warning — in production too.
              A positive initial size silences it; the real measure replaces
              it on mount, and the pre-measure frame is invisible anyway
              behind the clip reveal above. */}
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 480, height: 224 }}>
            <AreaChart id={chartId} data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.textPrimary} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={c.textPrimary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 4"
                stroke={c.borderSubtle}
                vertical={false}
              />
              <XAxis
                dataKey={xKey}
                tick={{ ...AXIS_TICK, fill: c.textMuted }}
                axisLine={{ stroke: c.borderSubtle }}
                tickLine={false}
                interval={xInterval}
              />
              <YAxis
                domain={domain}
                tick={{ ...AXIS_TICK, fill: c.textMuted }}
                axisLine={false}
                tickLine={false}
              />
              {/* Pinned out of the plot (charts.md must): the tooltip floats
                  at the plot top and slides horizontally, clamped INSIDE the
                  plot on x so a narrow column never clips it; the crosshair +
                  activeDot always mark the hover position on the curve. */}
              <RechartsTooltip
                content={<MetricTooltip unit={unit} />}
                cursor={{ stroke: c.borderBright, strokeWidth: 1, strokeDasharray: '2 4' }}
                position={{ y: 0 }}
                allowEscapeViewBox={{ x: false, y: true }}
                offset={12}
                wrapperStyle={{ zIndex: 40 }}
              />
              {/* isAnimationActive off — the framer draw reveal owns the
                  motion; recharts never tweens. Stroke is ALWAYS neutral. */}
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={c.textPrimary}
                strokeWidth={1.5}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 4, fill: c.textPrimary, stroke: c.surfaceRaised, strokeWidth: 1 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
});
