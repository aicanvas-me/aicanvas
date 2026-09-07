// ============================================================
// COMPONENT: ProgressBar
// colorVariants: primary | success | warning | error | purple
// ============================================================

import type { ReactNode } from 'react';
import { tokens } from '../tokens';

export type ProgressBarColorVariant = 'primary' | 'success' | 'warning' | 'error' | 'purple';

export type ProgressBarProps = {
  label?: ReactNode;
  value: number;
  colorVariant?: ProgressBarColorVariant;
};

export function ProgressBar({ label, value, colorVariant = 'primary' }: ProgressBarProps) {
  const fillColors = {
    primary: tokens.color.primary[50],
    success: tokens.color.success[50],
    warning: tokens.color.warning[50],
    error:   tokens.color.error[50],
    purple:  tokens.color.purple[50],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
      {label && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.size.sm,
          color: tokens.color.neutral[80],
        }}>
          <span>{label}</span>
          <span style={{ fontWeight: tokens.typography.weight.semibold }}>{value}%</span>
        </div>
      )}
      <div style={{
        height: '6px',
        background: tokens.color.neutral[40],
        borderRadius: '99px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: fillColors[colorVariant] || fillColors.primary,
          borderRadius: '99px',
          transition: 'width 0.35s ease',
        }} />
      </div>
    </div>
  );
}
