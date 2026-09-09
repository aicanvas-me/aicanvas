// ============================================================
// RESOURCE PLANNING
// Composition shell. Top bar (brand + nav + actions), status bar
// (date range + manage layout), then the 2-column main grid:
//   - Left: Capacity panel + Allocation chart
//   - Right: Requests panel + Requests table
//
// Responsive (desktop-first — see rules.md → Responsive): the shell
// is width:100% + boxSizing:border-box (never 100vw), each grid item
// minWidth:0. The 2×2 bento grid collapses to ONE column below
// `mq.md`, rows flowing top-to-bottom in source order (Capacity →
// Requests → Allocation → Table). This template carries its nav
// HORIZONTALLY in the desktop TopBar rather than in a left sidebar.
// Below `mq.md` the whole desktop TopBar is hidden and the shared
// mobile chrome (examples/_shared/TemplateMobileChrome) takes over:
// MobileTopBar (brand + hamburger) at the very top, and MobileDrawer
// serving the SAME nav rows from a left-side drawer — one mobile nav
// aesthetic across all Andromeda templates. The nav rows are factored
// into <DrawerNav> so the inline strip and the drawer never drift. The
// StatusBar's date-picker / manage-layout row wraps, and the
// CapacityPanel / RequestsPanel cell rows stack at the same threshold.
// Drawer open/close is local client state, starts closed — SSR-safe,
// no hydration flash.
// ============================================================

'use client';

import { useState } from 'react';
import {
  Download,
  Gear,
  Keyboard,
  SignOut,
  Sliders,
  UserCircle,
} from '@phosphor-icons/react';
import { motion, LayoutGroup } from 'framer-motion';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { mq } from '../../components/lib/responsive';
import { CornerMarkers } from '../../components/CornerMarkers';
import { Button } from '../../components/Button';
import { NavItem } from '../../components/NavItem';
import { DateRangePicker } from '../../components/DateRangePicker';
import { UserMenu } from '../../components/UserMenu';
import type { UserMenuItem } from '../../components/UserMenu';
import { MobileTopBar, MobileDrawer } from '../_shared/TemplateMobileChrome';
import { useCascadeProps } from '../../components/lib/motion';
import { AndromedaIcon } from '../../AndromedaIcon';
import { CapacityPanel } from './CapacityPanel';
import { AllocationChart } from './AllocationChart';
import { RequestsPanel } from './RequestsPanel';
import { RequestsTable } from './RequestsTable';
import { navItems } from './data';

// ─── Hover stylesheet ───────────────────────────────────────────────────
function HoverStyles() {
  return (
    <style>{`
      /* off-token: 'ease' keyword (and .rp-row's 100ms) have no Andromeda motion token — left literal */
      .rp-nav { transition: color 140ms ease; }
      .rp-nav:hover { color: ${themeColor.text.primary} !important; }

      .rp-row { transition: background 100ms ease; cursor: pointer; }
      .rp-row:hover { background: ${themeColor.surface.hover}; }

      .rp-link { transition: color 140ms ease; }
      .rp-link:hover { color: ${themeColor.text.primary} !important; }
    `}</style>
  );
}

// ─── User menu items (shared shape with mission-control / service-order) ─
const userMenuItems: UserMenuItem[] = [
  { id: 'profile',     label: 'Profile',             icon: UserCircle },
  { id: 'preferences', label: 'Preferences',         icon: Gear },
  { id: 'shortcuts',   label: 'Keyboard Shortcuts',  icon: Keyboard },
  { id: 'sep1',        type: 'separator' },
  { id: 'signout',     label: 'Sign Out',            icon: SignOut },
];

