'use client'

import { createContext, useContext, useLayoutEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Breadcrumbs } from './Breadcrumbs'
import { HomeLogo, HomeNav } from './HomeNav'
import { SiteSearch } from './SiteSearch'
import { ThemeToggle } from './ThemeToggle'
import { TopAuthPill } from './auth/TopAuthPill'
import { OfferBanner } from './billing/OfferBanner'
import { isPinnedDarkRoute } from '../lib/pinned-dark'
import { isRaillessRoute } from '../lib/railless'
import { CAPTURE_LEAF_RE, TEMPLATE_LEAF_RE, buildTopBarCrumbs, installSlotId, offerPillMode } from './top-bar-crumbs'

// The site's one top bar, and the crumb line under it. Both are rendered once
// by the root layout and never unmounted: a page change swaps the content
// below them while the bar, the theme toggle and the user pill stay exactly
// where they were. Before this every page drew its own copy of the same bar,
// so each click threw one away and built another, and the whole strip blinked.
//
// What the crumb line shows comes from the URL (top-bar-crumbs.ts), so the
// crumbs are in the server HTML. A page that needs something the URL cannot
// say, like a live result count while you type, overrides the left side with
// useTopBarLeft; the override is keyed to the page's own pathname so it can
// never bleed onto the next page.

type LeftOverride = { pathname: string; node: ReactNode } | null

const TopBarContext = createContext<{
  override: LeftOverride
  setOverride: (o: LeftOverride) => void
} | null>(null)

// The install slot: the element a page portals its install control into. It
// sits at the right of the crumb line, and the LINE publishes it, from a ref,
// once the line itself has committed. A page must never look the node up on its own: the line hydrates in its own Suspense
// boundary, so a page that mounts first finds the server's copy of the node,
// portals into it, and breaks the line's hydration; React then rebuilds it
// and the page is left holding a detached node with its control inside.
const TopBarSlotContext = createContext<{
  installSlot: HTMLElement | null
  setInstallSlot: (el: HTMLElement | null) => void
} | null>(null)

export function TopBarProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<LeftOverride>(null)
  const [installSlot, setInstallSlot] = useState<HTMLElement | null>(null)
  const value = useMemo(() => ({ override, setOverride }), [override])
  const slotValue = useMemo(() => ({ installSlot, setInstallSlot }), [installSlot])
  return (
    <TopBarContext.Provider value={value}>
      <TopBarSlotContext.Provider value={slotValue}>{children}</TopBarSlotContext.Provider>
    </TopBarContext.Provider>
  )
}

const noop = () => () => {}

// The install slot of the crumb line above the calling page, or null while there is
// none: before the line has committed, on a route that has no slot, and during
// the page's own hydration render (the server sent no portal, so the first
// client render must not have one either). It follows the node: if the line is
// rebuilt, callers get the new element.
export function useTopBarInstallSlot(): HTMLElement | null {
  const slot = useContext(TopBarSlotContext)?.installSlot ?? null
  const isClient = useSyncExternalStore(noop, () => true, () => false)
  return isClient ? slot : null
}

// Replaces the crumb line's left side for as long as the calling page is mounted.
// Pass null to fall back to the URL-derived crumbs. Runs as a layout effect so
// the swap lands before the browser paints.
//
// CONTRACT: `node` must keep its identity between renders that did not change
// it, so wrap anything but null in a useMemo keyed on the values it reads.
// Writing the override changes the context this hook subscribes to, which
// re-renders the caller; a fresh element each time would feed the effect its
// own write and never settle. app/components/TopBar.test.tsx guards this.
export function useTopBarLeft(node: ReactNode | null) {
  // The context VALUE is deliberately not a dependency: only the setter, which
  // is stable, plus the inputs that decide what the override should be.
  const setOverride = useContext(TopBarContext)?.setOverride
  const pathname = usePathname() ?? '/'
  useLayoutEffect(() => {
    if (!setOverride) return
    setOverride(node === null ? null : { pathname, node })
  }, [setOverride, pathname, node])
}

// The slot element. Its ref is what publishes it, so the node a page receives
// is always one the line has already committed.
export function TopBarInstallSlot({ id }: { id: string }) {
  const setInstallSlot = useContext(TopBarSlotContext)?.setInstallSlot
  return <div id={id} ref={setInstallSlot} />
}

