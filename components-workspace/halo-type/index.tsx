'use client'

// npm install framer-motion

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'

const PHRASE = 'COPY ✦ PASTE ✦ SHIP ✦ REPEAT ✦ '

const TILT_REST = 24
const TILT_HOVER = 24
const SECONDS_PER_TURN = 14
const SPEED_HOVER = 0.3
const RADIUS_FRACTION = 0.35
const STAR_SCALE = 0.65

function getGlyphOpacities(rotation: number, angle: number) {
  const eff = ((rotation + angle) % 360 + 360) % 360
  const norm = eff > 180 ? eff - 360 : eff
  const c = Math.cos((norm * Math.PI) / 180)
  return { front: Math.max(c, 0), back: Math.max(-c, 0) }
}

function useTheme(ref: React.RefObject<HTMLElement | null>) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const read = () => {
      const scope = element.closest('[data-card-theme]') as HTMLElement | null
      if (scope) {
        setTheme(scope.dataset.cardTheme === 'dark' ? 'dark' : 'light')
        return
      }
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    }
    read()
    const observers: MutationObserver[] = []
    let current: HTMLElement | null = element
    while (current) {
      const o = new MutationObserver(read)
      o.observe(current, { attributes: true, attributeFilter: ['class', 'data-card-theme'] })
      observers.push(o)
      current = current.parentElement
    }
    return () => observers.forEach((o) => o.disconnect())
  }, [ref])
  return { theme }
}

