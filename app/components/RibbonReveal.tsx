'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

// Collapses its child when the page scrolls down and brings it back on the way
// up. Pages scroll inside different elements, so it listens in the capture phase.
export function RibbonReveal({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState(true)
  const last = useRef(new WeakMap<EventTarget, number>())

  useEffect(() => {
    const onScroll = (e: Event) => {
      const el = e.target === document ? document.scrollingElement : (e.target as Element)
      if (!el) return
      const top = el.scrollTop
      const prev = last.current.get(el) ?? 0
      last.current.set(el, top)
      if (top < 8) setShown(true)
      else if (Math.abs(top - prev) > 4) setShown(top < prev)
    }
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => document.removeEventListener('scroll', onScroll, { capture: true })
  }, [])

  return (
    <div
      className={`grid shrink-0 transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${shown ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
    >
      <div className="overflow-hidden" inert={!shown}>
        {children}
      </div>
    </div>
  )
}
