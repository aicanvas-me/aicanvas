'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode, type UIEvent } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown } from '@/app/_icons/icons/chevron-down'
import { Box } from '@/app/_icons/icons/box'
import { Component } from '@/app/_icons/icons/component'
import { Shapes } from '@/app/_icons/icons/shapes'
import { Sparkle } from '@/app/_icons/icons/sparkle'
import { CATEGORIES } from '../lib/categories'
import { CATEGORY_COMPONENTS, TOTAL_COMPONENTS } from '../lib/component-nav.generated'
import { ANDROMEDA_COMPONENT_META } from '../_lib/andromeda/andromeda-meta'
import { ANDROMEDA_COMPONENT_META as ANDROMEDA_PRO_COMPONENT_META } from '../_lib/andromeda-pro/andromeda-meta'
import { AndromedaIcon } from '../../design-systems/andromeda/AndromedaIcon'
import { SystemTierChip } from '../_components/SystemTierChip'
import iconsJson from '../icons/_data/icons.generated.json'
import {
  ICON_CATEGORIES,
  ICON_CATEGORY_COUNTS,
  ICON_COUNT,
  isIconCategory,
} from '../icons/_lib/categories'
import type { IconMeta } from '../icons/_lib/types'

// Typed so an empty generated file (a checkout without icon data) still compiles.
const iconData = iconsJson as IconMeta[]

// The catalog list of the rail and of the phone drawer: a three-way switch on
// top (Design systems, Components, Icons), a heading with a count under it,
// then the list for the segment that is on. One component for both places so
// the drawer and the rail never list different things.
//
// Both catalog lists follow one pattern, the one strong docs sidebars use:
// sections, each a small-caps header with a count chip over a flat list of
// rows, each list with its own thin guide line. The Components tab has one
// section per category, each component listed once, under its first
// category; the Design systems tab has one row per system that opens to its
// PAGES, TEMPLATES and COMPONENTS.
//
// The switch is a real tab control: role="tablist" with role="tab" buttons,
// the arrow keys (and Home / End) move between them, and only the selected
// tab sits in the tab order. On the rail, a click (or Enter) on another
// segment opens that segment's landing page (LANDING), so the page and the
// list move together; the arrow keys only swap the list in place, to look
// before going. The phone drawer closes on every route change, so there a
// click swaps the list in place too, and the drawer stays open to browse it.
// The segment on at load follows the route, and a pick by hand holds until
// the next navigation, which hands the choice back to the route.

export type CatalogSegment = 'design-systems' | 'components' | 'icons'

const SEGMENTS: { id: CatalogSegment; label: string; icon: ReactNode }[] = [
  { id: 'design-systems', label: 'Design systems', icon: <Box size={16} aria-hidden /> },
  { id: 'components', label: 'Components', icon: <Component size={16} aria-hidden /> },
  { id: 'icons', label: 'Icons', icon: <Shapes size={16} aria-hidden /> },
]

// Where a rail click on a segment lands: the section's front page. Design
// systems has no index route, so it opens the flagship system's overview.
const LANDING: Record<CatalogSegment, string> = {
  'design-systems': '/design-systems/andromeda-pro',
  components: '/components',
  icons: '/icons',
}

