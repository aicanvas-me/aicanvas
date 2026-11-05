'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { RotateCcw } from '@/app/_icons/icons/rotate-ccw'
import { ArrowLeft } from '@/app/_icons/icons/arrow-left'
import { ArrowRight } from '@/app/_icons/icons/arrow-right'
import { Check } from '@/app/_icons/icons/check'
import { Copy } from '@/app/_icons/icons/copy'
import { CopyPage } from '@/app/components/CopyPage'
import { PAGE_TOP, PageFrame } from '@/app/_components/DesignSystemPage'
import { PageCrumbs } from '@/app/components/PageCrumbs'
import { useCopied } from '@/app/components/useCopied'
import { useTheme } from '@/app/components/ThemeProvider'
import { RailFooter } from '@/app/components/RailFooter'
import { ICON_CATEGORIES, ICON_CATEGORY_COUNTS, ICON_CATEGORY_LABELS, type IconCategorySlug } from '../_lib/categories'
import { iconInstallCommand } from '../_lib/constants'
import { DARK_PREVIEW_COLOUR, FIXED_WEIGHT, LIGHT_PREVIEW_COLOUR } from '../_lib/constants'
import { formatDate, iconLead, ICON_WEIGHTS, takesStroke, titleCase, type IconWeight } from '../_lib/icon-utils'
import { fromIconQuery, toIconQuery } from '../_lib/settings-query'
import { ICON_DEFAULTS, isSeeded, storeSettings, storedSettings } from '../_lib/settings-store'
import { ICON_GRID_CLASS } from '../_lib/tile-grid'
import type { IconMarkupMap, IconMeta, IconStyle, IconWithMarkup } from '../_lib/types'
import { ActionBar } from './ActionBar'
import { CodeTabs } from './CodeTabs'
import { ColourControl } from './ColourControl'
import { IconTile } from './IconTile'
import { PreviewStage } from './PreviewStage'
import { StylePicker } from './StylePicker'
import { TuneSlider } from './TuneSlider'
import { useIconVariant } from './useIconVariant'

// The overview's tiles stop at 64px; a bigger pick here still draws the related
// tiles at the size they were built for.
const TILE_MAX_SIZE = 64

const ROUND_BUTTON =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-sand-300 text-sand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-sand-700 dark:text-sand-300'

function AdjacentLink({ icon, direction, query }: { icon?: IconWithMarkup; direction: 'previous' | 'next'; query: string }) {
  const Arrow = direction === 'previous' ? ArrowLeft : ArrowRight
  const word = direction === 'previous' ? 'Previous' : 'Next'
  if (!icon) {
    return (
      <button type="button" disabled aria-label={`No ${word.toLowerCase()} icon`} className={`${ROUND_BUTTON} cursor-default opacity-40`}>
        <Arrow aria-hidden className="size-4" />
      </button>
    )
  }
  const label = `${word} icon: ${titleCase(icon.name)}`
  return (
    <Link
      href={`/icons/${icon.name}${query}`}
      aria-label={label}
      title={label}
      className={`${ROUND_BUTTON} hover:border-sand-400 hover:bg-sand-200/50 hover:text-sand-900 dark:hover:border-sand-600 dark:hover:bg-sand-800/60 dark:hover:text-sand-50`}
    >
      <Arrow aria-hidden className="size-4" />
    </Link>
  )
}

