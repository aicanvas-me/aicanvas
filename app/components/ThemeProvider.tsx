'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark'

/**
 * SITE theme only.
 *
 * The site owns exactly one thing: the `dark` class on `<html>`, mirrored into
 * the `theme` cookie so the server can render the right class on the first
 * paint. It is the only writer of either.
 *
 * A component or block preview does NOT use this. Previews carry their own
 * `[data-card-theme]` wrapper (see the scope contract in globals.css) and hold
 * their choice in local state. That separation is load-bearing: an earlier site
 * toggle and the component toggles both wrote `<html>`, so flipping a preview
 * to dark dragged the whole site with it, and the site toggle was deleted to
 * stop it. Nothing below may reach into a preview, and nothing in a preview may
 * call back into here.
 */

const ThemeContext = createContext<{ theme: Theme; setTheme: (next: Theme) => void }>({
  theme: 'dark',
  setTheme: () => {},
})

// Counts theme switches so overlapping transitions never clean up after each
// other; see the token guard in setTheme.
let switchSeq = 0

export function ThemeProvider({ initial, children }: { initial: Theme; children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(initial)

  function setTheme(next: Theme) {
    const token = ++switchSeq
    const apply = () => {
      setThemeState(next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      // A year, so the choice survives. Carries the word light or dark and
      // nothing else: no id, no session, nothing that could identify a visitor.
      document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax${
        location.protocol === 'https:' ? '; secure' : ''
      }`
    }
    // Token-guarded: a second toggle skips the first view transition, whose
    // `finished` settles immediately and would otherwise strip the class from
    // under the still-running second fade.
    const clear = () => {
      if (token === switchSeq) document.documentElement.classList.remove('theme-switching')
    }
    // Soft cross-fade between the two paints where the browser supports view
    // transitions — EXCEPT while a component preview is on the page: a root
    // view transition cross-fades a frozen screenshot over the still-animating
    // preview, which visibly double-images it, so those pages flip instantly.
    // Either way .theme-switching silences per-element color transitions (see
    // globals.css) so every surface lands on its new color at once instead of
    // shimmering in patches.
    document.documentElement.classList.add('theme-switching')
    if (
      typeof document.startViewTransition === 'function' &&
      !document.querySelector('[data-card-theme]')
    ) {
      // catch: `finished` rejects if apply() throws (a denied cookie write);
      // unhandled, SiteBeacon would report that as a js_error.
      document.startViewTransition(apply).finished.catch(() => {}).finally(clear)
    } else {
      apply()
      // Two frames: the first paints the new theme while transitions are
      // still frozen, the second releases them.
      requestAnimationFrame(() => requestAnimationFrame(clear))
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
