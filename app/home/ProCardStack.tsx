'use client'

// The four Andromeda Pro facts as a stack of cards, like a notification pile.
// When the stack scrolls into view the cards land one by one, each new card on
// top pushing the older ones back; after that the stack keeps turning, one
// card every few seconds, and holds still while hovered or off screen.
//
// Each rendered card is keyed by the tick it arrived on, so a new tick mounts a
// fresh card on top and the oldest one leaves through AnimatePresence. Reduced
// motion shows the settled stack and never turns.

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { CircleHalf, HandTap, SquaresFour, Swatches } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

const LAND_MS = 450
const TURN_MS = 3200
const PEEK = 12

type Fact = { icon: Icon; label: string; value: string; line: string }

function facts(states: number, variants: number, components: number, templates: number): Fact[] {
  return [
    { icon: SquaresFour, label: 'Components', value: `${components} components`, line: `Plus ${templates} full templates` },
    { icon: Swatches, label: 'Token driven', value: '3 layers', line: 'Swap one ramp, every part follows' },
    { icon: CircleHalf, label: 'Dual themes', value: 'Dark + light', line: 'Every component, both themes' },
    { icon: HandTap, label: 'Premium interactions', value: `${variants} variants`, line: `${states} interaction states designed` },
  ]
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

const CARD =
  'rounded-xl border border-sand-200 bg-sand-100 p-5 dark:border-sand-800 dark:bg-sand-900'

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
  const depths = Array.from({ length: Math.min(shown + 1, list.length) }, (_, d) => d)

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
          <CardBody fact={list[list.length - 1]} />
        </div>
        <AnimatePresence initial={false}>
          {depths.map((d) => {
            const arrived = shown - d
            return (
              <motion.div
                key={arrived}
                className={`absolute inset-x-0 top-0 ${CARD} shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_12px_32px_rgba(0,0,0,0.5)]`}
                style={{ zIndex: list.length - d, transformOrigin: 'bottom center' }}
                initial={{ opacity: 0, y: -24, scale: 1 }}
                animate={{ opacity: 1, y: d * PEEK, scale: 1 - d * 0.05 }}
                exit={{ opacity: 0, y: list.length * PEEK, scale: 1 - list.length * 0.05 }}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28 }}
              >
                <motion.div animate={{ opacity: d === 0 ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.2 }}>
                  <CardBody fact={list[arrived % list.length]} />
                </motion.div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
