'use client'

import { createContext, useContext, useLayoutEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Breadcrumbs } from './Breadcrumbs'
import { ThemeToggle } from './ThemeToggle'
import { TopAuthPill } from './auth/TopAuthPill'
import { isPinnedDarkRoute } from '../lib/pinned-dark'
import { CAPTURE_LEAF_RE, TEMPLATE_LEAF_RE, buildTopBarCrumbs, installSlotId } from './top-bar-crumbs'

// The site's one top bar. Rendered once by the root layout, at the top of the
// scroll column, and never unmounted: a page change swaps the content below
// it while the bar, the theme toggle and the user pill stay exactly where they
// were. Before this every page drew its own copy of the same bar, so each
// click threw one away and built another, and the whole strip blinked.
//
// What the bar shows comes from the URL (top-bar-crumbs.ts), so the crumbs are
// in the server HTML. A page that needs something the URL cannot say, like a
// live result count while you type, overrides the left side with
// useTopBarLeft; the override is keyed to the page's own pathname so it can
// never bleed onto the next page.

type LeftOverride = { pathname: string; node: ReactNode } | null

const TopBarContext = createContext<{
  override: LeftOverride
  setOverride: (o: LeftOverride) => void
} | null>(null)

// The bar's install slot: the element a page portals its install control into.
// The BAR publishes it, from a ref, once the bar itself has committed. A page
// must never look the node up on its own: the bar hydrates in its own Suspense
// boundary, so a page that mounts first finds the server's copy of the node,
// portals into it, and breaks the bar's hydration; React then rebuilds the bar
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

// The install slot of the bar above the calling page, or null while there is
// none: before the bar has committed, on a route that has no slot, and during
// the page's own hydration render (the server sent no portal, so the first
// client render must not have one either). It follows the node: if the bar is
// rebuilt, callers get the new element.
export function useTopBarInstallSlot(): HTMLElement | null {
  const slot = useContext(TopBarSlotContext)?.installSlot ?? null
  const isClient = useSyncExternalStore(noop, () => true, () => false)
  return isClient ? slot : null
}

// Replaces the bar's left side for as long as the calling page is mounted.
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
// is always one the bar has already committed.
export function TopBarInstallSlot({ id }: { id: string }) {
  const setInstallSlot = useContext(TopBarSlotContext)?.setInstallSlot
  return <div id={id} ref={setInstallSlot} />
}

const BAR_CLASS =
  'sticky top-0 z-10 hidden h-14 shrink-0 items-center justify-between gap-4 border-b border-sand-200 bg-sand-50 px-6 dark:border-sand-800 dark:bg-sand-950 md:flex'

export function TopBar() {
  const pathname = usePathname() ?? '/'
  const ctx = useContext(TopBarContext)

  // Routes that carry no site chrome: the lab has its own bar, and template
  // leaves are full-screen compositions. The sidebar hides on the same two.
  // /kuendigen still draws its own bar: that page is the legal cancellation
  // flow and is frozen as shipped, so the shell steps aside there.
  if (
    pathname.startsWith('/lab') ||
    pathname === '/kuendigen' ||
    TEMPLATE_LEAF_RE.test(pathname) ||
    CAPTURE_LEAF_RE.test(pathname)
  )
    return null

  const override = ctx?.override && ctx.override.pathname === pathname ? ctx.override.node : undefined
  const crumbs = buildTopBarCrumbs(pathname)
  const slot = installSlotId(pathname)

  return (
    <header className={isPinnedDarkRoute(pathname) ? `dark ${BAR_CLASS}` : BAR_CLASS}>
      <div className="min-w-0 flex-1">
        {override !== undefined ? override : crumbs ? <Breadcrumbs crumbs={crumbs} /> : null}
      </div>
      {/* Right cluster order whenever a page mounts a CTA: theme toggle, then
          the CTA, then the user. */}
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        {slot && <TopBarInstallSlot id={slot} />}
        <TopAuthPill />
      </div>
    </header>
  )
}
