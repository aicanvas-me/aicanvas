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
//
// Card layouts under review: the default, and two ideas picked with ?cards=a
// (big numeral) or ?cards=b (spec line and a small glyph that draws the fact).
// The stack motion is the same for all three.

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { CircleHalf, HandTap, SquaresFour, Swatches } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

const LAND_MS = 450
const TURN_MS = 3200
const PEEK = 12
// The front card's exit; a turn's new card waits for it before rising.
const EXIT_S = 0.55

type Glyph = 'grid' | 'layers' | 'themes' | 'ruler'
type Fact = { icon: Icon; label: string; value: string; num: string; unit: string; line: string; glyph: Glyph }
type Layout = 'default' | 'a' | 'b'

function facts(states: number, variants: number, components: number, templates: number): Fact[] {
  return [
    { icon: SquaresFour, label: 'Components', value: `${components} components`, num: String(components), unit: 'components', line: `Plus ${templates} full templates`, glyph: 'grid' },
    { icon: Swatches, label: 'Token driven', value: '3 layers', num: '3', unit: 'token layers', line: 'Swap one ramp, every part follows', glyph: 'layers' },
    { icon: CircleHalf, label: 'Dual themes', value: 'Dark + light', num: '2', unit: 'themes', line: 'Every component, both themes', glyph: 'themes' },
    { icon: HandTap, label: 'Premium interactions', value: `${variants} variants`, num: String(variants), unit: 'variants', line: `${states} interaction states designed`, glyph: 'ruler' },
  ]
}

// ?cards=a|b, read on the client only; the server and first paint use the default.
const noSubscribe = () => () => {}
function useLayout(): Layout {
  return useSyncExternalStore(
    noSubscribe,
    () => {
      const v = new URLSearchParams(window.location.search).get('cards')
      return v === 'a' || v === 'b' ? v : 'default'
    },
    () => 'default',
  )
}

function CardBody({ fact }: { fact: Fact }) {
  const FactIcon = fact.icon
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-sand-700 dark:text-sand-300">{fact.label}</span>
        <FactIcon weight="regular" aria-hidden className="size-5 shrink-0 text-olive-600 dark:text-olive-400" />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-sand-900 dark:text-sand-50">{fact.value}</p>
      <p className="mt-1 text-sm font-semibold text-olive-600 dark:text-olive-400">{fact.line}</p>
    </>
  )
}

const INK = 'text-sand-900 dark:text-sand-50'
const MUTED = 'text-sand-600 dark:text-sand-400'
const ACCENT = 'text-olive-600 dark:text-olive-400'
const MONO = 'font-mono text-[11px] uppercase tracking-[0.14em]'

// Idea A: the number is the card. An oversized numeral with its unit beside it,
// a mono index and label across the top, the line under a hairline, and a soft
// olive light in the top corner.
function CardBodyA({ fact, index, total }: { fact: Fact; index: number; total: number }) {
  const FactIcon = fact.icon
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-5 -top-5 size-40 opacity-60 dark:opacity-100"
        style={{ background: 'radial-gradient(circle at 100% 0%, rgb(168 185 77 / 0.16), transparent 65%)' }}
      />
      <div className="relative flex items-center justify-between gap-3">
        <span className={`${MONO} ${MUTED}`}>{`${pad(index + 1)} · ${fact.label}`}</span>
        <span className="grid size-7 place-items-center rounded-md bg-olive-500/10 ring-1 ring-inset ring-olive-500/25">
          <FactIcon weight="regular" aria-hidden className={`size-4 ${ACCENT}`} />
        </span>
      </div>
      <p className="relative mt-5 flex items-baseline gap-2">
        <span className={`text-6xl font-extrabold leading-none tracking-tighter tabular-nums ${INK}`}>{fact.num}</span>
        <span className={`text-base font-semibold ${MUTED}`}>{fact.unit}</span>
      </p>
      <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-sand-200 pt-3 dark:border-sand-800">
        <span className={`text-sm font-semibold ${ACCENT}`}>{fact.line}</span>
        <span className={`${MONO} ${MUTED}`}>{`${pad(index + 1)}/${pad(total)}`}</span>
      </div>
    </div>
  )
}