// The design systems the Design systems tab lists. Two systems live side by
// side, each at its own routes: Andromeda Pro and Andromeda Legacy (MIT).
// Neither replaces the other and neither redirects to the other. The rows are
// hardcoded (this is a client module and cannot read the registry);
// app/components/Sidebar.test.ts ties the Pro templates to the template meta.
const SYSTEMS = [
  {
    slug: 'andromeda-pro',
    name: 'Andromeda Pro',
    tier: 'pro',
    // The rail says what is NEW, not what it costs: the tier is on the
    // system's own page, and the licence word crowded out the name here.
    badge: 'New',
    brain: true,
    // Pro's pages after the overview: Foundation, Components, Image Pack.
    // None carries the premium mark: the foundation is open, single
    // components are free to explore, and the images download free (only the
    // two files behind the set are Pro).
    sections: [
      { slug: 'foundation', label: 'Foundation', premium: false },
      { slug: 'components', label: 'Components', premium: false },
      { slug: 'image-pack', label: 'Image Pack', premium: false },
    ],
    components: ANDROMEDA_PRO_COMPONENT_META.map((c) => ({ slug: c.slug, name: c.name })),
    templates: [
      // Same order as the overview bento and the template switcher.
      { slug: 'city-operations', name: 'City Operations', category: 'Dashboard' },
      { slug: 'ai-chat', name: 'AI Chat', category: 'CRM' },
      { slug: 'sign-in', name: 'Sign In', category: 'Authentication' },
      { slug: 'signal-room', name: 'Signal Room', category: 'Media' },
      { slug: 'mission-control', name: 'Mission Control', category: 'Dashboard' },
      { slug: 'service-order', name: 'Service Order', category: 'CRM' },
      { slug: 'resource-planning', name: 'Resource Planning', category: 'Scheduling' },
      { slug: 'sign-up', name: 'Sign Up', category: 'Authentication' },
      { slug: 'fintech-landing', name: 'Fintech Landing', category: 'Marketing' },
    ],
  },
  {
    slug: 'andromeda',
    name: 'Andromeda Legacy',
    tier: 'mit',
    badge: null,
    // Has a premium Brain page at /design-systems/<slug>/brain (rules +
    // foundations + per-component intelligence).
    brain: true,
    // Legacy ships one System page, premium marked, then Brain. It has no
    // /foundation or /components route.
    sections: [{ slug: 'system', label: 'System', premium: true }],
    components: ANDROMEDA_COMPONENT_META.map((c) => ({ slug: c.slug, name: c.name })),
    templates: [
      { slug: 'signal-room', name: 'Signal Room', category: 'Media' },
      { slug: 'mission-control', name: 'Mission Control', category: 'Dashboard' },
      { slug: 'service-order', name: 'Service Order', category: 'CRM' },
      // exchange-terminal — hidden, source preserved (see design-systems.config.mjs)
      { slug: 'resource-planning', name: 'Resource Planning', category: 'Scheduling' },
    ],
  },
] as const

type System = (typeof SYSTEMS)[number]

// How many systems the tab lists: the count chip beside its heading.
export const DESIGN_SYSTEM_COUNT = SYSTEMS.length

/** The segment a route opens on. */
export function segmentForPath(pathname: string | null | undefined): CatalogSegment {
  const path = pathname ?? ''
  if (path === '/design-systems' || path.startsWith('/design-systems/')) return 'design-systems'
  if (path === '/icons' || path.startsWith('/icons/')) return 'icons'
  return 'components'
}

// Same row skin the rail has always used: muted at rest, the raised pill when
// it is the page you are on.
const ROW = 'group flex items-center gap-2 rounded-control px-2 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40'
const ROW_ACTIVE = 'bg-sand-200/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
const ROW_IDLE =
  'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'

// The small-caps label with its count chip: the tab's own heading and every
// section header under it.
const HEADING =
  'flex items-center gap-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400'

// Each component's first category in categories.ts order: the one section
// that lists it. Listing a component under every category it carries put a
// quarter of the rows in twice. Glass is the exception: a look that cuts
// across the others, so in that order it listed nothing. It takes every glass
// piece back; a category made only of glass pieces (Notifications) keeps its
// header, its count and its page link, with no rows under it.
const FIRST_CATEGORY = new Map<string, number>()
CATEGORIES.forEach((cat, i) => {
  for (const c of CATEGORY_COMPONENTS[cat.label] ?? []) if (!FIRST_CATEGORY.has(c.slug)) FIRST_CATEGORY.set(c.slug, i)
})
const GLASS = CATEGORIES.findIndex((c) => c.label === 'Glass')
const GLASS_SLUGS = new Set((CATEGORY_COMPONENTS.Glass ?? []).map((c) => c.slug))
for (const slug of GLASS_SLUGS) {
  const i = FIRST_CATEGORY.get(slug)
  if (GLASS >= 0 && i !== undefined) FIRST_CATEGORY.set(slug, GLASS)
}
const firstCategoryIndex = (slug: string) => FIRST_CATEGORY.get(slug)

