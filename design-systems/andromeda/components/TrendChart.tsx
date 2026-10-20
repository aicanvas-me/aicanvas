'use client';

import { forwardRef, useId, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';
import type { AxisDomainItem, YAxisTickContentProps } from 'recharts';
import { motion, useInView } from 'framer-motion';
import { ChartLine, ChartBar } from '@phosphor-icons/react';
import { tokens } from '../tokens';
import { andromedaVars, easingArray, themeColor } from './lib/utils';
import { useResolvedColors } from './lib/theme';
import type { ColorSpec } from './lib/theme';
import { useReducedMotion } from './lib/motion';
import { SegmentedControl } from './SegmentedControl';

// Returns seconds: Framer Motion takes seconds, tokens store ms.
const sec = (v: string) => parseInt(v, 10) / 1000;
const EASE_OUT = easingArray(tokens.motion.easing.out);

type TrendRole = 'baseline' | 'live' | 'context' | 'threshold';
type TrendMode = 'line' | 'area' | 'bar';

type TrendSeries = {
  key: string;
  label: string;
  role?: TrendRole;
  color?: string;
};

// Plot colours must come from c.*: raw token values stay dark-theme on light pages.
const CHART_VARS = {
  textPrimary:   ['--andromeda-text-primary',   tokens.color.text.primary],
  textMuted:     ['--andromeda-text-muted',     tokens.color.text.muted],
  textFaint:     ['--andromeda-text-faint',     tokens.color.text.faint],
  borderSubtle:  ['--andromeda-border-subtle',  tokens.color.border.subtle],
  borderBright:  ['--andromeda-border-bright',  tokens.color.border.bright],
  surfaceHover:  ['--andromeda-surface-hover',  tokens.color.surface.hover],
  surfaceRaised: ['--andromeda-surface-raised', tokens.color.surface.raised],
  accent300:     ['--andromeda-accent-300',     tokens.color.accent[300]],
  red300:        ['--andromeda-red-300',        tokens.color.red[300]],
} as const satisfies ColorSpec;

type ChartColors = Record<keyof typeof CHART_VARS, string>;

const ROLE_CSS: Record<TrendRole, string> = {
  baseline:  themeColor.text.primary,
  live:      themeColor.accent[300],
  context:   themeColor.text.faint,
  threshold: themeColor.red[300],
};
const ROLE_KEY: Record<TrendRole, keyof ChartColors> = {
  baseline:  'textPrimary',
  live:      'accent300',
  context:   'textFaint',
  threshold: 'red300',
};
const MODE_ICON  = { line: ChartLine, area: ChartLine, bar: ChartBar };
const MODE_LABEL = { line: 'Line chart', area: 'Area chart', bar: 'Bar chart' };

const cssColorOf = (s: TrendSeries) => s.color ?? ROLE_CSS[s.role as TrendRole] ?? themeColor.text.primary;
const colorOf = (s: TrendSeries, c: ChartColors) => s.color ?? c[ROLE_KEY[s.role as TrendRole] ?? 'textPrimary'];
const isThreshold = (s: TrendSeries) => s.role === 'threshold';

function InsetDivider({ side }: { side: 'top' | 'bottom' }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: tokens.spacing[3],
        right: tokens.spacing[3],
        [side]: 0,
        height: 'var(--andromeda-border-width, 1px)',
        background: themeColor.border.subtle,
        pointerEvents: 'none',
      }}
    />
  );
}

type TrendTooltipEntry = {
  dataKey?: string;
  value?: number;
};

type TrendTooltipProps = {
  active?: boolean;
  payload?: readonly TrendTooltipEntry[];
  label?: string | number;
};

type TrendLabelFormatter = (label: string | number | undefined) => string;
type TrendValueFormatter = (value: number | undefined) => string;

