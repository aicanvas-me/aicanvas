// ============================================================
// COMPONENT: Table
// Compound primitive for dense data tables:
//   Table / TableHead / TableBody / TableRow / TableHeader / TableCell
//
// Features:
//   - Consistent mono typography, verticalAlign:top, 1px subtle dividers
//   - TableHeader accepts sort="asc|desc|sortable" → renders the correct caret
//   - TableRow accepts selected (accent-300 left edge + surface.active bg)
//     and hover state via the included <TableStyles /> helper
// ============================================================

'use client';

import { forwardRef, useEffect } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { CaretUp, CaretDown, CaretUpDown } from '@phosphor-icons/react';
import { tokens } from '../tokens';
import { andromedaVars, themeColor } from './lib/utils';
import { mq } from './lib/responsive';

// ── Global hover stylesheet ────────────────────────────────────────
// Inject once per page. Class-based rules beat inline styles so the
// hover lift fires correctly even when rows carry an inline background.
const TABLE_STYLE_ID = 'andromeda-table-styles';
const TABLE_STYLES = `
      /* off-token 100ms ease, deliberate — no matching duration/easing token */
      .andro-tr         { transition: background-color 100ms ease; cursor: default; }
      .andro-tr-hover   { cursor: pointer; }
      .andro-tr-hover:hover { background-color: var(--andromeda-surface-hover) !important; }
      /* Horizontal-scroll wrapper. The wide table scrolls INSIDE this panel
         (faithful stack — never reflow rows into cards), and the panel itself
         never grows past its grid cell, so it can't force horizontal page
         scroll. overscroll-behavior-x:contain keeps a swipe that bottoms out
         the table from chaining to a page-level horizontal scroll. */
      .andro-scroll {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-x: contain;
      }
      /* Touch devices hide the scrollbar (overlay), so a horizontally-
         scrolled last column can sit flush against the panel edge with no
         visible affordance. A small bottom gutter on coarse pointers keeps
         the final row clear of the overlay scrollbar track. */
      ${mq.coarse} {
        .andro-scroll { padding-bottom: var(--andromeda-1); }
      }
    `;

export function TableStyles() {
  // Dedupe guard — multiple <Table> instances on a page would otherwise
  // each inject this stylesheet. Mirror the keyframe-injection guard used
  // in Spinner/StatTile: check for the id before appending so the rules
  // land exactly once per document.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById(TABLE_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = TABLE_STYLE_ID;
    style.textContent = TABLE_STYLES;
    document.head.appendChild(style);
  }, []);
  return null;
}

// Linear-gradient bottom line that insets 12px from each side.
// Used as a TR background-image so it survives border-collapse:collapse
// (real TR borders don't render under collapse).
const ROW_INSET_LINE = `linear-gradient(to right, transparent var(--andromeda-3, ${tokens.spacing[3]}), var(--andromeda-border-subtle, ${themeColor.border.subtle}) var(--andromeda-3, ${tokens.spacing[3]}), var(--andromeda-border-subtle, ${themeColor.border.subtle}) calc(100% - var(--andromeda-3, ${tokens.spacing[3]})), transparent calc(100% - var(--andromeda-3, ${tokens.spacing[3]})))`;

// ── Table ──────────────────────────────────────────────────────────
export const Table = forwardRef<HTMLTableElement, ComponentPropsWithoutRef<'table'>>(function Table(
  { className, style, children, ...props },
  ref,
) {
  return (
    <div
      className="andro-scroll"
      style={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflow: 'auto',
        ...andromedaVars(),
      }}
    >
      <table
        ref={ref}
        className={className}
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'auto',
          fontFamily: tokens.typography.fontMono,
          ...style,
        }}
        {...props}
      >
        {children}
      </table>
    </div>
  );
});

// ── TableHead / TableBody ──────────────────────────────────────────
export const TableHead = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'thead'>>(
  function TableHead({ children, ...props }, ref) {
    return <thead ref={ref} {...props}>{children}</thead>;
  },
);

export const TableBody = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'tbody'>>(
  function TableBody({ children, ...props }, ref) {
    return <tbody ref={ref} {...props}>{children}</tbody>;
  },
);

// ── TableRow ───────────────────────────────────────────────────────
/**
 * @typedef {object} TableRowProps
 * @property {boolean} [selected=false]  Applies surface.active bg + accent-300 left edge.
 * @property {boolean} [hoverable=true] Adds the hover-lift class (default true).
 */
