// ============================================================
// COMPONENT: Card
// shadcn/ui-aligned compound component:
//   <Card><CardHeader/><CardContent/><CardFooter/></Card>
// Variant: default | glow (adds accent.shade2 tint + bright markers)
// Sharp corners, surface.raised background, thin border.subtle.
// ============================================================

'use client';

import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { cn, andromedaVars } from './lib/utils';
import { CornerMarkers } from './CornerMarkers';
import type { CornerMarkersProps } from './CornerMarkers';

const cardVariants = cva(
  [
    'relative block',
    'rounded-[var(--andromeda-radius-frame,0px)]',
    '[backdrop-filter:blur(2px)] [-webkit-backdrop-filter:blur(2px)]',
  ],
  {
    variants: {
      variant: {
        default: ['bg-[color:var(--andromeda-surface-raised)]'],
        glow:    ['bg-[image:var(--andromeda-gradient-accent-sweep)]'],
      },
      bordered: {
        true:  ['border-[length:var(--andromeda-border-width,1px)]', 'border-solid'],
        false: [],
      },
    },
    compoundVariants: [
      { variant: 'default', bordered: true, class: 'border-[color:var(--andromeda-border-base)]' },
      // Glow uses accent-500 (matches the gradient peak) so the perimeter
      // blends with the fill instead of fighting it. accent-400 was too bright.
      { variant: 'glow',    bordered: true, class: 'border-[color:var(--andromeda-accent-500)]' },
    ],
    defaultVariants: {
      variant: 'default',
      bordered: false,
    },
  },
);

/**
 * @typedef {object} CardProps
 * @property {'default'|'glow'} [variant='default']
 * @property {boolean} [bordered=false] Toggle a continuous 1px border. Off by default. Andromeda cards rely on corner brackets, not perimeter strokes.
 * @property {boolean} [markers=true] Toggle the corner markers motif.
 * @property {import('./CornerMarkers').CornerMarkersProps} [markerProps] Pass-through overrides for the inner CornerMarkers.
 * @property {React.ReactNode} [children]
 * @property {string} [className]
 * @property {React.CSSProperties} [style]
 */

export type CardProps = ComponentPropsWithoutRef<'div'> &
  VariantProps<typeof cardVariants> & {
    markers?: boolean;
    markerProps?: CornerMarkersProps;
    children?: ReactNode;
  };

/** @type {React.ForwardRefExoticComponent<CardProps & React.HTMLAttributes<HTMLDivElement>>} */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant = 'default', bordered = false, markers = true, markerProps, children, style, ...props },
  ref,
) {
  // EITHER a perimeter border OR corner markers, never both.
  const showMarkers = markers && !bordered;
  return (
    <div
      ref={ref}
      data-slot="card"
      className={cn(cardVariants({ variant, bordered }), className)}
      style={{ ...andromedaVars(), ...style }}
      {...props}
    >
      {showMarkers ? <CornerMarkers {...markerProps} /> : null}
      {children}
    </div>
  );
});

/**
 * @typedef {object} CardSectionProps
 * @property {React.ReactNode} [children]
 * @property {string} [className]
 * @property {React.CSSProperties} [style]
 */

export type CardSectionProps = ComponentPropsWithoutRef<'div'>;

/** @type {React.ForwardRefExoticComponent<CardSectionProps & React.HTMLAttributes<HTMLDivElement>>} */
export const CardHeader = forwardRef<HTMLDivElement, CardSectionProps>(function CardHeader(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn(
        'relative',
        'flex items-center justify-between gap-[var(--andromeda-3)]',
        'px-[var(--andromeda-3)] py-[var(--andromeda-3)]',
        // Inset divider via ::after — left/right match the section padding
        // so the line stops short of the card's vertical edges.
        'after:content-[""] after:absolute after:bottom-0',
        'after:left-[var(--andromeda-3)] after:right-[var(--andromeda-3)]',
        'after:h-[var(--andromeda-border-width,1px)] after:bg-[color:var(--andromeda-border-subtle)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

/** @type {React.ForwardRefExoticComponent<CardSectionProps & React.HTMLAttributes<HTMLDivElement>>} */
export const CardContent = forwardRef<HTMLDivElement, CardSectionProps>(function CardContent(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn('p-[var(--andromeda-3)]', className)}
      {...props}
    >
      {children}
    </div>
  );
});

/** @type {React.ForwardRefExoticComponent<CardSectionProps & React.HTMLAttributes<HTMLDivElement>>} */
export const CardFooter = forwardRef<HTMLDivElement, CardSectionProps>(function CardFooter(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn(
        'relative',
        'flex items-center gap-[var(--andromeda-3)]',
        'px-[var(--andromeda-3)] py-[var(--andromeda-3)]',
        // Inset divider via ::before — left/right match the section padding
        // so the line stops short of the card's vertical edges.
        'before:content-[""] before:absolute before:top-0',
        'before:left-[var(--andromeda-3)] before:right-[var(--andromeda-3)]',
        'before:h-[var(--andromeda-border-width,1px)] before:bg-[color:var(--andromeda-border-subtle)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

/** @type {React.ForwardRefExoticComponent<{ children?: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLHeadingElement>>} */
export const CardTitle = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<'h3'>>(function CardTitle(
  { className, children, ...props },
  ref,
) {
  return (
    <h3
      ref={ref}
      data-slot="card-title"
      className={cn(
        '[font-family:var(--andromeda-font-mono)]',
        'text-[length:var(--andromeda-text-sm)]',
        'font-[number:var(--andromeda-weight-medium)]',
        'uppercase [letter-spacing:var(--andromeda-tracking-wider)]',
        'text-[color:var(--andromeda-text-primary)]',
        'm-0',
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
});

/** @type {React.ForwardRefExoticComponent<{ children?: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLParagraphElement>>} */
export const CardDescription = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<'p'>>(function CardDescription(
  { className, children, ...props },
  ref,
) {
  return (
    <p
      ref={ref}
      data-slot="card-description"
      className={cn(
        '[font-family:var(--andromeda-font-sans)]',
        'text-[length:var(--andromeda-text-xs)]',
        'text-[color:var(--andromeda-text-secondary)]',
        'm-0',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
});

export { cardVariants };
