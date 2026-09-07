// ============================================================
// SHARED TEMPLATE MOBILE CHROME
//
// One mobile navigation aesthetic for ALL Andromeda templates, so the
// four stop drifting apart:
//
//   MobileTopBar — exactly two elements: the brand lockup (Andromeda
//     icon + "Andromeda" over the template name) on the LEFT, and a
//     hamburger on the RIGHT. Nothing else.
//
//   MobileDrawer — mirrors the desktop sidebar: a logo header (same
//     icon + "Andromeda" + template name), the template's nav rows
//     (passed as children), and a bottom user block (UserCard). Opens
//     from the left at 70% of the viewport width.
//
// Both render below `mq.md` ONLY. Each template keeps its full desktop
// chrome (sidebar / header / top bar) and renders these as siblings
// hidden at md+ — render-both-and-CSS-hide, the brain's flash-free
// pattern (rules.md → Responsive). The drawer is portaled, so it is
// never clipped by a template's overflow.
// ============================================================

'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { List, UserCircle, Gear, Keyboard, SignOut } from '@phosphor-icons/react';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { mq } from '../../components/lib/responsive';
import { useCascadeProps } from '../../components/lib/motion';
import { IconButton } from '../../components/IconButton';
import { Drawer, DrawerBody } from '../../components/Drawer';
import { UserCard } from '../../components/UserCard';
import type { UserCardProps } from '../../components/UserCard';
import type { UserMenuItem } from '../../components/UserMenu';
import { AndromedaIcon } from '../../AndromedaIcon';

// Generic account menu — same set the desktop sidebars use. Templates can
// override via `user.items`, but they all share this by default.
const DEFAULT_USER_MENU_ITEMS: UserMenuItem[] = [
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'preferences', label: 'Preferences', icon: Gear },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'sep1', type: 'separator' },
  { id: 'signout', label: 'Sign Out', icon: SignOut },
];

// Brand lockup — icon + "Andromeda" over the template name, mono uppercase.
// Mirrors the desktop sidebar's logo block (examples/*/Sidebar.tsx) so the
// top bar and drawer header read identically to the web sidebar.
function Brand({ templateName, iconSize }: { templateName: string; iconSize: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], minWidth: 0 }}>
      <AndromedaIcon size={iconSize} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1], minWidth: 0 }}>
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
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {templateName}
        </span>
      </div>
    </div>
  );
}

// Mobile top bar: brand left, hamburger right. `display:none` on desktop,
// shown (`flex`) below `mq.md` via the scoped <style> below.
//
// The bar joins the entrance cascade at index 0 — every template's desktop
// chrome is cascade-gated, so the pre-hydration first paint is uniformly
// dark and the page then composes itself. A bar exempt from the cascade
// pops in ALONE on that dark first paint (blurry while the preview iframe
// is still scale-animating) and hangs over an empty screen until hydration
// starts the cascade — the awkward top-of-frame glitch on the Mobile
// toggle. Index 0 is always right: the bar is the topmost mobile element,
// and the desktop index-0 siblings (sidebars) are display:none below md,
// so the two never share a visible cascade slot.
export function MobileTopBar({ templateName, onMenuOpen, menuOpen = false }: {
  templateName: string;
  onMenuOpen?: () => void;
  menuOpen?: boolean;
}) {
  const cascade = useCascadeProps(0);
  return (
    <motion.div
      {...cascade}
      className="amc-topbar"
      style={{
        position: 'relative',
        height: tokens.layout.headerHeight,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: tokens.spacing[3],
        padding: `0 ${tokens.spacing[4]}`,
        background: themeColor.surface.raised,
        borderBottom: `${tokens.border.thin} ${themeColor.border.subtle}`,
        display: 'none',
      }}
    >
      <Brand templateName={templateName} iconSize={22} />
      <IconButton
        variant="ghost"
        size="lg"
        icon={List}
        aria-label="Open navigation"
        aria-expanded={menuOpen}
        data-state={menuOpen ? 'open' : 'closed'}
        onClick={onMenuOpen}
        style={{
          flexShrink: 0,
          ...(menuOpen
            ? { background: themeColor.surface.active, color: themeColor.text.primary }
            : null),
        }}
      />
      <style>{`
        ${mq.md} { .amc-topbar { display: flex !important; } }
      `}</style>
    </motion.div>
  );
}

type MobileDrawerUser = Pick<UserCardProps, 'name' | 'role' | 'src' | 'status'> & {
  items?: UserCardProps['items'];
};

// Mobile drawer: mirrors the desktop sidebar — logo header, the template's
// nav (children), and a bottom user block. Left side, 70vw.
export function MobileDrawer({ open, onOpenChange, templateName, user, children }: {
  open: boolean;
  onOpenChange?: (next: boolean) => void;
  templateName: string;
  user?: MobileDrawerUser;
  children?: ReactNode;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} side="left" size="70vw">
      {/* Logo header — mirrors the sidebar logo block. */}
      <div style={{
        position: 'relative',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[3],
        padding: `${tokens.spacing[4]} ${tokens.spacing[3]}`,
        borderBottom: `${tokens.border.thin} ${themeColor.border.subtle}`,
      }}>
        <Brand templateName={templateName} iconSize={28} />
      </div>

      {/* Nav — the template's own rows, edge to edge like the sidebar. */}
      <DrawerBody style={{ padding: 0 }}>
        {children}
      </DrawerBody>

      {/* User block — mirrors the sidebar's bottom UserCard. */}
      {user ? (
        <div style={{
          position: 'relative',
          flexShrink: 0,
          borderTop: `${tokens.border.thin} ${themeColor.border.subtle}`,
        }}>
          <UserCard
            name={user.name}
            role={user.role}
            src={user.src}
            status={user.status ?? 'online'}
            items={user.items ?? DEFAULT_USER_MENU_ITEMS}
            placement="top"
            align="stretch"
          />
        </div>
      ) : null}
    </Drawer>
  );
}
