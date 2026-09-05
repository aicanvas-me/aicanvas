'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  List,
  X,
  Info,
  EnvelopeSimple,
  ChatCircleText,
  GithubLogo,
  XLogo,
  ArrowElbowDownRight,
  CaretDown,
  DiamondsFour,
  Flask,
  MagnifyingGlass,
  PiggyBank,
  Plug,
  Question,
} from '@phosphor-icons/react'
import { GITHUB_URL, X_URL } from '../lib/config'
import type { ReactNode } from 'react'
import { CATEGORIES, getCategoryByLabel } from '../lib/categories'
import { DesignSystemsPole, TEMPLATE_LEAF_RE } from '../_components/DesignSystemsPole'
import { Button, buttonClasses } from './Button'
import { ThemeToggle } from './ThemeToggle'
import { isPinnedDarkRoute } from '../lib/pinned-dark'
import { SignedIn } from './auth/SignedIn'
import { SignedOut } from './auth/SignedOut'
import { UserMenu } from './auth/UserMenu'
import { SignInCta } from './auth/SignInCta'

// ── Tier structure (mirrors Sidebar — both read from the shared config) ──
const COMPONENTS_LABELS = CATEGORIES.map((c) => c.label)

type Section = {
  title: string
  icon: ReactNode
  labels: readonly string[]
  disabled?: boolean
}

// The Design Systems pole is rendered separately via the shared
// DesignSystemsPole (same component the desktop Sidebar uses) so the mobile
// drawer and the desktop rail never drift. Only the Components pole lives here.
const SECTIONS: Section[] = [
  { title: 'Components', icon: <DiamondsFour weight="regular" size={16} />, labels: COMPONENTS_LABELS },
  // { title: 'SVGs', icon: <PenNib weight="regular" size={16} />, labels: [], disabled: true },
]

// ─── MobileNav ────────────────────────────────────────────────────────────────

