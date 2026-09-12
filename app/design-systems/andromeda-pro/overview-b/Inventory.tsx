// The inventory drawer: every count the system can state, filed as one
// document. There are no blank documents in it, so the drawer is exactly as
// deep as there are numbers to show.
//
// Opening one slides that document out of the drawer and nothing else moves.
// It travels to the same slot at the same size every time, widening to the
// full width as it comes forward, because a file pulled toward you reads
// larger than the ones still filed behind it. At rest each document is
// already full height with its copy in it, hidden behind the documents in
// front, so opening reveals rather than builds.
//
// Two earlier motions were wrong and are not worth repeating. Lifting the
// document without raising it over the stack carries its body up with the
// tab, so whatever covered it goes on covering it. Pushing the documents in
// front of it down instead needs a drawer deep enough to swallow them, which
// meant padding the front with blank documents.
'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { OverviewStats } from './overview-data'

type Doc = {
  key: keyof OverviewStats
  label: string
  line: string
}

const DOCS: Doc[] = [
  {
    key: 'components',
    label: 'components',
    line: 'Forms, tables, charts, overlays and navigation, each one with its states worked out.',
  },
  {
    key: 'variants',
    label: 'variants',
    line: 'Sizes and tones already drawn, so none of it is left for you to improvise.',
  },
  {
    key: 'states',
    label: 'states',
    line: 'Hover, focus, disabled, loading and error, specified on the components that have them.',
  },
  {
    key: 'families',
    label: 'families',
    line: 'Forms, data display, charts, overlays, feedback, actions, navigation, surfaces and more.',
  },
  {
    key: 'templates',
    label: 'templates',
    line: 'Mission control, service orders, resource planning, the signal room and sign-in.',
  },
  {
    key: 'themes',
    label: 'themes',
    line: 'Light and dark off one set of OKLCH tokens, with no part redrawn for either.',
  },
]

const PITCH = 46
const TAB_H = 34
const BODY_H = 150
// The sliver of the front document that shows below its own tab at rest.
const FRONT_LIP = 16
const LAST_Y = PITCH * (DOCS.length - 1)
const STACK_H = LAST_Y + TAB_H + FRONT_LIP

// The taper: the document at the back of the drawer is this share of the
// width and the one at the front runs the full width. It is drawn with a
// horizontal scale rather than a width, so opening a document can animate
// back to full size without laying the page out on every frame. Only the
// document's face is scaled; the tabs stay one size, as real tabs would.
const BACK_WIDTH = 0.72
const widthAt = (y: number) => BACK_WIDTH + (1 - BACK_WIDTH) * (y / LAST_Y)

// Tab positions across the drawer. Every one clears the narrowest document's
// left edge, so no tab hangs off the back of the stack.
const TAB_X = ['16%', '44%', '24%', '52%', '20%', '48%']

// One folder tab, drawn as an open path so the fill closes along the bottom
// but the stroke never draws a line between the tab and the document.
const TAB_PATH =
  'M 0 34 C 7 34 11 30 14 23 L 18 11 C 20 4 25 0 32 0 L 176 0 C 183 0 188 4 190 11 L 194 23 C 197 30 201 34 208 34'

const OPEN_SHADOW =
  'shadow-[0_2px_4px_rgba(0,0,0,0.08),0_18px_40px_rgba(0,0,0,0.14)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.45),0_18px_40px_rgba(0,0,0,0.60)]'

function Tab({ number, label, lit }: { number: number; label: string; lit: boolean }) {
  return (
    <span className="pointer-events-none relative block h-[28px] w-[152px] sm:h-[34px] sm:w-[208px]">
      <svg
        viewBox="0 0 208 34"
        preserveAspectRatio="none"
        aria-hidden
        className={`absolute inset-0 h-full w-full stroke-sand-300 transition-colors duration-150 dark:stroke-sand-700 ${
          lit ? 'fill-sand-200 dark:fill-sand-800' : 'fill-sand-100 dark:fill-sand-900'
        }`}
        strokeWidth={1}
      >
        <path d={TAB_PATH} vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="absolute inset-x-0 bottom-0 top-[6px] flex items-center justify-between px-6 sm:px-7">
        <span className="text-sm font-semibold tabular-nums text-sand-900 dark:text-sand-50">{number}</span>
        <span className="text-sm text-sand-600 dark:text-sand-400">{label}</span>
      </span>
    </span>
  )
}

