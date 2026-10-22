'use client'

// npm install framer-motion

import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'


const BACKGROUND = 'https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133'

// 6-digit hex only: lerpHex reads these as #RRGGBB.
const SLIDERS = [
  { label: 'Brightness', defaultValue: 72, colorA: '#5B8FF9', colorB: '#A78BFA' },
  { label: 'Contrast',   defaultValue: 45, colorA: '#FF6BF5', colorB: '#FF6680' },
  { label: 'Warmth',     defaultValue: 60, colorA: '#FF7B54', colorB: '#FFBE0B' },
  { label: 'Saturation', defaultValue: 55, colorA: '#06D6A0', colorB: '#5B8FF9' },
]


function lerpHex(a: string, b: string, t: number): string {
  const ah = a.replace('#', '')
  const bh = b.replace('#', '')
  const ar = parseInt(ah.slice(0, 2), 16)
  const ag = parseInt(ah.slice(2, 4), 16)
  const ab = parseInt(ah.slice(4, 6), 16)
  const br = parseInt(bh.slice(0, 2), 16)
  const bg = parseInt(bh.slice(2, 4), 16)
  const bb = parseInt(bh.slice(4, 6), 16)
  return `#${Math.round(ar + (br - ar) * t).toString(16).padStart(2, '0')}${Math.round(ag + (bg - ag) * t).toString(16).padStart(2, '0')}${Math.round(ab + (bb - ab) * t).toString(16).padStart(2, '0')}`
}


function Slider({
  label,
  defaultValue,
  colorA,
  colorB,
  delay,
}: {
  label: string
  defaultValue: number
  colorA: string
  colorB: string
  delay: number
}) {
  const [value, setValue] = useState(defaultValue)
  const [hovered, setHovered] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useMotionValue(0)
  const thumbScale = useSpring(useTransform(isDragging, [0, 1], [1, 1.3]), { stiffness: 400, damping: 20 })

  const onMoveRef = useRef<((ev: PointerEvent) => void) | null>(null)
  const onUpRef = useRef<(() => void) | null>(null)

  const thumbColor = lerpHex(colorA, colorB, value / 100)

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    isDragging.set(1)

    const track = trackRef.current
    if (!track) return

    const updateValue = (clientX: number) => {
      const rect = track.getBoundingClientRect()
      setValue(Math.round(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 100))
    }

    updateValue(e.clientX)

    const onMove = (ev: PointerEvent) => updateValue(ev.clientX)
    const onUp = () => {
      isDragging.set(0)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      onMoveRef.current = null
      onUpRef.current = null
    }
    onMoveRef.current = onMove
    onUpRef.current = onUp
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let next: number | null = null
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = value - 1
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = value + 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = 100
    if (next === null) return
    e.preventDefault()
    setValue(Math.max(0, Math.min(100, next)))
  }

  useEffect(() => {
    return () => {
      if (onMoveRef.current) window.removeEventListener('pointermove', onMoveRef.current)
      if (onUpRef.current) window.removeEventListener('pointerup', onUpRef.current)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22, delay }}
      className="flex flex-col gap-[14px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between">
        <motion.span
          animate={{ color: hovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)' }}
          transition={{ duration: 0.2 }}
          className="text-sm font-medium"
        >
          {label}
        </motion.span>
        <span className="font-mono text-sm font-semibold" style={{ color: thumbColor }}>{value}</span>
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        className="relative h-[5px] w-full cursor-pointer rounded-full touch-none outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        style={{
          background: hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)',
          transition: 'background 0.2s ease',
        }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${colorA}, ${colorB})`,
            filter: hovered ? `drop-shadow(0 0 4px ${thumbColor}88)` : 'none',
            transition: 'filter 0.2s ease',
          }}
        />

        <motion.div
          className="absolute top-1/2 flex h-[44px] w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          style={{ left: `${value}%`, scale: thumbScale }}
        >
          <div
            className="h-[18px] w-[18px] rounded-full bg-white"
            style={{
              boxShadow: `0 0 0 2.5px ${thumbColor}, 0 2px 10px ${thumbColor}66`,
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}


export default function GlassSlider() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]">
      <img
        src={BACKGROUND}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
      />

      <motion.div
        // No opacity in initial: below 1 it hides the blur until the fade ends.
        initial={{ y: 20, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="relative isolate flex w-[calc(100%-32px)] max-w-[360px] flex-col gap-7 rounded-3xl px-7 py-8"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* z-[-1] relies on the panel's isolate; without it the blur falls behind the page. */}
        <div
          className="pointer-events-none absolute inset-0 z-[-1] rounded-3xl"
          style={{ backdropFilter: 'blur(24px) saturate(1.8)', WebkitBackdropFilter: 'blur(24px) saturate(1.8)' }}
        />
        <div
          className="absolute left-7 right-7 top-0 h-[1px]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
        />

        <h3 className="text-base font-semibold text-white/80">Display</h3>

        {SLIDERS.map((s, i) => (
          <Slider key={s.label} {...s} delay={0.08 + i * 0.06} />
        ))}
      </motion.div>
    </div>
  )
}
