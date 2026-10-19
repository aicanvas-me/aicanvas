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

// Returns seconds: Framer Motion takes seconds, tokens store ms.
const ms = (v: string) => parseInt(v, 10) / 1000;
// Mirrors tokens.motion.easing.out; change both.
const EASE_OUT: [number, number, number, number] = [0, 0, 0.2, 1];

// recharts colours are SVG attributes and can't read var(), so they are resolved first.
const CHART_VARS = {
  textPrimary:   ['--andromeda-text-primary',   tokens.color.text.primary],
  textMuted:     ['--andromeda-text-muted',     tokens.color.text.muted],
  borderSubtle:  ['--andromeda-border-subtle',  tokens.color.border.subtle],
  borderBright:  ['--andromeda-border-bright',  tokens.color.border.bright],
  surfaceRaised: ['--andromeda-surface-raised', tokens.color.surface.raised],
} as const satisfies ColorSpec;

type MetricChartVariant = 'accent' | 'warning' | 'fault';

const BADGE_VARIANT: Record<MetricChartVariant, NonNullable<BadgeProps['variant']>> = {
  accent:  'accent',
  warning: 'warning',
  fault:   'fault',
};

const DEFAULT_DOMAIN: [AxisDomainItem, AxisDomainItem] = ['dataMin - 1', 'dataMax + 1'];

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
  fontSize: parseInt(tokens.typography.size.xs, 10),
  letterSpacing: '0.05em',
};

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
  // Strip ':' and '«»' that some React versions add; they can break url(#…).
  const gradientId = `andromeda-metric-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const chartId = `andromeda-metric-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const internalRef = useRef<HTMLDivElement | null>(null);
  const setRefs = (node: HTMLDivElement | null) => {
    internalRef.current = node;
    if (typeof outerRef === 'function') outerRef(node);
    else if (outerRef) outerRef.current = node;
  };
  const inView = useInView(internalRef, { once: true, margin: '-10% 0px' });
  const reducedMotion = useReducedMotion();
  const c = useResolvedColors(internalRef, CHART_VARS);

  // Same hidden start with reduced motion, so server and client HTML match.
  const revealProps = {
    initial: { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
    animate: reducedMotion || inView
      ? { clipPath: 'inset(0 0% 0 0)', opacity: 1 }
      : { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
    transition: reducedMotion
      ? { duration: 0 }
      : { duration: ms(tokens.motion.duration.cascade), ease: EASE_OUT },
  };

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
        {/* ResponsiveContainer needs this box to have a real width and height. */}
        <motion.div style={{ width: '100%', height: plotHeight }} {...revealProps}>
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
              <RechartsTooltip
                content={<MetricTooltip unit={unit} />}
                cursor={{ stroke: c.borderBright, strokeWidth: 1, strokeDasharray: '2 4' }}
                position={{ y: 0 }}
                allowEscapeViewBox={{ x: false, y: true }}
                offset={12}
                wrapperStyle={{ zIndex: 40 }}
              />
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
