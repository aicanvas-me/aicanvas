'use client'

// npm install next
// font: Anton

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Anton } from 'next/font/google'

const anton = Anton({ subsets: ['latin'], weight: '400' })

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

const BASE_TEXT = 'KEEP MOVING • KEEP MOVING • '
const FULL_TEXT = BASE_TEXT + BASE_TEXT
const LETTERS = FULL_TEXT.split('')
const TOTAL = LETTERS.length

const INFLUENCE_RADIUS = 400
const MAX_SCALE = 1.5
const MAX_PUSH = 22
const EASE_ACTIVE = 0.15
const EASE_EXIT = 0.05
const SPEED_NORMAL = 0.3
const SPEED_SLOW = 0.075
const SPEED_EASE = 0.03
const TEXT_RADIUS_RATIO = 0.88

export default function Orbit() {
  const containerRef = useRef<HTMLDivElement>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme(containerRef)
  const isDark = theme === 'dark'

  const letterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const starRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef<{ x: number; y: number } | null>(null)
  const animIdRef = useRef<number>(0)
  const aliveRef = useRef(true)
  const isHoveredRef = useRef(false)
  const rotationRef = useRef(0)
  const speedRef = useRef(SPEED_NORMAL)
  const stateRef = useRef(LETTERS.map(() => ({ scale: 1, pushX: 0, pushY: 0 })))
  const [size, setSize] = useState(400)

  useLayoutEffect(() => {
    const el = wheelRef.current
    if (!el) return
    setSize(el.offsetWidth)

    const ro = new ResizeObserver(() => {
      setSize(el.offsetWidth)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    aliveRef.current = true

    function animate() {
      if (!aliveRef.current) return

      const wheel = wheelRef.current
      if (wheel) {
        const targetSpeed = isHoveredRef.current ? SPEED_SLOW : SPEED_NORMAL
        speedRef.current += (targetSpeed - speedRef.current) * SPEED_EASE
        rotationRef.current += speedRef.current
        wheel.style.transform = `rotate(${rotationRef.current}deg)`
      }

      const star = starRef.current
      if (star) {
        star.style.transform = `translate(-50%, -50%) rotate(${-rotationRef.current * 1.5}deg)`
      }

      const mx = mouseRef.current?.x ?? -99999
      const my = mouseRef.current?.y ?? -99999
      const isExiting = !mouseRef.current

      const wheelEl = wheelRef.current
      const wheelRect = wheelEl?.getBoundingClientRect()
      const wheelCx = wheelRect ? wheelRect.left + wheelRect.width / 2 : 0
      const wheelCy = wheelRect ? wheelRect.top + wheelRect.height / 2 : 0

      LETTERS.forEach((_, i) => {
        const el = letterRefs.current[i]
        if (!el) return

        const rect = el.getBoundingClientRect()
        const lx = rect.left + rect.width / 2
        const ly = rect.top + rect.height / 2
        const dx = lx - mx
        const dy = ly - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        let influence = 0
        if (dist < INFLUENCE_RADIUS) {
          influence = 1 - dist / INFLUENCE_RADIUS
          influence = influence * influence * (3 - 2 * influence)
        }

        const targetScale = 1 + (MAX_SCALE - 1) * influence

        const rdx = lx - wheelCx
        const rdy = ly - wheelCy
        const rlen = Math.sqrt(rdx * rdx + rdy * rdy) || 1
        const targetPushX = (rdx / rlen) * MAX_PUSH * influence
        const targetPushY = (rdy / rlen) * MAX_PUSH * influence

        const state = stateRef.current[i]
        const easing = isExiting ? EASE_EXIT : EASE_ACTIVE

        state.scale += (targetScale - state.scale) * easing
        state.pushX += (targetPushX - state.pushX) * easing
        state.pushY += (targetPushY - state.pushY) * easing

        el.style.setProperty('--scale', state.scale.toFixed(3))
        el.style.setProperty('--push-x', `${state.pushX.toFixed(2)}px`)
        el.style.setProperty('--push-y', `${state.pushY.toFixed(2)}px`)
      })

      animIdRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => {
      aliveRef.current = false
      cancelAnimationFrame(animIdRef.current)
    }
  }, [])

  const bgColor = isDark ? '#1A1A19' : '#E8E8DF'
  const textColor = isDark ? '#E8E8DF' : '#1A1A19'
  const radius = size / 2
  const textRadius = radius * TEXT_RADIUS_RATIO
  const fontSize = Math.max(8, size * 0.076)

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen w-full items-center justify-center"
      style={{ backgroundColor: bgColor }}
      onMouseMove={(e) => {
        mouseRef.current = { x: e.clientX, y: e.clientY }
        isHoveredRef.current = true
      }}
      onMouseLeave={() => {
        mouseRef.current = null
        isHoveredRef.current = false
      }}
      onTouchStart={(e) => {
        const touch = e.touches[0]
        if (touch) {
          mouseRef.current = { x: touch.clientX, y: touch.clientY }
          isHoveredRef.current = true
        }
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0]
        if (touch) {
          mouseRef.current = { x: touch.clientX, y: touch.clientY }
          isHoveredRef.current = true
        }
      }}
      onTouchEnd={() => {
        setTimeout(() => {
          mouseRef.current = null
          isHoveredRef.current = false
        }, 600)
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
      <div
        ref={wheelRef}
        className={anton.className}
        style={{
          position: 'relative',
          width: 'clamp(200px, 48vw, 420px)',
          height: 'clamp(200px, 48vw, 420px)',
          flexShrink: 0,
        }}
      >
        {LETTERS.map((letter, i) => {
          const angle = (i / TOTAL) * 2 * Math.PI - Math.PI / 2
          const x = radius + textRadius * Math.cos(angle)
          const y = radius + textRadius * Math.sin(angle)
          const rotDeg = (angle * 180) / Math.PI + 90

          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: `translate(-50%, -50%) rotate(${rotDeg}deg)`,
              }}
            >
              <span
                ref={(el) => {
                  letterRefs.current[i] = el
                }}
                style={{
                  display: 'inline-block',
                  fontSize,
                  lineHeight: 1,
                  color: textColor,
                  transform:
                    'translate(var(--push-x, 0px), var(--push-y, 0px)) scale(var(--scale, 1))',
                  willChange: 'transform',
                  userSelect: 'none',
                }}
              >
                {letter}
              </span>
            </span>
          )
        })}
      </div>
      <div
        ref={starRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          willChange: 'transform',
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: textColor }}
          />
        ))}
      </div>
      </div>
    </div>
  )
}
