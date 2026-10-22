'use client';

import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, ElementType, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { motion } from 'framer-motion';
import type { Transition } from 'framer-motion';
import { cva } from 'class-variance-authority';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { cn, andromedaVars, easingArray } from './lib/utils';
import { mq } from './lib/responsive';
import { tokens } from '../tokens';

// Touch screens: the whole row grows to at least 40px tall.
const TOUCH_TARGET_STYLE = `
  ${mq.coarse} {
    .andromeda-navitem-touch {
      min-height: ${tokens.spacing[10]} !important;
    }
  }
`;

// Returns seconds: Framer Motion takes seconds, tokens store ms.
const ms = (v: string) => parseInt(v, 10) / 1000;
const INDICATOR_TX: Transition = {
  duration: ms(tokens.motion.duration.slow),
  ease: easingArray(tokens.motion.easing.standard),
};

const navItemVariants = cva(
  [
    'relative flex items-center w-full text-left box-border',
    'gap-[var(--andromeda-3)]',
    'pl-[var(--andromeda-5)] pr-[var(--andromeda-4)] py-[var(--andromeda-3)]',
    'border-0 rounded-[var(--andromeda-radius-frame,0px)]',
    'cursor-pointer select-none',
    'font-[number:var(--andromeda-weight-medium)]',
    'text-[length:var(--andromeda-text-sm)]',
    '[line-height:var(--andromeda-leading-snug)]',
    'transition-[background-color,color,transform] [transition-duration:var(--andromeda-duration-normal)] [transition-timing-function:var(--andromeda-easing-out)]',
    'active:translate-x-[1px]',
    'focus-visible:outline-none',
    'focus-visible:shadow-[inset_0_0_0_1px_var(--andromeda-accent-400)]',
    'disabled:opacity-[var(--andromeda-opacity-disabled)] disabled:pointer-events-none',
  ],
  {
    variants: {
      active: {
        true: [
          'text-[color:var(--andromeda-accent-300)]',
        ],
        false: [
          'text-[color:var(--andromeda-text-secondary)]',
          'bg-transparent',
          'hover:text-[color:var(--andromeda-text-primary)]',
          'hover:bg-[color:var(--andromeda-surface-hover)]',
          'active:bg-[color:var(--andromeda-surface-active)]',
        ],
      },
      mono: {
        true: [
          '[font-family:var(--andromeda-font-mono)]',
          'uppercase [letter-spacing:var(--andromeda-tracking-wider)]',
        ],
        false: [
          '[font-family:var(--andromeda-font-sans)]',
          '[letter-spacing:var(--andromeda-tracking-normal)]',
        ],
      },
    },
    defaultVariants: {
      active: false,
      mono: true,
    },
  },
);

/**
 * @typedef {object} NavItemProps
 * @property {React.ComponentType<{ size?: number, weight?: string }>} [icon]
 *   Optional icon component rendered at 20px before the label.
 * @property {React.ReactNode} label Visible content of the nav row.
 * @property {boolean} [active=false] Marks the row as the current selection, applying accent text and the indicator dot.
 * @property {boolean} [mono=true] Renders the label in uppercase mono type; set false for sans.
 * @property {boolean} [asChild=false] Renders via Radix Slot, merging props onto the child instead of a native button.
 * @property {'button'|'submit'|'reset'} [type='button'] HTML button type; defaults to 'button' to avoid accidental form submits, and is omitted when asChild is set.
 * @property {string} [layoutGroupId='andromeda-navitem-indicator']
 *   Override only when two distinct nav lists share a viewport and you don't
 *   want the active dot to animate between them. To get the slide between
 *   sibling NavItems, wrap the list in framer's <LayoutGroup>.
 * @property {string} [className] Extra classes merged onto the root element.
 * @property {React.CSSProperties} [style] Inline styles merged onto the root element.
 */

type NavItemOwnProps = {
  icon?: PhosphorIcon;
  label: ReactNode;
  active?: boolean;
  mono?: boolean;
  asChild?: boolean;
  layoutGroupId?: string;
  className?: string;
  style?: CSSProperties;
};

export type NavItemProps = NavItemOwnProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof NavItemOwnProps>;

export const NavItem = forwardRef<HTMLButtonElement, NavItemProps>(function NavItem(
  {
    className,
    icon: Icon,
    label,
    active = false,
    mono = true,
    asChild = false,
    layoutGroupId = 'andromeda-navitem-indicator',
    style,
    type = 'button',
    ...props
  },
  ref,
) {
  const Comp: ElementType = asChild ? Slot : 'button';

  return (
    <>
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        data-active={active ? 'true' : 'false'}
        aria-current={active ? 'page' : undefined}
        className={cn(navItemVariants({ active, mono }), 'andromeda-navitem-touch', className)}
        style={{ ...andromedaVars(), ...style }}
        {...props}
      >
        {active ? (
          <motion.span
            layoutId={layoutGroupId}
            aria-hidden="true"
            transition={INDICATOR_TX}
            style={{
              position: 'absolute',
              right: 'var(--andromeda-3, 12px)',
              top: '50%',
              translateY: '-50%',
              width: 'var(--andromeda-1, 4px)',
              height: 'var(--andromeda-1, 4px)',
              flexShrink: 0,
              background: 'var(--andromeda-accent-300)',
              boxShadow: '-2px 0 8px var(--andromeda-accent-500)',
            }}
          />
        ) : null}
        {Icon ? <Icon size={20} weight="regular" /> : null}
        <span>{label}</span>
      </Comp>
      <style>{TOUCH_TARGET_STYLE}</style>
    </>
  );
});

export { navItemVariants };
