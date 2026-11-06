'use client'

// The hero as an agent at work: a thread with your agent in front, the AI
// Canvas catalog laid out as a board behind it, and each call the agent makes
// marks the piece it pulled. Plays once when it comes into view, about 6 s,
// then holds still. Reduced motion shows the finished frame. From lg the
// thread overlaps the board; below it the thread stacks above the board.

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion, type Transition } from 'framer-motion'
import { ArrowUp } from '@/app/_icons/icons/arrow-up'
import { BadgeCheckSolid } from '@/app/_icons/icons/badge-check-solid'
import { BoltSolid } from '@/app/_icons/icons/bolt-solid'
import { Check } from '@/app/_icons/icons/check'
import { ChevronRight } from '@/app/_icons/icons/chevron-right'
import { CircleCheckSolid } from '@/app/_icons/icons/circle-check-solid'
import { Component } from '@/app/_icons/icons/component'
import { HeartSolid } from '@/app/_icons/icons/heart-solid'
import { Layers } from '@/app/_icons/icons/layers'
import { LoaderCircle } from '@/app/_icons/icons/loader-circle'
import { Paperclip } from '@/app/_icons/icons/paperclip'
import { Plus } from '@/app/_icons/icons/plus'
import { Shapes } from '@/app/_icons/icons/shapes'
import { Sparkle } from '@/app/_icons/icons/sparkle'
import { User } from '@/app/_icons/icons/user'
import { BrandIcon } from '../components/BrandIcon'
import { IconSvg } from '../icons/_components/IconSvg'
export type HeroIcon = { name: string; markup: string }
export type BoardSystem = {
  slug: string
  name: string
  premium: boolean
  isNew: boolean
  components: number
  templates: number
}
export type BoardPiece = { slug: string; name: string; premium: boolean; kind: string }

// The timeline, in seconds from the moment the hero comes into view.
const T = {
  thread: 0.45, // the thread slides in over the board
  ask: 0.85, // your message
  reply: 1.35, // the agent answers and starts calling
  calls: [1.75, 2.4, 3.05, 3.7], // each call appears, then runs RUN seconds
  closing: 4.5, // the agent's last line
  next: 5.0, // your next ask types into the composer
}
const RUN = 0.5
const EASE: Transition['ease'] = [0.22, 1, 0.36, 1]

// Real AI Canvas MCP tools. `marks` is the board card the call lights up.
const CALLS: { fn: string; arg: string; result: string; marks?: string; mark?: string }[] = [
  { fn: 'get_system', arg: '"andromeda-pro"', result: 'Rules read', marks: 'andromeda-pro', mark: 'In use' },
  { fn: 'compose_page', arg: '"run screen"', result: 'Plan ready' },
  { fn: 'get_component', arg: '"plan-runner"', result: 'Added', marks: 'plan-runner', mark: 'Added' },
  { fn: 'validate_usage', arg: '"run-screen.tsx"', result: '0 issues' },
]

// From lg the board starts at 22% and the thread is 36% wide; the board's
// columns start where the thread ends (14 / 78 of the board), so nothing hides.
const BOARD_AT = 'lg:absolute lg:inset-y-0 lg:right-0 lg:left-[22%] lg:h-auto'
const THREAD_AT = 'lg:absolute lg:left-0 lg:top-16 lg:z-10 lg:w-[36%]'
const COLUMNS_AT = 'lg:grid-cols-3 lg:pl-[calc(17.95%+1rem)]'

// The board runs on past the frame: it fades out to the right and below.
const FADE_MASK = 'linear-gradient(to right, #000 86%, transparent), linear-gradient(to bottom, #000 70%, transparent)'
const FADE: CSSProperties = {
  maskImage: FADE_MASK,
  WebkitMaskImage: FADE_MASK,
  maskComposite: 'intersect',
  WebkitMaskComposite: 'source-in',
}

// The thread is raised above the board: a tight contact shadow and a long soft one.
const LIFT =
  'shadow-[0_2px_6px_rgba(0,0,0,0.06),0_28px_56px_-16px_rgba(0,0,0,0.25)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.5),0_36px_72px_-18px_rgba(0,0,0,0.9)]'
const MUTED = 'text-sand-600 dark:text-sand-400'

type BoardState = { play: boolean; reduce: boolean; done: number }
const BoardContext = createContext<BoardState>({ play: false, reduce: false, done: 0 })

/** A transition at `delay` on the timeline; instant under reduced motion. */
function useAt() {
  const { reduce } = useContext(BoardContext)
  return (delay: number, duration = 0.4): Transition => (reduce ? { duration: 0 } : { delay, duration, ease: EASE })
}

const noSubscribe = () => () => {}

