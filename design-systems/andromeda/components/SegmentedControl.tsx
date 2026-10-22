'use client';

import { forwardRef, useId } from 'react';
import type { ComponentPropsWithoutRef, ComponentType } from 'react';
import { motion } from 'framer-motion';
import type { Transition } from 'framer-motion';
import type { IconWeight } from '@phosphor-icons/react';
import { cn, andromedaVars, easingArray, themeColor } from './lib/utils';
import { mq } from './lib/responsive';
import { tokens } from '../tokens';

// Below md the strip scrolls inside its own box; it must never wrap or force page scroll.
const RESPONSIVE_STYLE = `
  ${mq.md} {
    .andromeda-segmented {
      display: flex !important;
      max-width: 100% !important;
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch;
      /* Hide the scroll affordance. The strip has a fixed cellSize height
         (24/32/40px); a classic, space-consuming horizontal scrollbar (narrow
         desktop window, some platforms) would eat that height and vertically
         crush the segment row. Scrolling still works — the gutter just isn't
         painted. */
      scrollbar-width: none !important;
    }
    .andromeda-segmented::-webkit-scrollbar { display: none !important; }
    .andromeda-segmented > .andromeda-segmented-item {
      flex-shrink: 0 !important;
    }
  }
`;

const SIZE_PX = {
  sm: 24,
  md: 32,
  lg: 40,
};

const SIZE_VAR = {
  sm: '--andromeda-6',
  md: '--andromeda-8',
  lg: '--andromeda-10',
};

const ICON_PX = {
  sm: 14,
  md: 16,
  lg: 18,
};

// Returns seconds: Framer Motion takes seconds, tokens store ms.
const ms = (v: string) => parseInt(v, 10) / 1000;
const INDICATOR_TX: Transition = {
  duration: ms(tokens.motion.duration.slow),
  ease: easingArray(tokens.motion.easing.standard),
};

/**
 * @typedef {object} SegmentOption
 * @property {string} value Unique value that identifies this segment.
 * @property {string} [label] Text shown on the segment.
 * @property {React.ComponentType<{ size?: number, weight?: string }>} [icon] Icon component rendered in the segment, optionally alongside its label.
 * @property {string} [ariaLabel] Accessible name for the segment, falling back to label when omitted.
 */

type SegmentOption = {
  value: string;
  label?: string;
  icon?: ComponentType<{ size?: number; weight?: IconWeight }>;
  ariaLabel?: string;
};

/**
 * @typedef {object} SegmentedControlProps
 * @property {string} value Value of the currently selected segment.
 * @property {(next: string) => void} onChange Handler called with the value of the newly selected segment.
 * @property {SegmentOption[]} options Segments to render, in display order.
 * @property {'sm'|'md'|'lg'} [size='md'] Height and icon-size preset for the control.
 * @property {string} [layoutGroupId]
 *   Override the auto-generated per-instance id only when you explicitly want
 *   two SegmentedControls to share their indicator (animating across both as
 *   one unit). The default `useId()` value scopes the indicator to a single
 *   control, which is what you want 99% of the time, without it, switching
 *   selections in one control makes the indicator fly between controls.
 * @property {string} [className] Extra classes merged onto the root element.
 * @property {React.CSSProperties} [style] Inline styles merged onto the root element.
 */

type SegmentedControlProps = Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> & {
  value: string;
  onChange: (next: string) => void;
  options: SegmentOption[];
  size?: 'sm' | 'md' | 'lg';
  layoutGroupId?: string;
};

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(function SegmentedControl(
  { className, value, onChange, options, size = 'md', layoutGroupId, style, ...props },
  ref,
) {
  const generatedId = useId();
  const indicatorId = layoutGroupId ?? `andromeda-segmented-${generatedId}`;
  const cellSize = SIZE_PX[size] ?? SIZE_PX.md;
  const cellVar = SIZE_VAR[size] ?? SIZE_VAR.md;
  const iconSize = ICON_PX[size] ?? ICON_PX.md;

  return (
    <div
      ref={ref}
      role="tablist"
      data-size={size}
      data-slot="segmented-control"
      className={cn('andromeda-segmented inline-flex relative select-none', className)}
      style={{
        ...andromedaVars(),
        height: `var(${cellVar}, ${cellSize}px)`,
        border: `${tokens.border.thin} ${themeColor.border.base}`,
        borderRadius: tokens.radius.frame,
        background: themeColor.surface.raised,
        ...style,
      }}
      {...props}
    >
      {options.map((opt, i) => {
        const Icon = opt.icon;
        const active = opt.value === value;
        const showLabel = !Icon && opt.label;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={opt.ariaLabel ?? opt.label}
            onClick={() => onChange(opt.value)}
            data-active={active}
            className="andromeda-segmented-item"
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: tokens.spacing[2],
              minWidth: showLabel ? undefined : `var(${cellVar}, ${cellSize}px)`,
              height: '100%',
              padding: showLabel ? `0 ${tokens.spacing[3]}` : 0,
              background: 'transparent',
              border: 'none',
              borderLeft: i === 0 ? 'none' : `${tokens.border.thin} ${themeColor.border.base}`,
              cursor: 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.sm,
              fontWeight: active ? tokens.typography.weight.medium : tokens.typography.weight.regular,
              color: active ? themeColor.text.primary : themeColor.text.muted,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.wider,
              transition: `color ${tokens.motion.duration.normal} ${tokens.motion.easing.out}`,
            }}
          >
            {active ? (
              <motion.span
                layoutId={indicatorId}
                aria-hidden="true"
                transition={INDICATOR_TX}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: themeColor.surface.active,
                  zIndex: 0,
                  pointerEvents: 'none',
                }}
              />
            ) : null}
            <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              {Icon ? <Icon size={iconSize} weight="regular" /> : null}
              {opt.label && Icon ? <span>{opt.label}</span> : null}
              {showLabel ? opt.label : null}
            </span>
          </button>
        );
      })}

      <style>{`
        .andromeda-segmented-item:hover[data-active="false"] {
          color: var(--andromeda-text-primary);
        }
        .andromeda-segmented-item:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 1px var(--andromeda-accent-400);
        }
        ${RESPONSIVE_STYLE}
      `}</style>
    </div>
  );
});