// ─── Inline horizontal nav (desktop TopBar) ──────────────────────────────
// Lives inside the desktop TopBar, which is hidden as a whole below `mq.md`.
// Its rows reappear at that width as Drawer NavItems via <DrawerNav>, sharing
// the single `navItems` source so the two can never drift.
function TopNav() {
  return (
    <nav className="rp-topnav" style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[5] }}>
      {navItems.map((label, i) => {
        const active = i === 0;
        return (
          <button
            key={label}
            type="button"
            className="rp-nav"
            style={{
              position: 'relative',
              padding: `${tokens.spacing[2]} 0`,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.sm,
              fontWeight: active ? tokens.typography.weight.semibold : tokens.typography.weight.regular,
              color: active ? themeColor.text.primary : themeColor.text.muted,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.wider,
            }}
          >
            {label}
            {active ? (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '-2px',
                  height: '2px',
                  background: themeColor.accent[300],
                }}
              />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

// ─── Drawer nav (mobile) ──────────────────────────────────────────────────
// The same nav items as <TopNav>, rendered as Andromeda NavItems inside the
// left Drawer below `mq.md`. Selecting a row closes the drawer. LayoutGroup
// scopes NavItem's active-dot layoutId so the drawer copy can't fight the
// (hidden) desktop strip for the shared animation.
function DrawerNav({ onNavigate }: { onNavigate: () => void }) {
  return (
    <LayoutGroup id="rp-drawer-nav">
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        {navItems.map((label, i) => (
          <NavItem
            key={label}
            label={label}
            active={i === 0}
            onClick={onNavigate}
          />
        ))}
      </nav>
    </LayoutGroup>
  );
}

// ─── Top bar (desktop) ────────────────────────────────────────────────────
// Hidden below `mq.md`; the shared MobileTopBar (brand + hamburger) replaces
// it there. The drawer is opened from MobileTopBar, so this bar no longer
// needs the menu-open wiring.
function TopBar() {
  return (
    <header
      className="rp-topbar"
      style={{
        position: 'relative',
        height: tokens.layout.headerHeight,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[5],
        padding: `0 ${tokens.spacing[6]}`,
        background: themeColor.surface.raised,
      }}
    >
      <CornerMarkers />

      {/* Brand — Andromeda over the template name */}
      <div className="rp-brand" style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexShrink: 0, minWidth: 0 }}>
        <AndromedaIcon size={tokens.iconSize.xl} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1], minWidth: 0 }}>
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
            className="rp-brand-sub"
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              color: themeColor.text.muted,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.widest,
            }}
          >
            Resource Planning
          </span>
        </div>
      </div>

      {/* Brand / nav divider — hidden below `mq.md` with the inline nav. */}
      <span
        aria-hidden
        className="rp-nav-divider"
        style={{
          width: 'var(--andromeda-border-width, 1px)',
          height: tokens.spacing[6],
          background: themeColor.border.base,
          flexShrink: 0,
        }}
      />

      {/* Nav — inline strip on desktop, hidden below `mq.md`. */}
      <TopNav />

      <div style={{ flex: 1 }} />

      {/* Right cluster — wrapped so its inner gap (spacing[3]) is independent
          of the header's spacing[5] rhythm. Without the wrapper, the Button
          and Avatar would inherit the header gap. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexShrink: 0 }}>
        <Button
          className="rp-report-btn"
          variant="outline"
          size="md"
          icon={Download}
          style={{ height: tokens.spacing[8] }}
        >
          Generate Report
        </Button>
        <UserMenu
          name="OPS-01"
          src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          status="online"
          items={userMenuItems}
          placement="bottom"
          align="end"
        />
      </div>
    </header>
  );
}

// ─── Status bar (date range + manage layout) ────────────────────────────
function StatusBar() {
  // Default: "Last month" — the preset label clears to null on a manual pick.
  const [range, setRange] = useState({
    start: new Date(2026, 6, 20),
    end:   new Date(2026, 7, 20),
  });
  const [presetLabel, setPresetLabel] = useState<string | null>('Last month');

  return (
    <div
      className="rp-statusbar"
      style={{
        position: 'relative',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[4],
        padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
        background: themeColor.surface.raised,
      }}
    >
      <CornerMarkers />

      <DateRangePicker
        value={range}
        presetLabel={presetLabel ?? undefined}
        onChange={(next) => {
          setRange(next);
          setPresetLabel(null);
        }}
      />

      <span
        style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.sm,
          color: themeColor.text.muted,
          letterSpacing: tokens.typography.tracking.wide,
        }}
      >
        Last update: 3 min ago
      </span>

      <div style={{ flex: 1 }} />

      <button
        type="button"
        className="rp-link"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.sm,
          color: themeColor.text.muted,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.wider,
        }}
      >
        <Sliders weight="regular" size={14} />
        Manage layout
      </button>
    </div>
  );
}

// ─── Composition ────────────────────────────────────────────────────────
export default function ResourcePlanning() {
  // Mobile nav drawer — starts closed so SSR + first client render match the
  // desktop-first base (the drawer is portaled + display:none-gated anyway).
  const [navOpen, setNavOpen] = useState(false);

  // Six cascade slots, top-to-bottom: TopBar, StatusBar, then the 2×2
  // bento grid in reading order — top-left, top-right, bottom-left,
  // bottom-right. Cascade indices line up with grid positions so the
  // user reads the page composing itself the way the eye scans. When the
  // grid collapses to one column below `mq.md` the source order
  // (Capacity → Requests → Allocation → Table) reads sensibly stacked:
  // the headline KPI panel first, the request log last.
  const topBarMotion       = useCascadeProps(0);
  const statusBarMotion    = useCascadeProps(1);
  const capacityMotion     = useCascadeProps(2);
  const requestsPanelMotion = useCascadeProps(3);
  const allocationMotion   = useCascadeProps(4);
  const requestsTableMotion = useCascadeProps(5);

  return (
    <div
      className="rp-shell"
      style={{
        display: 'flex',
        flexDirection: 'column',
        // 100% (not 100vh): the shell fills its PARENT's height, not the raw
        // viewport. In the AI Canvas preview that parent is the region below the
        // TemplatePreviewShell top bar, so 100vh would overflow ~56px past the
        // fold with everything overflow:hidden → nothing reachable ("can't
        // scroll"). Matches mission-control / signal-room; internal panels (the
        // requests table) own the scrolling. A standalone CLI install renders it
        // in a full-height container the same way the other templates do.
        height: '100%',
        // 100% (not 100vw): 100vw includes the scrollbar gutter, so it runs wider
        // than the visible area and eats the right padding (left looks fine, right
        // is clipped). Matches mission-control / signal-room.
        width: '100%',
        background: themeColor.surface.base,
        fontFamily: tokens.typography.fontSans,
        color: themeColor.text.primary,
        overflow: 'hidden',
        gap: tokens.spacing[3],
        padding: tokens.spacing[6],
        boxSizing: 'border-box',
      }}
    >
      <HoverStyles />
      {/* Mobile top bar — brand + hamburger, shown only below `mq.md`. Sits at
          the very top on mobile; the desktop `.rp-topbar` is hidden at that
          width via the <style> block below. */}
      <MobileTopBar templateName="Resource Planning" onMenuOpen={() => setNavOpen(true)} menuOpen={navOpen} />
      <motion.div {...topBarMotion} style={{ flexShrink: 0 }}>
        <TopBar />
      </motion.div>
      <motion.div {...statusBarMotion} style={{ flexShrink: 0 }}>
        <StatusBar />
      </motion.div>

      {/* Main 2×2 bento grid. Grid (not flex) is used so the top row shares
          a single height across both columns and the bottom row fills the
          remaining space — guaranteeing the panel seams line up across the
          left/right divide regardless of intrinsic content height. Below
          `mq.md` it collapses to a single minmax(0,1fr) column and the rows
          flow top-to-bottom in source order. */}
      <main
        className="rp-grid"
        style={{
          flex: 1,
          display: 'grid',
          // minmax(0, fr) — without the 0 minimum a wide nowrap table in the
          // right column blows the track past its fraction and overflows into
          // the page padding (content touches / overlaps the frame on the right).
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gridTemplateRows: 'minmax(220px, auto) 1fr',
          gap: tokens.spacing[3],
          minHeight: 0,
        }}
      >
        <motion.div className="rp-grid-item" {...capacityMotion} style={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <CapacityPanel />
        </motion.div>
        <motion.div className="rp-grid-item" {...requestsPanelMotion} style={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <RequestsPanel />
        </motion.div>
        <motion.div className="rp-grid-item rp-grid-item-chart" {...allocationMotion} style={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <AllocationChart />
        </motion.div>
        <motion.div className="rp-grid-item rp-grid-item-table" {...requestsTableMotion} style={{ minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <RequestsTable />
        </motion.div>
      </main>

      {/* Mobile nav — the same desktop nav rows, served through the shared
          MobileDrawer below `mq.md`. The whole desktop TopBar is hidden at that
          width (see <style> below); the hamburger lives in MobileTopBar.
          Selecting a row closes the drawer. */}
      <MobileDrawer
        open={navOpen}
        onOpenChange={setNavOpen}
        templateName="Resource Planning"
        user={{
          name: 'OPS-01',
          role: 'Capacity Planner',
          src: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          items: userMenuItems,
        }}
      >
        <DrawerNav onNavigate={() => setNavOpen(false)} />
      </MobileDrawer>

      <style>{`
        /* Standalone hosts (a CLI install into a fresh app): pin the shell to the
           viewport exactly like the on-site preview does — the dashboard owns the
           screen, panels scroll internally, the sidebar stays full-height, and
           the host page never shows through. The AI Canvas preview opts out via
           .aic-tpl-host: there the surrounding shell sizes this element. The
           mobile block below still releases the pin on phones. */
        .rp-shell { height: 100dvh !important; min-height: 100dvh; }
        .aic-tpl-host .rp-shell { height: 100% !important; min-height: 0; }
        ${mq.md} {
          /* Tighter shell padding + gap so the stacked panels keep their
             breathing room without crowding the viewport edge. */
          .rp-shell {
            gap: ${tokens.spacing[3]} !important;
            padding: ${tokens.spacing[3]} !important;
            /* Desktop gives the shell a definite 100% height + overflow:hidden
               so the bento fr-tracks align the seams. On a phone a fixed height
               would trap the internally-scrolling grid's bottom under the
               address bar with no way to reach it. Below md, let the SHELL
               scroll to the dynamic viewport instead (matches exchange-terminal)
               — nothing clips. */
            height: auto !important;
            min-height: 100dvh !important;
            overflow-y: auto !important;
          }
          /* The on-site opt-out above is more specific than .rp-shell, so the
             phone release must be repeated at that specificity or the site's
             mobile preview would stay pinned. */
          .aic-tpl-host .rp-shell { height: auto !important; }
          /* Bento grid collapses to ONE column; rows flow top-to-bottom in
             source order (Capacity → Requests → Allocation → Table). Rows
             become content-sized (auto) and the grid itself scrolls
             vertically inside the fixed-height shell — the page never grows
             past the viewport, the stacked panels scroll within. */
          .rp-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            grid-template-rows: auto !important;
            grid-auto-rows: auto !important;
            /* The shell scrolls now (above), so the grid is content-sized — no
               nested scroller. */
            overflow: visible !important;
            min-height: 0 !important;
          }
          /* The chart and table panels lay out against a parent-provided
             height on desktop (the fr track). Once the rows are content-sized
             they would collapse. The table just needs a usable minimum (220px,
             reused from the desktop top-row track). The chart needs a DEFINITE
             height, not only a min-height: TrendChart in fill mode is a
             height:100% to ResponsiveContainer chain, and a percentage or flex
             height only resolves against a definite ancestor height; a bare
             min-height measures 0, so the plot collapses (chrome renders, the
             graph does not). dvh is the relative unit the brain allows for
             filling a phone screen; the 220px min keeps the panel usable on the
             shortest viewports. */
          .rp-grid-item-chart { height: 46dvh !important; min-height: 220px !important; }
          .rp-grid-item-table { min-height: 220px !important; }
          /* The whole desktop TopBar is hidden below md — the shared
             MobileTopBar (brand + hamburger) takes its place at the very top of
             the shell, matching the other Andromeda templates. */
          .rp-topbar { display: none !important; }
          /* StatusBar: let the date-picker / last-update / manage-layout row
             wrap instead of overflowing the narrow viewport. */
          .rp-statusbar {
            flex-wrap: wrap !important;
            padding: ${tokens.spacing[3]} ${tokens.spacing[4]} !important;
            row-gap: ${tokens.spacing[2]} !important;
          }
        }
      `}</style>
    </div>
  );
}
