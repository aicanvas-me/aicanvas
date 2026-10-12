'use client'

// The top bar's Search button and its ⌘K / Ctrl+K shortcut. The dialog itself
// is a separate chunk, fetched the first time the pointer or focus reaches the
// button (or the shortcut fires), so the metadata it searches stays out of the
// page bundle.

import { lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'

const loadDialog = () => import('./SearchDialog')
const SearchDialog = lazy(loadDialog)

const noop = () => () => {}
// The server renders the Mac glyph; other platforms swap in "Ctrl" after hydration.
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

const KBD =
  'rounded border border-sand-200 bg-sand-50 px-1 font-sans text-[11px] font-medium leading-4 text-sand-600 dark:border-sand-700 dark:bg-sand-950 dark:text-sand-400'

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
        className="inline-flex h-8 items-center gap-2 rounded-lg border border-sand-200 bg-sand-100 px-2.5 text-sm font-medium text-sand-700 transition-colors hover:border-sand-300 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300 dark:hover:border-sand-700 dark:hover:text-sand-50"
      >
        <MagnifyingGlass weight="regular" size={14} aria-hidden className="lg:hidden" />
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
