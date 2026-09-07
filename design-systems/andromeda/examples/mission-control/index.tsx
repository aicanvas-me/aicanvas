// ============================================================
// MISSION CONTROL
// Composition shell. Paints its own surface and, on standalone hosts,
// pins itself to the viewport (see the <style> block at the bottom).
//
// Only the Overview section is wired up. The other sidebar items
// (Telemetry, Vehicles, Comms, Anomalies, Maintenance) remain
// visible in the cyber-nav for scenic value but are inert —
// clicking them does nothing.
//
// Entrance cascade: Sidebar → Header → six rows of OverviewSection
// stagger in top-to-bottom on mount. After each element settles,
// its own internal motion (clock tick, count-up, scan reveal,
// telemetry flicker) takes over without further coordination.
//
// Responsive (desktop-first — see rules.md → Responsive): the shell
// is a flex row on desktop. Below `mq.md` it becomes a flex COLUMN,
// the desktop Sidebar is hidden (`display:none`), and the Header
// gains a hamburger that opens the same nav content in a left-side
// Drawer. The OverviewSection's inner dual-pane rows collapse to one
// column at the same threshold. Drawer open/close is local client
// state, starts closed — SSR-safe, no hydration flash.
// ============================================================

'use client';

import { useState } from 'react';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { mq } from '../../components/lib/responsive';
import { useCascadeProps } from '../../components/lib/motion';
import { Sidebar, SidebarNav } from './Sidebar';
import { Header } from './Header';
import { OverviewSection } from './sections/OverviewSection';
import { MobileTopBar, MobileDrawer } from '../_shared/TemplateMobileChrome';

export default function MissionControl() {
  const [activeNav] = useState('overview');
  // Mobile nav drawer — starts closed so SSR + first client render match the
  // desktop-first base (the drawer is portaled + display:none-gated anyway).
  const [navOpen, setNavOpen] = useState(false);

  // Inert handler: non-overview ids are ignored, active stays on overview.
  // Selecting a nav item from the mobile drawer also closes the drawer.
  const handleNavChange = (id: string) => {
    setNavOpen(false);
    if (id === 'overview') return;
  };

  // Outer cascade slots — Sidebar 0, Header 1. OverviewSection's inner
  // rows continue the cascade from index 2 so the whole dashboard reads
  // as one continuous top-to-bottom sequence rather than two cascades
  // happening at the same time.
  const sidebarMotion = useCascadeProps(0);
  const headerMotion  = useCascadeProps(1);

  return (
    <div
      className="mc-shell"
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        // Paint our own surface: a CLI install lands in an arbitrary host page
        // (often white), and a transparent shell bleeds the host through every
        // gutter. The AI Canvas preview paints this same surface behind us, so
        // on-site rendering is unchanged.
        background: themeColor.surface.base,
        fontFamily: tokens.typography.fontSans,
        color: themeColor.text.primary,
        overflow: 'hidden',
        gap: tokens.spacing[4],
        padding: tokens.spacing[4],
        boxSizing: 'border-box',
      }}
    >
      <Sidebar
        className="mc-sidebar"
        activeNav={activeNav}
        onNavChange={handleNavChange}
        motionProps={sidebarMotion}
      />

      <div
        className="mc-main-col"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
          gap: tokens.spacing[4],
        }}
      >
        <MobileTopBar
          templateName="Mission Control"
          onMenuOpen={() => setNavOpen(true)}
          menuOpen={navOpen}
        />
        <Header
          sectionTitle="Overview"
          motionProps={headerMotion}
        />

        <main className="mc-main" style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[5],
          paddingRight: tokens.spacing[2],
          boxSizing: 'border-box',
        }}>
          <OverviewSection startIndex={2} />
        </main>
      </div>

      {/* Mobile nav — shared chrome below md: logo header + the console nav
          (same SidebarNav the desktop aside uses) + the bottom user block,
          mirroring the desktop sidebar at 70vw. */}
      <MobileDrawer
        open={navOpen}
        onOpenChange={setNavOpen}
        templateName="Mission Control"
        user={{
          name: 'Reza Quinn',
          role: 'Flight Director',
          src: 'https://images.unsplash.com/photo-1669287731461-bd8ce3126710?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          status: 'online',
        }}
      >
        <SidebarNav
          activeNav={activeNav}
          onNavChange={handleNavChange}
          layoutGroupId="mission-control-drawer-nav"
        />
      </MobileDrawer>

      <style>{`
        /* Standalone hosts (a CLI install into a fresh app): pin the shell to the
           viewport exactly like the on-site preview does — the dashboard owns the
           screen, panels scroll internally, the sidebar stays full-height, and
           the host page never shows through. The AI Canvas preview opts out via
           .aic-tpl-host: there the surrounding shell sizes this element. The
           mobile block below still releases the pin on phones. */
        .mc-shell { height: 100dvh !important; min-height: 100dvh; }
        .aic-tpl-host .mc-shell { height: 100% !important; min-height: 0; }
        ${mq.md} {
          /* Stack the shell top-to-bottom AND release its desktop 100vh pin:
             below md the dashboard grows to its stacked height and the route
             column (AndromedaContentColumn, overflow-y:auto on mobile) scrolls
             the whole page as one. The inner <main> stops being a fixed-height
             scroller (flex:0 0 auto, overflow visible) so there's no nested
             scroller and no blank strip. */
          .mc-shell {
            flex-direction: column !important;
            height: auto !important;
            min-height: 100dvh !important;
            overflow: visible !important;
            gap: ${tokens.spacing[3]} !important;
            padding: ${tokens.spacing[3]} !important;
          }
          /* The on-site opt-out above is more specific than .mc-shell, so the
             phone release must be repeated at that specificity or the site's
             mobile preview would stay pinned. */
          .aic-tpl-host .mc-shell { height: auto !important; }
          /* Desktop sidebar hidden — its content lives in the Drawer. */
          .mc-sidebar { display: none !important; }
          .mc-main-col { overflow: visible !important; gap: ${tokens.spacing[3]} !important; }
          .mc-main { flex: 0 0 auto !important; overflow-y: visible !important; padding-right: 0 !important; }
        }
      `}</style>
    </div>
  );
}
