// ============================================================
// COMPONENT: Tag
// ============================================================

import { X } from 'lucide-react';
import type { MouseEventHandler, ReactNode } from 'react';
import { tokens } from '../tokens';

export type TagProps = {
  children?: ReactNode;
  onClose?: MouseEventHandler<HTMLButtonElement>;
};

export function Tag({ children, onClose }: TagProps) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing[1],
      padding: `2px ${tokens.spacing[2]}`,
      background: tokens.color.neutral[30],
      color: tokens.color.neutral[90],
      border: `1px solid ${tokens.color.neutral[50]}`,
      borderRadius: tokens.radius.md,
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.size.sm,
      fontWeight: tokens.typography.weight.medium,
    }}>
      {children}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            color: tokens.color.neutral[70],
            lineHeight: 1,
          }}
        >
          <X size={11} />
        </button>
      )}
    </span>
  );
}
