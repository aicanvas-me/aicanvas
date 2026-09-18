'use client'

import { createContext, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Breadcrumbs } from './Breadcrumbs'
import { ThemeToggle } from './ThemeToggle'
import { TopAuthPill } from './auth/TopAuthPill'
import { isPinnedDarkRoute } from '../lib/pinned-dark'
import { TEMPLATE_LEAF_RE, buildTopBarCrumbs, installSlotId } from './top-bar-crumbs'

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

export function TopBarProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<LeftOverride>(null)
  const value = useMemo(() => ({ override, setOverride }), [override])
  return <TopBarContext.Provider value={value}>{children}</TopBarContext.Provider>
}

// Replaces the bar's left side for as long as the calling page is mounted.
// Pass null to fall back to the URL-derived crumbs. Runs as a layout effect so
// the swap lands before the browser paints.
export function useTopBarLeft(node: ReactNode | null) {
  // Only the setter goes into the effect's dependencies: it is stable, while
  // the context value changes on every override, and depending on that would
  // loop the effect against its own write.
  const setOverride = useContext(TopBarContext)?.setOverride
  const pathname = usePathname() ?? '/'
  useLayoutEffect(() => {
    if (!setOverride) return
    setOverride(node === null ? null : { pathname, node })
  }, [setOverride, pathname, node])
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
  if (pathname.startsWith('/lab') || pathname === '/kuendigen' || TEMPLATE_LEAF_RE.test(pathname)) return null

  const override = ctx?.override && ctx.override.pathname === pathname ? ctx.override.node : undefined
  const crumbs = buildTopBarCrumbs(pathname)
  const slot = installSlotId(pathname)

  return (
    <div className={isPinnedDarkRoute(pathname) ? `dark ${BAR_CLASS}` : BAR_CLASS}>
      <div className="min-w-0 flex-1">
        {override !== undefined ? override : crumbs ? <Breadcrumbs crumbs={crumbs} /> : null}
      </div>
      {/* Right cluster order whenever a page mounts a CTA: theme toggle, then
          the CTA, then the user. */}
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        {slot && <div id={slot} />}
        <TopAuthPill />
      </div>
    </div>
  )
}
