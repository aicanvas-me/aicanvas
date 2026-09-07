// ============================================================
// SERVICE ORDER · ItemsPanel
// Bottom section of the page. Three stacked strips:
//   1. Tabs        — Products | Billings | Inventory | History
//   2. Filter row  — funnel + label + dismissible Tag chips + kebab
//   3. Table       — checkbox + 9 product columns + per-row PanelMenu
//
// Selected row uses surface.active background plus an accent-300 left
// edge bar; row hover uses surface.hover. Sortable columns get a
// CaretUp/Down indicator on the active sort column.
// ============================================================

'use client';

import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Funnel,
  CaretUp,
  CaretDown,
  CaretUpDown,
  Pencil,
  Copy,
  Export,
  EyeSlash,
  ArrowsClockwise,
  Sliders,
} from '@phosphor-icons/react';

import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { mq } from '../../components/lib/responsive';
import { CornerMarkers } from '../../components/CornerMarkers';
import { Checkbox } from '../../components/Checkbox';
import { IconButton } from '../../components/IconButton';
import { ProgressBar } from '../../components/ProgressBar';
import type { ProgressBarProps } from '../../components/ProgressBar';
import { Tag } from '../../components/Tag';
import { PanelMenu } from '../../components/PanelMenu';
import { Tooltip } from '../../components/Tooltip';
import { rowContainer, rowItem } from '../../components/lib/motion';
import { itemTabs, filterChips, productRows, initiallySelected } from './data';

