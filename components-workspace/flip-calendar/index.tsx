'use client'

// npm install framer-motion

import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect


const FLIP_MS = 220

function fmt(n: number) { return String(n).padStart(2, '0') }

export default function FlipCalendar() {
  const [topDisplay,    setTopDisplay   ] = useState(1)
  const [bottomDisplay, setBottomDisplay] = useState(1)
  const [flapContent,   setFlapContent  ] = useState(1)
  const [flapVisible,   setFlapVisible  ] = useState(false)
  const [flapping,      setFlapping     ] = useState(false)
  const currentRef = useRef(1)
  const rootRef    = useRef<HTMLDivElement>(null)
  const [isDark, setIsDark] = useState(() => typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false)

  const rotateX     = useMotionValue(0)
  const scanY       = useMotionValue(18)
  const scanYPct    = useTransform(scanY, (v) => `${v}%`)

  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)

  const aliveRef = useRef(true)
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  useIsomorphicLayoutEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
      timeouts.current.forEach(clearTimeout)
    }
  }, [])

  useIsomorphicLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const check = () => {
      const card = el.closest('[data-card-theme]')
      setIsDark(card ? card.classList.contains('dark') : document.documentElement.classList.contains('dark'))
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = el.closest('[data-card-theme]')
    if (cardWrapper) observer.observe(cardWrapper, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  function sched(fn: () => void, ms: number) {
    const id = setTimeout(() => { if (aliveRef.current) fn() }, ms)
    timeouts.current.push(id)
  }

  function runFlip(
    target: number,
    durationMs: number,
    dir: 'next' | 'prev',
    onDone?: () => void,
  ) {
    const prev = currentRef.current
    currentRef.current = target
    setFlapContent(prev)
    setFlapVisible(true)

    if (dir === 'next') {
      scanY.set(18)
      animate(scanY, 104, { duration: (durationMs * 2) / 1000, ease: 'linear' })
    } else {
      scanY.set(104)
      animate(scanY, 18, { duration: (durationMs * 2) / 1000, ease: 'linear' })
    }

    rotateX.set(0)
    animate(rotateX, -90, { duration: durationMs / 1000, ease: 'easeIn' })

    sched(() => {
      setTopDisplay(target)
      setBottomDisplay(target)
      setFlapContent(target)
      rotateX.set(90)
      animate(rotateX, 0, { duration: durationMs / 1000, ease: 'easeOut' })
    }, durationMs)

    sched(() => {
      setFlapVisible(false)
      onDone?.()
    }, durationMs * 2 + 20)
  }

  function flip(dir: 'next' | 'prev') {
    if (flapping) return
    const cur = currentRef.current
    const target = dir === 'next' ? (cur === 31 ? 1 : cur + 1) : (cur === 1 ? 31 : cur - 1)
    setFlapping(true)
    runFlip(target, FLIP_MS, dir, () => setFlapping(false))
  }

  function onDragEnd(_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (Math.abs(info.offset.y) < 40 && Math.abs(info.velocity.y) < 300) return
    flip(info.offset.y > 0 || info.velocity.y > 300 ? 'next' : 'prev')
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (flapping) return
    const r = e.currentTarget.getBoundingClientRect()
    const cx = (e.clientX - r.left) / r.width - 0.5
    const cy = (e.clientY - r.top) / r.height - 0.5
    animate(tiltX, cy * -11, { duration: 0.12, ease: 'linear' })
    animate(tiltY, cx *  11, { duration: 0.12, ease: 'linear' })
  }

  function handleMouseLeave() {
    animate(tiltX, 0, { type: 'spring', stiffness: 160, damping: 18 })
    animate(tiltY, 0, { type: 'spring', stiffness: 160, damping: 18 })
  }

  const topGrad = isDark
    ? 'linear-gradient(155deg, #3572cc 0%, #2d62bc 55%, #2455a0 100%)'
    : 'linear-gradient(155deg, #4e9aec 0%, #3d88da 55%, #3078c8 100%)'

  const flapGrad = isDark
    ? 'linear-gradient(155deg, #2d64bc 0%, #2556ac 55%, #1e4894 100%)'
    : 'linear-gradient(155deg, #4290de 0%, #3480cc 55%, #2870bc 100%)'

  const bottomGrad = isDark
    ? 'linear-gradient(155deg, #4a8edc 0%, #5a9eec 55%, #68aef4 100%)'
    : 'linear-gradient(155deg, #5aaaee 0%, #6abaf8 55%, #76c4fc 100%)'

  const headerGrad = isDark
    ? 'linear-gradient(180deg, #2a2724 0%, #1e1c19 100%)'
    : 'linear-gradient(180deg, #d8d4ce 0%, #c6c2bc 100%)'

  const ringGrad = isDark
    ? 'radial-gradient(circle at 35% 30%, #f4f0ea 0%, #c0bcb6 45%, #888480 100%)'
    : 'radial-gradient(circle at 35% 30%, #ffffff 0%, #dedad4 45%, #aeaaa4 100%)'

  const cardShadow = isDark
    ? '0 40px 100px rgba(20,55,155,0.65), 0 12px 32px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07)'
    : '0 40px 100px rgba(40,100,220,0.32), 0 12px 32px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.9)'

  const seam        = isDark ? 'rgba(0,0,0,0.42)' : 'rgba(0,0,0,0.22)'
  const numShadow   = isDark
    ? '0 4px 24px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)'
    : '0 4px 24px rgba(0,0,0,0.3),  0 2px 8px rgba(0,0,0,0.22)'

  return (
    <div ref={rootRef} className="flex h-full w-full flex-col items-center justify-center gap-6" style={{ background: isDark ? '#110F0C' : '#F5F1EA' }}>

      <div
        style={{ perspective: '900px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.08}
          onDragEnd={onDragEnd}
          className="relative cursor-grab active:cursor-grabbing select-none"
          style={{
            width: 'min(260px, 56vw)',
            aspectRatio: '1 / 1',
            rotate: '3deg',
            rotateX: tiltX,
            rotateY: tiltY,
          }}
        >

          {[13, 8, 4].map((y, i) => (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                background: isDark ? '#2E2A24' : '#C8C2B8',
                transform: `translateY(${y}px)`,
                opacity: 0.28 + i * 0.2,
                zIndex: 0,
                borderRadius: 18,
                boxShadow: `0 ${y * 2}px ${y * 4}px rgba(0,0,0,0.35)`,
              }}
            />
          ))}

          <div
            className="absolute inset-0 overflow-hidden"
            style={{ zIndex: 1, boxShadow: cardShadow, borderRadius: 18 }}
          >

            <div
              className="absolute inset-x-0 top-0 flex items-end justify-center gap-8"
              style={{
                height: '18%',
                background: headerGrad,
                zIndex: 12,
                borderRadius: '18px 18px 0 0',
                borderLeft:  '1.5px solid rgba(0,0,0,0.14)',
                borderRight: '1.5px solid rgba(0,0,0,0.14)',
                paddingBottom: 7,
              }}
            >
              {[0, 1].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 15, height: 15, borderRadius: '50%',
                    background: ringGrad,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.6)',
                  }}
                />
              ))}
            </div>

            <div
              className="absolute inset-x-0 bottom-0 overflow-hidden"
              style={{ top: '59%', background: bottomGrad }}
            >
              <Half n={bottomDisplay} half="bottom" numShadow={numShadow} />
            </div>

            <div
              className="absolute inset-x-0 overflow-hidden"
              style={{
                top: '18%', bottom: '41%',
                background: topGrad,
                borderRadius: '12px 12px 0 0',
              }}
            >
              <Half n={topDisplay} half="top" numShadow={numShadow} />
            </div>

            {flapVisible && (
              <div
                className="absolute inset-x-0"
                style={{ top: '18%', height: '41%', zIndex: 8 }}
              >
                <motion.div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    background: flapGrad,
                    rotateX,
                    perspective: 140,
                    transformOrigin: 'center bottom',
                    willChange: 'transform',
                    borderRadius: '12px 12px 0 0',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)',
                  }}
                >
                  <Half n={flapContent} half="top" numShadow={numShadow} />
                </motion.div>

                <div
                  className="absolute inset-x-0 bottom-0 pointer-events-none"
                  style={{
                    height: 3,
                    background: 'rgba(255,255,255,0.25)',
                    zIndex: 9,
                    boxShadow: '0 0 8px rgba(255,255,255,0.18)',
                  }}
                />
              </div>
            )}

            {flapVisible && (
              <motion.div
                className="absolute inset-x-0 pointer-events-none"
                style={{
                  top: scanYPct,
                  height: 2,
                  borderRadius: '9999px',
                  background: '#ffffff',
                  opacity: 0.3,
                  zIndex: 20,
                }}
              />
            )}

            <div
              className="absolute inset-x-0 pointer-events-none"
              style={{
                top: 'calc(59% - 3px)', height: 6,
                background: seam, zIndex: 10,
              }}
            />

            <div
              className="absolute inset-x-0 pointer-events-none"
              style={{
                top: 'calc(18% - 1px)', height: 1,
                background: 'rgba(0,0,0,0.22)', zIndex: 11,
              }}
            />

            <div
              className="absolute inset-x-0 pointer-events-none"
              style={{
                top: '18%', height: '30%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, transparent 100%)',
                borderRadius: '12px 12px 0 0',
                zIndex: 6,
              }}
            />
          </div>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="font-mono text-xs tracking-widest"
        style={{ color: isDark ? '#3a3530' : '#C8C2B8' }}
      >
        ↑ swipe ↓
      </motion.p>
    </div>
  )
}


interface HalfProps {
  n: number
  half: 'top' | 'bottom'
  numShadow: string
}

function Half({ n, half, numShadow }: HalfProps) {
  return (
    <div
      className="absolute inset-x-0 flex items-center justify-center"
      style={{
        height: '200%',
        top:    half === 'top'    ? 0         : undefined,
        bottom: half === 'bottom' ? 0         : undefined,
      }}
    >
      <span
        className="font-sans font-bold select-none tabular-nums"
        style={{
          fontSize: 'clamp(3.8rem, 13vw, 6.5rem)',
          color: '#ffffff',
          lineHeight: 1,
          letterSpacing: '-0.03em',
          textShadow: numShadow,
        }}
      >
        {fmt(n)}
      </span>
    </div>
  )
}
