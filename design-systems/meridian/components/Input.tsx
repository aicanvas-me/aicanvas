// ============================================================
// COMPONENT: Input
// ============================================================

import { useState } from 'react';
import type { ChangeEventHandler, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { tokens } from '../tokens';

export type InputProps = {
  label?: ReactNode;
  placeholder?: string;
  icon?: LucideIcon;
  error?: ReactNode;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

export function Input({ label, placeholder, icon: Icon, error, value, onChange }: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? tokens.color.error[50]
    : focused
      ? tokens.color.primary[50]
      : tokens.color.neutral[60];

  const boxShadow = focused
    ? `0 0 0 1px ${error ? tokens.color.error[50] : tokens.color.primary[50]}`
    : 'none';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
      {label && (
        <label style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.size.sm,
          fontWeight: tokens.typography.weight.medium,
          color: tokens.color.neutral[90],
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: tokens.spacing[2],
            top: '50%',
            transform: 'translateY(-50%)',
            color: tokens.color.neutral[70],
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}>
            <Icon size={14} />
          </div>
        )}
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: Icon
              ? `7px ${tokens.spacing[3]} 7px 30px`
              : `7px ${tokens.spacing[3]}`,
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.size.md,
            color: tokens.color.neutral[100],
            background: tokens.color.neutral[0],
            border: `1px solid ${borderColor}`,
            borderRadius: tokens.radius.md,
            outline: 'none',
            transition: 'border-color 0.1s ease, box-shadow 0.1s ease',
            boxShadow,
          }}
        />
      </div>
      {error && (
        <span style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.size.xs,
          color: tokens.color.error[50],
        }}>
          {error}
        </span>
      )}
    </div>
  );
}
