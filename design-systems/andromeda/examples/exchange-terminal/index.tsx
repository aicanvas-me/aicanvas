// ============================================================
// EXCHANGE TERMINAL
// ============================================================

'use client';

import { useState } from 'react';
import {
  Download,
  Gear,
  GridFour,
  PlayCircle,
  DotsThree,
  List,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { CornerMarkers } from '../../components/CornerMarkers';
import { Avatar } from '../../components/Avatar';
import { IconButton } from '../../components/IconButton';
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
} from '../../components/Drawer';
import type { DrawerProps } from '../../components/Drawer';
import { useCascadeProps } from '../../components/lib/motion';
import { mq } from '../../components/lib/responsive';
import { AndromedaIcon } from '../../AndromedaIcon';
import { OrderBook } from './OrderBook';
import { ChartPanel } from './ChartPanel';
import { PairList } from './PairList';
import { Dropdown } from './Dropdown';
import { pair } from './data';

// ─── Global hover stylesheet ──────────────────────────────────────────
// Inline-style React doesn't support :hover, so we inject one stylesheet
// for the whole terminal. Class names are short to avoid noisy DOM.
function HoverStyles() {
  return (
    <style>{`
      .ex-btn-hover { transition: background 140ms ease, color 140ms ease, border-color 140ms ease; }
      .ex-btn-hover:hover { color: ${themeColor.text.primary} !important; }

      .ex-icon-btn { transition: background 140ms ease, color 140ms ease, border-color 140ms ease; }
      .ex-icon-btn:hover { background: ${themeColor.surface.active} !important; color: ${themeColor.accent[200]} !important; border-color: ${themeColor.border.bright} !important; }

      .ex-row { transition: background 100ms ease; cursor: pointer; }
      .ex-row:hover { background: ${themeColor.surface.hover}; }

      .ex-menu-item-hover { transition: background 100ms ease, color 100ms ease; }
      .ex-menu-item-hover:hover { background: ${themeColor.surface.hover} !important; color: ${themeColor.text.primary} !important; }

      .ex-link { transition: color 140ms ease; }
      .ex-link:hover { color: ${themeColor.accent[300]} !important; }

      /* ── Responsive (desktop-first; step DOWN via max-width) ──────────── */

      /* Hamburger lives in the TopBar only below md; desktop nav hides there. */
      .ex-nav-trigger { display: none; }
      ${mq.md} {
        .ex-nav-trigger { display: inline-flex !important; }
        .ex-desktop-nav { display: none !important; }
        .ex-app-switcher { display: none !important; }
      }

      /* PairHeader: the dense single-row cluster wraps below md; the
         vertical rules that chunk it would float orphaned once wrapped,
         so they collapse. Inset tightens one step. */
      ${mq.md} {
        .ex-pairheader { flex-wrap: wrap !important; gap: ${tokens.spacing[4]} !important; padding: ${tokens.spacing[3]} ${tokens.spacing[4]} !important; }
        .ex-pairheader .ex-vrule { display: none !important; }
        .ex-pairheader .ex-tutorial { margin-left: auto !important; }
      }
      /* Hero spot price is the only display-tier reading here; step it
         down one stop on phones so it never overruns its wrapped row. */
      ${mq.sm} {
        .ex-hero-price { font-size: ${tokens.typography.size['2xl']} !important; }
      }

      /* Main bento to single column below md. Source order is
         OrderBook, ChartPanel, PairList; on mobile the chart is the
         primary panel, so CSS order floats it first, then the book,
         then the list. Fixed-basis columns become full-width with a
         sensible stacked min-height (internal scroll still carries the
         long tables). Once stacked the panels overflow one screen, so
         the shell itself scrolls vertically (overflow hidden to auto). */
      ${mq.md} {
        .ex-shell { height: auto !important; min-height: 100vh; overflow-y: auto !important; }
        .ex-main { flex-direction: column !important; flex: 0 0 auto !important; }
        .ex-main > * { flex: 0 0 auto !important; width: 100% !important; min-width: 0 !important; }
        .ex-col-chart { order: 1; min-height: 60vh !important; }
        .ex-col-book  { order: 2; min-height: 60vh !important; }
        .ex-col-list  { order: 3; min-height: 70vh !important; }
      }

      /* OrderTabs: drop the decorative tag below sm so the live tabs keep
         the row; tighten the inset one step below md. */
      ${mq.md} { .ex-ordertabs { padding: 0 ${tokens.spacing[4]} !important; gap: ${tokens.spacing[5]} !important; } }
      ${mq.sm} { .ex-ordertabs-tag { display: none !important; } }
    `}</style>
  );
}

