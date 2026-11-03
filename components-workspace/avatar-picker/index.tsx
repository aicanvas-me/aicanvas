'use client'

// npm install @phosphor-icons/react framer-motion

import { useState, useLayoutEffect, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Check } from '@phosphor-icons/react'
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

const SLOTS = [
  { x: 0,   y: 0,   rotate: 1.5,  scale: 1,    z: 4 },
  { x: 52,  y: -8,  rotate: 8,    scale: 0.92, z: 3 },
  { x: -46, y: -4,  rotate: -9,   scale: 0.90, z: 2 },
  { x: 4,   y: 26,  rotate: 3.5,  scale: 0.86, z: 1 },
]

const SPRING = { type: 'spring' as const, stiffness: 280, damping: 26 }

export default function AvatarPicker() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDark, setIsDark] = useState(() => typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false)

  const [order, setOrder] = useState<number[]>([0, 1, 2, 3])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [exiting, setExiting] = useState<{ id: number; dir: 'left' | 'right' } | null>(null)
  const [returning, setReturning] = useState<Set<number>>(new Set())

  const orderRef = useRef(order)
  const dismissing = useRef(false)
  const dragDelta = useRef(0)
  useIsomorphicLayoutEffect(() => { orderRef.current = order }, [order])

  useIsomorphicLayoutEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

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

  const labelColor = isDark ? 'rgba(255,255,255,0.35)' : '#1a1a18'

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full select-none flex-col items-center justify-center gap-8 bg-[#E8E8DF] dark:bg-[#1A1A19]"
    >
      <p
        className="text-[#21211F] dark:text-white/35"
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.13em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-sans, sans-serif)',
        }}
      >
        Meet the Crew
      </p>

      <div style={{ position: 'relative', width: CARD_W, height: CARD_H }}>
        {PHOTOS.map(photo => {
          const slotIndex = order.indexOf(photo.id)
          const slot = SLOTS[slotIndex]
          const isExiting = exiting?.id === photo.id
          const isReturning = returning.has(photo.id)
          const isFront = slotIndex === 0 && !isExiting
          const isSelected = selectedId === photo.id

          return (
            <motion.div
              key={photo.id}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: CARD_W,
                height: CARD_H,
                marginLeft: -CARD_W / 2,
                marginTop: -CARD_H / 2,
                zIndex: isExiting ? 10 : slot.z,
                borderRadius: RADIUS,
                overflow: 'hidden',
                cursor: isFront ? 'grab' : 'default',
                boxShadow: slotIndex === 0
                  ? '0 24px 64px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.25)'
                  : '0 6px 20px rgba(0,0,0,0.25)',
              }}
              animate={
                isExiting
                  ? {
                      x: exiting!.dir === 'left' ? -460 : 460,
                      y: 150,
                      rotate: exiting!.dir === 'left' ? -22 : 22,
                      scale: 0.85,
                      opacity: 0,
                    }
                  : {
                      x: slot.x,
                      y: slot.y,
                      rotate: slot.rotate,
                      scale: slot.scale,
                      opacity: 1,
                    }
              }
              // The exit duration must stay within the 420 ms timeout in dismiss().
              transition={
                isExiting
                  ? { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
                  : isReturning
                    ? { duration: 0 }
                    : SPRING
              }
              drag={isFront ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              whileDrag={{ cursor: 'grabbing' }}
              onDragStart={() => { dragDelta.current = 0 }}
              onDrag={(_, info) => { dragDelta.current = info.offset.x }}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 400) {
                  dismiss(info.offset.x < 0 ? 'left' : 'right')
                }
              }}
              onClick={() => {
                if (isFront && Math.abs(dragDelta.current) < 8) handleSelect()
              }}
            >
              <img
                src={photo.url}
                alt={photo.name}
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />

              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                padding: '36px 14px 14px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: 8,
              }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: 0.2,
                    margin: 0,
                    lineHeight: 1.2,
                    fontFamily: 'var(--font-sans, sans-serif)',
                  }}>
                    {photo.name}
                  </p>
                  <p style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 11,
                    fontWeight: 400,
                    margin: '2px 0 0',
                    letterSpacing: 0.3,
                    fontFamily: 'var(--font-sans, sans-serif)',
                  }}>
                    {photo.role}
                  </p>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#2DD4BF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={13} weight="bold" color="#0f2e2b" />
                  </motion.div>
                )}
              </div>

              {isSelected && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: RADIUS,
                  border: '2.5px solid #2DD4BF',
                  pointerEvents: 'none',
                }} />
              )}
            </motion.div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {PHOTOS.map(photo => {
          const isCurrent = order[0] === photo.id
          return (
            <motion.div
              key={photo.id}
              className="bg-[#21211F] dark:bg-white"
              animate={{
                width: isCurrent ? 20 : 5,
                opacity: isCurrent ? 1 : 0.28,
              }}
              style={{ height: 5, borderRadius: 3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )
        })}
      </div>

      <div style={{ height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {selectedId !== null ? (
          <motion.button
            key="confirmed"
            initial={{ opacity: 0, scale: 0.88, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={() => setSelectedId(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#2DD4BF',
              borderRadius: 20,
              padding: '7px 18px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Check size={13} weight="bold" color="#0f2e2b" />
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#0f2e2b',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-sans, sans-serif)',
            }}>
              {PHOTOS.find(p => p.id === selectedId)?.name} Selected
            </span>
          </motion.button>
        ) : (
          <motion.p
            key="hint"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#21211F] dark:text-white/35"
            style={{
              margin: 0,
              fontSize: 11,
              fontFamily: 'var(--font-sans, sans-serif)',
              letterSpacing: '0.05em',
            }}
          >
            swipe to browse
          </motion.p>
        )}
      </div>
    </div>
  )
}