export function HeroBoard({
  systems,
  pieces,
  icons,
  standalonesFloor,
  iconCount,
}: {
  systems: BoardSystem[]
  pieces: BoardPiece[]
  icons: HeroIcon[]
  standalonesFloor: string
  iconCount: number
}) {
  const ref = useRef<HTMLElement>(null)
  const seen = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  // The server cannot know the visitor's motion setting, so the first render
  // always matches it; reduced motion applies once mounted.
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false)
  const reduce = !!useReducedMotion() && mounted
  const play = seen || reduce

  // How many calls have finished.
  const [done, setDone] = useState(0)
  useEffect(() => {
    if (!play) return
    const ids = T.calls.map((at, i) => setTimeout(() => setDone(i + 1), reduce ? 0 : (at + RUN) * 1000))
    return () => ids.forEach(clearTimeout)
  }, [play, reduce])

  return (
    <BoardContext.Provider value={{ play, reduce, done: reduce ? CALLS.length : done }}>
      <figure
        ref={ref}
        aria-label="An agent building a screen from AI Canvas: design systems, standalone components and blocks, and icons."
        className="relative flex w-full flex-col gap-4 lg:block lg:h-[540px]"
      >
        <Board systems={systems} pieces={pieces} icons={icons} floor={standalonesFloor} iconCount={iconCount} />
        <Thread />
      </figure>
    </BoardContext.Provider>
  )
}

/** Shows children at `delay`, rising from `y` and sliding from `x`. */
function Appear({
  delay,
  x = 0,
  y = 8,
  className,
  children,
}: {
  delay: number
  x?: number
  y?: number
  className?: string
  children: ReactNode
}) {
  const { play } = useContext(BoardContext)
  const at = useAt()
  const hidden = { opacity: 0, x, y }
  return (
    <motion.div
      className={className}
      initial={hidden}
      animate={play ? { opacity: 1, x: 0, y: 0 } : hidden}
      transition={at(delay)}
    >
      {children}
    </motion.div>
  )
}

// ─── The board ───────────────────────────────────────────────────────────────

function Board({
  systems,
  pieces,
  icons,
  floor,
  iconCount,
}: {
  systems: BoardSystem[]
  pieces: BoardPiece[]
  icons: HeroIcon[]
  floor: string
  iconCount: number
}) {
  // Cards land column by column, top to bottom.
  const land = (col: number, row: number) => 0.15 + col * 0.08 + row * 0.06
  return (
    <Appear delay={0} y={12} className={`relative h-[380px] ${BOARD_AT}`}>
      <div
        className="flex h-full flex-col overflow-hidden rounded-section border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900/40"
        style={FADE}
      >
        <div className="flex h-11 shrink-0 items-center gap-4 border-b border-sand-200 px-4 dark:border-sand-800">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-sand-900 dark:text-sand-50">
            <BrandIcon width={15} height={13} />
            AI Canvas
            <ChevronRight size={12} className="text-sand-400 dark:text-sand-600" />
            <span className={`font-medium ${MUTED}`}>Catalog</span>
          </span>
          <span aria-hidden className="hidden items-center gap-1 sm:flex">
            <Filter selected>All</Filter>
            <Filter dot="bg-free">Free</Filter>
            <Filter dot="bg-premium">Premium</Filter>
          </span>
        </div>

        {/* Below lg the columns keep a fixed width and run off to the right. */}
        <div className={`grid min-h-0 flex-1 grid-cols-[repeat(3,220px)] gap-3 p-3 ${COLUMNS_AT}`}>
          <Column title="Design systems" count={systems.length} icon={<Layers size={14} />} href="/design-systems/andromeda-pro">
            {systems.map((s, row) => (
              <Card
                key={s.slug}
                href={`/design-systems/${s.slug}`}
                id={s.slug}
                title={s.name}
                meta={`${s.components} components, ${s.templates} templates`}
                delay={land(0, row)}
                tags={
                  <>
                    <Tier premium={s.premium} />
                    {s.isNew ? <Tag tone="new">New</Tag> : null}
                  </>
                }
              />
            ))}
          </Column>

          <Column title="Standalone components" count={floor} icon={<Component size={14} />} href="/components">
            {pieces.map((p, row) => (
              <Card
                key={p.slug}
                href={`/components/${p.slug}`}
                id={p.slug}
                title={p.name}
                delay={land(1, row)}
                tags={
                  <>
                    <Tier premium={p.premium} />
                    <Tag>{p.kind}</Tag>
                  </>
                }
              />
            ))}
          </Column>

          <Column title="Icons" count={iconCount} icon={<Shapes size={14} />} href="/icons">
            <Card href="/icons" id="line" title="Line" delay={land(2, 0)} tags={<Tier premium={false} />}>
              <Glyphs>
                {icons.slice(0, 6).map((icon) => (
                  <IconSvg key={icon.name} markup={icon.markup} size={16} weight="regular" />
                ))}
              </Glyphs>
            </Card>
            <Card
              href="/icons"
              id="solid"
              title="Solid"
              meta="Plus Duotone and Solid duotone"
              delay={land(2, 1)}
              tags={<Tier premium />}
            >
              <Glyphs>
                <BoltSolid size={16} />
                <HeartSolid size={16} />
                <BadgeCheckSolid size={16} />
                <CircleCheckSolid size={16} />
              </Glyphs>
            </Card>
          </Column>
        </div>
      </div>
    </Appear>
  )
}