export function Inventory({ stats }: { stats: OverviewStats }) {
  const reduce = useReducedMotion() ?? false
  const [open, setOpen] = useState<string | null>(null)
  const [lit, setLit] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const travel = reduce ? { duration: 0 } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const }

  // Hover only tints a document. The click is what pulls it out, and a click
  // anywhere off the drawer files it back. Opening on hover was wrong twice
  // over: the document slides out from under the cursor, so the pointer
  // leaves it, it closes, it comes back under the cursor and opens again.
  // The pointer still belongs to a hit strip parked at each slot rather than
  // to the document, so the tint does not chase the document either.
  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(null)
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
    }
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div ref={root} className="select-none">
      <div className="relative" style={{ height: STACK_H }}>
        {/* The drawer: the walls follow the taper of the stack. */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
          className="absolute inset-0 h-full w-full stroke-sand-300 dark:stroke-sand-700"
          fill="none"
          strokeWidth={1}
        >
          <path
            d={`M ${(1 - BACK_WIDTH) * 50} 0 L 0 100 M ${100 - (1 - BACK_WIDTH) * 50} 0 L 100 100`}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* clip, not hidden: an overflow-hidden box is still programmatically
            scrollable, and focusing a document inside it scrolled the whole
            stack out of place on the keyboard path. */}
        <div className="absolute inset-0 overflow-clip">
          {DOCS.map((doc, i) => {
            const y = i * PITCH
            const isOpen = open === doc.key

            return (
              <motion.div
                key={doc.key}
                // Nothing here takes the pointer. The strips below do that.
                className="pointer-events-none absolute inset-x-0"
                style={{ top: y, zIndex: isOpen ? DOCS.length * 2 + 4 : i + 1 }}
                initial={false}
                animate={{ y: isOpen ? -y : 0 }}
                transition={travel}
              >
                <span aria-hidden className="relative z-10 block" style={{ marginLeft: TAB_X[i] }}>
                  <Tab number={stats[doc.key]} label={doc.label} lit={lit === doc.key || isOpen} />
                </span>
                <motion.span
                  id={`inv-${doc.key}`}
                  className={`-mt-px block origin-top overflow-hidden rounded-2xl border border-sand-300 p-5 transition-colors duration-150 dark:border-sand-700 sm:p-6 ${
                    lit === doc.key || isOpen
                      ? 'bg-sand-200 dark:bg-sand-800'
                      : 'bg-sand-100 dark:bg-sand-900'
                  } ${isOpen ? OPEN_SHADOW : ''}`}
                  // An open document swallows clicks so reading it is not a
                  // click outside the drawer, and a click anywhere on it files
                  // it back: the whole card is the way out, not just its tab.
                  style={{
                    height: BODY_H,
                    pointerEvents: isOpen ? 'auto' : 'none',
                    cursor: isOpen ? 'pointer' : undefined,
                  }}
                  initial={false}
                  animate={{ scaleX: isOpen ? 1 : widthAt(y) }}
                  transition={travel}
                  onClick={() => isOpen && setOpen(null)}
                >
                  {/* The copy stays in the page and fades with the pull. A
                      filed document shows a bare face: the band between two
                      tabs is its own face, and copy sitting there reads as a
                      caption on the document in front. */}
                  <motion.span
                    className="block"
                    initial={false}
                    animate={{ opacity: isOpen ? 1 : 0 }}
                    transition={travel}
                  >
                    <span className="block text-lg font-bold text-sand-900 dark:text-sand-50">
                      {stats[doc.key]} {doc.label}
                    </span>
                    <span className="mt-2 block max-w-lg text-sm leading-relaxed text-sand-600 dark:text-sand-400">
                      {doc.line}
                    </span>
                  </motion.span>
                </motion.span>
              </motion.div>
            )
          })}

          {/* The hit strips: one per slot, parked, never moving. */}
          {DOCS.map((doc, i) => {
            const y = i * PITCH
            const isOpen = open === doc.key
            return (
              <button
                key={`grip-${doc.key}`}
                type="button"
                aria-expanded={isOpen}
                aria-controls={`inv-${doc.key}`}
                // An explicit name: the document's copy belongs to the panel,
                // not to the button, and reading all of it back on focus would
                // bury the label.
                aria-label={`${stats[doc.key]} ${doc.label}`}
                // A pointer that can hover opens on the way past. Touch has no
                // hover and fires enter and leave around the tap, so it toggles.
                onPointerEnter={() => setLit(doc.key)}
                onPointerLeave={() => setLit((k) => (k === doc.key ? null : k))}
                onFocus={() => setLit(doc.key)}
                onBlur={() => setLit((k) => (k === doc.key ? null : k))}
                onClick={() => setOpen((k) => (k === doc.key ? null : doc.key))}
                className="absolute inset-x-0 cursor-pointer focus-visible:outline-none"
                style={{ top: y, height: PITCH, zIndex: DOCS.length + 2 + i }}
              />
            )
          })}
        </div>
      </div>

      {/* The drawer front. */}
      <div className="relative flex h-14 items-center justify-center rounded-b-xl border border-sand-300 bg-sand-100 dark:border-sand-700 dark:bg-sand-900">
        <span className="rounded-md bg-olive-500 px-3 py-1 text-xs font-semibold text-sand-950">
          Andromeda Pro
        </span>
      </div>
    </div>
  )
}
