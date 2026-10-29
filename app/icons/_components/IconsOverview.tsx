'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { ArrowCounterClockwise, Check, Copy, DownloadSimple, MagnifyingGlass } from '@phosphor-icons/react'
import { Breadcrumbs } from '@/app/components/Breadcrumbs'
import { PageCrumbs, useTopBarLeft } from '@/app/components/PageCrumbs'
import { CopyPage } from '@/app/components/CopyPage'
import { PAGE_TOP, PageFrame } from '@/app/_components/DesignSystemPage'
import { buttonClasses } from '@/app/components/buttonClasses'
import { copyText } from '@/app/components/useCopied'
import { useTheme } from '@/app/components/ThemeProvider'
import { Slider } from '@/app/lab/_lib/particleMark/controls/Slider'
import { ICON_CATEGORIES, ICON_CATEGORY_LABELS, ICON_COUNT, type IconCategorySlug } from '../_lib/categories'
import { ALL_ICONS_INSTALL, DARK_PREVIEW_COLOUR, LIGHT_PREVIEW_COLOUR } from '../_lib/constants'
import { overviewMarkdown } from '../_lib/markdown'
import type { IconGridMeta, IconMarkupMap, IconMeta, IconStyle } from '../_lib/types'
import { AbsoluteStrokeControl } from './AbsoluteStrokeControl'
import { ColourControl } from './ColourControl'
import { IconDialog } from './IconDialog'
import { IconTile } from './IconTile'
import { StylePicker } from './StylePicker'
import { useIconVariant } from './useIconVariant'

let metadataRequest: Promise<IconMeta[]> | null = null

const ICON_GRID = 'grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
const ICON_TILE_SKIN =
  '[&_[data-icon-tile]]:relative [&_[data-icon-tile]]:aspect-square [&_[data-icon-tile]]:min-h-0 [&_[data-icon-tile]]:overflow-hidden [&_[data-icon-tile]]:rounded-section [&_[data-icon-tile]]:border [&_[data-icon-tile]]:border-transparent [&_[data-icon-tile]]:bg-sand-100 [&_[data-icon-tile]]:transition-colors [&_[data-icon-tile]:hover]:border-sand-300 dark:[&_[data-icon-tile]]:bg-sand-900 dark:[&_[data-icon-tile]:hover]:border-sand-700 [&_[data-icon-link]]:flex [&_[data-icon-link]]:h-full [&_[data-icon-link]]:w-full [&_[data-icon-link]]:flex-col [&_[data-icon-link]]:items-center [&_[data-icon-link]]:justify-center [&_[data-icon-link]]:gap-3 [&_[data-icon-link]]:px-1.5 [&_[data-icon-link]]:pb-1.5 [&_[data-icon-link]]:pt-3 [&_[data-icon-link]]:text-sand-900 [&_[data-icon-link]]:outline-none focus-visible:[&_[data-icon-link]]:ring-2 focus-visible:[&_[data-icon-link]]:ring-inset focus-visible:[&_[data-icon-link]]:ring-accent/40 dark:[&_[data-icon-link]]:text-sand-50 [&_[data-icon-name]]:w-full [&_[data-icon-name]]:truncate [&_[data-icon-name]]:text-center [&_[data-icon-name]]:text-[10px] [&_[data-icon-name]]:leading-4 [&_[data-icon-name]]:text-sand-600 sm:[&_[data-icon-name]]:text-[11px] dark:[&_[data-icon-name]]:text-sand-400 [&_[data-icon-placeholder]]:h-8 [&_[data-icon-placeholder]]:w-8 [&_[data-icon-new]]:absolute [&_[data-icon-new]]:left-2 [&_[data-icon-new]]:top-2 [&_[data-icon-new]]:z-10 [&_[data-icon-new]]:h-1.5 [&_[data-icon-new]]:w-1.5 [&_[data-icon-new]]:rounded-full [&_[data-icon-new]]:bg-accent'

