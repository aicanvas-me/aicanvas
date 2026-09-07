// ============================================================
// COMPONENT: SearchField
// Command-bar-style search input with an optional ⌘-K shortcut chip.
// Five states: idle, hover, focus (selected), text-inactive (placeholder),
// text-active (typed). All values resolve through tokens.ts — see
// the Andromeda interaction-states rules for the model.
// ============================================================

'use client';

import { forwardRef, useState } from 'react';
import type { ChangeEvent, ComponentPropsWithoutRef, CSSProperties } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { tokens } from '../tokens';
import { andromedaVars, themeColor } from './lib/utils';

/**
 * @typedef {object} SearchFieldProps
 * @property {string} [placeholder='Search anything'] Text shown when empty. Defaults to "Search anything".
 * @property {string|null} [shortcut='⌘ K'] Keyboard shortcut chip. Pass null to hide. Defaults to "⌘ K".
 * @property {React.ComponentType<{ size?: number, weight?: string, color?: string, style?: React.CSSProperties }>} [icon=MagnifyingGlass] Phosphor-style leading icon. Defaults to MagnifyingGlass. Pass null to hide.
 * @property {string} [value] Controlled value.
 * @property {string} [defaultValue] Uncontrolled initial value.
 * @property {(next: string) => void} [onValueChange] Called when typed value changes.
 * @property {string} [ariaLabel] Accessible label for the input. Defaults to placeholder.
 * @property {string} [className] Class name forwarded to the outer wrapper.
 * @property {React.CSSProperties} [style] Style merged into the outer wrapper (lets the parent set width).
 * @property {boolean} [disabled] Disables the field: dims it to the disabled opacity, shows a not-allowed cursor, and disables the underlying input.
 */

type SearchFieldOwnProps = {
  placeholder?: string;
  shortcut?: string | null;
  icon?: PhosphorIcon | null;
  value?: string;
  defaultValue?: string;
  onValueChange?: (next: string) => void;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
};

export type SearchFieldProps = SearchFieldOwnProps &
  Omit<ComponentPropsWithoutRef<'input'>, keyof SearchFieldOwnProps | 'onChange'>;

/** @type {React.ForwardRefExoticComponent<SearchFieldProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'>>} */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  {
    placeholder = 'Search anything',
    shortcut = '⌘ K',
    icon: Icon = MagnifyingGlass,
    value: controlledValue,
    defaultValue = '',
    onValueChange,
    ariaLabel,
    className,
    style,
    disabled,
    ...rest
  },
  ref,
) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  const hasText = (value ?? '').length > 0;

  const [isHover, setIsHover] = useState(false);
  const [isFocus, setIsFocus] = useState(false);

  // State cascade: focus (selected) > hover > idle. Var-with-fallback so a
  // theme override (e.g. a blue accent) reaches the focus border, matching
  // the focus ring below — not a baked literal that stays the old accent.
  const borderColor = isFocus
    ? 'var(--andromeda-accent-400, #109380)'
    : isHover
    ? 'var(--andromeda-border-bright, #5B5B5C)'
    : 'var(--andromeda-border-base, #3E3E3F)';

  const background = isHover && !isFocus
    ? 'var(--andromeda-surface-hover, #1C1C1D)'
    : 'var(--andromeda-surface-raised, #141415)';

  const boxShadow = isFocus
    ? '0 0 0 var(--andromeda-border-width, 1px) var(--andromeda-accent-400, #109380), 0 0 var(--andromeda-glow, 8px) var(--andromeda-accent-500, #126059)'
    : 'none';

  // Icon brightens when the user engages — focus or typed.
  const iconColor = isFocus || hasText
    ? 'var(--andromeda-text-primary, #F5F5F5)'
    : 'var(--andromeda-text-muted, #9A9A9A)';

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if (!isControlled) setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return (
    <div
      className={className}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        ...andromedaVars(),
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[3],
        width: '100%',
        // border-box so the horizontal padding stays INSIDE the 100% width —
        // without it a full-width field overflows its container by the padding
        // and forces horizontal page scroll on a phone.
        boxSizing: 'border-box',
        padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
        border: `${tokens.border.thin} ${borderColor}`,
        borderRadius: tokens.radius.frame,
        background,
        boxShadow,
        opacity: disabled ? 'var(--andromeda-opacity-disabled, 0.4)' : 1,
        cursor: disabled ? 'not-allowed' : 'text',
        transition: [
          `border-color ${tokens.motion.duration.normal} ${tokens.motion.easing.out}`,
          `background-color ${tokens.motion.duration.normal} ${tokens.motion.easing.out}`,
          `box-shadow ${tokens.motion.duration.fast} ${tokens.motion.easing.out}`,
        ].join(', '),
        ...style,
      }}
    >
      {Icon ? (
        <Icon
          size={14}
          weight="regular"
          style={{
            flexShrink: 0,
            // Phosphor renders fill="currentColor"; CSS color lets the var resolve.
            color: iconColor,
            transition: `color ${tokens.motion.duration.normal} ${tokens.motion.easing.out}`,
          }}
        />
      ) : null}

      {/* Input + placeholder overlay. The overlay avoids the ::placeholder
          pseudo, which can't be set via inline styles. */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {!hasText ? (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.md,
              color: themeColor.text.muted,
              letterSpacing: tokens.typography.tracking.wide,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {placeholder}
          </span>
        ) : null}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocus(true)}
          onBlur={() => {
            setIsFocus(false);
            setIsHover(false);
          }}
          aria-label={ariaLabel ?? placeholder}
          disabled={disabled}
          {...rest}
          style={{
            display: 'block',
            width: '100%',
            padding: 0,
            margin: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.md,
            color: themeColor.text.primary,
            letterSpacing: tokens.typography.tracking.wide,
            caretColor: 'var(--andromeda-accent-400, #109380)',
          }}
        />
      </div>

      {shortcut ? (
        <span
          aria-hidden="true"
          style={{
            flexShrink: 0,
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: themeColor.text.faint,
            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
            border: `${tokens.border.thin} ${themeColor.border.subtle}`,
            borderRadius: tokens.radius.frame,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.widest,
          }}
        >
          {shortcut}
        </span>
      ) : null}
    </div>
  );
});

export default SearchField;