// ─── TopBar ─────────────────────────────────────────────────────────────────
const NAV_MENUS = {
  'Buy Crypto':  ['GBP', 'USD', 'EUR', 'JPY', 'AUD'],
  'Trade':       ['Spot', 'Margin', 'Futures', 'P2P', 'Convert'],
  'Derivatives': ['USDⓈ-M Futures', 'COIN-M Futures', 'Options', 'Leveraged Tokens'],
  'Finance':     ['Earn', 'Pool', 'Loans', 'BNB Vault', 'Liquidity Farming'],
};

function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header
      style={{
        position: 'relative',
        height: tokens.layout.headerHeight,    // 60px
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[4],
        padding: `0 ${tokens.spacing[6]}`,
        background: themeColor.surface.raised,
      }}
    >
      <CornerMarkers />

      {/* Mobile nav trigger — hidden on desktop, shown ≤md via .ex-nav-trigger.
          Opens the shared Drawer holding the same nav menus. */}
      <span className="ex-nav-trigger" style={{ flexShrink: 0 }}>
        <IconButton aria-label="Open navigation" variant="outline" size="md" icon={List} onClick={onMenu} />
      </span>

      {/* Brand — Andromeda over the template name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexShrink: 0 }}>
        <AndromedaIcon size={22} />
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
            Exchange Terminal
          </span>
        </div>
      </div>

      {/* App switcher — desktop only */}
      <span className="ex-app-switcher" style={{ display: 'inline-flex', flexShrink: 0 }}>
        <IconButton aria-label="App grid" variant="outline" size="md" icon={GridFour} />
      </span>

      {/* Nav — desktop only; collapses into the Drawer ≤md */}
      <nav className="ex-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
        <Dropdown
          variant="nav"
          label="Buy Crypto"
          items={NAV_MENUS['Buy Crypto']}
          leadingBadge={
            <span
              style={{
                padding: `0 ${tokens.spacing[1]}`,
                background: themeColor.accent.alpha,
                color: themeColor.accent[200],
                fontSize: tokens.typography.size.xs,
                borderRadius: tokens.radius.sm,
              }}
            >
              GBP
            </span>
          }
        />
        <button
          type="button"
          className="ex-btn-hover"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.sm,
            fontWeight: tokens.typography.weight.medium,
            color: themeColor.text.primary,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.wider,
          }}
        >
          Markets
        </button>
        <Dropdown variant="nav" label="Trade"       items={NAV_MENUS['Trade']} />
        <Dropdown variant="nav" label="Derivatives" items={NAV_MENUS['Derivatives']} />
        <Dropdown variant="nav" label="Finance"     items={NAV_MENUS['Finance']} />
      </nav>

      <div style={{ flex: 1 }} />

      {/* Right utilities — IconButton aligns the entire cluster on a 32px baseline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
        <IconButton aria-label="Downloads" variant="outline" icon={Download} />
        {/* Region/currency — labeled chunk that still matches the 32px row */}
        <button
          type="button"
          className="ex-icon-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: tokens.spacing[8],
            padding: `0 ${tokens.spacing[3]}`,
            background: themeColor.surface.hover,
            border: `${tokens.border.thin} ${themeColor.border.base}`,
            cursor: 'pointer',
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.sm,
            color: themeColor.text.primary,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.wider,
            flexShrink: 0,
          }}
        >
          EN/USD
        </button>
        <IconButton aria-label="Settings"  variant="outline" icon={Gear} />
        <Avatar name="OPS-01" size="sm" status="online" />
      </div>
    </header>
  );
}

// ─── PairHeader ────────────────────────────────────────────────────────────
const fmt = (n: number, d = 2) =>
  n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

// Demoted stat — small label above small value. Used only for the
// secondary metrics (24h high/low/volumes) which sit at tier-2 of the
// PairHeader hierarchy below the hero price.
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1], minWidth: 0 }}>
      <span
        style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.xs,
          color: themeColor.text.muted,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.widest,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.sm,
          color: themeColor.text.primary,
          letterSpacing: tokens.typography.tracking.wide,
          fontWeight: tokens.typography.weight.medium,
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
    </div>
  );
}

