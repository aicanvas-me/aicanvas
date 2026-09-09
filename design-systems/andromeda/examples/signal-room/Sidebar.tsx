// ============================================================
// SIGNAL ROOM: Sidebar
// Console nav + pinned channels list + user card. Mirrors the
// mission-control sidebar so the system reads as one family;
// the lower "pinned channels" rail replaces the playlists rail
// in the Spotify reference.
//
// Responsive (desktop-first — see rules.md → Responsive): the
// desktop <aside> is the canonical form; the shell hides it
// (`display:none`) below `mq.md` and serves the SAME nav content
// through the shared Drawer instead. To keep both paths in sync the
// console nav (section label + NavItem list + channels rail) is
// factored into the exported `SidebarNav`, which the desktop aside
// and the mobile Drawer both render — one source of truth.
// ============================================================

import { motion, LayoutGroup } from 'framer-motion';
import type { MotionProps } from 'framer-motion';
import {
  UserCircle,
  Gear,
  Keyboard,
  SignOut,
} from '@phosphor-icons/react';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { CornerMarkers } from '../../components/CornerMarkers';
import { NavItem } from '../../components/NavItem';
import type { UserMenuItem } from '../../components/UserMenu';
import { UserCard } from '../../components/UserCard';
import { AndromedaIcon } from '../../AndromedaIcon';
import { navItems, channels } from './data';
import type { Channel } from './data';

function InsetDivider({ side = 'bottom' }: { side?: 'top' | 'bottom' }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: tokens.spacing[3],
        right: tokens.spacing[3],
        [side]: 0,
        height: 'var(--andromeda-border-width, 1px)',
        background: themeColor.border.subtle,
        pointerEvents: 'none',
      }}
    />
  );
}

const userMenuItems: UserMenuItem[] = [
  { id: 'profile',     label: 'Profile',             icon: UserCircle },
  { id: 'preferences', label: 'Preferences',         icon: Gear },
  { id: 'shortcuts',   label: 'Keyboard Shortcuts',  icon: Keyboard },
  { id: 'sep1',        type: 'separator' },
  { id: 'signout',     label: 'Sign Out',            icon: SignOut },
];

// Channel status → dot colour. The square dot is a live measurement of the
// channel's signal (accent = live, orange = hot, red = offline), the one place
// colour is allowed on the rail. Unknown status falls back to a neutral pale dot.
const STATUS_DOT = {
  nominal: themeColor.accent[300],
  caution: themeColor.orange[300],
  fault:   themeColor.red[300],
};

function ChannelRow({ ch }: { ch: Channel }) {
  const dot = STATUS_DOT[ch.status] ?? themeColor.text.muted;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[2],
        padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
        cursor: 'pointer',
      }}
    >
      {/* Mono icon square — square corners, hairline border, holds the
          channel's status dot (its only colour). */}
      <div
        style={{
          width: '24px',
          height: '24px',
          flexShrink: 0,
          border: `${tokens.border.thin} ${themeColor.border.subtle}`,
          borderRadius: tokens.radius.frame,
          background: themeColor.surface.overlay,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          aria-hidden
          style={{
            width: '6px',
            height: '6px',
            background: dot,
            borderRadius: tokens.radius.frame,
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
        <span
          style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: themeColor.text.primary,
            letterSpacing: tokens.typography.tracking.wide,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {ch.name}
        </span>
        <span
          style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: themeColor.text.faint,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.widest,
          }}
        >
          {ch.code} · {ch.tracks} TRACKS
        </span>
      </div>
    </div>
  );
}

// Console nav + channels rail — section labels, the NavItem list, and the
// pinned-channels list. Shared verbatim by the desktop sidebar and the mobile
// Drawer so the two never drift. LayoutGroup scopes NavItem's `layoutId` so the
// active dot slides between siblings; the desktop aside and the drawer get
// distinct group ids so a mounted-but-hidden copy can't fight the visible one
// for the shared layout animation.
type SidebarNavProps = {
  activeNav: string;
  onNavChange: (id: string) => void;
  layoutGroupId?: string;
};

export function SidebarNav({ activeNav, onNavChange, layoutGroupId = 'signal-room-sidebar' }: SidebarNavProps) {
  return (
    <>
      {/* Section label */}
      <div
        style={{
          padding: `${tokens.spacing[3]} ${tokens.spacing[3]} ${tokens.spacing[2]}`,
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.xs,
          color: themeColor.text.faint,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.widest,
        }}
      >
        {'/// Console'}
      </div>

      {/* Primary nav */}
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
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

      {/* Channels rail */}
      <div
        style={{
          position: 'relative',
          marginTop: tokens.spacing[4],
          padding: `${tokens.spacing[3]} 0 ${tokens.spacing[2]}`,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <InsetDivider side="top" />
        <div
          style={{
            padding: `0 ${tokens.spacing[3]} ${tokens.spacing[2]}`,
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: themeColor.text.faint,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.widest,
          }}
        >
          {'/// Channels'}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {channels.slice(0, 3).map(ch => (
            <ChannelRow key={ch.id} ch={ch} />
          ))}
        </div>
      </div>
    </>
  );
}

type SidebarProps = {
  activeNav: string;
  onNavChange: (id: string) => void;
  motionProps?: MotionProps;
  className?: string;
};

export function Sidebar({ activeNav, onNavChange, motionProps, className }: SidebarProps) {
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
        backdropFilter: 'blur(var(--andromeda-blur-sm, 2px))',
        WebkitBackdropFilter: 'blur(var(--andromeda-blur-sm, 2px))',
      }}
    >
      <CornerMarkers />

      {/* Logo block */}
      <div
        style={{
          position: 'relative',
          padding: `${tokens.spacing[6]} ${tokens.spacing[3]} ${tokens.spacing[3]}`,
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
        }}
      >
        <InsetDivider />
        <AndromedaIcon size={28} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
          <span
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              color: themeColor.text.primary,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.widest,
              fontWeight: tokens.typography.weight.semibold,
            }}
          >
            Andromeda
          </span>
          <span
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              color: themeColor.text.muted,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.widest,
            }}
          >
            Signal Room
          </span>
        </div>
      </div>

      {/* Console nav + channels rail — shared with the mobile Drawer via SidebarNav. */}
      <SidebarNav activeNav={activeNav} onNavChange={onNavChange} />

      {/* User card */}
      <div style={{ position: 'relative' }}>
        <InsetDivider side="top" />
        <UserCard
          name="Kerem Alkan"
          role="Engineer · Premium"
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
