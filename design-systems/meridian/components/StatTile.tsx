// ============================================================
// COMPONENT: StatTile
// ============================================================

import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { tokens } from '../tokens';
import { Card } from './Card';

export type StatTileColorVariant = 'primary' | 'success' | 'warning' | 'purple' | 'teal';

export type StatTileProps = {
  label?: ReactNode;
  value?: ReactNode;
  delta: number;
  deltaLabel?: ReactNode;
  icon?: LucideIcon;
  colorVariant?: StatTileColorVariant;
};

export function StatTile({ label, value, delta, deltaLabel, icon: Icon, colorVariant = 'primary' }: StatTileProps) {
  const isPositive = delta >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? tokens.color.success[50] : tokens.color.error[50];

  const iconTheme = {
    primary: { bg: tokens.color.primary[20],  fg: tokens.color.primary[50]  },
    success: { bg: tokens.color.success[10],  fg: tokens.color.success[50]  },
    warning: { bg: tokens.color.warning[10],  fg: tokens.color.warning[50]  },
    purple:  { bg: tokens.color.purple[10],   fg: tokens.color.purple[50]   },
    teal:    { bg: tokens.color.teal[10],     fg: tokens.color.teal[50]     },
  };

  const { bg: iconBg, fg: iconFg } = iconTheme[colorVariant] || iconTheme.primary;

  return (
    <Card style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.size.sm,
            fontWeight: tokens.typography.weight.medium,
            color: tokens.color.neutral[70],
          }}>
            {label}
          </span>
          {Icon && (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: tokens.radius.lg,
              background: iconBg,
              color: iconFg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={15} />
            </div>
          )}
        </div>

        {/* Large value */}
        <div style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.size['3xl'],
          fontWeight: tokens.typography.weight.bold,
          color: tokens.color.neutral[100],
          lineHeight: tokens.typography.lineHeight.tight,
          letterSpacing: '-0.5px',
        }}>
          {value}
        </div>

        {/* Trend row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
          <TrendIcon size={13} color={trendColor} />
          <span style={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.size.sm,
            color: trendColor,
            fontWeight: tokens.typography.weight.semibold,
          }}>
            {isPositive ? '+' : ''}{delta}
          </span>
          {deltaLabel && (
            <span style={{
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.size.sm,
              color: tokens.color.neutral[70],
            }}>
              {deltaLabel}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
