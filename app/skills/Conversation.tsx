'use client'

import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useMedia } from '../home/useMedia'
import { Bot } from '@/app/_icons/icons/bot'
import { Check } from '@/app/_icons/icons/check'
import { LoaderCircle } from '@/app/_icons/icons/loader-circle'
import { Paperclip } from '@/app/_icons/icons/paperclip'
import { TILE_FILMS, YOU_AVATAR } from './_lib/media'

const EASE = [0.16, 1, 0.3, 1] as const
const HOLD_MS = 6000
const MONO = 'font-mono text-[12px] leading-relaxed'
const DIM = 'text-sand-600 dark:text-sand-400'
const INK = 'text-sand-900 dark:text-sand-50'
const AVATAR =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sand-200 bg-sand-100 text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300'
// The name behind the chat window, with the footer wordmark's grain.
// The word is 3.54em wide, so 26cqw leaves it a margin inside its column. The window
// covers the top quarter of the letters; they fade in from that edge.
const MARK_SIZE = 'clamp(4rem, 26cqw, 22rem)'
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")"
const DRAFT = TILE_FILMS.find((f) => f.id === 'product-launch')!

// A task row: a spinner while it works, a check once `after` seconds have passed.
function Task({ label, detail, after, still }: { label: string; detail?: ReactNode; after: number; still: boolean }) {
  const [done, setDone] = useState(still)
  useEffect(() => {
    if (still) return
    const id = setTimeout(() => setDone(true), after * 1000)
    return () => clearTimeout(id)
  }, [after, still])
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
        {done || still ? (
          <Check size={14} className="text-success" />
        ) : (
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} className="flex">
            <LoaderCircle size={14} className={DIM} />
          </motion.span>
        )}
      </span>
      <div className="min-w-0">
        <p className={`${MONO} ${INK}`}>{label}</p>
        {detail && <div className={`${MONO} ${DIM}`}>{detail}</div>}
      </div>
    </div>
  )
}

function Progress({ label, seconds, still }: { label: string; seconds: number; still: boolean }) {
  return (
    <div className="max-w-md space-y-1.5">
      <p className={`${MONO} ${DIM}`}>{label}</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-sand-200 dark:bg-sand-800">
        <motion.span
          className="block h-full origin-left rounded-full bg-sand-900 dark:bg-sand-50"
          initial={still ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: seconds, ease: 'linear' }}
        />
      </div>
    </div>
  )
}

const Text = ({ children }: { children: ReactNode }) => <p className={`text-[14px] leading-relaxed ${INK}`}>{children}</p>

const Swatch = ({ c }: { c: string }) => (
  <span className="inline-block h-3 w-3 rounded-full ring-1 ring-sand-300 dark:ring-sand-700" style={{ background: c }} />
)

type Line = { at: number; who: 'you' | 'agent'; body: (still: boolean) => ReactNode }

// One conversation, timed in seconds from the first message.
const LINES: Line[] = [
  {
    at: 0.3,
    who: 'you',
    body: () => (
      <>
        Use whoosh and make a promo video for my company. Take the pacing from this video and the look from example.com.
        <span className="mt-2 flex items-center gap-1.5 font-mono text-[11px] opacity-70">
          <Paperclip size={12} />
          launch-ref.mp4
        </span>
      </>
    ),
  },
  { at: 1.6, who: 'agent', body: () => <Text>On it. Watching your video and reading your site first.</Text> },
  {
    at: 2.2,
    who: 'agent',
    body: (still) => <Task still={still} after={1.4} label="Watching launch-ref.mp4" detail="12 frames read: hard cuts on the beat, giant type, colour floods" />,
  },
  {
    at: 3.2,
    who: 'agent',
    body: (still) => (
      <Task
        still={still}
        after={1.4}
        label="Reading example.com"
        detail={
          <span className="flex flex-wrap items-center gap-1.5">
            <Swatch c="#0B0B0C" />
            <Swatch c="#F2EFE8" />
            <Swatch c="#FF4D2E" />
            <span className="ml-1">Inter Tight 800, your logo, your line</span>
          </span>
        }
      />
    ),
  },
  {
    at: 5.2,
    who: 'agent',
    body: () => (
      <div className="space-y-2">
        <Text>Three questions before I write it. Skip any and I use the default.</Text>
        <ol className={`space-y-0.5 ${MONO} ${DIM}`}>
          <li>1. How long? <span className={INK}>default 15 s</span></li>
          <li>2. Which format? <span className={INK}>default 16:9</span></li>
          <li>3. Sound effects? <span className={INK}>default on</span></li>
        </ol>
      </div>
    ),
  },
  { at: 7.2, who: 'you', body: () => <>15 seconds, 16:9, sound on. Make it bold.</> },
  {
    at: 8.2,
    who: 'agent',
    body: (still) => <Task still={still} after={1} label="Treatment written" detail="one idea, 6 scenes, your palette and type" />,
  },
  { at: 9.2, who: 'agent', body: (still) => <Progress still={still} seconds={2.2} label="Building the video and checking every frame" /> },
  {
    at: 11.8,
    who: 'agent',
    body: (still) => (
      <div className="space-y-2.5">
        <Text>Your draft is ready. Take a look.</Text>
        <div className="relative max-w-sm overflow-hidden rounded-inset border border-sand-200 bg-sand-950 dark:border-sand-800">
          <video
            src={DRAFT.src}
            poster={DRAFT.poster}
            muted
            playsInline
            loop
            autoPlay={!still}
            preload="metadata"
            className="aspect-video w-full object-cover"
          />
          <span className="absolute bottom-2 left-2 rounded-chip bg-sand-950/60 px-2 py-0.5 font-mono text-[11px] text-sand-50/80">
            draft · half size · 30 fps
          </span>
        </div>
        <Text>Keep it as it is and I render the final in 1080p at 60 fps, or in 4K. Or tell me what to change.</Text>
      </div>
    ),
  },
  { at: 14.6, who: 'you', body: () => <>Love it. Render it in 4K.</> },
  { at: 15.4, who: 'agent', body: (still) => <Progress still={still} seconds={2.4} label="Rendering 4K at 60 fps with motion blur" /> },
  {
    at: 18.2,
    who: 'agent',
    body: (still) => <Task still={still} after={0} label="your-company-promo-4k.mp4" detail="3840x2160 · 60 fps · 15 s · sound on" />,
  },
]
const END = LINES[LINES.length - 1].at