function SlugChip({ name }: { name: string }) {
  const { copied, copy } = useCopied(name)
  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={`Copy the slug ${name}`}
      title="Copy slug"
      className="-mx-1.5 inline-flex h-6 items-center gap-1.5 rounded-chip px-1.5 font-mono text-[11px] text-sand-600 transition-colors hover:bg-sand-200/50 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-50"
    >
      {name}
      {copied ? (
        <Check aria-hidden className="size-3 text-success" />
      ) : (
        <Copy aria-hidden className="size-3" />
      )}
      <span aria-live="polite" className="sr-only">{copied ? 'Slug copied' : ''}</span>
    </button>
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
  const router = useRouter()
  const { theme } = useTheme()
  // the section's look (lib/settings-store), so the page mounts already in it
  const [style, setStyle] = useState<IconStyle>(() => storedSettings().style)
  const [size, setSize] = useState(() => storedSettings().size)
  const [weight, setWeight] = useState<IconWeight>(() => storedSettings().weight)
  const [colourOverride, setColourOverride] = useState<string | null>(() => storedSettings().colour)
  const [previewSurface, setPreviewSurface] = useState<'dark' | 'light'>(theme)
  const siteColour = colourOverride ?? (theme === 'dark' ? DARK_PREVIEW_COLOUR : LIGHT_PREVIEW_COLOUR)
  const previewColour = colourOverride ?? (previewSurface === 'dark' ? DARK_PREVIEW_COLOUR : LIGHT_PREVIEW_COLOUR)
  const { data, loading } = useIconVariant(lineIcons, style)
  const markup = data[icon.name] ?? lineIcons[icon.name] ?? ''
  const categoryLabel = ICON_CATEGORY_LABELS[icon.category]
  const title = titleCase(icon.name)
  const settings = { style, size, weight, colour: colourOverride }
  const isDefault = toIconQuery(settings, ICON_DEFAULTS) === ''
  const query = toIconQuery(settings, ICON_DEFAULTS)

  // The look arrives in the query (from the overview, a shared link or the
  // previous icon). Read on mount rather than through useSearchParams, which
  // would pull the statically built page out to the client. The URL is not
  // there to read during the server render, so this sets state from an effect.
  // Within the section the look is already set (lib/settings-store) and wins;
  // only a fresh load reads the URL, with the controls hidden until it has.
  const [restored, setRestored] = useState(isSeeded)
  useEffect(() => {
    if (isSeeded()) return
    const settings = fromIconQuery(window.location.search)
    /* eslint-disable react-hooks/set-state-in-effect */
    if (settings.style !== undefined) setStyle(settings.style)
    if (settings.size !== undefined) setSize(settings.size)
    if (settings.weight !== undefined) setWeight(settings.weight)
    if (settings.colour !== undefined) setColourOverride(settings.colour)
    setRestored(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  // The URL then follows the look in place, so it can be shared as it looks.
  // Waiting for the restore keeps the first pass from wiping the incoming query.
  useEffect(() => {
    if (!restored) return
    storeSettings({ style, size, weight, colour: colourOverride })
    const url = `${window.location.pathname}${query}${window.location.hash}`
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, '', url)
    }
  }, [query, restored, style, size, weight, colourOverride])

  // Left and Right walk the category, unless focus is somewhere that takes
  // typing or uses the arrows itself (the sliders, the style track, the tabs).
  const previousHref = previous ? `/icons/${previous.name}${query}` : null
  const nextHref = next ? `/icons/${next.name}${query}` : null
  useEffect(() => {
    const walk = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
      const href = event.key === 'ArrowLeft' ? previousHref : event.key === 'ArrowRight' ? nextHref : null
      if (!href) return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="radiogroup"], [role="tablist"], [role="slider"]')) return
      event.preventDefault()
      router.push(href)
    }
    document.addEventListener('keydown', walk)
    return () => document.removeEventListener('keydown', walk)
  }, [previousHref, nextHref, router])

  const reset = () => {
    setStyle(ICON_DEFAULTS.style)
    setSize(ICON_DEFAULTS.size)
    setWeight(ICON_DEFAULTS.weight)
    setColourOverride(ICON_DEFAULTS.colour)
  }

  return (
    <>
    {/* shrink-0: the scroll column is a flex column, and a shrinking main
        clipped its own bottom padding, so the page ended flush on the tags. */}
    <main className="min-h-full shrink-0 bg-sand-50 pb-20 dark:bg-sand-950">
      {/* The design-system pages' frame, so the title and the grid start on the
          same edge as /components and every system page beside the rail. */}
      <PageFrame className={PAGE_TOP}>
        <PageCrumbs />
        <CopyPage markdown={markdown} markdownHref={`/icons/${icon.name}/md`} />
        <header>
          <div className="flex items-start justify-between gap-4">
            <h1 className="min-w-0 break-words text-4xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-5xl">{title}</h1>
            <nav aria-label="Adjacent icons" className="flex shrink-0 items-center gap-2 pt-1 sm:pt-2">
              <AdjacentLink icon={previous} direction="previous" query={query} />
              <AdjacentLink icon={next} direction="next" query={query} />
            </nav>
          </div>
          <p className="mt-2 text-base text-sand-700 dark:text-sand-300">{iconLead(icon, categoryLabel)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-sand-600 dark:text-sand-400">
            <Link
              href={`/icons?category=${icon.category}`}
              className="rounded-chip font-semibold text-sand-700 transition-colors hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:text-sand-300 dark:hover:text-sand-50"
            >
              {categoryLabel}
            </Link>
            <span aria-hidden className="text-sand-500">·</span>
            <span>Added {formatDate(icon.added)}</span>
            <span aria-hidden className="text-sand-500">·</span>
            <SlugChip name={icon.name} />
          </div>
        </header>

        {/* One shell, the overview toolbar's surface: the preview is a card set
            8px into it, the controls sit on the shell itself. */}
        <div className="mt-6 grid rounded-section border border-sand-200 bg-sand-100 p-2 dark:border-sand-800 dark:bg-sand-900 lg:grid-cols-[minmax(0,1.4fr)_minmax(340px,1fr)]">
          <PreviewStage
            markup={markup}
            name={title}
            size={size}
            weight={weight}
            colour={previewColour}
            surface={previewSurface}
            onSurfaceChange={setPreviewSurface}
            className="h-[300px] min-w-0 sm:h-[380px] lg:h-[440px]"
          />
          {/* On a phone the controls share the preview card's edges, which
              leaves the style track room for all four styles. */}
          <div className={`@container flex min-w-0 flex-col gap-2 px-0 pb-1 pt-5 sm:p-5 ${restored ? '' : 'invisible'}`}>
            <StylePicker value={style} onChange={setStyle} compact loading={loading} />
            <TuneSlider
              label="Size"
              value={size}
              onChange={setSize}
              min={16}
              max={96}
              step={4}
              format={(value) => `${value}px`}
              valueText={(value) => `${value} pixels`}
            />
            <TuneSlider
              label="Weight"
              disabled={!takesStroke(style)}
              hint={FIXED_WEIGHT}
              value={ICON_WEIGHTS.findIndex((entry) => entry.id === weight)}
              onChange={(index) => setWeight(ICON_WEIGHTS[index].id)}
              min={0}
              max={4}
              step={1}
              format={(index) => ICON_WEIGHTS[index].label}
              valueText={(index) => ICON_WEIGHTS[index].label}
            />
            <div className="relative flex items-center gap-1">
              <ColourControl value={colourOverride} resolved={previewColour} onChange={setColourOverride} align="start" />
              <button
                type="button"
                onClick={reset}
                disabled={isDefault}
                aria-label="Reset"
                title="Reset"
                className="ml-auto inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sand-600 transition-colors hover:bg-sand-200 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 dark:text-sand-400 dark:hover:bg-sand-800 dark:hover:text-sand-50"
              >
                <RotateCcw aria-hidden className="size-4" />
              </button>
            </div>
            <div aria-hidden className="my-2 h-px bg-sand-200 dark:bg-sand-800" />
            <ActionBar name={icon.name} markup={markup} size={size} weight={weight} colour={colourOverride} style={style} />
            <CodeTabs className="mt-2 min-h-[160px] flex-1" name={icon.name} markup={markup} size={size} weight={weight} colour={colourOverride} style={style} />
          </div>
        </div>

        {suggestions.length > 0 && (
          <section className="mt-12" aria-labelledby="related-icons">
            {/* When the link does not fit beside the heading it drops below it,
                instead of both wrapping onto two lines. */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <h2 id="related-icons" className="whitespace-nowrap text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50">Related icons</h2>
              <Link
                href={`/icons?category=${icon.category}`}
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-chip text-xs font-semibold text-accent transition-colors hover:text-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                All {categoryLabel} icons
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </div>
            <div className={ICON_GRID_CLASS}>
              {suggestions.map((suggestion) => (
                <IconTile
                  key={suggestion.name}
                  icon={suggestion}
                  markup={data[suggestion.name] ?? suggestion.markup ?? ''}
                  size={Math.min(size, TILE_MAX_SIZE)}
                  exportSize={size}
                  weight={weight}
                  colour={siteColour}
                  exportColour={colourOverride}
                  style={style}
                  href={`/icons/${suggestion.name}${query}`}
                />
              ))}
            </div>
          </section>
        )}

        {icon.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-semibold text-sand-700 dark:text-sand-300">Tags</span>
            {icon.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-sand-200 px-2 py-0.5 text-xs text-sand-600 dark:border-sand-800 dark:text-sand-400">
                {tag}
              </span>
            ))}
          </div>
        )}

        <PropsReference name={icon.name} />
        <CategoryLinks current={icon.category} />
      </PageFrame>
    </main>
    <RailFooter />
    </>
  )
}

