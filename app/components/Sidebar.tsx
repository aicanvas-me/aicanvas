'use client'

import { usePathname } from 'next/navigation'
import { GithubLogo, XLogo } from '@phosphor-icons/react'
import { GITHUB_URL, X_URL } from '../lib/config'
import { buttonClasses } from './buttonClasses'
import { CatalogNav } from './CatalogNav'
import { HomeLogo } from './HomeNav'
import { TEMPLATE_LEAF_RE } from '../_components/DesignSystemsPole'
import { CAPTURE_LEAF_RE } from './top-bar-crumbs'
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
    <aside className={`@container flex h-full w-60 shrink-0 flex-col bg-sand-50 dark:bg-sand-950 ${pinnedDark ? 'dark' : ''}`}>
      {ownBar && (
        <div className="flex h-14 shrink-0 items-center px-5">
          <HomeLogo />
        </div>
      )}

      {/* ── Navigation ── */}
      {/* The thin scrollbar (globals.css) takes width when the list scrolls,
          and the widest row, a system name with its NEW chip, has no slack to
          give: it truncated the moment the bar appeared. A stable gutter keeps
          that strip reserved whether or not the list scrolls, so every row has
          one width in both states.

          The right-hand space then has to come from padding OR gutter, never
          both, and which one depends on the browser: a classic bar takes
          width, an overlay bar (Safari on a trackpad, for one) takes none and
          reserves no gutter. The inner wrapper works it out. The aside is a
          size container, so 100cqw is the rail's width and 100% is the
          nav's width minus whatever the bar took; their difference IS the bar.
          The padding is 12px (the old px-3) minus that, never under 1px, so an
          overlay browser keeps the full 12px and a classic one keeps the row
          width this fix was checked at. */}
      <nav
        aria-label="Catalog"
        className="flex-1 overflow-y-auto pt-2 pb-2 [scrollbar-gutter:stable]"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent 0, #000 8px, #000 calc(100% - 16px), transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0, #000 8px, #000 calc(100% - 16px), transparent 100%)',
        }}
      >
        <div className="pl-3 pr-[max(1px,calc(12px_-_(100cqw_-_100%)))]">
          <CatalogNav />
        </div>
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
