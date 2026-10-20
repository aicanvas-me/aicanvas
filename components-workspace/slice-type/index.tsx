'use client'

// npm install framer-motion

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import type { MotionValue } from 'framer-motion'



const DARK_BG = '#0A0A0A'
const LIGHT_BG = '#EFEEE6'
const DARK_FG = '#EFEEE6'
const LIGHT_FG = '#0A0A0A'





function measureLeftInk(char: string, font: string): number {
  try {
    const W = 200, H = 200
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return 0
    ctx.font = font
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#000'
    ctx.fillText(char, 50, 150)
    const { data } = ctx.getImageData(0, 0, W, H)
    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) {
        if (data[(y * W + x) * 4 + 3] > 32) return x - 50
      }
    }
    return 0
  } catch {
    return 0
  }
}

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ar = (pa >> 16) & 0xff; const ag = (pa >> 8) & 0xff; const ab = pa & 0xff
  const br = (pb >> 16) & 0xff; const bg = (pb >> 8) & 0xff; const bb = pb & 0xff
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0')}`
}




// Same letters after the first, WORD_BOTTOM the wider; also change 'L'/'N' in measure().
const WORD_TOP = 'LIGHT'
const WORD_BOTTOM = 'NIGHT'



const OPEN_OFFSET = 0.65


const INTRO_DELAY_MS = 700
const INTRO_HOLD_MS = 1100
const INTRO_PEAK = 0.7
const INTRO_DURATION_S = 0.9

export default function SliceType() {
  const rootRef = useRef<HTMLDivElement>(null)

  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const engage = useMotionValue(0)
  const engageSmooth = useSpring(engage, { stiffness: 140, damping: 18, mass: 0.9 })

  const bgColor = useTransform(engageSmooth, (e) => mix(DARK_BG, LIGHT_BG, e))
  const fgColor = useTransform(engageSmooth, (e) => mix(DARK_FG, LIGHT_FG, e))

  const topClip = useTransform(engageSmooth, (e) =>
    `inset(0 0 ${50 * (1 - e)}% 0)`,
  )
  const topY = useTransform(engageSmooth, (e) => `${-OPEN_OFFSET * 100 * e}%`)

  const botClip = useTransform(engageSmooth, (e) =>
    `inset(${50 * (1 - e)}% 0 0 0)`,
  )
  const botY = useTransform(engageSmooth, (e) => `${OPEN_OFFSET * 100 * e}%`)

  const containerRef = useRef<HTMLDivElement>(null)
  const lRef = useRef<HTMLSpanElement>(null)
  const ightRef = useRef<HTMLSpanElement>(null)

  const naturalLeftMV: MotionValue<number> = useMotionValue(0)
  const nudgeMV: MotionValue<number> = useMotionValue(0)

  useLayoutEffect(() => {
    const container = containerRef.current
    const lEl = lRef.current
    const ightEl = ightRef.current
    if (!container || !lEl || !ightEl) return
    const measure = () => {
      const cRect = container.getBoundingClientRect()
      const lRect = lEl.getBoundingClientRect()
      const iRect = ightEl.getBoundingClientRect()

      naturalLeftMV.set(Math.max(0, iRect.left - cRect.left - lRect.width))

      const computed = window.getComputedStyle(lEl)
      const font = `900 ${computed.fontSize} ${computed.fontFamily}`
      // 'L' and 'N' must be the first letters of WORD_TOP and WORD_BOTTOM.
      const lInk = measureLeftInk('L', font)
      const nInk = measureLeftInk('N', font)
      nudgeMV.set(nInk - lInk)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(container)
    return () => ro.disconnect()
  }, [naturalLeftMV, nudgeMV])

  const lX = useTransform(
    [engageSmooth, naturalLeftMV, nudgeMV],
    ([e, natural, nudge]) => {
      const eN = e as number
      return `${(nudge as number) * (1 - eN) + (natural as number) * eN}px`
    },
  )

  const didIntro = useRef(false)
  useEffect(() => {
    if (didIntro.current) return
    if (reducedMotion) {
      didIntro.current = true
      return
    }
    didIntro.current = true
    let cancelled = false
    let closeTimer: ReturnType<typeof setTimeout> | null = null

    const startTimer = setTimeout(async () => {
      if (cancelled) return
      const opener = animate(engage, INTRO_PEAK, {
        duration: INTRO_DURATION_S,
        ease: [0.22, 1, 0.36, 1],
      })
      try {
        await opener
      } catch {
      }
      if (cancelled) return
      closeTimer = setTimeout(() => {
        if (cancelled) return
        animate(engage, 0, {
          duration: INTRO_DURATION_S,
          ease: [0.32, 0, 0.36, 1],
        })
      }, INTRO_HOLD_MS)
    }, INTRO_DELAY_MS)

    const cancel = () => {
      cancelled = true
      clearTimeout(startTimer)
      if (closeTimer) clearTimeout(closeTimer)
    }
    cancelTeaserRef.current = cancel
    return cancel
  }, [engage, reducedMotion])

  const touchOpenRef = useRef(false)

  const cancelTeaserRef = useRef<(() => void) | null>(null)

  const cancelTeaser = () => {
    cancelTeaserRef.current?.()
    cancelTeaserRef.current = null
  }

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    cancelTeaser()
    engage.set(1)
  }
  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    engage.set(0)
  }
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return
    cancelTeaser()
    touchOpenRef.current = !touchOpenRef.current
    engage.set(touchOpenRef.current ? 1 : 0)
  }

  const sharedTextStyle: React.CSSProperties = {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    fontWeight: 900,
    fontSize: 'clamp(3.5rem, 18vw, 11rem)',
    lineHeight: 0.92,
    letterSpacing: '-0.04em',
    color: 'inherit',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  }

  const TAIL = WORD_TOP.slice(1)

  return (
    <motion.div
      ref={rootRef}
      className="flex min-h-screen w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgColor, color: fgColor, touchAction: 'manipulation', cursor: 'pointer' }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
    >
      <div
        ref={containerRef}
        className="relative"
        aria-label={`${WORD_TOP} / ${WORD_BOTTOM}`}
      >
        <span aria-hidden style={{ ...sharedTextStyle, visibility: 'hidden' }}>
          {WORD_BOTTOM}
        </span>

        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            clipPath: topClip,
            WebkitClipPath: topClip,
            y: topY,
            willChange: 'transform, clip-path',
          }}
        >
          <motion.span
            ref={lRef}
            style={{
              ...sharedTextStyle,
              position: 'absolute',
              top: 0,
              left: 0,
              x: lX,
              willChange: 'transform',
            }}
          >
            {WORD_TOP.charAt(0)}
          </motion.span>

          <span
            ref={ightRef}
            style={{
              ...sharedTextStyle,
              position: 'absolute',
              top: 0,
              right: 0,
            }}
          >
            {TAIL}
          </span>
        </motion.div>

        <motion.span
          aria-hidden
          style={{
            ...sharedTextStyle,
            position: 'absolute',
            inset: 0,
            textAlign: 'right',
            clipPath: botClip,
            WebkitClipPath: botClip,
            y: botY,
            willChange: 'transform, clip-path',
          }}
        >
          {WORD_BOTTOM}
        </motion.span>
      </div>
    </motion.div>
  )
}
