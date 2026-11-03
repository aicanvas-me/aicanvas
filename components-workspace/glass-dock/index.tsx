'use client'

// npm install @phosphor-icons/react framer-motion

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  Sun,
  Heart,
  MusicNote,
  Coffee,
  Leaf,
  Star,
  Moon,
  Flame,
  Cloud,
} from '@phosphor-icons/react'

// 6-digit hex only: two-digit alpha suffixes are appended to these colors.
const DOCK_ITEMS = [
  { icon: Sun,       color: '#FFBE0B', label: 'Energy' },
  { icon: Heart,     color: '#FF5C8A', label: 'Love' },
  { icon: MusicNote, color: '#FF7B54', label: 'Joy' },
  { icon: Coffee,    color: '#C9A96E', label: 'Comfort' },
  { icon: Leaf,      color: '#06D6A0', label: 'Nature' },
  { icon: Star,      color: '#FFBE0B', label: 'Dreams' },
  { icon: Moon,      color: '#B388FF', label: 'Rest' },
  { icon: Flame,     color: '#FF5C8A', label: 'Passion' },
  { icon: Cloud,     color: '#3A86FF', label: 'Peace' },
]

const ICON_SIZE = 44
const MAG_RANGE = 120
const MAG_SCALE = 1.55

function DockItem({
  icon: Icon,
  color,
  label,
  mouseX,
  index,
  isOpen,
  onToggle,
}: {
  icon: typeof Sun
  color: string
  label: string
  mouseX: ReturnType<typeof useMotionValue<number>>
  index: number
  isOpen: boolean
  onToggle: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const touchTooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isTouchTooltipVisible, setIsTouchTooltipVisible] = useState(false)

  useEffect(() => {
    return () => {
      if (touchTooltipTimer.current) clearTimeout(touchTooltipTimer.current)
    }
  }, [])

  const distance = useTransform(mouseX, (mx: number) => {
    const el = ref.current
    // 200 must stay above MAG_RANGE, or every icon rests slightly magnified.
    if (!el || mx < 0) return 200
    const rect = el.getBoundingClientRect()
    const center = rect.left + rect.width / 2
    return Math.abs(mx - center)
  })

  const rawSize = useTransform(distance, [0, MAG_RANGE], [ICON_SIZE * MAG_SCALE, ICON_SIZE])
  const size = useSpring(rawSize, { stiffness: 300, damping: 22, mass: 0.5 })
  const y = useTransform(size, [ICON_SIZE, ICON_SIZE * MAG_SCALE], [0, -12])

  const showTouchTooltip = () => {
    if (touchTooltipTimer.current) clearTimeout(touchTooltipTimer.current)
    setIsTouchTooltipVisible(true)
    touchTooltipTimer.current = setTimeout(() => {
      setIsTouchTooltipVisible(false)
      touchTooltipTimer.current = null
    }, 1200)
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={label}
      aria-pressed={isOpen}
      onClick={onToggle}
      onPointerUp={(event) => {
        if (event.pointerType === 'touch') showTouchTooltip()
      }}
      className="group relative flex cursor-pointer appearance-none flex-col items-center border-0 bg-transparent p-0 outline-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18, delay: index * 0.04 }}
    >
      <motion.div
        className={`pointer-events-none absolute -top-10 rounded-lg px-3 py-1.5 text-xs font-medium text-white/90 ${isTouchTooltipVisible ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 group-focus-visible:opacity-100`}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'opacity 0.15s',
        }}
      >
        {label}
      </motion.div>

      <motion.div
        style={{
          width: size,
          height: size,
          y,
          background: `${color}18`,
          border: `1px solid ${color}22`,
          borderRadius: 12,
        }}
        whileTap={{ scale: 0.82 }}
        className="relative flex items-center justify-center group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[rgba(255,255,255,0.6)]"
      >
        <Icon size={22} weight="regular" style={{ color }} />
        <AnimatePresence>
          {isOpen && (
            <motion.span
              className="absolute h-1 w-1 rounded-full"
              style={{ backgroundColor: color, bottom: -6, left: 'calc(50% - 2px)' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  )
}

export default function GlassDock() {
  const mouseX = useMotionValue(-200)
  const [openItems, setOpenItems] = useState<Set<string>>(() => new Set())

  const toggleItem = (label: string) => {
    setOpenItems((current) => {
      const next = new Set(current)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <div className="relative flex h-full w-full items-center justify-end overflow-hidden bg-[#1A1A19] pb-8">
      <img
        src="https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png?updatedAt=1775223702866"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
      />

      <div className="flex w-full overflow-x-auto py-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* mx-auto, not justify-center: centered overflow can't scroll to its left edge. */}
        <motion.div
          // No opacity in initial: below 1 it hides the blur until the fade ends.
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          onMouseMove={(e) => mouseX.set(e.clientX)}
          onMouseLeave={() => mouseX.set(-200)}
          className="relative isolate mx-auto flex shrink-0 items-end gap-2 rounded-3xl px-4 pb-3 pt-3"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* z-[-1] relies on the dock's isolate; without it the blur falls behind the page. */}
          <div
            className="pointer-events-none absolute inset-0 z-[-1] rounded-3xl"
            style={{
              backdropFilter: 'blur(24px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
            }}
          />
          {DOCK_ITEMS.map((item, i) => (
            <DockItem
              key={item.label}
              {...item}
              mouseX={mouseX}
              index={i}
              isOpen={openItems.has(item.label)}
              onToggle={() => toggleItem(item.label)}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
