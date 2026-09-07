'use client'

import type { ReactNode } from 'react'

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  disabled,
  renderOption,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  disabled?: boolean
  /** Optional custom renderer for each option. When provided, the option
   *  string is used as the button's `title` + `aria-label` for tooltip + a11y. */
  renderOption?: (opt: T) => ReactNode
}) {
  return (
    <div
      className={`flex h-7 w-full gap-0.5 rounded-lg border border-sand-300 bg-sand-200/60 p-0.5 dark:border-sand-800 dark:bg-sand-800/60 ${
        disabled ? 'pointer-events-none opacity-50' : ''
      }`}
    >
      {options.map((opt) => {
        const active = opt === value
        const content = renderOption ? renderOption(opt) : opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            title={renderOption ? opt : undefined}
            aria-label={renderOption ? opt : undefined}
            className={`flex flex-1 items-center justify-center rounded-md px-2 text-xs font-semibold transition-colors ${
              active
                ? 'bg-sand-100 text-sand-900 shadow-sm dark:bg-sand-100 dark:text-sand-900'
                : 'text-sand-600 hover:text-sand-800 dark:text-sand-400 dark:hover:text-sand-200'
            }`}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}
