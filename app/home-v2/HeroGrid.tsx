'use client'

// The blueprint grid behind the v2 hero. The base grid fades out from the top
// centre; a second, olive grid shows only in a soft circle under the pointer,
// so moving the mouse across the hero "lights up" the drafting paper. Fine
// pointers only, and never under reduced motion: on touch it is the plain grid.

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

const GRID_BG =
  '[background-image:linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:56px_56px]'

const LIT: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, rgba(168,185,77,0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(168,185,77,0.45) 1px, transparent 1px)',
  backgroundSize: '56px 56px',
  maskImage: 'radial-gradient(220px circle at var(--mx, -500px) var(--my, -500px), black, transparent)',
  WebkitMaskImage: 'radial-gradient(220px circle at var(--mx, -500px) var(--my, -500px), black, transparent)',
  opacity: 'var(--spot, 0)',
  transition: 'opacity 300ms ease-out',
}

export function HeroGrid() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduce || !window.matchMedia('(pointer: fine)').matches) return
    const scroller: HTMLElement | Window = (el.closest('[data-owns-scroll]') as HTMLElement | null) ?? window
    let raf = 0
    const onMove = (e: Event) => {
      const { clientX, clientY } = e as PointerEvent
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const inside = clientY - r.top < r.height * 0.85
        el.style.setProperty('--mx', `${clientX - r.left}px`)
        el.style.setProperty('--my', `${clientY - r.top}px`)
        el.style.setProperty('--spot', inside ? '1' : '0')
      })
    }
    const onLeave = () => el.style.setProperty('--spot', '0')
    scroller.addEventListener('pointermove', onMove, { passive: true })
    scroller.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      scroller.removeEventListener('pointermove', onMove)
      scroller.removeEventListener('pointerleave', onLeave)
    }
  }, [reduce])

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[1100px]">
      <div className={`absolute inset-0 ${GRID_BG} [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black_30%,transparent_100%)]`} />
      <div className="absolute inset-0" style={LIT} />
    </div>
  )
}