type TableRowProps = ComponentPropsWithoutRef<'tr'> & {
  selected?: boolean;
  hoverable?: boolean;
};

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { selected = false, hoverable = true, className = '', style, children, ...props },
  ref,
) {
  return (
    <tr
      ref={ref}
      className={`andro-tr${hoverable ? ' andro-tr-hover' : ''}${className ? ` ${className}` : ''}`}
      style={{
        backgroundColor: selected ? themeColor.surface.active : 'transparent',
        backgroundImage: ROW_INSET_LINE,
        backgroundSize: '100% 1px',
        backgroundPosition: 'bottom',
        backgroundRepeat: 'no-repeat',
        boxShadow: selected ? `inset 2px 0 0 0 var(--andromeda-accent-300, ${themeColor.accent[300]})` : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </tr>
  );
});

// ── TableHeader (sortable <th>) ────────────────────────────────────
/**
 * @typedef {object} TableHeaderProps
 * @property {'asc'|'desc'|'sortable'|undefined} [sort]  Column sort state; picks the matching caret and sets aria-sort.
 * @property {'left'|'right'|'center'} [align='left']  Horizontal text alignment of the header cell.
 */
type TableHeaderProps = Omit<ComponentPropsWithoutRef<'th'>, 'align'> & {
  sort?: 'asc' | 'desc' | 'sortable';
  align?: 'left' | 'right' | 'center';
};

export const TableHeader = forwardRef<HTMLTableCellElement, TableHeaderProps>(function TableHeader(
  { sort, align = 'left', children, style, ...props },
  ref,
) {
  const sorted = sort === 'asc' || sort === 'desc';
  const sortable = sorted || sort === 'sortable';
  const ariaSort =
    sort === 'asc'      ? 'ascending'  :
    sort === 'desc'     ? 'descending' :
    sort === 'sortable' ? 'none'       :
    undefined;
  const sortIcon =
    sort === 'asc'      ? <CaretUp     weight="bold"    size={10} /> :
    sort === 'desc'     ? <CaretDown   weight="bold"    size={10} /> :
    sort === 'sortable' ? <CaretUpDown weight="regular" size={10} /> :
    null;

  return (
    <th
      ref={ref}
      scope="col"
      aria-sort={sortable ? ariaSort : undefined}
      style={{
        textAlign: align,
        verticalAlign: 'top',
        padding: `${tokens.spacing[3]} ${tokens.spacing[3]}`,
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.typography.size.xs,
        fontWeight: tokens.typography.weight.medium,
        color: sorted ? themeColor.text.primary : themeColor.text.muted,
        textTransform: 'uppercase',
        letterSpacing: tokens.typography.tracking.widest,
        lineHeight: 'var(--andromeda-leading-none, 1)',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...props}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1] }}>
        {children}
        {sortIcon ? (
          <span style={{ color: sorted ? themeColor.text.primary : themeColor.text.faint, display: 'inline-flex' }}>
            {sortIcon}
          </span>
        ) : null}
      </span>
    </th>
  );
});

// ── TableCell ──────────────────────────────────────────────────────
/**
 * @typedef {object} TableCellProps
 * @property {'left'|'right'|'center'} [align='left']  Horizontal text alignment of the cell content.
 * @property {boolean} [muted=false]  Uses text.secondary instead of text.primary.
 * @property {boolean} [nowrap=true]  Keeps the cell content on a single line when true.
 */
type TableCellProps = Omit<ComponentPropsWithoutRef<'td'>, 'align'> & {
  align?: 'left' | 'right' | 'center';
  muted?: boolean;
  nowrap?: boolean;
};

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { align = 'left', muted = false, nowrap = true, children, style, ...props },
  ref,
) {
  return (
    <td
      ref={ref}
      style={{
        textAlign: align,
        verticalAlign: 'top',
        padding: `${tokens.spacing[3]} ${tokens.spacing[3]}`,
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.typography.size.sm,
        color: muted ? themeColor.text.secondary : themeColor.text.primary,
        letterSpacing: tokens.typography.tracking.wide,
        whiteSpace: nowrap ? 'nowrap' : 'normal',
        lineHeight: 1,
        ...style,
      }}
      {...props}
    >
      {children}
    </td>
  );
});
