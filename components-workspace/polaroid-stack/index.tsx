'use client'

// npm install framer-motion

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect



interface CardData {
  id: number
  label: string
  from: string
  to: string
}

interface Pos {
  x: number
  y: number
  rotate: number
}



const CARD_W = 110
const CARD_H = 140




// 160 must match the largest |x| in FANNED, or narrow containers clip the outer cards.
const STAGE_W = 2 * (160 + CARD_W / 2) + 32
const STAGE_H = 220

const CARDS: CardData[] = [
  { id: 0, label: 'Sunset', from: '#FF6B6B', to: '#FF8E53' },
  { id: 1, label: 'Ocean',  from: '#14B8A6', to: '#67E8F9' },
  { id: 2, label: 'Dream',  from: '#8B5CF6', to: '#C4B5FD' },
  { id: 3, label: 'Golden', from: '#F59E0B', to: '#FDE68A' },
  { id: 4, label: 'Mist',   from: '#64748B', to: '#CBD5E1' },
]


const STACKED: Pos[] = [
  { x: -6, y:  2, rotate: -12 },
  { x:  3, y: -4, rotate:  -5 },
  { x:  1, y:  1, rotate:   2 },
  { x: -4, y:  3, rotate:   8 },
  { x:  5, y: -2, rotate:  14 },
]


const FANNED: Pos[] = [
  { x: -160, y: 30, rotate: -22 },
  { x:  -80, y:  8, rotate: -11 },
  { x:    0, y: -4, rotate:   0 },
  { x:   80, y:  8, rotate:  11 },
  { x:  160, y: 30, rotate:  22 },
]



export default function PolaroidStack() {
  const [fanned, setFanned] = useState(false)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useIsomorphicLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const update = () => {
      const next = Math.min(1, el.clientWidth / STAGE_W)
      setScale(Number.isFinite(next) && next > 0 ? next : 1)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const toggle = () => {
    setFanned((f) => !f)
    setHoveredId(null)
    setSelectedId(null)
  }

  return (
    <div
      ref={rootRef}
      className="relative flex h-full w-full cursor-pointer select-none items-center justify-center overflow-hidden bg-zinc-950"
      onClick={toggle}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap');`}</style>
        <motion.div
          className="relative"
          animate={{ scale }}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
          style={{ width: STAGE_W, height: STAGE_H }}
        >
          {CARDS.map((card, i) => {
            const pos = fanned ? FANNED[i] : STACKED[i]
            const isHovered = fanned && hoveredId === card.id && selectedId !== card.id
            const isSelected = fanned && selectedId === card.id

            return (
              <motion.div
                key={card.id}
                className="absolute left-1/2 top-1/2"
                animate={{
                  x: pos.x - CARD_W / 2,
                  y: pos.y - CARD_H / 2,
                  rotate: isSelected ? 0 : pos.rotate,
                }}
                style={{ zIndex: isSelected ? 30 : isHovered ? 20 : i }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 22,
                  delay: fanned
                    ? i * 0.06
                    : (CARDS.length - 1 - i) * 0.05,
                }}
              >
                <motion.div
                  animate={{
                    y: isSelected ? -28 : isHovered ? -18 : 0,
                    scale: isSelected ? 1.4 : isHovered ? 1.1 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  style={{ cursor: fanned ? 'pointer' : 'inherit' }}
                  onHoverStart={() => { if (fanned) setHoveredId(card.id) }}
                  onHoverEnd={() => setHoveredId(null)}
                  onClick={(e) => {
                    if (!fanned) return
                    e.stopPropagation()
                    setSelectedId((id) => (id === card.id ? null : card.id))
                    setHoveredId(null)
                  }}
                >
                  <div
                    style={{
                      width: CARD_W,
                      height: CARD_H,
                      backgroundColor: '#ffffff',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '8px 8px 0 8px',
                      boxShadow: isSelected
                        ? '0 32px 64px rgba(0,0,0,0.7), 0 12px 24px rgba(0,0,0,0.4)'
                        : isHovered
                          ? '0 20px 40px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.3)'
                          : '0 4px 20px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.15)',
                      transition: 'box-shadow 0.25s ease',
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        height: 93,
                        background: `linear-gradient(135deg, ${card.from}, ${card.to})`,
                      }}
                    />

                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "'Caveat', cursive",
                          fontSize: 16,
                          fontWeight: 600,
                          color: '#3f3f46',
                          margin: 0,
                          lineHeight: 1,
                        }}
                      >
                        {card.label}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.p
          key={`${String(fanned)}-${String(selectedId !== null)}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-6 text-xs text-zinc-500"
          style={{
            pointerEvents: 'none',
            fontFamily: 'var(--font-sans, sans-serif)',
            letterSpacing: '0.03em',
          }}
        >
          {!fanned
            ? 'click to fan out'
            : selectedId !== null
              ? 'click card again to deselect'
              : 'click a card · click bg to stack'}
        </motion.p>
    </div>
  )
}
