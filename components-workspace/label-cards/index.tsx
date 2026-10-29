'use client'

// npm install framer-motion

import { useRef, useState, useLayoutEffect, useEffect } from 'react'
import { motion } from 'framer-motion'
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect




const BASE_CARD_W = 300
const BASE_CARD_H = 169



const CARDS = [
  {
    id: 0,
    title: 'Mobile Apps',
    sub1: 'Native iOS & Android',
    sub2: 'Interaction Design',
    since: '2023',
    bg: '#5CAD60',
    fg: '#162217',
    idle: { x: -82, y: -70, rotate: -11 },
  },
  {
    id: 1,
    title: 'Web Design',
    sub1: 'React & Next.js',
    sub2: 'Frontend Systems',
    since: '2021',
    bg: '#EDD540',
    fg: '#241F05',
    idle: { x: -48, y: 66, rotate: 9 },
  },
  {
    id: 2,
    title: 'Branding',
    sub1: 'Visual Identity',
    sub2: 'Brand Strategy',
    since: '2020',
    bg: '#1C2E8A',
    fg: '#E8EDF8',
    idle: { x: 12, y: -14, rotate: -4 },
  },
  {
    id: 3,
    title: 'Editorial',
    sub1: 'Magazine & Print',
    sub2: 'Typography Systems',
    since: '2022',
    bg: '#D43C3C',
    fg: '#FAE8E8',
    idle: { x: 68, y: 62, rotate: 14 },
  },
  {
    id: 4,
    title: 'Motion',
    sub1: 'Animation & Micro-UX',
    sub2: 'Interaction Patterns',
    since: '2023',
    bg: '#E08030',
    fg: '#2A1A06',
    idle: { x: 84, y: -86, rotate: 18 },
  },
]

const CARD_WIDTH_DIVISOR = 2 * Math.max(
  ...CARDS.map(card => {
    const radians = card.idle.rotate * Math.PI / 180
    return Math.abs(card.idle.x)
      + BASE_CARD_W / 2 * Math.abs(Math.cos(radians))
      + (BASE_CARD_W * 9 / 16) / 2 * Math.abs(Math.sin(radians))
  }),
  1.05 * BASE_CARD_W / 2,
) / BASE_CARD_W

const BAR_PATTERN = [1,2,1,1,3,1,2,1,1,3,1,1,2,1,2,1,3,1,1,2,1,3,1,2,1,1,2,1]

const SPRING_SCATTER = { type: 'spring' as const, stiffness: 240, damping: 24 }
const SPRING_FOCUS   = { type: 'spring' as const, stiffness: 340, damping: 28 }



function Barcode({ color, scale }: { color: string; scale: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', height: 28 * scale, gap: 1.2 * scale }}>
      {BAR_PATTERN.map((w, i) => (
        <div
          key={i}
          style={{ width: w * 1.5 * scale, background: color, opacity: 0.8, borderRadius: 0.5 }}
        />
      ))}
    </div>
  )
}

function LogoMark({ color, scale }: { color: string; scale: number }) {
  const size = 28 * scale
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 * scale }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `${1.5 * scale}px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.85,
        }}
      >
        <span style={{ fontSize: 7.5 * scale, fontWeight: 800, color, letterSpacing: '0.02em', lineHeight: 1 }}>
          AI
        </span>
      </div>
      <span style={{ fontSize: 6.5 * scale, fontWeight: 700, color, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7 }}>
        CANVAS
      </span>
    </div>
  )
}



export default function LabelCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDark, setIsDark] = useState(() => typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false)
  const [selected, setSelected] = useState<number | null>(null)
  const [containerW, setContainerW] = useState(480)

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const checkTheme = () => {
      const card = el.closest('[data-card-theme]')
      setIsDark(
        card ? card.classList.contains('dark') : document.documentElement.classList.contains('dark'),
      )
    }
    checkTheme()
    const themeObs = new MutationObserver(checkTheme)
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = el.closest('[data-card-theme]')
    if (cardWrapper) themeObs.observe(cardWrapper, { attributes: true, attributeFilter: ['class'] })

    const sizeObs = new ResizeObserver(entries => {
      setContainerW(entries[0].contentRect.width)
    })
    sizeObs.observe(el)

    return () => { themeObs.disconnect(); sizeObs.disconnect() }
  }, [])

  // Scale to fit the widest rotated idle card or the enlarged selected card.
  const cardW  = Math.min(BASE_CARD_W, Math.floor(containerW / CARD_WIDTH_DIVISOR))
  const cardH  = Math.round(cardW * 9 / 16)
  const scale  = cardW / BASE_CARD_W

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#E8E8DF] dark:bg-[#1A1A19]"
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle, ${
            isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'
          } 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {CARDS.map(card => {
        const isSelected = selected === card.id

        return (
          <motion.div
            key={card.id}
            style={{
              position: 'absolute',
              width: cardW,
              height: cardH,
              borderRadius: 10 * scale,
              overflow: 'hidden',
              cursor: 'pointer',
              background: card.bg,
              boxShadow: '0 10px 36px rgba(0,0,0,0.32)',
              userSelect: 'none',
            }}
            animate={
              isSelected
                ? { x: 0, y: 0, rotate: 0, scale: 1.05, zIndex: 10, opacity: 1 }
                : {
                    x: card.idle.x * scale,
                    y: card.idle.y * scale,
                    rotate: card.idle.rotate,
                    scale: 1,
                    zIndex: 2,
                    opacity: 1,
                  }
            }
            transition={isSelected ? SPRING_FOCUS : SPRING_SCATTER}
            onClick={() => setSelected(prev => (prev === card.id ? null : card.id))}
          >
            <div
              style={{
                height: '100%',
                padding: `${12 * scale}px ${14 * scale}px ${11 * scale}px`,
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 9 * scale,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 * scale }}>
                  <span style={{ fontSize: 16 * scale, fontWeight: 900, color: card.fg, lineHeight: 1, opacity: 0.9 }}>
                    ✳
                  </span>
                  <span style={{ fontSize: 18 * scale, fontWeight: 800, color: card.fg, letterSpacing: '-0.025em', lineHeight: 1 }}>
                    {card.title}
                  </span>
                </div>
                <span style={{ fontSize: 9 * scale, fontWeight: 600, color: card.fg, opacity: 0.5, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Since {card.since}
                </span>
              </div>

              <div style={{ height: 1, background: card.fg, opacity: 0.22, marginBottom: 9 * scale, flexShrink: 0 }} />

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 11.5 * scale, fontWeight: 600, color: card.fg, lineHeight: 1.35 }}>
                    {card.sub1}
                  </p>
                  <p style={{ margin: `${3 * scale}px 0 0`, fontSize: 11 * scale, fontWeight: 400, color: card.fg, opacity: 0.6, lineHeight: 1.35 }}>
                    {card.sub2}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <Barcode color={card.fg} scale={scale} />
                  <LogoMark color={card.fg} scale={scale} />
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}

      <motion.p
        style={{
          position: 'absolute',
          bottom: 20,
          fontSize: 11,
          letterSpacing: '0.05em',
          color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
          pointerEvents: 'none',
        }}
        animate={{ opacity: selected !== null ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        tap a card to focus
      </motion.p>
    </div>
  )
}