function Row({ line, first, still }: { line: Line; first: boolean; still: boolean }) {
  if (line.who === 'you')
    return (
      <div className="flex items-end justify-end gap-2.5">
        <div className="max-w-[85%] rounded-card rounded-br-sm bg-sand-900 px-3.5 py-2 text-[14px] font-semibold leading-relaxed text-sand-50 dark:bg-sand-200 dark:text-sand-900">
          {line.body(still)}
        </div>
        <span className={`${AVATAR} overflow-hidden`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- a ready-sized 160px avatar from R2 */}
          <img src={YOU_AVATAR} alt="" width={28} height={28} className="h-full w-full object-cover" />
        </span>
      </div>
    )
  return (
    <div className="flex gap-2.5">
      <span className={`${AVATAR} ${first ? '' : 'invisible'}`}>
        <Bot size={14} />
      </span>
      <div className="min-w-0 max-w-[85%] flex-1 pt-1">{line.body(still)}</div>
    </div>
  )
}

export function Conversation() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-20% 0px' })
  const still = useMedia('(prefers-reduced-motion: reduce)', false)
  const [shown, setShown] = useState(0)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (!inView || still) return
    const ids = LINES.map((l, i) => setTimeout(() => setShown(i + 1), l.at * 1000))
    ids.push(setTimeout(() => { setShown(0); setCycle((c) => c + 1) }, END * 1000 + HOLD_MS))
    return () => ids.forEach(clearTimeout)
  }, [inView, still, cycle])

  const count = still ? LINES.length : shown
  return (
    <div aria-hidden className="mt-10 [container-type:inline-size]">
      <div className="relative" style={{ paddingBottom: `calc(${MARK_SIZE} * 0.615)` }}>
        <style>{`
          .whoosh-mark {
            background-image: ${GRAIN}, linear-gradient(to bottom, rgb(23 23 26 / 0) 25%, rgb(23 23 26 / 0.28) 100%);
            -webkit-mask-image: linear-gradient(to bottom, transparent 25%, #000 75%);
            mask-image: linear-gradient(to bottom, transparent 25%, #000 75%);
          }
          .dark .whoosh-mark {
            background-image: ${GRAIN}, linear-gradient(to bottom, rgb(255 255 255 / 0) 25%, rgb(255 255 255 / 0.5) 100%);
          }
        `}</style>
        <p
          className="whoosh-mark pointer-events-none absolute inset-x-0 bottom-0 select-none whitespace-nowrap bg-clip-text text-center font-extrabold leading-[0.82] tracking-[-0.055em] text-transparent [-webkit-background-clip:text]"
          style={{ fontSize: MARK_SIZE }}
        >
          whoosh
        </p>
        <div
          ref={ref}
          className="relative mx-auto flex h-[36rem] max-w-3xl flex-col overflow-hidden rounded-card border border-sand-200 bg-sand-50 sm:h-[34rem] dark:border-sand-800 dark:bg-sand-950"
        >
          <div className="flex items-center justify-between border-b border-sand-200 px-4 py-2.5 dark:border-sand-800">
            <span className={`${MONO} ${DIM}`}>/whoosh</span>
            <span className={`${MONO} ${DIM}`}>your agent</span>
          </div>
          {/* Anchored to the bottom: each new message pushes the older ones up and out of view. */}
          <div className="flex flex-1 flex-col justify-end gap-3.5 overflow-hidden p-4 sm:p-6">
            <AnimatePresence initial={false}>
              {LINES.slice(0, count).map((line, i) => (
                <motion.div
                  key={`${cycle}-${i}`}
                  layout={still ? false : 'position'}
                  initial={still ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <Row line={line} first={line.who === 'agent' && LINES[i - 1]?.who !== 'agent'} still={still} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
