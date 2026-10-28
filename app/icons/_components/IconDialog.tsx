'use client'

import Link from 'next/link'
import { useEffect, useEffectEvent, useMemo, useRef } from 'react'
import { ArrowLeft, ArrowRight, Copy, X } from '@phosphor-icons/react'
import { Slider } from '@/app/lab/_lib/particleMark/controls/Slider'
import { buttonClasses } from '@/app/components/buttonClasses'
import { copyText } from '@/app/components/useCopied'
import { useDialogFocus } from '@/app/components/useDialogFocus'
import { ICON_CATEGORY_LABELS } from '../_lib/categories'
import { titleCase } from '../_lib/icon-utils'
import type { IconMarkupMap, IconMeta, IconStyle } from '../_lib/types'
import { ActionBar } from './ActionBar'
import { CodeTabs } from './CodeTabs'
import { ColourControl } from './ColourControl'
import { IconSvg } from './IconSvg'
import { PreviewStage } from './PreviewStage'
import { StylePicker } from './StylePicker'

export function IconDialog({
  icons,
  selectedName,
  onSelect,
  onClose,
  data,
  style,
  onStyle,
  loadingStyle,
  size,
  onSize,
  strokeWidth,
  onStrokeWidth,
  colour,
  onColour,
}: {
  icons: IconMeta[]
  selectedName: string
  onSelect: (name: string) => void
  onClose: () => void
  data: IconMarkupMap
  style: IconStyle
  onStyle: (style: IconStyle) => void
  loadingStyle: boolean
  size: number
  onSize: (size: number) => void
  strokeWidth: number
  onStrokeWidth: (stroke: number) => void
  colour: string
  onColour: (colour: string) => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  useDialogFocus(panelRef, true)
  const index = Math.max(0, icons.findIndex((icon) => icon.name === selectedName))
  const icon = icons[index]
  const markup = data[icon.name] ?? ''
  const categoryLabel = ICON_CATEGORY_LABELS[icon.category]
  const similar = useMemo(() => {
    const tags = new Set(icon.tags.map((tag) => tag.toLowerCase()))
    return icons
      .filter((candidate) => candidate.name !== icon.name)
      .map((candidate) => ({
        candidate,
        score: candidate.tags.reduce((sum, tag) => sum + (tags.has(tag.toLowerCase()) ? 1 : 0), 0),
      }))
      .sort((a, b) => b.score - a.score || Number(b.candidate.category === icon.category) - Number(a.candidate.category === icon.category))
      .slice(0, 8)
      .map(({ candidate }) => candidate)
  }, [icons, icon])

  const step = (direction: -1 | 1) => {
    const next = index + direction
    if (next >= 0 && next < icons.length) onSelect(icons[next].name)
  }

  const handleDialogKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') onClose()
    if (event.target instanceof HTMLInputElement) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      const previous = index - 1
      if (previous >= 0) onSelect(icons[previous].name)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      const next = index + 1
      if (next < icons.length) onSelect(icons[next].name)
    }
  })

  useEffect(() => {
    const scrollColumn = document.querySelector<HTMLElement>('.app-scroll-column')
    const previous = scrollColumn?.style.overflow
    if (scrollColumn) scrollColumn.style.overflow = 'hidden'
    panelRef.current?.focus()
    document.addEventListener('keydown', handleDialogKey)
    return () => {
      document.removeEventListener('keydown', handleDialogKey)
      if (scrollColumn) scrollColumn.style.overflow = previous ?? ''
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-sand-950/75 p-0 backdrop-blur-[8px] sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <button
        type="button"
        aria-label="Previous icon"
        disabled={index === 0}
        onClick={() => step(-1)}
        className="absolute left-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-sand-700 bg-sand-900 text-sand-200 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 lg:flex"
      >
        <ArrowLeft weight="regular" size={18} />
      </button>
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="icon-dialog-title"
        className="grid h-full w-full min-w-0 overflow-hidden bg-sand-50 shadow-2xl focus:outline-none dark:bg-sand-900 sm:max-h-[calc(100vh-48px)] sm:w-[min(1056px,calc(100vw-48px))] sm:rounded-2xl sm:border sm:border-sand-700 md:aspect-video md:h-auto md:grid-cols-[1fr_1.05fr]"
      >
        <PreviewStage
          markup={markup}
          name={titleCase(icon.name)}
          size={size}
          strokeWidth={strokeWidth}
          colour={colour}
          counter={`${index + 1} of ${icons.length}${icons.every((item) => item.category === icon.category) ? ` in ${categoryLabel}` : ''}`}
          className="rounded-none border-0 md:min-h-0"
        />
        <div className="relative flex min-h-0 flex-col overflow-y-auto bg-sand-100 p-4 dark:bg-sand-900 min-[1104px]:overflow-hidden">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close icon details"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-sand-600 hover:bg-sand-200 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:text-sand-400 dark:hover:bg-sand-800 dark:hover:text-sand-50"
          >
            <X weight="regular" size={18} />
          </button>
          <span className="inline-flex rounded-full bg-sand-200 px-2 py-0.5 text-[10px] font-semibold text-sand-700 dark:bg-sand-800 dark:text-sand-300">
            {categoryLabel}
          </span>
          <div className="mt-1 flex items-center gap-2 pr-10">
            <h2 id="icon-dialog-title" className="text-2xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50">
              {titleCase(icon.name)}
            </h2>
            <button
              type="button"
              onClick={() => void copyText(icon.name)}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-sand-300 px-2 font-mono text-[11px] text-sand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:border-sand-700 dark:text-sand-300"
            >
              {icon.name}
              <Copy weight="regular" size={12} />
            </button>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {icon.tags.slice(0, 6).map((tag) => (
              <span key={tag} className="rounded-full border border-sand-300 px-1.5 py-px text-[9px] text-sand-600 dark:border-sand-700 dark:text-sand-400">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-2">
            <StylePicker value={style} onChange={onStyle} markup={markup} loading={loadingStyle} />
          </div>
          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2">
            <Slider label="Size" value={size} onChange={onSize} min={16} max={64} step={4} format={(value) => `${value}px`} />
            <Slider label="Stroke" value={strokeWidth} onChange={onStrokeWidth} min={1} max={3} step={0.25} format={(value) => value.toFixed(2)} />
            <ColourControl value={colour} onChange={onColour} className="h-7 px-1" />
          </div>
          <div className="mt-2">
            <ActionBar name={icon.name} markup={markup} size={size} strokeWidth={strokeWidth} colour={colour} style={style} />
          </div>
          <CodeTabs compact className="mt-2" name={icon.name} markup={markup} size={size} strokeWidth={strokeWidth} colour={colour} style={style} />
          <div className="mt-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">Similar</p>
            <div className="grid grid-cols-8 gap-1.5">
              {similar.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  title={item.name}
                  onClick={() => {
                    const target = icons.find((candidate) => candidate.name === item.name)
                    if (target) onSelect(target.name)
                  }}
                  className="flex aspect-square items-center justify-center rounded-lg bg-sand-50 text-sand-800 hover:bg-sand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:bg-sand-950 dark:text-sand-200 dark:hover:bg-sand-800"
                >
                  <IconSvg markup={data[item.name] ?? ''} size={20} strokeWidth={strokeWidth} colour={colour} />
                </button>
              ))}
            </div>
          </div>
          <footer className="sticky bottom-0 z-10 mt-auto flex flex-wrap items-center justify-between gap-3 bg-sand-100 py-2 dark:bg-sand-900">
            <Link href={`/icons/${icon.name}`} className={buttonClasses({ variant: 'accent', size: 'xs' })}>
              Open icon page
              <ArrowRight weight="regular" size={14} />
            </Link>
            <div className="flex items-center gap-2 text-[10px] text-sand-600 dark:text-sand-400">
              <kbd className="rounded border border-sand-300 px-1.5 py-0.5 dark:border-sand-700">←</kbd>
              <kbd className="rounded border border-sand-300 px-1.5 py-0.5 dark:border-sand-700">→</kbd>
              <span>browse</span>
              <kbd className="ml-1 rounded border border-sand-300 px-1.5 py-0.5 dark:border-sand-700">Esc</kbd>
              <span>close</span>
            </div>
          </footer>
        </div>
      </div>
      <button
        type="button"
        aria-label="Next icon"
        disabled={index === icons.length - 1}
        onClick={() => step(1)}
        className="absolute right-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-sand-700 bg-sand-900 text-sand-200 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 lg:flex"
      >
        <ArrowRight weight="regular" size={18} />
      </button>
    </div>
  )
}
