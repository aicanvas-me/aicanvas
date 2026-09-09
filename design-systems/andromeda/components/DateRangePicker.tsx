// ============================================================
// COMPONENT: DateRangePicker
// Trigger chip → expandable calendar panel positioned below.
// Range selection: first click sets the anchor; hovering previews
// the in-between band; second click commits the range and closes.
// ESC and click-outside close the panel. Controlled-only API:
//
//   <DateRangePicker
//     value={{ start: Date, end: Date | null }}
//     onChange={(next) => setRange(next)}
//     presetLabel="Last month"      // optional chip prefix
//     defaultOpen                   // calendar pre-opened (showcases / docs);
//                                   // ESC + click-outside still dismiss
//     staticOpen                    // pre-opened AND pinned — ESC + click-
//                                   // outside do NOT dismiss (multi-popover docs)
//   />
//
// All visual values come from `tokens.ts` — selection / preview /
// today markers reuse the system accent stops because date selection
// IS a measurement (the the Andromeda color-philosophy rules "color is for meaning" exception).
// ============================================================

'use client';

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CSSProperties,
  ComponentPropsWithoutRef,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { CalendarBlank, CaretDown, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { tokens } from '../tokens';
import { andromedaVars, cn } from './lib/utils';
import { mq } from './lib/responsive';

// Color values used in the calendar's INLINE styles as var-with-fallback, so
// the panel and day cells follow a live theme override natively — an installed
// project (or the tuner) can retune --andromeda-* and the picker tracks it. The
// fallback keeps the default pixel-identical. (Inline styles can't be reached
// by any runtime rewrite the way component classes can, so wire them as vars.)
const V = {
  accent100:     `var(--andromeda-accent-100, ${tokens.color.accent[100]})`,
  accent400:     `var(--andromeda-accent-400, ${tokens.color.accent[400]})`,
  accent500:     `var(--andromeda-accent-500, ${tokens.color.accent[500]})`,
  borderBase:    `var(--andromeda-border-base, ${tokens.color.border.base})`,
  borderBright:  `var(--andromeda-border-bright, ${tokens.color.border.bright})`,
  surfaceActive: `var(--andromeda-surface-active, ${tokens.color.surface.active})`,
  surfaceRaised: `var(--andromeda-surface-raised, ${tokens.color.surface.raised})`,
  surfaceBase:   `var(--andromeda-surface-base, ${tokens.color.surface.base})`,
  textPrimary:   `var(--andromeda-text-primary, ${tokens.color.text.primary})`,
  textSecondary: `var(--andromeda-text-secondary, ${tokens.color.text.secondary})`,
  textMuted:     `var(--andromeda-text-muted, ${tokens.color.text.muted})`,
  textFaint:     `var(--andromeda-text-faint, ${tokens.color.text.faint})`,
};

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG  = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type DateRange = { start: Date; end: Date | null };

function startOfDay(d: Date): Date;
function startOfDay(d: Date | null | undefined): Date | null;
function startOfDay(d: Date | null | undefined): Date | null {
  if (!d) return null;
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a: Date | null | undefined, b: Date | null | undefined) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth() &&
    a.getDate()     === b.getDate()
  );
}

