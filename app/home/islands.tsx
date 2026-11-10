'use client'

// The homepage's interactive islands. Everything here needs client JS (state,
// gestures, framer-motion springs). The homepage shell (HomePage.tsx) is a
// server component that renders static HTML and mounts these islands, so the
// static part of the page ships and hydrates no JS.

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { HandTap } from '@/app/_icons/icons/hand-tap'

// ─── Hello card data ─────────────────────────────────────────────────────────

const HELLO_CARDS = ['Hello', 'こんにちは', 'Bonjour', 'Hola', 'Ciao', 'Hej', 'Hallo', '你好', ':)']

// Position 0 = front, 1-5 = visible stack, 6-7 = parked behind stack (zIndex 0).
// The exiting card uses a dedicated keyframe animation (swing right → arc to back)
// rather than these positions. Positions 6-7 are the rest pose it settles into.
const CARD_POSITIONS = [
  { x: 0, y: -10, rotate:  24, scale: 1,    opacity: 1, zIndex: 10 },
  { x: 0, y:  -6, rotate:  15, scale: 0.97, opacity: 1, zIndex: 5  },
  { x: 0, y:  -3, rotate:   5, scale: 0.94, opacity: 1, zIndex: 4  },
  { x: 0, y:  -3, rotate:  -5, scale: 0.91, opacity: 1, zIndex: 3  },
  { x: 0, y:  -6, rotate: -15, scale: 0.88, opacity: 1, zIndex: 2  },
  { x: 0, y: -10, rotate: -24, scale: 0.85, opacity: 1, zIndex: 1  },
  { x: 0, y: -10, rotate: -24, scale: 0.85, opacity: 0, zIndex: 0  }, // parked behind
  { x: 0, y: -10, rotate: -24, scale: 0.85, opacity: 0, zIndex: 0  }, // parked behind
  { x: 0, y: -10, rotate: -24, scale: 0.85, opacity: 0, zIndex: 0  }, // parked behind
]

// ─── Stacked cards visual ─────────────────────────────────────────────────────

