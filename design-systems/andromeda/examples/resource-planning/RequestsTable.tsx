// ============================================================
// RESOURCE PLANNING · RequestsTable
// Filter tabs, search field, and the request log itself. Rows
// are neutral — selection is the only row-level state, conveyed
// by the leading checkbox; the active filter tab carries the
// "kind of request" context above the table.
// ============================================================

'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { MagnifyingGlass, CaretUp } from '@phosphor-icons/react';
import { tokens } from '../../tokens';
import { CornerMarkers } from '../../components/CornerMarkers';
import { Checkbox } from '../../components/Checkbox';
import { rowContainer, rowItem } from '../../components/lib/motion';
import { easingArray, themeColor } from '../../components/lib/utils';
import { mq } from '../../components/lib/responsive';
import { requestRows, filterTabs } from './data';

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

const ROW_INSET_LINE = `linear-gradient(to right, transparent ${tokens.spacing[3]}, ${themeColor.border.subtle} ${tokens.spacing[3]}, ${themeColor.border.subtle} calc(100% - ${tokens.spacing[3]}), transparent calc(100% - ${tokens.spacing[3]}))`;
const rowSeparatorStyle = {
  backgroundImage: ROW_INSET_LINE,
  backgroundSize: '100% var(--andromeda-border-width, 1px)',
  backgroundPosition: 'bottom',
  backgroundRepeat: 'no-repeat',
};

// ── Filter tab pill ───────────────────────────────────────────────
// The active fill (surface.active + border.bright) lives in a sibling
// motion.span with a shared `layoutId`. Framer animates it between
// tabs as `active` flips — the wrapping <LayoutGroup> in the parent
// scopes the layoutId so two filter strips don't fight each other.
const ms = (v: string) => parseInt(v, 10) / 1000;
const FILTER_TX = {
  duration: ms(tokens.motion.duration.slow),
  ease: easingArray(tokens.motion.easing.standard),
};

type FilterTabProps = {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
};

function FilterTab({ label, count, active, onClick }: FilterTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacing[2],
        padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
        background: 'transparent',
        border: `${tokens.border.thin} transparent`,
        borderRadius: tokens.radius.frame,
        cursor: 'pointer',
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.typography.size.sm,
        color: active ? themeColor.text.primary : themeColor.text.muted,
        textTransform: 'uppercase',
        letterSpacing: tokens.typography.tracking.wider,
        transition: `color var(--andromeda-duration-normal) var(--andromeda-easing-out)`,
      }}
    >
      {active ? (
        <motion.span
          layoutId="rp-filter-indicator"
          aria-hidden="true"
          transition={FILTER_TX}
          style={{
            position: 'absolute',
            inset: 0,
            background: themeColor.surface.active,
            border: `${tokens.border.thin} ${themeColor.border.bright}`,
            borderRadius: tokens.radius.frame,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      ) : null}
      <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[2] }}>
        {label}
        <span
          style={{
            fontSize: tokens.typography.size.xs,
            color: themeColor.text.faint,
            letterSpacing: tokens.typography.tracking.wide,
          }}
        >
          {count}
        </span>
      </span>
    </button>
  );
}

// ── Sortable column header ───────────────────────────────────────
// verticalAlign:'top' so the header label's top edge aligns with the
// checkbox column's top edge (which also uses 'top'); padding-top
// matches the row cells so the rhythm reads as a single grid.
type ColHeaderProps = {
  children: ReactNode;
  sorted?: boolean;
  align?: 'left' | 'right';
};

function ColHeader({ children, sorted, align = 'left' }: ColHeaderProps) {
  return (
    <th
      style={{
        textAlign: align,
        verticalAlign: 'top',
        padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
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
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], lineHeight: 'var(--andromeda-leading-none, 1)', height: '16px' }}>
        {children}
        {sorted ? <CaretUp weight="bold" size={10} /> : null}
      </span>
    </th>
  );
}

