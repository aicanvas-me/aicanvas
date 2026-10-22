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

// Touch screens: an invisible ::before grows the tap area to at least 40px (32px for sm).
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

// Returns seconds: Framer Motion takes seconds, tokens store ms.
const ms = (v: string) => parseInt(v, 10) / 1000;
const HOVER_TX: Transition = { duration: ms(tokens.motion.duration.normal), ease: easingArray(tokens.motion.easing.out) };
const PRESS_TX: Transition = { duration: ms(tokens.motion.duration.fast),   ease: easingArray(tokens.motion.easing.in) };
const HOVER_LIFT: TargetAndTransition = { y: -1, filter: 'brightness(1.05)', transition: HOVER_TX };
const PRESS_DOWN: TargetAndTransition = { scale: 0.98, transition: PRESS_TX };

const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center select-none whitespace-nowrap',
    'gap-[var(--andromeda-2)]',
    'border-[length:var(--andromeda-border-width,1px)] border-solid',
    'rounded-[var(--andromeda-radius-frame,0px)]',
    '[font-family:var(--andromeda-font-mono)]',
    'font-[number:var(--andromeda-weight-medium)]',
    'uppercase [letter-spacing:var(--andromeda-tracking-wider)]',
    '[line-height:var(--andromeda-leading-tight)]',
    'cursor-pointer',
    'transition-[background-color,border-color,box-shadow,color] [transition-duration:var(--andromeda-duration-normal)] [transition-timing-function:var(--andromeda-easing-out)]',
    '[backdrop-filter:blur(2px)] [-webkit-backdrop-filter:blur(2px)]',
    'focus-visible:outline-none',
    'focus-visible:shadow-[0_0_0_var(--andromeda-border-width,1px)_var(--andromeda-accent-400),0_0_var(--andromeda-glow,8px)_var(--andromeda-accent-500)]',
    'disabled:cursor-not-allowed disabled:opacity-[var(--andromeda-opacity-disabled)] disabled:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        default: [
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
