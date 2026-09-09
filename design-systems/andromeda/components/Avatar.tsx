// ============================================================
// COMPONENT: Avatar
// shadcn/ui-aligned API: variant/size, cva, forwardRef.
// Sizes: sm | md | lg
// Initials, monospace, square (radius.none).
// Optional status dot: online | caution | fault | offline
// ============================================================

'use client';

import { forwardRef, useState } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { cn, andromedaVars } from './lib/utils';

const avatarVariants = cva(
  [
    'inline-flex items-center justify-center select-none shrink-0',
    'border-[length:var(--andromeda-border-width,1px)] border-solid',
    'rounded-[var(--andromeda-radius-frame,0px)]',
    'bg-[color:var(--andromeda-surface-overlay)]',
    'border-[color:var(--andromeda-border-base)]',
    'text-[color:var(--andromeda-text-primary)]',
    '[font-family:var(--andromeda-font-mono)]',
    'font-[number:var(--andromeda-weight-semibold)]',
    '[letter-spacing:var(--andromeda-tracking-normal)]',
    'transition-transform [transition-duration:var(--andromeda-duration-normal)] [transition-timing-function:var(--andromeda-easing-out)]',
    'hover:scale-[1.05]',
  ],
  {
    variants: {
      size: {
        sm: 'w-[var(--andromeda-6,24px)] h-[var(--andromeda-6,24px)] text-[length:var(--andromeda-text-xs)]',
        md: 'w-[var(--andromeda-8,32px)] h-[var(--andromeda-8,32px)] text-[length:var(--andromeda-text-sm)]',
        lg: 'w-[var(--andromeda-10,40px)] h-[var(--andromeda-10,40px)] text-[length:var(--andromeda-text-md)]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const statusDotVariants = cva(
  [
    'absolute -right-[2px] block w-[2px]',
    'top-[15%] h-[70%]',
    'border-0',
  ],
  {
    variants: {
      status: {
        online:  'bg-[color:var(--andromeda-accent-400)]',
        caution: 'bg-[color:var(--andromeda-orange-400)]',
        fault:   'bg-[color:var(--andromeda-red-400)]',
        offline: 'bg-[color:var(--andromeda-text-faint)]',
      },
    },
    defaultVariants: {
      status: 'offline',
    },
  },
);

function deriveInitials(name?: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * @typedef {object} AvatarProps
 * @property {string} [name='?'] Used to derive uppercase initials (shown when no src).
 * @property {string} [src] Optional image URL. When provided, renders an img instead of initials.
 * @property {'sm'|'md'|'lg'} [size='md']
 * @property {'online'|'caution'|'fault'|'offline'} [status] When set, renders a status dot.
 * @property {string} [className] Additional CSS classes merged onto the inner avatar box (the outer wrapper receives style and ...props).
 * @property {React.CSSProperties} [style]
 */

type AvatarOwnProps = {
  name?: string;
  src?: string;
  size?: NonNullable<VariantProps<typeof avatarVariants>['size']>;
  status?: NonNullable<VariantProps<typeof statusDotVariants>['status']>;
  className?: string;
  style?: CSSProperties;
};

export type AvatarProps = AvatarOwnProps & Omit<ComponentPropsWithoutRef<'div'>, keyof AvatarOwnProps>;

/** @type {React.ForwardRefExoticComponent<AvatarProps & React.HTMLAttributes<HTMLDivElement>>} */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { className, name = '?', src, size = 'md', status, style, ...props },
  ref,
) {
  const initials = deriveInitials(name);
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = src && !imgFailed;

  return (
    <div
      ref={ref}
      className="relative inline-flex shrink-0"
      style={{ ...andromedaVars(), ...style }}
      aria-label={status ? `${name}, ${status}` : name}
      {...props}
    >
      <div className={cn(avatarVariants({ size }), className)}>
        {showImage
          ? <img src={src} alt={name} onError={() => setImgFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <span role="img" aria-label={name} style={{ display: 'inline-flex' }}>{initials}</span>
        }
      </div>
      {status ? <span className={statusDotVariants({ status })} aria-hidden="true" /> : null}
    </div>
  );
});

export { avatarVariants, statusDotVariants };