function compareDays(a: Date, b: Date) {
  if (a.getFullYear() !== b.getFullYear()) return a.getFullYear() - b.getFullYear();
  if (a.getMonth()    !== b.getMonth())    return a.getMonth()    - b.getMonth();
  return a.getDate() - b.getDate();
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Monday-first weekday index: Mon=0 … Sun=6
function weekdayIndex(d: Date) {
  return (d.getDay() + 6) % 7;
}

function buildMonthGrid(viewDate: Date) {
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  // Monday-first week: Mon=0, ..., Sun=6
  const offset = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(year, month, 1 - offset + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

function formatRangeChip(range: DateRange | null | undefined) {
  if (!range || !range.start) return 'Any dates';
  const fmt = (d: Date) => `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
  if (!range.end || isSameDay(range.start, range.end)) return fmt(range.start);
  return `${fmt(range.start)} → ${fmt(range.end)}`;
}

// One-shot stylesheet for hover/focus states. Inline styles can't express
// :hover or :focus-visible, so we inject a scoped sheet keyed off classes.
function PickerStyles() {
  return (
    <style>{`
      .adp-trigger { transition: background var(--andromeda-duration-normal) var(--andromeda-easing-standard), border-color var(--andromeda-duration-normal) var(--andromeda-easing-standard); outline: none; }
      .adp-trigger:hover { border-color: var(--andromeda-border-bright) !important; }
      .adp-trigger[data-state="open"] {
        background: var(--andromeda-surface-hover);
        border-color: var(--andromeda-border-bright);
      }
      .adp-trigger:focus-visible {
        border-color: var(--andromeda-accent-400) !important;
        box-shadow: 0 0 0 1px var(--andromeda-accent-400), 0 0 var(--andromeda-glow) var(--andromeda-accent-500);
      }
      .adp-nav { transition: color var(--andromeda-duration-normal) var(--andromeda-easing-standard), background var(--andromeda-duration-normal) var(--andromeda-easing-standard); outline: none; }
      .adp-nav:hover { color: var(--andromeda-text-primary) !important; background: var(--andromeda-surface-hover) !important; }
      .adp-nav:focus-visible {
        color: var(--andromeda-text-primary);
        box-shadow: 0 0 0 1px var(--andromeda-accent-400);
      }
      .adp-day { transition: background var(--andromeda-duration-fast) var(--andromeda-easing-standard), color var(--andromeda-duration-fast) var(--andromeda-easing-standard), border-color var(--andromeda-duration-fast) var(--andromeda-easing-standard); outline: none; }
      .adp-day[data-state="default"]:hover {
        background: var(--andromeda-surface-hover) !important;
        color: var(--andromeda-text-primary) !important;
      }
      .adp-day[data-state="inrange"]:hover {
        background: var(--andromeda-surface-hover) !important;
        color: var(--andromeda-text-primary) !important;
      }
      .adp-day[data-state="selected"]:hover {
        border-color: var(--andromeda-accent-300) !important;
      }
      .adp-day:focus-visible {
        box-shadow: 0 0 0 1px var(--andromeda-accent-400);
      }
      /* Phone fit — below sm a trigger-anchored, right-pinned popover still
         overflowed off-screen (the trigger's own width pushed it past the
         edge). Instead make the picker root full-width so its absolutely-
         positioned panel spans the whole component, and pin the panel to BOTH
         edges (left:0; right:0). The calendar then matches the component width
         and can never overflow sideways. The fixed 7×32px grid goes fluid (1fr
         columns, cells fill their track) so it grows to fill that width.
         !important: the root display, panel offsets, grid columns and cell box
         are all inline styles, so the responsive override must outrank them
         (the Andromeda interaction-states rules). */
      ${mq.sm} {
        .adp-root {
          display: flex !important;
          width: 100% !important;
        }
        .adp-panel {
          left: 0 !important;
          right: 0 !important;
        }
        .adp-grid {
          grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
        }
        .adp-day {
          width: 100% !important;
          min-width: 0 !important;
        }
      }
    `}</style>
  );
}

/**
 * @typedef {object} DateRangePickerProps
 * @property {{ start: Date, end: Date }} [value] Selected date range; controlled.
 * @property {(range: { start: Date, end: Date }) => void} [onChange] Called with the new range once both endpoints are chosen.
 * @property {string} [presetLabel] Label for the active preset shown in the trigger (for example "Last month").
 * @property {boolean} [defaultOpen=false] Whether the calendar panel starts open (uncontrolled).
 * @property {boolean} [staticOpen=false] Pins the panel open and disables the dismissers; for showcases and docs.
 * @property {string} [className] Additional CSS classes applied to the root element.
 * @property {React.CSSProperties} [style] Inline styles applied to the root element.
 */
type DateRangePickerProps = Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> & {
  value?: DateRange;
  onChange?: (range: { start: Date; end: Date }) => void;
  presetLabel?: string;
  defaultOpen?: boolean;
  staticOpen?: boolean;
};

export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(function DateRangePicker(
  { value, onChange, presetLabel, defaultOpen = false, staticOpen = false, className, style, ...props },
  ref,
) {
  const [open, setOpen]         = useState(defaultOpen || staticOpen);
  const [anchor, setAnchor]     = useState<Date | null>(null);
  const [hover, setHover]       = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState(() => {
    const seed = value?.start ?? new Date();
    return new Date(seed.getFullYear(), seed.getMonth(), 1);
  });
  // Roving-tabindex focus target for keyboard nav across the day grid.
  // Initialised to the range start (if it lands in the visible month),
  // else today (if visible), else the 1st of the visible month.
  const [focusedDay, setFocusedDay] = useState(() => {
    const seed = value?.start ?? new Date();
    const vd   = new Date(seed.getFullYear(), seed.getMonth(), 1);
    if (value?.start && value.start.getMonth() === vd.getMonth() && value.start.getFullYear() === vd.getFullYear()) {
      return startOfDay(value.start);
    }
    const t = startOfDay(new Date());
    if (t.getMonth() === vd.getMonth() && t.getFullYear() === vd.getFullYear()) return t;
    return startOfDay(vd);
  });
  const wrapRef = useRef<HTMLDivElement | null>(null);
  // Map of day-key → button node, used to move real DOM focus after a
  // keyboard move flushes focusedDay state.
  const dayRefs = useRef(new Map<number, HTMLButtonElement>());
  // Tracks whether the last focusedDay change came from a keyboard event,
  // so we only steal focus on intentional arrow/Home/End/PageUp/Down moves
  // (never on open — see the staticOpen docs-mode requirement).
  const keyboardMoveRef = useRef(false);

  function close() {
    setOpen(false);
    setAnchor(null);
    setHover(null);
  }

  // Click-outside + ESC to dismiss. Only attaches when open to avoid
  // listening across the entire app lifetime. staticOpen pins the panel
  // open (showcases / docs) so it survives clicks elsewhere on the page —
  // skip the dismissers entirely in that mode.
  useEffect(() => {
    if (!open || staticOpen) return undefined;
    const handleDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, staticOpen]);

  // When the panel opens, jump the visible month to the current start and
  // re-seed the roving focus target (without stealing DOM focus).
  useEffect(() => {
    if (open && value?.start) {
      setViewDate(new Date(value.start.getFullYear(), value.start.getMonth(), 1));
      keyboardMoveRef.current = false;
      setFocusedDay(startOfDay(value.start));
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // After a keyboard move, push real DOM focus onto the matching day button.
  // Gated on keyboardMoveRef so opening the panel never auto-focuses the grid
  // (critical for staticOpen docs mode where multiple popovers coexist).
  useEffect(() => {
    if (!open || !keyboardMoveRef.current) return;
    const node = dayRefs.current.get(focusedDay.getTime());
    if (node) node.focus();
    keyboardMoveRef.current = false;
  }, [focusedDay, open]);

  function handleDayClick(day: Date) {
    if (!anchor) {
      setAnchor(day);
      setHover(day);
      return;
    }
    const cmp   = compareDays(day, anchor);
    const start = cmp >= 0 ? anchor : day;
    const end   = cmp >= 0 ? day    : anchor;
    onChange?.({ start, end });
    // Stay open. Reset the anchor so a follow-up click starts a fresh range
    // rather than extending the one that was just committed. The panel
    // dismisses only on click-outside or ESC.
    setAnchor(null);
    setHover(null);
  }

  // Roving-tabindex keyboard navigation across the day grid. Computes the
  // next focus target, syncs viewDate if it crosses a month boundary, and
  // flags keyboardMoveRef so the focus effect moves real DOM focus.
  function moveFocus(next: Date) {
    keyboardMoveRef.current = true;
    if (next.getMonth() !== viewDate.getMonth() || next.getFullYear() !== viewDate.getFullYear()) {
      setViewDate(new Date(next.getFullYear(), next.getMonth(), 1));
    }
    setFocusedDay(next);
  }

  function handleGridKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>) {
    const f = focusedDay;
    switch (e.key) {
      case 'ArrowLeft':  e.preventDefault(); moveFocus(addDays(f, -1)); break;
      case 'ArrowRight': e.preventDefault(); moveFocus(addDays(f,  1)); break;
      case 'ArrowUp':    e.preventDefault(); moveFocus(addDays(f, -7)); break;
      case 'ArrowDown':  e.preventDefault(); moveFocus(addDays(f,  7)); break;
      case 'Home':       e.preventDefault(); moveFocus(addDays(f, -weekdayIndex(f)));     break;
      case 'End':        e.preventDefault(); moveFocus(addDays(f,  6 - weekdayIndex(f))); break;
      case 'PageUp':     e.preventDefault(); moveFocus(startOfDay(new Date(f.getFullYear(), f.getMonth() - 1, f.getDate()))); break;
      case 'PageDown':   e.preventDefault(); moveFocus(startOfDay(new Date(f.getFullYear(), f.getMonth() + 1, f.getDate()))); break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleDayClick(startOfDay(f));
        break;
      default:
        break;
    }
  }

  const grid  = useMemo(() => buildMonthGrid(viewDate), [viewDate]);
  // The clock is read AFTER mount, never during render. `today` drives the
  // today-marker border on a day cell, so reading it during render would make
  // the server (deploy-region timezone, typically UTC) and the client (visitor
  // timezone) disagree about which cell is today for part of every day — a
  // hydration mismatch on the `style` attribute of two buttons. Null until
  // mounted means the marker simply appears a frame later, which nobody sees.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => { setToday(startOfDay(new Date())); }, []);

  // While anchor is set, the visible "range" is the in-progress preview.
  // Otherwise it falls back to the committed value.
  const drawRange = anchor
    ? (() => {
        const probe = hover ?? anchor;
        const cmp   = compareDays(probe, anchor);
        return cmp >= 0
          ? { start: anchor, end: probe }
          : { start: probe,  end: anchor };
      })()
    : { start: value?.start ?? null, end: value?.end ?? null };

  return (
    <div
      ref={(node) => {
        wrapRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn('adp-root', className)}
      style={{ ...andromedaVars(), position: 'relative', display: 'inline-flex', ...style }}
      {...props}
    >
      <PickerStyles />

      <button
        type="button"
        className="adp-trigger"
        data-state={open ? 'open' : 'closed'}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
          background: V.surfaceActive,
          border: `${tokens.border.thin} ${V.borderBase}`,
          borderRadius: tokens.radius.frame,
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.sm,
          color: V.textSecondary,
          letterSpacing: tokens.typography.tracking.wide,
          cursor: 'pointer',
        }}
      >
        <CalendarBlank weight="regular" size={13} />
        {presetLabel ? `${presetLabel} · ` : ''}
        {formatRangeChip(value)}
        <CaretDown
          weight="bold"
          size={10}
          style={{
            color: V.textFaint,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: `transform ${tokens.motion.duration.normal} ${tokens.motion.easing.standard}`,
          }}
        />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Select date range"
          className="adp-panel"
          style={{
            position: 'absolute',
            top: `calc(100% + ${tokens.spacing[2]})`,
            left: 0,
            zIndex: 1000,
            boxSizing: 'border-box',
            background: V.surfaceRaised,
            border: `${tokens.border.thin} ${V.borderBase}`,
            padding: tokens.spacing[3],
            boxShadow: 'var(--andromeda-shadow-md, 0 8px 21.6px rgba(0, 0, 0, 0.45))',
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[3],
          }}
        >

          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <button
              type="button"
              className="adp-nav"
              onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              aria-label="Previous month"
              style={{
                width: `var(--andromeda-6, 24px)`,
                height: `var(--andromeda-6, 24px)`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: V.textMuted,
                cursor: 'pointer',
                borderRadius: tokens.radius.frame,
              }}
            >
              <CaretLeft weight="bold" size={12} />
            </button>

            <span
              style={{
                fontFamily: tokens.typography.fontMono,
                fontSize: tokens.typography.size.sm,
                fontWeight: tokens.typography.weight.semibold,
                color: V.textPrimary,
                letterSpacing: tokens.typography.tracking.wider,
                textTransform: 'uppercase',
              }}
            >
              {MONTHS_LONG[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>

            <button
              type="button"
              className="adp-nav"
              onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              aria-label="Next month"
              style={{
                width: `var(--andromeda-6, 24px)`,
                height: `var(--andromeda-6, 24px)`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: V.textMuted,
                cursor: 'pointer',
                borderRadius: tokens.radius.frame,
              }}
            >
              <CaretRight weight="bold" size={12} />
            </button>
          </div>

          <div
            className="adp-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(7, var(--andromeda-8, 32px))`,
              gap: tokens.spacing[1],
            }}
          >
            {DOW.map((d, i) => (
              <span
                key={`dow-${i}`}
                style={{
                  fontFamily: tokens.typography.fontMono,
                  fontSize: tokens.typography.size.xs,
                  color: V.textFaint,
                  textAlign: 'center',
                  padding: `${tokens.spacing[1]} 0`,
                  letterSpacing: tokens.typography.tracking.wider,
                  textTransform: 'uppercase',
                }}
              >
                {d}
              </span>
            ))}
          </div>

          <div
            className="adp-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(7, var(--andromeda-8, 32px))`,
              gap: tokens.spacing[1],
            }}
            onMouseLeave={() => { if (anchor) setHover(anchor); }}
          >
            {grid.map((day, i) => {
              const inMonth = day.getMonth() === viewDate.getMonth();
              const isStart = isSameDay(day, drawRange.start);
              const isEnd   = isSameDay(day, drawRange.end);
              const inRange = drawRange.start && drawRange.end
                && compareDays(day, drawRange.start) > 0
                && compareDays(day, drawRange.end)   < 0;
              const isToday  = today !== null && isSameDay(day, today);
              const selected = isStart || isEnd;

              const dataState = selected ? 'selected' : inRange ? 'inrange' : 'default';

              const cellStyle: CSSProperties = {
                position: 'relative',
                width:  `var(--andromeda-8, 32px)`,
                height: `var(--andromeda-8, 32px)`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: selected ? V.accent500 : 'transparent',
                border: selected
                  ? `${tokens.border.thin} transparent`
                  : inRange
                    ? `${tokens.border.thin} ${V.accent400}`
                    : isToday
                      ? `${tokens.border.thin} ${V.borderBright}`
                      : `${tokens.border.thin} transparent`,
                borderRadius: tokens.radius.frame,
                color: selected
                  ? V.accent100
                  : inMonth
                    ? V.textSecondary
                    : V.textFaint,
                fontFamily: tokens.typography.fontMono,
                fontSize: tokens.typography.size.sm,
                fontWeight: selected
                  ? tokens.typography.weight.semibold
                  : tokens.typography.weight.regular,
                cursor: 'pointer',
                padding: 0,
              };

              const isFocused = isSameDay(day, focusedDay);

              return (
                <button
                  key={i}
                  type="button"
                  className="adp-day"
                  data-state={dataState}
                  ref={(node) => {
                    if (node) dayRefs.current.set(day.getTime(), node);
                    else dayRefs.current.delete(day.getTime());
                  }}
                  tabIndex={isFocused ? 0 : -1}
                  onClick={() => handleDayClick(day)}
                  onKeyDown={handleGridKeyDown}
                  onMouseEnter={() => { if (anchor) setHover(day); }}
                  aria-label={day.toDateString()}
                  style={cellStyle}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
});
