'use client';

import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from './lib/utils';
import { Card, CardContent } from './Card';
import type { CardProps } from './Card';

/**
 * @typedef {object} EmptyStateProps
 * @property {React.ReactNode} [children]
 * @property {string} [className]
 * @property {React.CSSProperties} [style]
 */

export type EmptyStateProps = CardProps;

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { className, children, style, ...props },
  ref,
) {
  return (
    <Card
      ref={ref}
      data-slot="empty-state"
      className={cn(className)}
      style={style}
      {...props}
    >
      <CardContent
        className={cn(
          'flex flex-col items-center justify-center text-center',
          'gap-[var(--andromeda-3)] py-[var(--andromeda-10)] px-[var(--andromeda-6)]',
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
});

export const EmptyStateIcon = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function EmptyStateIcon(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="empty-state-icon"
      aria-hidden="true"
      className={cn(
        'inline-flex items-center justify-center',
        'w-[44px] h-[44px] mb-[var(--andromeda-2)]',
        'border-[length:var(--andromeda-border-width,1px)] border-solid',
        'border-[color:var(--andromeda-border-base)]',
        'bg-[color:var(--andromeda-surface-overlay)]',
        '[&>svg]:w-[var(--andromeda-icon-xl,22px)] [&>svg]:h-[var(--andromeda-icon-xl,22px)]',
        'text-[color:var(--andromeda-text-muted)] [&>svg]:stroke-current',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export const EmptyStateTitle = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function EmptyStateTitle(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="empty-state-title"
      className={cn(
        '[font-family:var(--andromeda-font-mono)]',
        'text-[length:var(--andromeda-text-md)]',
        'font-[number:var(--andromeda-weight-medium)]',
        'uppercase [letter-spacing:var(--andromeda-tracking-wider)]',
        'text-[color:var(--andromeda-text-primary)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export const EmptyStateDescription = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<'p'>>(function EmptyStateDescription(
  { className, children, ...props },
  ref,
) {
  return (
    <p
      ref={ref}
      data-slot="empty-state-description"
      className={cn(
        'm-0 max-w-[44ch]',
        '[font-family:var(--andromeda-font-sans)]',
        'text-[length:var(--andromeda-text-xs)]',
        'text-[color:var(--andromeda-text-secondary)]',
        'leading-[1.6]',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
});

export const EmptyStateAction = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function EmptyStateAction(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="empty-state-action"
      className={cn('mt-[var(--andromeda-3)] flex flex-wrap items-center justify-center gap-[var(--andromeda-3)]', className)}
      {...props}
    >
      {children}
    </div>
  );
});
