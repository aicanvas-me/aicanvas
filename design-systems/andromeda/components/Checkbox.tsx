// ============================================================
// COMPONENT: Checkbox
// shadcn/ui-aligned API: forwardRef, controlled (`checked`) or
// uncontrolled (`defaultChecked`), `onCheckedChange` callback,
// optional inline `label`. Square box, sharp corners, accent
// fill on checked, full hover/focus/disabled coverage.
// ============================================================

'use client';

import { forwardRef, useId, useState, useEffect } from 'react';
import type { ChangeEvent, ComponentPropsWithoutRef } from 'react';
import { Check } from '@phosphor-icons/react';

function useSpacePopIn() {
  useEffect(() => {
    if (document.querySelector('#andromeda-pop-in-style')) return;
    const style = document.createElement('style');
    style.id = 'andromeda-pop-in-style';
    style.textContent = `@keyframes andromeda-pop-in{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}`;
    document.head.appendChild(style);
  }, []);
}
import { cva } from 'class-variance-authority';
import { cn, andromedaVars } from './lib/utils';
import { mq } from './lib/responsive';
import { tokens } from '../tokens';

// Touch-target expander — the visible 16px box stays its desktop size; on coarse
// pointers the invisible input (which receives the click, kept on top via z-10)
// grows to spacing[10] (40px), centered over the box. inset-0 is released so the
// input can overflow the small wrapper. Scoped className, !important to beat the
// peer/absolute base classes. the Andromeda responsive rules + the Andromeda interaction-states rules "Invisible inputs over
// visual proxies" (input must stay above the proxy — z-10 is preserved).
const TOUCH_TARGET_STYLE = `
  ${mq.coarse} {
    .andromeda-checkbox-touch {
      inset: auto !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      width: ${tokens.spacing[10]} !important;
      height: ${tokens.spacing[10]} !important;
    }
  }
`;

const boxVariants = cva(
  [
    'relative inline-flex items-center justify-center shrink-0',
    'w-[length:var(--andromeda-4)] h-[length:var(--andromeda-4)]',
    'border-[length:var(--andromeda-border-width,1px)] border-solid',
    'rounded-[var(--andromeda-radius-frame,0px)]',
    'transition-[background-color,border-color,box-shadow,transform] [transition-duration:var(--andromeda-duration-normal)] [transition-timing-function:var(--andromeda-easing-out)]',
    'cursor-pointer',
    'active:scale-[0.88]',
    'focus-visible:outline-none',
    'focus-visible:shadow-[0_0_0_1px_var(--andromeda-accent-400),0_0_8px_var(--andromeda-accent-500)]',
  ],
  {
    variants: {
      state: {
        unchecked: [
          'bg-[color:var(--andromeda-surface-raised)]',
          'border-[color:var(--andromeda-border-base)]',
          'hover:border-[color:var(--andromeda-border-bright)]',
        ],
        checked: [
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
      state: 'unchecked',
      disabled: false,
    },
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
 * @typedef {object} CheckboxProps
 * @property {boolean} [checked]               Controlled checked state.
 * @property {boolean} [defaultChecked=false]  Uncontrolled initial state.
 * @property {(next: boolean) => void} [onCheckedChange]  Handler called with the next checked state when toggled.
 * @property {string}  [label]                 Optional inline label.
 * @property {boolean} [disabled=false]        Disables the checkbox and blocks interaction.
 * @property {string}  [className]             Extra classes merged onto the visual box.
 * @property {React.CSSProperties} [style]     Inline styles applied to the outer wrapper.
 * @property {string}  [id]                    Id applied to the input and inline label, auto-generated if omitted.
 */

type CheckboxProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'onChange' | 'type' | 'checked' | 'defaultChecked'
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (next: boolean) => void;
  label?: string;
};

/** @type {React.ForwardRefExoticComponent<CheckboxProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'|'type'>>} */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
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
  useSpacePopIn();
  const reactId = useId();
  const id = idProp ?? `andromeda-checkbox-${reactId}`;
  const isControlled = controlledChecked !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const checked = isControlled ? controlledChecked : internal;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.checked;
    if (!isControlled) setInternal(next);
    onCheckedChange?.(next);
  }

  return (
    <div
      className="inline-flex items-center gap-[var(--andromeda-2)]"
      style={{ ...andromedaVars(), ...style }}
    >
      <span className="relative inline-flex">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          // z-10 keeps the invisible input on top of the visual span so
          // clicks reach the input. Both layers are positioned, so without
          // an explicit z-index the visual span paints last and swallows
          // every click — the box hovers but never toggles.
          className="andromeda-checkbox-touch peer absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            boxVariants({
              state: checked ? 'checked' : 'unchecked',
              disabled,
            }),
            // Sync focus ring with the hidden native input.
            'peer-focus-visible:shadow-[0_0_0_1px_var(--andromeda-accent-400),0_0_8px_var(--andromeda-accent-500)]',
            className,
          )}
        >
          {checked ? (
            <Check
              size={12}
              weight="light"
              style={{
                color: 'var(--andromeda-accent-on, var(--andromeda-accent-100))',
                animation: `andromeda-pop-in var(--andromeda-duration-normal, ${tokens.motion.duration.normal}) var(--andromeda-easing-out, ${tokens.motion.easing.out})`,
              }}
            />
          ) : null}
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

export { boxVariants as checkboxVariants };