export function MobileNav({
  counts,
  total,
  promoteDS = false,
}: {
  // Server-computed nav counts (passed by the layout) so this client component
  // never imports the heavy COMPONENTS registry.
  counts: Record<string, number>
  total: number
  // promoteDS: mirror the desktop Sidebar — cap Components to its first 4 (rest
  // behind Show more) and auto-expand Andromeda's System/Brain/Templates.
  promoteDS?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isHome = pathname === '/components'
  const categoryFromPath = pathname?.startsWith('/components/category/')
    ? pathname.replace('/components/category/', '')
    : null
  const activeCategory = categoryFromPath
    ? CATEGORIES.find((c) => c.slug === categoryFromPath)?.label ?? null
    : isHome
      ? (searchParams.get('category') ?? 'All Components')
      : null

  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  // promoteDS caps Components to its first 4 categories; this reveals the rest.
  const [showAllCats, setShowAllCats] = useState(false)
  // Design Systems pole opens by default so Andromeda is one tap away (mirrors
  // the desktop rail, where the DS pole is expanded out of the box).
  const [collapsedDS, setCollapsedDS] = useState(false)

  const toggle = (title: string) =>
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }))

  // Close drawer on real route change (pathname only — NOT searchParams,
  // since typing in search updates ?q= and would otherwise close the drawer
  // on every keystroke).
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  // ── Search ──────────────────────────────────────────────────────────────
  // Local state drives the input; URL is written via a debounced effect so
  // fast keystrokes don't fight themselves. lastPushed distinguishes our
  // own pushes from external URL changes (back/forward, category click).
  const urlQuery = searchParams.get('q') ?? ''
  const [searchValue, setSearchValue] = useState(urlQuery)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [, startTransition] = useTransition()

  const lastPushed = useRef(urlQuery)

  useEffect(() => {
    // While the input is focused, local state is sacred — fast typing can put
    // two debounced pushes in flight, and an older Transition committing
    // after lastPushed has advanced would otherwise clobber the input.
    if (document.activeElement === searchInputRef.current) return
    if (urlQuery === lastPushed.current) return
    setSearchValue(urlQuery)
    lastPushed.current = urlQuery
  }, [urlQuery])

  useEffect(() => {
    if (searchValue === urlQuery) return
    const timer = setTimeout(() => {
      lastPushed.current = searchValue
      const params = new URLSearchParams(searchParams.toString())
      if (searchValue) params.set('q', searchValue)
      else params.delete('q')
      const qs = params.toString()
      startTransition(() => {
        router.replace(qs ? `/components?${qs}` : '/components', { scroll: false })
      })
    }, 150)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  const clearSearch = () => {
    setSearchValue('')
    searchInputRef.current?.focus()
  }

  // The design-systems / ideation layouts only render the *desktop* embedded
  // Sidebar (hidden below md), so this drawer is the only mobile nav on those
  // routes — it must stay visible there. Suppress it only where a route owns
  // the full viewport: full-screen template leaves and the /lab subtree (LAB
  // ships its own top bar).
  const hideMobileNav =
    pathname?.startsWith('/lab') ||
    TEMPLATE_LEAF_RE.test(pathname ?? '')
  if (hideMobileNav) return null

  // On a route that pins itself dark, this drawer is the one piece of site
  // chrome still rendering from the root layout, so a light-theme visitor gets
  // a light bar sitting on top of a dark page. Wear the route's theme instead.
  const pinnedDark = isPinnedDarkRoute(pathname)

  return (
    <div className={pinnedDark ? 'dark contents' : 'contents'}>
      {/* ── Mobile top bar ── */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-sand-200 bg-sand-50 px-4 dark:border-sand-800 dark:bg-sand-950 md:hidden">
        <Link href="/" className="flex items-center gap-2 font-bold text-sand-900 dark:text-sand-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ai-canvas-icon.svg" alt="" width={18} height={15} className="shrink-0" />
          AI Canvas
        </Link>

        <Button variant="icon" size="md" onClick={() => setOpen(true)} aria-label="Open menu">
          <List weight="regular" size={20} />
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
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-sand-200 px-4 dark:border-sand-800">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-bold text-sand-900 dark:text-sand-50"
                  onClick={() => setOpen(false)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/ai-canvas-icon.svg" alt="" width={18} height={15} className="shrink-0" />
                  AI Canvas
                </Link>
                <Button variant="icon" size="sm" onClick={() => setOpen(false)} aria-label="Close menu">
                  <X weight="regular" size={18} />
                </Button>
              </div>

              {/* Search */}
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
                    placeholder="Search..."
                    // 16px font-size prevents iOS Safari from auto-zooming on focus.
                    style={{ fontSize: 16 }}
                    className="w-full rounded-lg border border-sand-200 bg-sand-100 py-1.5 pl-8 pr-8 text-sand-900 outline-none transition-colors placeholder:text-sand-600 hover:border-sand-300 focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-50 dark:placeholder:text-sand-500 dark:hover:border-sand-600 dark:focus:border-olive-500 dark:focus:ring-olive-500/20"
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
                {SECTIONS.map((section) => {
                  const isCollapsed = collapsed[section.title] ?? false
                  const isDisabled = section.disabled === true
                  const isComponents = section.title === 'Components'
                  // Promoted view shows the first 4 categories; rest behind Show more.
                  const catLabels =
                    isComponents && promoteDS && !showAllCats
                      ? section.labels.slice(0, 4)
                      : section.labels
                  const hasHiddenCats =
                    isComponents && promoteDS && section.labels.length > 4

                  return (
                    <div key={section.title} className="mb-3">
                      {section.title === 'Components' ? (
                        <Link
                          href="/components"
                          onClick={() => setOpen(false)}
                          className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold transition-colors ${
                            activeCategory === 'All Components'
                              ? 'bg-sand-200/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                              : 'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'
                          }`}
                        >
                          <span>{section.icon}</span>
                          <span className="flex-1 whitespace-nowrap">Components &amp; Blocks</span>
                        </Link>
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
                        <ul className="space-y-0.5">
                          {catLabels.map((label) => {
                            const isActive = label === activeCategory
                            const cat = getCategoryByLabel(label)
                            const href = cat
                              ? `/components/category/${cat.slug}`
                              : `/components?category=${encodeURIComponent(label)}`
                            return (
                              <li key={label}>
                                <Link
                                  href={href}
                                  onClick={() => setOpen(false)}
                                  className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                                    isActive
                                      ? 'bg-sand-200/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                                      : 'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'
                                  }`}
                                >
                                  <ArrowElbowDownRight weight="regular" size={12} className="shrink-0 text-sand-300 dark:text-sand-700" />
                                  <span className="flex-1">{label}</span>
                                </Link>
                              </li>
                            )
                          })}
                          {hasHiddenCats && (
                            <li>
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
                                  {showAllCats ? 'Show less' : `Show ${section.labels.length - 4} more`}
                                </span>
                              </button>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  )
                })}

                {/* ── Design Systems pole (shared, identical to the desktop rail) ── */}
                <DesignSystemsPole
                  collapsed={collapsedDS}
                  onToggle={() => setCollapsedDS((prev) => !prev)}
                  onNavigate={() => setOpen(false)}
                  promoteDS={promoteDS}
                />

                {/* Lab, Get MCP, Pricing, About — follows same pattern as section headers */}
                <div className="mb-3 h-px bg-sand-200 dark:bg-sand-800" />
                <div className="mb-3">
                  <Link
                    href="/lab"
                    onClick={() => setOpen(false)}
                    className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold transition-colors ${
                      pathname?.startsWith('/lab')
                        ? 'bg-sand-200/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                        : 'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'
                    }`}
                  >
                    <span><Flask weight="regular" size={16} /></span>
                    <span className="flex-1">Lab</span>
                  </Link>
                  <Link
                    href="/mcp"
                    onClick={() => setOpen(false)}
                    className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold transition-colors ${
                      pathname === '/mcp'
                        ? 'bg-sand-200/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                        : 'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'
                    }`}
                  >
                    <span><Plug weight="regular" size={16} /></span>
                    <span className="flex-1">Get MCP</span>
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setOpen(false)}
                    className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold transition-colors ${
                      pathname === '/pricing'
                        ? 'bg-sand-200/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                        : 'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'
                    }`}
                  >
                    <span><PiggyBank weight="regular" size={16} /></span>
                    <span className="flex-1">Pricing</span>
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setOpen(false)}
                    className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold transition-colors ${
                      pathname === '/about'
                        ? 'bg-sand-200/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                        : 'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'
                    }`}
                  >
                    <span><Info weight="regular" size={16} /></span>
                    <span className="flex-1">About</span>
                  </Link>
                  <Link
                    href="/faq"
                    onClick={() => setOpen(false)}
                    className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold transition-colors ${
                      pathname === '/faq'
                        ? 'bg-sand-200/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                        : 'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'
                    }`}
                  >
                    <span><Question weight="regular" size={16} /></span>
                    <span className="flex-1">FAQ</span>
                  </Link>
                  <Link
                    href="/contact"
                    className="mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-sand-700 transition-colors hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-800/60 dark:hover:text-sand-100"
                  >
                    <span><EnvelopeSimple weight="regular" size={16} /></span>
                    <span className="flex-1">Contact</span>
                  </Link>
                  <Link
                    href="/feedback"
                    onClick={() => setOpen(false)}
                    className="mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-sand-700 transition-colors hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-800/60 dark:hover:text-sand-100"
                  >
                    <span><ChatCircleText weight="regular" size={16} /></span>
                    <span className="flex-1">Feedback</span>
                  </Link>
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
                  <GithubLogo weight="regular" size={20} />
                </a>
                <a
                  href={X_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X profile"
                  className={buttonClasses({ variant: 'icon', size: 'md' })}
                >
                  <XLogo weight="regular" size={20} />
                </a>
                {/* Far edge: a site setting, not a third social link. */}
                <ThemeToggle className="ml-auto" size="md" />
              </div>

              {/* Auth row */}
              <div className="shrink-0 border-t border-sand-200 px-3 py-3 dark:border-sand-800">
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
