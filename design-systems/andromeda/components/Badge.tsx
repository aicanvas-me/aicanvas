// @ts-nocheck — design-systems/ is not type-checked (see design-systems/CLAUDE.md). Strip this after a proper typing pass.
// ============================================================
// COMPONENT: Badge
// shadcn/ui-aligned API: variant prop, cva, forwardRef.
// Variants: default | accent | warning | fault | subtle | outline
// Monospace, uppercase, wide letter-spacing, sharp corners.
// ============================================================

// ============================================================
// COMPONENT: Badge
// shadcn/ui-aligned API: variant prop, cva, forwardRef.
// Variants: default | accent | warning | fault | subtle | outline
// No border — badge is a read-only status label, not a control.
// Leading 4×4 dot colored by variant distinguishes it from Button.
// ============================================================

'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import { cva } from 'class-variance-authority';
import { cn, andromedaVars } from './lib/utils';
import { useReducedMotion } from './lib/motion';
import { tokens } from '../tokens';

// JS timer boundary: setTimeout cannot read CSS vars; derived from tokens at
// module load, cannot follow runtime var overrides.
const BLINK_OFF_MS = parseFloat(tokens.motion.duration.slow); // 200ms

// Blinks once every ~2s: full opacity → 0.12 for 200ms → full opacity.
// Honours reduced-motion: when the user opts out, the dot holds at full
// opacity and the blink loop never schedules.
function useBlink() {
  const reducedMotion = useReducedMotion();
  const [opacity, setOpacity] = useState(1);
  const timerRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) {
      setOpacity(1);
      return;
    }
    function schedule() {
      timerRef.current = setTimeout(() => {
        setOpacity(0.12);
        setTimeout(() => {
          setOpacity(1);
          schedule();
        }, BLINK_OFF_MS);
        // 1800/800 are bespoke blink-cadence jitter, no token
      }, 1800 + Math.random() * 800);
    }
    schedule();
    return () => clearTimeout(timerRef.current);
  }, [reducedMotion]);

  return opacity;
}

const badgeVariants = cva(
  [
    // max-w-full + min-w-0 keep a long label from forcing horizontal scroll
    // when the Badge sits in a stacked (single-column) layout; the label
    // span truncates instead (see render below).
    // 5px gap and 2px pad are identity constants, no token
    'inline-flex items-center gap-[5px] select-none whitespace-nowrap',
    'max-w-full min-w-0',
    'rounded-[var(--andromeda-radius-frame,0px)]',
    'px-[var(--andromeda-2)] py-[2px]',
    '[font-family:var(--andromeda-font-mono)]',
    'text-[length:var(--andromeda-text-xs)]',
    'font-[number:var(--andromeda-weight-medium)]',
    'uppercase [letter-spacing:var(--andromeda-tracking-wider)]',
    '[line-height:var(--andromeda-leading-normal)]',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-[color:var(--andromeda-surface-active)]',
          'text-[color:var(--andromeda-text-primary)]',
        ],
        accent: [
          'bg-[color:var(--andromeda-accent-500)]',
          'text-[color:var(--andromeda-accent-on)]',
        ],
        warning: [
          'bg-[color:var(--andromeda-orange-500)]',
          'text-[color:var(--andromeda-orange-on)]',
        ],
        fault: [
          'bg-[color:var(--andromeda-red-500)]',
          'text-[color:var(--andromeda-red-on)]',
        ],
        subtle: [
          'bg-[color:var(--andromeda-surface-overlay)]',
          'text-[color:var(--andromeda-text-primary)]',
        ],
        outline: [
          'bg-transparent',
          'border-[length:var(--andromeda-border-width,1px)] border-solid border-[color:var(--andromeda-border-bright)]',
          'text-[color:var(--andromeda-text-primary)]',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

// Dot color per variant — the dot is the per-variant signal (text is always
// text.primary across variants, so the colored dot, not the label, carries meaning).
const dotColor = {
  default: 'var(--andromeda-text-muted)',
  accent:  'var(--andromeda-accent-300)',
  warning: 'var(--andromeda-orange-300)',
  fault:   'var(--andromeda-red-300)',
  subtle:  'var(--andromeda-text-faint)',
  outline: 'var(--andromeda-text-primary)',
};

/**
 * @typedef {object} BadgeProps
 * @property {'default'|'accent'|'warning'|'fault'|'subtle'|'outline'} [variant='default']
 * @property {React.ReactNode} [children]
 * @property {string} [className]
 * @property {React.CSSProperties} [style]
 */

/** @type {React.ForwardRefExoticComponent<BadgeProps & React.HTMLAttributes<HTMLSpanElement>>} */
export const Badge = forwardRef(function Badge(
  { className, variant = 'default', children, style, ...props },
  ref,
) {
  const dotOpacity = useBlink();

  return (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      style={{ ...andromedaVars(), ...style }}
      {...props}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: 'var(--andromeda-1, 4px)',
          height: 'var(--andromeda-1, 4px)',
          flexShrink: 0,
          background: dotColor[variant],
          opacity: dotOpacity,
          transition: 'opacity var(--andromeda-duration-fast, 80ms) var(--andromeda-easing-out, cubic-bezier(0, 0, 0.2, 1))',
        }}
      />
      <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
        {children}
      </span>
    </span>
  );
});

export { badgeVariants };
