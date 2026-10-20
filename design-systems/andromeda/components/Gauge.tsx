'use client';

import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { animate, useInView } from 'framer-motion';
import { cn, andromedaVars } from './lib/utils';
import { useReducedMotion } from './lib/motion';
import { tokens } from '../tokens';

// Returns seconds: Framer Motion takes seconds, tokens store ms.
const ms = (v: string) => parseInt(v, 10) / 1000;
// Mirrors tokens.motion.easing.out; change both.
const EASE_OUT: [number, number, number, number] = [0, 0, 0.2, 1];

type GaugeSize = 'sm' | 'md' | 'lg';
type GaugeVariant = 'accent' | 'warning' | 'fault';

const DEFAULT_VALUE = 68;

const SIZES = {
  sm: { box: 80,  stroke: 5, valueSize: tokens.typography.size.lg,     unitSize: tokens.typography.size.xs, valueShift: -6,  labelShift: 10 },
  md: { box: 110, stroke: 7, valueSize: tokens.typography.size.xl,     unitSize: tokens.typography.size.sm, valueShift: -8,  labelShift: 12 },
  lg: { box: 144, stroke: 9, valueSize: tokens.typography.size['2xl'], unitSize: tokens.typography.size.md, valueShift: -10, labelShift: 14 },
};

const VARIANT_STROKE: Record<GaugeVariant, string> = {
  accent:  `var(--andromeda-accent-300, ${tokens.color.accent[300]})`,
  warning: `var(--andromeda-orange-300, ${tokens.color.orange[300]})`,
  fault:   `var(--andromeda-red-300, ${tokens.color.red[300]})`,
};

/**
 * @typedef {object} GaugeProps
 * @property {number} [value=68]   The reading. Clamped to 0..max. Defaults to
 *   a demo reading so the bare component renders meaningfully.
 * @property {number} [max=100]    Full scale — the arc shows value/max.
 * @property {'sm'|'md'|'lg'} [size='md']
 * @property {'accent'|'warning'|'fault'} [variant='accent'] Arc color by
 *   meaning: accent = live/healthy, warning = orange, fault = red.
 * @property {string} [unit='%']   Suffix after the readout, muted + smaller.
 *   Pass '' for a unitless reading.
 * @property {string} [label]      Optional code label below the value inside
 *   the circle (mono xs, muted, uppercase). Centered when showValue is false.
 * @property {boolean} [showValue=true]
 * @property {string} [ariaLabel]  Overrides the generated
 *   "<label or Gauge> <value> of <max><unit>" description.
 * @property {string} [className]
 * @property {React.CSSProperties} [style]
 */

type GaugeOwnProps = {
  value?: number;
  max?: number;
  size?: GaugeSize;
  variant?: GaugeVariant;
  unit?: string;
  label?: string;
  showValue?: boolean;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
};

type GaugeProps = GaugeOwnProps & Omit<ComponentPropsWithoutRef<'span'>, keyof GaugeOwnProps>;

export const Gauge = forwardRef<HTMLSpanElement, GaugeProps>(function Gauge(
  {
    value = DEFAULT_VALUE,
    max = 100,
    size = 'md',
    variant = 'accent',
    unit = '%',
    label,
    showValue = true,
    ariaLabel,
    className,
    style,
    ...props
  },
  outerRef,
) {
  const { box, stroke, valueSize, unitSize, valueShift, labelShift } = SIZES[size] ?? SIZES.md;
  const cx = box / 2;
  const r = cx - stroke;
  const circumference = 2 * Math.PI * r;

  const safeMax = max > 0 ? max : 100;
  const clamped = Math.max(0, Math.min(safeMax, value));
  const decimals = (String(clamped).split('.')[1] ?? '').length;
  const fmt = (v: number) => (decimals > 0 ? v.toFixed(decimals) : String(Math.round(v)));

  const internalRef = useRef<HTMLSpanElement | null>(null);
  const setRefs = (node: HTMLSpanElement | null) => {
    internalRef.current = node;
    if (typeof outerRef === 'function') outerRef(node);
    else if (outerRef) outerRef.current = node;
  };
  const inView = useInView(internalRef, { once: true, amount: 0.3 });
  const reducedMotion = useReducedMotion();

  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);
  const revealedRef = useRef(false);

  // Layout effect, not a lazy initial state: that would mismatch the server's 0.
  useLayoutEffect(() => {
    if (!reducedMotion) return;
    shownRef.current = clamped;
    setShown(clamped);
    revealedRef.current = true;
  }, [reducedMotion, clamped]);

  useEffect(() => {
    if (reducedMotion || !inView) return;
    const first = !revealedRef.current;
    revealedRef.current = true;
    const controls = animate(shownRef.current, clamped, {
      duration: ms(first ? tokens.motion.duration.cascade : tokens.motion.duration.fast),
      ease: EASE_OUT,
      onUpdate: (v) => {
        shownRef.current = v;
        setShown(v);
      },
    });
    return () => controls.stop();
  }, [inView, clamped, reducedMotion]);

  const filled = (shown / safeMax) * circumference;

  const valueY = label && showValue ? cx + valueShift : cx;
  const labelY = showValue ? cx + labelShift : cx;

  const resolvedAria =
    ariaLabel ?? `${label ?? 'Gauge'} ${fmt(clamped)} of ${safeMax}${unit}`;

  return (
    <span
      ref={setRefs}
      className={cn(className)}
      style={{
        ...andromedaVars(),
        display: 'inline-flex',
        flexShrink: 0,
        ...style,
      }}
      {...props}
    >
      <svg
        width={box}
        height={box}
        viewBox={`0 0 ${box} ${box}`}
        role="img"
        aria-label={resolvedAria}
      >
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          strokeWidth={stroke}
          style={{ stroke: `var(--andromeda-border-subtle, ${tokens.color.border.subtle})` }}
        />

        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="butt"
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ stroke: VARIANT_STROKE[variant] ?? VARIANT_STROKE.accent }}
        />

        {showValue ? (
          <text
            x={cx}
            y={valueY}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fill: `var(--andromeda-text-primary, ${tokens.color.text.primary})`,
              fontFamily: tokens.typography.fontMono,
              fontSize: valueSize,
              fontWeight: tokens.typography.weight.bold,
              letterSpacing: tokens.typography.tracking.tight,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {fmt(shown)}
            {unit ? (
              <tspan
                dx={2}
                style={{
                  fill: `var(--andromeda-text-muted, ${tokens.color.text.muted})`,
                  fontSize: unitSize,
                  fontWeight: tokens.typography.weight.medium,
                  letterSpacing: tokens.typography.tracking.normal,
                }}
              >
                {unit}
              </tspan>
            ) : null}
          </text>
        ) : null}

        {label ? (
          <text
            x={cx}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fill: `var(--andromeda-text-muted, ${tokens.color.text.muted})`,
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.widest,
            }}
          >
            {label}
          </text>
        ) : null}
      </svg>
    </span>
  );
});
