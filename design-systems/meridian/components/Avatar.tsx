// ============================================================
// COMPONENT: Avatar
// sizes: sm | md | lg
// status: online | away | busy | offline
// ============================================================

import { tokens } from '../tokens';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';

export type AvatarProps = {
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
};

const avatarColorPool = [
  { bg: tokens.color.primary[20],  color: tokens.color.primary[70]  },
  { bg: tokens.color.success[10],  color: tokens.color.success[60]  },
  { bg: tokens.color.purple[10],   color: tokens.color.purple[60]   },
  { bg: tokens.color.teal[10],     color: tokens.color.teal[60]     },
  { bg: tokens.color.warning[10],  color: tokens.color.warning[60]  },
];

export function pickAvatarColor(name: string) {
  return avatarColorPool[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % avatarColorPool.length];
}

export function Avatar({ name = '?', size = 'md', status }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const { bg, color } = pickAvatarColor(name);

  const sizeDimensions = {
    sm: { width: '24px', height: '24px', fontSize: tokens.typography.size.xs },
    md: { width: '32px', height: '32px', fontSize: tokens.typography.size.sm },
    lg: { width: '40px', height: '40px', fontSize: tokens.typography.size.md },
  };

  const statusColors = {
    online:  tokens.color.success[50],
    away:    tokens.color.warning[50],
    busy:    tokens.color.error[50],
    offline: tokens.color.neutral[60],
  };

  const dotSize = size === 'lg' ? '10px' : '8px';

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <div style={{
        ...sizeDimensions[size],
        borderRadius: '50%',
        background: bg,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: tokens.typography.fontFamily,
        fontWeight: tokens.typography.weight.semibold,
        userSelect: 'none',
        flexShrink: 0,
      }}>
        {initials}
      </div>
      {status && (
        <div style={{
          position: 'absolute',
          bottom: '-1px',
          right: '-1px',
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          background: statusColors[status] || statusColors.offline,
          border: `2px solid ${tokens.color.neutral[0]}`,
        }} />
      )}
    </div>
  );
}
