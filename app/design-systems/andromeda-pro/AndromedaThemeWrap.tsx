'use client'

// Light/dark wrap for the Andromeda PREVIEW surfaces (the /system/preview
// matrix and the per-component pages). This is the consumer of the theme
// channel: `andromedaVars()` emits every colour as var(--at-<name>, <dark>),
// so defining the --at-* set retints every Andromeda root — no component
// edits, and the site chrome keeps NO relation to this toggle (plan ruling:
// the Andromeda theme is the design system's own axis, not the site's; sand
// chrome never reads an --at- var, so root-level vars cannot touch it).
//
// The set lands on documentElement, NOT on a mid-tree div, because that is
// the system's swap contract: the Objects and useResolvedVars observe the
// root's class/style/data-theme and re-resolve their canvas ink from computed
// style. A mid-tree wrapper retints the pure-CSS var() chains but fires no
// observer, so canvases and charts silently keep the old palette.

import { createContext, useContext, useEffect, useId, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun } from '@phosphor-icons/react'
import { andromedaLightVars } from '../../lib/andromeda-pro-helpers.generated'
import { useTheme } from '../../components/ThemeProvider'

type AndromedaTheme = 'dark' | 'light'

const ThemeCtx = createContext<{
  theme: AndromedaTheme
  setTheme: (t: AndromedaTheme) => void
} | null>(null)

