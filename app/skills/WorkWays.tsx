'use client'

import { motion, useInView, type Transition } from 'framer-motion'
import { useMedia } from '../home/useMedia'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { WORK_WAYS, type WorkWay } from './_lib/entries'

const LOOP_MS = 6000
const EASE = [0.16, 1, 0.3, 1] as const
const SPRING: Transition = { type: 'spring', stiffness: 420, damping: 30 }
const CHIP =
  'rounded-chip border border-sand-200 bg-sand-100 px-2 py-1 font-mono text-[11px] text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300'

// Each loop replays from a new key while on screen; reduced motion shows its last frame, still.
function useLoop() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-15% 0px' })
  const still = useMedia('(prefers-reduced-motion: reduce)', false)
  const [cycle, setCycle] = useState(0)
  useEffect(() => {
    if (!inView || still) return
    const id = setInterval(() => setCycle((c) => c + 1), LOOP_MS)
    return () => clearInterval(id)
  }, [inView, still])
  return { ref, run: inView && !still, still, cycle }
}

type Scene = { still: boolean; at: (delay: number, t?: Transition) => Transition }

function Stage({ children }: { children: (s: Scene) => ReactNode }) {
  const { ref, run, still, cycle } = useLoop()
  const at = (delay: number, t: Transition = { duration: 0.3, ease: EASE }) =>
    still ? { duration: 0 } : { ...t, delay }
  return (
    <div
      ref={ref}
      aria-hidden
      className="relative aspect-[16/10] overflow-hidden rounded-inset border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950"
    >
      {(run || still) && (
        <motion.div
          key={cycle}
          className="absolute inset-0 p-4 sm:p-5"
          initial={{ opacity: 1 }}
          animate={still ? { opacity: 1 } : { opacity: [1, 1, 0] }}
          transition={still ? { duration: 0 } : { duration: LOOP_MS / 1000, times: [0, 0.92, 1] }}
        >
          {children({ still, at })}
        </motion.div>
      )}
    </div>
  )
}

