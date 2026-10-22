'use client'

// npm install framer-motion

import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const STRIPE_TEXT = 'WORK IN PROGRESS \u00A0\u2715\u00A0 DO NOT CLICK OR HOVER \u00A0\u2715\u00A0 DANGER'

const STRIPES = [
  { rotate: -20, top: '40%', bg: '#0a0a0a', fg: '#ffffff' },
  { rotate: 12, top: '47%', bg: '#ffffff', fg: '#0a0a0a' },
  { rotate: -8, top: '54%', bg: '#2a2a2a', fg: '#ffffff' },
]

const ACCENT_COLOR = '#FF6B1A'

function RepeatingText({ color }: { color: string }) {
  return (
    <div className="flex items-center whitespace-nowrap text-sm font-black tracking-widest uppercase sm:text-base">
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} style={{ color }}>
          {STRIPE_TEXT.split('\u2715').map((chunk, j, arr) => (
            <span key={j}>
              {chunk}
              {j < arr.length - 1 && (
                <span style={{ color: ACCENT_COLOR, fontSize: '1.4em' }}>{'\u2715'}</span>
              )}
            </span>
          ))}
          {'\u00A0'}
          <span style={{ color: ACCENT_COLOR, fontSize: '1.4em' }}>{'\u2715'}</span>
          {'\u00A0 '}
        </span>
      ))}
    </div>
  )
}

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export default function DangerStripes() {
  const rafRef = useRef<number>(0)
  const hoveringRef = useRef(false)
  const clickedRef = useRef(false)
  const intensityRef = useRef(0)
  const stripesRef = useRef<(HTMLDivElement | null)[]>([])

  const animateStripes = useCallback(() => {
    if (hoveringRef.current || clickedRef.current) {
      const target = clickedRef.current ? 3 : 1
      intensityRef.current += (target - intensityRef.current) * 0.15
    } else {
      intensityRef.current *= 0.92
    }

    if (intensityRef.current < 0.005 && !hoveringRef.current && !clickedRef.current) {
      intensityRef.current = 0
      stripesRef.current.forEach((el, idx) => {
        if (el) el.style.transform = `rotate(${STRIPES[idx].rotate}deg)`
      })
      rafRef.current = 0
      return
    }

    const intensity = intensityRef.current

    stripesRef.current.forEach((el, idx) => {
      if (!el) return
      const base = STRIPES[idx].rotate
      const tx = random(-18, 18) * intensity
      const ty = random(-10, 10) * intensity
      const skewX = random(-6, 6) * intensity
      const sc = 1 + random(-0.04, 0.04) * intensity
      el.style.transform = `rotate(${base}deg) translate(${tx}px, ${ty}px) skewX(${skewX}deg) scale(${sc})`
    })

    rafRef.current = requestAnimationFrame(animateStripes)
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const startLoop = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(animateStripes)
  }, [animateStripes])

  const triggerHover = useCallback(() => {
    hoveringRef.current = true
    startLoop()
  }, [startLoop])

  const triggerClick = useCallback(() => {
    clickedRef.current = true
    startLoop()
    setTimeout(() => {
      clickedRef.current = false
    }, 500)
  }, [startLoop])

  const triggerLeave = useCallback(() => {
    hoveringRef.current = false
  }, [])

  return (
    <div className="flex min-h-screen w-full items-stretch justify-center bg-[#FF6B1A]">
      <div className="relative w-full overflow-hidden select-none">
        {STRIPES.map((stripe, i) => (
          <motion.div
            key={i}
            ref={(el) => { stripesRef.current[i] = el }}
            className="absolute left-[-40%] flex h-[60px] w-[180%] items-center overflow-hidden sm:h-[72px]"
            style={{
              top: stripe.top,
              background: stripe.bg,
              boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 8px rgba(0,0,0,0.3)',
              willChange: 'transform',
              cursor: 'pointer',
            }}
            initial={{ x: i % 2 === 0 ? -300 : 300, opacity: 0, rotate: stripe.rotate }}
            animate={{ x: 0, opacity: 1, rotate: stripe.rotate }}
            transition={{
              duration: 0.6,
              delay: i * 0.12,
              ease: 'easeOut',
            }}
            onMouseEnter={triggerHover}
            onMouseLeave={triggerLeave}
            onClick={triggerClick}
            onTouchStart={triggerHover}
            onTouchEnd={() => {
              triggerClick()
              setTimeout(triggerLeave, 600)
            }}
          >
            <RepeatingText color={stripe.fg} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
