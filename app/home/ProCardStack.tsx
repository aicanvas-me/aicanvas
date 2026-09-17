'use client'

// The four Andromeda Pro facts as a stack of cards. When the stack scrolls into
// view the cards rise in from below one by one, each settling behind the last.
// After that the stack turns every few seconds: the top card slides off to the
// right, tipping clockwise as it goes, and is cut off at the section's edge
// (the section box clips); the rest step forward, and a new card rises from
// below into the back. It holds still while hovered or off screen.
//
// Each rendered card is keyed by the tick it arrived on, so a new tick mounts a
// fresh card at the back and the front one leaves through AnimatePresence.
// Reduced motion shows the settled stack and never turns.

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { CircleHalf, HandTap, SquaresFour, Swatches } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

const LAND_MS = 450
const TURN_MS = 3200
const PEEK = 12
// The front card's exit; a turn's new card waits for it before rising.
const EXIT_S = 0.55

type Glyph = 'grid' | 'layers' | 'themes' | 'ruler'
type Fact = { icon: Icon; label: string; value: string; count: number; line: string; glyph: Glyph }

function facts(states: number, variants: number, components: number, templates: number): Fact[] {
  return [
    { icon: SquaresFour, label: 'Components', value: `${components} components`, count: components, line: `Plus ${templates} full templates`, glyph: 'grid' },
    { icon: Swatches, label: 'Token driven', value: '3 layers', count: 3, line: 'Swap one ramp, every part follows', glyph: 'layers' },
    { icon: CircleHalf, label: 'Dual themes', value: 'Dark + light', count: 2, line: 'Every component, both themes', glyph: 'themes' },
    { icon: HandTap, label: 'Premium interactions', value: `${variants} variants`, count: variants, line: `${states} interaction states designed`, glyph: 'ruler' },
  ]
}

const INK = 'text-sand-900 dark:text-sand-50'
const MUTED = 'text-sand-600 dark:text-sand-400'
const MONO = 'font-mono text-[11px] uppercase tracking-[0.14em]'
const pad = (n: number) => String(n).padStart(2, '0')

// The glyph at each card's foot draws its fact rather than decorating it, in
// neutral ink. Each draws in from left to right whenever its card comes to the
// front (`on`), and sits blank while the card waits behind. `still` skips the
// motion: reduced motion, and the invisible sizing copy.
const GLYPH_INK = 'bg-sand-500 dark:bg-sand-400'
const EASE_OUT = [0.22, 1, 0.36, 1] as const

function FactGlyph({ glyph, count, on, still }: { glyph: Glyph; count: number; on: boolean; still: boolean }) {
  const t = (delay: number, duration = 0.35) => (still ? { duration: 0 } : { duration, delay, ease: EASE_OUT })
  const show = on || still

  if (glyph === 'grid') {
    // One square per component, popping in along the rows.
    return (
      <div className="flex flex-wrap gap-[3px]">
        {Array.from({ length: count }, (_, i) => (
          <motion.span
            key={i}
            className={`size-[7px] rounded-[2px] ${GLYPH_INK}`}
            initial={still ? false : { opacity: 0, scale: 0.4 }}
            animate={show ? { opacity: 0.3 + (0.6 * (i + 1)) / count, scale: 1 } : { opacity: 0, scale: 0.4 }}
            transition={show ? t(0.1 + i * 0.014, 0.25) : { duration: 0 }}
          />
        ))}
      </div>
    )
  }
  if (glyph === 'layers') {
    // Primitives, semantics, components: each layer built on the one below,
    // each bar growing out from the left.
    return (
      <div className="flex flex-col gap-1.5">
        {[
          [1, 0.9],
          [0.72, 0.6],
          [0.44, 0.4],
        ].map(([w, o], i) => (
          <motion.span
            key={i}
            className={`h-1.5 origin-left rounded-full ${GLYPH_INK}`}
            style={{ width: `${w * 100}%` }}
            initial={still ? false : { scaleX: 0, opacity: 0 }}
            animate={show ? { scaleX: 1, opacity: o } : { scaleX: 0, opacity: 0 }}
            transition={show ? t(0.1 + i * 0.12, 0.5) : { duration: 0 }}
          />
        ))}
      </div>
    )
  }
  if (glyph === 'themes') {
    // The same sample in both themes, side by side, sliding in from the left.
    return (
      <div className="flex gap-2">
        {[
          ['bg-sand-950 text-sand-50', 'Dark'],
          ['bg-sand-50 text-sand-950', 'Light'],
        ].map(([skin, name], i) => (
          <motion.span
            key={name}
            className={`flex h-9 flex-1 items-center justify-between rounded-md px-3 ring-1 ring-inset ring-sand-300 dark:ring-sand-700 ${skin}`}
            initial={still ? false : { opacity: 0, x: -12 }}
            animate={show ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
            transition={show ? t(0.1 + i * 0.14, 0.4) : { duration: 0 }}
          >
            <span className="text-sm font-bold">Aa</span>
            <span className="size-2 rounded-full bg-sand-500" />
          </motion.span>
        ))}
      </div>
    )
  }
  // A ruler: a tick for every four variants, a long tick every eight, rising
  // one after another from left to right.
  const ticks = Math.round(count / 4)
  return (
    <div className="flex h-9 items-end justify-between">
      {Array.from({ length: ticks }, (_, i) => (
        <motion.span
          key={i}
          className={`w-px origin-bottom ${GLYPH_INK}`}
          style={{ height: i % 8 === 0 ? '100%' : i % 4 === 0 ? '60%' : '35%' }}
          initial={still ? false : { scaleY: 0, opacity: 0 }}
          animate={show ? { scaleY: 1, opacity: i % 8 === 0 ? 1 : 0.5 } : { scaleY: 0, opacity: 0 }}
          transition={show ? t(0.1 + i * 0.012, 0.3) : { duration: 0 }}
        />
      ))}
    </div>
  )
}

// A spec sheet: a numbered mono label, the value, a muted line, and the glyph.
function CardBody({ fact, index, on, still }: { fact: Fact; index: number; on: boolean; still: boolean }) {
  const FactIcon = fact.icon
  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-3">
        <span className={`${MONO} ${MUTED}`}>{`${pad(index + 1)} · ${fact.label}`}</span>
        <FactIcon weight="regular" aria-hidden className={`size-4 ${MUTED}`} />
      </div>
      <p className={`mt-3 text-3xl font-bold tracking-tight ${INK}`}>{fact.value}</p>
      <p className={`mt-1 text-sm ${MUTED}`}>{fact.line}</p>
      <div className="mt-4 flex h-10 items-end overflow-hidden">
        <div className="w-full">
          <FactGlyph glyph={fact.glyph} count={fact.count} on={on} still={still} />
        </div>
      </div>
    </div>
  )
}

