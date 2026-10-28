'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowCounterClockwise, ArrowLeft, ArrowRight, Copy } from '@phosphor-icons/react'
import { CopyPage } from '@/app/components/CopyPage'
import { PageCrumbs } from '@/app/components/PageCrumbs'
import { copyText } from '@/app/components/useCopied'
import { useTheme } from '@/app/components/ThemeProvider'
import { Slider } from '@/app/lab/_lib/particleMark/controls/Slider'
import { ICON_CATEGORY_LABELS } from '../_lib/categories'
import { formatDate, iconLead, titleCase } from '../_lib/icon-utils'
import type { IconMarkupMap, IconMeta, IconStyle, IconWithMarkup } from '../_lib/types'
import { ActionBar } from './ActionBar'
import { CodeTabs } from './CodeTabs'
import { ColourControl } from './ColourControl'
import { IconSvg } from './IconSvg'
import { PreviewStage } from './PreviewStage'
import { StylePicker } from './StylePicker'
import { useIconVariant } from './useIconVariant'

function SuggestedTile({ icon, size, strokeWidth, colour }: { icon: IconWithMarkup; size: number; strokeWidth: number; colour: string }) {
  return (
    <article className="group relative aspect-square overflow-hidden rounded-xl border border-transparent bg-sand-100 transition-colors hover:border-sand-300 dark:bg-sand-900 dark:hover:border-sand-700">
      {icon.isNew && <span aria-label="New" className="absolute left-3 top-3 z-10 h-1.5 w-1.5 rounded-full bg-olive-500" />}
      <Link
        href={`/icons/${icon.name}`}
        className="flex h-full flex-col items-center justify-center gap-3 px-2 pb-2 pt-4 text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-olive-500/40 dark:text-sand-50"
      >
        <IconSvg markup={icon.markup} size={Math.min(size, 32)} strokeWidth={strokeWidth} colour={colour} />
        <span className="line-clamp-2 min-h-7 text-center text-[10px] leading-3.5 text-sand-600 dark:text-sand-400">{icon.name}</span>
      </Link>
      <button
        type="button"
        aria-label={`Copy ${icon.name} slug`}
        onClick={() => void copyText(icon.name)}
        className="absolute right-2 top-2 flex h-6 w-6 translate-y-1 items-center justify-center rounded-md border border-sand-300 bg-sand-50 text-sand-700 opacity-0 shadow-sm transition-[opacity,transform] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 motion-reduce:transition-none dark:border-sand-700 dark:bg-sand-800 dark:text-sand-300"
      >
        <Copy weight="regular" size={12} />
      </button>
    </article>
  )
}