function InsetDivider({ side = 'bottom' }) {
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

// Inset row separator for tables — drawn via background-image because TR
// borders don't render under border-collapse:collapse.
const ROW_INSET_LINE = `linear-gradient(to right, transparent ${tokens.spacing[3]}, ${themeColor.border.subtle} ${tokens.spacing[3]}, ${themeColor.border.subtle} calc(100% - ${tokens.spacing[3]}), transparent calc(100% - ${tokens.spacing[3]}))`;
const rowSeparatorStyle = {
  backgroundImage: ROW_INSET_LINE,
  backgroundSize: '100% var(--andromeda-border-width, 1px)',
  backgroundPosition: 'bottom',
  backgroundRepeat: 'no-repeat',
};

// ── Hover stylesheet — class rules so they win over inline styles ─
function HoverStyles() {
  return (
    <style>{`
      /* off-token: hover transitions use the 'ease' keyword (no matching
         Andromeda easing token) and 100ms (no duration token) — left literal. */
      .so-tab        { transition: color 140ms ease; }
      .so-tab:hover  { color: ${themeColor.text.primary} !important; }

      .so-row        { transition: background-color 100ms ease; cursor: pointer; }
      .so-row:hover  { background-color: ${themeColor.surface.hover} !important; }
      .so-row.is-selected:hover { background-color: ${themeColor.surface.active} !important; }

      .so-link       { transition: color 140ms ease; }
      .so-link:hover { color: ${themeColor.text.primary} !important; text-decoration: underline; }

      .so-icon-btn   { transition: color 140ms ease, background-color 140ms ease; }
      .so-icon-btn:hover { color: ${themeColor.text.primary} !important; background-color: ${themeColor.surface.hover} !important; }
    `}</style>
  );
}

// ── Tab strip ──────────────────────────────────────────────────────
// Wide tab row: scrolls horizontally inside the panel when it can't fit a
// narrow viewport (faithful stack — same treatment as the table below it,
// never a wrap or a re-skin). The inset divider stays edge-aligned because
// it's a sibling outside the scroll container.
function TabStrip({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        gap: tokens.spacing[1],
        padding: `0 ${tokens.spacing[3]}`,
        overflowX: 'auto',
        minWidth: 0,
      }}
    >
      <InsetDivider />
      {itemTabs.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            className="so-tab"
            onClick={() => onChange(t.id)}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[3]} ${tokens.spacing[3]}`,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.sm,
              fontWeight: active ? tokens.typography.weight.semibold : tokens.typography.weight.regular,
              color: active ? themeColor.text.primary : themeColor.text.muted,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.wider,
            }}
          >
            {t.label}
            <span
              style={{
                fontSize: tokens.typography.size.xs,
                color: themeColor.text.faint,
                letterSpacing: tokens.typography.tracking.wide,
              }}
            >
              {t.count}
            </span>
            {active ? (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '-1px',
                  height: '2px',
                  background: themeColor.accent[300],
                }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

// ── Filter row (funnel + label + chips + kebab) ────────────────────
function FilterRow({ chips, onRemoveChip }: { chips: string[]; onRemoveChip: (label: string) => void }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[3],
        padding: `${tokens.spacing[3]} ${tokens.spacing[3]}`,
        minWidth: 0,
      }}
    >
      <InsetDivider />
      <Funnel weight="regular" size={14} style={{ color: themeColor.text.muted, flexShrink: 0 }} />
      <span
        className="so-filter-label"
        style={{
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.xs,
          color: themeColor.text.muted,
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.widest,
          // Shrink + truncate so the funnel, chips scroller and action
          // buttons all fit a narrow row without forcing page scroll.
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        List of Products
      </span>

      <span
        className="so-filter-divider"
        aria-hidden
        style={{
          width: 'var(--andromeda-border-width, 1px)',
          height: tokens.spacing[5],
          background: themeColor.border.subtle,
          flexShrink: 0,
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          flex: 1,
          minWidth: 0,
          overflowX: 'auto',
        }}
      >
        {chips.map((label) => (
          <Tag key={label} variant="default" onClose={() => onRemoveChip(label)} style={{ flexShrink: 0 }}>
            {label}
          </Tag>
        ))}
      </div>

      <Tooltip label="Refresh">
        <IconButton aria-label="Refresh" variant="ghost" size="md" icon={ArrowsClockwise} />
      </Tooltip>
      <Tooltip label="Configure">
        <IconButton aria-label="Configure" variant="ghost" size="md" icon={Sliders} />
      </Tooltip>
      <Tooltip label="Export">
        <IconButton aria-label="Export" variant="ghost" size="md" icon={Export} />
      </Tooltip>

      <style>{`
        ${mq.sm} {
          /* On the smallest phones drop the "List of Products" label and its
             divider — the funnel icon still reads as "filter" — so the chip
             scroller and the three action buttons keep their room. */
          .so-filter-label { display: none !important; }
          .so-filter-divider { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ── Sortable column header ────────────────────────────────────────
function ColHeader({ children, align = 'left', sort }: {
  children?: ReactNode;
  align?: CSSProperties['textAlign'];
  sort?: 'asc' | 'desc' | 'sortable';
}) {
  // sort: 'asc' | 'desc' | 'sortable' | undefined
  const sortIcon =
    sort === 'asc'  ? <CaretUp     weight="bold" size={10} /> :
    sort === 'desc' ? <CaretDown   weight="bold" size={10} /> :
    sort === 'sortable' ? <CaretUpDown weight="regular" size={10} /> :
    null;

  const sorted = sort === 'asc' || sort === 'desc';

  return (
    <th
      style={{
        textAlign: align,
        verticalAlign: 'middle',
        padding: `${tokens.spacing[3]} ${tokens.spacing[3]}`,
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.typography.size.xs,
        fontWeight: tokens.typography.weight.medium,
        color: sorted ? themeColor.text.primary : themeColor.text.muted,
        textTransform: 'uppercase',
        letterSpacing: tokens.typography.tracking.widest,
        lineHeight: 'var(--andromeda-leading-none, 1)',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: tokens.spacing[1],
          lineHeight: 'var(--andromeda-leading-none, 1)',
          height: '16px',
          color: 'inherit',
        }}
      >
        {children}
        {sortIcon ? (
          <span style={{ color: sorted ? themeColor.text.primary : themeColor.text.faint, display: 'inline-flex' }}>
            {sortIcon}
          </span>
        ) : null}
      </span>
    </th>
  );
}

function loadVariant(v: number): ProgressBarProps['variant'] {
  if (v >= 85) return 'fault';
  if (v >= 60) return 'warning';
  return 'default';
}

// ── Table cell helper ──────────────────────────────────────────────
function Cell({ children, align = 'left', muted = false, mono = true, nowrap = true }: {
  children?: ReactNode;
  align?: CSSProperties['textAlign'];
  muted?: boolean;
  mono?: boolean;
  nowrap?: boolean;
}) {
  return (
    <td
      style={{
        textAlign: align,
        verticalAlign: 'middle',
        padding: `${tokens.spacing[3]} ${tokens.spacing[3]}`,
        fontFamily: mono ? tokens.typography.fontMono : tokens.typography.fontSans,
        fontSize: tokens.typography.size.sm,
        color: muted ? themeColor.text.secondary : themeColor.text.primary,
        letterSpacing: tokens.typography.tracking.wide,
        whiteSpace: nowrap ? 'nowrap' : 'normal',
        lineHeight: 'var(--andromeda-leading-none, 1)',
      }}
    >
      {children}
    </td>
  );
}

// ── Composition ────────────────────────────────────────────────────
export function ItemsPanel() {
  const [tab, setTab] = useState('products');
  const [chips, setChips] = useState(filterChips);
  const [selected, setSelected] = useState(() => new Set(initiallySelected));

  const allSelected = productRows.length > 0 && productRows.every((r) => selected.has(r.id));

  function removeChip(label: string) {
    setChips((prev) => prev.filter((c) => c !== label));
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(next: boolean) {
    setSelected(() => {
      if (next) return new Set(productRows.map((r) => r.id));
      return new Set();
    });
  }

  return (
    <div
      style={{
        position: 'relative',
        background: themeColor.surface.raised,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        // minWidth:0 so the wide table (inside its own overflow:auto wrapper)
        // can't push the panel past its column and force page scroll.
        minWidth: 0,
      }}
    >
      <CornerMarkers />
      <HoverStyles />

      <TabStrip value={tab} onChange={setTab} />
      <FilterRow chips={chips} onRemoveChip={removeChip} />

      {/* Table — scrolls on narrow/short viewports so the layout stays intact.
          A bottom gutter (paddingBottom) gives the last row room to scroll fully
          clear of any fixed bottom chrome, instead of stopping half-hidden. */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', paddingBottom: tokens.spacing[12] }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <thead>
            <tr style={rowSeparatorStyle}>
              <th
                style={{
                  width: tokens.spacing[8],
                  verticalAlign: 'middle',
                  padding: `${tokens.spacing[3]} 0 ${tokens.spacing[3]} ${tokens.spacing[3]}`,
                  lineHeight: 'var(--andromeda-leading-none, 1)',
                }}
              >
                <Checkbox
                  aria-label="Select all"
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                />
              </th>
              <ColHeader>Current Load</ColHeader>
              <ColHeader sort="sortable">Order ID</ColHeader>
              <ColHeader sort="sortable">Part ID</ColHeader>
              <ColHeader sort="sortable">Source Location</ColHeader>
              <ColHeader sort="asc">Source Level</ColHeader>
              <ColHeader sort="sortable">Service Level</ColHeader>
              <ColHeader sort="sortable">GMM (Value)</ColHeader>
              <ColHeader sort="sortable" align="right">Total Volume</ColHeader>
              <th style={{ width: tokens.spacing[10] }} />
            </tr>
          </thead>
          <motion.tbody
            variants={rowContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {productRows.map((r) => {
              const isSelected = selected.has(r.id);
              return (
                <motion.tr
                  key={r.id}
                  variants={rowItem}
                  className={`so-row${isSelected ? ' is-selected' : ''}`}
                  onClick={() => toggleRow(r.id)}
                  style={{
                    backgroundColor: isSelected ? themeColor.surface.active : 'transparent',
                    ...rowSeparatorStyle,
                    boxShadow: isSelected ? `inset 2px 0 0 0 ${themeColor.accent[300]}` : undefined,
                  }}
                >
                  <td
                    style={{
                      padding: `${tokens.spacing[3]} 0 ${tokens.spacing[3]} ${tokens.spacing[3]}`,
                      verticalAlign: 'middle',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      aria-label={`Select ${r.id}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleRow(r.id)}
                    />
                  </td>
                  <Cell>
                    <div style={{ zoom: 0.5 }}>
                      <ProgressBar value={r.load} variant={loadVariant(r.load)} />
                    </div>
                  </Cell>
                  <Cell muted>{r.id}</Cell>
                  <Cell>{r.part}</Cell>
                  <Cell muted>{r.source}</Cell>
                  <Cell>{r.sourceLvl}%</Cell>
                  <Cell>{r.serviceLvl}</Cell>
                  <Cell>{r.gmm}</Cell>
                  <Cell align="right">{r.total}</Cell>
                  <td
                    style={{
                      verticalAlign: 'middle',
                      padding: `${tokens.spacing[2]} ${tokens.spacing[2]}`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PanelMenu
                      ariaLabel={`Actions for ${r.id}`}
                      items={[
                        { label: 'Edit',      icon: Pencil, onSelect: () => {} },
                        { label: 'Duplicate', icon: Copy,   onSelect: () => {} },
                        { label: 'Export',    icon: Export, onSelect: () => {} },
                        { type: 'separator' },
                        { label: 'Hide',      icon: EyeSlash, destructive: true, onSelect: () => {} },
                      ]}
                    />
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
