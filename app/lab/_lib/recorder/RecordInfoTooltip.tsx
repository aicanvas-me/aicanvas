'use client'

// "i" badge beside the Record button. Matches Record's xs sizing so the
// pair reads as one row of chrome. Tooltip pops upward since this lives at
// the bottom of the canvas.

import { Info } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'

export function RecordInfoTooltip() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Outside-click / Escape close the pinned-open state. Hover preview stays
  // CSS-only, so we don't have to track pointer enter/leave.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="group relative">
      <button
        type="button"
        aria-label="About the recorder"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-sand-300 bg-sand-50/90 text-sand-600 backdrop-blur transition-colors hover:border-sand-400 hover:text-sand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-olive-500 dark:border-sand-700 dark:bg-sand-900/90 dark:text-sand-400 dark:hover:border-sand-600 dark:hover:text-sand-100"
      >
        <Info weight="regular" size={13} />
      </button>
      <span
        role="tooltip"
        data-open={open || undefined}
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border border-sand-300 bg-sand-50 px-3 py-2 text-xs leading-snug text-sand-700 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 data-[open]:opacity-100 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-200"
      >
        A new way to animate on the web. No timelines, no keyframes, no learning curve. Hit record, move your mouse how you want the scene to move, done.
      </span>
    </div>
  )
}
