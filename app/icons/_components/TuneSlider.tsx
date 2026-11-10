'use client'

import { useId } from 'react'

// The toolbar's slider: a 32px well with the label on the left and the value
// on the right, the whole pill the drag target. A transparent native range
// on top takes mouse, touch and keys; the well shows the fill and a needle.
// The fill is the same sand step as the picked style segment, so "filled"
// means "set" across the toolbar.
export function TuneSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
  valueText,
  className = '',
  disabled = false,
  hint,
  disabledValue,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  format: (value: number) => string
  valueText: (value: number) => string
  className?: string
  // disabled: the control does nothing for what is shown; hint says why
  disabled?: boolean
  hint?: string
  // shown in the value slot while disabled, so the state reads without an extra row
  disabledValue?: string
}) {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)))
  // Fill and needle stay clear of the round ends, the way the native thumb does.
  const position = `calc(12px + (100% - 24px) * ${t})`
  const display = disabled && disabledValue ? disabledValue : format(value)
  const hintId = useId()
  const showHint = disabled && Boolean(hint)

  return (
    <div className={`min-w-0 ${className}`}>
      <div title={showHint ? hint : undefined} className={`relative h-8 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
        <input
          disabled={disabled}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(parseFloat(event.target.value))}
          aria-label={label}
          aria-valuetext={disabled && disabledValue ? disabledValue : valueText(value)}
          aria-describedby={showHint ? hintId : undefined}
          className="peer absolute inset-0 z-10 h-full w-full cursor-ew-resize opacity-0 disabled:pointer-events-none"
        />
        <div className="relative flex h-8 items-center overflow-hidden rounded-full border border-sand-200 bg-sand-50 transition-colors peer-hover:border-sand-300 peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 dark:border-sand-800 dark:bg-sand-950 dark:peer-hover:border-sand-700">
          {/* Ticks run in the gap between label and value, so they never cross
              the text; the fill paints over the ones behind it. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center">
            <span className="invisible shrink-0 px-3 text-xs font-semibold">{label}</span>
            <div className="@container flex h-full flex-1 items-center justify-evenly">
              {Array.from({ length: 8 }).map((_, index) => (
                <span
                  key={index}
                  className={`h-2 w-px bg-sand-300 dark:bg-sand-700 ${index % 2 ? 'hidden @min-[96px]:block' : ''}`}
                />
              ))}
            </div>
            <span className="invisible shrink-0 pl-3 pr-4 font-mono text-[11px] tabular-nums">{display}</span>
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 bg-sand-200 dark:bg-sand-800" style={{ width: position }} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-2 w-0.5 -translate-x-1/2 rounded-full bg-accent"
            style={{ left: position }}
          />
          <span className="relative z-[1] flex-1 truncate pl-3 text-xs font-semibold text-sand-900 dark:text-sand-50">{label}</span>
          <span className="relative z-[1] pr-4 font-mono text-[11px] tabular-nums text-sand-600 dark:text-sand-400">{display}</span>
        </div>
      </div>
      {showHint && (
        <span id={hintId} className="sr-only">
          {hint}
        </span>
      )}
    </div>
  )
}
