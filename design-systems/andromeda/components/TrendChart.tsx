// ============================================================
// COMPONENT: TrendChart
// The canonical multi-series time-series chart. One configurable
// component that renders as line, area (filled line), or bar, with
// a built-in mode toggle, custom tooltip, and a toggleable legend.
//
// Series colour follows the the Andromeda charts rules hierarchy via a
// `role`: baseline (white) · live (accent) · context (faint) ·
// threshold (red dashed). Pass an explicit `color` only when a
// series genuinely needs one outside that vocabulary.
//
// Renders the chart content (header + plot + legend) WITHOUT the
// panel frame — wrap it in a Card or a CornerMarkers surface, the
// same way RadarChart is composed. The draw is gated on `useInView`
// (a left-to-right reveal when scrolled to) and honours
// prefers-reduced-motion.
// ============================================================

'use client';

import { forwardRef, useId, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
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

const sec = (v: string) => parseInt(v, 10) / 1000; // "500ms" → 0.5
// framer boundary: derived from tokens, cannot follow runtime var overrides
const EASE_OUT = easingArray(tokens.motion.easing.out); // = [0, 0, 0.2, 1]

type TrendRole = 'baseline' | 'live' | 'context' | 'threshold';
type TrendMode = 'line' | 'area' | 'bar';

type TrendSeries = {
  key: string;
  label: string;
  role?: TrendRole;
  color?: string;
};

// Every color recharts needs, as [custom property, dark literal]. recharts
// hands its color props to SVG presentation ATTRIBUTES, which never substitute
// a var(), so these are read back resolved from the DOM instead (./lib/theme).
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

// Multi-series colour hierarchy (the Andromeda charts rules), in the two forms
// the chart needs: the CSS one for the HTML sinks (legend chip, tooltip
// swatch), and a key into the resolved map above for the plot itself.
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

// Inset divider (12px from each edge) separating header / footer from the plot.
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

// ── Tooltip ──────────────────────────────────────────────────────
// recharts clones the returned element with the hover state, so every prop it
// injects is optional here.
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
          // Compact + non-interactive: the readout must never swallow the plot
          // on small charts, and must not eat the pointer. Position is pinned to
          // the top of the plot below (so the line + crosshair stay visible) and
          // clamped INSIDE the plot horizontally (allowEscapeViewBox x:false
          // flips it to the cursor's left near the right edge) — on a phone-wide
          // plot an escaping tooltip gets clipped by the panel.
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

// ── Legend chip ──────────────────────────────────────────────────
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

// Identity constants: tick letterSpacing (0.05em, off the tracking scale)
// and the numeric fontSize/swatch sizes stay literal for pixel identity.
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

/** @type {React.ForwardRefExoticComponent<TrendChartProps & React.HTMLAttributes<HTMLDivElement>>} */
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
  // Stable chart id. Without one, recharts derives its internal clipPath id
  // from a module-level counter (`uniqueId('recharts')`), which cannot agree
  // between the server render and hydration — React then reports a mismatch on
  // every SSR page carrying a chart. useId is SSR-safe; sanitised because its
  // delimiters (":" / "«»") are not valid inside an SVG id.
  const chartId = `andromeda-trend-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const innerRef = useRef<HTMLDivElement | null>(null);
  // Plot colors, resolved off the chart's own root (see CHART_VARS).
  const c = useResolvedColors(innerRef, CHART_VARS);
  const reducedMotion = useReducedMotion();
  const inView = useInView(innerRef, { once: true, margin: '-10% 0px' });

  const setRefs = (node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  // Left-to-right "draw" reveal — the line materialises across time.
  const revealProps = reducedMotion
    ? { initial: false, animate: { clipPath: 'inset(0 0% 0 0)', opacity: 1 } }
    : {
        initial: { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        animate: inView
          ? { clipPath: 'inset(0 0% 0 0)', opacity: 1 }
          : { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        transition: { duration: sec(tokens.motion.duration.cascade), ease: EASE_OUT },
      };

  // height={number} → fixed; height="fill" → grow to fill a flex parent panel.
  const fill = height === 'fill';
  const plotHeight = fill ? '100%' : height;

  const ChartTooltip = buildTooltip(series, tooltipLabelFormatter, valueFormatter);
  const shown = series.filter((s) => visible[s.key]);
  // RAW: recharts margin sink — numeric px, var() cannot resolve; sourced from spacing tokens (left:0 off-scale)
  const chartMargin = { top: parseInt(tokens.spacing[8], 10), right: parseInt(tokens.spacing[2], 10), left: 0, bottom: parseInt(tokens.spacing[3], 10) };

  // RESOLVED: recharts attribute sink, var() cannot resolve, so `c` carries the
  // value the theme currently computes to.
  const grid = <CartesianGrid strokeDasharray={tokens.chart.dash} stroke={c.borderSubtle} vertical={false} />;
  const xAxis = (
    <XAxis dataKey={xKey} tick={{ ...AXIS_TICK, fill: c.textMuted }} axisLine={{ stroke: c.borderSubtle }} tickLine={false} interval={xInterval} />
  );
  // YAxis reserves a left tick gutter. On compact cards (showYAxis=false) the
  // gutter is dropped so the plot fills its card edge-to-edge with no stray
  // left inset (the Andromeda spacing rules). width=0 keeps
  // the scale (so bars/areas still compute) while reserving no horizontal band.
  // Y tick labels are LEFT-aligned flush with the yLabel kicker at the plot's
  // top-left, not right-aligned inside a reserved gutter, so the numbers share
  // the same left edge as the unit caption above them (no stray left inset).
  const yTick = ({ x, y, payload }: YAxisTickContentProps) => (
    <text
      x={parseInt(tokens.spacing[1], 10)}
      y={y}
      dy="0.32em"
      textAnchor="start"
      fontFamily={tokens.typography.fontMono}
      fontSize={parseInt(tokens.typography.size.xs, 10)}
      // The fill is a STYLE, not an attribute: this text is ours, so the CSS
      // property resolves the var() an attribute would have printed literally.
      style={{ fill: themeColor.text.muted }}
      letterSpacing="0.05em"
    >
      {payload.value}
    </text>
  );
  // Bars always keep their zero floor: a bar's length IS its value, so a
  // truncated baseline exaggerates every difference on the plot. Only the upper
  // bound of a caller-supplied domain survives the mode switch — which also
  // means a card can pass a fitted domain for its area mode without silently
  // producing a lying bar chart when the user flips the toggle.
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
          // RESOLVED: recharts attribute sink, var() cannot resolve
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
            // RAW: recharts attribute sink — var() cannot resolve; revarnish maps the literal
            strokeWidth={tokens.chart.lineWidth}
            // RAW: recharts attribute sink — '4 4' threshold dash stays literal, var() cannot resolve
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
      {/* Header — title + mode toggle */}
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
              // The control only ever reports back one of `modes`, its own options.
              onChange={setMode as (next: string) => void}
              options={modes.map((m) => ({ value: m, icon: MODE_ICON[m], ariaLabel: MODE_LABEL[m] }))}
            />
          ) : null}
        </div>
      ) : null}

      {/* Plot */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        {/* No z-index here: the plot wrapper below is a stacking context (its
            clip-path reveal), so a raised label would paint OVER the tooltip
            pinned to the plot top — the label text bleeding through the
            readout. The label stays visible anyway (the chart's top margin
            keeps the SVG transparent up here), and the tooltip now covers it
            cleanly while hovering. */}
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
          {/* initialDimension: recharts' size detector measures -1×-1 on its
              first render (before its ResizeObserver reports) and logs a
              "width(-1) and height(-1)" console warning — in production too.
              A positive initial size silences it; the real measure replaces
              it on mount, and the pre-measure frame is invisible anyway
              behind the clip reveal above. */}
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 480, height: 240 }}>
            {chart}
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Footer — legend + optional slot */}
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