// `className` lets a caller decide what box the carrier div is. The template
// pages pass `contents`: their shell is a percentage-height flex item of the
// Andromeda layout row, and a plain div in between breaks that chain, so the
// template's own scroll region never gets a bounded height.
export function AndromedaThemeWrap({
  children,
  className,
  initialTheme = 'dark',
  followSite = false,
}: {
  children: ReactNode
  className?: string
  /**
   * The site's OWN theme (its `theme` cookie), read by the server page and
   * threaded down so the preview OPENS in it — the site rule's seed (a
   * preview opens in whatever the site is set to; only the visitor's own
   * toggle pins it after that, see the file banner). A caller that passes
   * nothing keeps this component's original dark-anchored default.
   */
  initialTheme?: AndromedaTheme
  /**
   * Template pages: the preview has no toggle of its own and follows the site
   * theme, the way Andromeda Legacy's templates do. The site moves the
   * preview; nothing here ever writes the site's class or cookie. The phone
   * preview iframe has no ThemeProvider, so it mirrors the embedding page.
   */
  followSite?: boolean
}) {
  const [localTheme, setTheme] = useState<AndromedaTheme>(initialTheme)
  const siteTheme = useTheme().theme
  const [parentTheme, setParentTheme] = useState<AndromedaTheme | null>(null)

  useLayoutEffect(() => {
    if (!followSite || window.self === window.top) return
    let parentRoot: HTMLElement
    try {
      parentRoot = window.parent.document.documentElement
    } catch {
      return
    }
    const sync = () => {
      const next = parentRoot.classList.contains('dark') ? 'dark' : 'light'
      setParentTheme(next)
      // Keep the frame's OWN pre-paint marker in step with the parent. The
      // root layout's head script sets it for the first paint only; on a Pro
      // route nothing else owns it afterwards (the free lane has
      // AndromedaThemeSync, Pro does not), so without this a later site
      // toggle leaves the frame's html/body ground on the old theme while the
      // composition moves, which reads as a light border around a dark
      // dashboard.
      const frameRoot = document.documentElement
      if (next === 'light') frameRoot.setAttribute('data-frame-light', '')
      else frameRoot.removeAttribute('data-frame-light')
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(parentRoot, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [followSite])

  const theme = followSite ? (parentTheme ?? siteTheme) : localTheme

  // The full light set, computed once: shared by the SSR seed below and the
  // effect's imperative write, so the two can never drift apart.
  const lightVars = useMemo(() => andromedaLightVars() as Record<string, string>, [])

  // The declaration list itself, built once and shared by both seeds below.
  const lightDecls = useMemo(
    () =>
      Object.entries(lightVars)
        .map(([name, value]) => `${name}:${value}`)
        .join(';'),
    [lightVars],
  )

  // Dark, untuned is the authored set, which the var() fallbacks already
  // resolve to. Emitting nothing keeps it identical; only light needs an
  // explicit --at- set written onto the root.
  useEffect(() => {
    if (theme !== 'light') return
    const root = document.documentElement
    const names = Object.keys(lightVars)
    for (const name of names) {
      root.style.setProperty(name, lightVars[name])
    }
    root.setAttribute('data-andromeda-theme', 'light')
    return () => {
      for (const name of names) root.style.removeProperty(name)
      root.removeAttribute('data-andromeda-theme')
    }
  }, [theme, lightVars])

  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      {/* Server-rendered seed for the light set. The effect above is what the
          canvas Objects observe (it mutates documentElement itself), but it
          only fires after hydration, one tick past first paint — so a preview
          seeded light straight from the site cookie would otherwise flash the
          dark var() fallback for that one frame. A `:root` rule needs no
          script and no mid-tree wrapper (the reason that would be wrong is
          the file banner above: a style TAG's selector still resolves through
          documentElement regardless of where the tag sits in the DOM). Keyed
          off the CURRENT theme, not the seed, so switching back to dark drops
          it in the same render. Once hydration's effect sets the identical
          values as inline documentElement style, that wins the cascade and
          nothing visibly changes. */}
      {theme === 'light' ? <style>{`:root{${lightDecls}}`}</style> : null}
      {/* The framed (phone preview) seed. Inside the iframe the seed above
          cannot fire on the first paint: the root layout's iframe branch ships
          no ThemeProvider, so `siteTheme` there is the dark default and the
          parent's real theme only arrives with the layout effect above, one
          tick past first paint. The result for a light visitor was the phone
          flashing the dark var() fallbacks and then settling light.
          The frame's root already carries [data-frame-light] pre-paint (set by
          the head script in the root layout, which reads the same-origin
          parent's class before anything renders), so keying a second copy of
          the set on that marker makes the framed document light from its very
          first paint with no script to wait for — the same mechanism
          globals.css uses for the free Andromeda channel, which is why the
          free templates never had this flash. Inert everywhere else: a
          document with no [data-frame] never matches, and a dark parent has no
          marker. Once hydration's effect writes the identical values as inline
          documentElement style, that wins the cascade and nothing changes. */}
      {followSite ? (
        <style>{`html[data-frame][data-frame-light]{${lightDecls}}`}</style>
      ) : null}
      <div data-andromeda-theme={theme} className={className}>{children}</div>
    </ThemeCtx.Provider>
  )
}

// For page code OUTSIDE the DOM subtree (a portalled overlay): React context
// crosses a portal where CSS inheritance cannot, so the overlay reads the
// theme here and spreads the vars on its own root.
export function useAndromedaPreviewTheme() {
  return useContext(ThemeCtx)
}

const THEMES = [
  { key: 'light' as const, label: 'Light theme', icon: Sun },
  { key: 'dark' as const, label: 'Dark theme', icon: Moon },
]

// Site-chrome styled (sand), because it is page chrome ABOUT the design system,
// not design-system content. Renders nothing outside a wrap, so shared page
// shells can carry it unconditionally.
//
// Both themes are on the control and the current one is lit, the same shape as
// the Desktop/Mobile device toggle in the template top bar. A one-button switch
// that named the OTHER theme read as a label of the current state to half the
// people who saw it. The selected chip slides between the two on the site's own
// switch spring (app/components/Toggle.tsx).
export function AndromedaThemeToggle({ className = '', label }: { className?: string; label?: string }) {
  const ctx = useContext(ThemeCtx)
  // Instance-scoped: two toggles mounted at once (a page header and a portalled
  // overlay) would otherwise share one chip and animate it between them.
  const chipId = useId()
  if (!ctx) return null
  const { theme, setTheme } = ctx

  return (
    <div
      role="group"
      aria-label="Andromeda theme"
      className={`flex items-center gap-0.5 rounded-lg border border-sand-300 bg-sand-100 p-0.5 dark:border-sand-800 dark:bg-sand-900 ${className}`}
    >
      {label ? (
        <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-sand-500">
          {label}
        </span>
      ) : null}
      {THEMES.map(({ key, label: name, icon: Icon }) => {
        const active = theme === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => setTheme(key)}
            aria-label={name}
            aria-pressed={active}
            title={name}
            className={`relative flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              active
                ? 'text-sand-900 dark:text-sand-50'
                : 'text-sand-500 hover:text-sand-800 dark:text-sand-400 dark:hover:text-sand-100'
            }`}
          >
            {active ? (
              <motion.span
                aria-hidden
                layoutId={chipId}
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                className="absolute inset-0 rounded-md bg-sand-50 shadow-sm dark:bg-sand-800"
              />
            ) : null}
            <Icon weight="regular" size={16} className="relative" />
          </button>
        )
      })}
    </div>
  )
}

// The dock: the same control, floating bottom-right instead of pinned beside a
// heading. On a page whose whole content is specimens the switch belongs to the
// page, not to the section it happens to sit next to, and floating keeps it
// reachable at any scroll depth. Named Theme, because that is what it moves.
export function AndromedaThemeDock() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) return null
  return (
    <div className="fixed bottom-16 right-5 z-40 rounded-lg shadow-lg">
      <AndromedaThemeToggle label="Theme" />
    </div>
  )
}
