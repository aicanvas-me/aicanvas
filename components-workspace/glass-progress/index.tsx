'use client'

// npm install @phosphor-icons/react framer-motion

import { useState, useEffect, useCallback } from 'react'
import { motion, useSpring, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { ArrowClockwise } from '@phosphor-icons/react'


const GLASS_BLUR = {
  backdropFilter: 'blur(24px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
} as const

const GLASS_PANEL = {
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow:
    '0 8px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
} as const

const BACKGROUND_IMAGE =
  'https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133'


interface GlassProgressBarProps {
  value: number
  color: string
  gradient: string
  label?: string
  animated?: boolean
}

interface BarConfig {
  label: string
  value: number
  color: string
  gradient: string
  delay: number
}


// color must be 6-digit hex: two-digit alpha suffixes are appended to it.
const BARS: BarConfig[] = [
  { label: 'Storage', value: 72, color: '#3A86FF', gradient: '#3A86FF, #2962FF', delay: 200 },
  { label: 'Upload',  value: 45, color: '#FF5C8A', gradient: '#FF5C8A, #FF1744', delay: 400 },
  { label: 'Battery', value: 88, color: '#06D6A0', gradient: '#06D6A0, #00BFA5', delay: 600 },
  { label: 'Memory',  value: 30, color: '#FFBE0B', gradient: '#FFBE0B, #FF9800', delay: 800 },
]


function GlassProgressBar({
  value,
  color,
  gradient,
  label,
  animated = false,
}: GlassProgressBarProps) {
  const prefersReduced = useReducedMotion()

  const springValue = useSpring(0, { stiffness: 80, damping: 20 })
  const [displayPercent, setDisplayPercent] = useState(0)

  useEffect(() => {
    springValue.set(value)
  }, [value, springValue])

  useMotionValueEvent(springValue, 'change', (latest) => {
    setDisplayPercent(Math.round(latest))
  })

  const glowAlpha = Math.round(40 + value * 0.4)
    .toString(16)
    .padStart(2, '0')
  const glowSize = 4 + value * 0.08

  const fillTransition = prefersReduced
    ? { duration: 0.3 }
    : { type: 'spring' as const, stiffness: 200, damping: 24 }

  const pulseAnimate =
    animated && !prefersReduced
      ? {
          width: `${value}%`,
          opacity: [0.85, 1, 0.85],
        }
      : { width: `${value}%` }

  const pulseTransition =
    animated && !prefersReduced
      ? {
          width: fillTransition,
          opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
        }
      : fillTransition

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between px-1">
        {label && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40 font-sans">
            {label}
          </span>
        )}
        <span
          className="text-[10px] font-semibold tabular-nums font-sans"
          style={{ color: `${color}88` }}
        >
          {displayPercent}%
        </span>
      </div>

      <div
        className="relative h-2 w-full overflow-hidden rounded-full"
        style={{ ...GLASS_PANEL }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={GLASS_BLUR}
        />

        <motion.div
          className="absolute bottom-0 left-0 top-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${gradient})`,
            filter: `drop-shadow(0 0 ${glowSize}px ${color}${glowAlpha})`,
          }}
          initial={{ width: '0%' }}
          animate={pulseAnimate}
          transition={pulseTransition}
        />
      </div>
    </div>
  )
}


export default function GlassProgress() {
  const [values, setValues] = useState<number[]>([0, 0, 0, 0])
  const [resetKey, setResetKey] = useState(0)

  const replay = useCallback(() => {
    setValues([0, 0, 0, 0])
    setResetKey((k) => k + 1)
  }, [])

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []

    BARS.forEach((bar, i) => {
      const id = setTimeout(() => {
        setValues((prev) => {
          const next = [...prev]
          next[i] = bar.value
          return next
        })
      }, bar.delay)
      timeouts.push(id)
    })

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [resetKey])

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]">
      <img
        src={BACKGROUND_IMAGE}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
      />

      <div className="relative flex w-full max-w-[340px] flex-col items-center gap-4 px-4">
        <motion.div
          // No opacity in initial: below 1 it hides the blur until the fade ends.
          initial={{ scale: 0.92, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="relative isolate w-full overflow-hidden rounded-3xl"
          style={{ ...GLASS_PANEL }}
        >
          {/* z-[-1] relies on the panel's isolate; without it the blur falls behind the page. */}
          <div
            className="pointer-events-none absolute inset-0 z-[-1] rounded-3xl"
            style={GLASS_BLUR}
          />

          <div
            className="absolute left-8 right-8 top-0 h-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
          />

          <div className="flex flex-col gap-5 px-6 py-6">
            {BARS.map((bar, i) => (
              <GlassProgressBar
                key={bar.label}
                label={bar.label}
                value={values[i]}
                color={bar.color}
                gradient={bar.gradient}
                animated
              />
            ))}
          </div>
        </motion.div>

        <motion.button
          onClick={replay}
          whileHover={{ scale: 1.12, background: 'rgba(255,255,255,0.12)' }}
          whileTap={{ scale: 0.9, rotate: -90 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          aria-label="Replay animation"
        >
          <ArrowClockwise size={18} weight="regular" className="text-white/50" />
        </motion.button>
      </div>
    </div>
  )
}
