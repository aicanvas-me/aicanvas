// @ts-nocheck — design-systems/ is not type-checked (see design-systems/CLAUDE.md). Strip this after a proper typing pass.
// ============================================================
// COMPONENT: Input
// shadcn/ui-aligned API: className, ref, ...props passthrough.
// label + optional left icon + error state.
// Border transitions border.base → border.bright on focus.
// Error state recolors border + ring + helper text in fault.
// ============================================================

'use client';

import { forwardRef, useId } from 'react';
import { cva } from 'class-variance-authority';
import { cn, andromedaVars } from './lib/utils';

const inputVariants = cva(
  [
    'block w-full box-border',
    'border-[length:var(--andromeda-border-width,1px)] border-solid',
    'rounded-[var(--andromeda-radius-frame,0px)]',
    '[font-family:var(--andromeda-font-sans)]',
    'text-[length:var(--andromeda-text-md)]',
    'text-[color:var(--andromeda-text-primary)]',
    'bg-[color:var(--andromeda-surface-raised)]',
    'outline-none',
    'transition-[border-color,box-shadow] [transition-duration:var(--andromeda-duration-normal)] [transition-timing-function:var(--andromeda-easing-out)]',
    'placeholder:text-[color:var(--andromeda-text-muted)]',
    'disabled:opacity-[var(--andromeda-opacity-disabled)] disabled:cursor-not-allowed',
  ],
  {
    variants: {
      hasIcon: {
        // 9px vertical padding is a deliberate off-grid optical value, no token
        true:  'pl-[var(--andromeda-8,32px)] pr-[var(--andromeda-3)] py-[9px]',
        false: 'px-[var(--andromeda-3)] py-[9px]',
      },
      state: {
        default: [
          'border-[color:var(--andromeda-border-base)]',
          'hover:border-[color:var(--andromeda-border-bright)]',
          'focus:border-[color:var(--andromeda-accent-400)]',
          'focus-visible:shadow-[0_0_0_1px_var(--andromeda-accent-400),0_0_8px_var(--andromeda-accent-500)]',
        ],
        error: [
          'border-[color:var(--andromeda-red-300)]',
          'focus:border-[color:var(--andromeda-red-300)]',
          'focus-visible:shadow-[0_0_0_1px_var(--andromeda-red-300),0_0_8px_var(--andromeda-red-400)]',
        ],
      },
    },
    defaultVariants: {
      hasIcon: false,
      state: 'default',
    },
  },
);

/**
 * @typedef {object} InputProps
 * @property {string} [label] Uppercase mono label rendered above the field.
 * @property {React.ComponentType<{ size?: number, strokeWidth?: number }>} [icon] Optional left icon.
 * @property {string} [error] When set, switches the field into the error state and renders the message.
 * @property {string} [className] Class name forwarded to the <input> element.
 * @property {string} [wrapperClassName] Class name forwarded to the outer wrapper.
 */

/** @type {React.ForwardRefExoticComponent<InputProps & React.InputHTMLAttributes<HTMLInputElement>>} */
export const Input = forwardRef(function Input(
  {
    className,
    wrapperClassName,
    label,
    icon: Icon,
    error,
    id: idProp,
    style,
    disabled,
    ...props
  },
  ref,
) {
  const reactId = useId();
  const id = idProp ?? `andromeda-input-${reactId}`;
  const errorId = error ? `${id}-error` : undefined;
  const hasIcon = Boolean(Icon);
  const state = error ? 'error' : 'default';

  return (
    <div
      className={cn('flex flex-col gap-[var(--andromeda-2)]', wrapperClassName)}
      style={{ ...andromedaVars(), ...style }}
    >
      {label ? (
        <label
          htmlFor={id}
          className={cn(
            '[font-family:var(--andromeda-font-mono)]',
            'text-[length:var(--andromeda-text-xs)]',
            'font-[number:var(--andromeda-weight-medium)]',
            'uppercase [letter-spacing:var(--andromeda-tracking-wider)]',
            'text-[color:var(--andromeda-text-secondary)]',
          )}
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        {Icon ? (
          <div
            aria-hidden="true"
            className={cn(
              'absolute left-[var(--andromeda-3)] top-1/2 -translate-y-1/2',
              'flex items-center pointer-events-none',
              'text-[color:var(--andromeda-text-muted)]',
            )}
          >
            <Icon size={20} weight="regular" />
          </div>
        ) : null}

        <input
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
          disabled={disabled}
          className={cn(inputVariants({ hasIcon, state }), className)}
          {...props}
        />
      </div>

      {error ? (
        <span
          id={errorId}
          role="alert"
          className={cn(
            '[font-family:var(--andromeda-font-mono)]',
            'text-[length:var(--andromeda-text-xs)]',
            'text-[color:var(--andromeda-red-300)]',
            'uppercase [letter-spacing:var(--andromeda-tracking-wide)]',
          )}
        >
          {error}
        </span>
      ) : null}
    </div>
  );
});

export { inputVariants };
