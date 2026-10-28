'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowCounterClockwise, Check, Copy, DownloadSimple, MagnifyingGlass } from '@phosphor-icons/react'
import { PageCrumbs } from '@/app/components/PageCrumbs'
import { CopyPage } from '@/app/components/CopyPage'
import { buttonClasses } from '@/app/components/buttonClasses'
import { copyText } from '@/app/components/useCopied'
import { useTheme } from '@/app/components/ThemeProvider'
import { Slider } from '@/app/lab/_lib/particleMark/controls/Slider'
import { ICON_CATEGORIES, ICON_CATEGORY_LABELS, ICON_COUNT, type IconCategorySlug } from '../_lib/categories'
import { iconInstallCommand } from '../_lib/constants'
import { overviewMarkdown } from '../_lib/markdown'
import type { IconMarkupMap, IconMeta, IconStyle } from '../_lib/types'
import { ColourControl } from './ColourControl'
import { IconDialog } from './IconDialog'
import { IconTile } from './IconTile'
import { StylePicker } from './StylePicker'
import { useIconVariant } from './useIconVariant'

export function IconsOverview({
  icons,
  lineIcons,
  category,
}: {
  icons: IconMeta[]
  lineIcons: IconMarkupMap
  category?: IconCategorySlug
}) {
  const { theme } = useTheme()
  const [query, setQuery] = useState('')
  const [style, setStyle] = useState<IconStyle>('line')
  const [size, setSize] = useState(32)
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [colourOverride, setColourOverride] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [installCopied, setInstallCopied] = useState(false)
  const colour = colourOverride ?? (theme === 'dark' ? '#f5f3ff' : '#1b1a17')
  const { data, loading } = useIconVariant(lineIcons, style)
  const normalizedQuery = query.trim().toLowerCase()
  const visible = useMemo(
    () =>
      icons.filter(
        (icon) =>
          !normalizedQuery ||
          icon.name.toLowerCase().includes(normalizedQuery) ||
          icon.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)),
      ),
    [icons, normalizedQuery],
  )
  const grouped = useMemo(
    () =>
      ICON_CATEGORIES.map(([slug, label]) => ({
        slug,
        label,
        icons: visible.filter((icon) => icon.category === slug),
      })).filter((group) => group.icons.length > 0),
    [visible],
  )
  const categoryLabel = category ? ICON_CATEGORY_LABELS[category] : undefined
  const selectedIcon = selected ? visible.find((icon) => icon.name === selected) : undefined
  const dialogIcons = selectedIcon ? visible.filter((icon) => icon.category === selectedIcon.category) : []
  const heading = categoryLabel ? `${categoryLabel} icons` : 'Icons'
  const lead = categoryLabel
    ? `Browse ${icons.length} ${categoryLabel.toLowerCase()} icons in four styles.`
    : 'Drawn on one 24 grid in four styles. Copy one, or install the package.'

  const reset = () => {
    setQuery('')
    setStyle('line')
    setSize(32)
    setStrokeWidth(2)
    setColourOverride(null)
  }

  const copyInstall = async () => {
    const ok = await copyText(iconInstallCommand('sparkles'))
    if (!ok) return
    setInstallCopied(true)
    setTimeout(() => setInstallCopied(false), 2000)
  }

  return (
    <main className="min-h-full bg-sand-50 pb-20 pt-8 dark:bg-sand-950 sm:pt-10">
      <div className="mx-auto w-full max-w-[1160px] px-4 sm:px-6">
        <PageCrumbs />
        <CopyPage markdown={overviewMarkdown()} markdownHref="/icons/md" />
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50">{heading}</h1>
          <p className="mt-2 text-base text-sand-700 dark:text-sand-300">{lead}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-sand-600 dark:text-sand-400">
            <span><strong className="font-bold text-sand-900 dark:text-sand-50">{icons.length}</strong> icons</span>
            <span><strong className="font-bold text-sand-900 dark:text-sand-50">4</strong> styles</span>
            <span><strong className="font-bold text-sand-900 dark:text-sand-50">{ICON_CATEGORIES.length}</strong> categories</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void copyInstall()}
              className="inline-flex h-8 max-w-full items-center gap-2 rounded-lg border border-sand-300 px-3 font-mono text-[11px] text-sand-800 hover:border-sand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:border-sand-700 dark:text-sand-200 dark:hover:border-sand-600"
            >
              {installCopied ? <Check weight="regular" size={13} className="shrink-0" /> : <Copy weight="regular" size={13} className="shrink-0" />}
              <span className="truncate">{iconInstallCommand('sparkles')}</span>
            </button>
            <Link href="/pricing" className={buttonClasses({ variant: 'primary', size: 'xs' })}>
              <DownloadSimple weight="regular" size={14} />
              Download all
              <span className="rounded-full bg-sand-950/15 px-1.5 py-0.5 text-[9px] font-bold">Premium</span>
            </Link>
          </div>
        </header>

        <section
          aria-label="Icon filters"
          className="sticky top-0 z-30 -mx-2 mt-8 flex flex-wrap items-center gap-2 rounded-2xl bg-sand-50/95 p-2 shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:bg-sand-950/95 dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
        >
          <label className="relative min-w-[220px] flex-[1_1_280px]">
            <MagnifyingGlass weight="regular" size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand-600 dark:text-sand-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${category ? icons.length : ICON_COUNT} icons by name or tag`}
              className="h-10 w-full rounded-xl border border-sand-300 bg-sand-100 pl-10 pr-3 text-sm text-sand-900 outline-none placeholder:text-sand-600 focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-50 dark:placeholder:text-sand-400"
            />
          </label>
          <div className="min-w-[330px] flex-[1_1_390px]">
            <StylePicker value={style} onChange={setStyle} compact loading={loading} />
          </div>
          <div className="min-w-[140px] flex-1">
            <Slider label="Size" value={size} onChange={setSize} min={16} max={64} step={4} format={(value) => `${value}px`} />
          </div>
          <div className="min-w-[140px] flex-1">
            <Slider label="Stroke" value={strokeWidth} onChange={setStrokeWidth} min={1} max={3} step={0.25} format={(value) => value.toFixed(2)} />
          </div>
          <ColourControl value={colour} onChange={setColourOverride} />
          <button
            type="button"
            onClick={reset}
            aria-label="Reset icon controls"
            title="Reset"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sand-600 hover:bg-sand-200 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:text-sand-400 dark:hover:bg-sand-800 dark:hover:text-sand-50"
          >
            <ArrowCounterClockwise weight="regular" size={16} />
          </button>
        </section>

        {visible.length > 0 ? (
          <div className="mt-7 space-y-8">
            {grouped.map((group) => (
              <section key={group.slug} aria-labelledby={`icons-${group.slug}`}>
                <h2 id={`icons-${group.slug}`} className="mb-3 text-sm font-bold text-sand-900 dark:text-sand-50">
                  {group.label}
                  <span className="ml-2 font-normal text-sand-600 dark:text-sand-400">{group.icons.length}</span>
                </h2>
                <div className="grid grid-cols-2 gap-2 min-[500px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9">
                  {group.icons.map((icon) => (
                    <IconTile
                      key={icon.name}
                      icon={icon}
                      markup={data[icon.name] ?? lineIcons[icon.name] ?? ''}
                      size={size}
                      strokeWidth={strokeWidth}
                      colour={colour}
                      style={style}
                      onOpen={() => setSelected(icon.name)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-20 text-center">
            <p className="text-lg font-bold text-sand-900 dark:text-sand-50">No icons found</p>
            <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">Try another name or tag.</p>
          </div>
        )}
      </div>
      {selected && dialogIcons.length > 0 && (
        <IconDialog
          icons={dialogIcons}
          selectedName={selected}
          onSelect={setSelected}
          onClose={() => setSelected(null)}
          data={data}
          style={style}
          onStyle={setStyle}
          loadingStyle={loading}
          size={size}
          onSize={setSize}
          strokeWidth={strokeWidth}
          onStrokeWidth={setStrokeWidth}
          colour={colour}
          onColour={setColourOverride}
        />
      )}
    </main>
  )
}