// What the component takes, with the defaults IconBase applies, so the page
// answers "how do I size it" without opening the docs.
const PROPS: { prop: string; type: string; fallback: string; note: string }[] = [
  { prop: 'size', type: 'number | string', fallback: '24', note: 'Width and height in pixels.' },
  { prop: 'weight', type: "'thin' | 'light' | 'regular' | 'bold' | 'extrabold'", fallback: "'regular'", note: 'Line weight; it scales with the size. Line and Duotone only.' },
  { prop: 'color', type: 'string', fallback: 'currentColor', note: 'Follows the text colour unless set.' },
  { prop: 'className', type: 'string', fallback: '', note: 'Any utility class, passed to the svg.' },
]

function PropsReference({ name }: { name: string }) {
  return (
    <section className="mt-14" aria-labelledby="icon-props">
      <h2 id="icon-props" className="text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50">Props</h2>
      <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
        Every icon takes the same props. Set them once for a whole tree with{' '}
        <code className="font-mono text-xs text-sand-900 dark:text-sand-50">IconProvider</code>.
      </p>
      <div className="mt-4 overflow-x-auto rounded-section border border-sand-200 dark:border-sand-800">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-sand-100 text-xs text-sand-600 dark:bg-sand-900 dark:text-sand-400">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Prop</th>
              <th className="px-4 py-2.5 font-semibold">Type</th>
              <th className="px-4 py-2.5 font-semibold">Default</th>
              <th className="px-4 py-2.5 font-semibold">What it does</th>
            </tr>
          </thead>
          <tbody>
            {PROPS.map((row) => (
              <tr key={row.prop} className="border-t border-sand-200 dark:border-sand-800">
                <td className="px-4 py-2.5 font-mono text-xs text-sand-900 dark:text-sand-50">{row.prop}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-sand-600 dark:text-sand-400">{row.type}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-sand-700 dark:text-sand-300">{row.fallback || '-'}</td>
                <td className="px-4 py-2.5 text-sand-700 dark:text-sand-300">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-sand-600 dark:text-sand-400">
        Install this icon alone: <code className="break-all font-mono text-sand-900 dark:text-sand-50">{iconInstallCommand(name)}</code>
      </p>
    </section>
  )
}

function CategoryLinks({ current }: { current: IconCategorySlug }) {
  return (
    <section className="mt-14" aria-labelledby="icon-categories">
      <h2 id="icon-categories" className="text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50">Browse by category</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {ICON_CATEGORIES.filter(([slug]) => slug !== current).map(([slug, label]) => (
          <Link
            key={slug}
            href={`/icons?category=${slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 px-3 py-1 text-xs font-semibold text-sand-700 transition-colors hover:border-sand-300 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-sand-800 dark:text-sand-300 dark:hover:border-sand-700 dark:hover:text-sand-50"
          >
            {label}
            <span className="font-normal text-sand-600 dark:text-sand-400">{ICON_CATEGORY_COUNTS[slug]}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
