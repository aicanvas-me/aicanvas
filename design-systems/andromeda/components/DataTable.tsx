// ============================================================================
// DATATABLE
// A configuration-driven, dense data grid for rendering array data with stable
// column priority, row selection, and a compact mobile detail affordance. Use it
// when the data model is regular enough to describe with columns and rows.
//
// Props: columns configure content and responsive priority; rows provide data;
// getRowKey identifies rows; onRowClick and selectedRowKey control interaction;
// className and style customize the root wrapper.
// ============================================================================
'use client';

import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, ReactElement, ReactNode, Ref } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { tokens } from '../tokens';
import { cn, andromedaVars } from './lib/utils';
import { useReducedMotion, rowContainer, rowItem } from './lib/motion';
import { mq } from './lib/responsive';
import { IconButton } from './IconButton';
import { Tooltip } from './Tooltip';
import { Info } from '@phosphor-icons/react';

// Rows are plain objects the columns read by key; the values a column can pull
// out of one are whatever React can render. A column without `render` reads its
// key straight off the row, so the row values have to be renderable.
type RowRecord = Record<string, ReactNode>;

type DataTableColumn<Row extends RowRecord = RowRecord> = {
  key: string;
  header: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  // 'md' is the only breakpoint honoured, and the fold targets are
  // 'info' | 'meta' | 'none'; both stay open strings so a caller can build its
  // column list as a plain array without pinning every literal.
  hideBelow?: string;
  fold?: string;
  // Arrow-function property syntax on the row callbacks, not method syntax:
  // methods are compared bivariantly, so a column reading fields the rows do
  // not have would type-check and then crash. Properties are checked strictly.
  infoValue?: (row: Row) => ReactNode;
  primary?: boolean;
  color?: string | ((row: Row) => string);
  render?: (row: Row) => ReactNode;
};

const DEFAULT_ROWS = [
  {
    id: 'track-01',
    track: 'Signal Drift',
    artist: 'Vela Array',
    duration: '03:42',
    plays: '128.4K',
    last: 'T-02m',
  },
  {
    id: 'track-02',
    track: 'Night Transit',
    artist: 'Polar Relay',
    duration: '04:18',
    plays: '96.8K',
    last: 'T-17m',
  },
  {
    id: 'track-03',
    track: 'Low Orbit',
    artist: 'Kepler Static',
    duration: '02:56',
    plays: '74.2K',
    last: 'T-41m',
  },
];

const DEFAULT_COLUMNS: DataTableColumn[] = [
  {
    key: 'track',
    header: 'Track',
    primary: true,
    color: `var(--andromeda-text-primary, ${tokens.color.text.primary})`,
  },
  {
    key: 'artist',
    header: 'Artist',
    hideBelow: 'md',
  },
  {
    key: 'duration',
    header: 'Duration',
    width: `calc(${tokens.spacing[12]} + ${tokens.spacing[3]})`,
    align: 'right',
    hideBelow: 'md',
  },
  {
    key: 'plays',
    header: 'Plays',
    width: `calc(${tokens.spacing[12]} + ${tokens.spacing[6]})`,
    align: 'right',
    hideBelow: 'md',
  },
  {
    key: 'last',
    header: 'Last',
    width: `calc(${tokens.spacing[12]} + ${tokens.spacing[3]})`,
    align: 'right',
    hideBelow: 'md',
  },
];

// Rows are keyed by their `id`; pass getRowKey when the rows carry no id.
const DEFAULT_GET_ROW_KEY = (row: RowRecord) => row.id as string | number;
// var() fallback for the inset divider height, the same 1px as tokens.border.thin.
const HAIRLINE_WIDTH = '1px';
// Reduced motion keeps the same hidden start, so server and client markup
// match, and lands every row at once with no fade and no stagger.
const STILL_CONTAINER: Variants = { hidden: {}, visible: {} };
const STILL_ROW: Variants = { ...rowItem, visible: { opacity: 1, transition: { duration: 0 } } };
// Each color stop carries its own var() so the rule follows the surface it sits
// on; a baked literal here would stay near-black on a light ground.
const DIVIDER = `var(--andromeda-border-subtle, ${tokens.color.border.subtle})`;
const ROW_INSET = () =>
  `linear-gradient(to right, transparent, transparent ${tokens.spacing[3]}, ${DIVIDER} ${tokens.spacing[3]}, ${DIVIDER} calc(100% - ${tokens.spacing[3]}), transparent calc(100% - ${tokens.spacing[3]}))`;

