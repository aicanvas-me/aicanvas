'use client'

import { Fragment, useRef, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
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
  if (compact) return <StyleTrack value={value} onChange={onChange} loading={loading} />
  return (
    <div role="radiogroup" aria-label="Icon style" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {ICON_STYLES.map((style) => {
        const selected = value === style.id
        return (
          <button
            key={style.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(style.id)}
            className={`relative flex h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-card border px-2 py-1.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
              selected
                ? 'border-accent bg-accent/5 text-sand-900 dark:text-sand-50'
                : 'border-sand-200 bg-sand-100 text-sand-600 hover:border-sand-300 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-400 dark:hover:border-sand-700'
            }`}
          >
            {markup && (
              <IconSvg
                markup={markup}
                size={20}
                weight="regular"
                className={`shrink-0 ${loading && selected ? 'animate-pulse motion-reduce:animate-none' : ''}`}
              />
            )}
            <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[10px] font-semibold sm:text-[11px]">
              <span>{style.shortLabel}</span>
            </span>
            <span
              aria-label={style.tier}
              className={`text-[9px] font-semibold ${style.tier === 'Free' ? 'text-accent' : 'text-sand-600 dark:text-sand-400'}`}
            >
              <span>{style.tier}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

// The toolbar's style switch: one track, the pick sliding between segments.
// Line stands alone; one "Premium" caption heads the three paid styles, so
// the tier is said once instead of on every segment, and nothing looks locked:
// every style previews free, the tier only gates downloads.
// Widths answer to the toolbar's container (`@container` on the panel).
function StyleTrack({
  value,
  onChange,
  loading,
}: {
  value: IconStyle
  onChange: (style: IconStyle) => void
  loading: boolean
}) {
  const reduce = useReducedMotion()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (event: KeyboardEvent, index: number) => {
    const targets: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: ICON_STYLES.length - 1,
    }
    if (!(event.key in targets)) return
    event.preventDefault()
    const next = (targets[event.key] + ICON_STYLES.length) % ICON_STYLES.length
    refs.current[next]?.focus()
    onChange(ICON_STYLES[next].id)
  }

  return (
    <div
      role="radiogroup"
      aria-label="Icon style"
      className="flex h-10 w-full min-w-0 items-center rounded-full border border-sand-200 bg-sand-50 p-1 dark:border-sand-800 dark:bg-sand-950 @min-[760px]:w-auto @min-[760px]:shrink-0"
    >
      {ICON_STYLES.map((style, index) => {
        const selected = value === style.id
        const premium = style.tier === 'Premium'
        return (
          <Fragment key={style.id}>
            {index === 1 && <span aria-hidden className="mx-1 h-4 w-px shrink-0 bg-sand-300 dark:bg-sand-700" />}
            <button
              ref={(node) => {
                refs.current[index] = node
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={premium ? `${style.label}, Premium` : `${style.label}, Free`}
              title={premium ? 'Free to preview, download with Premium' : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(style.id)}
              onKeyDown={(event) => onKey(event, index)}
              className={`relative inline-flex h-8 min-w-0 flex-auto items-center justify-center gap-1 whitespace-nowrap rounded-full px-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 @min-[560px]:gap-2 @min-[560px]:px-3 ${
                selected
                  ? 'text-sand-900 dark:text-sand-50'
                  : 'text-sand-600 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-50'
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="icons-style-pick"
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-sand-200 dark:bg-sand-800"
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <StyleGlyph
                style={style.id}
                className={`relative hidden @min-[560px]:block ${loading && selected ? 'animate-pulse motion-reduce:animate-none' : ''}`}
              />
              <span className="relative">{style.shortLabel}</span>
              {/* Line is the free style; the chip says so in the free orange. */}
              {!premium && (
                <span aria-hidden className="relative rounded-full bg-free/10 px-1.5 py-px text-[10px] font-semibold text-free ring-1 ring-inset ring-free/30">
                  Free
                </span>
              )}
            </button>
          </Fragment>
        )
      })}
    </div>
  )
}

// A four-point sparkle drawn in each style, so a segment shows what it does
// before it is picked. Inline, so it never waits on the premium style files.
const SPARKLE =
  'M8 1.75C8.45 5.15 10.85 7.55 14.25 8C10.85 8.45 8.45 10.85 8 14.25C7.55 10.85 5.15 8.45 1.75 8C5.15 7.55 7.55 5.15 8 1.75Z'
const SPARKLE_CORE =
  'M8 4.875C8.225 6.575 9.425 7.775 11.125 8C9.425 8.225 8.225 9.425 8 11.125C7.775 9.425 6.575 8.225 4.875 8C6.575 7.775 7.775 6.575 8 4.875Z'

function StyleGlyph({ style, className = '' }: { style: IconStyle; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinejoin="round"
      className={`size-4 shrink-0 ${className}`}
    >
      {style === 'line' && <path d={SPARKLE} />}
      {style === 'duotone' && (
        <>
          <path d={SPARKLE} fill="currentColor" fillOpacity={0.3} stroke="none" />
          <path d={SPARKLE} />
        </>
      )}
      {style === 'solid' && <path d={SPARKLE} fill="currentColor" />}
      {style === 'solid-duotone' && (
        <>
          <path d={SPARKLE} fill="currentColor" opacity={0.35} />
          <path d={SPARKLE_CORE} fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  )
}