// The list fades its top 8px and bottom 16px (the nav's mask); a row inside
// that band is not in sight.
const EDGE = 24

// The element that scrolls the list: the rail's nav, or the phone drawer's.
// Never the page itself.
// The list fades in under the switch and out above the rail's foot.
const LIST_MASK = {
  maskImage: 'linear-gradient(to bottom, transparent 0, #000 8px, #000 calc(100% - 16px), transparent 100%)',
  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 8px, #000 calc(100% - 16px), transparent 100%)',
}

function scrollerOf(from: HTMLElement): HTMLElement | null {
  for (let el = from.parentElement; el && el !== document.body; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el)
    if (overflowY === 'auto' || overflowY === 'scroll') return el
  }
  return null
}

function CountChip({ count }: { count: number }) {
  return (
    <span className="rounded-full bg-sand-100 px-1.5 py-px text-[10px] font-semibold tabular-nums text-sand-700 dark:bg-sand-900 dark:text-sand-300">
      {count}
    </span>
  )
}

function CatalogRow({
  href,
  label,
  active,
  onNavigate,
  prefetch,
  children,
}: {
  href: string
  label: string
  active: boolean
  onNavigate?: () => void
  prefetch?: false
  // Anything after the label: a mark, or a word only a screen reader hears.
  children?: ReactNode
}) {
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
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {children}
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

// One section: its header (a real heading, which also names the group) over
// its own guided list.
// A labelled group, not a heading: the rail sits before the page's own H1, so
// headings here would open every page's outline with the rail's sections. The
// count is announced as its own phrase ("Widgets, 12") rather than run into
// the label. A section can carry a count and no rows (children null): a
// category whose components are all listed under earlier ones.
function Section({ id, label, count, children }: { id: string; label: ReactNode; count: number; children: ReactNode }) {
  return (
    <div role="group" aria-labelledby={id} className="mt-5">
      <p id={id} className={`mb-1 ${HEADING}`}>
        {label}
        <span className="sr-only">, </span>
        <CountChip count={count} />
      </p>
      {count > 0 && children != null && <Guided>{children}</Guided>}
    </div>
  )
}

// The Design systems tab: one row per system, opening to its sections. Only
// the system you are inside is open on load; off the system pages, Andromeda
// Pro is. A row toggled by hand holds until you cross into another system,
// which hands the choice back to the route. Closed systems keep their links in
// the HTML (hidden), so crawlers reach every system page from any page.
function DesignSystemsList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? ''
  const baseId = useId()

  // Longest slug first: 'andromeda' is a prefix of 'andromeda-pro', so a plain
  // startsWith would light up Legacy on every Pro page.
  const activeSystem = [...SYSTEMS]
    .sort((a, b) => b.slug.length - a.slug.length)
    .find((s) => pathname === `/design-systems/${s.slug}` || pathname.startsWith(`/design-systems/${s.slug}/`))
  const openOnLoad = activeSystem?.slug ?? 'andromeda-pro'

  const [hand, setHand] = useState<Record<string, boolean>>({})
  const [handFor, setHandFor] = useState(openOnLoad)
  if (handFor !== openOnLoad) {
    setHandFor(openOnLoad)
    setHand({})
  }

  return (
    <ul className="space-y-0.5">
      {SYSTEMS.map((system) => {
        const expanded = hand[system.slug] ?? system.slug === openOnLoad
        const panelId = `${baseId}-${system.slug}`
        return (
          <li key={system.slug}>
            {/* The row only opens and closes the system; the Overview row
                under PAGES is the way to its landing page. */}
            <button
              type="button"
              onClick={() => setHand((h) => ({ ...h, [system.slug]: !expanded }))}
              aria-expanded={expanded}
              aria-controls={panelId}
              className={`${ROW} ${ROW_IDLE} w-full text-left`}
            >
              {/* Same mark, two weights: Pro keeps the solid mark, Legacy
                  draws it as an outline, so the two rows tell apart before the
                  names are read. Styled from here rather than with a prop on
                  the icon, which is a design-system file. CSS fill and stroke
                  beat the paths' own fill attributes. The stroke is 1.5 units
                  in a 28-wide box drawn at 14px, so 0.75px. overflow-visible
                  keeps the outer half of the line from clipping at the box
                  edge. */}
              <span
                aria-hidden
                className={`flex shrink-0 ${
                  system.tier === 'pro'
                    ? ''
                    : '[&_path]:fill-transparent [&_path]:stroke-current [&_path]:[stroke-linejoin:round] [&_path]:[stroke-width:1.5] [&_svg]:overflow-visible'
                }`}
              >
                <AndromedaIcon size={14} mono />
              </span>
              <span className="min-w-0 truncate font-semibold">{system.name}</span>
              {system.badge && (
                <span aria-hidden className="flex">
                  <SystemTierChip tier="new" label={system.badge} className="!px-1" />
                </span>
              )}
              <ChevronDown
                size={12}
                aria-hidden
                className={`ml-auto shrink-0 text-sand-600 transition-transform dark:text-sand-500 ${expanded ? '' : '-rotate-90'}`}
              />
            </button>
            <div id={panelId} hidden={!expanded} className="pb-2 pl-3">
              <SystemSections system={system} pathname={pathname} baseId={panelId} onNavigate={onNavigate} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function SystemSections({
  system,
  pathname,
  baseId,
  onNavigate,
}: {
  system: System
  pathname: string
  baseId: string
  onNavigate?: () => void
}) {
  const root = `/design-systems/${system.slug}`
  const pages = [
    // The system's own landing page, lit only on itself, never on a page
    // underneath it.
    { href: root, label: 'Overview', active: pathname === root, premium: false },
    // Each system names its own sections, because they do not share an IA:
    // Legacy has System, Pro has Foundation, Components and Image Pack.
    ...system.sections.map((section) => ({
      href: `${root}/${section.slug}`,
      label: section.label,
      active: pathname === `${root}/${section.slug}`,
      premium: section.premium,
    })),
  ]
  const brainActive = pathname === `${root}/brain` || pathname.startsWith(`${root}/brain/`)
  const pageCount = pages.length + (system.brain ? 1 : 0)

  return (
    <>
      <Section id={`${baseId}-pages`} label="Pages" count={pageCount}>
        {pages.map((page) => (
          <CatalogRow key={page.href} href={page.href} label={page.label} active={page.active} onNavigate={onNavigate}>
            {/* No premium mark on the row: the tier is said on the system's
                own page. Still spoken, so a screen reader does not lose it. */}
            {page.premium && <span className="sr-only">Premium</span>}
          </CatalogRow>
        ))}
        {system.brain && (
          <CatalogRow href={`${root}/brain`} label="AI Brain" active={brainActive} onNavigate={onNavigate}>
            {/* The one icon left in the list: the Brain is the system's AI
                layer, and the mark says so in the AI cyan. */}
            <Sparkle size={13} aria-hidden className="shrink-0 text-ai" />
            <span className="sr-only">Premium</span>
          </CatalogRow>
        )}
      </Section>
      <Section id={`${baseId}-templates`} label="Templates" count={system.templates.length}>
        {system.templates.map((t) => (
          <CatalogRow
            key={t.slug}
            href={`${root}/templates/${t.slug}`}
            label={t.name}
            active={pathname === `${root}/templates/${t.slug}`}
            onNavigate={onNavigate}
          >
            {/* No mark on the row. The sr-only word still folds "Premium" into
                the link's accessible name. */}
            <span className="sr-only">Premium</span>
          </CatalogRow>
        ))}
      </Section>
      <Section id={`${baseId}-components`} label="Components" count={system.components.length}>
        {system.components.map((c) => (
          <CatalogRow
            key={c.slug}
            href={`${root}/${c.slug}`}
            label={c.name}
            active={pathname === `${root}/${c.slug}`}
            onNavigate={onNavigate}
          />
        ))}
      </Section>
    </>
  )
}

export function CatalogNav({ onNavigate, rail = false }: { onNavigate?: () => void; rail?: boolean }) {
  const pathname = usePathname() ?? ''
  const searchParams = useSearchParams()
  const baseId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // A pick by hand holds only until the next navigation, which hands the
  // choice back to the route. The rail stays mounted across pages, so the pick
  // is dropped the moment the path changes (state adjusted during render),
  // not merely ignored on other paths: coming back to the page it was made on
  // must not bring it back.
  const [hand, setHand] = useState<CatalogSegment | null>(null)
  const [handPath, setHandPath] = useState(pathname)
  if (handPath !== pathname) {
    setHandPath(pathname)
    setHand(null)
  }
  const segment = hand ?? segmentForPath(pathname)
  const pick = (next: CatalogSegment) => setHand(next)
  const router = useRouter()
  // A click on the rail: the list flips at once, the page follows. A segment
  // the route already belongs to stays where it is (Components on a
  // component page does not throw you back to the grid).
  const open = (next: CatalogSegment) => {
    pick(next)
    if (rail && next !== segmentForPath(pathname)) router.push(LANDING[next])
  }

  // Keep the page you are on in sight. Landing on a component deep in the
  // list (from search, or a card on the grid) left the rail at its top with
  // the lit row thousands of pixels below. After each navigation the lit row
  // is brought to the middle of the list when it sits outside it; a row you
  // just clicked is in view already and stays put. A segment swapped by hand
  // opens at its own lit row, or at its top, never at the old list's offset.
  // No animation: this is where the list opens, not a move.
  const rootRef = useRef<HTMLDivElement>(null)
  const shownSegment = useRef(segment)
  useEffect(() => {
    const root = rootRef.current
    const list = root && (root.querySelector<HTMLElement>('[data-catalog-list]') ?? scrollerOf(root))
    if (!root || !list || !list.clientHeight) return
    const swapped = shownSegment.current !== segment
    shownSegment.current = segment
    // A lit row inside a hidden panel or a closed system has no box.
    const row = [...root.querySelectorAll<HTMLElement>('a[aria-current="page"]')].find((a) => a.getClientRects().length)
    if (!row) {
      if (swapped) list.scrollTop = 0
      return
    }
    const box = list.getBoundingClientRect()
    const r = row.getBoundingClientRect()
    if (!swapped && r.top >= box.top + EDGE && r.bottom <= box.bottom - EDGE) return
    list.scrollTop += r.top - box.top - (box.height - r.height) / 2
  }, [pathname, segment])

  // The list's scrollbar is invisible at rest and shows only while the list
  // moves: data-scrolling is set on every scroll event and cleared 900ms
  // after the last one (globals.css paints the thumb only under it).
  const scrollIdle = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(scrollIdle.current), [])
  const onListScroll = (e: UIEvent<HTMLDivElement>) => {
    const list = e.currentTarget
    list.dataset.scrolling = ''
    clearTimeout(scrollIdle.current)
    scrollIdle.current = setTimeout(() => delete list.dataset.scrolling, 900)
  }

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
    icons: ICON_COUNT,
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
        <p className={`mb-2 ${HEADING}`}>
          {s.label}
          {counts[id] !== null && <CountChip count={counts[id]} />}
        </p>
        {children}
      </div>
    )
  }

  const tabs = (
    <div
      role="tablist"
      aria-label="Catalog section"
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
            onClick={() => open(s.id)}
            onPointerEnter={rail ? () => router.prefetch(LANDING[s.id]) : undefined}
            // Sized so the longest label, "Design systems", fits the 256px
            // rail whole: 12px text, 32px idle tabs, tight active padding.
            className={`inline-flex h-8 items-center justify-center gap-1 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
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
  )

  const panels = (
    <>
      {panel('design-systems', <DesignSystemsList onNavigate={onNavigate} />)}

      {panel(
        'components',
        <>
          {/* "All components" is always its own leaf, so the row you just
              clicked stays lit on /components. */}
          <Guided>
            <CatalogRow
              href="/components"
              label="All components"
              active={activeCategory === 'All Components'}
              onNavigate={onNavigate}
            />
          </Guided>
          {/* One section per category, in categories.ts order, listing the
              components no earlier category listed. The header links to the
              category page and counts all of that page's components. */}
          {CATEGORIES.map((cat, ci) => {
            const all = CATEGORY_COMPONENTS[cat.label] ?? []
            const rows = all.filter((c) => firstCategoryIndex(c.slug) === ci)
            const current = cat.label === activeCategory
            return (
              <Section
                key={cat.slug}
                id={`${baseId}-category-${cat.slug}`}
                count={all.length}
                label={
                  <Link
                    href={`/components/category/${cat.slug}`}
                    onClick={onNavigate}
                    aria-current={current ? 'page' : undefined}
                    className={`rounded-sm transition-colors hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:hover:text-sand-100 ${
                      current ? 'text-sand-900 dark:text-sand-50' : ''
                    }`}
                  >
                    {cat.label}
                  </Link>
                }
              >
                {rows.length > 0
                  ? rows.map((c) => (
                      <CatalogRow
                        key={c.slug}
                        href={`/components/${c.slug}`}
                        label={c.name}
                        active={pathname === `/components/${c.slug}`}
                        // Nearly a hundred rows: prefetching every one in view
                        // would fetch pages nobody opens.
                        prefetch={false}
                        onNavigate={onNavigate}
                      />
                    ))
                  : null}
              </Section>
            )
          })}
        </>,
      )}

      {panel(
        'icons',
        <>
          <Guided>
            <CatalogRow
              href="/icons"
              label="All icons"
              active={pathname === '/icons' && !isIconCategory(searchParams.get('category') ?? undefined)}
              onNavigate={onNavigate}
            />
          </Guided>
          <Section id={`${baseId}-icon-categories`} label="Categories" count={ICON_CATEGORIES.length}>
            {ICON_CATEGORIES.map(([slug, label]) => {
              const iconName = pathname.match(/^\/icons\/([^/]+)$/)?.[1]
              const pageCategory = iconName ? iconData.find((icon) => icon.name === iconName)?.category : undefined
              const queryCategory = pathname === '/icons' ? searchParams.get('category') : undefined
              const active = pageCategory === slug || queryCategory === slug
              return (
                <CatalogRow
                  key={slug}
                  href={`/icons?category=${slug}`}
                  label={label}
                  active={active}
                  onNavigate={onNavigate}
                >
                  <CountChip count={ICON_CATEGORY_COUNTS[slug]} />
                </CatalogRow>
              )
            })}
          </Section>
        </>,
      )}
    </>
  )

  // The drawer scrolls this whole block with its own list, switch included.
  if (!rail) {
    return (
      <div ref={rootRef}>
        {tabs}
        {panels}
      </div>
    )
  }

  // The desktop rail pins the switch and scrolls only the list under it, so
  // the scrollbar starts below the switch and the switch never leaves view.
  //
  // The thin scrollbar (globals.css) takes width when the list scrolls, and
  // the widest row, a system name with its NEW chip, has no slack to give:
  // it truncated the moment the bar appeared. A stable gutter keeps that strip
  // reserved whether or not the list scrolls, so every row has one width in
  // both states. The right-hand space then has to come from padding OR
  // gutter, never both, and which one depends on the browser: a classic bar
  // takes width, an overlay bar (Safari on a trackpad, for one) takes none.
  // The rail is a size container, so 100cqw is its width and 100% is the
  // list's width minus whatever the bar took; their difference IS the bar.
  // The padding is 12px minus that, never under 1px.
  return (
    <div ref={rootRef} className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-3 pt-2">{tabs}</div>
      <div data-catalog-list onScroll={onListScroll} className="min-h-0 flex-1 overflow-y-auto pb-2 [scrollbar-gutter:stable]" style={LIST_MASK}>
        <div className="pl-3 pr-[max(1px,calc(12px_-_(100cqw_-_100%)))]">{panels}</div>
      </div>
    </div>
  )
}
