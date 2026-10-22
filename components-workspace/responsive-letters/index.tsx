'use client'

// npm install framer-motion next
// font: Science Gothic

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Science_Gothic } from 'next/font/google'





// Without axes: ['wdth'] the font ships no width axis and the stretch does nothing.
const scienceGothic = Science_Gothic({ subsets: ['latin'], axes: ['wdth'] })



interface LetterSpanProps {
  letter: string
  textColor: string
  fontFamily: string
  forwardedRef: React.Ref<HTMLSpanElement>
}

const LetterSpanComponent = ({ letter, textColor, fontFamily, forwardedRef }: LetterSpanProps) => {
  const [fontStyle, setFontStyle] = useState<'italic' | 'normal'>('italic')
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = spanRef.current
    if (!element) return

    const updateStyle = () => {
      const italicVar = getComputedStyle(element).getPropertyValue('--italic')
      const parsedItalic = parseFloat(italicVar)
      const italicValue = Number.isNaN(parsedItalic) ? 1 : parsedItalic
      setFontStyle(italicValue > 0.5 ? 'italic' : 'normal')
    }

    updateStyle()

    const observer = new MutationObserver(updateStyle)
    observer.observe(element, { attributes: true, attributeFilter: ['style'] })

    const interval = setInterval(updateStyle, 16)

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

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
        fontSize: 'clamp(4rem, 12vw, 7rem)',
        fontWeight: 'var(--font-weight, 100)',
        // Set wdth by tag: font-stretch maps to it inconsistently across browsers.
        fontVariationSettings: `'wdth' var(--font-width, 100)`,
        fontFamily,
        fontStyle,
        lineHeight: 1,
        letterSpacing: 'var(--letter-spacing, 0.15em)',
        wordSpacing: '0.8em',
        transform: `skewY(calc(var(--skew, 0) * 1deg))`,
      }}
    >
      {letter}
    </span>
  )
}

const LetterSpan = motion(LetterSpanComponent)


const TEXT = 'WHAT ?!'
const INFLUENCE_RADIUS = 300
const MAX_WEIGHT = 900
const MIN_WEIGHT = 100
const MAX_STRETCH = 200
const MIN_STRETCH = 100
const MAX_LETTER_SPACING = 0.4
const MIN_LETTER_SPACING = 0
const MAX_SKEW = 18
const MIN_SKEW = 0
const EASE_DURATION = 0.3

export default function ResponsiveLetters() {
  const [isDark, setIsDark] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([])
  const mouseRef = useRef<{ x: number; y: number } | null>(null)
  const animIdRef = useRef<number>(0)
  const aliveRef = useRef(true)

  useEffect(() => {
    function detectTheme(): boolean {
      let element: HTMLElement | null = containerRef.current
      while (element) {
        const cardTheme = element.getAttribute('data-card-theme')
        if (cardTheme) {
          return cardTheme === 'dark'
        }
        element = element.parentElement
      }

      return document.documentElement.classList.contains('dark')
    }

    setIsDark(detectTheme())

    const observer = new MutationObserver(() => {
      setIsDark(detectTheme())
    })

    let element: HTMLElement | null = containerRef.current
    while (element) {
      observer.observe(element, { attributes: true, attributeFilter: ['data-card-theme', 'class'] })
      element = element.parentElement
    }

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  const exitStateRef = useRef<Array<{
    weight: number
    stretch: number
    letterSpacing: number
    skew: number
    italic: number
  }>>([])

  useEffect(() => {
    aliveRef.current = true
    const container = containerRef.current
    if (!container) return

    TEXT.split('').forEach((_, i) => {
      if (!exitStateRef.current[i]) {
        exitStateRef.current[i] = {
          weight: MIN_WEIGHT,
          stretch: MIN_STRETCH,
          letterSpacing: MIN_LETTER_SPACING,
          skew: 0,
          italic: 1,
        }
      }
    })

    const exitSpring = { type: 'spring', damping: 6, stiffness: 35 }

    function animate() {
      if (!aliveRef.current) return

      const mx = mouseRef.current?.x ?? -99999
      const my = mouseRef.current?.y ?? -99999
      const isExiting = !mouseRef.current

      TEXT.split('').forEach((_, i) => {
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

        const targetWeight = MIN_WEIGHT + (MAX_WEIGHT - MIN_WEIGHT) * influence
        const targetStretch = MIN_STRETCH + (MAX_STRETCH - MIN_STRETCH) * influence
        const targetLetterSpacing = MIN_LETTER_SPACING + (MAX_LETTER_SPACING - MIN_LETTER_SPACING) * influence

        const italicValue = 1 - influence

        let targetSkew = 0
        if (influence > 0) {
          const angle = Math.atan2(dy, dx)
          const skewDirection = Math.sin(angle)
          targetSkew = (MAX_SKEW - MIN_SKEW) * influence * skewDirection
        }

        const state = exitStateRef.current[i]

        const spring = isExiting ? exitSpring : { type: 'spring', damping: 10, stiffness: 160 }
        const easing = isExiting ? 0.05 : 0.15

        state.weight += (targetWeight - state.weight) * easing
        state.stretch += (targetStretch - state.stretch) * easing
        state.letterSpacing += (targetLetterSpacing - state.letterSpacing) * easing
        state.skew += (targetSkew - state.skew) * easing
        state.italic += (italicValue - state.italic) * easing

        letterEl.style.setProperty('--font-weight', Math.round(state.weight).toString())
        letterEl.style.setProperty('--font-width', state.stretch.toFixed(1))
        letterEl.style.setProperty('--letter-spacing', `${state.letterSpacing.toFixed(3)}em`)
        letterEl.style.setProperty('--skew', `${state.skew.toFixed(1)}`)
        letterEl.style.setProperty('--italic', state.italic.toFixed(3))
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

  const bgColor = isDark ? '#0d001a' : '#40FFA7'
  const textColor = isDark ? 'text-[#40FFA7]' : 'text-[#0d001a]'

  return (
    <div
      ref={containerRef}
      className={`flex min-h-screen w-full flex-col items-center justify-center gap-8 px-6 sm:px-10 ${scienceGothic.className}`}
      style={{ backgroundColor: bgColor }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1">
        {TEXT.split('').map((letter, i) => (
          <LetterSpan
            key={i}
            letter={letter}
            forwardedRef={(el) => {
              if (el) lettersRef.current[i] = el
            }}
            textColor={textColor}
            fontFamily={scienceGothic.style.fontFamily}
          />
        ))}
      </div>
    </div>
  )
}
