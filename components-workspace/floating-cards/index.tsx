'use client'

// npm install @phosphor-icons/react framer-motion

import { useRef, useState, useLayoutEffect, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Buildings, ArrowUpRight } from '@phosphor-icons/react'
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect


const CARD_W = 280
const CARD_H = 200

const CARDS = [
  { title: 'Maafushi',   sub: 'Crystal waters',    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=520&q=80&fit=crop&crop=center', country: 'Maldives',    hotels: 120 },
  { title: 'Swiss Alps', sub: 'Powder & peaks',    img: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=520&q=80&fit=crop&crop=center', country: 'Switzerland', hotels: 87  },
  { title: 'Bali',       sub: 'Sun-soaked shores', img: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=520&q=80&fit=crop&crop=center', country: 'Indonesia',   hotels: 250 },
] as const

const POSITIONS = [
  { x:  12, y: -32, rotate:  6, zIndex: 1, opacity: 1.00 },
  { x:   6, y: -18, rotate:  4, zIndex: 2, opacity: 1.00 },
  { x:   0, y:   0, rotate:  0, zIndex: 3, opacity: 1.00 },
] as const

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0)
  useIsomorphicLayoutEffect(() => {
    if (!active) { setValue(0); return }
    const duration = 900
    const steps = 40
    const interval = duration / steps
    let step = 0
    const id = setInterval(() => {
      step++
      setValue(Math.round((step / steps) * target))
      if (step >= steps) clearInterval(id)
    }, interval)
    return () => clearInterval(id)
  }, [active, target])
  return value
}

function HotelsCounter({ target, active }: { target: number; active: boolean }) {
  const value = useCountUp(target, active)
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
    }}>
      <Buildings weight="regular" size={16} style={{ color: '#E8E8DF', opacity: 0.55 }} />
      <span style={{
        fontSize: 10,
        fontWeight: 500,
        color: 'rgba(255,255,255,0.55)',
        letterSpacing: '0.04em',
        fontVariantNumeric: 'tabular-nums',
      }}>
        hotels <span style={{ color: 'rgba(255,255,255,0.85)', marginLeft: 2 }}>{value}</span>
      </span>
    </div>
  )
}

export default function FloatingCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDark, setIsDark] = useState(() => typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false)
  const [order, setOrder] = useState<[number, number, number]>([0, 1, 2])
  const [isShuffling, setIsShuffling] = useState(false)
  const [exitingCard, setExitingCard] = useState<number | null>(null)

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const check = () => {
      const card = el.closest('[data-card-theme]')
      setIsDark(card ? card.classList.contains('dark') : document.documentElement.classList.contains('dark'))
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = el.closest('[data-card-theme]')
    if (cardWrapper) observer.observe(cardWrapper, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])


  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: isDark ? '#110F0C' : '#F5F1EA' }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />


      <div style={{ position: 'relative', width: CARD_W, height: CARD_H }}>
        {CARDS.map((card, i) => {
          const posIndex = order.indexOf(i)
          const pos = POSITIONS[posIndex]
          const isFront = posIndex === 2
          const isExiting = exitingCard === i
          return (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: CARD_W,
                height: CARD_H,
                cursor: isFront ? 'grab' : 'default',
                borderRadius: 16,
                background: '#2A2825',
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: isDark
                  ? '8px -8px 24px rgba(0,0,0,0.35)'
                  : '8px -8px 24px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                overflow: 'hidden',
                padding: 0,
              }}
              drag={isFront && !isShuffling ? 'y' : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              dragMomentum={false}
              onDragEnd={(_e, info) => {
                if (!isFront || isShuffling) return
                if (info.offset.y > 80 || info.velocity.y > 400) {
                  setIsShuffling(true)
                  setExitingCard(i)
                }
              }}
              animate={isExiting
                ? { y: 600, rotate: 8, opacity: 0 }
                : { x: pos.x, y: pos.y, rotate: pos.rotate, zIndex: pos.zIndex, opacity: pos.opacity }
              }
              transition={isExiting
                ? { duration: 0.45, ease: 'easeIn' }
                : { type: 'spring', stiffness: 80, damping: 16 }
              }
              onAnimationComplete={() => {
                if (isExiting) {
                  setExitingCard(null)
                  setOrder(prev => [prev[2], prev[0], prev[1]])
                  setTimeout(() => setIsShuffling(false), 400)
                }
              }}
            >
              <div style={{
                padding: '10px 10px 0',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flex: '0 0 auto',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <HotelsCounter target={card.hotels} active={isFront && !isExiting} />

                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: '#BECF5D',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ArrowUpRight weight="bold" size={13} style={{ color: '#1A1A19' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <p style={{
                    fontSize: 17,
                    fontWeight: 800,
                    lineHeight: 1.15,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                    margin: 0,
                  }}>
                    {card.title}
                  </p>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.45)',
                    letterSpacing: '0.04em',
                  }}>
                    {card.country}
                  </span>
                </div>
              </div>

              <div style={{
                margin: '8px 6px 6px',
                borderRadius: 12,
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: `url(${card.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}>
              </div>
            </motion.div>
          )
        })}
      </div>

      <p
        style={{
          position: 'absolute',
          bottom: 24,
          fontSize: 11,
          color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
          letterSpacing: '0.05em',
        }}
      >
        swipe down to shuffle
      </p>
    </div>
  )
}
