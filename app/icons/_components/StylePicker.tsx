'use client'

import { CheckCircle } from '@phosphor-icons/react'
import { ICON_STYLES } from '../_lib/icon-utils'
import type { IconStyle } from '../_lib/types'
import { IconSvg } from './IconSvg'

export function StylePicker({
  value,
  onChange,
  markup,
  loading = false,
  compact = false,
}: {
  value: IconStyle
  onChange: (style: IconStyle) => void
  markup?: string
  loading?: boolean
  compact?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Icon style"
      className={
        compact
          ? 'grid min-w-0 grid-cols-2 gap-1 rounded-xl border border-sand-200 bg-sand-100 p-1 dark:border-sand-800 dark:bg-sand-900 sm:grid-cols-4'
          : 'grid grid-cols-2 gap-2 sm:grid-cols-4'
      }
    >
      {ICON_STYLES.map((style) => {
        const selected = value === style.id
        return (
          <button
            key={style.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(style.id)}
            className={`${
              compact
                ? 'min-h-12 rounded-lg px-2 py-1.5'
                : 'relative min-h-[74px] rounded-xl border px-2 py-2'
            } flex min-w-0 flex-col items-center justify-center gap-1 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 ${
              selected
                ? compact
                  ? 'bg-sand-50 text-sand-900 shadow-sm dark:bg-sand-800 dark:text-sand-50'
                  : 'border-olive-500 bg-olive-500/5 text-sand-900 dark:text-sand-50'
                : compact
                  ? 'text-sand-600 hover:bg-sand-200/70 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/70 dark:hover:text-sand-100'
                  : 'border-sand-200 bg-sand-100 text-sand-600 hover:border-sand-300 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-400 dark:hover:border-sand-700'
            }`}
          >
            {!compact && markup && (
              <IconSvg
                markup={markup}
                size={24}
                strokeWidth={2}
                className={loading && selected ? 'animate-pulse motion-reduce:animate-none' : ''}
              />
            )}
            <span className="flex min-w-0 items-center gap-1 text-[11px] font-semibold">
              {selected && compact && <CheckCircle weight="regular" size={12} aria-hidden />}
              <span className="truncate">{style.shortLabel}</span>
            </span>
            <span
              className={`text-[9px] font-semibold ${
                style.tier === 'Free' ? 'text-olive-600 dark:text-olive-400' : 'text-[#9a7f52] dark:text-[#c6aa78]'
              }`}
            >
              {style.tier}
            </span>
          </button>
        )
      })}
    </div>
  )
}

