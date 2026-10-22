'use client';

import { forwardRef, useId, useState } from 'react';
import type { ChangeEvent, ComponentPropsWithoutRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn, andromedaVars } from './lib/utils';
import { mq } from './lib/responsive';

// Touch screens: the hidden input grows to 40px; !important beats its base classes.
const TOUCH_TARGET_STYLE = `
  ${mq.coarse} {
    .andromeda-toggle-touch {
      inset: auto !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      width: var(--andromeda-10) !important;
      height: var(--andromeda-10) !important;
    }
  }
`;

const trackVariants = cva(
  [
    'relative inline-flex items-center shrink-0',
    // Track, border, thumb size and offsets are coupled: change them together.
    'w-[34px] h-[18px]',
    'border-[length:var(--andromeda-border-width,1px)] border-solid',
    'rounded-[var(--andromeda-radius-frame,0px)]',
    'transition-[background-color,border-color,box-shadow] [transition-duration:var(--andromeda-duration-slow)] [transition-timing-function:var(--andromeda-easing-out)]',
    'cursor-pointer',
    'peer-focus-visible:shadow-[0_0_0_1px_var(--andromeda-accent-400),0_0_8px_var(--andromeda-accent-500)]',
  ],
  {
    variants: {
      state: {
        off: [
          'bg-[color:var(--andromeda-surface-raised)]',
          'border-[color:var(--andromeda-border-base)]',
          'hover:border-[color:var(--andromeda-border-bright)]',
        ],
        on: [
          'bg-[color:var(--andromeda-accent-500)]',
          'border-[color:var(--andromeda-accent-300)]',
          'hover:border-[color:var(--andromeda-accent-100)]',
        ],
      },
      disabled: {
        true:  'opacity-[var(--andromeda-opacity-disabled)] pointer-events-none cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      state: 'off',
      disabled: false,
    },
  },
);

const thumbVariants = cva(
  [
    'absolute top-[2px]',
    'w-[12px] h-[12px]',
    'rounded-[var(--andromeda-radius-frame,0px)]',
    'transition-[left,background-color,transform] [transition-duration:var(--andromeda-duration-slow)] [transition-timing-function:var(--andromeda-easing-out)]',
  ],
  {
    variants: {
      state: {
        off: 'left-[2px] bg-[color:var(--andromeda-text-muted)]',
        on:  'left-[18px] bg-[color:var(--andromeda-accent-300)] shadow-[0_0_8px_var(--andromeda-accent-500)]',
      },
    },
    defaultVariants: { state: 'off' },
  },
);

const labelClass = cn(
  '[font-family:var(--andromeda-font-mono)]',
  'text-[length:var(--andromeda-text-sm)]',
  'font-[number:var(--andromeda-weight-medium)]',
  'uppercase [letter-spacing:var(--andromeda-tracking-wide)]',
  'text-[color:var(--andromeda-text-secondary)]',
  'select-none cursor-pointer',
);

/**
 * @typedef {object} ToggleProps
 * @property {boolean} [checked] Controlled checked state; supplying it puts the switch in controlled mode.
 * @property {boolean} [defaultChecked=false] Initial checked state when uncontrolled.
 * @property {(next: boolean) => void} [onCheckedChange] Handler called with the next checked state whenever the switch toggles.
 * @property {string}  [label] Optional text rendered beside the switch and linked to it via htmlFor.
 * @property {boolean} [disabled=false] Disables interaction and dims the switch.
 * @property {string}  [className] Extra classes merged onto the visual track.
 * @property {React.CSSProperties} [style] Inline styles merged onto the wrapper element.
 * @property {string}  [id] Id for the input; falls back to a generated id and links the label.
 */

type ToggleProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'onChange' | 'type' | 'checked' | 'defaultChecked'
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (next: boolean) => void;
  label?: string;
};

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  {
    className,
    checked: controlledChecked,
    defaultChecked = false,
    onCheckedChange,
    label,
    disabled = false,
    id: idProp,
    style,
    ...props
  },
  ref,
) {
  const reactId = useId();
  const id = idProp ?? `andromeda-toggle-${reactId}`;
  const isControlled = controlledChecked !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const checked = isControlled ? controlledChecked : internal;
  const state = checked ? 'on' : 'off';

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.checked;
    if (!isControlled) setInternal(next);
    onCheckedChange?.(next);
  }

  return (
    <div
      className="inline-flex items-center gap-[var(--andromeda-3)]"
      style={{ ...andromedaVars(), ...style }}
    >
      <span className="relative inline-flex">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          // z-10 lets clicks reach the input; keep the input before the track for the focus ring.
          className="andromeda-toggle-touch peer absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(trackVariants({ state, disabled }), className)}
        >
          <span className={thumbVariants({ state })} />
        </span>
      </span>
      {label ? (
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
      ) : null}
      <style>{TOUCH_TARGET_STYLE}</style>
    </div>
  );
});

export { trackVariants as toggleTrackVariants, thumbVariants as toggleThumbVariants };
