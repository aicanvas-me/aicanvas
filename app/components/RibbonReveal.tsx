'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { isChromeless } from './TopBar'

// Collapses its child when the page scrolls down and brings it back on the way
// up. Only the page scroller counts; a page with little to scroll keeps it shown,
// so collapsing cannot clamp the scroll back to the top and bounce.
const PAGE_SCROLLER = '[data-owns-scroll], .app-scroll-column'
const MIN_OVERFLOW = 160

export function RibbonReveal({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/'
  const [shown, setShown] = useState(true)
  const last = useRef(new WeakMap<Element, number>())
  const lockedUntil = useRef(0)

  useEffect(() => {
    const onScroll = (e: Event) => {
      const el = e.target === document ? document.scrollingElement : (e.target as Element)
      if (!el || !(el === document.scrollingElement || el.matches(PAGE_SCROLLER))) return
      const top = el.scrollTop
      const prev = last.current.get(el) ?? 0
      if (top === prev) return
      last.current.set(el, top)
      if (performance.now() < lockedUntil.current) return
      const next = top < 8 || el.scrollHeight - el.clientHeight < MIN_OVERFLOW ? true : top < prev
      if (Math.abs(top - prev) < 4 && next !== true) return
      setShown((cur) => {
        if (cur !== next) lockedUntil.current = performance.now() + 300
        return next
      })
    }
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => document.removeEventListener('scroll', onScroll, { capture: true })
  }, [])

  if (isChromeless(pathname)) return null

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
