'use client'

// npm install @phosphor-icons/react framer-motion
/**
 * Presents project tasks as a responsive overlapping card deck.
 * Dragging or using arrow controls moves the selected task through the stack.
 */

import { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { PaintBrush, Megaphone, Code, ChartBar, CaretLeft, CaretRight, ArrowUpRight } from '@phosphor-icons/react'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'



// tune: change both dimensions to resize the task cards
const CARD_W = 220
const CARD_H = 280
const DECK_W = CARD_W + 210

// customize: replace the task content, colors, and icons below
const TASKS: Array<{
  id: number
  title: string
  category: string
  description: string
  progress: number
  accent: string
  accentLight: string
  bg: string
  bgLight: string
  darkOnAccent?: boolean
  darkLabel?: string
  lightLabel?: string
  icon: PhosphorIcon
}> = [
  {
    id: 0,
    title: 'Brand Overhaul',
    category: 'Design',
    description: 'Complete visual identity refresh: logo, type scale, and colour system across all brand touchpoints.',
    progress: 45,
    accent: '#429EBD',
    accentLight: '#2980A0',
    bg: '#0C1E27',
    bgLight: '#EAF4F8',
    icon: PaintBrush,
  },
  {
    id: 1,
    title: 'Product Launch',
    category: 'Marketing',
    description: 'Coordinate go-to-market strategy, press kit, social assets, and launch-day campaign timeline.',
    progress: 72,
    accent: '#053F5C',
    accentLight: '#032F45',
    bg: '#010810',
    bgLight: '#B8CEDB',
    darkLabel: '#2A9DC0',
    lightLabel: '#0A6A8E',
    icon: Megaphone,
  },
  {
    id: 2,
    title: 'API Migration',
    category: 'Engineering',
    description: 'Migrate three legacy endpoints to v3 schema with full backward-compatibility and rollback plan.',
    progress: 28,
    accent: '#F7AD19',
    accentLight: '#D4900E',
    bg: '#1E1608',
    bgLight: '#FEF8E6',
    darkOnAccent: true,
    icon: Code,
  },
  {
    id: 3,
    title: 'Q2 Metrics',
    category: 'Analytics',
    description: 'Build consolidated dashboard: retention, revenue, and activation funnels with weekly drill-down.',
    progress: 15,
    accent: '#F27F0C',
    accentLight: '#C96208',
    bg: '#1C1006',
    bgLight: '#FEF1E4',
    darkOnAccent: true,
    icon: ChartBar,
  },
]


// tune: adjust to change the deck spread
const SLOTS = [
  { x: 0,    y: 0, rotate: 0, scale: 1,    z: 4, opacity: 1   },
  { x: 108,  y: 0, rotate: 0, scale: 0.88, z: 3, opacity: 0.7 },
  { x: -108, y: 0, rotate: 0, scale: 0.88, z: 2, opacity: 0.7 },
  { x: 0,    y: 0, rotate: 0, scale: 0.78, z: 1, opacity: 0   },
]

const SPRING = { type: 'spring' as const, stiffness: 280, damping: 26 }




const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function useIsDark(ref: React.RefObject<HTMLElement | null>) {
  
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return document.documentElement.classList.contains('dark')
  })

  useIsomorphicLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => {
      const card = el.closest('[data-card-theme]')
      setIsDark(card ? card.classList.contains('dark') : document.documentElement.classList.contains('dark'))
    }
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = el.closest('[data-card-theme]')
    if (cardWrapper) obs.observe(cardWrapper, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [ref])
  return isDark
}



function AnimatedProgress({ progress, isActive, darkText }: { progress: number; isActive: boolean; darkText?: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setCount(0)
      return
    }
    const duration = 1400
    const delay = 300
    let rafId: number
    let startTime: number | null = null

    const tick = (now: number) => {
      if (startTime === null) startTime = now
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setCount(Math.round(eased * progress))
      if (t < 1) rafId = requestAnimationFrame(tick)
    }

    const timeout = setTimeout(() => { rafId = requestAnimationFrame(tick) }, delay)
    return () => { clearTimeout(timeout); cancelAnimationFrame(rafId) }
  }, [progress, isActive])

  const labelColor = darkText ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)'
  const pctColor   = darkText ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)'
  const trackBg    = darkText ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.2)'
  const fillBg     = darkText ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: labelColor, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Progress</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: pctColor }}>{count}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: trackBg, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', borderRadius: 3, background: fillBg }}
          initial={{ width: '0%' }}
          animate={{ width: isActive ? progress + '%' : '0%' }}
          transition={isActive ? { duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 } : { duration: 0 }}
        />
      </div>
    </div>
  )
}