const renderColumnValue = (column: DataTableColumn, row: RowRecord): ReactNode => {
  const value = column.render ? column.render(row) : row?.[column.key];
  return value === null || value === undefined || value === '' ? '—' : value;
};

// Textual value for a mobile fold (the primary column's sub-line or the info
// tooltip). Prefers `infoValue` (a text-returning fn) over the raw field, and
// deliberately NOT `render` — a visual cell (e.g. a meter) reads as text here.
const foldText = (column: DataTableColumn, row: RowRecord): ReactNode => {
  if (typeof column.infoValue === 'function') return column.infoValue(row);
  const value = row?.[column.key];
  return value === null || value === undefined || value === '' ? '—' : value;
};

const resolveCellColor = (column: DataTableColumn, row: RowRecord) =>
  typeof column.color === 'function'
    ? column.color(row)
    : column.color ?? `var(--andromeda-text-secondary, ${tokens.color.text.secondary})`;

/**
 * @typedef {object} DataTableProps
 * @property {Array<{key: string, header: string, width?: string|number, align?: 'left'|'center'|'right', hideBelow?: 'md', fold?: 'info'|'meta'|'none', infoValue?: (row: object) => React.ReactNode, primary?: boolean, color?: string|((row: object) => string), render?: (row: object) => React.ReactNode}>} [columns=DEFAULT_COLUMNS] Column definitions. `hideBelow:'md'` hides the column on phones; it then folds into the per-row info tooltip (`fold:'info'`, the default), the primary column's mobile sub-line (`fold:'meta'`), or nowhere (`fold:'none'`). `infoValue` supplies the textual value shown in a fold (use it for visual cells like meters); `render` is the desktop cell.
 * @property {Array<object>} [rows=DEFAULT_ROWS] Row objects consumed by the column definitions.
 * @property {(row: object) => string|number} [getRowKey=DEFAULT_GET_ROW_KEY] Returns a stable key for each row.
 * @property {(row: object) => void} [onRowClick] Runs when a row is clicked, or activated with Enter or Space. Rows are only focusable and show a hover state when it is passed.
 * @property {string|number} [selectedRowKey='track-02'] Identifies the current row shown with an active measurement edge.
 * @property {string} [className='']
 * @property {React.CSSProperties} [style={}]
 */
type DataTableOwnProps<Row extends RowRecord = RowRecord> = {
  columns?: DataTableColumn<Row>[];
  rows?: Row[];
  getRowKey?: (row: Row) => string | number;
  onRowClick?: (row: Row) => void;
  selectedRowKey?: string | number;
  className?: string;
  style?: CSSProperties;
};

type DataTableProps<Row extends RowRecord = RowRecord> = DataTableOwnProps<Row> &
  Omit<ComponentPropsWithoutRef<'div'>, keyof DataTableOwnProps<Row>>;