function Filter({ selected, dot, children }: { selected?: boolean; dot?: string; children: ReactNode }) {
  return (
    <span
      className={`flex h-6 items-center gap-1.5 rounded-chip px-2 text-[11px] font-medium ${
        selected ? 'bg-sand-200 text-sand-900 dark:bg-sand-800 dark:text-sand-50' : MUTED
      }`}
    >
      {dot ? <span className={`size-1.5 rounded-full ${dot}`} /> : null}
      {children}
    </span>
  )
}

function Column({
  title,
  count,
  icon,
  href,
  children,
}: {
  title: string
  count: number | string
  icon: ReactNode
  href: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Link
        href={href}
        className="flex h-7 min-w-0 items-center gap-2 rounded-chip px-1 text-[12px] font-semibold text-sand-900 transition-colors hover:text-sand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:text-sand-50 dark:hover:text-sand-300"
      >
        <span className={`shrink-0 ${MUTED}`}>{icon}</span>
        <span className="truncate">{title}</span>
        <span className={`shrink-0 font-medium ${MUTED}`}>{count}</span>
      </Link>
      {children}
    </div>
  )
}

function Card({
  href,
  id,
  title,
  meta,
  tags,
  delay,
  children,
}: {
  href: string
  id: string
  title: string
  meta?: string
  tags: ReactNode
  delay: number
  children?: ReactNode
}) {
  const { done } = useContext(BoardContext)
  const at = useAt()
  const index = CALLS.findIndex((c) => c.marks === id)
  const marked = index >= 0 && done > index
  return (
    <Appear delay={delay}>
      <Link
        href={href}
        className={`block rounded-card border bg-sand-50 p-3 transition-colors duration-500 hover:border-sand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:bg-sand-900 dark:hover:border-sand-700 ${
          marked ? 'border-success/50 dark:border-success/40' : 'border-sand-200 dark:border-sand-800'
        }`}
      >
        <span className="flex h-4 items-center justify-between gap-2">
          <span className={`truncate font-mono text-[11px] ${MUTED}`}>{id}</span>
          {index >= 0 ? (
            <motion.span
              className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-success"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={marked ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
              transition={at(0, 0.3)}
            >
              <Check size={12} />
              {CALLS[index].mark}
            </motion.span>
          ) : null}
        </span>
        <span className="mt-1.5 block truncate text-[13px] font-semibold text-sand-900 dark:text-sand-50">{title}</span>
        {meta ? <span className={`mt-0.5 block truncate text-[11px] ${MUTED}`}>{meta}</span> : null}
        {children}
        <span className="mt-2.5 flex flex-wrap gap-1.5">{tags}</span>
      </Link>
    </Appear>
  )
}

function Glyphs({ children }: { children: ReactNode }) {
  return <span className="mt-2.5 flex gap-2 text-sand-700 dark:text-sand-300">{children}</span>
}

const TONES = {
  premium: 'border-premium/30 text-premium',
  free: 'border-free/30 text-free',
  new: 'border-new/30 text-new',
  plain: `border-sand-200 dark:border-sand-800 ${MUTED}`,
}
const DOTS = { premium: 'bg-premium', free: 'bg-free', new: 'bg-new', plain: '' }