// 1px tall vertical rule used to chunk the PairHeader into legible groups.
function VRule() {
  return (
    <span
      aria-hidden
      className="ex-vrule"
      style={{
        width: '1px',
        height: tokens.spacing[8],
        background: themeColor.border.subtle,
        flexShrink: 0,
      }}
    />
  );
}

function PairHeader() {
  const pos = pair.changePct24h >= 0;
  const changeColor = pos ? themeColor.accent[200] : themeColor.red[200];

  return (
    <div
      className="ex-pairheader"
      style={{
        position: 'relative',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[6],
        padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
        background: themeColor.surface.raised,
      }}
    >
      <CornerMarkers />

      {/* Pair identity */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xl,
            fontWeight: tokens.typography.weight.bold,
            color: themeColor.text.primary,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.wider,
          }}
        >
          {pair.base}/{pair.quote}
          <span
            style={{
              padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
              background: themeColor.orange.alpha,
              color: themeColor.orange[200],
              fontSize: tokens.typography.size.xs,
              fontWeight: tokens.typography.weight.medium,
              letterSpacing: tokens.typography.tracking.wide,
              borderRadius: tokens.radius.sm,
            }}
          >
            {pair.leverage}
          </span>
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xs,
            color: themeColor.text.muted,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.widest,
          }}
        >
          <DotsThree weight="bold" size={10} />
          {pair.longName}
        </span>
      </div>

      <VRule />

      {/* Tier 1 — hero price block. Spot is 3xl, USD reference is sm muted,
          24h change sits inline under the spot so the eye reads price → delta
          without scanning across to a separate Stat tile. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
        <span
          className="ex-hero-price"
          style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size['3xl'],
            fontWeight: tokens.typography.weight.bold,
            color: changeColor,
            letterSpacing: tokens.typography.tracking.tight,
            lineHeight: tokens.typography.lineHeight.tight,
          }}
        >
          {fmt(pair.price)}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: tokens.spacing[2],
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.sm,
            letterSpacing: tokens.typography.tracking.wide,
          }}
        >
          <span style={{ color: themeColor.text.muted }}>${fmt(pair.priceUsd)}</span>
          <span style={{ color: changeColor, fontWeight: tokens.typography.weight.medium }}>
            {pos ? '+' : ''}{fmt(pair.change24h)}
          </span>
          <span style={{ color: changeColor, fontWeight: tokens.typography.weight.medium }}>
            {pos ? '+' : ''}{pair.changePct24h.toFixed(2)}%
          </span>
        </span>
      </div>

      <VRule />

      {/* Tier 2 — secondary 24h range. Tighter gap groups them as one cluster. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[5] }}>
        <Stat label="24h High" value={fmt(pair.high24h)} />
        <Stat label="24h Low"  value={fmt(pair.low24h)} />
      </div>

      <VRule />

      {/* Tier 2 — volumes, also clustered. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[5] }}>
        <Stat label={`24h Vol (${pair.base})`}  value={fmt(pair.volBase24h)} />
        <Stat label={`24h Vol (${pair.quote})`} value={fmt(pair.volQuote24h)} />
      </div>

      <div style={{ flex: 1 }} />

      <button
        type="button"
        className="ex-link ex-tutorial"
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
          color: themeColor.accent[200],
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.wider,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        <PlayCircle weight="regular" size={15} />
        Spot Tutorial
      </button>
    </div>
  );
}

// ─── OrderTabs ─────────────────────────────────────────────────────────────
const ORDER_TABS = ['Spot', 'Cross 3x', 'Isolated 10x'];

function OrderTabs() {
  return (
    <div
      className="ex-ordertabs"
      style={{
        position: 'relative',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[6],
        padding: `0 ${tokens.spacing[6]}`,
        height: tokens.spacing[10],            // 40px
        background: themeColor.surface.raised,
      }}
    >
      <CornerMarkers />
      {ORDER_TABS.map((label, i) => {
        const active = i === 0;
        return (
          <button
            key={label}
            type="button"
            className="ex-btn-hover"
            style={{
              position: 'relative',
              height: '100%',
              padding: `0`,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.sm,
              fontWeight: active
                ? tokens.typography.weight.semibold
                : tokens.typography.weight.regular,
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
                  bottom: 0,
                  height: '2px',
                  background: themeColor.accent[300],
                }}
              />
            ) : null}
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <span
        className="ex-ordertabs-tag"
        style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.xs,
          color: themeColor.text.faint,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.widest,
          whiteSpace: 'nowrap',
        }}
      >
        {'/// Andromeda Exchange'}
      </span>
    </div>
  );
}

// ─── Composition ───────────────────────────────────────────────────────────
// ─── Drawer nav — the same NAV_MENUS as the desktop TopBar, stacked. ─────────
function NavDrawer({ open, onOpenChange }: Pick<DrawerProps, 'open' | 'onOpenChange'>) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} side="left" size={280}>
      <DrawerHeader>
        <DrawerTitle>Navigation</DrawerTitle>
        <DrawerDescription>Andromeda Exchange Terminal</DrawerDescription>
      </DrawerHeader>
      <DrawerBody>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
          {Object.entries(NAV_MENUS).map(([group, items]) => (
            <div key={group} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
              <span
                style={{
                  fontFamily: tokens.typography.fontMono,
                  fontSize: tokens.typography.size.xs,
                  fontWeight: tokens.typography.weight.semibold,
                  color: themeColor.text.primary,
                  textTransform: 'uppercase',
                  letterSpacing: tokens.typography.tracking.widest,
                }}
              >
                {group}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="ex-menu-item-hover"
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: tokens.typography.fontMono,
                      fontSize: tokens.typography.size.sm,
                      color: themeColor.text.secondary,
                      textTransform: 'uppercase',
                      letterSpacing: tokens.typography.tracking.wide,
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {/* Markets — a flat link in the desktop nav, kept as its own item. */}
          <button
            type="button"
            className="ex-menu-item-hover"
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.sm,
              fontWeight: tokens.typography.weight.medium,
              color: themeColor.text.primary,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.wider,
            }}
          >
            Markets
          </button>
        </nav>
      </DrawerBody>
    </Drawer>
  );
}

