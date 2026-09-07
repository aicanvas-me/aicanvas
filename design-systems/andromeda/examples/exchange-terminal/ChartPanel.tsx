// ============================================================
// EXCHANGE TERMINAL · ChartPanel
// Custom SVG candlestick chart + MA polylines + volume strip below.
// ============================================================

'use client';

import { Eye, EyeSlash, X, ArrowsOutSimple, ListBullets } from '@phosphor-icons/react';
import { tokens } from '../../tokens';
import { themeColor } from '../../components/lib/utils';
import { CornerMarkers } from '../../components/CornerMarkers';
import { IconButton } from '../../components/IconButton';
import { mq } from '../../components/lib/responsive';
import { Dropdown } from './Dropdown';
import { candles, last, maSeries } from './data';

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

const TIME_MENU = ['1s', '5s', '15s', '30s'];
const M_MENU    = ['1m', '3m', '5m', '15m', '30m'];
const H_MENU    = ['1H', '2H', '4H', '6H', '12H'];

// ── Layout constants ──────────────────────────────────────────────
const PRICE_PAD     = 0.04;   // extra headroom above/below price range
const Y_AXIS_W      = 72;     // px for price-label gutter (right)
const X_AXIS_H      = 24;     // px for date-label gutter (bottom)
const VOL_HEADER_H  = 28;     // px reserved at the top of the volume area for the VOL legend
const VOL_AREA_H    = 104;    // px total height of the volume area (legend + bars + xaxis)
const PANEL_INSET   = 8;      // px clearance from corner markers for inline content

// ── Derived ranges ────────────────────────────────────────────────
const N        = candles.length;
const priceMin = Math.min(...candles.map((c) => c.l));
const priceMax = Math.max(...candles.map((c) => c.h));
const priceRange = priceMax - priceMin;
const yMin     = priceMin - priceRange * PRICE_PAD;
const yMax     = priceMax + priceRange * PRICE_PAD;
const yRange   = yMax - yMin;
const volMax   = Math.max(...candles.map((c) => c.v));

// Pick a "nice" step that yields ~6 labels across the visible price range,
// so this chart works for any asset (BTC tens-of-thousands, SOL tens-of-dollars,
// memecoins fractions-of-a-cent). Steps are powers of 10 × {1, 2, 5}.
const yLabels = (() => {
  const TARGET_TICKS = 6;
  const rough = (yMax - yMin) / TARGET_TICKS;
  const mag   = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm  = rough / mag;
  const nice  = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
  const step  = nice * mag;
  const start = Math.ceil(yMin / step) * step;
  const out   = [];
  for (let v = start; v <= yMax; v += step) out.push(v);
  return out;
})();

const cx = (i: number) => i + 0.5;
const cy = (p: number) => yMax - p;

const MA_COLORS = {
  5:  themeColor.accent[200],
  10: themeColor.orange[200],
  20: themeColor.red[200],
};

function maPath(series: (number | null)[]) {
  let started = false;
  let d = '';
  for (let i = 0; i < N; i++) {
    const v = series[i];
    if (v == null) continue;
    d += `${started ? 'L' : 'M'}${cx(i)} ${cy(v)} `;
    started = true;
  }
  return d.trim();
}

const fmtNum = (n: number | null, d = 2) =>
  n == null
    ? '—'
    : n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

// ── Chart header ─────────────────────────────────────────────────
function TimeframeChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className="ex-btn-hover"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacing[1],
        padding: `${tokens.spacing[2]} ${tokens.spacing[2]}`,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.typography.size.sm,
        textTransform: 'uppercase',
        letterSpacing: tokens.typography.tracking.wider,
        color: active ? themeColor.accent[200] : themeColor.text.secondary,
      }}
    >
      {label}
    </button>
  );
}

function ViewTab({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className="ex-btn-hover"
      style={{
        position: 'relative',
        padding: `${tokens.spacing[2]} 0`,
        marginRight: tokens.spacing[4],
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.typography.size.sm,
        textTransform: 'uppercase',
        letterSpacing: tokens.typography.tracking.wider,
        color: active ? themeColor.text.primary : themeColor.text.muted,
        fontWeight: active ? tokens.typography.weight.medium : tokens.typography.weight.regular,
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
            height: '1px',
            background: themeColor.accent[300],
          }}
        />
      ) : null}
    </button>
  );
}

