'use client';

import { forwardRef, useEffect } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, ReactElement } from 'react';
import { tokens } from '../tokens';
import { andromedaVars } from './lib/utils';

const STYLE_ID = 'andromeda-spinner-keyframes';
const KEYFRAMES = `
  @keyframes andromeda-spinner-snake {
    0%, 37.5%   { background: var(--andromeda-spinner-bright); }
    37.6%, 100% { background: var(--andromeda-spinner-dim); }
  }
`;

function ensureKeyframesInjected() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
}

// wrap must equal 3 * cell + 2 * gap; change them together.
const SIZE_MAP = {
  sm: { wrap: 14, cell: 4, gap: 1 },
  md: { wrap: 20, cell: 6, gap: 1 },
  lg: { wrap: 28, cell: 8, gap: 2 },
};

const colorByVariant = {
  default: `var(--andromeda-text-primary, ${tokens.color.text.primary})`,
  accent:  `var(--andromeda-accent-300, ${tokens.color.accent[300]})`,
  warning: `var(--andromeda-orange-300, ${tokens.color.orange[300]})`,
  fault:   `var(--andromeda-red-300, ${tokens.color.red[300]})`,
};

const PERIMETER_ORDER = [
  [0, 0], [0, 1], [0, 2],
  [1, 2],
  [2, 2], [2, 1], [2, 0],
  [1, 0],
];

const DURATION_MS = 1200;
const STEPS = 8;
const STEP_MS = DURATION_MS / STEPS;

/**
 * @typedef {object} SpinnerProps
 * @property {'default'|'accent'|'warning'|'fault'} [variant='default']
 * @property {'sm'|'md'|'lg'} [size='md']
 * @property {string} [label='Loading'] Accessible label.
 * @property {string} [className]
 * @property {React.CSSProperties} [style]
 */

export type SpinnerProps = ComponentPropsWithoutRef<'span'> & {
  variant?: keyof typeof colorByVariant;
  size?: keyof typeof SIZE_MAP;
  label?: string;
};

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { className, variant = 'default', size = 'md', label = 'Loading', style, ...props },
  ref,
) {
  useEffect(() => { ensureKeyframesInjected(); }, []);

  const sz = SIZE_MAP[size] ?? SIZE_MAP.md;
  const bright = colorByVariant[variant] ?? colorByVariant.default;
  const dim = `var(--andromeda-border-base, ${tokens.color.border.base})`;

  const cells: ReactElement[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const peri = PERIMETER_ORDER.findIndex(([pr, pc]) => pr === r && pc === c);
      const isCenter = peri === -1;
      const delayMs = isCenter ? 0 : -((STEPS - peri) % STEPS) * STEP_MS;
      cells.push(
        <span
          key={`${r}-${c}`}
          aria-hidden
          style={{
            width:  `${sz.cell}px`,
            height: `${sz.cell}px`,
            background: dim,
            ...(isCenter ? null : {
              animation: `andromeda-spinner-snake ${DURATION_MS}ms linear infinite`,
              animationDelay: `${delayMs}ms`,
            }),
          }}
        />,
      );
    }
  }

  return (
    <span
      ref={ref}
      role="status"
      aria-label={label}
      className={className}
      style={{
        ...andromedaVars(),
        '--andromeda-spinner-bright': bright,
        '--andromeda-spinner-dim': dim,
        display: 'inline-grid',
        gridTemplateColumns: `repeat(3, ${sz.cell}px)`,
        gridTemplateRows: `repeat(3, ${sz.cell}px)`,
        gap: `${sz.gap}px`,
        width:  `${sz.wrap}px`,
        height: `${sz.wrap}px`,
        ...style,
      } as CSSProperties}
      {...props}
    >
      {cells}
    </span>
  );
});