function Sentence({ still, at }: Scene) {
  const text = WORK_WAYS[0].example
  const chips = ['launch video', '16:9', '15 s', 'your line', 'brand from site', 'sound on']
  return (
    <div className="flex h-full flex-col justify-center gap-5">
      <div className="rounded-inset border border-sand-200 bg-sand-100 px-3 py-2.5 font-mono text-[12px] text-sand-900 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-50">
        <span className="mr-2 text-sand-600 dark:text-sand-400">&gt;</span>
        {text.split('').map((ch, i) => (
          <motion.span key={i} initial={still ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={at(i * 0.035, { duration: 0 })}>
            {ch}
          </motion.span>
        ))}
        <motion.span
          className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-sand-900 dark:bg-sand-50"
          animate={still ? { opacity: 1 } : { opacity: [1, 0, 1] }}
          transition={still ? { duration: 0 } : { duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <div>
        <motion.p
          className="mb-2 font-mono text-[11px] text-sand-600 dark:text-sand-400"
          initial={still ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={at(1.7)}
        >
          defaults it takes, unless you say otherwise
        </motion.p>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c, i) => (
            <motion.span
              key={c}
              className={CHIP}
              initial={still ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={at(1.9 + i * 0.08, SPRING)}
            >
              {c}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Film({ still, at }: Scene) {
  const labels = ['pacing', 'camera', 'palette', 'type']
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <div className="relative flex h-7 gap-0.5 overflow-hidden rounded-sm">
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className={`flex-1 ${i % 3 === 0 ? 'bg-sand-300 dark:bg-sand-700' : 'bg-sand-200 dark:bg-sand-800'}`} />
        ))}
        <motion.div
          className="absolute inset-y-0 left-0 w-full"
          initial={still ? false : { x: '0%' }}
          animate={{ x: '100%' }}
          transition={at(0.3, { duration: 2, ease: 'linear' })}
        >
          <span className="absolute inset-y-0 left-0 w-0.5 bg-sand-900 dark:bg-sand-50" />
        </motion.div>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: 12 }, (_, i) => (
          <motion.span
            key={i}
            className="relative aspect-video overflow-hidden rounded-sm bg-sand-200 dark:bg-sand-800"
            initial={still ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={at(0.3 + ((i + 0.5) / 12) * 2, { duration: 0.25, ease: EASE })}
          >
            <span
              className="absolute bottom-1 left-1 h-0.5 rounded-full bg-sand-900/70 dark:bg-sand-50/70"
              style={{ width: `${25 + ((i * 37) % 55)}%` }}
            />
          </motion.span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {labels.map((l, i) => (
          <motion.span
            key={l}
            className={CHIP}
            initial={still ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={at(2.6 + i * 0.15, SPRING)}
          >
            {l}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

function Site({ still, at }: Scene) {
  return (
    <div className="grid h-full grid-cols-[1.35fr_1fr] items-center gap-4">
      <motion.div
        className="relative overflow-hidden rounded-inset border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900"
        initial={still ? false : { scale: 1 }}
        animate={{ scale: [1, 1, 1.06] }}
        transition={still ? { duration: 0 } : { duration: 2.8, times: [0, 0.9, 1], ease: EASE }}
      >
        <div className="flex items-center gap-1.5 border-b border-sand-200 px-2 py-1.5 dark:border-sand-800">
          <span className="h-1.5 w-10 rounded-full bg-sand-300 dark:bg-sand-700" />
          <span className="font-mono text-[9px] text-sand-600 dark:text-sand-400">example.com</span>
        </div>
        <div className="space-y-2 p-3">
          <span className="block h-2.5 w-4/5 rounded-full bg-sand-900 dark:bg-sand-50" />
          <span className="block h-1.5 w-3/5 rounded-full bg-sand-300 dark:bg-sand-700" />
          <motion.span
            className="mt-1 block h-5 w-16 rounded-chip bg-sand-900 dark:bg-sand-50"
            initial={still ? false : { scale: 1 }}
            animate={{ scale: [1, 0.9, 1] }}
            transition={at(3.4, { duration: 0.24 })}
          />
          <span className="block h-8 rounded-sm border border-sand-200 dark:border-sand-800" />
        </div>
        <motion.div
          className="absolute inset-0"
          initial={still ? false : { y: '0%', opacity: 1 }}
          animate={{ y: '100%', opacity: still ? 0 : [1, 1, 0] }}
          transition={at(0.6, { duration: 1.4, ease: 'linear' })}
        >
          <span className="absolute inset-x-0 top-0 h-px bg-sand-900 dark:bg-sand-50" />
        </motion.div>
        <motion.span
          className="absolute h-2.5 w-2.5 rounded-full border-2 border-sand-50 bg-sand-900 dark:border-sand-950 dark:bg-sand-50"
          style={{ left: '22%', top: '62%' }}
          initial={still ? false : { opacity: 0, x: 60, y: 30 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={at(2.7, { duration: 0.6, ease: EASE })}
        />
      </motion.div>
      <div className="space-y-3">
        <motion.div className="flex gap-1.5" initial={still ? false : { opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={at(0.9)}>
          {['bg-sand-900 dark:bg-sand-50', 'bg-sand-600', 'bg-sand-300 dark:bg-sand-700', 'bg-sand-100 border border-sand-300 dark:bg-sand-900 dark:border-sand-700'].map((c) => (
            <span key={c} className={`h-5 w-5 rounded-full ${c}`} />
          ))}
        </motion.div>
        <motion.div initial={still ? false : { opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={at(1.3)}>
          <span className="inline-flex h-9 w-12 items-center justify-center rounded-inset border border-sand-200 text-lg font-extrabold text-sand-900 dark:border-sand-800 dark:text-sand-50">
            Aa
          </span>
        </motion.div>
        <motion.div initial={still ? false : { opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={at(1.7)}>
          <span className={CHIP}>&quot;Get paid on time&quot;</span>
        </motion.div>
      </div>
    </div>
  )
}

function Brand({ still, at }: Scene) {
  const files = ['logo.svg', 'Brand.woff2', '#hex × 3']
  return (
    <div className="grid h-full grid-cols-[1fr_1.4fr] items-center gap-4">
      <div className="space-y-2">
        {files.map((f, i) => (
          <motion.span
            key={f}
            className={`${CHIP} block w-fit`}
            initial={still ? false : { opacity: 1, x: 0 }}
            animate={still ? { opacity: 0.45 } : { x: [0, 18], opacity: [1, 0.45] }}
            transition={at(0.4 + i * 0.25, { duration: 0.5, ease: EASE })}
          >
            {f}
          </motion.span>
        ))}
      </div>
      <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-inset border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900">
        <motion.span
          className="h-6 w-6 rounded-md bg-sand-900 dark:bg-sand-50"
          initial={still ? false : { scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={at(0.9, SPRING)}
        />
        <motion.span
          className="h-2.5 w-3/5 origin-left rounded-full bg-sand-900 dark:bg-sand-50"
          initial={still ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={at(1.15, { duration: 0.4, ease: EASE })}
        />
        <motion.span
          className="h-0.5 w-1/4 origin-left rounded-full bg-sand-600"
          initial={still ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={at(1.4, { duration: 0.4, ease: EASE })}
        />
      </div>
    </div>
  )
}

const LOOPS: Record<WorkWay['id'], (s: Scene) => ReactNode> = {
  sentence: (s) => <Sentence {...s} />,
  film: (s) => <Film {...s} />,
  site: (s) => <Site {...s} />,
  brand: (s) => <Brand {...s} />,
}

export function WorkWays() {
  return (
    <>
      <ol className="mt-10 grid gap-4 md:grid-cols-2">
        {WORK_WAYS.map((w, i) => (
          <li
            key={w.id}
            className="flex flex-col rounded-card border border-sand-200 bg-sand-100 p-3 sm:p-4 dark:border-sand-800 dark:bg-sand-900"
          >
            <Stage>{LOOPS[w.id]}</Stage>
            <div className="flex flex-1 flex-col px-2 pt-5 pb-2">
              <p className="text-lg font-bold text-sand-900 dark:text-sand-50">
                <span className="mr-2 font-mono text-xs font-normal text-sand-600 dark:text-sand-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {w.title}
              </p>
              <p className="mt-1.5 flex-1 text-[15px] leading-relaxed text-sand-600 dark:text-sand-400">{w.body}</p>
              <p className="mt-4 rounded-inset border border-sand-200 bg-sand-50 px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-sand-800 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-200">
                <span className="mr-2 select-none text-sand-600 dark:text-sand-400" aria-hidden>
                  &gt;
                </span>
                {w.example}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-center text-[15px] text-sand-600 dark:text-sand-400">
        Mix them: a sentence, a video you like and your site can be one brief.
      </p>
    </>
  )
}
