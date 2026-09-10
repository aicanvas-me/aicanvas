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

import { createContext, useContext, useEffect, useId, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun } from '@phosphor-icons/react'
import { andromedaLightVars } from '../../lib/andromeda-pro-helpers.generated'

type AndromedaTheme = 'dark' | 'light'

const ThemeCtx = createContext<{
  theme: AndromedaTheme
  setTheme: (t: AndromedaTheme) => void
} | null>(null)

// `className` lets a caller decide what box the carrier div is. The template
// pages pass `contents`: their shell is a percentage-height flex item of the
// Andromeda layout row, and a plain div in between breaks that chain, so the
// template's own scroll region never gets a bounded height.
export function AndromedaThemeWrap({ children, className }: { children: ReactNode; className?: string }) {
  const [theme, setTheme] = useState<AndromedaTheme>('dark')

  // Dark, untuned is the authored set, which the var() fallbacks already
  // resolve to. Emitting nothing keeps it identical; only light needs an
  // explicit --at- set written onto the root.
  useEffect(() => {
    if (theme !== 'light') return
    const root = document.documentElement
    const base = andromedaLightVars() as Record<string, string>
    const names = Object.keys(base)
    for (const name of names) {
      root.style.setProperty(name, base[name])
    }
    root.setAttribute('data-andromeda-theme', 'light')
    return () => {
      for (const name of names) root.style.removeProperty(name)
      root.removeAttribute('data-andromeda-theme')
    }
  }, [theme])

  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
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
