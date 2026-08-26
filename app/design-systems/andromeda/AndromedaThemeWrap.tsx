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

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Moon, Sun } from '@phosphor-icons/react'
import { andromedaLightVars } from '../../lib/andromeda-v2-helpers.generated'

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

  useEffect(() => {
    if (theme !== 'light') return
    const root = document.documentElement
    const vars = andromedaLightVars() as Record<string, string>
    for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value)
    root.setAttribute('data-andromeda-theme', 'light')
    return () => {
      for (const name of Object.keys(vars)) root.style.removeProperty(name)
      root.removeAttribute('data-andromeda-theme')
    }
  }, [theme])

  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      <div data-andromeda-theme={theme} className={className}>{children}</div>
    </ThemeCtx.Provider>
  )
}

// The control. Site-chrome styled (sand), because it is page chrome ABOUT the
// design system, not design-system content. Renders nothing when mounted
// outside a wrap, so shared page shells can carry it unconditionally.
// For page code OUTSIDE the DOM subtree (a portalled overlay): React context
// crosses a portal where CSS inheritance cannot, so the overlay reads the
// theme here and spreads the vars on its own root.
export function useAndromedaPreviewTheme() {
  return useContext(ThemeCtx)
}

export function AndromedaThemeToggle({ className = '' }: { className?: string }) {
  const ctx = useContext(ThemeCtx)
  if (!ctx) return null
  const { theme, setTheme } = ctx
  const next = theme === 'dark' ? 'light' : 'dark'
  const Icon = theme === 'dark' ? Sun : Moon
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Preview in ${next} theme`}
      aria-pressed={theme === 'light'}
      className={`flex h-9 items-center gap-2 rounded-lg border border-sand-700 bg-sand-900/95 px-3 text-xs font-semibold uppercase tracking-wider text-sand-400 transition-colors hover:border-sand-500 hover:text-sand-100 ${className}`}
    >
      <Icon size={15} weight="regular" />
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
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
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-xl border border-sand-300 bg-sand-100/95 py-1.5 pl-4 pr-1.5 shadow-lg backdrop-blur-sm dark:border-sand-800 dark:bg-sand-900/95">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-sand-500">
        Theme
      </span>
      <AndromedaThemeToggle />
    </div>
  )
}
