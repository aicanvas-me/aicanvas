// ============================================================
// COMPONENT: Button
// shadcn/ui-aligned API: variant, size, asChild, forwardRef.
// Variants: default | outline | ghost | destructive | link
// Sizes:    sm | md | lg
// All interactive states (hover, focus-visible, active, disabled)
// are expressed as cva variants and trace back to Andromeda tokens
// via CSS custom properties from `andromedaVars()`.
// ============================================================

'use client';

import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { motion } from 'framer-motion';
import type { HTMLMotionProps, TargetAndTransition, Transition } from 'framer-motion';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import type { Icon } from '@phosphor-icons/react';
import { cn, andromedaVars, easingArray } from './lib/utils';
import { useReducedMotion } from './lib/motion';
import { mq } from './lib/responsive';
import { tokens } from '../tokens';

// Touch-target expander — desktop chrome stays exactly as authored; on coarse
// pointers a centered, transparent ::before overlay grows the *hit area* toward
// spacing[10] (40px) without enlarging the visible button. Scoped className so
// the rule never leaks; declarations are !important because the cva/inline base
// would otherwise out-specify a bare class rule (Andromeda rule: "Hover on inline-styled
// controls"). See the Andromeda responsive rules → "Grow touch targets on coarse pointers".
const TOUCH_TARGET_STYLE = `
  ${mq.coarse} {
    .andromeda-btn-touch::before {
      content: '' !important;
      position: absolute !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      width: 100% !important;
      height: 100% !important;
      min-height: var(--andromeda-10) !important;
      min-width: var(--andromeda-10) !important;
    }
    /* sm sits below the 40px floor; cap its hit area at spacing[8] (32px) so the
       vertical hit-area seam between stacked sm buttons never overlaps, matching
       IconButton's sm cap. */
    .andromeda-btn-touch[data-size="sm"]::before {
      min-height: var(--andromeda-8) !important;
      min-width: var(--andromeda-8) !important;
    }
  }
`;

// Token-driven framer transitions. tokens.motion.duration values are
// strings like "140ms"; framer expects seconds, so parseInt → /1000.
const ms = (v: string) => parseInt(v, 10) / 1000;
// framer boundary: derived from tokens, cannot follow runtime var overrides
const HOVER_TX: Transition = { duration: ms(tokens.motion.duration.normal), ease: easingArray(tokens.motion.easing.out) };
const PRESS_TX: Transition = { duration: ms(tokens.motion.duration.fast),   ease: easingArray(tokens.motion.easing.in) };
// whileHover / whileTap targets — transitions inlined inside the variant
// so hover uses duration.normal and press uses duration.fast independently.
const HOVER_LIFT: TargetAndTransition = { y: -1, filter: 'brightness(1.05)', transition: HOVER_TX };
const PRESS_DOWN: TargetAndTransition = { scale: 0.98, transition: PRESS_TX };