export default function TaskCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDark = useIsDark(containerRef)

  const dragX = useMotionValue(0)
  const cardRotateY = useTransform(dragX, [-200, 0, 200], [14, 0, -14])

  const [order, setOrder] = useState([0, 1, 2, 3])
  const orderRef = useRef(order)
  useEffect(() => { orderRef.current = order }, [order])

  const dismissing = useRef(false)
  const dragDelta = useRef(0)
  const [exiting, setExiting] = useState<{ id: number; dir: 'left' | 'right' } | null>(null)
  const [returning, setReturning] = useState<Set<number>>(new Set())

  const dismiss = useCallback((dir: 'left' | 'right') => {
    if (dismissing.current) return
    dismissing.current = true
    const frontId = orderRef.current[0]
    setExiting({ id: frontId, dir })
    setTimeout(() => {
      setReturning(prev => new Set([...prev, frontId]))
      setOrder(prev => [...prev.slice(1), prev[0]])
      setExiting(null)
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setReturning(prev => { const s = new Set(prev); s.delete(frontId); return s })
        dismissing.current = false
      }))
    }, 420)
  }, [])

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full flex-col items-center justify-center bg-[#E8E8DF] dark:bg-[#1A1A19]"
    >
      {}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: DECK_W, height: CARD_H }}>
          {TASKS.map(task => {
            const slotIndex = order.indexOf(task.id)
            const slot = SLOTS[slotIndex]
            const isFront = slotIndex === 0
            const isExiting = exiting?.id === task.id
            const isReturning = returning.has(task.id)

            
            const cardBg = isDark ? task.accent : task.accentLight
            
            const topBg = isDark ? task.bg : task.bgLight
            const catColor = isDark ? (task.darkLabel ?? task.accent) : (task.lightLabel ?? task.accentLight)
            const titleColor = isDark ? 'rgba(255,255,255,0.92)' : '#21211F'
            const descColor = isDark ? 'rgba(255,255,255,0.48)' : '#52524E'
            const Icon = task.icon

            return (
              <motion.div
                key={task.id}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: CARD_W,
                  height: CARD_H,
                  marginLeft: -CARD_W / 2,
                  marginTop: -CARD_H / 2,
                  zIndex: isExiting ? 10 : slot.z,
                  borderRadius: 24,
                  overflow: 'hidden',
                  cursor: isFront ? 'grab' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  background: cardBg,
                  ...(isFront ? { rotateY: cardRotateY, transformPerspective: 900 } : {}),
                }}
                animate={
                  isExiting
                    ? {
                        x: exiting!.dir === 'left' ? -480 : 480,
                        y: 100,
                        rotate: exiting!.dir === 'left' ? -22 : 22,
                        scale: 0.85,
                        opacity: 0,
                      }
                    : {
                        x: slot.x,
                        y: slot.y,
                        rotate: slot.rotate,
                        scale: slot.scale,
                        opacity: slot.opacity,
                      }
                }
                transition={
                  isExiting
                    ? { duration: 0.42, ease: [0.4, 0, 0.2, 1] }
                    : isReturning
                    ? { duration: 0 }
                    : SPRING
                }
                whileHover={
                  isExiting ? undefined :
                  isFront
                    ? { scale: 1.03, boxShadow: `0 10px 36px ${cardBg}30` }
                    : slotIndex === 1 || slotIndex === 2
                    ? { opacity: 0.88, scale: slot.scale + 0.015 }
                    : undefined
                }
                whileTap={isFront ? { scale: 0.98 } : undefined}
                drag={isFront && !dismissing.current ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragStart={() => { dragDelta.current = 0; dragX.set(0) }}
                onDrag={(_, info) => { dragDelta.current = info.offset.x; dragX.set(info.offset.x) }}
                onDragEnd={(_, info) => {
                  dragX.set(0)
                  if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 400) {
                    dismiss(info.offset.x < 0 ? 'left' : 'right')
                  }
                }}
              >
                {}
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden',
                    background: topBg,
                    border: `2px solid ${cardBg}`,
                    borderRadius: 24,
                    padding: '28px 20px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    position: 'relative',
                  }}
                >
                  {}
                  <motion.span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      border: `1.5px solid ${catColor}`,
                      background: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: catColor,
                      flexShrink: 0,
                    }}
                    whileHover={{ scale: 1.1, opacity: 0.7 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <ArrowUpRight weight="regular" size={13} />
                  </motion.span>
                  {}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                    <Icon weight="regular" size={11} style={{ color: catColor }} />
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: catColor,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}>
                      {task.category}
                    </span>
                  </div>

                  {}
                  <div style={{ height: 28, flexShrink: 0 }} />

                  {}
                  <h2 style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: titleColor,
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                    margin: 0,
                    flexShrink: 0,
                  }}>
                    {task.title}
                  </h2>

                  {}
                  <div style={{ height: 10, flexShrink: 0 }} />

                  {}
                  <p style={{
                    fontSize: 12,
                    color: descColor,
                    lineHeight: 1.6,
                    margin: 0,
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden',
                  }}>
                    {task.description}
                  </p>
                </div>

                {}
                <div style={{ padding: '12px 20px 14px', flexShrink: 0 }}>
                  <AnimatedProgress progress={task.progress} isActive={isFront} darkText={task.darkOnAccent} />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {}
      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        {([
          { dir: 'left' as const, icon: <CaretLeft weight="regular" size={16} />, label: 'Previous' },
          { dir: 'right' as const, icon: <CaretRight weight="regular" size={16} />, label: 'Next' },
        ] as const).map(({ dir, icon, label }) => (
          <motion.button
            key={dir}
            onClick={() => dismiss(dir)}
            aria-label={label}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)'}`,
              background: 'rgba(0,0,0,0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.28)',
            }}
            whileHover={{
              scale: 1.1,
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              borderColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.18)',
              color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.55)',
            }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {icon}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
