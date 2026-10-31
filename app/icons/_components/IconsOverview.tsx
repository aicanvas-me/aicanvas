'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RotateCcw } from '@/app/_icons/icons/rotate-ccw'
import { Check } from '@/app/_icons/icons/check'
import { Copy } from '@/app/_icons/icons/copy'
import { Download } from '@/app/_icons/icons/download'
import { Search } from '@/app/_icons/icons/search'
import { SquareTerminal } from '@/app/_icons/icons/square-terminal'
import { Breadcrumbs } from '@/app/components/Breadcrumbs'
import { PageCrumbs, useTopBarLeft } from '@/app/components/PageCrumbs'
import { CopyPage } from '@/app/components/CopyPage'
import { PAGE_TOP, PageFrame } from '@/app/_components/DesignSystemPage'
import { copyText } from '@/app/components/useCopied'
import { useTheme } from '@/app/components/ThemeProvider'
import { ICON_CATEGORIES, ICON_CATEGORY_LABELS, ICON_COUNT, type IconCategorySlug } from '../_lib/categories'
import {
  ALL_ICONS_INSTALL,
  DARK_PREVIEW_COLOUR,
  DARK_TILE,
  FIXED_WEIGHT,
  LIGHT_PREVIEW_COLOUR,
  LIGHT_TILE,
} from '../_lib/constants'
import { takesStroke } from '../_lib/icon-utils'
import { overviewMarkdown } from '../_lib/markdown'
import { toIconQuery } from '../_lib/settings-query'
import { ICON_DEFAULTS, storeSettings, storedSettings } from '../_lib/settings-store'
import { ICON_GRID_CLASS } from '../_lib/tile-grid'
import type { IconGridMeta, IconMarkupMap, IconMeta, IconStyle } from '../_lib/types'
import { AbsoluteStrokeControl } from './AbsoluteStrokeControl'
import { ColourControl } from './ColourControl'
import { IconTile } from './IconTile'
import { StylePicker } from './StylePicker'
import { TuneSlider } from './TuneSlider'
import { useIconVariant } from './useIconVariant'

// The grid's slider stops at 64; a bigger size picked on an icon page shows
// here at 64.
const GRID_MAX_SIZE = 64

let metadataRequest: Promise<IconMeta[]> | null = null

