'use client'

import { useEffect } from 'react'

// Top documents need no JS for Andromeda theming: globals.css defines the
// --andromeda-theme-* channel under .andromeda-theme-scope whenever <html>
// carries no `dark` class and is not a frame document, so the palette is
// right from the very first server paint, with nothing to hydrate.
//
// This component exists for the one place CSS cannot reach on its own: the
// same-origin phone-preview iframe. Its bare ?frame=1 shell carries no theme
// state, so the frame MIRRORS the embedding page, light exactly when the parent
// shows light, through a single [data-frame-light] marker on the frame's root.
// globals.css carries the light values for that marker; the root layout's
// iframe branch sets it pre-paint, so the FIRST paint is already correct and
// this effect only has to keep up with LATER changes — the visitor toggling the
// site theme while the preview is open. It only ever READS the parent's theme;
// the `dark` class and the cookie belong to ThemeProvider alone (see
// lib/theme/scope.test.ts). A cross-origin embed gets no mirror and keeps the
// dark default.
export function AndromedaThemeSync() {
  useEffect(() => {
    if (window.self === window.top) return
    let parentRoot: HTMLElement
    try {
      parentRoot = window.parent.document.documentElement
    } catch {
      return
    }
    const frameRoot = window.document.documentElement

    const sync = () => {
      const wantLight = !parentRoot.classList.contains('dark')
      if (wantLight === frameRoot.hasAttribute('data-frame-light')) return
      if (wantLight) frameRoot.setAttribute('data-frame-light', '')
      else frameRoot.removeAttribute('data-frame-light')
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(parentRoot, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return null
}
