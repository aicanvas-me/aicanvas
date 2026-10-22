'use client'

// npm install framer-motion

import { useRef, useState, useCallback, useLayoutEffect, useEffect } from 'react'
import { motion } from 'framer-motion'
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect




const SLIDES = [
  {
    id: 0,
    num: '01',
    label: 'Opportunity',
    title: 'Define the\nProblem Space',
    accent: '#E55A2B',
    bg: '#111111',
    textPrimary: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.35)',
    shape: 'circle',
  },
  {
    id: 1,
    num: '02',
    label: 'Strategy',
    title: 'Discover\nDirection',
    accent: '#E55A2B',
    bg: '#F0EDEA',
    textPrimary: '#111111',
    textMuted: 'rgba(0,0,0,0.35)',
    shape: 'square',
  },
  {
    id: 2,
    num: '03',
    label: 'Execution',
    title: 'Design &\nDeliver',
    accent: '#111111',
    bg: '#E55A2B',
    textPrimary: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.5)',
    shape: 'line',
  },
  {
    id: 3,
    num: '04',
    label: 'Metrics',
    title: 'Measure\nImpact',
    accent: '#E55A2B',
    bg: '#2A2A2A',
    textPrimary: '#F0EDEA',
    textMuted: 'rgba(240,237,234,0.4)',
    shape: 'triangle',
  },
]

const CARD_W = 260
const CARD_H = 300


const STACK = [
  { x: 0, y: 0,  scale: 1.000, opacity: 1 },
  { x: 0, y: 11, scale: 0.962, opacity: 1 },
  { x: 0, y: 20, scale: 0.926, opacity: 1 },
]

const OFFSCREEN = { x: 0, y: 30, scale: 0.88, opacity: 0 }



export default function SlideDeck() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDark, setIsDark] = useState(() => typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false)

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const check = () => {
      const card = el.closest('[data-card-theme]')
      setIsDark(card ? card.classList.contains('dark') : document.documentElement.classList.contains('dark'))
    }
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = el.closest('[data-card-theme]')
    if (cardWrapper) obs.observe(cardWrapper, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [exitInfo, setExitInfo] = useState<{ slideId: number; xTarget: number } | null>(null)
  const [enterFromRight, setEnterFromRight] = useState<number | null>(null)

  const goTo = useCallback((newIdx: number, dir: 1 | -1) => {
    if (dir > 0) {
      setExitInfo({ slideId: SLIDES[current].id, xTarget: -380 })
      setEnterFromRight(null)
    } else {
      setExitInfo(null)
      setEnterFromRight(SLIDES[newIdx].id)
    }
    setDirection(dir)
    setCurrent(newIdx)
  }, [current])

  const navigate = useCallback((dir: 1 | -1) => {
    goTo((current + dir + SLIDES.length) % SLIDES.length, dir)
  }, [current, goTo])

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full flex-col items-center justify-center bg-[#E8E8DF] dark:bg-[#1A1A19]"
      style={{ isolation: 'isolate' }}
    >
      <div
        style={{
          position: 'relative',
          width: CARD_W,
          height: CARD_H,
          overflow: 'visible',
        }}
      >
        {SLIDES.map(slide => {
          const offset = (slide.id - current + SLIDES.length) % SLIDES.length

          const isExiting = exitInfo?.slideId === slide.id && offset === SLIDES.length - 1

          const isEnteringFromRight = enterFromRight === slide.id && offset === 0

          const animTarget = isExiting
            ? { x: exitInfo!.xTarget, y: 0, scale: 0.88, opacity: 0 }
            : offset <= 2
              ? STACK[offset]
              : OFFSCREEN

          const zIndex = isEnteringFromRight ? 20
            : isExiting ? 15
            : offset === 0 ? 10
            : offset === 1 ? 6
            : offset === 2 ? 2
            : 0

          return (
            <motion.div
              key={isEnteringFromRight ? `${slide.id}-right` : slide.id}
              initial={isEnteringFromRight ? { x: 380, opacity: 0, scale: 0.88, y: 0 } : false}
              animate={animTarget}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onAnimationComplete={() => {
                setExitInfo(prev => prev?.slideId === slide.id ? null : prev)
                setEnterFromRight(prev => prev === slide.id ? null : prev)
              }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 20,
                background: slide.bg,
                overflow: 'hidden',
                zIndex,
                cursor: offset === 0 ? 'grab' : 'default',
                boxShadow: offset === 0
                  ? (isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 12px 40px rgba(0,0,0,0.18)')
                  : 'none',
                pointerEvents: offset === 0 ? 'auto' : 'none',
              }}
              drag={offset === 0 ? 'x' : false}
              dragConstraints={offset === 0 ? { left: 0, right: 0 } : undefined}
              dragElastic={offset === 0 ? 0.5 : undefined}
              onDragEnd={offset === 0 ? (_, info) => {
                if (info.offset.x < -60 || info.velocity.x < -400) navigate(1)
                else if (info.offset.x > 60 || info.velocity.x > 400) navigate(-1)
              } : undefined}
            >
              <ShapeDecor type={slide.shape} accent={slide.accent} primary={slide.textPrimary} />

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  padding: '24px 28px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: slide.textMuted,
                    }}
                  >
                    {slide.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: slide.textMuted,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {slide.num} / 04
                  </span>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 88,
                      fontWeight: 900,
                      lineHeight: 0.85,
                      color: slide.accent,
                      letterSpacing: '-0.05em',
                      marginBottom: 16,
                      fontVariantNumeric: 'tabular-nums',
                      userSelect: 'none',
                    }}
                  >
                    {slide.num}
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      lineHeight: 1.15,
                      color: slide.textPrimary,
                      letterSpacing: '-0.03em',
                      whiteSpace: 'pre-line',
                      userSelect: 'none',
                    }}
                  >
                    {slide.title}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 32 }}>
        {SLIDES.map((s, i) => (
          <motion.button
            key={s.id}
            onClick={() => { if (i !== current) goTo(i, i > current ? 1 : -1) }}
            style={{
              height: 6,
              borderRadius: 3,
              background: i === current ? '#E55A2B' : (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)'),
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            animate={{ width: i === current ? 24 : 6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}



function ShapeDecor({
  type,
  accent,
  primary,
}: {
  type: string
  accent: string
  primary: string
}) {
  if (type === 'circle') {
    return (
      <div
        style={{
          position: 'absolute',
          right: -32,
          top: -32,
          width: 128,
          height: 128,
          borderRadius: '50%',
          border: `2px solid ${accent}`,
          opacity: 0.15,
        }}
      />
    )
  }
  if (type === 'square') {
    return (
      <div
        style={{
          position: 'absolute',
          right: 20,
          top: 30,
          width: 60,
          height: 60,
          border: `2px solid ${accent}`,
          transform: 'rotate(15deg)',
          opacity: 0.25,
        }}
      />
    )
  }
  if (type === 'line') {
    return (
      <>
        <div
          style={{
            position: 'absolute',
            right: 28,
            top: 0,
            bottom: 0,
            width: 2,
            background: primary,
            opacity: 0.1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 38,
            top: 0,
            bottom: 0,
            width: 1,
            background: primary,
            opacity: 0.06,
          }}
        />
      </>
    )
  }
  if (type === 'triangle') {
    return (
      <svg
        style={{
          position: 'absolute',
          right: -24,
          top: -18,
          width: 126,
          height: 112,
          opacity: 0.2,
        }}
        viewBox="0 0 180 160"
        fill="none"
      >
        <polygon
          points="90,12 172,148 8,148"
          stroke={primary}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return null
}