function buildTooltip(
  series: TrendSeries[],
  labelFormatter?: TrendLabelFormatter,
  valueFormatter?: TrendValueFormatter,
) {
  return function ChartTooltip({ active, payload, label }: TrendTooltipProps) {
    if (!active || !payload?.length) return null;
    const ordered = series
      .map((s) => ({ s, p: payload.find((p) => p.dataKey === s.key) }))
      .filter((row) => row.p) as Array<{ s: TrendSeries; p: TrendTooltipEntry }>;
    return (
      <div
        style={{
          background: themeColor.surface.overlay,
          border: `${tokens.border.thin} ${themeColor.border.bright}`,
          padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
          fontFamily: tokens.typography.fontMono,
          maxWidth: '220px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontSize: tokens.typography.size.xs,
            color: themeColor.text.muted,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.widest,
            marginBottom: tokens.spacing[2],
          }}
        >
          {labelFormatter ? labelFormatter(label) : String(label)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
          {ordered.map(({ s, p }) => (
            <div
              key={s.key}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: tokens.spacing[4] }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  fontSize: tokens.typography.size.sm,
                  color: themeColor.text.muted,
                  letterSpacing: tokens.typography.tracking.wide,
                }}
              >
                <span aria-hidden style={{ width: '6px', height: '6px', background: cssColorOf(s), flexShrink: 0 }} />
                {s.label}
              </span>
              <span
                style={{
                  fontSize: tokens.typography.size.sm,
                  color: themeColor.text.primary,
                  fontWeight: tokens.typography.weight.medium,
                  letterSpacing: tokens.typography.tracking.wide,
                }}
              >
                {valueFormatter ? valueFormatter(p.value) : p.value?.toLocaleString?.('en-US') ?? p.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };
}

function LegendChip({ color, label, active, onClick }: {
  color: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacing[2],
        padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        opacity: active ? 1 : 0.4,
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.typography.size.sm,
        color: themeColor.text.secondary,
        letterSpacing: tokens.typography.tracking.wide,
      }}
    >
      <span aria-hidden style={{ width: '10px', height: '10px', background: color, flexShrink: 0 }} />
      {label}
    </button>
  );
}

const AXIS_TICK = {
  fontFamily: tokens.typography.fontMono,
  fontSize: parseInt(tokens.typography.size.xs, 10),
  letterSpacing: '0.05em',
};

/**
 * @typedef {object} TrendSeries
 * @property {string} key   Field in each data row holding this series' y-value.
 * @property {string} label   Display name shown in the tooltip and legend chip.
 * @property {'baseline'|'live'|'context'|'threshold'} [role]   Colour role in the Andromeda charts hierarchy; threshold also renders dashed.
 * @property {string} [color]   Explicit override; prefer `role`.
 */

/**
 * @typedef {object} TrendChartProps
 * @property {object[]} data   Rows of chart data, one object per x-axis point.
 * @property {TrendSeries[]} series   Series to plot, each bound to a data-row field by key.
 * @property {string} [xKey='t']   Field in each data row plotted along the x-axis.
 * @property {Array<'line'|'area'|'bar'>} [modes=['area','bar']]  Toggle appears when >1.
 * @property {'line'|'area'|'bar'} [defaultMode]   Render mode selected on mount; defaults to the first entry in modes.
 * @property {string} [title]   Heading shown at the top-left of the header.
 * @property {string} [yLabel]            Uppercase mono axis caption, top-left.
 * @property {(label:any)=>string} [tooltipLabelFormatter]   Formats the x value shown as the tooltip heading.
 * @property {(value:any)=>string} [valueFormatter]   Formats each series value shown in the tooltip.
 * @property {number} [xInterval=4]   Number of x-axis ticks skipped between rendered labels.
 * @property {boolean} [showLegend=true]   Render the toggleable legend row in the footer.
 * @property {boolean} [showYAxis=true]   Reserve the left Y-axis tick gutter.
 *   Set false on compact cards where an external headline already states the
 *   magnitude, and the plot then fills its card content box edge-to-edge with no
 *   stray left inset (the Andromeda spacing rules).
 * @property {[number|string, number|string]} [domain=[0,'auto']]   Y-axis domain,
 *   passed through to recharts. The default zero baseline is the honest one for
 *   most series. Pass `['auto','auto']` (or explicit bounds) when the measurement
 *   has a floor far from zero — a satisfaction score that only moves between 3.8
 *   and 4.3 is a flat sliver on a 0-based axis. In `bar` mode the zero floor is
 *   kept whatever is passed: only the upper bound is honoured, because a bar
 *   read against a truncated baseline misstates every difference it draws.
 * @property {React.ReactNode} [footerSlot]   Right side of the footer (custom controls).
 * @property {number|'fill'} [height=240]   Plot height in px, or 'fill' to grow into a flex parent.
 * @property {string} [className]   Class applied to the root container element.
 * @property {React.CSSProperties} [style]   Inline styles merged onto the root container element.
 */

type TrendChartProps = ComponentPropsWithoutRef<'div'> & {
  data: Array<Record<string, string | number>>;
  series: TrendSeries[];
  xKey?: string;
  modes?: TrendMode[];
  defaultMode?: TrendMode;
  title?: string;
  yLabel?: string;
  tooltipLabelFormatter?: TrendLabelFormatter;
  valueFormatter?: TrendValueFormatter;
  xInterval?: number;
  showLegend?: boolean;
  showYAxis?: boolean;
  domain?: [AxisDomainItem, AxisDomainItem];
  footerSlot?: ReactNode;
  height?: number | 'fill';
};

export const TrendChart = forwardRef<HTMLDivElement, TrendChartProps>(function TrendChart(
  {
    data,
    series,
    xKey = 't',
    modes = ['area', 'bar'],
    defaultMode,
    title,
    yLabel,
    tooltipLabelFormatter,
    valueFormatter,
    xInterval = 4,
    showLegend = true,
    showYAxis = true,
    domain = [0, 'auto'],
    footerSlot,
    height = 240,
    className,
    style,
    ...props
  },
  ref,
) {
  const [mode, setMode] = useState(defaultMode ?? modes[0]);
  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(series.map((s) => [s.key, true] as const)),
  );
  const chartId = `andromeda-trend-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const innerRef = useRef<HTMLDivElement | null>(null);
  const c = useResolvedColors(innerRef, CHART_VARS);
  const reducedMotion = useReducedMotion();
  const inView = useInView(innerRef, { once: true, margin: '-10% 0px' });

  const setRefs = (node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const revealProps = reducedMotion
    ? { initial: false, animate: { clipPath: 'inset(0 0% 0 0)', opacity: 1 } }
    : {
        initial: { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        animate: inView
          ? { clipPath: 'inset(0 0% 0 0)', opacity: 1 }
          : { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        transition: { duration: sec(tokens.motion.duration.cascade), ease: EASE_OUT },
      };

  const fill = height === 'fill';
  const plotHeight = fill ? '100%' : height;

  const ChartTooltip = buildTooltip(series, tooltipLabelFormatter, valueFormatter);
  const shown = series.filter((s) => visible[s.key]);
  const chartMargin = { top: parseInt(tokens.spacing[8], 10), right: parseInt(tokens.spacing[2], 10), left: 0, bottom: parseInt(tokens.spacing[3], 10) };

  const grid = <CartesianGrid strokeDasharray={tokens.chart.dash} stroke={c.borderSubtle} vertical={false} />;
  const xAxis = (
    <XAxis dataKey={xKey} tick={{ ...AXIS_TICK, fill: c.textMuted }} axisLine={{ stroke: c.borderSubtle }} tickLine={false} interval={xInterval} />
  );
  const yTick = ({ y, payload }: YAxisTickContentProps) => (
    <text
      x={parseInt(tokens.spacing[1], 10)}
      y={y}
      dy="0.32em"
      textAnchor="start"
      fontFamily={tokens.typography.fontMono}
      fontSize={parseInt(tokens.typography.size.xs, 10)}
      style={{ fill: themeColor.text.muted }}
      letterSpacing="0.05em"
    >
      {payload.value}
    </text>
  );
  const yDomain: [AxisDomainItem, AxisDomainItem] = mode === 'bar' ? [0, Array.isArray(domain) ? domain[1] : 'auto'] : domain;
  const yAxis = (
    <YAxis domain={yDomain} tick={yTick} axisLine={false} tickLine={false} width={showYAxis ? 34 : 0} hide={!showYAxis} />
  );

  let chart: ReactElement;
  if (mode === 'bar') {
    chart = (
      <BarChart id={chartId} data={data} margin={chartMargin}>
        {grid}{xAxis}{yAxis}
        <RechartsTooltip
          content={<ChartTooltip />}
          cursor={{ fill: c.surfaceHover }}
          position={{ y: 0 }}
          allowEscapeViewBox={{ x: false, y: true }}
          offset={12}
          wrapperStyle={{ zIndex: 40 }}
        />
        {shown.map((s) => (
          <Bar key={s.key} dataKey={s.key} fill={colorOf(s, c)} isAnimationActive={false} />
        ))}
      </BarChart>
    );
  } else {
    const Filled = mode === 'area';
    chart = (
      <AreaChart id={chartId} data={data} margin={chartMargin}>
        <defs>
          {shown.map((s) => (
            <linearGradient key={s.key} id={`tc-fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorOf(s, c)} style={{ stopOpacity: Filled ? 'var(--andromeda-chart-fill-opacity, 0.12)' : 0 }} />
              <stop offset="100%" stopColor={colorOf(s, c)} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {grid}{xAxis}{yAxis}
        <RechartsTooltip
          content={<ChartTooltip />}
          cursor={{ stroke: c.borderBright, strokeWidth: 1, strokeDasharray: tokens.chart.dash }}
          position={{ y: 0 }}
          allowEscapeViewBox={{ x: false, y: true }}
          offset={12}
          wrapperStyle={{ zIndex: 40 }}
        />
        {shown.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={colorOf(s, c)}
            strokeWidth={tokens.chart.lineWidth}
            strokeDasharray={isThreshold(s) ? '4 4' : undefined}
            fill={`url(#tc-fill-${s.key})`}
            dot={false}
            activeDot={{ r: 4, fill: colorOf(s, c), stroke: c.surfaceRaised, strokeWidth: 1 }}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    );
  }

  return (
    <div
      ref={setRefs}
      className={className}
      style={{ ...andromedaVars(), display: 'flex', flexDirection: 'column', minHeight: 0, flex: fill ? 1 : undefined, ...style }}
      {...props}
    >
      {(title || modes.length > 1) ? (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: tokens.spacing[3], paddingBottom: tokens.spacing[4] }}>
          <InsetDivider side="bottom" />
          {title ? (
            <span
              style={{
                fontFamily: tokens.typography.fontSans,
                fontSize: tokens.typography.size.xl,
                fontWeight: tokens.typography.weight.semibold,
                color: themeColor.text.primary,
                letterSpacing: tokens.typography.tracking.tight,
              }}
            >
              {title}
            </span>
          ) : null}
          <div style={{ flex: 1 }} />
          {modes.length > 1 ? (
            <SegmentedControl
              size="md"
              value={mode}
              onChange={setMode as (next: string) => void}
              options={modes.map((m) => ({ value: m, icon: MODE_ICON[m], ariaLabel: MODE_LABEL[m] }))}
            />
          ) : null}
        </div>
      ) : null}

      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        {/* No z-index: the reveal wrapper below is a stacking context, so a raised label covers the tooltip. */}
        {yLabel ? (
          <span
            style={{
              position: 'absolute',
              top: tokens.spacing[2],
              left: tokens.spacing[1],
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              color: themeColor.text.muted,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.widest,
            }}
          >
            {yLabel}
          </span>
        ) : null}
        <motion.div style={{ width: '100%', height: plotHeight }} {...revealProps}>
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 480, height: 240 }}>
            {chart}
          </ResponsiveContainer>
        </motion.div>
      </div>

      {(showLegend || footerSlot) ? (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: tokens.spacing[3], paddingTop: tokens.spacing[4] }}>
          <InsetDivider side="top" />
          {showLegend
            ? series.map((s) => (
                <LegendChip
                  key={s.key}
                  color={cssColorOf(s)}
                  label={s.label}
                  active={visible[s.key]}
                  onClick={() => setVisible((v) => ({ ...v, [s.key]: !v[s.key] }))}
                />
              ))
            : null}
          <div style={{ flex: 1 }} />
          {footerSlot}
        </div>
      ) : null}
    </div>
  );
});
