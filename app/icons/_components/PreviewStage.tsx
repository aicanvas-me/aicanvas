'use client'

import { useState } from 'react'
import { IconSvg } from './IconSvg'

const PREVIEW_SIZES = [16, 20, 24, 32, 48]
// The stage shows the picked size magnified, so Size visibly grows and shrinks
// the icon while the line stays true to that size: 4x up to 64 px, then a
// gentler slope so 96 px still fits the stage (24 -> 96, 64 -> 256, 96 -> 304).
const stageSize = (size: number) => Math.round(Math.min(size * 4, 160 + size * 1.5))

export function PreviewSizeStrip({
  markup,
  strokeWidth,
  absolute,
  colour,
  surface,
  embedded = false,
}: {
  markup: string
  strokeWidth: number
  absolute: boolean
  colour: string
  surface: 'dark' | 'light'
  embedded?: boolean
}) {
  return (
    <div
      className={`flex shrink-0 items-end justify-evenly gap-2 px-4 py-4 ${
        embedded
          ? `border-t ${surface === 'dark' ? 'border-white/10' : 'border-black/10'}`
          : 'rounded-section border border-sand-200 dark:border-sand-800'
      } ${surface === 'dark' ? 'bg-sand-950 text-white/55' : 'bg-sand-50 text-black/50'}`}
    >
      {PREVIEW_SIZES.map((previewSize) => (
        <div key={previewSize} className="flex min-w-6 flex-col items-center gap-2 text-[10px]">
          <IconSvg markup={markup} size={previewSize} apiSize={previewSize} strokeWidth={strokeWidth} absolute={absolute} colour={colour} />
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
  absolute,
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
  absolute: boolean
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
      className={`relative flex min-h-0 flex-col overflow-hidden rounded-card border border-sand-200 dark:border-sand-800 ${
        surface === 'dark' ? 'bg-sand-950' : 'bg-sand-50'
      } ${className}`}
      aria-label={`${name} preview`}
    >
      {/* The surface pill floats in the card's top-left corner, so the icon
          centres on the whole card above the size ladder, not under a bar. */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 p-3">
        <div className={`inline-flex rounded-full border p-0.5 ${surface === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
          {(['dark', 'light'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSurface(option)}
              aria-pressed={surface === option}
              className={`h-7 rounded-full px-3 text-xs font-semibold capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                surface === option
                  ? surface === 'dark'
                    ? 'bg-white/10 text-white'
                    : 'bg-white text-sand-900 shadow-sm'
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
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-4 pt-14">
        <IconSvg className="max-h-full max-w-full" markup={markup} size={stageSize(size)} apiSize={size} strokeWidth={strokeWidth} absolute={absolute} colour={colour} label={name} />
      </div>
      {showSizes && <PreviewSizeStrip markup={markup} strokeWidth={strokeWidth} absolute={absolute} colour={colour} surface={surface} embedded />}
    </section>
  )
}
