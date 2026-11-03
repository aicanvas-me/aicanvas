'use client'

import { usePathname } from 'next/navigation'
import { GithubLogo, XLogo } from './BrandLogos'
import { GITHUB_URL, X_URL } from '../lib/config'
import { buttonClasses } from './buttonClasses'
import { CatalogNav } from './CatalogNav'
import { HomeLogo } from './HomeNav'
import { CAPTURE_LEAF_RE, TEMPLATE_LEAF_RE } from './top-bar-crumbs'
import { isPinnedDarkRoute } from '../lib/pinned-dark'
import { isRaillessRoute } from '../lib/railless'

// The single rail, rendered once by the root layout under the global top bar
// and persisting across every catalog route. The bar carries the logo, the
// search and the site's other pages, so the rail is only the catalog: the
// three-way switch (CatalogNav) and its list, with the GitHub and X links at
// the foot. No rules anywhere: the rail and the page share one surface.
export function Sidebar() {
  const pathname = usePathname()

  // Hidden only on /lab/* — LAB has its own custom top bar (logo + auth pill),
  // no left rail, no search — and on template / example leaves, which are
  // full-screen compositions with no chrome at all. Every other route,
  // /design-systems and /ideation included, keeps this one rail mounted, so
  // crossing between those route spaces never unmounts and remounts it.
  // The homepage and the pages about the product, its plans, policies and the
  // account have no rail either (app/lib/railless.ts): the top bar carries the
  // navigation there (HomeNav), the way ui.shadcn.com's landing page does.
  const hideSidebar =
    isRaillessRoute(pathname) ||
    pathname?.startsWith('/lab') ||
    TEMPLATE_LEAF_RE.test(pathname ?? '') ||
    CAPTURE_LEAF_RE.test(pathname ?? '')
  const pinnedDark = isPinnedDarkRoute(pathname)
  // /kuendigen is frozen as shipped and draws its own bar with no site links,
  // and the global bar steps aside there, so the rail carries the logo on that
  // one route: the way home, at the height of the page's own bar.
  const ownBar = pathname === '/kuendigen'

  if (hideSidebar) return null

  return (
    <aside className={`@container flex h-full w-64 shrink-0 flex-col bg-sand-50 dark:bg-sand-950 ${pinnedDark ? 'dark' : ''}`}>
      {ownBar && (
        <div className="flex h-14 shrink-0 items-center px-5">
          <HomeLogo />
        </div>
      )}

      {/* ── Navigation ── the switch stays put, its list scrolls under it
          (the gutter and padding notes live in CatalogNav). */}
      <nav aria-label="Catalog" className="flex min-h-0 flex-1 flex-col">
        <CatalogNav rail />
      </nav>

      {/* ── Social icons ── GitHub + X float quietly at the foot of the rail,
          no rule above them. */}
      <div className="shrink-0 px-3 pt-2 pb-1">
        <div className="flex items-center gap-1">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className={buttonClasses({ variant: 'icon', size: 'md' })}
          >
            <GithubLogo size={16} />
          </a>
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X profile"
            className={buttonClasses({ variant: 'icon', size: 'md' })}
          >
            <XLogo size={15} />
          </a>
        </div>
      </div>
    </aside>
  )
}