export function StackedCards({ cards = HELLO_CARDS }: { cards?: string[] } = {}) {
  const N = cards.length
  const [startIdx, setStartIdx] = useState(0)
  // Track which card is mid-exit so we can give it a bespoke keyframe animation
  const [exitingCard, setExitingCard] = useState<number | null>(null)
  const startIdxRef = useRef(0)

  function handleClick() {
    if (exitingCard !== null) return // ignore clicks mid-animation
    const exitIdx = startIdxRef.current % N
    startIdxRef.current = (startIdxRef.current + 1) % N
    setStartIdx(startIdxRef.current)
    setExitingCard(exitIdx)
    setTimeout(() => setExitingCard((c) => (c === exitIdx ? null : c)), 850)
  }

  return (
    <div
      aria-hidden
      className="aic-hero-rise relative mx-auto mb-10 flex h-28 w-48 cursor-pointer items-end justify-center"
      style={{ animationDuration: '0.5s' }}
      onClick={handleClick}
    >
      {cards.map((text, cardIdx) => {
        const relPos = (cardIdx - startIdx + N) % N
        const pos = CARD_POSITIONS[relPos]
        const isFront = relPos === 0
        const isExiting = cardIdx === exitingCard
        // Non-exiting cards wait for the exit arc to finish (~0.9 s), then cascade
        // forward from front to back with a small stagger between each card.
        const delay = isExiting || relPos >= 6 ? 0 : 0.1 + relPos * 0.04

        return (
          <motion.div
            key={cardIdx}
            initial={{ opacity: 0, transform: 'translateX(0px) translateY(0px) rotateZ(0deg) scale(1)' }}
            animate={
              isExiting
                ? {
                    transform: [
                      'translateX(0px) translateY(-10px) rotateZ(24deg) scale(1)',
                      'translateX(80px) translateY(20px) rotateZ(60deg) scale(0.9)',
                    ],
                    opacity: [1, 0],
                  }
                : {
                    transform: `translateX(${pos.x}px) translateY(${pos.y}px) rotateZ(${pos.rotate}deg) scale(${pos.scale})`,
                    opacity: pos.opacity,
                  }
            }
            transition={
              isExiting
                ? {
                    duration: 0.8,
                    ease: 'easeOut',
                    opacity: { delay: 0.5, duration: 0.3 },
                  }
                : {
                    duration: 0.5,
                    ease: 'easeInOut',
                    delay,
                  }
            }
            drag={isFront && !isExiting ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={isFront ? (_e: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
              if (Math.abs(info.offset.x) > 40 || Math.abs(info.velocity.x) > 300) {
                handleClick()
              }
            } : undefined}
            className={`absolute flex h-20 w-28 flex-col items-center justify-center rounded-card border border-sand-300 bg-sand-100 transition-[border-color,box-shadow] duration-200 hover:border-sand-500 dark:border-sand-700 dark:bg-sand-800 dark:hover:border-sand-600 ${isFront ? 'touch-none shadow-[0_4px_16px_rgba(0,0,0,0.10)] dark:shadow-[0_6px_28px_rgba(0,0,0,0.28)]' : 'shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_3px_10px_rgba(0,0,0,0.14)]'}`}
            style={{
              zIndex: isExiting ? 11 : pos.zIndex,
              transformOrigin: 'bottom center',
            }}
          >
            {(relPos < 6 || isExiting) && (
              <span className={`text-sm font-bold leading-none ${
                (isFront || isExiting) ? 'text-accent'
                : relPos === 1         ? 'text-sand-700 dark:text-sand-300'
                : relPos === 2         ? 'text-sand-600 dark:text-sand-400'
                : relPos === 3         ? 'text-sand-600'
                :                        'text-sand-600'
              }`}>
                {text}
              </span>
            )}
            {isFront && !isExiting && (
              <HandTap size={18} className="absolute bottom-2 right-2 text-sand-500" />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Animated counter ─────────────────────────────────────────────────────────

export function AnimatedCount({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  // The count-up runs from 10% below the real number. Rounded so suffixed
  // values (%, +) still read cleanly.
  const initial = Math.max(0, Math.round(to * 0.9))
  // Initial state is the TRUE value, not `initial`. The served HTML is what
  // crawlers, LLM scrapers and no-JS visitors read, and it has to carry the
  // real number: this previously rendered `initial`, so the markup published
  // "22,500" for a stat that was actually 25,000 — 10% low, everywhere, on a
  // page whose whole job is being credible about that number. Any dip to
  // `initial` happens in the effect below, client-side only, so hydration
  // still matches byte for byte.
  const [count, setCount] = useState(to)
  // Was this already on screen when the page loaded? null until first measured.
  const visibleAtMount = useRef<boolean | null>(null)

  useEffect(() => {
    // Measured ONCE, synchronously, on the first effect run — not from `inView`,
    // because IntersectionObserver resolves asynchronously and reports false on
    // that first tick even for an element sitting in the viewport.
    if (visibleAtMount.current === null) {
      const box = ref.current?.getBoundingClientRect()
      visibleAtMount.current =
        !!box && box.top < window.innerHeight && box.bottom > 0
    }

    // Already visible when the page loaded → there is nothing to reveal, so the
    // true number simply stays. Animating here would mean painting the real
    // figure from the SSR HTML, yanking it 10% DOWN on hydration, then crawling
    // back up: a correct number visibly going backwards, which reads as a bug
    // and undermines the one section whose job is being credible about numbers.
    // The count-up is a scroll reward; it only makes sense if you scrolled.
    if (!inView || visibleAtMount.current) return

    // `start` seeds the ramp at `initial`; the first interval tick 16ms later is
    // what actually drops the rendered value down to begin the count-up. Setting
    // state synchronously here instead would trip react-hooks/set-state-in-effect
    // and force an extra render for no visible gain.
    let start = initial
    const duration = 900
    const step = 16
    const increment = Math.max(1, (to - initial) / (duration / step))
    const timer = setInterval(() => {
      start += increment
      if (start >= to) { setCount(to); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, step)
    return () => clearInterval(timer)
  }, [inView, to, initial])

  // Locale pinned to en-US so server and client render byte-identical strings —
  // a bare toLocaleString() would hydration-mismatch under a non-US locale.
  // Small counts are unchanged ("132" stays "132"); five-digit ones gain the
  // separator they need to be legible ("25775" -> "25,775").
  return <span ref={ref}>{count.toLocaleString('en-US')}{suffix}</span>
}

// ─── Wire icon row ────────────────────────────────────────────────────────────

const WIRE_SCALES  = [1.5, 1.2, 1.1]
const WIRE_Y       = [-8, -4, -2]
const WIRE_LABELS  = ['For developers', 'For designers', 'For makers and founders']
// Only the first icon carries a descriptive accessible name (role="img" +
// aria-label on the inline svg); the other two are decorative duplicates and
// stay aria-hidden so screen readers skip them and crawlers don't see the
// brand name repeated three times in a row.
const WIRE_ALTS    = [
  'AI Canvas design systems and React components for AI agents',
  '',
  '',
]

// `target` is the section the icons scroll to; the homepage's is #audience.
export function WireIcons({ target = 'audience' }: { target?: string } = {}) {
  const [hovered, setHovered] = useState<number | null>(null)

  function scale(idx: number) {
    if (hovered === null) return 1
    const d = Math.abs(idx - hovered)
    return WIRE_SCALES[d] ?? 1
  }

  function y(idx: number) {
    if (hovered === null) return 0
    const d = Math.abs(idx - hovered)
    return WIRE_Y[d] ?? 0
  }

  return (
    <div className="mt-16 flex justify-center gap-16 sm:mt-24">
      {[0, 1, 2].map((idx) => (
        <a
          key={idx}
          href={`#${target}`}
          aria-label={WIRE_LABELS[idx]}
          className="relative flex flex-col items-center"
          onMouseEnter={() => setHovered(idx)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered(idx)}
          onBlur={() => setHovered(null)}
          onClick={(e) => {
            e.preventDefault()
            document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          <AnimatePresence>
            {hovered === idx && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-sand-600 dark:text-sand-500"
              >
                {WIRE_LABELS[idx]}
              </motion.span>
            )}
          </AnimatePresence>
          {/* Inline copy of /ai-canvas-wire.svg: the file bakes in its dark
              stroke, and this row needs a per-theme color. */}
          <motion.svg
            role={WIRE_ALTS[idx] === '' ? undefined : 'img'}
            aria-label={WIRE_ALTS[idx] === '' ? undefined : WIRE_ALTS[idx]}
            aria-hidden={WIRE_ALTS[idx] === '' ? true : undefined}
            width={28}
            height={24}
            viewBox="0 0 28 24"
            fill="none"
            animate={{ scale: scale(idx), y: y(idx) }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="cursor-pointer text-sand-200 dark:text-[#383836]"
          >
            <path
              d="M8.14844 0.5H19.8516C20.3849 0.500107 20.8777 0.783538 21.1465 1.24414L22.3184 3.25195L26.3926 10.2363C27.0283 11.3261 27.0283 12.6739 26.3926 13.7637L22.3184 20.748L21.1465 22.7559C20.8777 23.2165 20.3849 23.4999 19.8516 23.5H8.14844C7.61514 23.4999 7.12231 23.2165 6.85352 22.7559L1.01953 12.7559C0.747129 12.2888 0.747129 11.7112 1.01953 11.2441L6.85352 1.24414C7.12231 0.783538 7.61514 0.500107 8.14844 0.5ZM8.5625 2.75684L3.5625 11.7568L3.42773 12L3.5625 12.2432L8.5625 21.2432L8.70605 21.5H19.1201L18.6816 20.748L13.5781 12L18.6816 3.25195L19.1201 2.5H8.70605L8.5625 2.75684Z"
              stroke="currentColor"
            />
          </motion.svg>
        </a>
      ))}
    </div>
  )
}
