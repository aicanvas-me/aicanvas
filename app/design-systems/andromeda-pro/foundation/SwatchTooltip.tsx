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

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

type Tip = { x: number; y: number; name: string; value: string }

const SPRING = { type: 'spring', stiffness: 460, damping: 28, mass: 0.7 } as const
const GLIDE = { type: 'spring', stiffness: 520, damping: 40 } as const

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
  return { x: r.left + r.width / 2, y: r.top, name: el.dataset.swatch ?? '', value }
}

export function SwatchTooltip({ root }: { root: RefObject<HTMLElement | null> }) {
  const reduce = useReducedMotion()
  const [tip, setTip] = useState<Tip | null>(null)
  const mounted = useIsClient()
  const current = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const host = root.current
    if (!host) return
    const over = (e: PointerEvent) => {
      const el = (e.target as Element).closest<HTMLElement>('[data-swatch]')
      if (!el || el === current.current) return
      current.current = el
      setTip(readTip(el))
    }
    const out = (e: PointerEvent) => {
      const next = (e.relatedTarget as Element | null)?.closest?.('[data-swatch]')
      if (next) return
      current.current = null
      setTip(null)
    }
    // The page scrolls inside its own column, so any scroll anywhere closes
    // the tooltip rather than leaving it pinned where the swatch used to be.
    const close = () => {
      current.current = null
      setTip(null)
    }
    host.addEventListener('pointerover', over)
    host.addEventListener('pointerout', out)
    window.addEventListener('scroll', close, true)
    return () => {
      host.removeEventListener('pointerover', over)
      host.removeEventListener('pointerout', out)
      window.removeEventListener('scroll', close, true)
    }
  }, [root])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {tip ? (
        <motion.div
          key="swatch-tip"
          className="pointer-events-none fixed z-[100]"
          initial={{ left: tip.x, top: tip.y }}
          animate={{ left: tip.x, top: tip.y }}
          transition={reduce ? { duration: 0 } : GLIDE}
        >
          {/* Anchored to the swatch's top centre, sitting 8px above it. */}
          <div className="-translate-x-1/2 -translate-y-full pb-2">
            <motion.div
              role="tooltip"
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 10, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 4, transition: { duration: 0.12 } }}
              transition={reduce ? { duration: 0.12 } : SPRING}
              className="flex items-center gap-2.5 whitespace-nowrap rounded-lg border border-sand-800 bg-sand-900 px-2.5 py-1.5 text-sand-50 shadow-[0_1px_2px_rgba(0,0,0,0.20),0_8px_20px_rgba(0,0,0,0.25)] dark:border-sand-200 dark:bg-sand-50 dark:text-sand-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.40),0_8px_20px_rgba(0,0,0,0.50)]"
            >
              <span
                aria-hidden
                className="size-3 shrink-0 rounded-sm ring-1 ring-inset ring-sand-50/20 dark:ring-sand-950/15"
                style={{ background: tip.value }}
              />
              <span className="flex flex-col leading-tight">
                {tip.name ? (
                  <span className="text-[11px] font-semibold text-sand-400 dark:text-sand-600">{tip.name}</span>
                ) : null}
                {/* Ligatures off: Manrope fuses hyphens, and this is a literal value. */}
                <code className="max-w-[22rem] truncate text-xs [font-variant-ligatures:none]">{tip.value}</code>
              </span>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
