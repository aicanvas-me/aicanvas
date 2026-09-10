'use client'

// Plays the 200ms page-enter fade on client-side navigations by tagging the
// existing scroll column (app/layout.tsx) with .aic-page-enter — no wrapper
// element, so the column's scroll and height contracts stay untouched.
//
// Keyed off the full pathname rather than a root template.tsx: a root template
// only remounts when the FIRST path segment changes, which would skip the
// site's main loop (/components to /components/[slug], detail to detail).
// Search-param writes leave usePathname untouched, so typing in the search box
// never replays the fade.

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const ENTER_MS = 200

export function PageEnterFade() {
  const pathname = usePathname()
  const prev = useRef<string | null>(null)

  useEffect(() => {
    // Also swallows StrictMode's second dev invocation of the mount effect.
    if (prev.current === pathname) return
    const isFirstLoad = prev.current === null
    prev.current = pathname
    // The first pathname is the full page load: the server HTML is already
    // painted (heroes carry their own entrances), so it does not fade.
    if (isFirstLoad) return

    const col = document.querySelector<HTMLElement>('.app-scroll-column')
    if (!col) return
    col.classList.remove('aic-page-enter')
    // Forces a style flush so re-adding the class restarts the animation even
    // when the previous run has not finished.
    void col.offsetWidth
    col.classList.add('aic-page-enter')
    const done = (e?: AnimationEvent) => {
      // animationend bubbles: only the column's own fade may clear the class,
      // not a short animation finishing somewhere in the page content.
      if (e && (e.target !== col || e.animationName !== 'aicPageFade')) return
      col.classList.remove('aic-page-enter')
      col.removeEventListener('animationend', done)
    }
    col.addEventListener('animationend', done)
    const timer = setTimeout(done, ENTER_MS + 200)
    return () => {
      clearTimeout(timer)
      done()
    }
  }, [pathname])

  return null
}
