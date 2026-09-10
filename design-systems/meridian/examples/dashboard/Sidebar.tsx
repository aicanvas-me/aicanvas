// ============================================================
// DASHBOARD: Sidebar
// ============================================================

import { Hash, ChevronDown } from 'lucide-react';
import { tokens } from '../../tokens';
import { Avatar } from '../../components/Avatar';
import { NavItem } from '../../components/NavItem';
import { navItems } from './data';

export type SidebarProps = {
  activeNav: string;
  onNavChange: (id: string) => void;
};

export function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  return (
    <aside style={{
      width: tokens.layout.sidebarWidth,
      flexShrink: 0,
      background: tokens.color.neutral[0],
      borderRight: `1px solid ${tokens.color.neutral[50]}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: `${tokens.spacing[6]} ${tokens.spacing[4]} ${tokens.spacing[4]}`,
        borderBottom: `1px solid ${tokens.color.neutral[40]}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: tokens.radius.lg,
            background: tokens.color.primary[50],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Hash size={15} color={tokens.color.neutral[0]} strokeWidth={2.5} />
          </div>
          <span style={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.size.lg,
            fontWeight: tokens.typography.weight.bold,
            color: tokens.color.neutral[100],
            letterSpacing: '-0.3px',
          }}>
            Meridian
          </span>
        </div>
      </div>

      {/* Navigation links */}
      <nav style={{
        flex: 1,
        padding: tokens.spacing[3],
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[1],
        overflowY: 'auto',
      }}>
        {navItems.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeNav === item.id}
            onClick={() => onNavChange(item.id)}
          />
        ))}
      </nav>

      {/* User card at bottom */}
      <div style={{
        padding: tokens.spacing[3],
        borderTop: `1px solid ${tokens.color.neutral[40]}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: tokens.spacing[2],
          borderRadius: tokens.radius.md,
          cursor: 'pointer',
        }}>
          <Avatar name="Alex Kim" size="md" status="online" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.size.sm,
              fontWeight: tokens.typography.weight.semibold,
              color: tokens.color.neutral[100],
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              Alex Kim
            </div>
            <div style={{
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.size.xs,
              color: tokens.color.neutral[70],
            }}>
              Product Lead
            </div>
          </div>
          <ChevronDown size={13} color={tokens.color.neutral[70]} />
        </div>
      </div>
    </aside>
  );
}
