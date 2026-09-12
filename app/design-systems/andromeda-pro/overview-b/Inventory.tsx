// The inventory: the four counts as files in a drawer, the nearest one widest.
// The stack deals in when the band scrolls into view and each number counts up
// as its file lands; hovering pulls a file up out of the stack.
//
// The server HTML carries the real numbers. The count-up only swaps them to
// zero in a layout effect, before the first paint, so the true value never
// flashes. Reduced motion keeps the finished stack, the final numbers and no
// transforms at all.
'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useReducedMotion } from 'framer-motion'
import type { OverviewStats } from './overview-data'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

type DrawerFile = {
  key: keyof OverviewStats
  label: string
  line: string
}

const FILES: DrawerFile[] = [
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

// The drawer's taper: the file at the back is narrowest, the one in front runs
// full width. Phones keep every file full width, the taper needs room to read.
const WIDTHS = ['82%', '88%', '94%', '100%']

// The tab's trailing edge is cut on the slant, the way a file tab is.
const TAB_CLIP = 'polygon(0 0, 100% 0, calc(100% - 16px) 100%, 0 100%)'

const FILE_REST =
  'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.40),0_8px_20px_rgba(0,0,0,0.45)]'
const FILE_LIFT =
  'group-hover:shadow-[0_2px_4px_rgba(0,0,0,0.08),0_18px_40px_rgba(0,0,0,0.14)] dark:group-hover:shadow-[0_2px_4px_rgba(0,0,0,0.45),0_18px_40px_rgba(0,0,0,0.60)]'

function useCountUp(value: number, active: boolean, reduce: boolean, delay: number) {
  const [shown, setShown] = useState(value)
  useIsomorphicLayoutEffect(() => {
    if (reduce || !active) return
    setShown(0)
    const controls = animate(0, value, {
      duration: 0.9,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    })
    return () => controls.stop()
  }, [value, active, reduce, delay])
  return shown
}

function File({
  file,
  value,
  index,
  active,
  reduce,
}: {
  file: DrawerFile
  value: number
  index: number
  active: boolean
  reduce: boolean
}) {
  const delay = index * 0.12
  const shown = useCountUp(value, active, reduce, delay)

  return (
    <motion.li
      className="group relative mx-auto w-full"
      style={{ zIndex: index + 1, marginTop: index === 0 ? 0 : -10 }}
      variants={{ out: { opacity: 0, y: -20 }, in: { opacity: 1, y: 0 } }}
      initial={reduce ? 'in' : 'out'}
      animate={active || reduce ? 'in' : 'out'}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -6, transition: { duration: 0.2, ease: 'easeOut' } }}
    >
      {/* The taper is a desktop reading, phones give every file the full width. */}
      <div className="mx-auto w-full sm:w-[var(--file-w)]" style={{ ['--file-w' as string]: WIDTHS[index] }}>
        <div
          className={`flex flex-col gap-4 rounded-2xl border border-sand-200 bg-sand-100 p-5 transition-colors group-hover:border-sand-300 dark:border-sand-800 dark:bg-sand-900 dark:group-hover:border-sand-700 sm:flex-row sm:items-center sm:gap-6 sm:p-6 ${FILE_REST} ${FILE_LIFT}`}
        >
          <div
            className="flex h-16 shrink-0 items-center justify-center self-start bg-sand-900 pl-5 pr-8 text-sand-50 dark:bg-sand-50 dark:text-sand-950 sm:h-20 sm:self-auto"
            style={{ clipPath: TAB_CLIP }}
          >
            <span className="text-4xl font-bold tabular-nums">{shown}</span>
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-sand-900 dark:text-sand-50">{file.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-sand-600 dark:text-sand-400">{file.line}</p>
          </div>
        </div>
      </div>
    </motion.li>
  )
}

export function Inventory({ stats }: { stats: OverviewStats }) {
  const reduce = useReducedMotion() ?? false
  const ref = useRef<HTMLOListElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })

  return (
    <ol ref={ref} className="flex list-none flex-col">
      {FILES.map((file, i) => (
        <File key={file.key} file={file} value={stats[file.key]} index={i} active={inView} reduce={reduce} />
      ))}
    </ol>
  )
}
