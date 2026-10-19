'use client'

import Link from 'next/link'
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Cube, DiamondsFour, Shapes } from '@phosphor-icons/react'
import { CATEGORIES } from '../lib/categories'
import { TOTAL_COMPONENTS } from '../lib/component-nav.generated'
import { DESIGN_SYSTEM_COUNT, DesignSystemsPole } from '../_components/DesignSystemsPole'

// The catalog list of the rail and of the phone drawer: a three-way switch on
// top (Design systems, Components, Icons), a heading with a count under it,
// then the list for the segment that is on. One component for both places so
// the drawer and the rail never list different things.
//
// The switch is a real tab control: role="tablist" with role="tab" buttons,
// the arrow keys (and Home / End) move between them, and only the selected
// tab sits in the tab order. Picking a segment swaps the list in place and
// never navigates. The segment on at load follows the route, and a pick by
// hand holds until the next navigation, which hands the choice back to the
// route.

export type CatalogSegment = 'design-systems' | 'components' | 'icons'

const SEGMENTS: { id: CatalogSegment; label: string; icon: ReactNode }[] = [
  { id: 'design-systems', label: 'Design systems', icon: <Cube weight="regular" size={16} aria-hidden /> },
  { id: 'components', label: 'Components', icon: <DiamondsFour weight="regular" size={16} aria-hidden /> },
  { id: 'icons', label: 'Icons', icon: <Shapes weight="regular" size={16} aria-hidden /> },
]

/** The segment a route opens on. */
export function segmentForPath(pathname: string | null | undefined): CatalogSegment {
  const path = pathname ?? ''
  if (path === '/design-systems' || path.startsWith('/design-systems/')) return 'design-systems'
  if (path === '/icons' || path.startsWith('/icons/')) return 'icons'
  return 'components'
}

// Same row skin the rail has always used: muted at rest, the raised pill when
// it is the page you are on.
const ROW = 'group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40'
const ROW_ACTIVE = 'bg-sand-200/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
const ROW_IDLE =
  'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'

function CatalogRow({ href, label, active, onNavigate, prefetch }: { href: string; label: string; active: boolean; onNavigate?: () => void; prefetch?: false }) {
  return (
    <li>
      <Link
        href={href}
        prefetch={prefetch}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={`${ROW} ${active ? ROW_ACTIVE : ROW_IDLE}`}
      >
        <span aria-hidden className="w-3 shrink-0" />
        <span className="flex-1">{label}</span>
      </Link>
    </li>
  )
}

// The thin vertical guide that groups a list's rows.
function Guided({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <span aria-hidden className="pointer-events-none absolute bottom-1 left-[14px] top-1 w-px bg-sand-200 dark:bg-sand-800" />
      <ul className="space-y-0.5">{children}</ul>
    </div>
  )
}

export function CatalogNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? ''
  const searchParams = useSearchParams()
  const baseId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // A pick by hand is remembered with the path it was made on, so the next
  // navigation drops it and the route decides again.
  const [hand, setHand] = useState<{ pathname: string; segment: CatalogSegment } | null>(null)
  const segment = hand?.pathname === pathname ? hand.segment : segmentForPath(pathname)
  const pick = (next: CatalogSegment) => setHand({ pathname, segment: next })

  // Active category resolves from the path first (canonical
  // /components/category/<slug>), then falls back to the legacy ?category=
  // query param so old bookmarks still highlight correctly.
  const categoryFromPath = pathname.startsWith('/components/category/')
    ? pathname.replace('/components/category/', '')
    : null
  const activeCategory = categoryFromPath
    ? (CATEGORIES.find((c) => c.slug === categoryFromPath)?.label ?? null)
    : pathname === '/components'
      ? (searchParams.get('category') ?? 'All Components')
      : null

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = SEGMENTS.findIndex((s) => s.id === segment)
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % SEGMENTS.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + SEGMENTS.length) % SEGMENTS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = SEGMENTS.length - 1
    if (next < 0) return
    e.preventDefault()
    pick(SEGMENTS[next].id)
    tabRefs.current[next]?.focus()
  }

  // The standalone components the grid lists. The generator writes the total
  // from the same list COMPONENT_META is built from and fails the build when
  // the two disagree, and this module stays free of the 39 KB meta list.
  const counts: Record<CatalogSegment, number | null> = {
    'design-systems': DESIGN_SYSTEM_COUNT,
    components: TOTAL_COMPONENTS,
    icons: null,
  }

  // Every panel is rendered and the ones not on are hidden, so all the
  // category links ship in the server HTML whichever segment a route opens
  // on: a list that only existed while its tab was on left the category pages
  // with no crawlable link from a design-system page.
  const panel = (id: CatalogSegment, children: ReactNode) => {
    const s = SEGMENTS.find((x) => x.id === id)!
    return (
      <div
        role="tabpanel"
        id={`${baseId}-panel-${id}`}
        aria-labelledby={`${baseId}-tab-${id}`}
        hidden={segment !== id}
        className="mt-4"
      >
        <p className="mb-2 flex items-center gap-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">
          {s.label}
          {counts[id] !== null && (
            <span className="rounded-full bg-sand-100 px-1.5 py-px text-[10px] font-semibold tabular-nums text-sand-700 dark:bg-sand-900 dark:text-sand-300">
              {counts[id]}
            </span>
          )}
        </p>
        {children}
      </div>
    )
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Catalog"
        onKeyDown={onKeyDown}
        className="flex items-center gap-0.5 rounded-full bg-sand-100 p-1 dark:bg-sand-900"
      >
        {SEGMENTS.map((s, i) => {
          const selected = s.id === segment
          return (
            <button
              key={s.id}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${s.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${s.id}`}
              aria-label={s.label}
              title={s.label}
              tabIndex={selected ? 0 : -1}
              onClick={() => pick(s.id)}
              // Sized so the longest label, "Design systems", fits the 240px
              // rail whole: 12px text, 32px idle tabs, tight active padding.
              className={`inline-flex h-8 items-center justify-center gap-1 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 ${
                selected
                  ? 'min-w-0 flex-1 bg-sand-50 px-2.5 text-sand-900 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)] dark:bg-sand-800 dark:text-sand-50 dark:shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
                  : 'w-8 shrink-0 text-sand-600 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-50'
              }`}
            >
              <span className="shrink-0">{s.icon}</span>
              {selected && <span className="truncate">{s.label}</span>}
            </button>
          )
        })}
      </div>

      {panel('design-systems', <DesignSystemsPole onNavigate={onNavigate} showHeader={false} />)}

      {panel(
        'components',
        <Guided>
          {/* "All Components" is always its own leaf, so the row you just
              clicked stays lit on /components. */}
          <CatalogRow
            href="/components"
            label="All Components"
            active={activeCategory === 'All Components'}
            onNavigate={onNavigate}
          />
          {CATEGORIES.map((cat) => (
            <CatalogRow
              key={cat.slug}
              href={`/components/category/${cat.slug}`}
              label={cat.label}
              active={cat.label === activeCategory}
              onNavigate={onNavigate}
            />
          ))}
        </Guided>,
      )}

      {panel(
        'icons',
        <Guided>
          {/* /icons is linked ahead of its page; no prefetch until it exists. */}
          <CatalogRow
            href="/icons"
            label="All icons"
            active={pathname === '/icons'}
            onNavigate={onNavigate}
            prefetch={false}
          />
        </Guided>,
      )}
    </div>
  )
}
