'use client'

// "Same prompt, same agent": the generic build on the left, the Andromeda Pro
// template on the right, one divider between them. Drag anywhere on the box,
// or focus the slider and use the arrow keys. On first sight the divider
// sweeps once each way so the visitor learns it moves.

import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { GenericMock } from './GenericMock'
import { POSTER_BG, posterVars } from './poster'

export function CompareSlider({ poster }: { poster: { dark: string | null; light: string | null } }) {
  const reduce = useReducedMotion()
  const boxRef = useRef<HTMLDivElement>(null)
  const inView = useInView(boxRef, { once: true, margin: '-25% 0px' })
  const pos = useMotionValue(50)
  const [val, setVal] = useState(50)
  const [focused, setFocused] = useState(false)
  const dragging = useRef(false)
  const touched = useRef(false)

  const right = useTransform(pos, (v) => 100 - v)
  const clip = useMotionTemplate`inset(0% ${right}% 0% 0%)`
  const left = useMotionTemplate`${pos}%`

  useEffect(() => pos.on('change', (v) => setVal(Math.round(v))), [pos])

  useEffect(() => {
    if (!inView || reduce || touched.current) return
    const c = animate(pos, [50, 28, 72, 50], { duration: 2.2, ease: 'easeInOut', delay: 0.3 })
    return () => c.stop()
  }, [inView, reduce, pos])

  const setFromX = (clientX: number) => {
    const r = boxRef.current?.getBoundingClientRect()
    if (!r) return
    pos.set(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }

  return (
    <div className="relative">
      <div aria-hidden className="mb-3 flex items-center justify-between px-1 text-xs font-semibold">
        <span className="inline-flex items-center gap-2 text-sand-600 dark:text-sand-400">
          <span className="h-2 w-2 rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400" />
          Without rules
        </span>
        <span className="inline-flex items-center gap-2 text-sand-900 dark:text-sand-50">
          With Andromeda Pro
          <span className="h-2 w-2 rounded-full bg-olive-500" />
        </span>
      </div>
      <div
        ref={boxRef}
        className="relative aspect-[1138/613] cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-2xl border border-sand-200 bg-sand-100 [container-type:inline-size] dark:border-sand-800 dark:bg-sand-900"
        onPointerDown={(e) => {
          touched.current = true
          dragging.current = true
          pos.stop()
          e.currentTarget.setPointerCapture(e.pointerId)
          setFromX(e.clientX)
        }}
        onPointerMove={(e) => dragging.current && setFromX(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {/* With rules: the real template, underneath. */}
        <div
          role="img"
          aria-label="With Andromeda Pro: the Mission Control template, near-monochrome, color only on live values"
          className={`absolute inset-0 ${POSTER_BG}`}
          style={posterVars(poster)}
        />

        {/* Without rules, clipped to the left of the divider. */}
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          <GenericMock />
        </motion.div>

        {/* Divider */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-y-0 w-0" style={{ left }}>
          <span className="absolute inset-y-0 -left-px w-[2px] bg-olive-500 shadow-[0_0_14px_rgba(218,228,160,0.55)]" />
          <span className={`absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-0.5 rounded-full border-2 border-olive-500 bg-sand-950 text-olive-400 shadow-[0_6px_20px_rgba(0,0,0,0.45)] ring-olive-500/40 ${focused ? 'ring-4' : ''}`}>
            <CaretLeft weight="regular" size={12} />
            <CaretRight weight="regular" size={12} />
          </span>
        </motion.div>

        <input
          type="range"
          min={0}
          max={100}
          value={val}
          aria-label="Compare without rules and with Andromeda Pro"
          aria-valuetext={`${val}% without rules`}
          onChange={(e) => {
            touched.current = true
            pos.stop()
            pos.set(Number(e.target.value))
          }}
          onFocus={(e) => setFocused(e.currentTarget.matches(':focus-visible'))}
          onBlur={() => setFocused(false)}
          className="sr-only"
        />
      </div>
    </div>
  )
}
