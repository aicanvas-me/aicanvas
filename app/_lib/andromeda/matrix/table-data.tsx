// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
import { Play } from '@phosphor-icons/react'
// v2 component: imported through the build-time shim.
import { DataTable } from '../../../lib/andromeda-v2.generated'
import { IconButton } from '../../../lib/andromeda-v2.generated'
import { tokens } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

// The component ships DEFAULT_COLUMNS/DEFAULT_ROWS so it renders from bare
// props, and this page used to lean on them. That taught the wrong lesson: five
// plain text columns is the one shape a config-driven grid does NOT need to be
// configured for, and the component's only real consumer (the signal-room
// template's Recent transmissions) looks nothing like it. The columns below
// mirror that consumer's SHAPE — a `render` cell, a two-line primary, a visual
// cell that folds to text — without importing its data or its player state.
const ROWS = [
  { id: 'track-01', track: 'Signal Drift',  artist: 'Vela Array',    duration: '03:42', plays: '128.4K', peak: 62, last: 'T-02m' },
  { id: 'track-02', track: 'Night Transit', artist: 'Polar Relay',   duration: '04:18', plays: '96.8K',  peak: 91, last: 'T-17m' },
  { id: 'track-03', track: 'Low Orbit',     artist: 'Kepler Static', duration: '02:56', plays: '74.2K',  peak: 48, last: 'T-41m' },
]

