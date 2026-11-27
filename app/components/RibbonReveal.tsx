'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { X } from '@/app/_icons/icons/x'
import { isChromeless } from './TopBar'

// Collapses its child when the page scrolls down and brings it back on the way
// up. Only the page scroller counts; a page with little to scroll keeps it shown,
// so collapsing cannot clamp the scroll back to the top and bounce.
const PAGE_SCROLLER = '[data-owns-scroll], .app-scroll-column'
const MIN_OVERFLOW = 160

// With closeCookie it also draws an X that hides the ribbon and sets that cookie for a week.
export function RibbonReveal({ children, closeCookie }: { children: ReactNode; closeCookie?: string }) {
  const pathname = usePathname() ?? '/'
  const [shown, setShown] = useState(true)
  const [closed, setClosed] = useState(false)
  const last = useRef(new WeakMap<Element, number>())
  const lockedUntil = useRef(0)
  const shownRef = useRef(true)

  // A new page starts at its top, so the ribbon comes back with it.
  const [pagePath, setPagePath] = useState(pathname)
  if (pagePath !== pathname) {
    setPagePath(pathname)
    setShown(true)
  }
  useEffect(() => {
    shownRef.current = shown
  }, [shown])

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
      if (next !== shownRef.current) {
        shownRef.current = next
        lockedUntil.current = performance.now() + 300
        setShown(next)
      }
    }
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => document.removeEventListener('scroll', onScroll, { capture: true })
  }, [])

  if (closed || isChromeless(pathname)) return null

  const close = () => {
    document.cookie = `${closeCookie}=1; path=/; max-age=604800; samesite=lax`
    setClosed(true)
  }

  return (
    <div
      className={`grid shrink-0 transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${shown ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
    >
      <div className="relative overflow-hidden" inert={!shown}>
        {children}
        {closeCookie && (
          <button
            type="button"
            aria-label="Close the offer"
            onClick={close}
            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-accent-foreground/70 transition-colors hover:bg-accent-foreground/10 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-foreground/40"
          >
            <X size={14} aria-hidden />
          </button>
        )}
      </div>
    </div>
  )
}
