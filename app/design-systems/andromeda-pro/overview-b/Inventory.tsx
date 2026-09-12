// The inventory drawer: the four counts filed as documents in an open drawer.
// Each document is a folder with a tab carrying its number and its label; the
// stack tapers the way an open drawer does, narrow at the back and full width
// at the front.
//
// Every folder body is already full height, most of it hidden behind the
// folders in front. Opening one lifts it up the drawer until it clears them,
// which is why the description appears to slide out: nothing resizes, the
// folder simply rises. Folders nearer the front keep their higher stacking
// order, so they still cover its lower edge, the way they would on a desk.
//
// The server HTML carries every number and description, so the counts and the
// copy are in the page whether or not anything is opened. Reduced motion drops
// the travel and the folder just appears in its open place.
'use client'

import { useState } from 'react'
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
    line: 'Sizes, tones and states already drawn, so none of it is left to improvise.',
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

// The drawer's rhythm, in pixels down the stack. An edge is a folder with
// nothing filed on its tab: it gives the drawer its depth, so only its top
// line ever shows.
const EDGE_STEP = 9
const DOC_STEP = 46
const EDGES_TOP = 3
const EDGES_BETWEEN = 2
const EDGES_BOTTOM = 3
const BODY_H = 200
// Where an opened folder comes to rest, clear of the folders at the back.
const OPEN_Y = 30

// The taper: the folder at the back of the drawer is this share of the width,
// the one at the front runs the full width.
const BACK_WIDTH = 72

// One folder tab, drawn as an open path so the fill closes along the bottom
// but the stroke never draws a line between the tab and the folder body.
const TAB_PATH =
  'M 0 34 C 7 34 11 30 14 23 L 18 11 C 20 4 25 0 32 0 L 176 0 C 183 0 188 4 190 11 L 194 23 C 197 30 201 34 208 34'

const TAB_X = ['8%', '44%', '20%', '52%']

type Row = { y: number; width: number; doc: Doc | null }

function layout(): { rows: Row[]; height: number } {
  const kinds: (Doc | null)[] = []
  for (let i = 0; i < EDGES_TOP; i++) kinds.push(null)
  DOCS.forEach((doc, i) => {
    kinds.push(doc)
    if (i < DOCS.length - 1) for (let e = 0; e < EDGES_BETWEEN; e++) kinds.push(null)
  })
  for (let i = 0; i < EDGES_BOTTOM; i++) kinds.push(null)

  const rows: Row[] = []
  let y = 0
  for (const doc of kinds) {
    rows.push({ y, width: 0, doc })
    y += doc ? DOC_STEP : EDGE_STEP
  }
  for (const row of rows) row.width = BACK_WIDTH + (100 - BACK_WIDTH) * (row.y / y)
  return { rows, height: y }
}

function Tab({ number, label }: { number: number; label: string }) {
  return (
    <span className="pointer-events-none relative block h-[28px] w-[152px] sm:h-[34px] sm:w-[208px]">
      <svg
        viewBox="0 0 208 34"
        preserveAspectRatio="none"
        aria-hidden
        className="absolute inset-0 h-full w-full fill-sand-100 stroke-sand-300 dark:fill-sand-900 dark:stroke-sand-700"
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
  const { rows, height } = layout()
  let docIndex = -1

  return (
    <div className="select-none">
      {/* The drawer: the two walls follow the taper of the stack inside it. */}
      <div className="relative" style={{ height }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
          className="absolute inset-0 h-full w-full stroke-sand-300 dark:stroke-sand-700"
          fill="none"
          strokeWidth={1}
        >
          <path
            d={`M ${(100 - BACK_WIDTH) / 2} 0 L 0 100 M ${100 - (100 - BACK_WIDTH) / 2} 0 L 100 100`}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="absolute inset-0 overflow-hidden">
          {rows.map((row, i) => {
            const common = {
              position: 'absolute' as const,
              left: `${(100 - row.width) / 2}%`,
              width: `${row.width}%`,
              zIndex: i + 1,
            }

            if (!row.doc) {
              return (
                <div
                  key={`edge-${i}`}
                  aria-hidden
                  style={{ ...common, top: row.y, height: BODY_H }}
                  className="rounded-t-2xl border border-sand-300 bg-sand-100 dark:border-sand-700 dark:bg-sand-900"
                />
              )
            }

            docIndex += 1
            const d = docIndex
            const doc = row.doc
            const isOpen = open === doc.key
            const rise = isOpen ? OPEN_Y - row.y : 0

            return (
              <motion.div
                key={doc.key}
                style={{ ...common, top: row.y }}
                animate={{ y: rise }}
                transition={reduce ? { duration: 0 } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`inv-${doc.key}`}
                  // An explicit name: the folder's own copy is the panel's, not the
                  // button's, and reading all of it back on focus would bury the label.
                  aria-label={`${stats[doc.key]} ${doc.label}`}
                  // A pointer that can hover opens on the way past. Touch has no
                  // hover, and fires enter and leave around the tap, so it toggles.
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(doc.key)}
                  onPointerLeave={(e) =>
                    e.pointerType === 'mouse' && setOpen((k) => (k === doc.key ? null : k))
                  }
                  onFocus={() => setOpen(doc.key)}
                  onBlur={() => setOpen((k) => (k === doc.key ? null : k))}
                  onClick={() => setOpen((k) => (k === doc.key ? null : doc.key))}
                  className="block w-full cursor-pointer text-left focus-visible:outline-none"
                >
                  <span aria-hidden className="relative z-10 block" style={{ marginLeft: TAB_X[d] }}>
                    <Tab number={stats[doc.key]} label={doc.label} />
                  </span>
                  <span
                    id={`inv-${doc.key}`}
                    className={`-mt-px block rounded-2xl border border-sand-300 bg-sand-100 p-5 transition-shadow dark:border-sand-700 dark:bg-sand-900 sm:p-6 ${
                      isOpen
                        ? 'shadow-[0_2px_4px_rgba(0,0,0,0.08),0_18px_40px_rgba(0,0,0,0.14)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.45),0_18px_40px_rgba(0,0,0,0.60)]'
                        : ''
                    }`}
                    style={{ height: BODY_H }}
                  >
                    <span className="block text-lg font-bold text-sand-900 dark:text-sand-50">
                      {stats[doc.key]} {doc.label}
                    </span>
                    <span className="mt-2 block max-w-lg text-sm leading-relaxed text-sand-600 dark:text-sand-400">
                      {doc.line}
                    </span>
                  </span>
                </button>
              </motion.div>
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
