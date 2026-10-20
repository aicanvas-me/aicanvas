'use client'

// npm install framer-motion

import { useState, useRef, useCallback, useLayoutEffect, useEffect } from 'react'
import { motion } from 'framer-motion'
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect



const LABEL = 'INITIALIZE'
const GLITCH_CHARS = '@#$%&!*^~<>?+='
const SCRAMBLE_DURATION = 700
const SCRAMBLE_INTERVAL = 40

const DARK = {
  text: '#00ff41',
  textDim: 'rgba(0, 255, 65, 0.6)',
  glow: 'rgba(0, 255, 65, 0.15)',
  borderDefault: '#2E2A24',
}

const LIGHT = {
  text: '#2a6b0a',
  textDim: 'rgba(42, 107, 10, 0.7)',
  glow: 'rgba(42, 107, 10, 0.12)',
  borderDefault: '#DDD8CE',
}

function getRandomChar(): string {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
}

export default function GlitchButton() {
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
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = el.closest('[data-card-theme]')
    if (cardWrapper) observer.observe(cardWrapper, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const colors = isDark ? DARK : LIGHT

  const [displayText, setDisplayText] = useState(LABEL)
  const [isHovered, setIsHovered] = useState(false)
  const rafRef = useRef<number>(0)
  const isHoveredRef = useRef(false)
  const startTimeRef = useRef(0)
  const lastUpdateRef = useRef(0)

  const cleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [])

  useEffect(() => {
    return () => { cleanup() }
  }, [cleanup])

  const scrambleTick = useCallback((timestamp: number) => {
    if (!isHoveredRef.current) return

    const elapsed = timestamp - startTimeRef.current
    const resolvePerChar = SCRAMBLE_DURATION / LABEL.length

    if (timestamp - lastUpdateRef.current < SCRAMBLE_INTERVAL) {
      rafRef.current = requestAnimationFrame(scrambleTick)
      return
    }
    lastUpdateRef.current = timestamp

    const resolvedCount = Math.min(
      Math.floor(elapsed / resolvePerChar),
      LABEL.length
    )

    if (resolvedCount >= LABEL.length) {
      setDisplayText(LABEL)
      return
    }

    const chars: string[] = []
    for (let i = 0; i < LABEL.length; i++) {
      chars.push(i < resolvedCount ? LABEL[i] : getRandomChar())
    }
    setDisplayText(chars.join(''))

    rafRef.current = requestAnimationFrame(scrambleTick)
  }, [])

  function handleMouseEnter() {
    isHoveredRef.current = true
    setIsHovered(true)
    startTimeRef.current = performance.now()
    lastUpdateRef.current = 0
    cleanup()
    rafRef.current = requestAnimationFrame(scrambleTick)
  }

  function handleMouseLeave() {
    isHoveredRef.current = false
    setIsHovered(false)
    cleanup()
    setDisplayText(LABEL)
  }

  return (
    <div ref={containerRef} className="flex h-full w-full items-center justify-center" style={{ background: isDark ? '#110F0C' : '#F5F1EA' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative cursor-pointer px-8 py-4 font-mono text-lg font-semibold tracking-widest"
          style={{
            background: isDark ? '#110F0C' : '#F5F1EA',
            color: colors.text,
            boxShadow: isHovered
              ? `0 0 20px ${colors.glow}, inset 0 0 12px ${colors.glow}`
              : 'none',
            transition: 'box-shadow 0.3s',
          }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
            <span
              key={corner}
              className="pointer-events-none absolute"
              style={{
                width: 10,
                height: 10,
                top: corner.startsWith('t') ? 0 : 'auto',
                bottom: corner.startsWith('b') ? 0 : 'auto',
                left: corner.endsWith('l') ? 0 : 'auto',
                right: corner.endsWith('r') ? 0 : 'auto',
                borderColor: isHovered ? colors.textDim : colors.borderDefault,
                borderTopWidth: corner.startsWith('t') ? 1.5 : 0,
                borderBottomWidth: corner.startsWith('b') ? 1.5 : 0,
                borderLeftWidth: corner.endsWith('l') ? 1.5 : 0,
                borderRightWidth: corner.endsWith('r') ? 1.5 : 0,
                borderStyle: 'solid',
                transition: 'border-color 0.3s',
              }}
            />
          ))}

          <span className="relative z-10">{displayText}</span>
        </motion.button>
      </motion.div>
    </div>
  )
}
