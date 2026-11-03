'use client'

import { useId } from 'react'
import { Info } from '@/app/_icons/icons/info'
import { Toggle } from '@/app/components/Toggle'

const EXPLAIN = 'On: same line width at every size. Off: the line scales with the icon.'

// On: the line keeps its pixel width at every size (absoluteStrokeWidth).
// Off: the line scales with the icon, like Lucide's default.
export function AbsoluteStrokeControl({
  value,
  onChange,
  label = 'Absolute',
  className = 'h-8',
  disabled = false,
  hint,
}: {
  value: boolean
  onChange: (value: boolean) => void
  label?: string
  className?: string
  disabled?: boolean
  hint?: string
}) {
  const id = useId()
  const tipId = useId()
  const tip = disabled && hint ? hint : EXPLAIN
  return (
    <div
      className={`inline-flex shrink-0 items-center gap-2 px-2 text-xs font-semibold text-sand-700 dark:text-sand-300 ${className}`}
    >
      <span className={`inline-flex items-center gap-1 ${disabled ? 'opacity-50' : ''}`}>
        <label htmlFor={id} className={`select-none whitespace-nowrap ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          {label}
        </label>
        {/* Hover or focus shows the tip; it stays reachable when the switch is off-limits. */}
        <span className="group/tip relative inline-flex">
          <button
            type="button"
            aria-label={`About ${label}`}
            aria-describedby={tipId}
            className="inline-flex size-4 items-center justify-center rounded-full text-sand-600 transition-colors hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:text-sand-400 dark:hover:text-sand-50"
          >
            <Info aria-hidden className="size-3.5" />
          </button>
          <span
            id={tipId}
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-inset bg-sand-900 px-3 py-2 text-left text-xs font-normal leading-relaxed text-sand-50 opacity-0 shadow-lg transition-opacity group-hover/tip:opacity-100 group-focus-within/tip:opacity-100 dark:bg-sand-50 dark:text-sand-950"
          >
            {tip}
          </span>
        </span>
      </span>
      <span className={disabled ? 'cursor-not-allowed opacity-50' : ''}>
        <Toggle id={id} checked={value} onCheckedChange={onChange} disabled={disabled} />
      </span>
    </div>
  )
}
