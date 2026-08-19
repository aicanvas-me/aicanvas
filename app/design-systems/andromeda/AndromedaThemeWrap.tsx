'use client'

// Light/dark wrap for the Andromeda PREVIEW surfaces (the /system/preview
// matrix and the per-component pages). This is the consumer of the theme
// channel: `andromedaVars()` emits every colour as var(--at-<name>, <dark>),
// so a wrapper that defines the --at-* set retints every Andromeda root
// inside it — no context, no component edits, and the site chrome around it
// keeps NO relation to this toggle (plan ruling: the Andromeda theme is the
// design system's own axis, not the site's).
//
// The --at-* set is spread as inline style, not a stylesheet, so it scopes to
// exactly this subtree and two wraps on one page could disagree on purpose.

import { createContext, useContext, useState, type ReactNode } from 'react'
import { Moon, Sun } from '@phosphor-icons/react'
import { andromedaLightVars } from '../../lib/andromeda-v2-helpers.generated'

type AndromedaTheme = 'dark' | 'light'

const ThemeCtx = createContext<{
  theme: AndromedaTheme
  setTheme: (t: AndromedaTheme) => void
} | null>(null)

export function AndromedaThemeWrap({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AndromedaTheme>('dark')
  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      <div
        data-andromeda-theme={theme}
        style={theme === 'light' ? (andromedaLightVars() as React.CSSProperties) : undefined}
      >
        {children}
      </div>
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
