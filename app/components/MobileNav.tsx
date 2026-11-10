'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu } from '@/app/_icons/icons/menu'
import { X } from '@/app/_icons/icons/x'
import { Search } from '@/app/_icons/icons/search'
import { GithubLogo, XLogo } from './BrandLogos'
import { GITHUB_URL, X_URL } from '../lib/config'
import { CatalogNav } from './CatalogNav'
import { CAPTURE_LEAF_RE, FOCUS_ROUTE_RE, TEMPLATE_LEAF_RE } from './top-bar-crumbs'
import { SecondaryNav, SectionTiles } from './SecondaryNav'
import { useComponentSearch } from './useComponentSearch'
import { Button } from './Button'
import { buttonClasses } from './buttonClasses'
import { ThemeToggle } from './ThemeToggle'
import { isPinnedDarkRoute } from '../lib/pinned-dark'
import { SignedIn } from './auth/SignedIn'
import { SignedOut } from './auth/SignedOut'
import { BrandIcon } from './BrandIcon'
import { UserMenu } from './auth/UserMenu'
import { SignInCta } from './auth/SignInCta'

const DRAWER_SEARCH_ID = 'mobile-drawer-search'

// ─── MobileNav ────────────────────────────────────────────────────────────────

// The phone's only navigation: the bar at the top and the drawer it opens. The
// drawer carries everything the desktop bar and rail do: search, the site's
// sections (Docs, MCP, Pricing) as tiles, the catalog switch (CatalogNav,
// shared with the rail), the info pages (SecondaryNav), the socials, the theme
// and the account.
export function MobileNav() {
  const pathname = usePathname()

  const [open, setOpen] = useState(false)

  // Close the drawer on a real route change (pathname only, not searchParams:
  // typing in search updates ?q= and would otherwise close it on every keystroke),
  // unless its search has focus: typing there moves the page to /components.
  const [seenPathname, setSeenPathname] = useState(pathname)
  if (pathname !== seenPathname) {
    setSeenPathname(pathname)
    if (document.activeElement?.id !== DRAWER_SEARCH_ID) setOpen(false)
  }

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  const { searchValue, setSearchValue, searchInputRef, clearSearch } = useComponentSearch()

  // The desktop Sidebar hides itself below md on every route, so this drawer
  // is the only mobile nav there is — it must stay visible everywhere.
  // Suppress it only where a route owns the full viewport: full-screen
  // template leaves, the /lab subtree (LAB ships its own top bar) and the
  // agent sign-in consent, as the desktop bar and rail do.
  const hideMobileNav =
    pathname?.startsWith('/lab') ||
    TEMPLATE_LEAF_RE.test(pathname ?? '') ||
    CAPTURE_LEAF_RE.test(pathname ?? '') ||
    FOCUS_ROUTE_RE.test(pathname ?? '')
  if (hideMobileNav) return null

  // On a route that pins itself dark, this drawer is the one piece of site
  // chrome still rendering from the root layout, so a light-theme visitor gets
  // a light bar sitting on top of a dark page. Wear the route's theme instead.
  const pinnedDark = isPinnedDarkRoute(pathname)

  return (
    <div className={pinnedDark ? 'dark contents' : 'contents'}>
      {/* ── Mobile top bar ── */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-sand-50 px-4 dark:bg-sand-950 md:hidden">
        <Link href="/" className="flex items-center gap-2 font-bold text-sand-900 dark:text-sand-50">
          <BrandIcon width={18} height={15} className="shrink-0" />
          AI Canvas
        </Link>

        <Button variant="icon" size="md" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </Button>
      </div>

      {/* ── Slide-in drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="mobile-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sand-50 shadow-2xl dark:bg-sand-950 md:hidden"
            >
              {/* Drawer header */}
              <div className="flex h-16 shrink-0 items-center justify-between px-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-bold text-sand-900 dark:text-sand-50"
                  onClick={() => setOpen(false)}
                >
                  <BrandIcon width={18} height={15} className="shrink-0" />
                  AI Canvas
                </Link>
                <Button variant="icon" size="sm" onClick={() => setOpen(false)} aria-label="Close menu">
                  <X size={18} />
                </Button>
              </div>

              {/* Search */}
              <div className="shrink-0 px-3 py-3">
                <div className="relative">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand-600 dark:text-sand-500"
                  />
                  <input
                    ref={searchInputRef}
                    id={DRAWER_SEARCH_ID}
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search..."
                    // 16px font-size prevents iOS Safari from auto-zooming on focus.
                    style={{ fontSize: 16 }}
                    className="w-full rounded-control border border-sand-200 bg-sand-100 py-1.5 pl-8 pr-8 text-sand-900 outline-none transition-colors placeholder:text-sand-600 hover:border-sand-300 focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-50 dark:placeholder:text-sand-500 dark:hover:border-sand-600"
                  />
                  {searchValue && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-control p-0.5 text-sand-600 transition-colors hover:text-sand-700 dark:text-sand-500 dark:hover:text-sand-300"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* The site's sections, one tap away above the long catalog list. */}
              <div className="shrink-0 px-3 pb-2">
                <SectionTiles pathname={pathname} onNavigate={() => setOpen(false)} />
              </div>

              {/* Navigation */}
              <nav
                className="flex-1 overflow-y-auto px-3 pt-2 pb-2"
                style={{
                  maskImage:
                    'linear-gradient(to bottom, transparent 0, #000 8px, #000 calc(100% - 16px), transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, transparent 0, #000 8px, #000 calc(100% - 16px), transparent 100%)',
                }}
              >
                {/* The catalog switch and its list, the same control the
                    desktop rail draws. */}
                <div className="mb-3">
                  <CatalogNav onNavigate={() => setOpen(false)} />
                </div>

                <div className="mb-3">
                  <SecondaryNav pathname={pathname} onNavigate={() => setOpen(false)} />
                </div>
              </nav>

              {/* Social links */}
              <div className="shrink-0 flex items-center gap-1 px-3 pb-2">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub repository"
                  className={buttonClasses({ variant: 'icon', size: 'md' })}
                >
                  <GithubLogo size={18} />
                </a>
                <a
                  href={X_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X profile"
                  className={buttonClasses({ variant: 'icon', size: 'md' })}
                >
                  <XLogo size={17} />
                </a>
                {/* Far edge: a site setting, not a third social link. */}
                <ThemeToggle className="ml-auto" size="md" />
              </div>

              {/* Auth row */}
              <div className="shrink-0 px-3 py-3">
                <SignedIn>
                  <UserMenu />
                </SignedIn>
                <SignedOut>
                  <SignInCta />
                </SignedOut>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
