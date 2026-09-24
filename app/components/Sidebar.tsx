'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { CaretDown, DiamondsFour, GithubLogo, MagnifyingGlass, X, XLogo } from '@phosphor-icons/react'
import { GITHUB_URL, X_URL } from '../lib/config'
import type { ReactNode } from 'react'
import { CATEGORIES, getCategoryByLabel } from '../lib/categories'
import { buttonClasses } from './buttonClasses'
import { SecondaryNav } from './SecondaryNav'
import { useComponentSearch } from './useComponentSearch'
import { DesignSystemsPole, TEMPLATE_LEAF_RE } from '../_components/DesignSystemsPole'
import { CAPTURE_LEAF_RE } from './top-bar-crumbs'
import { isPinnedDarkRoute } from '../lib/pinned-dark'

// ── Tier structure ────────────────────────────────────────────────────────
// Ordering comes from the shared categories config so the sidebar, the
// /components/category/[slug] route, and the sitemap stay in lockstep.
const COMPONENTS_LABELS = CATEGORIES.map((c) => c.label)

type Section = {
  title: string
  icon: ReactNode
  labels: readonly string[]
  disabled?: boolean
}

// The Design Systems pole is rendered separately (shared DesignSystemsPole) so
// it never drifts. This is the single Sidebar, rendered once by the root
// layout and persisting across every route — it hides itself only on /lab and
// on template leaves, where the page owns the full viewport. Only the
// Components pole stays in SECTIONS.
const SECTIONS: Section[] = [
  { title: 'Components', icon: <DiamondsFour weight="regular" size={16} />, labels: COMPONENTS_LABELS },
  // { title: 'SVGs', icon: <PenNib weight="regular" size={16} />, labels: [], disabled: true },
]

