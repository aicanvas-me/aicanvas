'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { useInView, AnimatePresence, motion } from 'framer-motion';
import { cn, andromedaVars } from './lib/utils';
import { useReducedMotion } from './lib/motion';
import { tokens } from '../tokens';
import { Card, CardContent } from './Card';

// Returns seconds: Framer Motion takes seconds, tokens store ms.
const ms = (v: string) => parseInt(v, 10) / 1000;
const COUNTUP_MS = parseInt(tokens.motion.duration.countup, 10);
// Mirrors tokens.motion.easing.sharp; change both.
const SHARP_EASE: [number, number, number, number] = [0.4, 0, 0.6, 1];

type DigitSlotProps = {
  char: string;
  reduced?: boolean | null;
};

function DigitSlot({ char, reduced }: DigitSlotProps) {
  if (reduced) {
    return <span style={{ display: 'inline-block' }}>{char}</span>;
  }
  // The hidden char keeps a real baseline; an overflow-hidden inline-block would drop the unit.
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        width: '1ch',
        textAlign: 'center',
        verticalAlign: 'baseline',
      }}
    >
      <span aria-hidden="true" style={{ visibility: 'hidden' }}>{char}</span>
      <span style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={char}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: ms(tokens.motion.duration.normal), ease: SHARP_EASE }}
            style={{ position: 'absolute', inset: 0, textAlign: 'center' }}
          >
            {char}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

type DigitRollerProps = {
  value: string | number;
  className?: string;
  reduced?: boolean | null;
};

function DigitRoller({ value, className, reduced }: DigitRollerProps) {
  const chars = String(value).split('');
  return (
    <span
      className={className}
      style={{
        fontVariantNumeric: 'tabular-nums',
        display: 'inline-flex',
        alignItems: 'baseline',
      }}
    >
      {chars.map((c, i) => (
        // Index key here, character key inside DigitSlot: only changed characters roll.
        <DigitSlot key={i} char={c} reduced={reduced} />
      ))}
    </span>
  );
}