const CARD =
  'overflow-hidden rounded-xl border border-sand-200 bg-sand-100 p-5 dark:border-sand-800 dark:bg-sand-900'

export function ProCardStack({
  states,
  variants,
  components,
  templates,
}: {
  states: number
  variants: number
  components: number
  templates: number
}) {
  const list = facts(states, variants, components, templates)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-80px' })
  const reduce = useReducedMotion()
  const [tick, setTick] = useState(-1)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (reduce || !inView || paused) return
    const delay = tick < list.length - 1 ? LAND_MS : TURN_MS
    const id = setTimeout(() => setTick((t) => t + 1), tick < 0 ? 0 : delay)
    return () => clearTimeout(id)
  }, [tick, inView, paused, reduce, list.length])

  const shown = reduce ? list.length - 1 : tick
  // The oldest card still in the stack is the front one.
  const front = Math.max(0, shown - (list.length - 1))
  const keys = shown < 0 ? [] : Array.from({ length: shown - front + 1 }, (_, i) => front + i)

  return (
    <div ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <ul className="sr-only">
        {list.map((f) => (
          <li key={f.label}>{`${f.label}: ${f.value}. ${f.line}.`}</li>
        ))}
      </ul>
      <div aria-hidden className="relative" style={{ paddingBottom: PEEK * (list.length - 1) }}>
        {/* Sizing copy: holds the stack's height so the page never jumps. */}
        <div className={`invisible ${CARD}`}>
          <CardBody fact={list[list.length - 1]} index={list.length - 1} on still />
        </div>
        <AnimatePresence initial={false}>
          {keys.map((arrived) => {
            const d = arrived - front
            // A card joining on a turn (not during the first landing) rises only
            // once the front card has slid away.
            const delay = arrived === shown && arrived >= list.length ? EXIT_S : 0
            return (
              <motion.div
                key={arrived}
                className={`absolute inset-x-0 top-0 ${CARD} shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_12px_32px_rgba(0,0,0,0.5)]`}
                style={{ zIndex: list.length - d, transformOrigin: 'bottom center' }}
                initial={{ opacity: 0, y: d * PEEK + 48, scale: 1 - d * 0.05 }}
                animate={{ opacity: 1, x: 0, rotate: 0, y: d * PEEK, scale: 1 - d * 0.05 }}
                exit={{
                  x: '120%',
                  rotate: 14,
                  zIndex: list.length + 1,
                  transition: { duration: EXIT_S, ease: [0.4, 0, 1, 1] },
                }}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28, delay }}
              >
                <motion.div animate={{ opacity: d === 0 ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.2 }}>
                  <CardBody fact={list[arrived % list.length]} index={arrived % list.length} on={d === 0} still={!!reduce} />
                </motion.div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
