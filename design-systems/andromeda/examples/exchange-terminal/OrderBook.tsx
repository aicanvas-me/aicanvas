// ============================================================
// EXCHANGE TERMINAL · OrderBook
// ============================================================

'use client';

import { Funnel, Printer } from '@phosphor-icons/react';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { CornerMarkers } from '../../components/CornerMarkers';
import { IconButton } from '../../components/IconButton';
import { Dropdown } from './Dropdown';
import { asks, bids, tape } from './data';

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

const num = (n: number, d = 3) =>
  n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

// Shared text style for all data rows.
const ROW_TEXT = {
  fontFamily: tokens.typography.fontMono,
  fontSize: tokens.typography.size.sm,        // 12px — readable at density
  letterSpacing: tokens.typography.tracking.wide,
};

// Shared header style for column labels.
const COL_HEADER = {
  fontFamily: tokens.typography.fontMono,
  fontSize: tokens.typography.size.sm,
  color: themeColor.text.muted,
  textTransform: 'uppercase',
  letterSpacing: tokens.typography.tracking.widest,
};

function DepthRow({ row, side, depth }: { row: (typeof asks)[number]; side: 'ask' | 'bid'; depth: number }) {
  const tint = side === 'ask' ? themeColor.red.alpha : themeColor.accent.alpha;
  const priceColor = side === 'ask' ? themeColor.red[200] : themeColor.accent[200];
  return (
    <div
      className="ex-row"
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        alignItems: 'center',
        height: tokens.spacing[6],             // 24px — one token step up from original 20px
        padding: `0 ${tokens.spacing[4]}`,
        ...ROW_TEXT,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: `1px 0 1px auto`,
          right: 0,
          width: `${depth * 100}%`,
          background: tint,
          pointerEvents: 'none',
        }}
      />
      <span style={{ position: 'relative', color: priceColor }}>{num(row.p, 2)}</span>
      <span style={{ position: 'relative', color: themeColor.text.secondary, textAlign: 'right' }}>
        {num(row.a, 3)}
      </span>
      <span style={{ position: 'relative', color: themeColor.text.secondary, textAlign: 'right' }}>
        {num(row.t, 3)}
      </span>
    </div>
  );
}

function maxAmount(rows: (typeof asks)[number][]) {
  return rows.reduce((m, r) => Math.max(m, r.a), 0);
}

// Two small coloured bars stacked — represents both / asks / bids view mode.
// Used as `children` of IconButton (custom glyph, not a phosphor icon).
function ModeIcon({ topColor, botColor }: { topColor: string; botColor: string }) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ width: tokens.spacing[3], height: '3px', background: topColor }} />
      <span style={{ width: tokens.spacing[3], height: '3px', background: botColor }} />
    </span>
  );
}

const STEP_OPTIONS = ['0.001', '0.01', '0.1', '1', '10'];

export function OrderBook() {
  const askMax = maxAmount(asks);
  const bidMax = maxAmount(bids);

  return (
    <div
      style={{
        position: 'relative',
        background: themeColor.surface.raised,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      }}
    >
      <CornerMarkers />

      {/* Toolbar */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
        }}
      >
        <InsetDivider />
        <IconButton aria-label="Both sides" variant="default" size="sm">
          <ModeIcon topColor={themeColor.red[300]} botColor={themeColor.accent[300]} />
        </IconButton>
        <IconButton aria-label="Asks only" variant="outline" size="sm">
          <ModeIcon topColor={themeColor.red[300]} botColor={themeColor.text.faint} />
        </IconButton>
        <IconButton aria-label="Bids only" variant="outline" size="sm">
          <ModeIcon topColor={themeColor.text.faint} botColor={themeColor.accent[300]} />
        </IconButton>

        <div style={{ flex: 1 }} />

        <Dropdown
          variant="chunk"
          label="0.1"
          items={STEP_OPTIONS}
          selected="0.1"
          align="right"
        />

        <IconButton aria-label="Print depth" variant="outline" size="sm" icon={Printer} />
      </div>

      {/* Column headers */}
      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
          ...COL_HEADER,
        }}
      >
        <span>Price (USDT)</span>
        <span style={{ textAlign: 'right' }}>Amount (SOL)</span>
        <span style={{ textAlign: 'right' }}>Total</span>
        <InsetDivider />
      </div>

      {/* Asks — pinned to bottom of their half */}
      <div
        style={{
          flex: '1 1 0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        {asks.map((row) => (
          <DepthRow key={`ask-${row.p}`} row={row} side="ask" depth={row.a / askMax} />
        ))}
      </div>

      {/* Centerline last-price */}
      <div
        style={{
          position: 'relative',
          padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
          background: themeColor.surface.overlay,
          display: 'flex',
          alignItems: 'baseline',
          gap: tokens.spacing[3],
        }}
      >
        <InsetDivider side="top" />
        <InsetDivider side="bottom" />
        <span
          style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.xl,   // 18px — hero readout
            fontWeight: tokens.typography.weight.semibold,
            color: themeColor.accent[200],
            letterSpacing: tokens.typography.tracking.wide,
          }}
        >
          {num(tape.price, 2)}
        </span>
        <span
          style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.sm,
            color: themeColor.text.muted,
            letterSpacing: tokens.typography.tracking.wide,
          }}
        >
          ${num(tape.priceUsd, 2)}
        </span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.sm,
            color: themeColor.text.faint,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.widest,
          }}
        >
          More
        </span>
        <Funnel weight="regular" size={14} style={{ color: themeColor.accent[300] }} />
      </div>

      {/* Bids */}
      <div style={{ flex: '1 1 0', overflow: 'hidden' }}>
        {bids.map((row) => (
          <DepthRow key={`bid-${row.p}`} row={row} side="bid" depth={row.a / bidMax} />
        ))}
      </div>
    </div>
  );
}
