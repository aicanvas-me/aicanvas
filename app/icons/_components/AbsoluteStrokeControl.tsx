'use client'

import { useId } from 'react'
import { Toggle } from '@/app/components/Toggle'

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
  return (
    <div
      title={disabled ? hint : 'Keep the same line width at every size'}
      className={`inline-flex shrink-0 items-center gap-2 px-2 text-xs font-semibold text-sand-700 dark:text-sand-300 ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
    >
      <label htmlFor={id} className={`select-none whitespace-nowrap ${disabled ? '' : 'cursor-pointer'}`}>
        {label}
      </label>
      <Toggle id={id} checked={value} onCheckedChange={onChange} disabled={disabled} />
    </div>
  )
}