export function Sidebar({
  promoteDS = false,
}: {
  // promoteDS: the "promote the design system" landing behavior — caps the
  // Components pole to its first 3 categories (rest behind a Show more toggle)
  // and auto-expands Andromeda's System/Brain/Templates. Off by default; flip it
  // on in the root layout + MobileNav to apply site-wide.
  promoteDS?: boolean
}) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const isHome = pathname === '/components'
  // Active category resolves from the path first (canonical
  // /components/category/<slug>), then falls back to the legacy ?category=
  // query param so old bookmarks still highlight correctly.
  const categoryFromPath = pathname?.startsWith('/components/category/')
    ? pathname.replace('/components/category/', '')
    : null
  const activeCategory = categoryFromPath
    ? CATEGORIES.find((c) => c.slug === categoryFromPath)?.label ?? null
    : isHome
      ? (searchParams.get('category') ?? 'All Components')
      : null

  // Hidden only on /lab/* — LAB has its own custom top bar (logo + auth pill),
  // no left rail, no search — and on template / example leaves, which are
  // full-screen compositions with no chrome at all. Every other route,
  // /design-systems and /ideation included, keeps this one rail mounted, so
  // crossing between those route spaces never unmounts and remounts it.
  const hideSidebar =
    pathname?.startsWith('/lab') ||
    TEMPLATE_LEAF_RE.test(pathname ?? '') ||
    CAPTURE_LEAF_RE.test(pathname ?? '')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  // promoteDS caps Components to its first 3 categories; this reveals the rest.
  const [showAllCats, setShowAllCats] = useState(false)

  const toggle = (title: string) =>
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }))

  // ── Pole collapse state ───────────────────────────────────────────────────
  // Are we inside a design-system path? The overview, showcase, examples, and
  // per-component pages all live under `/design-systems/<slug>/...`.
  const onDesignSystems = pathname?.startsWith('/design-systems') || false
  // The Design Systems pole no longer collapses as a whole: each system row
  // owns its own caret, so both systems stay listed at all times.

  // ── Components pole mutual-exclusion ───────────────────────────────────────
  // The Components pole opens on component routes and closes on design-system
  // routes; a toggle by hand sticks while you stay on one side and is dropped
  // when you cross, which is what the remount used to do.
  const [handToggle, setHandToggle] = useState<{ onDS: boolean; collapsed: boolean } | null>(null)
  const collapsedComponents = handToggle?.onDS === onDesignSystems ? handToggle.collapsed : onDesignSystems

  const toggleComponents = () => setHandToggle({ onDS: onDesignSystems, collapsed: !collapsedComponents })

  const { searchValue, setSearchValue, searchInputRef, clearSearch } = useComponentSearch()

  // ⌘K / Ctrl+K focuses the search input.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [searchInputRef])

  if (hideSidebar) return null

  const pinnedDark = isPinnedDarkRoute(pathname)

  return (
    <aside className={`flex h-full w-60 shrink-0 flex-col border-r border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950 ${pinnedDark ? 'dark' : ''}`}>

      {/* ── Logo ── */}
      <div className="flex h-14 shrink-0 items-center border-b border-sand-200 px-4 dark:border-sand-800">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-sand-900 dark:text-sand-50"
        >
          <img src="/ai-canvas-icon.svg" alt="" width={20} height={17} className="shrink-0" />
          AI Canvas
        </Link>
      </div>

      {/* ── Search ── */}
      <div className="shrink-0 px-3 py-3">
        <div className="relative">
          <MagnifyingGlass
            weight="regular"
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand-600 dark:text-sand-500"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-lg border border-sand-200 bg-sand-100 py-1.5 pl-8 pr-8 text-sm text-sand-900 outline-none transition-colors placeholder:text-sand-600 hover:border-sand-300 focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-50 dark:placeholder:text-sand-500 dark:hover:border-sand-600 dark:focus:border-olive-500 dark:focus:ring-olive-500/20"
          />
          {searchValue && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-sand-600 transition-colors hover:text-sand-700 dark:text-sand-500 dark:hover:text-sand-300"
            >
              <X weight="regular" size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      {/* The thin scrollbar (globals.css) takes width when the list scrolls,
          and the widest row, a system name with its NEW chip, has no slack to
          give: it truncated the moment the bar appeared. A stable gutter keeps
          that strip reserved whether or not the list scrolls, so every row has
          one width in both states. The right padding drops to 1px because
          the reserved gutter now supplies the right-hand space px-3 used to. */}
      <nav
        className="flex-1 overflow-y-auto pl-3 pr-px pt-2 pb-2 [scrollbar-gutter:stable]"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent 0, #000 8px, #000 calc(100% - 16px), transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0, #000 8px, #000 calc(100% - 16px), transparent 100%)',
        }}
      >
        {/* ── Design Systems pole (shared, identical on every page) ── */}
        <DesignSystemsPole />

        {/* Tiered sections */}
        {SECTIONS.map((section) => {
          const isComponents = section.title === 'Components'
          // The Components pole is a collapsible button driven by the
          // mutual-exclusion state, with an extra "All Components" leaf —
          // mirrors the retired IdeationSidebar so navigating between the two
          // URL spaces feels identical.
          const isCollapsed = isComponents
            ? collapsedComponents
            : (collapsed[section.title] ?? false)
          const isDisabled = section.disabled === true
          // Promoted landing view shows only the first 4 categories so the
          // Design Systems pole rises into view; the rest sit behind Show more.
          // Every label is still RENDERED and only visually hidden, so all 11
          // category links ship in the server HTML. Slicing the array instead
          // left 7 category pages with no crawlable link into them.
          const catLabels = section.labels
          const hideCatsFrom =
            isComponents && promoteDS && !showAllCats ? 4 : Infinity
          // Count what the cap ACTUALLY hides: the active category stays
          // visible past the cap, so a plain length - 4 overcounts by one
          // whenever you are inside one of the capped categories.
          const hiddenCatCount = catLabels.filter(
            (label, i) => i >= hideCatsFrom && label !== activeCategory,
          ).length
          // Once expanded nothing is hidden, so the count alone would unmount
          // the control and strand the list open with no way back.
          const hasHiddenCats =
            isComponents && promoteDS && (showAllCats || hiddenCatCount > 0)

          return (
            <div key={section.title} className="mb-3">
              {isComponents ? (
                /* Two targets on one row, the same shape a system row uses:
                   the name opens All Components and expands the list, the caret
                   only opens or closes it in place. It used to be one button
                   that merely expanded, so the header led nowhere. */
                <div className="group mb-1 flex items-center gap-1 rounded-md pr-1.5 text-sm font-semibold transition-colors text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-800/60 dark:hover:text-sand-100">
                  <Link
                    href="/components"
                    onClick={() => setHandToggle(null)}
                    className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pl-2 pr-0"
                  >
                    <span>{section.icon}</span>
                    <span className="flex-1 whitespace-nowrap text-left">Components &amp; Blocks</span>
                  </Link>
                  <button
                    type="button"
                    onClick={toggleComponents}
                    aria-expanded={!isCollapsed}
                    aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} Components & Blocks`}
                    className="shrink-0 rounded p-0.5 text-sand-600 transition-colors hover:text-sand-900 dark:text-sand-500 dark:hover:text-sand-100"
                  >
                    <CaretDown size={12} weight="regular" className={`shrink-0 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => !isDisabled && toggle(section.title)}
                  disabled={isDisabled}
                  className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold transition-colors ${
                    isDisabled
                      ? 'cursor-not-allowed text-sand-600/60 dark:text-sand-600/60'
                      : 'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'
                  }`}
                >
                  <span className={isDisabled ? 'opacity-40' : ''}>{section.icon}</span>
                  <span className="flex-1 text-left">
                    {section.title}
                    {isDisabled && <span className="ml-1 text-xs font-normal text-sand-600 dark:text-sand-700">· soon</span>}
                  </span>
                  {!isDisabled && <CaretDown size={12} weight="regular" className={`shrink-0 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />}
                </button>
              )}

              {!isCollapsed && !isDisabled && (
                <div className="relative">
                  {/* One vertical rail replaces the per-row elbow arrows: the
                      line is the grouping cue, the rows stay uncluttered. */}
                  <span aria-hidden className="pointer-events-none absolute bottom-1 left-[14px] top-1 w-px bg-sand-200 dark:bg-sand-800" />
                <ul className="space-y-0.5">
                  {/* "All Components" is always its own leaf. It used to exist
                      only on design-system and ideation routes, so clicking it
                      from one of those pages landed on /components and the row
                      you just clicked vanished, with the section header lit
                      instead. */}
                  {isComponents && (
                    <li>
                      <Link
                        href="/components"
                        className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                          activeCategory === 'All Components'
                            ? 'bg-sand-200/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                            : 'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'
                        }`}
                      >
                        <span aria-hidden className="w-3 shrink-0" />
                        <span className="flex-1 truncate">All Components</span>
                      </Link>
                    </li>
                  )}
                  {catLabels.map((label, i) => {
                    const isActive = label === activeCategory
                    const cat = getCategoryByLabel(label)
                    const href = cat
                      ? `/components/category/${cat.slug}`
                      : `/components?category=${encodeURIComponent(label)}`
                    // The category you are ON is never hidden by the cap.
                    // Hiding it left the rail with nothing lit while the
                    // breadcrumb said you were inside that category.
                    return (
                      <li key={label} className={i >= hideCatsFrom && !isActive ? 'hidden' : undefined}>
                        <Link
                          href={href}
                          className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-sand-200/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                              : 'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'
                          }`}
                        >
                          <span aria-hidden className="w-3 shrink-0" />
                          <span className="flex-1">{label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                </div>
              )}
              {/* Show more sits OUTSIDE the rail: it is a control over the
                  list, not an item in it, and its caret lives in the same
                  column the rail occupies — the line ran straight through it. */}
              {!isCollapsed && !isDisabled && hasHiddenCats && (
                <button
                  type="button"
                  onClick={() => setShowAllCats((v) => !v)}
                  className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-sand-600 transition-colors hover:bg-sand-200/50 hover:text-sand-700 dark:text-sand-500 dark:hover:bg-sand-800/60 dark:hover:text-sand-300"
                >
                  <CaretDown
                    size={12}
                    weight="regular"
                    className={`shrink-0 transition-transform ${showAllCats ? '' : '-rotate-90'}`}
                  />
                  <span className="flex-1 text-left">
                    {showAllCats ? 'Show less' : `Show ${hiddenCatCount} more`}
                  </span>
                </button>
              )}
            </div>
          )
        })}

        {/* ── Secondary nav — scrolls with the rail instead of sitting pinned,
               so the navigation reads as one list that simply runs on. The
               mobile drawer has always worked this way. ── */}
        <div className="pt-2">
          {/* Inset divider (padded left/right via the nav's px-3) */}
          <div className="mb-2 border-t border-sand-200 dark:border-sand-800" />
          <div className="space-y-0.5">
            <SecondaryNav pathname={pathname} variant="rail" />
          </div>
        </div>

      </nav>

      {/* ── Social icons ── */}
      {/* GitHub + X moved here from the page header so the top-right can
          carry the auth pill + Get MCP CTA. No top border — the icons
          float quietly at the bottom of the rail. */}
      <div className="shrink-0 px-3 pt-2 pb-1">
        <div className="flex items-center gap-1">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className={buttonClasses({ variant: 'icon', size: 'md' })}
          >
            <GithubLogo weight="regular" size={18} />
          </a>
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X profile"
            className={buttonClasses({ variant: 'icon', size: 'md' })}
          >
            <XLogo weight="regular" size={18} />
          </a>
        </div>
      </div>

    </aside>
  )
}