const buttonVariants = cva(
  [
    // structural
    'relative inline-flex items-center justify-center select-none whitespace-nowrap',
    'gap-[var(--andromeda-2)]',
    'border-[length:var(--andromeda-border-width,1px)] border-solid',
    'rounded-[var(--andromeda-radius-frame,0px)]',
    // typography (all token-driven via CSS vars)
    '[font-family:var(--andromeda-font-mono)]',
    'font-[number:var(--andromeda-weight-medium)]',
    'uppercase [letter-spacing:var(--andromeda-tracking-wider)]',
    '[line-height:var(--andromeda-leading-tight)]',
    // motion — colours/border/shadow tween via CSS at duration.normal so the
    // focus ring fades in (was previously a hard snap). Transform/lift/press
    // are driven by framer-motion's whileHover/whileTap on the motion.button
    // root, see below — they get duration.normal (hover) and duration.fast
    // (press) per `tokens.motion`.
    'cursor-pointer',
    'transition-[background-color,border-color,box-shadow,color] [transition-duration:var(--andromeda-duration-normal)] [transition-timing-function:var(--andromeda-easing-out)]',
    '[backdrop-filter:blur(2px)] [-webkit-backdrop-filter:blur(2px)]',
    // focus & disabled
    'focus-visible:outline-none',
    'focus-visible:shadow-[0_0_0_var(--andromeda-border-width,1px)_var(--andromeda-accent-400),0_0_var(--andromeda-glow,8px)_var(--andromeda-accent-500)]',
    'disabled:cursor-not-allowed disabled:opacity-[var(--andromeda-opacity-disabled)] disabled:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        default: [
          // On-accent foreground: tracks the accent family, NOT the neutral
          // text ramp, so a theme that darkens text keeps the label legible.
          'text-[color:var(--andromeda-accent-on)]',
          'bg-[color:var(--andromeda-accent-500)]',
          'border-[color:var(--andromeda-accent-400)]',
          'hover:border-[color:var(--andromeda-accent-300)]',
          'hover:shadow-[0_0_var(--andromeda-glow,8px)_var(--andromeda-accent-500)]',
          'active:border-[color:var(--andromeda-accent-300)]',
        ],
        outline: [
          'text-[color:var(--andromeda-text-primary)]',
          'bg-[color:var(--andromeda-surface-raised)]',
          'border-[color:var(--andromeda-border-base)]',
          'hover:bg-[color:var(--andromeda-surface-hover)]',
          'hover:border-[color:var(--andromeda-border-bright)]',
          'active:bg-[color:var(--andromeda-surface-active)]',
        ],
        ghost: [
          'text-[color:var(--andromeda-text-secondary)]',
          'bg-transparent',
          'border-transparent',
          'hover:text-[color:var(--andromeda-text-primary)]',
          'hover:bg-[color:var(--andromeda-surface-raised)]',
          'active:bg-[color:var(--andromeda-surface-hover)]',
        ],
        destructive: [
          // On-fault foreground: bound to the red family, not the text ramp.
          'text-[color:var(--andromeda-red-on)]',
          'bg-[color:var(--andromeda-red-500)]',
          'border-[color:var(--andromeda-red-400)]',
          'hover:bg-[color:var(--andromeda-red-400)]',
          'hover:border-[color:var(--andromeda-red-300)]',
          'hover:shadow-[0_0_var(--andromeda-glow,8px)_var(--andromeda-red-400)]',
          'focus-visible:shadow-[0_0_0_var(--andromeda-border-width,1px)_var(--andromeda-red-400),0_0_var(--andromeda-glow,8px)_var(--andromeda-red-400)]',
          'active:bg-[color:var(--andromeda-red-400)]',
        ],
        link: [
          'text-[color:var(--andromeda-text-primary)]',
          'bg-transparent',
          'border-transparent',
          'underline-offset-4 hover:underline',
          'hover:text-[color:var(--andromeda-text-primary)]',
          // link variant has no shadow ring on focus
          'focus-visible:shadow-none',
          'focus-visible:underline',
        ],
      },
      size: {
        sm: 'px-[var(--andromeda-3)] py-[calc(var(--andromeda-1)+1px)] text-[length:var(--andromeda-text-xs)]',
        md: 'px-[var(--andromeda-4)] py-[var(--andromeda-2)] text-[length:var(--andromeda-text-sm)]',
        lg: 'px-[var(--andromeda-5)] py-[calc(var(--andromeda-3)-1px)] text-[length:var(--andromeda-text-md)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

type ButtonOwnProps = VariantProps<typeof buttonVariants> & {
  asChild?: boolean;
  icon?: Icon;
  style?: CSSProperties;
};

export type ButtonProps = ButtonOwnProps & Omit<HTMLMotionProps<'button'>, keyof ButtonOwnProps>;

/**
 * @typedef {object} ButtonProps
 * @property {'default'|'outline'|'ghost'|'destructive'|'link'} [variant='default']
 * @property {'sm'|'md'|'lg'} [size='md']
 * @property {boolean} [asChild=false]  When true, renders the only child element with the button's props/styles.
 * @property {React.ComponentType<{ size?: number }>} [icon] Phosphor / Lucide icon component rendered before children.
 * @property {React.ReactNode} [children]
 * @property {string} [className]
 * @property {React.CSSProperties} [style]
 * @property {'button'|'submit'|'reset'} [type='button'] Native button type; defaults to 'button', so it does not submit an enclosing form unless set to 'submit'.
 * @property {boolean} [disabled]
 * @property {(e: React.MouseEvent<HTMLButtonElement>) => void} [onClick]
 */

/** @type {React.ForwardRefExoticComponent<ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>>} */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'default',
    size = 'md',
    asChild = false,
    icon: Icon,
    children,
    style,
    type = 'button',
    disabled,
    ...props
  },
  ref,
) {
  // Icons render ~1.3× the label size so they read clearly next to the text.
  const iconSize = size === 'sm' ? tokens.iconSize.sm : size === 'md' ? tokens.iconSize.md : tokens.iconSize.lg;
  const reducedMotion = useReducedMotion();
  const baseClass = cn(buttonVariants({ variant, size }), 'andromeda-btn-touch', className);
  const baseStyle = { ...andromedaVars(), ...style };
  const content = (
    <>
      {Icon ? <Icon size={iconSize} weight="regular" /> : null}
      {children}
    </>
  );

  // asChild path — Slot composes onto whatever child was passed (typically
  // an <a>). Slot can't accept framer-motion gesture props, so the asChild
  // path falls back to CSS-only transitions defined in cva. The hover lift
  // + press scale are skipped for this path; this is a known trade-off.
  if (asChild) {
    return (
      <>
        <Slot ref={ref} className={baseClass} data-size={size} style={baseStyle} {...(props as ComponentPropsWithoutRef<'button'>)}>
          {content}
        </Slot>
        <style>{TOUCH_TARGET_STYLE}</style>
      </>
    );
  }

  return (
    <>
      <motion.button
        ref={ref}
        type={type}
        className={baseClass}
        data-size={size}
        style={baseStyle}
        disabled={disabled}
        whileHover={reducedMotion || disabled ? undefined : HOVER_LIFT}
        whileTap={reducedMotion || disabled ? undefined : PRESS_DOWN}
        {...props}
      >
        {content}
      </motion.button>
      <style>{TOUCH_TARGET_STYLE}</style>
    </>
  );
});

export { buttonVariants };
