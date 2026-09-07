'use client'

// Single-row slider widget: label on the left, value on the right, the whole
// pill IS the drag target. A native <input type="range"> sits on top with
// opacity-0 so it handles all interaction (mouse, touch, keyboard) while the
// pill underneath shows the styled label + fill + value.

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  disabled,
  format,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  disabled?: boolean
  format?: (v: number) => string
}) {
  const range = max - min
  const pct = range > 0 ? Math.max(0, Math.min(100, ((value - min) / range) * 100)) : 0
  const display = format ? format(value) : String(value)

  return (
    <div className={`relative ${disabled ? 'opacity-50' : ''}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      <div className="relative flex h-7 items-center overflow-hidden rounded-lg border border-sand-300 bg-sand-50 dark:border-sand-800 dark:bg-sand-900">
        {/* Tick marks — 8 evenly spaced thin lines behind the fill. As the
            fill grows leftward it paints over them, leaving ticks visible
            only on the empty right side of the slider. */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="pointer-events-none absolute inset-y-2 w-px bg-sand-950"
            style={{ left: `${(i + 0.5) * 12.5}%` }}
          />
        ))}
        {/* Fill — the left portion up to the current value */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 bg-sand-200 dark:bg-sand-800"
          style={{ width: `${pct}%` }}
        />
        {/* Thumb indicator — thin vertical line marking the exact position */}
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-sand-500 dark:bg-sand-400"
          style={{ left: `calc(${pct}% - 0.5px)` }}
        />
        {/* Label (left) + value (right) — sit above the fill */}
        <span className="relative z-[1] flex-1 truncate pl-3 text-xs font-semibold text-sand-800 dark:text-sand-100">
          {label}
        </span>
        <span className="relative z-[1] pr-3 font-mono text-[11px] tabular-nums text-sand-600 dark:text-sand-400">
          {display}
        </span>
      </div>
    </div>
  )
}