// ─── Composition ───────────────────────────────────────────────────────────
export default function ExchangeTerminal() {
  // Six cascade slots, top-to-bottom: TopBar, PairHeader, then the three
  // main columns (OrderBook → ChartPanel → PairList — staggers
  // left-to-right within the same row), then OrderTabs at the bottom.
  const topBarMotion       = useCascadeProps(0);
  const pairHeaderMotion   = useCascadeProps(1);
  const orderBookMotion    = useCascadeProps(2);
  const chartPanelMotion   = useCascadeProps(3);
  const pairListMotion     = useCascadeProps(4);
  const orderTabsMotion    = useCascadeProps(5);

  // Mobile nav drawer — local client state, starts closed (SSR-safe).
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div
      className="ex-shell"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        background: themeColor.surface.base,
        fontFamily: tokens.typography.fontSans,
        color: themeColor.text.primary,
        overflow: 'hidden',
        gap: '12px',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <HoverStyles />
      <NavDrawer open={navOpen} onOpenChange={setNavOpen} />
      <motion.div {...topBarMotion} style={{ flexShrink: 0 }}>
        <TopBar onMenu={() => setNavOpen(true)} />
      </motion.div>
      <motion.div {...pairHeaderMotion} style={{ flexShrink: 0 }}>
        <PairHeader />
      </motion.div>

      {/* Main 3-column layout — flex gives each wrapper a definite height
          so inner panels can use flex:1 reliably (grid auto-rows don't).
          Below md it stacks to one column (see .ex-main rules); each panel
          then takes a viewport-relative min-height with its own internal
          scroll, and the shell itself scrolls vertically. */}
      <main
        className="ex-main"
        style={{
          flex: 1,
          display: 'flex',
          gap: '12px',
          minHeight: 0,
        }}
      >
        <motion.div {...orderBookMotion} className="ex-col-book" style={{ flex: '0 0 300px', minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <OrderBook />
        </motion.div>
        <motion.div {...chartPanelMotion} className="ex-col-chart" style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <ChartPanel />
        </motion.div>
        <motion.div {...pairListMotion} className="ex-col-list" style={{ flex: '0 0 320px', minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <PairList />
        </motion.div>
      </main>

      <motion.div {...orderTabsMotion} style={{ flexShrink: 0 }}>
        <OrderTabs />
      </motion.div>
    </div>
  );
}
