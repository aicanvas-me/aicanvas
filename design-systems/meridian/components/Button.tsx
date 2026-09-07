// ============================================================
// COMPONENT: Button
// variants: primary | secondary | subtle | ghost
// sizes:    sm | md | lg
// ============================================================

import { useState } from 'react';
import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { tokens } from '../tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

export function Button({ variant = 'primary', size = 'md', icon: Icon, children, onClick, disabled }: ButtonProps) {
  const [hovered, setHovered] = useState(false);

  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    fontFamily: tokens.typography.fontFamily,
    fontWeight: tokens.typography.weight.semibold,
    borderRadius: tokens.radius.md,
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.12s ease',
    opacity: disabled ? 0.4 : 1,
    lineHeight: tokens.typography.lineHeight.tight,
    whiteSpace: 'nowrap',
  };

  const sizeStyles = {
    sm: { padding: `3px ${tokens.spacing[2]}`,  fontSize: tokens.typography.size.sm },
    md: { padding: `6px ${tokens.spacing[3]}`,  fontSize: tokens.typography.size.md },
    lg: { padding: `9px ${tokens.spacing[4]}`,  fontSize: tokens.typography.size.lg },
  };

  const variantStyles = {
    primary: {
      background:  hovered ? tokens.color.primary[60] : tokens.color.primary[50],
      color:       tokens.color.neutral[0],
      borderColor: hovered ? tokens.color.primary[60] : tokens.color.primary[50],
    },
    secondary: {
      background:  hovered ? tokens.color.neutral[40] : tokens.color.neutral[30],
      color:       tokens.color.neutral[100],
      borderColor: tokens.color.neutral[60],
    },
    subtle: {
      background:  hovered ? tokens.color.primary[10] : 'transparent',
      color:       tokens.color.primary[50],
      borderColor: 'transparent',
    },
    ghost: {
      background:  hovered ? tokens.color.neutral[30] : 'transparent',
      color:       tokens.color.neutral[80],
      borderColor: 'transparent',
    },
  };

  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

  return (
    <button
      style={{ ...baseStyle, ...sizeStyles[size], ...variantStyles[variant] }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon size={iconSize} />}
      {children}
    </button>
  );
}
