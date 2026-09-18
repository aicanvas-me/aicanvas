'use client'

// Andromeda gallery INDEX — the public /system page. Same editorial rhythm as
// the Lumen gallery: category eyebrow, oversized display heading, lede, one
// search field, then category sections of cards linking to the
// component pages. AI Canvas chrome (sand/olive, Manrope), so it reads as a
// site page and follows the light/dark toggle.
//
// No Andromeda COMPONENT renders here, which is the point: the void surface and
// the mono type belong to the component pages and the internal preview. This
// page is site chrome.
import { useMemo, useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { PageFrame, PageOverline, PageTitle, PageLead, PAGE_TOP, PAGE_BOTTOM } from '../../../_components/DesignSystemPage'
import { AndromedaComponentCard } from './AndromedaComponentCard'

export type GalleryItem = {
  slug: string
  name: string
  category: string
  description: string
  variants: number
  states: number
}

function byCategory(items: GalleryItem[]) {
  const groups = new Map<string, GalleryItem[]>()
  for (const item of items) {
    const bucket = groups.get(item.category)
    if (bucket) bucket.push(item)
    else groups.set(item.category, [item])
  }
  return [...groups.entries()]
    .map(([category, components]) => ({ category, components }))
    .sort((a, b) => b.components.length - a.components.length)
}

export function AndromedaGallery({
  components,
  templateCount,
}: {
  components: GalleryItem[]
  templateCount: number
}) {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = q
      ? components.filter((c) => `${c.name} ${c.description} ${c.category}`.toLowerCase().includes(q))
      : components
    return { matches, byCategory: byCategory(matches) }
  }, [components, query])

  return (
    <PageFrame as="main" className={`${PAGE_TOP} ${PAGE_BOTTOM}`}>
      <header className="border-b border-sand-300 pb-10 dark:border-sand-800">
        <PageOverline>Design system · Dark</PageOverline>
        <PageTitle className="max-w-3xl">
          One control room.
          <br />
          {components.length > 0 ? `${components.length} components.` : 'Every component.'}
        </PageTitle>
        <PageLead>
          Andromeda is a React system for dense operational interfaces: corner-marker framing,
          mono typography, and a token layer every component reads at runtime. Each one below
          ships its variants and its interaction states.
        </PageLead>

        <label className="mt-8 flex max-w-md items-center gap-3 rounded-xl border border-sand-300 bg-sand-100 px-4 py-3 transition-colors hover:border-sand-400 focus-within:border-olive-500 focus-within:ring-2 focus-within:ring-olive-500/20 dark:border-sand-800 dark:bg-sand-900 dark:hover:border-sand-600">
          <MagnifyingGlass weight="regular" size={18} className="shrink-0 text-sand-500" />
          <span className="sr-only">Search Andromeda components</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder="Search all components"
            className="min-w-0 flex-1 bg-transparent text-sm text-sand-900 outline-none placeholder:text-sand-500 dark:text-sand-50"
          />
          <span className="shrink-0 text-xs font-semibold tabular-nums text-sand-500">
            {groups.matches.length}/{components.length}
          </span>
        </label>

        <p className="mt-5 text-xxs font-semibold uppercase tracking-[0.1em] text-sand-500">
          {components.length} components · {templateCount} templates · 1 brain · one-command install
        </p>
      </header>

      {groups.byCategory.map(({ category, components: items }) => (
        <section key={category} className="mt-12">
          <div className="mb-4 flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">{category}</h2>
            <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-sand-300 px-1.5 text-xxs font-bold text-sand-600 dark:bg-sand-800 dark:text-sand-400">
              {items.length}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <AndromedaComponentCard
                key={item.slug}
                slug={item.slug}
                name={item.name}
                description={item.description}
                variants={item.variants}
                states={item.states}
              />
            ))}
          </div>
        </section>
      ))}

      {groups.matches.length === 0 && (
        <p className="mt-12 text-sm text-sand-600 dark:text-sand-400">
          No components match “{query}”.
        </p>
      )}
    </PageFrame>
  )
}
