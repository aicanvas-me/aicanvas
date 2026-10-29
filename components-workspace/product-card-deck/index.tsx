'use client'

// npm install framer-motion @phosphor-icons/react

import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  usePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion'
import { Check } from '@phosphor-icons/react'




interface CardData {
  title: string
  image: string
  label?: string
}

const CARDS: CardData[] = [
  {
    title: '',
    image: 'https://ik.imagekit.io/aitoolkit/product-card-deck/mural.jpg?tr=w-600',
  },
  {
    title: 'Dreamer backpack',
    label: 'Shop',
    image: 'https://ik.imagekit.io/aitoolkit/product-card-deck/backpack.jpg?tr=w-600',
  },
  {
    title: 'Creator graffiti tee',
    label: 'Shop',
    image: 'https://ik.imagekit.io/aitoolkit/product-card-deck/tee.jpg?tr=w-600',
  },
  {
    title: 'Dreamer high-tops',
    label: 'Shop',
    image: 'https://ik.imagekit.io/aitoolkit/product-card-deck/sneaker.jpg?tr=w-600',
  },
  {
    title: 'Denim jacket',
    label: 'Shop',
    image: 'https://ik.imagekit.io/aitoolkit/product-card-deck/jacket.jpg?tr=w-600',
  },
]





// SLOT_Y, SLOT_SCALE and SLOT_OPACITY need one entry per visible slot.
const VISIBLE = 4
const SLOT_Y = [0, 12, 24, 36]
const SLOT_SCALE = [1, 0.95, 0.9, 0.86]
const SLOT_OPACITY = [1, 1, 0.92, 0.82]

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 }



function CardFace({
  card,
  isTop,
  isAdded,
  onToggleAdded,
}: {
  card: CardData
  isTop: boolean
  isAdded: boolean
  onToggleAdded: () => void
}) {
  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{
        borderRadius: 22,
        backgroundColor: '#D3DDEE',
        boxShadow: isTop
          ? '0 30px 60px rgba(0,0,0,0.30), 0 10px 20px rgba(0,0,0,0.20)'
          : '0 14px 30px rgba(0,0,0,0.18)',
      }}
    >
      <div className="relative w-full" style={{ flex: 1, minHeight: 0 }}>
        <img
          src={card.image}
          alt={card.title || 'Urban Canvas'}
          draggable={false}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {card.title && (
        <div
          className="flex items-center justify-between"
          style={{ flexShrink: 0, gap: 12, padding: '12px 12px 12px 16px' }}
        >
          <h3
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: 16,
              fontWeight: 700,
              lineHeight: 1.4,
              letterSpacing: '-0.01em',
              color: '#111111',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {card.title}
          </h3>
          {card.label && (
            <motion.button
              type="button"
              layout
              layoutDependency={isAdded}
              aria-pressed={isAdded}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation()
                onToggleAdded()
              }}
              whileHover={{ scale: 1.06, backgroundColor: '#2C2825' }}
              whileTap={{ scale: 0.93, backgroundColor: '#000000' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                flexShrink: 0,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: '#141312',
                color: '#F5F1E8',
                borderRadius: 9999,
                padding: '8px 16px',
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.01em',
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isAdded ? 'added' : 'shop'}
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                  style={{ display: 'flex', alignItems: 'center', gap: isAdded ? 4 : 0 }}
                >
                  {isAdded && <Check size={14} weight="regular" aria-hidden="true" />}
                  {isAdded ? 'Added' : card.label}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      )}
    </div>
  )
}







