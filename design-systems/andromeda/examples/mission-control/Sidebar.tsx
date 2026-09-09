// ============================================================
// MISSION CONTROL: Sidebar
//
// Responsive (desktop-first — see rules.md → Responsive): the
// desktop <aside> is the canonical form; the shell hides it
// (`display:none`) below `mq.md` and serves the SAME nav content
// through the shared Drawer instead. To keep both paths in sync the
// console nav (section label + NavItem list) is factored into the
// exported `SidebarNav`, which the desktop aside and the mobile
// Drawer both render — one source of truth for the nav rows.
// ============================================================

import { motion, LayoutGroup } from 'framer-motion';
import {
  UserCircle,
  Gear,
  Keyboard,
  SignOut,
} from '@phosphor-icons/react';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import type { useCascadeProps } from '../../components/lib/motion';
import { CornerMarkers } from '../../components/CornerMarkers';
import { NavItem } from '../../components/NavItem';
import { UserCard } from '../../components/UserCard';
import type { UserMenuItem } from '../../components/UserMenu';
import { AndromedaIcon } from '../../AndromedaIcon';
import { navItems } from './data';

function InsetDivider({ side = 'bottom' }: { side?: 'top' | 'bottom' }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: tokens.spacing[3],
        right: tokens.spacing[3],
        [side]: 0,
        height: '1px',
        background: themeColor.border.subtle,
        pointerEvents: 'none',
      }}
    />
  );
}

type SidebarNavProps = {
  activeNav: string;
  onNavChange: (id: string) => void;
  layoutGroupId?: string;
};

const userMenuItems: UserMenuItem[] = [
  { id: 'profile',     label: 'Profile',             icon: UserCircle },
  { id: 'preferences', label: 'Preferences',         icon: Gear },
  { id: 'shortcuts',   label: 'Keyboard Shortcuts',  icon: Keyboard },
  { id: 'sep1',        type: 'separator' },
  { id: 'signout',     label: 'Sign Out',            icon: SignOut },
];

// Console nav — section label + NavItem list. Shared verbatim by the desktop
// sidebar and the mobile Drawer so the two never drift. LayoutGroup scopes
// NavItem's `layoutId` so the active dot slides between siblings; the desktop
// aside and the drawer get distinct group ids so a mounted-but-hidden copy
// can't fight the visible one for the shared layout animation.
export function SidebarNav({ activeNav, onNavChange, layoutGroupId = 'mission-control-sidebar' }: SidebarNavProps) {
  return (
    <>
      {/* Section label */}
      <div style={{
        padding: `${tokens.spacing[3]} ${tokens.spacing[3]} ${tokens.spacing[2]}`,
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.typography.size.xs,
        color: themeColor.text.faint,
        textTransform: 'uppercase',
        letterSpacing: tokens.typography.tracking.widest,
      }}>
        {'/// Console'}
      </div>

      <nav style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <LayoutGroup id={layoutGroupId}>
          {navItems.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeNav === item.id}
              onClick={() => onNavChange(item.id)}
            />
          ))}
        </LayoutGroup>
      </nav>
    </>
  );
}

export function Sidebar({ activeNav, onNavChange, motionProps, className }: Omit<SidebarNavProps, 'layoutGroupId'> & {
  motionProps?: ReturnType<typeof useCascadeProps>;
  className?: string;
}) {
  return (
    <motion.aside
      {...(motionProps ?? {})}
      className={className}
      style={{
        position: 'relative',
        width: tokens.layout.sidebarWidth,
        flexShrink: 0,
        background: themeColor.surface.raised,
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}
    >
      <CornerMarkers />

      {/* Logo block */}
      <div style={{
        position: 'relative',
        padding: `${tokens.spacing[6]} ${tokens.spacing[3]} ${tokens.spacing[3]}`,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[3],
      }}>
        <InsetDivider />
        <AndromedaIcon size={28} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
          <span style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: themeColor.text.primary,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.widest,
            fontWeight: tokens.typography.weight.semibold,
          }}>
            Andromeda
          </span>
          <span style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: themeColor.text.muted,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.widest,
          }}>
            Mission Control
          </span>
        </div>
      </div>

      {/* Console nav — shared with the mobile Drawer via SidebarNav. */}
      <SidebarNav activeNav={activeNav} onNavChange={onNavChange} />

      {/* User card — opens upward and stretches to the sidebar width so
          the panel sits flush. The inset divider above the card lives
          inside this wrapper so it scopes to the row. */}
      <div style={{ position: 'relative' }}>
        <InsetDivider side="top" />
        <UserCard
          name="Reza Quinn"
          role="Flight Director"
          src="https://images.unsplash.com/photo-1669287731461-bd8ce3126710?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          status="online"
          items={userMenuItems}
          placement="top"
          align="stretch"
        />
      </div>
    </motion.aside>
  );
}
