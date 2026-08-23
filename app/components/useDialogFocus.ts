'use client'

import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Keyboard contract for a modal dialog: while `open`, Tab and Shift+Tab cycle
 * inside `ref` and wrap at both ends, and focus returns to the element that
 * had it once the dialog closes. Initial focus stays with the caller
 * (autoFocus on a field, or focusing the panel), so each dialog decides where
 * a keyboard user lands.
 */
export function useDialogFocus(ref: RefObject<HTMLElement | null>, open: boolean) {
  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null

    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const dialog = ref.current
      if (!dialog) return
      const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute('aria-hidden'),
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null
      // active === dialog: the panel itself holds focus on open (tabIndex -1).
      if (e.shiftKey && (active === first || active === dialog || !dialog.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [ref, open])
}
