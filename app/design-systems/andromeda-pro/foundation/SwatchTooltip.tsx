'use client'

// One tooltip for every swatch on the Foundation page. A swatch opts in with
// `data-swatch="<token name>"`; the value comes from `data-swatch-value` when
// the markup knows it, otherwise from the swatch's own computed background,
// which is the theme-resolved value of whichever ThemeBlock it sits in.
//
// Motion: the first hover enters from slightly right and below and springs up
// into place. Moving along a strip keeps the tooltip open and glides it to the
// next swatch, so running the pointer across a ramp reads as one gesture
// rather than a flicker of re-entries. Reduced motion keeps only the fade.
//
// A mouse opens it on hover. Touch and pen open it on tap instead, because a
// tap fires over and out together and most touch scrolls start on a swatch.
// It stays inside the viewport: clamped sideways, flipped below the swatch
// when there is no room above.

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type AnimationPlaybackControls } from 'framer-motion'

type Tip = { cx: number; top: number; bottom: number; name: string; value: string }

const SPRING = { type: 'spring', stiffness: 460, damping: 28, mass: 0.7 } as const
const GLIDE = { type: 'spring', stiffness: 520, damping: 40 } as const
// Distance from the swatch, and the closest the tooltip may sit to a viewport edge.
const GAP = 8
const EDGE = 8

// False on the server and during hydration, true after: the portal needs
// document.body, which the server does not have.
const noop = () => () => {}
const useIsClient = () => useSyncExternalStore(noop, () => true, () => false)

function readTip(el: HTMLElement): Tip {
  const r = el.getBoundingClientRect()
  let value = el.dataset.swatchValue ?? ''
  if (!value) {
    const cs = getComputedStyle(el)
    value = cs.backgroundImage !== 'none' ? cs.backgroundImage : cs.backgroundColor
  }
  return { cx: r.left + r.width / 2, top: r.top, bottom: r.bottom, name: el.dataset.swatch ?? '', value }
}

export function SwatchTooltip({ root }: { root: RefObject<HTMLElement | null> }) {
  const reduce = useReducedMotion()
  const [tip, setTip] = useState<Tip | null>(null)
  // Position lives in motion values: the first placement after being hidden
  // jumps there, every later one glides. `visibility` hides the box for the
  // one layout pass before its size is known.
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const visibility = useMotionValue<'hidden' | 'visible'>('hidden')
  const placed = useRef(false)
  const glides = useRef<AnimationPlaybackControls[]>([])
  const mounted = useIsClient()
  const current = useRef<HTMLElement | null>(null)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = root.current
    if (!host) return
    let pointer: { x: number; y: number } | null = null
    let frame = 0

    const show = (el: HTMLElement) => {
      current.current = el
      setTip(readTip(el))
    }
    const hide = () => {
      current.current = null
      setTip(null)
    }
    const swatchAt = (target: EventTarget | null) =>
      (target as Element | null)?.closest?.<HTMLElement>('[data-swatch]') ?? null

    const over = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const el = swatchAt(e.target)
      if (el && el !== current.current) show(el)
    }
    const out = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || swatchAt(e.relatedTarget)) return
      hide()
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') pointer = { x: e.clientX, y: e.clientY }
    }
    const tap = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return
      const el = swatchAt(e.target)
      if (el && el !== current.current) show(el)
      else hide()
    }
    // The page scrolls inside its own column. After a scroll or a resize the
    // swatch under the mouse may have changed, and no pointerover fires for
    // content moving under a still pointer, so look again once per frame.
    const reflow = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        if (!current.current) return
        const el = pointer ? swatchAt(document.elementFromPoint(pointer.x, pointer.y)) : null
        if (el && host.contains(el)) show(el)
        else hide()
      })
    }

    host.addEventListener('pointerover', over)
    host.addEventListener('pointerout', out)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', tap)
    window.addEventListener('scroll', reflow, true)
    window.addEventListener('resize', reflow)
    return () => {
      cancelAnimationFrame(frame)
      host.removeEventListener('pointerover', over)
      host.removeEventListener('pointerout', out)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', tap)
      window.removeEventListener('scroll', reflow, true)
      window.removeEventListener('resize', reflow)
    }
  }, [root])

  // Placed after layout, before paint: the box's own size decides the clamp
  // and the flip. offsetWidth ignores the entrance transform.
  useLayoutEffect(() => {
    const el = box.current
    if (!tip || !el) return
    const w = el.offsetWidth
    const h = el.offsetHeight
    const nx = Math.min(Math.max(tip.cx - w / 2, EDGE), window.innerWidth - w - EDGE)
    const ny = tip.top - GAP - h < EDGE ? tip.bottom + GAP : tip.top - GAP - h
    glides.current.forEach((c) => c.stop())
    if (!placed.current || reduce) {
      x.jump(nx)
      y.jump(ny)
      visibility.set('visible')
      placed.current = true
    } else {
      glides.current = [animate(x, nx, GLIDE), animate(y, ny, GLIDE)]
    }
  }, [tip, reduce, x, y, visibility])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence
      onExitComplete={() => {
        placed.current = false
        visibility.set('hidden')
      }}
    >
      {tip ? (
        <motion.div
          key="swatch-tip"
          ref={box}
          className="pointer-events-none fixed left-0 top-0 z-[100]"
          style={{ x, y, visibility }}
        >
          <motion.div
            role="tooltip"
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 10, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 4, transition: { duration: 0.12 } }}
            transition={reduce ? { duration: 0.12 } : SPRING}
            className="flex max-w-[calc(100vw-16px)] items-center gap-2.5 whitespace-nowrap rounded-lg border border-sand-800 bg-sand-900 px-2.5 py-1.5 text-sand-50 shadow-[0_1px_2px_rgba(0,0,0,0.20),0_8px_20px_rgba(0,0,0,0.25)] dark:border-sand-200 dark:bg-sand-50 dark:text-sand-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.40),0_8px_20px_rgba(0,0,0,0.50)]"
          >
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-sm ring-1 ring-inset ring-sand-50/20 dark:ring-sand-950/15"
              style={{ background: tip.value }}
            />
            <span className="flex min-w-0 flex-col leading-tight">
              {tip.name ? (
                <span className="text-[11px] font-semibold text-sand-400 dark:text-sand-600">{tip.name}</span>
              ) : null}
              {/* Ligatures off: Manrope fuses hyphens, and this is a literal value. */}
              <code className="max-w-[22rem] truncate text-xs [font-variant-ligatures:none]">{tip.value}</code>
            </span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
