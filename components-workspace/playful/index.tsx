'use client'

// npm install framer-motion next
// font: Science Gothic

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Science_Gothic } from 'next/font/google'

const scienceGothic = Science_Gothic({ subsets: ['latin'] })

function useTheme(ref: React.RefObject<HTMLElement | null>) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const readTheme = () => {
      const cardScope = element.closest('[data-card-theme]') as HTMLElement | null
      if (cardScope) {
        setTheme(cardScope.dataset.cardTheme === 'dark' ? 'dark' : 'light')
        return
      }
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    }
    readTheme()

    const observers: MutationObserver[] = []
    let current: HTMLElement | null = element
    while (current) {
      const observer = new MutationObserver(readTheme)
      observer.observe(current, { attributes: true, attributeFilter: ['class', 'data-card-theme'] })
      observers.push(observer)
      current = current.parentElement
    }

    return () => observers.forEach((o) => o.disconnect())
  }, [ref])

  return { theme }
}

interface LetterSpanProps {
  letter: string
  textColor: string
  fontFamily: string
  textShadow: string
  forwardedRef: React.Ref<HTMLSpanElement>
}

const LetterSpanComponent = ({ letter, textColor, fontFamily, textShadow, forwardedRef }: LetterSpanProps) => {
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (forwardedRef) {
      if (typeof forwardedRef === 'function') {
        forwardedRef(spanRef.current)
      } else {
        forwardedRef.current = spanRef.current
      }
    }
  }, [forwardedRef])

  return (
    <span
      ref={spanRef}
      className={`inline-block select-none ${textColor}`}
      style={{
        fontSize: 'clamp(1.6rem, 16vw, 9.6rem)',
        fontWeight: 700,
        fontFamily,
        lineHeight: 1,
        textShadow,
        transform:
          'translateY(var(--translate-y, 0px)) rotate(var(--rotate, 0deg)) scale(var(--scale, 1))',
        transformOrigin: 'center',
        willChange: 'transform',
      }}
    >
      {letter}
    </span>
  )
}

const LetterSpan = motion(LetterSpanComponent)


const TEXT_ROW_1 = 'STAY'
const TEXT_ROW_2 = 'WEIRD'
const ALL_LETTERS = TEXT_ROW_1 + TEXT_ROW_2
const INFLUENCE_RADIUS = 600
const MAX_ROTATION = 75
const MAX_TRANSLATE_Y = 100
const MAX_SCALE = 1.4
const MIN_SCALE = 1
const EASE_ACTIVE = 0.15
const EASE_EXIT = 0.05

export default function Playful() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme(containerRef)
  const isDark = theme === 'dark'
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([])
  const mouseRef = useRef<{ x: number; y: number } | null>(null)
  const animIdRef = useRef<number>(0)
  const aliveRef = useRef(true)

  const stateRef = useRef<
    Array<{
      rotate: number
      translateY: number
      scale: number
    }>
  >([])

  useEffect(() => {
    aliveRef.current = true
    const container = containerRef.current
    if (!container) return

    ALL_LETTERS.split('').forEach((_, i) => {
      if (!stateRef.current[i]) {
        stateRef.current[i] = {
          rotate: 0,
          translateY: 0,
          scale: MIN_SCALE,
        }
      }
    })

    function animate() {
      if (!aliveRef.current) return

      const mx = mouseRef.current?.x ?? -99999
      const my = mouseRef.current?.y ?? -99999
      const isExiting = !mouseRef.current

      ALL_LETTERS.split('').forEach((_, i) => {
        const letterEl = lettersRef.current[i]
        if (!letterEl) return

        const rect = letterEl.getBoundingClientRect()
        const letterCenterX = rect.left + rect.width / 2
        const letterCenterY = rect.top + rect.height / 2

        const dx = letterCenterX - mx
        const dy = letterCenterY - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        let influence = 0
        if (dist < INFLUENCE_RADIUS) {
          influence = 1 - dist / INFLUENCE_RADIUS
          influence = influence * influence * (3 - 2 * influence)
        }

        let targetRotate = 0
        if (influence > 0) {
          const angle = Math.atan2(dy, dx)
          const rotateDirection = Math.sin(angle)
          targetRotate = MAX_ROTATION * influence * rotateDirection
        }

        const direction = i % 2 === 0 ? -1 : 1
        const targetTranslateY = MAX_TRANSLATE_Y * influence * direction

        const targetScale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * influence

        const state = stateRef.current[i]
        const easing = isExiting ? EASE_EXIT : EASE_ACTIVE

        state.rotate += (targetRotate - state.rotate) * easing
        state.translateY += (targetTranslateY - state.translateY) * easing
        state.scale += (targetScale - state.scale) * easing

        letterEl.style.setProperty('--rotate', `${state.rotate.toFixed(2)}deg`)
        letterEl.style.setProperty('--translate-y', `${state.translateY.toFixed(2)}px`)
        letterEl.style.setProperty('--scale', state.scale.toFixed(3))
      })

      animIdRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      aliveRef.current = false
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current)
    }
  }, [])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    mouseRef.current = { x: e.clientX, y: e.clientY }
  }

  function handleMouseLeave() {
    mouseRef.current = null
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0]
    if (touch) mouseRef.current = { x: touch.clientX, y: touch.clientY }
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0]
    if (touch) mouseRef.current = { x: touch.clientX, y: touch.clientY }
  }

  function handleTouchEnd() {
    setTimeout(() => {
      mouseRef.current = null
    }, 600)
  }

  const bgColor = isDark ? '#1A1A19' : '#869631'
  const textColor = isDark ? 'text-[#869631]' : 'text-[#1A1A19]'
  const textShadow = isDark
    ? '2px 2px 0 rgba(0, 0, 0, 0.85)'
    : '2px 2px 0 rgba(0, 0, 0, 0.25)'

  return (
    <div
      ref={containerRef}
      className={`flex min-h-screen w-full flex-col items-center justify-center px-6 sm:px-10 ${scienceGothic.className}`}
      style={{ backgroundColor: bgColor }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex flex-col items-center justify-center gap-2 sm:gap-4">
        <div className="flex flex-nowrap items-center justify-center gap-1 sm:gap-2">
          {TEXT_ROW_1.split('').map((letter, i) => (
            <LetterSpan
              key={i}
              letter={letter}
              forwardedRef={(el) => {
                if (el) lettersRef.current[i] = el
              }}
              textColor={textColor}
              textShadow={textShadow}
              fontFamily={scienceGothic.style.fontFamily}
            />
          ))}
        </div>
        <div className="flex flex-nowrap items-center justify-center gap-1 sm:gap-2">
          {TEXT_ROW_2.split('').map((letter, i) => (
            <LetterSpan
              key={i + TEXT_ROW_1.length}
              letter={letter}
              forwardedRef={(el) => {
                if (el) lettersRef.current[i + TEXT_ROW_1.length] = el
              }}
              textColor={textColor}
              textShadow={textShadow}
              fontFamily={scienceGothic.style.fontFamily}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
