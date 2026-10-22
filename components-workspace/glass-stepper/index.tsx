'use client'

// npm install @phosphor-icons/react framer-motion

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Minus, Plus } from '@phosphor-icons/react'


const glassBlur = {
  backdropFilter: 'blur(24px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
} as const

const glassPanel = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow:
    '0 8px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
} as const

const BACKGROUND_IMAGE =
  'https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133'


const BUTTON_SPRING = { type: 'spring' as const, stiffness: 300, damping: 20 }


interface GlassStepperFieldProps {
  min?: number
  max?: number
  step?: number
  initialValue?: number
  label?: string
  // 6-digit hex only: two-digit alpha suffixes are appended to it.
  color: string
  gradient: string
}


function GlassStepperField({
  min = 0,
  max = 10,
  step = 1,
  initialValue,
  label,
  color,
  gradient,
}: GlassStepperFieldProps) {
  const prefersReduced = useReducedMotion()
  const [value, setValue] = useState(initialValue ?? min)
  const directionRef = useRef<1 | -1>(1)

  const atMin = value <= min
  const atMax = value >= max

  function increment() {
    if (atMax) return
    directionRef.current = 1
    setValue((prev) => Math.min(prev + step, max))
  }

  function decrement() {
    if (atMin) return
    directionRef.current = -1
    setValue((prev) => Math.max(prev - step, min))
  }

  const slideOffset = prefersReduced ? 0 : 24
  const direction = directionRef.current

  return (
    <div className="flex w-[132px] flex-col">
      {label && (
        <div className="mb-2 flex items-baseline justify-between px-1">
          <span className="font-sans text-[10px] font-semibold uppercase tracking-widest text-white/40">
            {label}
          </span>
          <span
            className="font-sans text-[10px] font-semibold tabular-nums"
            style={{ color: `${color}88` }}
          >
            {value} / {max}
          </span>
        </div>
      )}

      <div
        className="relative isolate overflow-hidden rounded-2xl"
        style={glassPanel}
      >
        <div
          className="pointer-events-none absolute inset-0 z-[-1] rounded-2xl"
          style={glassBlur}
        />

        <div
          className="absolute left-4 right-4 top-0 z-10 h-[1px]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }}
        />

        <div className="relative z-10 flex items-stretch justify-between p-2">
          <motion.button
            onClick={decrement}
            whileHover={atMin || prefersReduced ? undefined : { scale: 1.08 }}
            whileTap={atMin || prefersReduced ? undefined : { scale: 0.88 }}
            transition={BUTTON_SPRING}
            disabled={atMin}
            aria-label="Decrease"
            className="flex cursor-pointer items-center justify-center rounded-xl"
            style={{
              width: 36,
              outline: 'none',
              background: `${color}${atMin ? '0a' : '18'}`,
              border: `1px solid ${color}${atMin ? '0a' : '22'}`,
              opacity: atMin ? 0.4 : 1,
              pointerEvents: atMin ? 'none' : 'auto',
            }}
          >
            <Minus size={16} weight="regular" style={{ color: atMin ? 'rgba(255,255,255,0.3)' : color }} />
          </motion.button>

          <div
            className="flex items-center justify-center overflow-hidden"
            style={{ width: 36 }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={value}
                initial={{
                  opacity: 0,
                  y: direction * slideOffset,
                  scale: 0.5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: direction * -slideOffset,
                  scale: 1.4,
                }}
                transition={
                  prefersReduced
                    ? { duration: 0.15 }
                    : { type: 'spring', stiffness: 260, damping: 18 }
                }
                className="font-sans text-base font-bold tabular-nums"
                style={{
                  background: `linear-gradient(135deg, ${gradient})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {value}
              </motion.span>
            </AnimatePresence>
          </div>

          <motion.button
            onClick={increment}
            whileHover={atMax || prefersReduced ? undefined : { scale: 1.08 }}
            whileTap={atMax || prefersReduced ? undefined : { scale: 0.88 }}
            transition={BUTTON_SPRING}
            disabled={atMax}
            aria-label="Increase"
            className="flex cursor-pointer items-center justify-center rounded-xl"
            style={{
              width: 36,
              outline: 'none',
              background: `${color}${atMax ? '0a' : '18'}`,
              border: `1px solid ${color}${atMax ? '0a' : '22'}`,
              opacity: atMax ? 0.4 : 1,
              pointerEvents: atMax ? 'none' : 'auto',
            }}
          >
            <Plus size={16} weight="regular" style={{ color: atMax ? 'rgba(255,255,255,0.3)' : color }} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}


export default function GlassStepper() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]">
      <img
        src={BACKGROUND_IMAGE}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
      />

      <div className="relative z-10 flex flex-wrap items-start justify-center gap-5 px-4">
        <GlassStepperField
          label="Quantity"
          min={0}
          max={10}
          step={1}
          initialValue={0}
          color="#3A86FF"
          gradient="#3A86FF, #2962FF"
        />
        <GlassStepperField
          label="Guests"
          min={1}
          max={8}
          step={1}
          initialValue={1}
          color="#FF5C8A"
          gradient="#FF5C8A, #FF1744"
        />
        <GlassStepperField
          label="Volume"
          min={0}
          max={100}
          step={5}
          initialValue={50}
          color="#06D6A0"
          gradient="#06D6A0, #00BFA5"
        />
      </div>
    </div>
  )
}
