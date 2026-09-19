'use client'

// The app scrolls a div, not the window, so the browser's own scroll
// restoration has nothing to restore: Back always returned you to the top of
// the grid you came from. And Next only scrolls a new segment into view when
// its top is already off screen, so a page opened from one scrolled by less
// than the bar's height opened that far down instead of at its top.
//
// This owns both: a new page starts at its top, and Back returns to where you
// were. It watches the ROOT column only. The three layouts that declare
// data-owns-scroll (Andromeda, Andromeda Pro, ideation) scroll an inner
// element of their own and keep their old behaviour.
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const PREFIX = 'aic:scroll:'
// Long enough for a grid to finish laying out its cards, short enough that a
// restore never lands after the reader has started scrolling themselves.
const RESTORE_FRAMES = 30

function column(): HTMLElement | null {
  const el = document.querySelector('.app-scroll-column')
  return el instanceof HTMLElement ? el : null
}

function key() {
  return PREFIX + location.pathname + location.search
}

// When the browser last went back or forward. Module scope, not a ref: this
// component can be remounted by the boundary above it, and a popstate that
// arrived before the remount still has to be readable after it.
let lastPop = 0

export function ScrollMemory() {
  const pathname = usePathname()

  // A timestamp rather than a one-shot flag: an effect that runs twice (React
  // does that in development) must reach the same answer both times, and a
  // consumed flag does not. Anything other than Back or Forward is a new page
  // and starts at the top.
  useEffect(() => {
    const onPop = () => {
      lastPop = Date.now()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    const col = column()
    if (!col) return

    const url = key()
    let raf = 0
    const save = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        // Leaving a tall page for a short one shrinks the column, the browser
        // clamps its scrollTop, and that fires a scroll event like any other.
        // Without this the last thing written for the page you just left is a
        // zero, which is precisely the position it must not remember. By then
        // the URL has already moved on, so the key says whose scroll this is.
        if (key() !== url) return
        try {
          sessionStorage.setItem(url, String(col.scrollTop))
        } catch {
          // Private windows and blocked site data: remembering is a nicety.
        }
      })
    }
    col.addEventListener('scroll', save, { passive: true })

    // The effect for the restored page runs in the same tick as the popstate
    // that caused it; a wider window would misread a fast click as a Back.
    const back = Date.now() - lastPop < 400

    // An anchor in the URL is the reader asking for a specific place; leave it.
    if (!location.hash) {
      let target = 0
      if (back) {
        try {
          target = Number(sessionStorage.getItem(url)) || 0
        } catch {
          target = 0
        }
      }
      // The page below may still be growing, so a restore is re-applied until
      // the column is tall enough to hold it. A reset is applied twice for the
      // same reason: Next scrolls the new segment into view right after this.
      let frames = 0
      const apply = () => {
        // The column outlives every page, so a chain still running for the page
        // you just left would write its position into the one you just opened.
        // Cleanup cannot reach a frame that has not fired yet, so the chain
        // checks the same key `save` does and stops itself.
        if (key() !== url) return
        col.scrollTop = target
        if (frames++ < (target > 0 ? RESTORE_FRAMES : 1) && Math.abs(col.scrollTop - target) > 1) {
          requestAnimationFrame(apply)
        } else if (target === 0 && frames < 2) {
          requestAnimationFrame(apply)
        }
      }
      apply()
    }

    return () => {
      col.removeEventListener('scroll', save)
      cancelAnimationFrame(raf)
    }
  }, [pathname])

  return null
}
