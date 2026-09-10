'use client'

// The homepage's interactive islands. Everything here needs client JS (state,
// gestures, framer-motion springs/drag, analytics). The homepage shell
// (HomePageClient.tsx) is a server component that renders static HTML and mounts
// these islands, so the static ~60% of the page ships and hydrates no JS.

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView, useMotionValue, useMotionTemplate, useSpring } from 'framer-motion'
import { ArrowRight, ImageSquare, Lightning, HandTap, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { Reveal } from './Reveal'
import { track } from '../lib/analytics'
import type { ComponentMeta } from '../lib/component-registry'

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
            className={`absolute flex h-20 w-28 flex-col items-center justify-center rounded-2xl border border-sand-300 bg-sand-100 transition-[border-color,box-shadow] duration-200 hover:border-sand-500 dark:border-sand-700 dark:bg-sand-800 dark:hover:border-sand-600 ${isFront ? 'touch-none shadow-[0_4px_16px_rgba(0,0,0,0.10)] dark:shadow-[0_6px_28px_rgba(0,0,0,0.28)]' : 'shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_3px_10px_rgba(0,0,0,0.14)]'}`}
            style={{
              zIndex: isExiting ? 11 : pos.zIndex,
              transformOrigin: 'bottom center',
            }}
          >
            {(relPos < 6 || isExiting) && (
              <span className={`text-sm font-bold leading-none ${
                (isFront || isExiting) ? 'text-olive-600 dark:text-olive-400'
                : relPos === 1         ? 'text-sand-700 dark:text-sand-300'
                : relPos === 2         ? 'text-sand-600 dark:text-sand-400'
                : relPos === 3         ? 'text-sand-600'
                :                        'text-sand-600'
              }`}>
                {text}
              </span>
            )}
            {isFront && !isExiting && (
              <HandTap weight="regular" size={18} className="absolute bottom-2 right-2 text-sand-500" />
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
  'AI Canvas component registry: animated React components preview',
  '',
  '',
]

export function WireIcons() {
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
          href="#audience"
          aria-label={WIRE_LABELS[idx]}
          className="relative flex flex-col items-center"
          onMouseEnter={() => setHovered(idx)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered(idx)}
          onBlur={() => setHovered(null)}
          onClick={(e) => {
            e.preventDefault()
            document.getElementById('audience')?.scrollIntoView({ behavior: 'smooth' })
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

// ─── Featured carousel ────────────────────────────────────────────────────────

const CAROUSEL_SPRING = { type: 'spring' as const, stiffness: 240, damping: 28 }

function CarouselCard({ entry }: { entry: ComponentMeta }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-sand-200/60 bg-sand-100 dark:border-sand-800/60 dark:bg-sand-900">
      <div className="relative h-56 overflow-hidden bg-sand-900">
        {entry.badge && (
          <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-sand-950/85 px-2.5 py-1 text-[11px] font-semibold text-olive-400 ring-1 ring-olive-500/40 backdrop-blur-sm">
            <Lightning weight="fill" size={12} />
            {entry.badge}
          </span>
        )}
        {entry.image ? (
          <img
            src={entry.image}
            alt={`${entry.name}: ${entry.description.split('.')[0]}`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          >
            <ImageSquare weight="regular" size={22} className="text-sand-700" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-4 py-5">
        <div>
          <p className="text-sm font-semibold text-sand-900 dark:text-sand-50">{entry.name}</p>
          <p className="text-xs text-sand-600 dark:text-sand-500">{entry.tags.find((t) => t.accent)?.label ?? ''}</p>
        </div>
        <ArrowRight weight="regular" size={16} className="shrink-0 text-sand-500" />
      </div>
    </div>
  )
}

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const rawGlowX = useMotionValue(50)
  const rawGlowY = useMotionValue(50)
  const rawStripeOpacity = useMotionValue(0)
  const springConfig = { stiffness: 150, damping: 18, mass: 0.5 }
  const rotateX = useSpring(rawX, springConfig)
  const rotateY = useSpring(rawY, springConfig)
  const glowX = useSpring(rawGlowX, { stiffness: 100, damping: 22 })
  const glowY = useSpring(rawGlowY, { stiffness: 100, damping: 22 })
  const stripeOpacity = useSpring(rawStripeOpacity, { stiffness: 200, damping: 26 })

  function handleMouse(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    rawX.set(y * -16)
    rawY.set(x * 16)
    rawGlowX.set(((e.clientX - rect.left) / rect.width) * 100)
    rawGlowY.set(((e.clientY - rect.top) / rect.height) * 100)
    rawStripeOpacity.set(1)
  }

  function handleLeave() {
    rawX.set(0)
    rawY.set(0)
    rawStripeOpacity.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', position: 'relative' }}
    >
      {children}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          opacity: stripeOpacity,
          background: useMotionTemplate`radial-gradient(ellipse 600px 300px at ${glowX}% ${glowY}%, rgba(255,255,255,0.1) 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  )
}

export function FeaturedCarousel({ items }: { items: ComponentMeta[] }) {
  const count = items.length
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(0)

  function goNext() { setDir(1);  setIdx((i) => (i + 1) % count) }
  function goPrev() { setDir(-1); setIdx((i) => (i - 1 + count) % count) }

  const current  = items[idx]
  const prevItem = items[(idx - 1 + count) % count]
  const nextItem = items[(idx + 1) % count]
  const prevPrev = items[(idx - 2 + count) % count]
  const nextNext = items[(idx + 2) % count]

  return (
    <section className="mt-16 sm:mt-24">
      {/* Header */}
      <Reveal className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-sand-600">The library</p>
        <h2 className="mt-1 text-xl font-bold text-sand-900 dark:text-sand-50">Components and blocks, one command away.</h2>
      </Reveal>
      <Reveal delay={0.05} className="mb-8 max-w-2xl">
        <p className="text-base leading-relaxed text-sand-600 dark:text-sand-400">
          Copy one CLI command and a finished, animated React piece lands in your project, no
          tokens spent generating it.
        </p>
      </Reveal>

      {/* Track — breaks out of the 720px container.
          The inner row is draggable horizontally so users can swipe through
          the carousel (great for mobile). Dragging past threshold advances
          one step; tapping a side card also advances it in that direction.
          The center card keeps its Link for navigation. */}
      <div className="-mx-4 overflow-hidden sm:-mx-6">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50 || info.velocity.x < -400) goNext()
            else if (info.offset.x > 50 || info.velocity.x > 400) goPrev()
          }}
          className="flex cursor-grab items-center justify-center py-4 active:cursor-grabbing"
          style={{ touchAction: 'pan-y' }}
        >

          {/* Far prev — outermost left, smallest. Tap cycles 2 back. */}
          <motion.div
            aria-hidden
            className="relative z-[1] -mr-[140px] hidden w-[240px] flex-shrink-0 cursor-pointer lg:block"
            animate={{ opacity: 0.3, scale: 0.75 }}
            transition={{ duration: 0.2 }}
            style={{ filter: 'blur(5px)' }}
            onClick={() => { goPrev(); goPrev() }}
          >
            <CarouselCard entry={prevPrev} />
          </motion.div>

          {/* Prev — behind center, peeking left. Tap cycles back by one. */}
          <motion.div
            aria-hidden
            className="relative z-[5] -mr-[200px] w-[300px] flex-shrink-0 cursor-pointer"
            animate={{ opacity: 0.8, scale: 0.88 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ filter: 'blur(3px)' }}
            onClick={goPrev}
          >
            <CarouselCard entry={prevItem} />
          </motion.div>

          {/* Center — on top, with 3D tilt, links to component */}
          <div className="relative z-10 w-[min(480px,calc(100vw-80px))] flex-shrink-0">
            <TiltCard>
              <Link
                href={`/components/${current.slug}`}
                onClick={() => track('Component Card Click', { component: current.slug, position: idx, source: 'homepage-hero' })}
              >
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <motion.div
                  key={current.slug}
                  custom={dir}
                  variants={{
                    enter: (d: number) => ({ x: d > 0 ? 180 : -180, opacity: 0 }),
                    center: { x: 0, opacity: 1 },
                    exit:  (d: number) => ({ x: d > 0 ? -180 : 180, opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={CAROUSEL_SPRING}
                  className="flex flex-col overflow-hidden rounded-xl border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900"
                >
                  <div className="relative h-64 overflow-hidden">
                    {current.badge && (
                      <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-sand-950/85 px-2.5 py-1 text-[11px] font-semibold text-olive-400 ring-1 ring-olive-500/40 backdrop-blur-sm">
                        <Lightning weight="fill" size={12} />
                        {current.badge}
                      </span>
                    )}
                    {current.image ? (
                      <img
                        src={current.image}
                        alt={`${current.name}: ${current.description.split('.')[0]}`}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-sand-900">
                        <ImageSquare weight="regular" size={22} className="text-sand-700" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-4 py-5">
                    <div>
                      <p className="text-sm font-semibold text-sand-900 dark:text-sand-50">{current.name}</p>
                      <p className="text-xs text-sand-600 dark:text-sand-500">{current.tags.find((t) => t.accent)?.label ?? ''}</p>
                    </div>
                    <ArrowRight weight="regular" size={16} className="shrink-0 text-sand-500" />
                  </div>
                </motion.div>
              </AnimatePresence>
              </Link>
            </TiltCard>
          </div>

          {/* Next — behind center, peeking right. Tap advances by one. */}
          <motion.div
            aria-hidden
            className="relative z-[5] -ml-[200px] w-[300px] flex-shrink-0 cursor-pointer"
            animate={{ opacity: 0.8, scale: 0.88 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ filter: 'blur(3px)' }}
            onClick={goNext}
          >
            <CarouselCard entry={nextItem} />
          </motion.div>

          {/* Far next — outermost right, smallest. Tap cycles 2 forward. */}
          <motion.div
            aria-hidden
            className="relative z-[1] -ml-[140px] hidden w-[240px] flex-shrink-0 cursor-pointer lg:block"
            animate={{ opacity: 0.3, scale: 0.75 }}
            transition={{ duration: 0.2 }}
            style={{ filter: 'blur(5px)' }}
            onClick={() => { goNext(); goNext() }}
          >
            <CarouselCard entry={nextNext} />
          </motion.div>

        </motion.div>
      </div>

      {/* Prev / next — under the cards */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          onClick={goPrev}
          aria-label="Previous"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-sand-300 text-sand-600 transition-colors hover:border-sand-600 hover:text-sand-900 dark:border-sand-700 dark:text-sand-400 dark:hover:border-sand-500 dark:hover:text-sand-200"
        >
          <CaretLeft weight="regular" size={14} />
        </button>
        <button
          onClick={goNext}
          aria-label="Next"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-sand-300 text-sand-600 transition-colors hover:border-sand-600 hover:text-sand-900 dark:border-sand-700 dark:text-sand-400 dark:hover:border-sand-500 dark:hover:text-sand-200"
        >
          <CaretRight weight="regular" size={14} />
        </button>
      </div>
    </section>
  )
}

// ─── FAQ accordion ────────────────────────────────────────────────────────────
// The FAQ copy is static (rendered in the server shell); only the open/close
// state lives here, so just this column is a client island.

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'What is AI Canvas?',
    a: 'AI Canvas is a registry of animated React components and design systems you install with one command, no tokens spent generating them. Every install lands real, editable source in your project. Free and premium alike install as real source you own, never a black-box package.',
  },
  {
    q: 'Do I need to know how to code?',
    a: 'No. If you can copy and paste, you can use AI Canvas. And if you do not write code, paste the install command into your AI agent and it will pull the component, design system, or template into your project for you.',
  },
  {
    q: 'Is AI Canvas free?',
    a: 'Yes. Browsing, previewing, and copying the full prompt of any free component are always free, and a free account unlocks unlimited one-command installs, free forever. Premium adds the closed-source premium components and blocks with their full remix prompts, design systems, and templates at $8.99 per month or $49.99 per year when you want more.',
  },
  {
    q: 'How do I get my first component in under a minute?',
    a: 'Open any component page, click Copy CLI to grab its install command, paste it into your terminal, and run it. The component drops into your project as real, editable code.',
  },
  {
    q: 'What is the AI Canvas MCP server?',
    a: 'MCP, short for Model Context Protocol, is an open standard for AI tools to plug into outside services, and nearly every AI coding agent now supports it. The AI Canvas MCP is a small server that connects your agent to AI Canvas, so it can find and install components without you leaving the chat, whether you use Claude Code, Cursor, Codex, Copilot, Gemini, or anything else. It is free to use.',
  },
  {
    q: 'Can I use the components in commercial projects?',
    a: 'Yes. Free components are MIT. Premium components, design systems, and templates are proprietary under the AI Canvas Premium License. Either way you can use what you install in personal and commercial projects and ship it. Any third-party assets, fonts, or images a component references may carry their own terms, so check those before shipping.',
  },
  {
    q: 'How is AI Canvas different from other component libraries?',
    a: 'Most libraries serve one audience, but AI Canvas fits however you build: copy a free component’s AI prompt, run one command with the shadcn CLI, or hand it to an AI agent. The code lands as real code in your project, not a screenshot to chase, so you can restyle, extend, or ship it as is.',
  },
  {
    q: 'Who is behind AI Canvas?',
    a: 'One person. AI Canvas is a solo project, built and cared for one component at a time by someone who worries about the easing curve more than is strictly reasonable. It is still early and still growing, and if it makes your work easier, going Premium is the most direct way to help one maker keep building it with the same care.',
  },
]

export function FaqAccordion() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  return (
    <div className="space-y-2.5">
      {FAQ_ITEMS.map(({ q, a }, i) => {
        const open = openFaq === i
        return (
          <Reveal
            key={q}
            y={8}
            delay={i * 0.04}
            className={`rounded-xl border transition-colors ${
              open
                ? 'border-sand-300 bg-sand-100 dark:border-sand-700 dark:bg-sand-900'
                : 'border-sand-200 bg-sand-100/50 hover:border-sand-300 dark:border-sand-800 dark:bg-sand-900/50 dark:hover:border-sand-700'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenFaq(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <span className={`w-7 shrink-0 text-sm font-bold tabular-nums ${open ? 'text-olive-600 dark:text-olive-500' : 'text-sand-600'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="flex-1 text-base font-semibold text-sand-900 dark:text-sand-50">{q}</h3>
              <CaretRight
                weight="regular"
                size={16}
                className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-90 text-olive-600 dark:text-olive-500' : 'text-sand-600'}`}
              />
            </button>
            {/* Answer stays in the DOM (SEO); grid-rows trick animates the collapse */}
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              {/* visibility rides the same 300ms as the grid collapse, so the
                  answer leaves the a11y tree when closed without a visual pop */}
              <div className={`overflow-hidden transition-[visibility] duration-300 ${open ? 'visible' : 'invisible'}`}>
                <p className="px-4 pb-4 pl-14 pr-8 text-base leading-relaxed text-sand-600 dark:text-sand-400">{a}</p>
              </div>
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}
