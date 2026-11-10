'use client'

// The site's Search trigger and its ⌘K / Ctrl+K shortcut: a compact button in
// the top bar, which renders once, so one shortcut listener is live. The dialog itself
// is a separate chunk, fetched the first time the pointer or focus reaches the
// button (or the shortcut fires), so the metadata it searches stays out of the
// page bundle.

import { lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Search } from '@/app/_icons/icons/search'

const loadDialog = () => import('./SearchDialog')
const SearchDialog = lazy(loadDialog)

const noop = () => () => {}
// The server renders the Mac glyph; other platforms swap in "Ctrl" after hydration.
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

const KBD =
  'rounded-tag border border-sand-200 bg-sand-50 px-1 font-sans text-[11px] font-medium leading-4 text-sand-600 dark:border-sand-700 dark:bg-sand-950 dark:text-sand-400'

const BAR =
  'inline-flex h-8 items-center gap-2 rounded-control border border-sand-200 bg-sand-100 px-2.5 text-sm font-medium text-sand-700 transition-colors hover:border-sand-300 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300 dark:hover:border-sand-700 dark:hover:text-sand-50'

export function SiteSearch() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const mac = useSyncExternalStore(noop, isMac, () => true)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    buttonRef.current?.focus()
  }, [])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-label="Search"
        onClick={() => setOpen(true)}
        onPointerEnter={loadDialog}
        onFocus={loadDialog}
        className={BAR}
      >
        <Search size={14} aria-hidden className="lg:hidden" />
        <span className="hidden lg:inline">Search</span>
        <span aria-hidden className="hidden items-center gap-0.5 lg:flex">
          <kbd className={KBD}>{mac ? '⌘' : 'Ctrl'}</kbd>
          <kbd className={KBD}>K</kbd>
        </span>
      </button>
      {open && (
        <Suspense fallback={null}>
          <SearchDialog onClose={close} />
        </Suspense>
      )}
    </>
  )
}