export function IconDetail({
  icon,
  lineIcons,
  suggestions,
  previous,
  next,
  markdown,
}: {
  icon: IconMeta
  lineIcons: IconMarkupMap
  suggestions: IconWithMarkup[]
  previous?: IconWithMarkup
  next?: IconWithMarkup
  markdown: string
}) {
  const { theme } = useTheme()
  const [style, setStyle] = useState<IconStyle>('line')
  const [size, setSize] = useState(24)
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [colourOverride, setColourOverride] = useState<string | null>(null)
  const colour = colourOverride ?? (theme === 'dark' ? '#f5f3ff' : '#1b1a17')
  const { data, loading } = useIconVariant(lineIcons, style)
  const markup = data[icon.name] ?? lineIcons[icon.name] ?? ''
  const categoryLabel = ICON_CATEGORY_LABELS[icon.category]
  const title = titleCase(icon.name)

  const reset = () => {
    setStyle('line')
    setSize(24)
    setStrokeWidth(2)
    setColourOverride(null)
  }

  return (
    <main className="min-h-full bg-sand-50 pb-20 pt-8 dark:bg-sand-950 sm:pt-10">
      <div className="mx-auto w-full max-w-[1160px] px-4 sm:px-6">
        <PageCrumbs />
        <CopyPage markdown={markdown} markdownHref={`/icons/${icon.name}/md`} />
        <header>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-5xl">{title}</h1>
            <button
              type="button"
              onClick={() => void copyText(icon.name)}
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-sand-300 px-3 font-mono text-xs text-sand-700 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:border-sand-700 dark:text-sand-300 dark:hover:text-sand-50"
            >
              {icon.name}
              <Copy weight="regular" size={13} />
            </button>
          </div>
          <p className="mt-2 text-base text-sand-700 dark:text-sand-300">{iconLead(icon, categoryLabel)}</p>
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-xs">
            <div><dt className="text-sand-600 dark:text-sand-400">Category</dt><dd className="mt-0.5 font-semibold text-sand-900 dark:text-sand-50">{categoryLabel}</dd></div>
            <div><dt className="text-sand-600 dark:text-sand-400">Styles</dt><dd className="mt-0.5 font-semibold text-sand-900 dark:text-sand-50">4</dd></div>
            <div><dt className="text-sand-600 dark:text-sand-400">Added</dt><dd className="mt-0.5 font-semibold text-sand-900 dark:text-sand-50">{formatDate(icon.added)}</dd></div>
            <div className="min-w-0 flex-1"><dt className="text-sand-600 dark:text-sand-400">Tags</dt><dd className="mt-0.5 font-semibold text-sand-900 dark:text-sand-50">{icon.tags.join(', ')}</dd></div>
          </dl>
        </header>

        <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(350px,1fr)]">
          <PreviewStage markup={markup} name={title} size={size} strokeWidth={strokeWidth} colour={colour} className="min-h-[490px]" />
          <aside className="min-w-0">
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-sand-600 dark:text-sand-400">Style</h2>
            <StylePicker value={style} onChange={setStyle} markup={markup} loading={loading} />
            <h2 className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-sand-600 dark:text-sand-400">Customize</h2>
            <div className="space-y-2">
              <Slider label="Size" value={size} onChange={setSize} min={16} max={96} step={4} format={(value) => `${value}px`} />
              <Slider label="Stroke" value={strokeWidth} onChange={setStrokeWidth} min={1} max={3} step={0.25} format={(value) => value.toFixed(2)} />
              <div className="flex items-center justify-between">
                <ColourControl value={colour} onChange={setColourOverride} />
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-sand-600 hover:bg-sand-200 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:text-sand-400 dark:hover:bg-sand-800 dark:hover:text-sand-50"
                >
                  <ArrowCounterClockwise weight="regular" size={14} />
                  Reset
                </button>
              </div>
            </div>
            <div className="mt-4">
              <ActionBar name={icon.name} markup={markup} size={size} strokeWidth={strokeWidth} colour={colour} style={style} />
            </div>
            <CodeTabs className="mt-4 min-h-[188px]" name={icon.name} markup={markup} size={size} strokeWidth={strokeWidth} colour={colour} style={style} />
          </aside>
        </div>

        <section className="mt-9" aria-labelledby="suggested-icons">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 id="suggested-icons" className="text-[11px] font-bold uppercase tracking-wider text-sand-600 dark:text-sand-400">Suggested icons</h2>
            <Link href={`/icons?category=${icon.category}`} className="inline-flex items-center gap-1 text-xs font-semibold text-olive-600 hover:text-olive-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:text-olive-400">
              All {categoryLabel} icons
              <ArrowRight weight="regular" size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 min-[500px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9">
            {suggestions.map((suggestion) => (
              <SuggestedTile key={suggestion.name} icon={suggestion} size={size} strokeWidth={strokeWidth} colour={colour} />
            ))}
          </div>
        </section>

        <nav aria-label="Adjacent icons" className="mt-8 grid gap-3 sm:grid-cols-2">
          {previous ? (
            <Link href={`/icons/${previous.name}`} className="flex min-h-16 items-center gap-4 rounded-xl bg-sand-100 px-5 py-3 text-sand-900 transition-colors hover:bg-sand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:bg-sand-900 dark:text-sand-50 dark:hover:bg-sand-800">
              <ArrowLeft weight="regular" size={18} />
              <IconSvg markup={previous.markup} size={28} strokeWidth={strokeWidth} colour={colour} />
              <span><span className="block text-[10px] text-sand-600 dark:text-sand-400">Previous</span><span className="font-bold">{titleCase(previous.name)}</span></span>
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/icons/${next.name}`} className="flex min-h-16 items-center justify-end gap-4 rounded-xl bg-sand-100 px-5 py-3 text-right text-sand-900 transition-colors hover:bg-sand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:bg-sand-900 dark:text-sand-50 dark:hover:bg-sand-800">
              <span><span className="block text-[10px] text-sand-600 dark:text-sand-400">Next</span><span className="font-bold">{titleCase(next.name)}</span></span>
              <IconSvg markup={next.markup} size={28} strokeWidth={strokeWidth} colour={colour} />
              <ArrowRight weight="regular" size={18} />
            </Link>
          )}
        </nav>
      </div>
    </main>
  )
}