// Idea B's glyphs: each one draws its fact rather than decorating it.
function FactGlyph({ glyph, count }: { glyph: Glyph; count: number }) {
  if (glyph === 'grid') {
    // One square per component.
    return (
      <div className="flex flex-wrap gap-[3px]">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className="size-[7px] rounded-[2px] bg-olive-500/70" style={{ opacity: 0.35 + (0.65 * (i + 1)) / count }} />
        ))}
      </div>
    )
  }
  if (glyph === 'layers') {
    // Primitives, semantics, components: each layer built on the one below.
    return (
      <div className="flex flex-col gap-1.5">
        {[
          ['100%', 1, 'primitives'],
          ['72%', 0.7, 'semantic'],
          ['44%', 0.45, 'component'],
        ].map(([w, o, name]) => (
          <div key={name as string} className="flex items-center gap-3">
            <span className="h-1.5 rounded-full bg-olive-500" style={{ width: w as string, opacity: o as number }} />
          </div>
        ))}
      </div>
    )
  }
  if (glyph === 'themes') {
    // The same sample in both themes, side by side.
    return (
      <div className="flex gap-2">
        {[
          ['bg-sand-950 text-sand-50', 'Dark'],
          ['bg-sand-50 text-sand-950', 'Light'],
        ].map(([skin, name]) => (
          <span key={name} className={`flex h-9 flex-1 items-center justify-between rounded-md px-3 ring-1 ring-inset ring-sand-300 dark:ring-sand-700 ${skin}`}>
            <span className="text-sm font-bold">Aa</span>
            <span className="size-2 rounded-full bg-olive-500" />
          </span>
        ))}
      </div>
    )
  }
  // A ruler: a tick for every four variants, a long tick every eight.
  const ticks = Math.round(count / 4)
  return (
    <div className="flex h-9 items-end justify-between">
      {Array.from({ length: ticks }, (_, i) => (
        <span key={i} className="w-px bg-olive-500" style={{ height: i % 8 === 0 ? '100%' : i % 4 === 0 ? '60%' : '35%', opacity: i % 8 === 0 ? 1 : 0.55 }} />
      ))}
    </div>
  )
}

// Idea B: a spec sheet. A mono label with a live dot, the value, a muted line,
// and a glyph at the foot that draws the fact.
function CardBodyB({ fact }: { fact: Fact }) {
  const FactIcon = fact.icon
  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-3">
        <span className={`flex items-center gap-2 ${MONO} ${MUTED}`}>
          <span className="size-1.5 rounded-full bg-olive-500" />
          {fact.label}
        </span>
        <FactIcon weight="regular" aria-hidden className={`size-4 ${MUTED}`} />
      </div>
      <p className={`mt-4 text-3xl font-bold tracking-tight ${INK}`}>{fact.value}</p>
      <p className={`mt-1 text-sm ${MUTED}`}>{fact.line}</p>
      <div className="mt-5 flex h-10 items-end overflow-hidden border-t border-dashed border-sand-300 pt-3 dark:border-sand-700">
        <div className="w-full">
          <FactGlyph glyph={fact.glyph} count={Number(fact.num)} />
        </div>
      </div>
    </div>
  )
}

function Body({ layout, fact, index, total }: { layout: Layout; fact: Fact; index: number; total: number }) {
  if (layout === 'a') return <CardBodyA fact={fact} index={index} total={total} />
  if (layout === 'b') return <CardBodyB fact={fact} />
  return <CardBody fact={fact} />
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
  const layout = useLayout()
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
          <Body layout={layout} fact={list[list.length - 1]} index={list.length - 1} total={list.length} />
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
                  <Body layout={layout} fact={list[arrived % list.length]} index={arrived % list.length} total={list.length} />
                </motion.div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
