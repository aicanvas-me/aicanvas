import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `# AvatarPicker

A swipeable stack of four crew portrait cards with drag-to-dismiss, tap-to-select and a dots indicator.

## 1. Setup

// npm install framer-motion

File: components-workspace/avatar-picker/index.tsx  ·  'use client'  ·  export default function AvatarPicker()

\`\`\`tsx
import { useState, useLayoutEffect, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Check } from '@/components/icons/check'
\`\`\`

Both framer-motion imports matter: \`motion\` is used for the cards, the dots, the confirm button and the hint text. This component is animated end to end. There is no AnimatePresence import and none is needed. \`Check\` is an AI Canvas icon (Line style, 1.5px stroke). Install each icon with npx shadcn@latest add https://aicanvas.me/r/icon-<name>.json.

## 2. Constants

\`\`\`tsx
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const CARD_W = 174
const CARD_H = 218
const RADIUS = 20

interface Photo {
  id: number
  name: string
  role: string
  url: string
}

const PHOTOS: Photo[] = [
  {
    id: 0,
    name: 'Capt. Vroom',
    role: 'Asteroid Hugger',
    url: 'https://images.unsplash.com/photo-1698327615546-7f30183aa4e3?w=400&h=500&fit=crop&auto=format&q=80',
  },
  {
    id: 1,
    name: 'Zork',
    role: 'Zero-G Chef',
    url: 'https://images.unsplash.com/photo-1541873676-a18131494184?w=400&h=500&fit=crop&auto=format&q=80',
  },
  {
    id: 2,
    name: 'Dronk',
    role: 'Space Surfer',
    url: 'https://images.unsplash.com/photo-1691379635079-9f438036ea58?w=400&h=500&fit=crop&auto=format&q=80',
  },
  {
    id: 3,
    name: 'Gloop',
    role: 'Nebula Napper',
    url: 'https://images.unsplash.com/photo-1536697246787-1f7ae568d89a?w=400&h=500&fit=crop&auto=format&q=80',
  },
]

// Slot layout: [front, right, left, back]
const SLOTS = [
  { x: 0,   y: 0,   rotate: 1.5,  scale: 1,    z: 4 },
  { x: 52,  y: -8,  rotate: 8,    scale: 0.92, z: 3 },
  { x: -46, y: -4,  rotate: -9,   scale: 0.90, z: 2 },
  { x: 4,   y: 26,  rotate: 3.5,  scale: 0.86, z: 1 },
]

const SPRING = { type: 'spring' as const, stiffness: 280, damping: 26 }
\`\`\`

## 3. State

\`\`\`tsx
const containerRef = useRef<HTMLDivElement>(null)

// order[i] = photo ID at slot i (0 = front, 3 = back)
const [order, setOrder] = useState<number[]>([0, 1, 2, 3])
const [selectedId, setSelectedId] = useState<number | null>(null)
const [exiting, setExiting] = useState<{ id: number; dir: 'left' | 'right' } | null>(null)
// IDs that just returned to back slot and need an instant (duration:0) transition
const [returning, setReturning] = useState<Set<number>>(new Set())

// Refs for use inside stable callbacks
const orderRef = useRef(order)
const dismissing = useRef(false)
const dragDelta = useRef(0)
useIsomorphicLayoutEffect(() => { orderRef.current = order }, [order])

const dismiss = useCallback((dir: 'left' | 'right') => {
  if (dismissing.current) return
  dismissing.current = true
  const frontId = orderRef.current[0]
  setExiting({ id: frontId, dir })

  // After exit animation (420ms), snap card to back and resume normal animations
  setTimeout(() => {
    setReturning(prev => new Set([...prev, frontId]))
    setOrder(prev => [...prev.slice(1), prev[0]])
    setExiting(null)
    // Two RAFs: first lets the snap render, second re-enables spring transitions
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setReturning(prev => {
        const s = new Set(prev)
        s.delete(frontId)
        return s
      })
      dismissing.current = false
    }))
  }, 420)
}, [])

const handleSelect = useCallback(() => {
  const frontId = orderRef.current[0]
  setSelectedId(prev => prev === frontId ? null : frontId)
}, [])
\`\`\`

## 4. Tree

Text children are deleted except literal copy, which is kept after a → because it cannot be regenerated.

\`\`\`
div ref={containerRef} className="relative flex min-h-screen w-full select-none flex-col items-center justify-center gap-8 bg-[#E8E8DF] dark:bg-[#1A1A19]"
  p className="text-[#21211F] dark:text-white/35" style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', fontFamily: 'var(--font-sans, sans-serif)' }}   → Meet the Crew
  div style={{ position: 'relative', width: CARD_W, height: CARD_H }}
    motion.div [map PHOTOS.map(photo => ...)]
      locals: const slotIndex = order.indexOf(photo.id) / const slot = SLOTS[slotIndex] / const isExiting = exiting?.id === photo.id / const isReturning = returning.has(photo.id) / const isFront = slotIndex === 0 && !isExiting / const isSelected = selectedId === photo.id
      key={photo.id}
      style={{ position: 'absolute', left: '50%', top: '50%', width: CARD_W, height: CARD_H, marginLeft: -CARD_W / 2, marginTop: -CARD_H / 2, zIndex: isExiting ? 10 : slot.z, borderRadius: RADIUS, overflow: 'hidden', cursor: isFront ? 'grab' : 'default', boxShadow: slotIndex === 0 ? '0 24px 64px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.25)' : '0 6px 20px rgba(0,0,0,0.25)' }}
      animate={isExiting ? { x: exiting!.dir === 'left' ? -460 : 460, y: 150, rotate: exiting!.dir === 'left' ? -22 : 22, scale: 0.85, opacity: 0 } : { x: slot.x, y: slot.y, rotate: slot.rotate, scale: slot.scale, opacity: 1 }}
      transition={isExiting ? { duration: 0.4, ease: [0.4, 0, 0.2, 1] } : isReturning ? { duration: 0 } : SPRING}
      drag={isFront ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      whileDrag={{ cursor: 'grabbing' }}
      onDragStart={() => { dragDelta.current = 0 }}
      onDrag={(_, info) => { dragDelta.current = info.offset.x }}
      onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 400) { dismiss(info.offset.x < 0 ? 'left' : 'right') } }}
      onClick={() => { if (isFront && Math.abs(dragDelta.current) < 8) handleSelect() }}
        img src={photo.url} alt={photo.name} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '36px 14px 14px', background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}
          div style={{ minWidth: 0 }}
            p style={{ color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: 0.2, margin: 0, lineHeight: 1.2, fontFamily: 'var(--font-sans, sans-serif)' }}   → {photo.name}
            p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 400, margin: '2px 0 0', letterSpacing: 0.3, fontFamily: 'var(--font-sans, sans-serif)' }}   → {photo.role}
          [if isSelected] motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: 24, height: 24, borderRadius: '50%', background: '#2DD4BF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            Check size={13} strokeWidth={2} color="#0f2e2b"
        [if isSelected] div style={{ position: 'absolute', inset: 0, borderRadius: RADIUS, border: '2.5px solid #2DD4BF', pointerEvents: 'none' }}
  div style={{ display: 'flex', gap: 5, alignItems: 'center' }}
    motion.div [map PHOTOS.map(photo => ...)]
      locals: const isCurrent = order[0] === photo.id
      key={photo.id}
      className="bg-[#21211F] dark:bg-white"
      animate={{ width: isCurrent ? 20 : 5, opacity: isCurrent ? 1 : 0.28 }}
      style={{ height: 5, borderRadius: 3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
  div style={{ height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    [if selectedId !== null] motion.button key="confirmed" initial={{ opacity: 0, scale: 0.88, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} onClick={() => setSelectedId(null)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2DD4BF', borderRadius: 20, padding: '7px 18px', border: 'none', cursor: 'pointer' }}
      Check size={13} strokeWidth={2} color="#0f2e2b"
      span style={{ fontSize: 11, fontWeight: 700, color: '#0f2e2b', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-sans, sans-serif)' }}   → {PHOTOS.find(p => p.id === selectedId)?.name} Selected
    [else] motion.p key="hint" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-[#21211F] dark:text-white/35" style={{ margin: 0, fontSize: 11, fontFamily: 'var(--font-sans, sans-serif)', letterSpacing: '0.05em' }}   → swipe to browse
\`\`\`

The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

## 5. Why

- No AnimatePresence anywhere: the dismissed card never unmounts. \`setTimeout(..., 420)\` fires 20ms after the 0.4s exit tween, then the same element is re-pointed at the back slot.
- \`returning\` exists only to make that re-point instant. Without \`{ duration: 0 }\` on that one frame the card visibly springs back across the screen from x:±460 instead of reappearing at the back.
- The two nested \`requestAnimationFrame\` calls are the ordering constraint: frame one commits the duration:0 snap, frame two clears the id so later slot moves use SPRING again. Collapse them into one and the snap animates.
- \`dismissing\` is a ref, not state, so the re-entry guard is read synchronously. Drop it and a fast second swipe rotates \`order\` twice against a single exit.
- \`orderRef\` mirrors \`order\` because \`dismiss\` and \`handleSelect\` are \`useCallback\` with \`[]\` deps and would otherwise permanently close over \`[0,1,2,3]\`.
- \`key={photo.id}\` and the map over \`PHOTOS\` (never over \`order\`) keep each card mounted as its own DOM node while only its slot changes, which is what lets framer tween x/y/rotate/scale between slots. Mapping \`order\` or keying by index swaps nodes and kills the motion.
- Cards are centred by \`left:50% top:50%\` plus negative half-margins, so every x/y in \`animate\` is a transform offset from that centre, not a layout position. The parent needs \`position: 'relative'\` with explicit CARD_W/CARD_H or the whole stack has nothing to sit in.
- \`onClick\` fires after a drag too, so \`dragDelta.current\` under 8px is the only thing separating tap-to-select from swipe. The label and hint take their colours from className.

## 6. Remix

- \`SLOTS\` is the whole fan. Change x/y/rotate/scale/z per row for a tighter deck, a wider spread, or a straight pile. Row 0 is the front card and its z must stay the highest.
- \`SPRING\` (stiffness 280, damping 26) drives every slot move, and the separate \`{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }\` drives the fling. Tune them together, and keep the 420ms timeout above the fling duration.
- \`PHOTOS\` swaps the cast, and \`CARD_W\` / \`CARD_H\` / \`RADIUS\` reshape the card. If you change CARD_W or CARD_H the negative half-margins follow automatically because they read \`-CARD_W / 2\` and \`-CARD_H / 2\`.

## 7. Check

A line that fails is a bug in your build; fix it and re-check.

- A naked paste fills the viewport: the root carries min-h-screen w-full and the stack sits centred, not squashed at the top.
- Every hex value and every key expression appears unchanged from block 2: #E8E8DF, #1A1A19, #21211F, #2DD4BF, #0f2e2b, #fff, rgba(0,0,0,0.72), rgba(255,255,255,0.5), and all four Unsplash URLs including their \`?w=400&h=500&fit=crop&auto=format&q=80\` query strings.
- Every element carrying initial/animate/exit is a motion.* tag, not a plain tag or a bare icon: the card, the check badge, each dot, the confirm button and the hint paragraph. The \`Check\` icon is a plain child inside a motion.div, never animated itself.
- Drag the front card past 80px and release: it flies out, and roughly 420ms later it is sitting at the back of the stack with no visible return flight. Repeat four times and you are back at Capt. Vroom in front.
- Swipe twice in quick succession: only one card leaves per gesture, and \`order\` never advances by two.
- Tap the front card: a 2.5px #2DD4BF ring appears on the card, a 24px teal circle with the check appears bottom-right of the gradient, and the action row swaps the hint for the teal pill reading NAME SELECTED in #0f2e2b. Tap that pill and selection clears, with the "swipe to browse" hint fading back in.
- The active dot is 20px wide at full opacity, the other three are 5px at 0.28, and the widening follows the front card after every swipe.
- Toggle \`dark\` on \`document.documentElement\` at runtime: the background, the label and the dots flip without a reload, because every colour comes from a dark: class.`,
}
