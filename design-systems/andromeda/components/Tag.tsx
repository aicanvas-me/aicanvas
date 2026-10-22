'use client';

import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { X } from '@phosphor-icons/react';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { cn, andromedaVars } from './lib/utils';

const tagVariants = cva(
  [
    // max-w-full + min-w-0: long labels truncate instead of forcing sideways scroll.
    'inline-flex items-center select-none whitespace-nowrap',
    'max-w-full min-w-0',
    'gap-[var(--andromeda-2)]',
    'px-[var(--andromeda-2)] py-[3px]',
    'border-[length:var(--andromeda-border-width,1px)] border-solid',
    'rounded-[var(--andromeda-radius-frame,0px)]',
    '[font-family:var(--andromeda-font-mono)]',
    'text-[length:var(--andromeda-text-xs)]',
    'uppercase [letter-spacing:var(--andromeda-tracking-wider)]',
    'transition-colors duration-150 ease-out',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-[color:var(--andromeda-surface-raised)]',
          'text-[color:var(--andromeda-text-primary)]',
          'border-[color:var(--andromeda-border-base)]',
        ],
        accent: [
          'bg-[color:var(--andromeda-accent-500)]',
          'text-[color:var(--andromeda-accent-on)]',
          'border-[color:var(--andromeda-accent-400)]',
        ],
        warning: [
          'bg-[color:var(--andromeda-orange-500)]',
          'text-[color:var(--andromeda-orange-on)]',
          'border-[color:var(--andromeda-orange-400)]',
        ],
        fault: [
          'bg-[color:var(--andromeda-red-500)]',
          'text-[color:var(--andromeda-red-on)]',
          'border-[color:var(--andromeda-red-400)]',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);


const closeButtonClass = cn(
  'inline-flex items-center justify-center shrink-0',
  'p-0 m-0 bg-transparent border-0',
  'cursor-pointer leading-none',
  'text-[color:currentColor]',
  'opacity-70 transition-[opacity,transform] duration-150 ease-out',
  'hover:opacity-100',
  'active:scale-[0.80]',
  'focus-visible:outline-none focus-visible:opacity-100',
);

/**
 * @typedef {object} TagProps
 * @property {'default'|'accent'|'warning'|'fault'} [variant='default']
 * @property {React.ReactNode} [children]
 * @property {() => void} [onClose] When provided, renders a close button.
 * @property {string} [className]
 * @property {React.CSSProperties} [style]
 */

type TagOwnProps = {
  variant?: NonNullable<VariantProps<typeof tagVariants>['variant']>;
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
  style?: CSSProperties;
};

export type TagProps = TagOwnProps & Omit<ComponentPropsWithoutRef<'span'>, keyof TagOwnProps>;

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { className, variant = 'default', children, onClose, style, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(tagVariants({ variant }), className)}
      style={{ ...andromedaVars(), ...style }}
      {...props}
    >
      <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
        {children}
      </span>
      {onClose ? (
        <button
          type="button"
          aria-label={typeof children === 'string' ? `Remove ${children}` : 'Remove'}
          onClick={onClose}
          className={closeButtonClass}
        >
          <X size={12} weight="regular" />
        </button>
      ) : null}
    </span>
  );
});

export { tagVariants };
