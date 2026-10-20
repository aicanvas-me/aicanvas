'use client';

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { useInView } from 'framer-motion';
import { tokens } from '../tokens';
import { andromedaVars } from './lib/utils';
import { useReducedMotion } from './lib/motion';

type Intensity = 0 | 1 | 2 | 3;

const INTENSITY_COLOR: Record<Intensity, { bg: string; border: string }> = {
  0: { bg: `var(--andromeda-surface-overlay, ${tokens.color.surface.overlay})`, border: `var(--andromeda-border-subtle, ${tokens.color.border.subtle})` },
  1: { bg: `var(--andromeda-accent-500, ${tokens.color.accent[500]})`,          border: `var(--andromeda-accent-400, ${tokens.color.accent[400]})` },
  2: { bg: `var(--andromeda-accent-400, ${tokens.color.accent[400]})`,          border: `var(--andromeda-accent-300, ${tokens.color.accent[300]})` },
  3: { bg: `var(--andromeda-accent-300, ${tokens.color.accent[300]})`,          border: `var(--andromeda-accent-200, ${tokens.color.accent[200]})` },
};

const msNum = (v: string) => parseInt(v, 10);

function buildFillMap(value: number, cols: number, rows: number): Record<string, Intensity> {
  const center = (cols - 1) / 2;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rank = (rows - 1 - r) + Math.abs(c - center);
      cells.push({ r, c, rank });
    }
  }
  const order = [...cells].sort((a, b) => a.rank - b.rank || a.r - b.r || a.c - b.c);

  const clamped = Math.max(0, Math.min(100, value));
  const target = Math.round((clamped / 100) * cols * rows);

  const filled = order.slice(0, target);
  const ranks = filled.map((c) => c.rank);
  const minRank = ranks.length ? Math.min(...ranks) : 0;
  const maxRank = ranks.length ? Math.max(...ranks) : 0;
  const span = maxRank - minRank || 1;

  const map: Record<string, Intensity> = {};
  order.forEach((cell, i) => {
    let intensity: Intensity = 0;
    if (i < target) {
      const frac = (cell.rank - minRank) / span;
      intensity = frac >= 0.66 ? 3 : frac >= 0.33 ? 2 : 1;
    }
    map[`${cell.r}-${cell.c}`] = intensity;
  });
  return map;
}

/**
 * @typedef {object} HeatGridProps
 * @property {number}  [value=0]          0–100 fill level (clamped).
 * @property {number}  [cols=7]           Number of columns in the cell matrix.
 * @property {number}  [rows=5]           Number of rows in the cell matrix.
 * @property {number}  [cellSize=22]      px per cell side.
 * @property {number}  [gap=3]            px between cells.
 * @property {boolean} [showValue=true]   Render the accent percentage readout beside the grid.
 * @property {string}  [unit='%']         Suffix appended to the value readout.
 * @property {string}  [label]            Accessible name for the meter.
 * @property {string}  [className]        Extra class names for the root element.
 * @property {React.CSSProperties} [style] Inline styles merged onto the root element.
 */

type HeatGridProps = ComponentPropsWithoutRef<'div'> & {
  value?: number;
  cols?: number;
  rows?: number;
  cellSize?: number;
  gap?: number;
  showValue?: boolean;
  unit?: string;
  label?: string;
};

export const HeatGrid = forwardRef<HTMLDivElement, HeatGridProps>(function HeatGrid(
  {
    value = 0,
    cols = 7,
    rows = 5,
    cellSize = 22,
    gap = 3,
    showValue = true,
    unit = '%',
    label,
    className,
    style,
    ...props
  },
  ref,
) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const inView = useInView(innerRef, { once: true, margin: '-10% 0px' });
  const revealed = reducedMotion ? true : inView;

  const fillMap = useMemo(() => buildFillMap(value, cols, rows), [value, cols, rows]);
  const clamped = Math.max(0, Math.min(100, value));
  const center = (cols - 1) / 2;

  const rowStaggerMs = msNum(tokens.motion.stagger.progressBar);
  const colStaggerMs = Math.round(rowStaggerMs * 0.18);

  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (entered) return undefined;
    if (reducedMotion) { setEntered(true); return undefined; }
    if (!revealed) return undefined;
    const cascadeMs =
      (rows - 1) * rowStaggerMs + center * colStaggerMs + msNum(tokens.motion.duration.cascade);
    const t = setTimeout(() => setEntered(true), cascadeMs + 60);
    return () => clearTimeout(t);
  }, [revealed, entered, reducedMotion, rows, rowStaggerMs, colStaggerMs, center]);

  const inEntrance = revealed && !entered && !reducedMotion;

  const setRefs = (node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <div
      ref={setRefs}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      aria-label={label ?? 'Fill level'}
      className={className}
      style={{
        ...andromedaVars(),
        display: 'inline-flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: tokens.spacing[6],
        maxWidth: '100%',
        ...style,
      }}
      {...props}
    >
      <div
        aria-hidden="true"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          gap: `${gap}px`,
          flexShrink: 0,
        }}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((__, c) => {
            const intensity = fillMap[`${r}-${c}`] ?? 0;
            const shown = revealed ? intensity : 0;
            const { bg, border } = INTENSITY_COLOR[shown];
            const delay =
              inEntrance && intensity > 0
                ? (rows - 1 - r) * rowStaggerMs + Math.abs(c - center) * colStaggerMs
                : 0;
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  background: bg,
                  border: `${tokens.border.thin} ${border}`,
                  transition: reducedMotion
                    ? undefined
                    : `background var(--andromeda-duration-cascade, ${tokens.motion.duration.cascade}) var(--andromeda-easing-out, ${tokens.motion.easing.out}), border-color var(--andromeda-duration-cascade, ${tokens.motion.duration.cascade}) var(--andromeda-easing-out, ${tokens.motion.easing.out})`,
                  transitionDelay: `${delay}ms`,
                }}
              />
            );
          }),
        )}
      </div>

      {showValue ? (
        <span
          aria-hidden="true"
          style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size['3xl'],
            fontWeight: tokens.typography.weight.medium,
            letterSpacing: tokens.typography.tracking.tight,
            color: 'var(--andromeda-accent-300, #0FCFB2)',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.round(clamped)}
          {unit}
        </span>
      ) : null}
    </div>
  );
});
