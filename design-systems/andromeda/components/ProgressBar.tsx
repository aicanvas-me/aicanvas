// @ts-nocheck — design-systems/ is not type-checked (see design-systems/CLAUDE.md). Strip this after a proper typing pass.
// ============================================================
// COMPONENT: ProgressBar
// shadcn/ui-aligned API: variant, forwardRef, ARIA progressbar.
// Variants: default | warning | fault
// Visual: a row of bars, each bar = a single square. All bars
// are the same height.
// ============================================================

'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { cn, andromedaVars } from './lib/utils';
import { tokens } from '../tokens';

const BARS       = 30;  // number of columns
const SQUARES    = 1;   // squares per column
const SQUARE_W   = 6;   // width in px
const SQUARE_H   = parseInt(tokens.spacing[4]);  // height in px (spacing[4] = 16px)
const GAP_INNER  = 2;   // identity constant
const GAP_COL    = 3;   // gap between columns

const variantConfig = {
  default: {
    activeColor:  'var(--andromeda-accent-400)',
    activeBorder: 'var(--andromeda-accent-400)',
  },
  warning: {
    activeColor:  'var(--andromeda-orange-400)',
    activeBorder: 'var(--andromeda-orange-400)',
  },
  fault: {
    activeColor:  'var(--andromeda-red-400)',
    activeBorder: 'var(--andromeda-red-400)',
  },
};

const labelClass = cn(
  '[font-family:var(--andromeda-font-mono)]',
  'text-[length:var(--andromeda-text-xs)]',
  'uppercase [letter-spacing:var(--andromeda-tracking-wider)]',
  'text-[color:var(--andromeda-text-secondary)]',
);

const valueClass = cn(
  '[font-family:var(--andromeda-font-mono)]',
  'text-[length:var(--andromeda-text-xs)]',
  'font-[number:var(--andromeda-weight-medium)]',
  'uppercase [letter-spacing:var(--andromeda-tracking-wider)]',
  'text-[color:var(--andromeda-text-primary)]',
);

/**
 * @typedef {object} ProgressBarProps
 * @property {string} [label] Caption shown above the bar and used as the accessible label.
 * @property {number} value 0–100; clamped internally.
 * @property {'default'|'warning'|'fault'} [variant='default'] Color of the filled segments.
 * @property {string} [className] Extra classes merged onto the root element.
 * @property {React.CSSProperties} [style] Inline styles merged onto the root element.
 */

/** @type {React.ForwardRefExoticComponent<ProgressBarProps & React.HTMLAttributes<HTMLDivElement>>} */
export const ProgressBar = forwardRef(function ProgressBar(
  { className, label, value, variant = 'default', style, ...props },
  outerRef,
) {
  const clamped     = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  // Any positive value lights at least one segment — a 1% reading should
  // never render an empty bar.
  const activeCount = clamped > 0 ? Math.max(1, Math.round((clamped / 100) * BARS)) : 0;
  const cfg         = variantConfig[variant] ?? variantConfig.default;

  // Scroll-aware fill: render with zero-active first, then on first
  // viewport intersection switch to `activeCount` so the per-bar
  // transition-delay below lights them up left→right at the moment
  // the user actually sees the bar. ProgressBars below the fold no
  // longer animate invisibly.
  //
  // `once: true` — animate only the first time. Re-entering the
  // viewport (scroll up, scroll down again) doesn't re-trigger.
  // `amount: 0.3` — wait until 30% of the bar is visible. Higher
  // than the cascade's 0.15 because the bar's reveal is its own
  // motion event; we want the user clearly looking at it.
  const internalRef = useRef(null);
  const setRefs = (node) => {
    internalRef.current = node;
    if (typeof outerRef === 'function') outerRef(node);
    else if (outerRef) outerRef.current = node;
  };
  const inView = useInView(internalRef, { once: true, amount: 0.3 });
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = requestAnimationFrame(() => setDisplayed(activeCount));
    return () => cancelAnimationFrame(id);
  }, [inView, activeCount]);

  return (
    <div
      ref={setRefs}
      className={cn('flex flex-col gap-[var(--andromeda-2)]', className)}
      style={{ ...andromedaVars(), ...style }}
      {...props}
    >
      {label ? (
        <div className="flex items-baseline justify-between">
          <span className={labelClass}>{label}</span>
          <span className={valueClass}>{clamped}%</span>
        </div>
      ) : null}

      {/* Grid: BARS columns × SQUARES rows */}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={typeof label === 'string' ? label : 'progress'}
        style={{
          display: 'flex',
          gap: `${GAP_COL}px`,
        }}
      >
        {Array.from({ length: BARS }, (_, barIndex) => {
          const active = barIndex < displayed;

          return (
            <div
              key={barIndex}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: `${GAP_INNER}px`,
              }}
            >
              {Array.from({ length: SQUARES }, (_, sqIndex) => (
                <div
                  key={sqIndex}
                  style={{
                    width:  `${SQUARE_W}px`,
                    height: `${SQUARE_H}px`,
                    flexShrink: 0,
                    // the -12deg skew is an identity constant, no token
                    transform: 'skewX(-12deg)',
                    background: active
                      ? cfg.activeColor
                      : 'var(--andromeda-surface-overlay)',
                    border: `var(--andromeda-border-width, 1px) solid ${active ? cfg.activeBorder : 'var(--andromeda-border-subtle)'}`,
                    boxShadow: 'none',
                    transition: 'background var(--andromeda-duration-cascade) var(--andromeda-easing-out), box-shadow var(--andromeda-duration-cascade) var(--andromeda-easing-out), border-color var(--andromeda-duration-cascade) var(--andromeda-easing-out)',
                    transitionDelay: `calc(${Math.floor(barIndex / 3)} * var(--andromeda-stagger-progressbar))`,
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export { variantConfig };
