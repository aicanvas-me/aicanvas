'use client'

import { useState } from 'react'
import { IconSvg } from './IconSvg'

const PREVIEW_SIZES = [16, 20, 24, 32, 48]

export function PreviewSizeStrip({
  markup,
  strokeWidth,
  colour,
  surface,
  embedded = false,
}: {
  markup: string
  strokeWidth: number
  colour: string
  surface: 'dark' | 'light'
  embedded?: boolean
}) {
  return (
    <div
      className={`flex items-end justify-evenly gap-2 px-4 py-4 ${
        embedded ? '' : 'rounded-2xl border border-sand-200 dark:border-sand-800'
      } ${surface === 'dark' ? 'bg-[#0f0f10] text-white/55' : 'bg-[#f6f4ee] text-black/50'}`}
    >
      {PREVIEW_SIZES.map((previewSize) => (
        <div key={previewSize} className="flex min-w-6 flex-col items-center gap-2 text-[10px]">
          <IconSvg markup={markup} size={previewSize} apiSize={previewSize} strokeWidth={strokeWidth} colour={colour} />
          <span>{previewSize}</span>
        </div>
      ))}
    </div>
  )
}

export function PreviewStage({
  markup,
  name,
  size,
  strokeWidth,
  colour,
  className = '',
  counter,
  surface: controlledSurface,
  onSurfaceChange,
  showSizes = true,
}: {
  markup: string
  name: string
  size: number
  strokeWidth: number
  colour: string
  className?: string
  counter?: string
  surface?: 'dark' | 'light'
  onSurfaceChange?: (surface: 'dark' | 'light') => void
  showSizes?: boolean
}) {
  const [internalSurface, setInternalSurface] = useState<'dark' | 'light'>('dark')
  const surface = controlledSurface ?? internalSurface
  const setSurface = (next: 'dark' | 'light') => {
    setInternalSurface(next)
    onSurfaceChange?.(next)
  }
  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900 ${className}`}
      aria-label={`${name} preview`}
    >
      <div className={`flex items-center justify-between gap-4 p-4 ${surface === 'dark' ? 'bg-[#0f0f10]' : 'bg-[#f6f4ee]'}`}>
        <div className={`inline-flex rounded-lg border p-0.5 ${surface === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
          {(['dark', 'light'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSurface(option)}
              aria-pressed={surface === option}
              className={`h-7 rounded-md px-3 text-xs font-semibold capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 ${
                surface === option
                  ? surface === 'dark'
                    ? 'bg-white/10 text-white'
                    : 'bg-white text-[#181714] shadow-sm'
                  : surface === 'dark'
                    ? 'text-white/55'
                    : 'text-black/55'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {counter && <p className={surface === 'dark' ? 'text-xs text-white/45' : 'text-xs text-black/45'}>{counter}</p>}
      </div>
      <div className={`flex min-h-[220px] flex-1 items-center justify-center ${surface === 'dark' ? 'bg-[#0f0f10]' : 'bg-[#f6f4ee]'}`}>
        <IconSvg markup={markup} size={184} apiSize={size} strokeWidth={strokeWidth} colour={colour} label={name} />
      </div>
      {showSizes && <PreviewSizeStrip markup={markup} strokeWidth={strokeWidth} colour={colour} surface={surface} embedded />}
    </section>
  )
}