export function IconsOverview({
  icons,
  lineIcons,
  loadFullLine,
  category,
}: {
  icons: IconGridMeta[]
  lineIcons: IconMarkupMap
  loadFullLine: boolean
  category?: IconCategorySlug
}) {
  const { theme } = useTheme()
  const [query, setQuery] = useState('')
  const [style, setStyle] = useState<IconStyle>('line')
  const [size, setSize] = useState(40)
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [absolute, setAbsolute] = useState(true)
  const [colourOverride, setColourOverride] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<IconMeta[] | null>(null)
  const [installCopied, setInstallCopied] = useState(false)
  const colour = colourOverride ?? (theme === 'dark' ? DARK_PREVIEW_COLOUR : LIGHT_PREVIEW_COLOUR)
  const { data, loading } = useIconVariant(lineIcons, style, loadFullLine)
  const loadMetadata = useCallback(() => {
    metadataRequest ??= fetch('/icons/icon-data').then((response) => {
      if (!response.ok) throw new Error('Could not load icon metadata')
      return response.json() as Promise<IconMeta[]>
    })
    void metadataRequest.then(setMetadata).catch(() => {})
  }, [])
  const metadataByName = useMemo(
    () => new Map((metadata ?? []).map((icon) => [icon.name, icon])),
    [metadata],
  )
  const normalizedQuery = query.trim().toLowerCase()
  const visible = useMemo(
    () =>
      icons.filter(
        (icon) =>
          !normalizedQuery ||
          icon.name.toLowerCase().includes(normalizedQuery) ||
          metadataByName.get(icon.name)?.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)),
      ),
    [icons, metadataByName, normalizedQuery],
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
  const dialogIcons: IconMeta[] = selectedIcon
    ? visible
        .filter((icon) => icon.category === selectedIcon.category)
        .map((icon) => metadataByName.get(icon.name) ?? { ...icon, tags: [], added: '' })
    : []
  const heading = categoryLabel ? `${categoryLabel} icons` : 'Icons'
  const lead = categoryLabel
    ? `Browse ${icons.length} ${categoryLabel} icons in four styles.`
    : 'Drawn on one 24 px grid, in four styles. Line is free, the other three come with Premium.'
  const categoryCrumbs = useMemo(
    () =>
      categoryLabel ? (
        <Breadcrumbs crumbs={[{ label: 'Icons', href: '/icons' }, { label: categoryLabel }]} />
      ) : null,
    [categoryLabel],
  )
  useTopBarLeft(categoryCrumbs)

  const reset = () => {
    setQuery('')
    setStyle('line')
    setSize(40)
    setStrokeWidth(2)
    setAbsolute(true)
    setColourOverride(null)
  }

  const copyInstall = async () => {
    const ok = await copyText(ALL_ICONS_INSTALL)
    if (!ok) return
    setInstallCopied(true)
    setTimeout(() => setInstallCopied(false), 2000)
  }

  return (
    <main className="min-h-full bg-sand-50 pb-20 dark:bg-sand-950">
      {/* The design-system pages' frame, so the title and the grid start on the
          same edge as /components and every system page beside the rail. */}
      <PageFrame className={PAGE_TOP}>
        <PageCrumbs />
        <CopyPage markdown={overviewMarkdown()} markdownHref="/icons/md" />
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50">{heading}</h1>
          <p className="mt-2 text-base text-sand-700 dark:text-sand-300">{lead}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-sand-600 dark:text-sand-400">
            <span><strong className="font-bold text-sand-900 dark:text-sand-50">{icons.length}</strong> icons</span>
            <span><strong className="font-bold text-sand-900 dark:text-sand-50">4</strong> styles</span>
            <span><strong className="font-bold text-sand-900 dark:text-sand-50">{ICON_CATEGORIES.length}</strong> categories</span>
            {/* The key to the accent dot a new icon carries in the grid's corner. */}
            <span className="inline-flex items-center gap-1.5">
              <i aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span><strong className="font-bold text-sand-900 dark:text-sand-50">{icons.filter((icon) => icon.isNew).length}</strong> new</span>
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void copyInstall()}
              className="inline-flex h-8 max-w-full items-center gap-2 rounded-full border border-sand-300 px-3.5 font-mono text-[11px] text-sand-800 hover:border-sand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-sand-700 dark:text-sand-200 dark:hover:border-sand-600"
            >
              {installCopied ? <Check weight="regular" size={13} className="shrink-0" /> : <Copy weight="regular" size={13} className="shrink-0" />}
              <span className="truncate">{ALL_ICONS_INSTALL}</span>
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
          className="z-30 -mx-2 mt-8 flex flex-wrap items-center gap-2 rounded-section bg-sand-50/95 p-2 shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:bg-sand-950/95 dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)] sm:sticky sm:top-0"
        >
          <label className="relative min-w-[180px] flex-[1_1_180px]">
            <MagnifyingGlass weight="regular" size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand-600 dark:text-sand-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                if (event.target.value) loadMetadata()
              }}
              placeholder={`Search ${category ? icons.length : ICON_COUNT} icons by name or tag`}
              className="h-10 w-full rounded-full border border-sand-300 bg-sand-100 pl-10 pr-3 text-sm text-sand-900 outline-none placeholder:text-sand-600 focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-50 dark:placeholder:text-sand-400"
            />
          </label>
          <div className="w-full flex-[1_1_390px] sm:min-w-[350px] xl:min-w-[420px] xl:flex-[0_0_420px] min-[1440px]:min-w-[460px] min-[1440px]:flex-[0_0_460px]">
            <StylePicker value={style} onChange={setStyle} compact loading={loading} />
          </div>
          {/* Second row: the sliders get the full width instead of being squeezed beside search and style. */}
          <div aria-hidden className="h-0 basis-full" />
          <div className="h-10 min-w-[140px] flex-1 [&>div>div]:h-10">
            <Slider themed pill label="Size" value={size} onChange={setSize} min={16} max={64} step={4} format={(value) => `${value}px`} />
          </div>
          <div className="h-10 min-w-[140px] flex-1 [&>div>div]:h-10">
            <Slider themed pill label="Stroke" value={strokeWidth} onChange={setStrokeWidth} min={1} max={3} step={0.25} format={(value) => value.toFixed(2)} />
          </div>
          <AbsoluteStrokeControl value={absolute} onChange={setAbsolute} className="h-10" />
          <ColourControl value={colour} onChange={setColourOverride} className="h-10" />
          <button
            type="button"
            onClick={reset}
            aria-label="Reset icon controls"
            title="Reset"
            className="flex h-10 w-10 items-center justify-center rounded-full text-sand-600 hover:bg-sand-200 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:text-sand-400 dark:hover:bg-sand-800 dark:hover:text-sand-50"
          >
            <ArrowCounterClockwise weight="regular" size={16} />
          </button>
        </section>

        {visible.length > 0 ? (
          <div className={`mt-7 space-y-8 ${ICON_TILE_SKIN}`}>
            {grouped.map((group) => (
              <section key={group.slug} aria-labelledby={`icons-${group.slug}`}>
                <h2 id={`icons-${group.slug}`} className="mb-3 text-sm font-bold text-sand-900 dark:text-sand-50">
                  {group.label}
                  <span className="ml-2 font-normal text-sand-600 dark:text-sand-400">{group.icons.length}</span>
                </h2>
                <div className={ICON_GRID}>
                  {group.icons.map((icon) => (
                    <IconTile
                      key={icon.name}
                      icon={icon}
                      markup={data[icon.name] ?? lineIcons[icon.name] ?? ''}
                      size={size}
                      strokeWidth={strokeWidth}
                      absolute={absolute}
                      colour={colour}
                      style={style}
                      onOpen={() => {
                        setSelected(icon.name)
                        loadMetadata()
                      }}
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
      </PageFrame>
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
          absolute={absolute}
          onAbsolute={setAbsolute}
          colour={colourOverride}
          onColour={setColourOverride}
        />
      )}
    </main>
  )
}