// ── Composition ──────────────────────────────────────────────────
export function RequestsTable() {
  const [activeFilter, setActiveFilter] = useState('pending');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(() => new Set<string>());

  const filtered = requestRows.filter((r) => {
    if (activeFilter !== 'all' && activeFilter !== 'recent' && r.status !== activeFilter) return false;
    if (query && !r.team.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  // Use the team name as the row identity — it's unique across requestRows
  // and stable across filter changes, which is what AnimatePresence needs
  // to track which row entered, which left, and which stayed put.
  const filteredKeys = filtered.map((r) => r.team);
  const allSelected = filteredKeys.length > 0 && filteredKeys.every((k) => selected.has(k));

  function toggleRow(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll(next: boolean) {
    setSelected((prev) => {
      const out = new Set(prev);
      if (next) filteredKeys.forEach((k) => out.add(k));
      else filteredKeys.forEach((k) => out.delete(k));
      return out;
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
      }}
    >
      <CornerMarkers />

      {/* Filter row */}
      <div
        className="rp-filterbar"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[1],
          padding: `${tokens.spacing[3]} ${tokens.spacing[3]}`,
          minWidth: 0,
        }}
      >
        <InsetDivider />
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], flex: 1, minWidth: 0, overflowX: 'auto' }}>
          <LayoutGroup id="rp-filter-tabs">
            {filterTabs.map((t) => (
              <FilterTab
                key={t.id}
                label={t.label}
                count={t.count}
                active={activeFilter === t.id}
                onClick={() => setActiveFilter(t.id)}
              />
            ))}
          </LayoutGroup>
        </div>
        <label
          className="rp-filtersearch"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            height: tokens.spacing[8],
            flexShrink: 0,
            padding: `0 ${tokens.spacing[2]}`,
            background: 'transparent',
            border: `${tokens.border.thin} ${themeColor.border.base}`,
            borderRadius: tokens.radius.frame,
            color: themeColor.text.muted,
          }}
        >
          <MagnifyingGlass weight="regular" size={14} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search by team"
            placeholder="SEARCH"
            style={{
              width: tokens.spacing[12],
              maxWidth: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: themeColor.text.primary,
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              letterSpacing: tokens.typography.tracking.wider,
              textTransform: 'uppercase',
            }}
          />
        </label>
      </div>
      {/* Below `sm` the single row can't hold both the tab strip and the search
          field — the active-tab fill slides under the search box ("RECENT"
          behind SEARCH). Faithful stack: tabs keep their own row on top, the
          search drops below them full-width (the DateRangePicker precedent —
          for a wide control, full-width beats squeezing). !important because
          the base styles are inline (same rule as the hover <style> blocks). */}
      <style>{`
        ${mq.sm} {
          .rp-filterbar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: ${tokens.spacing[2]} !important;
          }
          .rp-filtersearch input { flex: 1 !important; width: auto !important; }
        }
      `}</style>

      {/* Table — auto layout so columns size to content; cells nowrap so the
          horizontal rhythm is consistent regardless of content length. The
          parent has overflow:auto, so on narrow widths the table scrolls
          horizontally rather than corrupting the layout. */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <thead>
            <tr style={rowSeparatorStyle}>
              <th
                style={{
                  width: tokens.spacing[8],
                  verticalAlign: 'top',
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
              <ColHeader>Team</ColHeader>
              <ColHeader sorted>Date</ColHeader>
              <ColHeader align="right">Amount</ColHeader>
            </tr>
          </thead>
          <motion.tbody
            variants={rowContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <AnimatePresence initial={false}>
            {filtered.map((r) => {
              const key = r.team;
              const isSelected = selected.has(key);
              return (
                <motion.tr
                  key={key}
                  variants={rowItem}
                  exit="exit"
                  onClick={() => toggleRow(key)}
                  style={{
                    ...rowSeparatorStyle,
                    // off-token: 100ms + 'ease' have no motion-token equivalent
                    transition: 'background 100ms ease',
                  }}
                  className="rp-row"
                >
                  {/* stopPropagation so a direct checkbox click doesn't ALSO
                      trigger the row onClick (which would toggle twice). */}
                  <td onClick={(e) => e.stopPropagation()} style={{ position: 'relative', padding: `${tokens.spacing[3]} 0 ${tokens.spacing[3]} ${tokens.spacing[3]}`, verticalAlign: 'top' }}>
                    {/* Selection edge bar — slides in from left when the row
                        is selected. Anchored to the first TD which provides
                        the relative positioning context. transformOrigin:left
                        + scaleX is what gives the wipe; opacity carries the
                        moment the bar is fully out. */}
                    <AnimatePresence>
                      {isSelected ? (
                        <motion.span
                          aria-hidden
                          initial={{ scaleX: 0, opacity: 0 }}
                          animate={{ scaleX: 1, opacity: 1 }}
                          exit={{ scaleX: 0, opacity: 0 }}
                          transition={{
                            duration: parseInt(tokens.motion.duration.normal, 10) / 1000,
                            ease: easingArray(tokens.motion.easing.out),
                          }}
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: tokens.spacing[1],
                            bottom: tokens.spacing[1],
                            width: '2px',
                            background: themeColor.accent[300],
                            transformOrigin: 'left',
                            pointerEvents: 'none',
                          }}
                        />
                      ) : null}
                    </AnimatePresence>
                    <Checkbox
                      aria-label={`Select ${r.team}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleRow(key)}
                    />
                  </td>
                  <td
                    style={{
                      padding: `${tokens.spacing[3]} ${tokens.spacing[3]}`,
                      whiteSpace: 'nowrap',
                      verticalAlign: 'top',
                    }}
                  >
                    <span style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                      <span
                        style={{
                          fontFamily: tokens.typography.fontMono,
                          fontSize: tokens.typography.size.sm,
                          color: themeColor.text.primary,
                          letterSpacing: tokens.typography.tracking.wide,
                          lineHeight: 'var(--andromeda-leading-none, 1)',
                          height: '16px',
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        {r.team}
                      </span>
                      <span
                        style={{
                          fontFamily: tokens.typography.fontMono,
                          fontSize: tokens.typography.size.xs,
                          color: themeColor.text.muted,
                          letterSpacing: tokens.typography.tracking.wide,
                          lineHeight: 'var(--andromeda-leading-none, 1)',
                        }}
                      >
                        {r.owner}
                      </span>
                    </span>
                  </td>
                  <td
                    style={{
                      padding: `${tokens.spacing[3]} ${tokens.spacing[3]}`,
                      fontFamily: tokens.typography.fontMono,
                      fontSize: tokens.typography.size.sm,
                      color: themeColor.text.secondary,
                      letterSpacing: tokens.typography.tracking.wide,
                      whiteSpace: 'nowrap',
                      verticalAlign: 'top',
                      lineHeight: 'var(--andromeda-leading-none, 1)',
                      height: '16px',
                    }}
                  >
                    {r.submitted}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      padding: `${tokens.spacing[3]} ${tokens.spacing[3]} ${tokens.spacing[3]} 0`,
                      fontFamily: tokens.typography.fontMono,
                      fontSize: tokens.typography.size.sm,
                      fontWeight: tokens.typography.weight.medium,
                      color: themeColor.text.primary,
                      letterSpacing: tokens.typography.tracking.wide,
                      whiteSpace: 'nowrap',
                      verticalAlign: 'top',
                      lineHeight: 'var(--andromeda-leading-none, 1)',
                    }}
                  >
                    {r.amount}
                  </td>
                </motion.tr>
              );
            })}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