function useStatTileStyles() {
  useEffect(() => {
    if (document.querySelector('#andromeda-stat-tile-style')) return;
    const style = document.createElement('style');
    style.id = 'andromeda-stat-tile-style';
    style.textContent = `
      @keyframes andromeda-value-in {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }, []);
}

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function useCountUp(rawValue: string | number, duration = COUNTUP_MS, live = false, inView = true) {
  const num = parseFloat(rawValue as string);
  const isNumeric = !isNaN(num);
  const decimals = isNumeric
    ? (String(rawValue).split('.')[1] ?? '').length
    : 0;

  const [display, setDisplay] = useState(isNumeric ? '0' : rawValue);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!isNumeric) { setDisplay(rawValue); return; }

    if (live && hasMountedRef.current) {
      setDisplay(decimals > 0 ? num.toFixed(decimals) : String(Math.round(num)));
      return;
    }

    if (!inView) return;

    const timeout = setTimeout(() => {
      startRef.current = null;

      function tick(now: number) {
        if (!startRef.current) startRef.current = now;
        const elapsed = now - startRef.current;
        const t = Math.min(elapsed / duration, 1);
        const current = num * easeOutExpo(t);
        setDisplay(decimals > 0 ? current.toFixed(decimals) : String(Math.round(current)));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
        else hasMountedRef.current = true;
      }

      rafRef.current = requestAnimationFrame(tick);
    }, 120);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawValue, inView]);

  return display;
}


const labelClass = cn(
  '[font-family:var(--andromeda-font-mono)]',
  'text-[length:var(--andromeda-text-xs)]',
  'font-[number:var(--andromeda-weight-medium)]',
  'uppercase [letter-spacing:var(--andromeda-tracking-wide)]',
  'text-[color:var(--andromeda-text-secondary)]',
);

const codeClass = cn(
  '[font-family:var(--andromeda-font-mono)]',
  'text-[length:var(--andromeda-text-xs)]',
  'uppercase [letter-spacing:var(--andromeda-tracking-wider)]',
  'text-[color:var(--andromeda-text-faint)]',
);

const valueClass = cn(
  '[font-family:var(--andromeda-font-sans)]',
  'text-[length:var(--andromeda-text-4xl)]',
  'font-[number:var(--andromeda-weight-thin)]',
  'text-[color:var(--andromeda-text-primary)]',
  '[line-height:var(--andromeda-leading-tight)]',
  '[letter-spacing:var(--andromeda-tracking-tight)]',
);

const unitClass = cn(
  '[font-family:var(--andromeda-font-mono)]',
  'text-[length:var(--andromeda-text-sm)]',
  'uppercase [letter-spacing:var(--andromeda-tracking-wider)]',
  'text-[color:var(--andromeda-text-muted)]',
);

const deltaLabelClass = cn(
  '[font-family:var(--andromeda-font-mono)]',
  'text-[length:var(--andromeda-text-xs)]',
  'uppercase [letter-spacing:var(--andromeda-tracking-wider)]',
  'text-[color:var(--andromeda-text-muted)]',
);

const deltaBaseClass = cn(
  '[font-family:var(--andromeda-font-mono)]',
  'text-[length:var(--andromeda-text-xs)]',
  'font-[number:var(--andromeda-weight-medium)]',
  '[letter-spacing:var(--andromeda-tracking-wide)]',
);

/**
 * @typedef {object} StatTileProps
 * @property {string} label Metric name shown in the top-left mono caption.
 * @property {string|number} value Primary figure rendered as the large number, counted up from zero on reveal.
 * @property {string} [unit] Short unit rendered beside the value.
 * @property {number} [delta] Signed change. The ▲/▼ glyph always states the
 *   direction of the move; `polarity` decides whether that move is coloured as
 *   good (accent) or bad (fault). Exactly 0 is neutral: no glyph, muted.
 * @property {'higher-is-better'|'lower-is-better'|'none'} [polarity='higher-is-better']
 *   Which direction is the good one for this metric. `'lower-is-better'` for
 *   response time, latency, error rate, incident count — a drop there is an
 *   improvement and must not render red. `'none'` for readings with no good/bad
 *   sense at all (demand, headcount, temperature): the arrow still states the
 *   move, the delta stays muted.
 * @property {string} [deltaLabel] Caption shown beside the delta in the trend row.
 * @property {string} [code] Optional small mono identifier in the top-right.
 * @property {boolean} [live=false] When true, the count-up animation runs only on
 *   first mount; subsequent value changes snap (no re-animation). Use for
 *   telemetry rows whose values update on a recurring interval. Without this,
 *   each refresh runs a fresh 1.8s count-up from zero, which is unreadable.
 * @property {boolean} [liveRoll=false] When true, the value is rendered as a row of
 *   fixed-width digit slots; on update, only the slots whose character changed
 *   "roll" (previous translates up + fades, new enters from below). Use for
 *   high-frequency telemetry where the eye should track which digits moved
 *   (price ticks, latency counters, throughput rates). Overrides `live`.
 *   Initial render fades in without rolling.
 * @property {string} [className] Extra classes merged onto the root Card.
 * @property {React.CSSProperties} [style] Inline styles merged onto the root Card.
 */

export type StatTileProps = ComponentPropsWithoutRef<'div'> & {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  polarity?: 'higher-is-better' | 'lower-is-better' | 'none';
  deltaLabel?: string;
  code?: string;
  live?: boolean;
  liveRoll?: boolean;
};

export const StatTile = forwardRef<HTMLDivElement, StatTileProps>(function StatTile(
  { className, label, value, unit, delta, polarity = 'higher-is-better', deltaLabel, code, live = false, liveRoll = false, style, ...props },
  outerRef,
) {
  useStatTileStyles();

  const internalRef = useRef<HTMLDivElement | null>(null);
  const setRefs = (node: HTMLDivElement | null) => {
    internalRef.current = node;
    if (typeof outerRef === 'function') outerRef(node);
    else if (outerRef) outerRef.current = node;
  };
  const inView = useInView(internalRef, { once: true, amount: 0.3 });
  const reducedMotion = useReducedMotion();

  const countUpDisplay = useCountUp(value, COUNTUP_MS, live, inView);
  const displayValue = liveRoll ? String(value) : countUpDisplay;
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta);
  const isFlat = hasDelta && delta === 0;
  const isPositive = hasDelta && delta > 0;
  const isGood = polarity === 'lower-is-better' ? !isPositive : isPositive;
  const trendColorClass = !hasDelta || isFlat || polarity === 'none'
    ? 'text-[color:var(--andromeda-text-muted)]'
    : isGood
      ? 'text-[color:var(--andromeda-accent-300)]'
      : 'text-[color:var(--andromeda-red-300)]';

  return (
    <Card
      ref={setRefs}
      className={cn('flex-1 min-w-0 overflow-hidden', className)}
      style={{ ...andromedaVars(), ...style }}
      {...props}
    >
      <CardContent className="flex flex-col gap-[var(--andromeda-3)]">
        <div className="flex items-baseline justify-between">
          <span className={labelClass}>{label}</span>
          {code ? <span className={codeClass}>{code}</span> : null}
        </div>

        <div
          className="flex items-baseline gap-[var(--andromeda-2)]"
          style={{ animation: 'andromeda-value-in 0.4s ease-out both', animationDelay: 'var(--andromeda-duration-fast, 80ms)' }}
        >
          {liveRoll
            ? <DigitRoller value={displayValue} className={valueClass} reduced={reducedMotion} />
            : <span className={valueClass}>{displayValue}</span>}
          {unit ? <span className={unitClass}>{unit}</span> : null}
        </div>

        {(hasDelta || deltaLabel) ? (
          <div
            className={cn(
              'flex items-center gap-[var(--andromeda-2)]',
              'pt-[var(--andromeda-2)]',
              'border-t-[length:var(--andromeda-border-width,1px)] border-solid border-[color:var(--andromeda-border-subtle)]',
            )}
          >
            {hasDelta ? (
              <span
                className={cn(deltaBaseClass, trendColorClass)}
                aria-label={isFlat ? 'no change' : `${isPositive ? 'up' : 'down'} ${Math.abs(delta)}`}
              >
                {isFlat ? Math.abs(delta) : `${isPositive ? '▲' : '▼'} ${Math.abs(delta)}`}
              </span>
            ) : null}
            {deltaLabel ? <span className={deltaLabelClass}>{deltaLabel}</span> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
});