function ChartHeader() {
  return (
    <div
      className="ex-chart-header"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      <InsetDivider />
      {/* The chart toolbar is a single dense row. On a narrow stacked panel
          it scrolls horizontally INSIDE the panel rather than pushing the
          page wide — see the .ex-chart-header rule below. */}
      <style>{`
        ${mq.md} {
          .ex-chart-header { overflow-x: auto !important; }
          .ex-chart-header > .ex-chart-header-spacer { flex: 0 0 ${tokens.spacing[4]} !important; }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[1],
          padding: `0 ${tokens.spacing[3]}`,
          borderRight: `${tokens.border.thin} ${themeColor.border.subtle}`,
          flexShrink: 0,
        }}
      >
        <Dropdown variant="chip" label="Time" items={TIME_MENU} />
        <Dropdown variant="chip" label="m"    items={M_MENU} />
        <Dropdown variant="chip" label="H"    items={H_MENU} />
        <TimeframeChip label="1D" active />
        <TimeframeChip label="1W" />
        <TimeframeChip label="1M" />
        <IconButton aria-label="More indicators" variant="ghost" size="sm" icon={ListBullets} />
      </div>

      <div className="ex-chart-header-spacer" style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', paddingRight: tokens.spacing[3], flexShrink: 0 }}>
        <ViewTab label="Original" active />
        <ViewTab label="Trading View" />
        <ViewTab label="Depth" />
        <IconButton aria-label="Fullscreen" variant="ghost" size="sm" icon={ArrowsOutSimple} />
      </div>
    </div>
  );
}

// ── OHLC + MA legend ─────────────────────────────────────────────
function LegendKV({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: tokens.spacing[1], alignItems: 'baseline' }}>
      <span style={{ color: themeColor.text.muted }}>{label}</span>
      <span style={{ color: valueColor ?? themeColor.text.primary }}>{value}</span>
    </span>
  );
}

function LegendMA({ label, color, value }: { label: string; color: string; value: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: tokens.spacing[1], alignItems: 'baseline' }}>
      <span style={{ color }}>{label}:</span>
      <span style={{ color }}>{value}</span>
    </span>
  );
}

// Compact 1px tall vertical rule that visually chunks the legend strip
// into its three distinct semantic groups (OHLC | derived | moving averages).
function LegendDivider() {
  return (
    <span
      aria-hidden
      style={{
        width: '1px',
        height: tokens.spacing[3],
        background: themeColor.border.subtle,
      }}
    />
  );
}

function LegendStrip() {
  const change    = ((last.c - last.o) / last.o) * 100;
  const amplitude = ((last.h - last.l) / last.o) * 100;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        // Slightly tighter horizontal gap so the dividers sit naturally
        // between groups rather than getting lost in white space.
        gap: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
        padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.typography.size.sm,
        letterSpacing: tokens.typography.tracking.wide,
      }}
    >
      <InsetDivider />
      <span style={{ color: themeColor.text.muted }}>2026/05/01</span>

      <LegendDivider />

      {/* OHLC group */}
      <LegendKV label="O" value={fmtNum(last.o)} />
      <LegendKV label="H" value={fmtNum(last.h)} />
      <LegendKV label="L" value={fmtNum(last.l)} />
      <LegendKV label="C" value={fmtNum(last.c)} />

      <LegendDivider />

      {/* Derived stats group */}
      <LegendKV
        label="CHANGE"
        value={`${change >= 0 ? '+' : ''}${fmtNum(change, 2)}%`}
        valueColor={change >= 0 ? themeColor.accent[200] : themeColor.red[200]}
      />
      <LegendKV
        label="AMPLITUDE"
        value={`${fmtNum(amplitude, 2)}%`}
        valueColor={themeColor.orange[200]}
      />

      <span style={{ flex: 1 }} />

      {/* Moving averages group */}
      <LegendMA label="MA(5)"  color={MA_COLORS[5]}  value={fmtNum(maSeries[5][N - 1])} />
      <LegendMA label="MA(10)" color={MA_COLORS[10]} value={fmtNum(maSeries[10][N - 1])} />
      <LegendMA label="MA(20)" color={MA_COLORS[20]} value={fmtNum(maSeries[20][N - 1])} />

      <LegendDivider />

      <span style={{ display: 'flex', gap: tokens.spacing[2], color: themeColor.text.faint }}>
        <Eye weight="regular" size={13} />
        <EyeSlash weight="regular" size={13} />
        <X weight="regular" size={13} />
      </span>
    </div>
  );
}

// ── SVG renderers ─────────────────────────────────────────────────
function CandlesSvg() {
  return (
    <svg
      viewBox={`0 0 ${N} ${yRange}`}
      preserveAspectRatio="none"
      style={{ position: 'absolute', top: 0, left: 0, width: `calc(100% - ${Y_AXIS_W}px)`, height: '100%', display: 'block' }}
    >
      {yLabels.map((p) => (
        <line
          key={`gy-${p}`}
          x1={0} x2={N} y1={cy(p)} y2={cy(p)}
          style={{ stroke: themeColor.border.subtle }}
          strokeWidth={1}
          strokeDasharray="2 4"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {candles.map((c, i) => {
        const up      = c.c >= c.o;
        const color   = up ? themeColor.accent[300] : themeColor.red[300];
        const bodyTop = cy(Math.max(c.o, c.c));
        const bodyBot = cy(Math.min(c.o, c.c));
        const bodyH   = Math.max(bodyBot - bodyTop, yRange * 0.0006);
        const x       = cx(i);
        return (
          <g key={`k-${i}`}>
            <line
              x1={x} x2={x} y1={cy(c.h)} y2={cy(c.l)}
              style={{ stroke: color }}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <rect x={x - 0.38} width={0.76} y={bodyTop} height={bodyH} style={{ fill: color }} />
          </g>
        );
      })}

      {([5, 10, 20] as const).map((p) => (
        <path
          key={`ma-${p}`}
          d={maPath(maSeries[p])}
          fill="none"
          style={{ stroke: MA_COLORS[p] }}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      <line
        x1={0} x2={N} y1={cy(last.c)} y2={cy(last.c)}
        style={{ stroke: themeColor.accent[300] }}
        strokeWidth={1}
        strokeDasharray="2 3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function VolumeSvg() {
  return (
    <svg
      viewBox={`0 0 ${N} ${volMax}`}
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        top: VOL_HEADER_H,
        left: 0,
        width: `calc(100% - ${Y_AXIS_W}px)`,
        height: `calc(100% - ${VOL_HEADER_H}px - ${X_AXIS_H}px)`,
        display: 'block',
      }}
    >
      {candles.map((c, i) => {
        const up    = c.c >= c.o;
        const fill  = up ? themeColor.accent[300] : themeColor.red[300];
        const tint  = up ? themeColor.accent.alpha : themeColor.red.alpha;
        return (
          <rect
            key={`v-${i}`}
            x={cx(i) - 0.32} width={0.64}
            y={volMax - c.v} height={c.v}
            style={{ fill: tint, stroke: fill }}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

// ── HTML overlays for axis labels ─────────────────────────────────
const LABEL_STYLE = {
  fontFamily: tokens.typography.fontMono,
  fontSize: tokens.typography.size.sm,
  color: themeColor.text.muted,
  letterSpacing: tokens.typography.tracking.wide,
};

function YAxisLabels() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: `${Y_AXIS_W}px`,
        pointerEvents: 'none',
      }}
    >
      {yLabels.map((p) => {
        const top = ((yMax - p) / yRange) * 100;
        return (
          <span
            key={`yl-${p}`}
            style={{
              position: 'absolute',
              top: `${top}%`,
              right: tokens.spacing[2],
              transform: 'translateY(-50%)',
              ...LABEL_STYLE,
            }}
          >
            {p.toLocaleString('en-US')}
          </span>
        );
      })}

      {/* Last-price flag */}
      <span
        style={{
          position: 'absolute',
          top: `${((yMax - last.c) / yRange) * 100}%`,
          right: 0,
          transform: 'translateY(-50%)',
          padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
          background: themeColor.accent[400],
          color: themeColor.text.primary,
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.sm,
          letterSpacing: tokens.typography.tracking.wide,
          fontWeight: tokens.typography.weight.semibold,
        }}
      >
        {last.c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}

function XAxisLabels() {
  // Edge labels are anchored to the gutter (left:0 / right:0, no translate)
  // so they never clip against the parent overflow:hidden. The middle label
  // keeps the centered translateX trick because it has space on both sides.
  const firstIdx = 0;
  const midIdx   = Math.floor(N / 2);
  const lastIdx  = N - 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: PANEL_INSET,
        right: `${Y_AXIS_W + PANEL_INSET}px`,
        bottom: 0,
        height: `${X_AXIS_H}px`,
        pointerEvents: 'none',
      }}
    >
      <span style={{ position: 'absolute', left: 0, top: tokens.spacing[1], whiteSpace: 'nowrap', ...LABEL_STYLE }}>
        {candles[firstIdx].t}
      </span>
      <span
        style={{
          position: 'absolute',
          left: `${((midIdx + 0.5) / N) * 100}%`,
          top: tokens.spacing[1],
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          ...LABEL_STYLE,
        }}
      >
        {candles[midIdx].t}
      </span>
      <span style={{ position: 'absolute', right: 0, top: tokens.spacing[1], whiteSpace: 'nowrap', ...LABEL_STYLE }}>
        {candles[lastIdx].t}
      </span>
    </div>
  );
}

// ── Volume legend ─────────────────────────────────────────────────
function VolumeLegend() {
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(3)}K` : `${n.toFixed(0)}`);
  return (
    <div
      style={{
        position: 'absolute',
        top: tokens.spacing[2],
        left: PANEL_INSET,
        right: `${Y_AXIS_W + PANEL_INSET}px`,
        height: `${VOL_HEADER_H - 8}px`,
        display: 'flex',
        gap: tokens.spacing[3],
        alignItems: 'center',
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.typography.size.sm,
        letterSpacing: tokens.typography.tracking.wide,
      }}
    >
      <span style={{ color: themeColor.text.muted }}>VOL</span>
      <span style={{ color: themeColor.accent[200] }}>{fmt(last.v)}</span>
      <span style={{ display: 'flex', gap: tokens.spacing[2], color: themeColor.text.faint }}>
        <Eye weight="regular" size={13} />
        <EyeSlash weight="regular" size={13} />
        <X weight="regular" size={13} />
      </span>
    </div>
  );
}

// ── Composition ───────────────────────────────────────────────────
export function ChartPanel() {
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
      <ChartHeader />
      <LegendStrip />

      <div
        style={{
          position: 'relative',
          flex: '1 1 0',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Candle area — SVG is absolutely placed so it fills regardless of
            whether height:100% resolves against a flex-basis:0 item. */}
        <div
          style={{
            position: 'relative',
            flex: '1 1 0',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <CandlesSvg />
          <YAxisLabels />
        </div>

        <div style={{ flexShrink: 0, height: '1px', background: themeColor.border.subtle }} />

        {/* Volume area — fixed height so it stays compact */}
        <div
          style={{
            position: 'relative',
            flex: `0 0 ${VOL_AREA_H}px`,
            overflow: 'hidden',
          }}
        >
          <VolumeLegend />
          <VolumeSvg />
          <XAxisLabels />

          {/* Vol axis labels — sit inside the right Y-axis gutter, clear of bars */}
          <span
            style={{
              position: 'absolute',
              top: VOL_HEADER_H,
              right: PANEL_INSET,
              ...LABEL_STYLE,
            }}
          >
            {(volMax / 1000).toFixed(0)}K
          </span>
          <span
            style={{
              position: 'absolute',
              bottom: X_AXIS_H,
              right: PANEL_INSET,
              ...LABEL_STYLE,
            }}
          >
            0
          </span>
        </div>
      </div>
    </div>
  );
}