function FlickCard({
  card,
  slot,
  isTop,
  isAdded,
  onFlick,
  onToggleAdded,
}: {
  card: CardData
  slot: number
  isTop: boolean
  isAdded: boolean
  onFlick: () => void
  onToggleAdded: () => void
}) {
  const [isPresent, safeToRemove] = usePresence()
  const x = useMotionValue(0)
  const y = useMotionValue(SLOT_Y[slot])
  const scale = useMotionValue(SLOT_SCALE[slot])
  const opacity = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-18, 18], { clamp: true })
  const flickVel = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!isPresent) return
    const controls = [
      animate(y, SLOT_Y[slot], SPRING),
      animate(scale, SLOT_SCALE[slot], SPRING),
      animate(opacity, SLOT_OPACITY[slot], { duration: 0.3, ease: 'easeOut' }),
    ]
    if (!isTop) controls.push(animate(x, 0, SPRING))
    return () => controls.forEach((c) => c.stop())
  }, [slot, isTop, isPresent, x, y, scale, opacity])

  useEffect(() => {
    if (isPresent) return
    const v = flickVel.current
    const mag = Math.hypot(v.x, v.y) || 1
    animate(x, (v.x / mag) * 1500, { duration: 0.5, ease: 'easeOut' })
    animate(y, (v.y / mag) * 1500, { duration: 0.5, ease: 'easeOut' })
    animate(opacity, 0, { duration: 0.45, ease: 'easeOut' })
    const last = animate(scale, 0.85, {
      duration: 0.5,
      ease: 'easeOut',
      onComplete: () => safeToRemove?.(),
    })
    return () => last.stop()
  }, [isPresent, safeToRemove, x, y, scale, opacity])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const speed = Math.hypot(info.velocity.x, info.velocity.y)
    const dist = Math.hypot(info.offset.x, info.offset.y)
    if (speed > 500 || dist > 130) {
      flickVel.current =
        speed > 220
          ? { x: info.velocity.x, y: info.velocity.y }
          : { x: info.offset.x * 9, y: info.offset.y * 9 }
      onFlick()
    } else {
      animate(x, 0, SPRING)
      animate(y, SLOT_Y[0], SPRING)
    }
  }

  return (
    <motion.div
      style={{
        x,
        y,
        scale,
        opacity,
        rotate,
        position: 'absolute',
        inset: 0,
        zIndex: 100 - slot,
        cursor: isTop ? 'grab' : 'auto',
        touchAction: isTop ? 'none' : 'auto',
      }}
      drag={isTop}
      onDragEnd={isTop ? handleDragEnd : undefined}
      whileTap={isTop ? { cursor: 'grabbing' } : undefined}
    >
      <CardFace
        card={card}
        isTop={isTop}
        isAdded={isAdded}
        onToggleAdded={onToggleAdded}
      />
    </motion.div>
  )
}



interface DeckCard {
  key: number
  content: number
}

export default function ProductCardDeck() {
  const [deck, setDeck] = useState<DeckCard[]>(() =>
    Array.from({ length: VISIBLE }, (_, i) => ({ key: i, content: i })),
  )
  const [addedProducts, setAddedProducts] = useState<Set<string>>(() => new Set())
  const nextKey = useRef(VISIBLE)

  const handleFlick = () => {
    setDeck((prev) => {
      const rest = prev.slice(1)
      const lastContent = prev[prev.length - 1].content
      const newCard = {
        key: nextKey.current++,
        content: (lastContent + 1) % CARDS.length,
      }
      return [...rest, newCard]
    })
  }

  const handleToggleAdded = (title: string) => {
    setAddedProducts((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#E8E8DF] px-4 dark:bg-[#1A1A19]">
      <div className="flex flex-col items-center gap-10">
        <div
          className="relative"
          style={{
            width: 'clamp(220px, 72vw, 300px)',
            height: 'calc(clamp(220px, 72vw, 300px) + 56px)',
          }}
        >
          <AnimatePresence>
            {deck.map((item, i) => {
              const card = CARDS[item.content % CARDS.length]
              return (
                <FlickCard
                  key={item.key}
                  card={card}
                  slot={i}
                  isTop={i === 0}
                  isAdded={addedProducts.has(card.title)}
                  onFlick={handleFlick}
                  onToggleAdded={() => handleToggleAdded(card.title)}
                />
              )
            })}
          </AnimatePresence>
        </div>

        <p className="text-xs tracking-wide text-[#666662] dark:text-[#9E9E98]">
          grab the top card and flick it away
        </p>
      </div>
    </div>
  )
}