function PeakBar({ value }) {
  return (
    <div
      style={{
        position: 'relative',
        // 6px border-box = a 4px fill between the two hairlines.
        height: tokens.spacing[1.5],
        width: '88px',
        background: `var(--at-surface-overlay, ${tokens.color.surface.overlay})`,
        border: `${tokens.border.thin} var(--at-border-subtle, ${tokens.color.border.subtle})`,
        borderRadius: tokens.radius.frame,
        display: 'inline-block',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${value}%`,
          // Solid mark, not a tint: a meter fill is a MARK. Over 85 reads hot.
          // Both branches go through the theme channel — the hot one used to be
          // a bare literal, so it stayed a dark-ramp amber on a light card.
          background: value > 85
            ? `var(--at-warning-300, ${tokens.color.warning[300]})`
            : `var(--at-text-primary, ${tokens.color.text.primary})`,
        }}
      />
    </div>
  )
}

const COLUMNS = [
  {
    key: 'play',
    header: '',
    // Same derivation as the signal-room consumer: the cell adds spacing[3]
    // either side, and the cell style carries text-overflow:ellipsis, so a
    // column narrower than control + that padding paints a phantom "..."
    // under the button. Never a magic number — the ladder moved once already.
    // Optional-chained because `control` is a v2 token group: a vault-less build
    // gets v1 tokens from the shim, which have none, and the CSS var still
    // carries the real value there.
    width: `calc(var(--andromeda-control-sm, ${tokens.control?.sm?.height}) + ${tokens.spacing[3]} * 2)`,
    render: () => (
      <IconButton
        variant="ghost"
        size="sm"
        icon={Play}
        aria-label="Play"
        onClick={(event) => event.stopPropagation()}
      />
    ),
  },
  { key: 'id', header: 'ID', width: '96px', hideBelow: 'md', fold: 'none', color: `var(--at-text-faint, ${tokens.color.text.faint})` },
  {
    key: 'track',
    header: 'Track',
    primary: true,
    render: (r) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1], minWidth: 0 }}>
        <span
          style={{
            fontFamily: tokens.typography.fontSans,
            fontSize: tokens.typography.size.sm,
            color: `var(--at-text-primary, ${tokens.color.text.primary})`,
            fontWeight: tokens.typography.weight.medium,
            letterSpacing: tokens.typography.tracking.tight,
            // The ramp's paired leading, NOT leading-none. A 12px line box on
            // 12px type crops the box to the glyphs, so the descender on a "g"
            // paints outside it and lands on the line below — no gap can fix
            // that, because the gap starts where the box ends. The caps line
            // below has no descenders, so it keeps the dense setting.
            lineHeight: tokens.typography.leading.textSm,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {r.track}
        </span>
        <span
          style={{
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.sm,
            color: `var(--at-text-muted, ${tokens.color.text.muted})`,
            textTransform: 'uppercase',
            // `wider`, not `widest`. Widest is the system's step for a lone
            // micro-label with nothing to measure itself against; under a title
            // it sets the caption almost as wide as the line above and the two
            // stop reading as a pair.
            letterSpacing: tokens.typography.tracking.wider,
            lineHeight: 'var(--andromeda-leading-none, 1)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {r.artist}
        </span>
      </div>
    ),
  },
  { key: 'duration', header: 'Duration', width: '110px', hideBelow: 'md', fold: 'meta', color: `var(--at-text-primary, ${tokens.color.text.primary})` },
  { key: 'plays', header: 'Plays', width: '100px', hideBelow: 'md', fold: 'meta', infoValue: (r) => `${r.plays} plays`, color: `var(--at-text-primary, ${tokens.color.text.primary})` },
  // The meter is the reason `infoValue` exists: a visual cell cannot fold into
  // a text bubble, so it hands over a string instead of its `render`.
  { key: 'peak', header: 'Peak', width: '124px', hideBelow: 'md', infoValue: (r) => `${r.peak}%`, render: (r) => <PeakBar value={r.peak} /> },
  { key: 'last', header: 'Last', width: '84px', hideBelow: 'md', color: `var(--at-text-faint, ${tokens.color.text.faint})` },
]

export const dataTable: MatrixSpec = {
  slug: 'table-data',
  Component: DataTable,
  sizes: null,
  wide: true,
  // Row ids are kept as track-0N so the component's own `selectedRowKey`
  // default ('track-02') still lands on a row and the accent edge shows.
  // Capped and centred. `wide: true` gives the case the full section width,
  // which a dense grid wants — but five of these seven columns state a fixed
  // width, so every pixel past the cap lands in the one flexible column and the
  // row reads as a title marooned from its own numbers. The cap is where the
  // Track column still holds a two-line cell without going hollow.
  baseProps: { columns: COLUMNS, rows: ROWS, style: { maxWidth: '960px', marginInline: 'auto' } },
  // The per-row info bubble is position:absolute with no portal, so it needs the
  // same two escapes a popover case needs: the body must not become a scroll
  // container, and the showcase section must not sit in a paint-contained box.
  // No case passes staticOpen, so the coverage test does not demand this line —
  // the mobile layout does. Below the md breakpoint the info column appears and
  // its Tooltip opens up, on the side the renderer reads off the wrapper's
  // data-tooltip-placement.
  //
  // The horizontal scroll it gives up was never doing anything, at EITHER width.
  // The table is width:100% with table-layout:fixed, so explicit widths that
  // overrun get scaled down rather than overflowing; and below md every
  // hideBelow column goes display:none, leaving the play cell, the primary and
  // the info column. Neither width overflows. No box of our own to shrink
  // either, so this needs no minWidth:0 companion.
  //
  // The 33px reserve does NOT hold this bubble on its own; it is one term of
  // three. Room above the FIRST row's trigger, the tightest one:
  //   reserve 33 + thead row 26 + the cell's spacing[3] 12 padding-top   = 71
  // Bubble, at the TWO columns that fold to `info` here (peak, last — id is
  // fold:'none', duration and plays are fold:'meta' and ride the primary
  // column's sub-line instead):
  //   2 x size.xs 10 line box + 1 x spacing[1] 4 grid gap
  //     + 2 x spacing[1] 4 padding + 2 x 1px border                      = 34
  //   + its spacing[2] 8 offset from the trigger                         = 42
  // 29px of margin. Each further `info` column costs 14 (row + gap), so this
  // takes two more before it is tight. Re-derive it HERE, not in Matrix.tsx,
  // if a token or the column list moves.
  overflow: true,
  variants: [
    { label: 'Defaults', props: {} },
    { label: 'No selection', props: { selectedRowKey: null } },
  ],
  states: [],
  gaps: {
    'Row hover':
      'the row rule lives in the component\'s own scoped stylesheet, and this source is vault-side — the companion line that would fire it at rest belongs in that repo, not this one',
  },
}
