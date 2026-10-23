import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `# TaskCards
A swipeable 3-up deck of coloured project cards with an animated progress footer.

## 1. Setup
// npm install @phosphor-icons/react framer-motion
File: components-workspace/task-cards/index.tsx  ·  'use client'  ·  export default function TaskCards()

import { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react'
import { motion, MotionConfig, useMotionValue, useTransform } from 'framer-motion'
import { PaintBrush, Megaphone, Code, ChartBar, CaretLeft, CaretRight, ArrowUpRight } from '@phosphor-icons/react'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'

## 2. Constants

const CARD_W = 220
const CARD_H = 280
const DECK_W = CARD_W + 210

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

// Slot 0 = front, 1 = right peek, 2 = left peek, 3 = hidden back
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

## 3. State

const containerRef = useRef<HTMLDivElement>(null)
const isDark = useIsDark(containerRef)
const [deckScale, setDeckScale] = useState(1)

useIsomorphicLayoutEffect(() => {
  const container = containerRef.current
  if (!container || typeof ResizeObserver === 'undefined') return
  const updateScale = (width: number) => {
    setDeckScale(Math.max(0.6, Math.min(1, (width - 32) / DECK_W)))
  }
  updateScale(container.getBoundingClientRect().width)
  const observer = new ResizeObserver(entries => updateScale(entries[0].contentRect.width))
  observer.observe(container)
  return () => observer.disconnect()
}, [])

const dragX = useMotionValue(0)
const cardRotateY = useTransform(dragX, [-200, 0, 200], [14, 0, -14])

const [order, setOrder] = useState([0, 1, 2, 3])
const orderRef = useRef(order)
useEffect(() => { orderRef.current = order }, [order])

const dismissing = useRef(false)
const dragDelta = useRef(0)
const [exiting, setExiting] = useState<{ id: number; dir: 'left' | 'right' } | null>(null)
const [entering, setEntering] = useState<number | null>(null)
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

const showPrevious = useCallback(() => {
  if (dismissing.current) return
  dismissing.current = true
  const backId = orderRef.current[orderRef.current.length - 1]
  setEntering(backId)
  setOrder(prev => [prev[prev.length - 1], ...prev.slice(0, -1)])
  requestAnimationFrame(() => requestAnimationFrame(() => {
    setEntering(null)
    setTimeout(() => { dismissing.current = false }, 420)
  }))
}, [])

Per-card values, computed inside TASKS.map(task => ...) before its return:

const slotIndex = order.indexOf(task.id)
const slot = SLOTS[slotIndex]
const isFront = slotIndex === 0
const isExiting = exiting?.id === task.id
const isEntering = entering === task.id
const isReturning = returning.has(task.id)
const cardBg = isDark ? task.accent : task.accentLight
const topBg = isDark ? task.bg : task.bgLight
const catColor = isDark ? (task.darkLabel ?? task.accent) : (task.lightLabel ?? task.accentLight)
const titleColor = isDark ? 'rgba(255,255,255,0.92)' : '#21211F'
const descColor = isDark ? 'rgba(255,255,255,0.48)' : '#52524E'
const Icon = task.icon

### AnimatedProgress({ progress, isActive, darkText }: { progress: number; isActive: boolean; darkText?: boolean })

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

## 4. Tree

<div ref={containerRef} className="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#E8E8DF] dark:bg-[#1A1A19]">
  <div style={{ display: 'flex', alignItems: 'center', width: DECK_W * deckScale, height: CARD_H * deckScale }}>
    <MotionConfig transformPagePoint={(p) => ({ x: p.x / deckScale, y: p.y / deckScale })}>
    <div style={{ position: 'relative', width: DECK_W, height: CARD_H, flexShrink: 0, transform: \`scale(\${deckScale})\`, transformOrigin: 'top left' }}>
      <motion.div  [map TASKS.map(task => ...)]
        key={task.id}
        style={{ position: 'absolute', left: '50%', top: '50%', width: CARD_W, height: CARD_H, marginLeft: -CARD_W / 2, marginTop: -CARD_H / 2, zIndex: isExiting || isEntering ? 10 : slot.z, borderRadius: 24, overflow: 'hidden', cursor: isFront ? 'grab' : 'default', display: 'flex', flexDirection: 'column', background: cardBg, ...(isFront ? { rotateY: cardRotateY, transformPerspective: 900 } : {}) }}
        animate={isExiting ? { x: exiting!.dir === 'left' ? -480 : 480, y: 100, rotate: exiting!.dir === 'left' ? -22 : 22, scale: 0.85, opacity: 0 } : isEntering ? { x: -480, y: 100, rotate: -22, scale: 0.85, opacity: 0 } : { x: slot.x, y: slot.y, rotate: slot.rotate, scale: slot.scale, opacity: slot.opacity }}
        transition={isExiting ? { duration: 0.42, ease: [0.4, 0, 0.2, 1] } : isEntering ? { duration: 0 } : isReturning ? { duration: 0 } : SPRING}
        whileHover={isExiting ? undefined : isFront ? { scale: 1.03, boxShadow: \`0 10px 36px \${cardBg}30\` } : slotIndex === 1 || slotIndex === 2 ? { opacity: 0.88, scale: slot.scale + 0.015 } : undefined}
        whileTap={isFront ? { scale: 0.98 } : undefined}
        drag={isFront && !dismissing.current ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        onDragStart={() => { dragDelta.current = 0; dragX.set(0) }}
        onDrag={(_, info) => { dragDelta.current = info.offset.x; dragX.set(info.offset.x) }}
        onDragEnd={(_, info) => { dragX.set(0); if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 400) { dismiss(info.offset.x < 0 ? 'left' : 'right') } }}
      >
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', background: topBg, border: \`2px solid \${cardBg}\`, borderRadius: 24, padding: '28px 20px 16px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', position: 'relative' }}>
          <span aria-hidden="true" style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: '50%', border: \`1.5px solid \${catColor}\`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: catColor, flexShrink: 0 }}>
            <ArrowUpRight weight="regular" size={13} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <Icon weight="regular" size={11} style={{ color: catColor }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: catColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}> {task.category}
          <div style={{ height: 28, flexShrink: 0 }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: titleColor, lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0, flexShrink: 0 }}> {task.title}
          <div style={{ height: 10, flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: descColor, lineHeight: 1.6, margin: 0, flex: 1, minHeight: 0, overflow: 'hidden' }}> {task.description}
        <div style={{ padding: '12px 20px 14px', flexShrink: 0 }}>
          <AnimatedProgress progress={task.progress} isActive={isFront} darkText={task.darkOnAccent} />
  <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
    <motion.button  [map ([{ dir: 'left' as const, icon: <CaretLeft weight="regular" size={16} />, label: 'Previous' }, { dir: 'right' as const, icon: <CaretRight weight="regular" size={16} />, label: 'Next' }] as const).map(({ dir, icon, label }) => ...)]
      key={dir}
      onClick={() => dir === 'left' ? showPrevious() : dismiss(dir)}
      aria-label={label}
      style={{ width: 36, height: 36, borderRadius: '50%', border: \`1.5px solid \${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)'}\`, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.28)' }}
      whileHover={{ scale: 1.1, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.18)', color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.55)' }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {icon}

The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

### AnimatedProgress(props)

<div>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
    <span style={{ fontSize: 10, fontWeight: 600, color: labelColor, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}> Progress
    <span style={{ fontSize: 12, fontWeight: 700, color: pctColor }}> {count}%
  <div style={{ height: 5, borderRadius: 3, background: trackBg, overflow: 'hidden' }}>
    <motion.div style={{ height: '100%', borderRadius: 3, background: fillBg }} initial={{ width: '0%' }} animate={{ width: isActive ? progress + '%' : '0%' }} transition={isActive ? { duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 } : { duration: 0 }} />

## 5. Why
- The card frame is not a border element: the outer motion.div is painted \`cardBg\` and the inner panel sits on top with its own \`border: 2px solid \${cardBg}\` plus borderRadius 24, so the accent shows through as frame and footer.
- \`dismissing\` is a ref, not state, so a second swipe or click during the 420ms exit is rejected in the same tick instead of one render late.
- \`orderRef\` mirrors \`order\` only so \`dismiss\` can keep \`[]\` deps and still read the live front id inside its own setTimeout.
- The \`returning\` Set exists because the cycled card teleports from off-screen to the back slot: it forces \`{ duration: 0 }\` for that commit, and the double requestAnimationFrame releases the lock one frame after the teleport has painted, so no fly-back is ever visible.
- Theming is JS, not Tailwind: only the root uses a \`dark:\` class. Everything else reads \`isDark\` from \`useIsDark\`, which prefers the closest \`[data-card-theme]\` ancestor and falls back to documentElement, and whose lazy useState initializer reads the DOM on first render so there is no dark flash.
- The rAF counter (1400ms, cubic ease-out, 300ms delay) and the motion width animation (1.4s, 0.3s delay) are two independent animations tuned to land together; \`isActive\` false resets the count to 0 so only the front card reads a live number.
- rotateY is driven by \`useTransform(dragX, [-200, 0, 200], [14, 0, -14])\` and is spread into style for the front card only, together with transformPerspective 900.
- \`darkOnAccent\` flips the progress label, track, and fill to black alphas on the two light accents. \`darkLabel\` / \`lightLabel\` exist only for task 1, whose accent \`#053F5C\` is too dark to read as a category label.

## 6. Remix
- Palette and content: each TASKS entry carries \`accent\` / \`accentLight\` / \`bg\` / \`bgLight\`; a light accent also needs \`darkOnAccent: true\`, a very dark one needs \`darkLabel\` / \`lightLabel\`.
- Deck geometry: SLOTS x ±108, scale 0.88 / 0.78, opacity 0.7 / 0, plus \`DECK_W = CARD_W + 210\`, which is what gives the peeked cards room.
- Feel: SPRING (stiffness 280, damping 26), the 0.42s exit with ease [0.4, 0, 0.2, 1], and the dismiss thresholds \`|offset.x| > 80\` or \`|velocity.x| > 400\`.

## 7. Check
A line that fails is a bug in your build; fix it and re-check.
- A naked paste fills the viewport: the root is min-h-screen w-full flex flex-col items-center justify-center, and the deck is vertically centred with the chevrons 24px below it.
- Every hex value and every key expression appears unchanged from block 2: #429EBD #2980A0 #0C1E27 #EAF4F8 #053F5C #032F45 #010810 #B8CEDB #2A9DC0 #0A6A8E #F7AD19 #D4900E #1E1608 #FEF8E6 #F27F0C #C96208 #1C1006 #FEF1E4 #21211F #52524E #E8E8DF #1A1A19, with \`key={task.id}\` on the cards and \`key={dir}\` on the buttons.
- Every element carrying initial/animate/exit is a motion.* tag, not a plain tag or a bare icon: the card is motion.div, the chevrons are motion.button wrapping plain carets, and the progress fill is motion.div. The corner circle is a static span wrapping a plain ArrowUpRight with no hover or tap motion.
- Exactly three cards are visible at rest (front, +108, -108); the fourth sits at slot 3 with opacity 0 and scale 0.78 behind the front card.
- Only the front card drags and only the front card's progress counts up; the two peeked cards show 0% and a track with no fill.
- One swipe past 80px, or one Next click, flies the front card to ±480 with y 100 and rotate ±22, and 420ms later the next card is front. The dismissed card reappears in the back slot with no visible travel, and a second dismiss is accepted immediately after. One Previous click snaps the back card to x -480, y 100, rotate -22 with no visible travel, then springs it into the front slot on top of every other card while the old front card moves to the right peek.
- Each card reads as a coloured frame: a 2px accent border and rounded 24px panel on the tinted background, with the same accent as a solid footer strip under it holding PROGRESS and the percentage.
- Toggling the page or card theme repaints every card instantly through \`isDark\`, with no reload and no flash of the wrong palette on first paint.`,
}
