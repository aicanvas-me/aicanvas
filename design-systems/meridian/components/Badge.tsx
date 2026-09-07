// ============================================================
// COMPONENT: Badge
// variants: default | success | warning | error | info | purple
// ============================================================

import type { ReactNode } from 'react';
import { tokens } from '../tokens';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';

export type BadgeProps = {
  variant?: BadgeVariant;
  children?: ReactNode;
};

export function Badge({ variant = 'default', children }: BadgeProps) {
  const variantStyles = {
    default: { bg: tokens.color.neutral[40],   color: tokens.color.neutral[90]   },
    success: { bg: tokens.color.success[10],   color: tokens.color.success[50]   },
    warning: { bg: tokens.color.warning[10],   color: tokens.color.warning[50]   },
    error:   { bg: tokens.color.error[10],     color: tokens.color.error[50]     },
    info:    { bg: tokens.color.info[10],      color: tokens.color.info[50]      },
    purple:  { bg: tokens.color.purple[10],    color: tokens.color.purple[50]    },
  };

  const { bg, color } = variantStyles[variant] || variantStyles.default;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: `2px ${tokens.spacing[2]}`,
      borderRadius: '99px',
      background: bg,
      color,
      fontSize: tokens.typography.size.xs,
      fontWeight: tokens.typography.weight.semibold,
      fontFamily: tokens.typography.fontFamily,
      lineHeight: tokens.typography.lineHeight.normal,
      whiteSpace: 'nowrap',
      letterSpacing: '0.1px',
    }}>
      {children}
    </span>
  );
}