// The bar spans the whole window, above the rail and the content alike, and
// sits outside the scroll column, so it stays put while the page scrolls. No
// bottom rule: the bar and the page share one surface.
const BAR_CLASS =
  'sticky top-0 z-20 hidden h-14 shrink-0 items-center bg-sand-50 dark:bg-sand-950 md:flex'

// Routes that carry no site chrome: the lab has its own bar, and template
// leaves are full-screen compositions. The sidebar hides on the same two.
// /kuendigen still draws its own bar: that page is the legal cancellation
// flow and is frozen as shipped, so the shell steps aside there.
function isChromeless(pathname: string): boolean {
  return (
    pathname.startsWith('/lab') ||
    pathname === '/kuendigen' ||
    TEMPLATE_LEAF_RE.test(pathname) ||
    CAPTURE_LEAF_RE.test(pathname)
  )
}

export function TopBar() {
  const pathname = usePathname() ?? '/'
  if (isChromeless(pathname)) return null

  // One bar on every page: logo left, the site's sections in the middle,
  // search and the account on the right. Without the rail (app/lib/railless.ts)
  // its content sits in the same 7xl column as the page below and the middle
  // is truly centred from xl, where both sides have room to be equal. Beside
  // the rail it runs edge to edge, the logo lined up with the rail's rows.
  // The same elements either way, so crossing between the two never remounts
  // the bar.
  const railless = isRaillessRoute(pathname)
  return (
    <header className={isPinnedDarkRoute(pathname) ? `dark ${BAR_CLASS}` : BAR_CLASS}>
      <div
        className={`flex w-full items-center justify-between gap-4 xl:grid xl:grid-cols-[1fr_auto_1fr] ${
          railless ? 'mx-auto max-w-7xl px-6' : 'px-5'
        }`}
      >
        <HomeLogo />
        <HomeNav />
        <div className="flex shrink-0 items-center justify-end gap-2">
          <SiteSearch />
          <ThemeToggle />
          <TopAuthPill />
        </div>
      </div>
    </header>
  )
}

const CRUMB_BAR_CLASS =
  'sticky top-0 z-10 hidden h-11 shrink-0 items-center justify-between gap-4 bg-sand-50 px-6 dark:bg-sand-950 md:flex'

// The slim line at the top of the content column on the routes with the rail:
// the crumb trail on the left, the page's install slot on the right, and the
// founding-offer pill in the slack between them. It is everything the old
// rail-side bar carried except the controls the global bar now holds, at the
// same width that bar had, so the crumb, the pill and the install control keep
// the room they were laid out for. Rendered once by the root layout, like the
// bar, and never remounted.
//
// What it shows comes from the URL (top-bar-crumbs.ts), so the crumbs are in
// the server HTML. A page that needs something the URL cannot say overrides
// the left side with useTopBarLeft.
export function CrumbBar() {
  const pathname = usePathname() ?? '/'
  const ctx = useContext(TopBarContext)
  if (isChromeless(pathname) || isRaillessRoute(pathname)) return null

  const override = ctx?.override && ctx.override.pathname === pathname ? ctx.override.node : undefined
  const crumbs = buildTopBarCrumbs(pathname)
  const slot = installSlotId(pathname)
  const offerMode = offerPillMode(pathname)

  return (
    <div data-crumb-bar className={isPinnedDarkRoute(pathname) ? `dark ${CRUMB_BAR_CLASS}` : CRUMB_BAR_CLASS}>
      {/* With the offer pill present, the MIDDLE takes the slack and centres
          the pill inside it, while the crumb sizes to its own content. The
          crumb keeps min-w-0, so when the line really is too narrow it is the
          one that gives way, and the pill is never painted over.
          flex-1 and shrink-0 each set flex-shrink, so the ends are written as
          alternatives and never both: a string carrying the two is settled by
          the built stylesheet, not by the order written here. */}
      <div className={`min-w-0 ${offerMode ? '' : 'flex-1'}`}>
        {override !== undefined ? (
          override
        ) : crumbs ? (
          <Breadcrumbs crumbs={crumbs} />
        ) : null}
      </div>
      {offerMode && <OfferBanner mode={offerMode} />}
      {slot && (
        <div className="flex shrink-0 items-center gap-2">
          <TopBarInstallSlot id={slot} />
        </div>
      )}
    </div>
  )
}