/** @type {React.ForwardRefExoticComponent<DataTableProps & React.HTMLAttributes<HTMLDivElement>>} */
export const DataTable = forwardRef<HTMLDivElement, DataTableProps>(function DataTable(
  {
    columns = DEFAULT_COLUMNS,
    rows = DEFAULT_ROWS,
    getRowKey = DEFAULT_GET_ROW_KEY,
    onRowClick,
    selectedRowKey = 'track-02',
    className = '',
    style = {},
    ...props
  },
  ref,
) {
  const reducedMotion = useReducedMotion();
  const interactive = typeof onRowClick === 'function';
  // Hidden-on-mobile columns split by fold target: 'meta' → the primary
  // column's mobile sub-line; anything else (default 'info') → the info tooltip.
  const metaColumns = columns.filter((c) => c.hideBelow === 'md' && c.fold === 'meta');
  const infoColumns = columns.filter((c) => c.hideBelow === 'md' && c.fold !== 'meta' && c.fold !== 'none');

  const headerRowStyle: CSSProperties = {
    backgroundImage: ROW_INSET(),
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'bottom left',
    backgroundSize: `100% var(--andromeda-border-width, ${HAIRLINE_WIDTH})`,
  };

  const headerCellStyle: CSSProperties = {
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    fontFamily: tokens.typography.fontMono,
    fontSize: tokens.typography.size.xs,
    fontWeight: tokens.typography.weight.medium,
    letterSpacing: tokens.typography.tracking.wider,
    lineHeight: 1,
    color: `var(--andromeda-text-muted, ${tokens.color.text.muted})`,
    textTransform: 'uppercase',
    verticalAlign: 'bottom',
    whiteSpace: 'nowrap',
  };

  const cellStyle: CSSProperties = {
    padding: tokens.spacing[3],
    fontFamily: tokens.typography.fontMono,
    fontSize: tokens.typography.size.sm,
    lineHeight: 1,
    color: `var(--andromeda-text-secondary, ${tokens.color.text.secondary})`,
    verticalAlign: 'top',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  return (
    <div
      ref={ref}
      className={cn('andro-data-table', className)}
      style={{ ...andromedaVars(), ...style }}
      {...props}
    >
      <style>{`
        .andro-data-table .andro-tr {
          transition: ${reducedMotion ? 'none' : `background-color ${tokens.motion.duration.normal} ${tokens.motion.easing.standard}`} !important;
        }

        .andro-data-table .andro-tr-hover {
          cursor: pointer;
        }

        .andro-data-table .andro-tr-hover:hover {
          background-color: var(--andromeda-surface-hover) !important;
        }

        .andro-data-table .andro-tr-hover:focus-visible {
          outline: none;
          background-color: var(--andromeda-surface-hover) !important;
          box-shadow: inset 0 0 0 1px var(--andromeda-accent-300, ${tokens.color.accent[300]}) !important;
        }

        .andro-data-table .andro-dt-mobile-info {
          display: none !important;
        }

        .andro-data-table .andro-dt-meta {
          display: none;
        }

        ${mq.md} {
          .andro-data-table .andro-dt-hide-md {
            display: none !important;
          }

          .andro-data-table .andro-dt-primary {
            width: auto !important;
          }

          .andro-data-table .andro-dt-meta {
            display: block !important;
          }

          .andro-data-table .andro-dt-mobile-info {
            display: table-cell !important;
          }
        }
      `}</style>

      <table
        style={{
          tableLayout: 'fixed',
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr style={headerRowStyle}>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  column.hideBelow === 'md' && 'andro-dt-hide-md',
                  column.primary && 'andro-dt-primary',
                )}
                scope="col"
                style={{
                  ...headerCellStyle,
                  width: column.width,
                  textAlign: column.align ?? 'left',
                }}
              >
                {column.header}
              </th>
            ))}
            {infoColumns.length > 0 ? (
              <th
                className="andro-dt-mobile-info"
                scope="col"
                aria-label="More details"
                style={{
                  ...headerCellStyle,
                  width: tokens.spacing[10],
                  paddingLeft: tokens.spacing[1],
                }}
              />
            ) : null}
          </tr>
        </thead>

        <motion.tbody
          variants={reducedMotion ? STILL_CONTAINER : rowContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <AnimatePresence initial={false}>
          {rows.map((row) => {
            const rowKey = getRowKey(row);
            const isSelected = selectedRowKey === rowKey;
            const renderedColumns = columns.map((column) => ({
              column,
              value: renderColumnValue(column, row),
            }));

            const infoLabel = (
              <div
                style={{
                  display: 'grid',
                  gap: tokens.spacing[1],
                  fontFamily: tokens.typography.fontMono,
                  fontSize: tokens.typography.size.xs,
                  lineHeight: 1,
                  // Only the column HEADER is uppercased (below); folded values
                  // keep their own case (the Tooltip container uppercases by
                  // default, which would mangle mixed-case data).
                  textTransform: 'none',
                }}
              >
                {infoColumns.map((column) => (
                  <div key={column.key} style={{ whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        color: `var(--andromeda-text-faint, ${tokens.color.text.faint})`,
                        letterSpacing: tokens.typography.tracking.wider,
                        textTransform: 'uppercase',
                      }}
                    >
                      {column.header}
                    </span>
                    <span style={{ color: `var(--andromeda-text-faint, ${tokens.color.text.faint})` }}> · </span>
                    <span style={{ color: resolveCellColor(column, row) }}>{foldText(column, row)}</span>
                  </div>
                ))}
              </div>
            );

            return (
              <motion.tr
                key={rowKey}
                variants={reducedMotion ? STILL_ROW : rowItem}
                exit="exit"
                className={cn('andro-tr', interactive && 'andro-tr-hover')}
                aria-current={isSelected ? 'true' : undefined}
                tabIndex={interactive ? 0 : undefined}
                onClick={interactive ? () => onRowClick?.(row) : undefined}
                onKeyDown={
                  interactive
                    ? (event) => {
                        if (event.target !== event.currentTarget) return;
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onRowClick?.(row);
                        }
                      }
                    : undefined
                }
                style={{
                  backgroundColor: isSelected
                    ? `var(--andromeda-surface-active, ${tokens.color.surface.active})`
                    : 'transparent',
                  backgroundImage: ROW_INSET(),
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'bottom left',
                  backgroundSize: `100% var(--andromeda-border-width, ${HAIRLINE_WIDTH})`,
                  boxShadow: isSelected
                    ? `inset 2px 0 0 0 var(--andromeda-accent-300, ${tokens.color.accent[300]})`
                    : undefined,
                }}
              >
                {renderedColumns.map(({ column, value }) => (
                  <td
                    key={column.key}
                    className={cn(
                      column.hideBelow === 'md' && 'andro-dt-hide-md',
                      column.primary && 'andro-dt-primary',
                    )}
                    style={{
                      ...cellStyle,
                      width: column.width,
                      textAlign: column.align ?? 'left',
                      color: resolveCellColor(column, row),
                    }}
                  >
                    {value}
                    {column.primary && metaColumns.length > 0 ? (
                      <span
                        className="andro-dt-meta"
                        style={{
                          marginTop: tokens.spacing[1],
                          fontFamily: tokens.typography.fontMono,
                          fontSize: tokens.typography.size.sm,
                          color: `var(--andromeda-text-muted, ${tokens.color.text.muted})`,
                          textTransform: 'uppercase',
                          letterSpacing: tokens.typography.tracking.widest,
                          lineHeight: 'var(--andromeda-leading-none, 1)',
                        }}
                      >
                        {metaColumns.map((c) => foldText(c, row)).join(' · ')}
                      </span>
                    ) : null}
                  </td>
                ))}

                {infoColumns.length > 0 ? (
                  <td
                    className="andro-dt-mobile-info"
                    onClick={(event) => event.stopPropagation()}
                    style={{
                      ...cellStyle,
                      width: tokens.spacing[10],
                      paddingLeft: tokens.spacing[1],
                      textAlign: 'right',
                      overflow: 'visible',
                    }}
                  >
                    {/* Tooltip accepts any renderable label; the fold list is a node. */}
                    <Tooltip label={infoLabel} position="top">
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={Info}
                        aria-label="More details"
                        // A tap does not focus a button in iOS Safari, and the
                        // Tooltip opens on focus: focusing it here opens the
                        // details on touch too. Tapping elsewhere closes them.
                        onClick={(event) => {
                          event.stopPropagation();
                          event.currentTarget.focus();
                        }}
                      />
                    </Tooltip>
                  </td>
                ) : null}
              </motion.tr>
            );
          })}
          </AnimatePresence>
        </motion.tbody>
      </table>
    </div>
  );
}) as (<Row extends RowRecord>(
  props: DataTableProps<Row> & { ref?: Ref<HTMLDivElement> },
) => ReactElement) & { displayName?: string };
// forwardRef erases the row type parameter, so the call signature is restored
// with one cast at the export. The body works in RowRecord; this is what ties a
// column's callbacks to the rows the caller actually passes.

DataTable.displayName = 'DataTable';