const INSTALL_PREFIX = ALL_ICONS_INSTALL.slice(0, ALL_ICONS_INSTALL.lastIndexOf(' '))
const INSTALL_URL = ALL_ICONS_INSTALL.slice(ALL_ICONS_INSTALL.lastIndexOf(' ') + 1)


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
  // the section's look (lib/settings-store): an icon page's picks are still set here
  const [style, setStyle] = useState<IconStyle>(() => storedSettings().style)
  const [size, setSize] = useState(() => Math.min(storedSettings().size, GRID_MAX_SIZE))
  const [strokeWidth, setStrokeWidth] = useState(() => storedSettings().strokeWidth)
  const [absolute, setAbsolute] = useState(() => storedSettings().absolute)
  const [colourOverride, setColourOverride] = useState<string | null>(() => storedSettings().colour)
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

  const searchRef = useRef<HTMLInputElement>(null)
  const settingsQuery = toIconQuery({ style, size, strokeWidth, absolute, colour: colourOverride }, ICON_DEFAULTS)
  const isDefault = !query && settingsQuery === ''
  useEffect(() => {
    storeSettings({ style, size, strokeWidth, absolute, colour: colourOverride })
  }, [style, size, strokeWidth, absolute, colourOverride])

  // "/" jumps to search from anywhere on the page, unless something else
  // already takes typing.
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      event.preventDefault()
      searchRef.current?.focus()
    }
    document.addEventListener('keydown', focusSearch)
    return () => document.removeEventListener('keydown', focusSearch)
  }, [])

  const reset = () => {
    setQuery('')
    setStyle(ICON_DEFAULTS.style)
    setSize(ICON_DEFAULTS.size)
    setStrokeWidth(ICON_DEFAULTS.strokeWidth)
    setAbsolute(ICON_DEFAULTS.absolute)
    setColourOverride(ICON_DEFAULTS.colour)
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
          {/* The install row shares the toolbar's edges and its 40px height, and
              its terminal glyph sits on the search glyph's line below. */}
          <div className="@container mt-6">
            <div className="flex flex-col gap-2 @min-[640px]:flex-row @min-[640px]:items-center">
              <button
                type="button"
                onClick={() => void copyInstall()}
                aria-label="Copy the install command for every Line icon"
                title={ALL_ICONS_INSTALL}
                className="group inline-flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-sand-200 bg-sand-100 pl-6 pr-1 text-left transition-colors hover:border-sand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-sand-800 dark:bg-sand-900 dark:hover:border-sand-700"
              >
                <SquareTerminal aria-hidden className="size-4 shrink-0 text-sand-600 dark:text-sand-400" />
                <span className="min-w-0 flex-1 truncate font-mono text-xs">
                  {/* The registry URL is the part worth reading; where the row is
                      narrow it is all that shows, and the copy is still the whole command. */}
                  <span className="hidden text-sand-600 @min-[800px]:inline dark:text-sand-400">{INSTALL_PREFIX} </span>
                  <span className="text-sand-900 dark:text-sand-50">{INSTALL_URL}</span>
                </span>
                <span className="inline-flex size-8 shrink-0 items-center justify-center gap-1.5 rounded-full text-xs font-semibold text-sand-700 transition-colors group-hover:bg-sand-200 group-hover:text-sand-900 sm:w-auto sm:px-3 dark:text-sand-300 dark:group-hover:bg-sand-800 dark:group-hover:text-sand-50">
                  {installCopied ? (
                    <Check aria-hidden className="size-3.5 text-success" />
                  ) : (
                    <Copy aria-hidden className="size-3.5" />
                  )}
                  <span className="hidden sm:inline">{installCopied ? 'Copied' : 'Copy'}</span>
                </span>
                <span aria-live="polite" className="sr-only">
                  {installCopied ? 'Install command copied' : ''}
                </span>
              </button>
              <Link
                href="/pricing"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-accent pl-4 pr-1.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-95"
              >
                <Download aria-hidden className="size-4" />
                Download all
                <span className="inline-flex h-7 items-center rounded-full bg-accent-foreground/15 px-2.5 text-xs font-semibold">Premium</span>
              </Link>
            </div>
          </div>
        </header>

        {/* One panel in two bands: find (search, style) over tune (size,
            stroke, absolute, colour, reset). Its controls are wells set into
            the panel, and every width answers to the panel itself, because the
            rail beside the page makes viewport breakpoints lie. */}
        <section
          aria-label="Icon filters"
          className="@container relative z-30 mt-3 rounded-section border border-sand-200 bg-sand-100/90 shadow-[0_1px_2px_rgba(14,14,15,0.04),0_8px_24px_rgba(14,14,15,0.06)] backdrop-blur-xl dark:border-sand-800 dark:bg-sand-900/90 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_12px_32px_rgba(0,0,0,0.45)] sm:sticky sm:top-3"
        >
          <div className="flex flex-col gap-2 p-2 @min-[760px]:flex-row @min-[760px]:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search icons</span>
              <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-sand-600 dark:text-sand-400" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  if (event.target.value) loadMetadata()
                }}
                placeholder={`Search ${category ? icons.length : ICON_COUNT} icons by name or tag`}
                aria-keyshortcuts="/"
                className="h-10 w-full rounded-full border border-sand-200 bg-sand-50 pl-10 pr-4 text-sm text-sand-900 outline-none transition-colors placeholder:text-sand-600 focus:border-sand-400 focus-visible:ring-2 focus-visible:ring-accent/40 @min-[480px]:pr-12 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-50 dark:placeholder:text-sand-400 dark:focus:border-sand-600"
              />
              {!query && (
                <kbd
                  aria-hidden
                  className="pointer-events-none absolute right-2 top-1/2 hidden h-6 -translate-y-1/2 items-center rounded-chip border border-sand-300 px-2 font-mono text-[11px] text-sand-600 @min-[480px]:inline-flex dark:border-sand-700 dark:text-sand-400"
                >
                  /
                </kbd>
              )}
            </label>
            <StylePicker value={style} onChange={setStyle} compact loading={loading} />
          </div>
          <div aria-hidden className="h-px bg-sand-200 dark:bg-sand-800" />
          <div className="relative grid grid-cols-2 gap-2 p-2 @min-[640px]:flex @min-[640px]:items-center">
            <TuneSlider
              label="Size"
              value={size}
              onChange={setSize}
              min={16}
              max={64}
              step={4}
              format={(value) => `${value}px`}
              valueText={(value) => `${value} pixels`}
              className="@min-[640px]:flex-1"
            />
            <TuneSlider
              label="Stroke"
              disabled={!takesStroke(style)}
              hint={FIXED_WEIGHT}
              value={strokeWidth}
              onChange={setStrokeWidth}
              min={1}
              max={3}
              step={0.25}
              format={(value) => value.toFixed(2)}
              valueText={(value) => `${value.toFixed(2)} pixels`}
              className="@min-[640px]:flex-1"
            />
            <span aria-hidden className="mx-1 hidden h-5 w-px shrink-0 bg-sand-300 @min-[640px]:block dark:bg-sand-700" />
            <div className="col-span-2 flex items-center gap-1 @min-[640px]:contents">
              <AbsoluteStrokeControl value={absolute} onChange={setAbsolute} disabled={!takesStroke(style)} hint={FIXED_WEIGHT} className="h-8" />
              <ColourControl
                value={colourOverride}
                resolved={colour}
                onChange={setColourOverride}
                background={theme === 'dark' ? DARK_TILE : LIGHT_TILE}
                className="@min-[640px]:relative"
              />
              <button
                type="button"
                onClick={reset}
                disabled={isDefault}
                aria-label="Reset icon controls"
                title="Reset"
                className="ml-auto inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sand-600 transition-colors hover:bg-sand-200 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 dark:text-sand-400 dark:hover:bg-sand-800 dark:hover:text-sand-50 @min-[640px]:ml-0"
              >
                <RotateCcw aria-hidden className="size-4" />
              </button>
            </div>
          </div>
        </section>

        {visible.length > 0 ? (
          <div className="mt-8 space-y-8">
            {grouped.map((group) => (
              <section key={group.slug} aria-labelledby={`icons-${group.slug}`}>
                <h2 id={`icons-${group.slug}`} className="mb-3 text-sm font-bold text-sand-900 dark:text-sand-50">
                  {group.label}
                  <span className="ml-2 font-normal text-sand-600 dark:text-sand-400">{group.icons.length}</span>
                </h2>
                <div className={ICON_GRID_CLASS}>
                  {group.icons.map((icon) => (
                    <IconTile
                      key={icon.name}
                      icon={icon}
                      markup={data[icon.name] ?? lineIcons[icon.name] ?? ''}
                      size={size}
                      strokeWidth={strokeWidth}
                      absolute={absolute}
                      colour={colour}
                      exportColour={colourOverride}
                      style={style}
                      href={`/icons/${icon.name}${settingsQuery}`}
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
    </main>
  )
}
