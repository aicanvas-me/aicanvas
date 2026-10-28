'use client'

import { CheckCircle, Sparkle } from '@phosphor-icons/react'
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
          ? 'grid h-10 min-w-0 grid-cols-4 gap-0.5 rounded-xl border border-sand-200 bg-sand-100 p-1 dark:border-sand-800 dark:bg-sand-900'
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
                ? 'h-8 rounded-lg px-1 sm:px-2'
                : 'relative h-16 rounded-xl border px-2 py-1.5'
            } flex min-w-0 ${compact ? 'flex-row' : 'flex-col'} items-center justify-center gap-1 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 ${
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
            {compact && (
              <Sparkle
                weight={style.id === 'line' ? 'regular' : style.id === 'duotone' || style.id === 'solid-duotone' ? 'duotone' : 'fill'}
                size={12}
                aria-hidden
                className="hidden shrink-0 sm:block"
              />
            )}
            <span className="flex min-w-0 items-center gap-1 text-[10px] font-semibold sm:text-[11px]">
              {selected && !compact && <CheckCircle weight="regular" size={11} aria-hidden />}
              <span className="truncate">{style.shortLabel}</span>
            </span>
            <span
              aria-label={style.tier}
              className={`${compact ? 'h-1.5 w-1.5 shrink-0 rounded-full sm:h-auto sm:w-auto sm:rounded-none sm:text-[8px]' : 'text-[9px]'} font-semibold ${
                style.tier === 'Free'
                  ? compact
                    ? 'bg-olive-600 text-olive-600 dark:bg-olive-400 dark:text-olive-400 sm:bg-transparent dark:sm:bg-transparent'
                    : 'text-olive-600 dark:text-olive-400'
                  : compact
                    ? 'bg-sand-600 text-sand-600 dark:bg-sand-400 dark:text-sand-400 sm:bg-transparent dark:sm:bg-transparent'
                    : 'text-sand-600 dark:text-sand-400'
              }`}
            >
              <span className={compact ? 'hidden sm:inline' : ''}>{style.tier}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