export default function HaloType() {
  const rootRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme(rootRef)
  const isDark = theme === 'dark'

  const [size, setSize] = useState(480)
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      setSize(Math.max(260, Math.min(rect.width, rect.height)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const engagement = useMotionValue(0)
  const engagementSmooth = useSpring(engagement, {
    stiffness: 120,
    damping: 22,
    mass: 0.6,
  })

  const tilt = useTransform(engagementSmooth, [0, 1], [TILT_REST, TILT_HOVER])
  const speedMul = useTransform(engagementSmooth, [0, 1], [1, SPEED_HOVER])

  const rotateY = useMotionValue(0)
  const prevTs = useRef<number | null>(null)

  const frontRefs = useRef<Array<HTMLSpanElement | null>>([])
  const backRefs = useRef<Array<HTMLSpanElement | null>>([])

  const radius = size * RADIUS_FRACTION
  const fontSize = Math.max(20, Math.min(48, radius * 0.22))
  const circumference = 2 * Math.PI * radius

  const [phraseWidths, setPhraseWidths] = useState<number[]>([])
  const measureRef = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return
    const el = measureRef.current
    if (!el) return
    const measure = () => {
      const spans = el.querySelectorAll<HTMLSpanElement>('[data-m-char]')
      if (!spans.length) return
      const widths = Array.from(spans).map((s) => s.getBoundingClientRect().width)
      setPhraseWidths(widths)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    if (fonts?.ready) {
      fonts.ready.then(measure)
    }
    return () => ro.disconnect()
  }, [fontSize])

  const phraseWidth = phraseWidths.reduce((a, b) => a + b, 0)
  const repeats = phraseWidth > 0
    ? Math.max(1, Math.round(circumference / phraseWidth))
    : Math.max(1, Math.round(circumference / (PHRASE.length * fontSize * 0.55)))
  const characters = PHRASE.repeat(repeats).split('')
  const totalChars = characters.length
  const totalTiledWidth = phraseWidth * repeats
  const charAngles: number[] = []
  if (totalTiledWidth > 0) {
    let cum = 0
    characters.forEach((_, i) => {
      const w = phraseWidths[i % PHRASE.length] ?? 0
      charAngles.push(((cum + w / 2) / totalTiledWidth) * 360)
      cum += w
    })
  } else {
    for (let i = 0; i < totalChars; i++) {
      charAngles.push((i / totalChars) * 360)
    }
  }

  useAnimationFrame((t) => {
    if (reducedMotion) {
      rotateY.set(30)
    } else {
      const last = prevTs.current
      prevTs.current = t
      if (last != null) {
        const dt = (t - last) / 1000
        const degPerSec = 360 / SECONDS_PER_TURN
        const next = rotateY.get() + degPerSec * speedMul.get() * dt
        rotateY.set(next % 360)
      }
    }
    const ry = rotateY.get()
    for (let i = 0; i < charAngles.length; i++) {
      const { front, back } = getGlyphOpacities(ry, charAngles[i])
      const fe = frontRefs.current[i]
      const be = backRefs.current[i]
      if (fe) fe.style.opacity = String(front)
      if (be) be.style.opacity = String(back)
    }
  })

  const bg = isDark ? '#0A0A0A' : '#F5F1E8'
  const fg = isDark ? '#F5F1E8' : '#0A0A0A'
  const fgBack = isDark ? '#7A756C' : '#6A655C'
  const vignette = isDark
    ? `radial-gradient(60% ${size * 0.6}px at 50% 52%, rgba(245,241,232,0.10) 0%, rgba(245,241,232,0.04) 35%, rgba(10,10,10,0) 70%)`
    : `radial-gradient(60% ${size * 0.6}px at 50% 52%, rgba(10,10,10,0.08) 0%, rgba(10,10,10,0.03) 35%, rgba(245,241,232,0) 70%)`

  const handleEngage = () => engagement.set(1)
  const handleRelease = () => engagement.set(0)

  const ringTransform = useTransform(
    [tilt, rotateY],
    ([x, y]) => `rotateX(${x}deg) rotateY(${y}deg)`,
  )

  const edgeMask =
    'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)'

  return (
    <div
      ref={rootRef}
      // No items-center: the wrapper must stretch to this height or the ring stops growing.
      className="flex min-h-screen w-full justify-center"
      style={{ backgroundColor: bg }}
    >
      <div
        ref={wrapRef}
        className="relative flex w-full items-center justify-center overflow-hidden"
        style={{
          maskImage: edgeMask,
          WebkitMaskImage: edgeMask,
        }}
        onPointerEnter={handleEngage}
        onPointerLeave={handleRelease}
        onPointerDown={handleEngage}
        onPointerUp={handleRelease}
        onPointerCancel={handleRelease}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: vignette,
            pointerEvents: 'none',
          }}
        />

        {/* Keep visibility hidden (not display:none) and text styles equal to glyphStyle below. */}
        <span
          ref={measureRef}
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
            whiteSpace: 'pre',
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.01em',
          }}
        >
          {PHRASE.split('').map((ch, i) => (
            <span
              key={i}
              data-m-char=""
              style={{
                display: 'inline-block',
                whiteSpace: 'pre',
                fontSize: ch === '✦' ? fontSize * STAR_SCALE : fontSize,
              }}
            >
              {ch}
            </span>
          ))}
        </span>

        <div
          style={{
            perspective: '1200px',
            perspectiveOrigin: '50% 50%',
            width: size,
            height: size,
            position: 'relative',
          }}
        >
          <motion.div
            aria-label={PHRASE.trim()}
            style={{
              position: 'absolute',
              inset: 0,
              transformStyle: 'preserve-3d',
              transform: ringTransform,
              willChange: 'transform',
            }}
          >
            {characters.map((ch, i) => {
              const angle = charAngles[i] ?? (i / totalChars) * 360
              const opacity = getGlyphOpacities(rotateY.get(), angle)
              const display = ch === ' ' ? ' ' : ch
              const base = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`
              const glyphSize = ch === '✦' ? fontSize * STAR_SCALE : fontSize
              const glyphStyle: React.CSSProperties = {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transformOrigin: '50% 50%',
                fontFamily:
                  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
                fontWeight: 800,
                fontSize: glyphSize,
                lineHeight: 1,
                letterSpacing: '-0.01em',
                userSelect: 'none',
                whiteSpace: 'pre',
              }
              return (
                <React.Fragment key={i}>
                  <span
                    ref={(el) => {
                      frontRefs.current[i] = el
                    }}
                    style={{
                      ...glyphStyle,
                      transform: base,
                      color: fg,
                      opacity: opacity.front,
                    }}
                  >
                    {display}
                  </span>
                  <span
                    ref={(el) => {
                      backRefs.current[i] = el
                    }}
                    style={{
                      ...glyphStyle,
                      transform: `${base} rotateY(180deg) rotateZ(180deg)`,
                      color: fgBack,
                      opacity: opacity.back,
                    }}
                  >
                    {display}
                  </span>
                </React.Fragment>
              )
            })}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