function Tag({ tone = 'plain', children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return (
    <span className={`inline-flex h-5 items-center gap-1 rounded-full border px-2 text-[10.5px] font-semibold ${TONES[tone]}`}>
      {tone !== 'plain' ? <span className={`size-1.5 rounded-full ${DOTS[tone]}`} /> : null}
      {children}
    </span>
  )
}

function Tier({ premium }: { premium: boolean }) {
  return premium ? <Tag tone="premium">Premium</Tag> : <Tag tone="free">Free</Tag>
}

// ─── The thread ──────────────────────────────────────────────────────────────

function Thread() {
  return (
    <Appear delay={T.thread} x={-16} y={0} className={`order-first ${THREAD_AT}`}>
      <div
        aria-hidden
        className={`flex flex-col rounded-section border border-sand-200 bg-sand-50 dark:border-sand-700/80 dark:bg-sand-900 ${LIFT}`}
      >
        <div className="flex h-11 items-center justify-between gap-3 border-b border-sand-200 px-4 dark:border-sand-800">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-sand-900 dark:text-sand-50">
            <Sparkle size={14} className={MUTED} />
            Agent thread
          </span>
          <span className={`flex items-center gap-1.5 text-[11px] font-medium ${MUTED}`}>
            <span className="size-1.5 rounded-full bg-success" />
            AI Canvas MCP
          </span>
        </div>

        <div className="flex flex-col gap-4 p-4">
          <Message who="You" avatar={<User size={13} />} delay={T.ask}>
            Build the run screen for our agent with Andromeda Pro. Show the plan while it runs.
          </Message>
          <Message who="Agent" avatar={<Sparkle size={13} />} delay={T.reply}>
            Reading the Andromeda Pro rules before I write a line.
            <span className="mt-2.5 block overflow-hidden rounded-card border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-950">
              {CALLS.map((call, i) => (
                <CallRow key={call.fn} index={i} />
              ))}
            </span>
            <Later delay={T.closing} className="mt-2.5 block">
              Done. Every color, radius and spacing step comes from Andromeda Pro, so nothing on the screen is guessed.
            </Later>
          </Message>
        </div>

        <Composer />
      </div>
    </Appear>
  )
}

/** Inline text that fades in at `delay`; its space is held from the start. */
function Later({ delay, className, children }: { delay: number; className?: string; children: ReactNode }) {
  const { play } = useContext(BoardContext)
  const at = useAt()
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 4 }}
      animate={play ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
      transition={at(delay, 0.35)}
    >
      {children}
    </motion.span>
  )
}

function Message({ who, avatar, delay, children }: { who: string; avatar: ReactNode; delay: number; children: ReactNode }) {
  return (
    <Appear delay={delay} y={6} className="flex gap-2.5">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sand-200 text-sand-700 dark:bg-sand-800 dark:text-sand-300">
        {avatar}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-semibold leading-6 text-sand-900 dark:text-sand-50">{who}</span>
        <span className="block text-[13px] leading-relaxed text-sand-700 dark:text-sand-300">{children}</span>
      </span>
    </Appear>
  )
}

function CallRow({ index }: { index: number }) {
  const { done } = useContext(BoardContext)
  const call = CALLS[index]
  const finished = done > index
  return (
    <Later
      delay={T.calls[index]}
      className="flex h-7 items-center gap-2 border-b border-sand-200 px-2.5 last:border-b-0 dark:border-sand-800"
    >
      <span className="grid size-3.5 shrink-0 place-items-center">
        {finished ? (
          <Check size={13} className="text-success" />
        ) : (
          <LoaderCircle size={13} className={`animate-spin ${MUTED}`} />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-[11px]">
        <span className="text-sand-900 dark:text-sand-50">{call.fn}</span>
        <span className={MUTED}>({call.arg})</span>
      </span>
      <span
        className={`shrink-0 text-[11px] font-medium transition-opacity duration-300 ${MUTED} ${
          finished ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {call.result}
      </span>
    </Later>
  )
}

const NEXT_ASK = 'Next: the settings page, same system.'

function Composer() {
  const { play, reduce } = useContext(BoardContext)
  const typing = reduce ? { duration: 0 } : { delay: T.next, duration: 1, ease: 'linear' as const }
  return (
    <div className="mx-3 mb-3 rounded-card border border-sand-200 bg-sand-100 p-3 dark:border-sand-700/80 dark:bg-sand-950">
      <span className="grid text-[13px] leading-5">
        {/* The placeholder steps aside as the next ask types over it. */}
        <motion.span
          className={`col-start-1 row-start-1 ${MUTED}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: play ? 0 : 1 }}
          transition={reduce ? { duration: 0 } : { delay: T.next, duration: 0.15 }}
        >
          Ask your agent
        </motion.span>
        <motion.span
          className="col-start-1 row-start-1 whitespace-nowrap text-sand-900 dark:text-sand-50"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: play ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
          transition={typing}
        >
          {NEXT_ASK}
        </motion.span>
      </span>
      <span className="mt-3 flex items-center justify-between">
        <span className={`flex items-center gap-2.5 ${MUTED}`}>
          <Plus size={15} />
          <Paperclip size={15} />
          <span className="text-[11px] font-medium">Andromeda Pro</span>
        </span>
        <span className="grid size-7 place-items-center rounded-full bg-accent text-accent-foreground">
          <ArrowUp size={14} />
        </span>
      </span>
    </div>
  )
}
