// ============================================================
// COMPONENT: Gauge
// Radial percentage gauge — a single measurement arc over a
// subtle track with a centered mono value readout. Per Andromeda's
// color philosophy the arc IS the measurement, so it takes color:
// accent (live/healthy), orange (warning), red (fault). No
// gradient ramp, no glow — the arc length carries the reading.
//
// BARE primitive: no frame, no corner markers, no header. It
// composes INTO Cards / panels the same way TrendChart does.
//
// Props:
//   value     — the measurement reading (demo default 68)
//   max       — full-scale value the arc normalizes against (100)
//   size      — 'sm' | 'md' | 'lg' SVG footprint (80/110/144)
//   variant   — 'accent' | 'warning' | 'fault' arc color
//   unit      — readout suffix, muted + smaller ('%')
//   label     — optional code label below the value (xs, muted)
//   showValue — hide the numeric readout when false
//   ariaLabel — override the generated aria-label
//   className / style passthrough
//
// Motion: the arc sweeps 0 → value and the readout counts up in
// sync on first view-entry (useInView once, amount 0.3) over
// duration.cascade; subsequent value updates retarget at
// duration.fast (state changes are instant or fast, never longer
// — the Andromeda motion tempo rule). Reduced motion renders the
// final reading instantly (layout effect, no 0-frame flash).
// ============================================================

'use client';

import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { animate, useInView } from 'framer-motion';
import { cn, andromedaVars } from './lib/utils';
import { useReducedMotion } from './lib/motion';
import { tokens } from '../tokens';

// Framer wants seconds + a cubic-bezier array; tokens store ms strings and
// CSS cubic-bezier() strings. Convert at the boundary, same pattern as
// StatTile / RadarChart / lib/motion.
const ms = (v: string) => parseInt(v, 10) / 1000;
// Token-driven equivalent of tokens.motion.easing.out
// ('cubic-bezier(0, 0, 0.2, 1)') — fast start, soft landing. Keep in sync.
const EASE_OUT: [number, number, number, number] = [0, 0, 0.2, 1];

type GaugeSize = 'sm' | 'md' | 'lg';
type GaugeVariant = 'accent' | 'warning' | 'fault';

// ── Default demo reading ─────────────────────────────────────────────────────
// Zero-props render shows a meaningful reading + sweep (the RadarChart
// DEFAULT_DATA contract). Real consumers always pass `value`.
const DEFAULT_VALUE = 68;

// ── Geometry per size ────────────────────────────────────────────────────────
// Raw px throughout this table is SVG geometry (sanctioned by the Andromeda
// spacing rules): box/stroke are renderer coordinates, valueShift/labelShift
// are optical text offsets inside the viewBox when a label shares the circle
// with the readout. Type steps with the footprint so the readout keeps its
// weight relative to the arc.
const SIZES = {
  sm: { box: 80,  stroke: 5, valueSize: tokens.typography.size.lg,     unitSize: tokens.typography.size.xs, valueShift: -6,  labelShift: 10 },
  md: { box: 110, stroke: 7, valueSize: tokens.typography.size.xl,     unitSize: tokens.typography.size.sm, valueShift: -8,  labelShift: 12 },
  lg: { box: 144, stroke: 9, valueSize: tokens.typography.size['2xl'], unitSize: tokens.typography.size.md, valueShift: -10, labelShift: 14 },
};

// ── Semantic arc color ───────────────────────────────────────────────────────
// The one color ledger: accent = live/healthy, orange = warning, red = fault.
// The track never takes color — it is context, not measurement.
const VARIANT_STROKE: Record<GaugeVariant, string> = {
  accent:  `var(--andromeda-accent-300, ${tokens.color.accent[300]})`,
  warning: `var(--andromeda-orange-300, ${tokens.color.orange[300]})`,
  fault:   `var(--andromeda-red-300, ${tokens.color.red[300]})`,
};

// ── Component ────────────────────────────────────────────────────────────────
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

/** @type {React.ForwardRefExoticComponent<GaugeProps & React.HTMLAttributes<HTMLSpanElement>>} */
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
  // Preserve the precision the consumer passed in — an integer reading
  // counts up in integers, a one-decimal reading keeps its decimal.
  const decimals = (String(clamped).split('.')[1] ?? '').length;
  const fmt = (v: number) => (decimals > 0 ? v.toFixed(decimals) : String(Math.round(v)));

  // Scroll-aware sweep-in. The arc sweeps 0 → value and the readout counts
  // up in sync the first time the gauge enters the viewport — the reading
  // arriving, not decoration. Gated on useInView so a Gauge below the fold
  // doesn't burn its reveal off-screen (same contract as StatTile /
  // ProgressBar / RadarChart).
  const internalRef = useRef<HTMLSpanElement | null>(null);
  const setRefs = (node: HTMLSpanElement | null) => {
    internalRef.current = node;
    if (typeof outerRef === 'function') outerRef(node);
    else if (outerRef) outerRef.current = node;
  };
  const inView = useInView(internalRef, { once: true, amount: 0.3 });
  const reducedMotion = useReducedMotion();

  // One animated number drives BOTH the arc and the readout, so they can
  // never drift out of sync. First reveal sweeps over duration.cascade;
  // later value updates are state changes and retarget from the current
  // position at duration.fast (the motion tempo rule: instant or fast,
  // never longer). Reduced motion: final state, instantly.
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);
  const revealedRef = useRef(false);

  // Reduced motion applies the final reading BEFORE paint — a layout effect
  // re-renders synchronously, so the user never sees the 0-frame. (A lazy
  // initializer would hydration-mismatch against the SSR 0; RadarChart's
  // `initial: false` is the declarative twin of this.)
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

  // Readout placement: value sits at center; with a label the pair splits
  // around the midline (value up, label below). showValue=false centers
  // the label alone.
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
        {/* Track — context, never colored. Stroke rides `style`, not the
            presentation attribute: an attribute takes the literal, the CSS
            property resolves the custom property. */}
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          strokeWidth={stroke}
          style={{ stroke: `var(--andromeda-border-subtle, ${tokens.color.border.subtle})` }}
        />

        {/* Measurement arc — starts at 12 o'clock, hard butt cap */}
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

        {/* Readout — mono bold value, muted smaller unit */}
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

        {/* Code label — below the value, inside the circle */}
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
