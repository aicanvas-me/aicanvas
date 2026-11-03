'use client'

import { usePathname } from 'next/navigation'
import { HomeLogo, HomeNav } from './HomeNav'
import { SiteSearch } from './SiteSearch'
import { ThemeToggle } from './ThemeToggle'
import { TopAuthPill } from './auth/TopAuthPill'
import { isPinnedDarkRoute } from '../lib/pinned-dark'
import { CAPTURE_LEAF_RE, FOCUS_ROUTE_RE, TEMPLATE_LEAF_RE } from './top-bar-crumbs'

// The site's one top bar. It is rendered once by the root layout and never
// unmounted: a page change swaps the content below it while the bar, the theme
// toggle and the user pill stay exactly where they were. Before this every
// page drew its own copy of the same bar, so each click threw one away and
// built another, and the whole strip blinked.
//
// The crumbs, the offer pill and the install slot are not here: each catalog
// page draws them above its own title (PageCrumbs.tsx).

// The bar spans the whole window, above the rail and the content alike, and
// sits outside the scroll column, so it stays put while the page scrolls. No
// bottom rule: the bar and the page share one surface.
const BAR_CLASS =
  'sticky top-0 z-20 hidden h-14 shrink-0 items-center bg-sand-50 dark:bg-sand-950 md:flex'

// Routes that carry no site chrome: the lab has its own bar, and template
// leaves are full-screen compositions, focus pages (the agent sign-in
// consent) are one decision alone. The sidebar hides on the same three.
// /kuendigen still draws its own bar: that page is the legal cancellation
// flow and is frozen as shipped, so the shell steps aside there.
function isChromeless(pathname: string): boolean {
  return (
    pathname.startsWith('/lab') ||
    pathname === '/kuendigen' ||
    TEMPLATE_LEAF_RE.test(pathname) ||
    CAPTURE_LEAF_RE.test(pathname) ||
    FOCUS_ROUTE_RE.test(pathname)
  )
}

export function TopBar() {
  const pathname = usePathname() ?? '/'
  if (isChromeless(pathname)) return null

  // One bar on every page: logo left, the site's sections in the middle,
  // search and the account on the right. It runs edge to edge on every route,
  // the logo lined up with the rail's rows, so the logo and the account never
  // move when a click crosses between a rail page and a rail-less one. The
  // middle is truly centred from xl, where both sides have room to be equal.
  return (
    <header className={isPinnedDarkRoute(pathname) ? `dark ${BAR_CLASS}` : BAR_CLASS}>
      <div className="flex w-full items-center justify-between gap-4 px-5 xl:grid xl:grid-cols-[1fr_auto_1fr]">
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
