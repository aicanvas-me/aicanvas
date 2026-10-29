'use client'

// The hero's map of what AI Canvas is, in three groups: design systems (left),
// standalone components and blocks (right) and the icons both are built with
// (a rail underneath, wired up into each frame). It plays once when it comes
// into view, about 3.2 s, then settles into a few quiet loops that pause off
// screen. Reduced motion shows the settled frame with nothing moving.
//
// Every size is fixed per breakpoint and every animation is opacity or
// transform, so nothing shifts while it plays.

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
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Transition,
} from 'framer-motion'
import { IconSvg } from '../icons/_components/IconSvg'
import type { WallItem } from './ComponentWall'

export type HeroIcon = { name: string; markup: string }

// The timeline, in seconds from the moment the map comes into view.
const T = {
  tiles: 0.45, // the four design-system tiles land
  tileStep: 0.15,
  deal: 1.2, // the screenshots deal in
  dealStep: 0.08,
  rail: 1.8, // the icon rail slides in
  wires: 2.0, // the connectors draw
  settled: 3.2, // intro done, loops may start
}
const EASE: Transition['ease'] = [0.22, 1, 0.36, 1]
const PULSE_EVERY = 2.4
const TOGGLE_EVERY = 3
const SKILL_EVERY = 2.6

const SKILL_LINES = ['Buttons come in two sizes.', 'Cards sit on the inset radius.', 'Never invent a colour.']

// Two drop layers, light from straight above; the same pair the site's raised
// cards use.
const SHADOW =
  'shadow-[0_2px_4px_rgba(0,0,0,0.06),0_10px_20px_-8px_rgba(0,0,0,0.18)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.4),0_12px_24px_-8px_rgba(0,0,0,0.7)]'
const FRAME = `group flex h-full flex-col rounded-section border border-sand-200 bg-sand-100 p-4 text-left transition-colors hover:border-sand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:p-5 dark:border-sand-800 dark:bg-sand-900 dark:hover:border-sand-700 ${SHADOW}`
const TITLE = 'text-[15px] font-semibold leading-snug text-sand-900 dark:text-sand-50'
const CAPTION = 'mt-1 text-[13px] leading-relaxed text-sand-600 dark:text-sand-400'
const WELL = 'border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950'

// Where each frame's centre sits over the rail: the frames share the row
// 3fr / 2fr with a 1rem gap.
const DS_X = 'calc((100% - 1rem) * 0.3)'
const PIECES_X = 'calc((100% - 1rem) * 0.8 + 1rem)'

type MapState = { play: boolean; settled: boolean; idle: boolean; reduce: boolean }
const MapContext = createContext<MapState>({ play: false, settled: false, idle: false, reduce: false })

/** A transition at `delay` on the timeline; instant under reduced motion. */
function useAt() {
  const { reduce } = useContext(MapContext)
  return (delay: number, duration = 0.4, ease: Transition['ease'] = EASE): Transition =>
    reduce ? { duration: 0 } : { delay, duration, ease }
}

const noSubscribe = () => () => {}

export function HeroMap({
  wall,
  standalonesFloor,
  dsComponents,
  dsTemplates,
  icons,
  iconCount,
}: {
  wall: WallItem[]
  standalonesFloor: string
  dsComponents: number
  dsTemplates: number
  icons: HeroIcon[]
  iconCount: number
}) {
  const ref = useRef<HTMLElement>(null)
  const seen = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const visible = useInView(ref)
  // The server cannot know the visitor's motion setting, so the first render
  // always matches it; reduced motion applies once mounted.
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false)
  const reduce = !!useReducedMotion() && mounted
  const play = seen || reduce

  const [settled, setSettled] = useState(false)
  useEffect(() => {
    if (!play) return
    const id = setTimeout(() => setSettled(true), reduce ? 0 : T.settled * 1000)
    return () => clearTimeout(id)
  }, [play, reduce])

  const state: MapState = { play, settled, idle: settled && visible && !reduce, reduce }

  return (
    <MapContext.Provider value={state}>
      <figure
        ref={ref}
        aria-label="AI Canvas in three groups: design systems, standalone components and blocks, and the icons used across both."
        className="w-full"
      >
        <div className="grid gap-4 sm:grid-cols-[3fr_2fr]">
          <DesignSystemsFrame components={dsComponents} templates={dsTemplates} />
          <PiecesFrame wall={wall} floor={standalonesFloor} />
        </div>

        {/* The connectors: one per frame from sm, a single short line on a
            phone where everything stacks. */}
        <div className="relative h-8 sm:h-12">
          <Wire left="50%" className="sm:hidden" order={0} />
          <Wire left={DS_X} className="hidden sm:block" order={0} />
          <Wire left={PIECES_X} className="hidden sm:block" order={1} />
        </div>

        <IconRail icons={icons} count={iconCount} />
      </figure>
    </MapContext.Provider>
  )
}

// ─── Frames ──────────────────────────────────────────────────────────────────

function Rise({ delay, y = 12, className, children }: { delay: number; y?: number; className?: string; children: ReactNode }) {
  const { play } = useContext(MapContext)
  const at = useAt()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={play ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={at(delay, 0.4)}
    >
      {children}
    </motion.div>
  )
}

function DesignSystemsFrame({ components, templates }: { components: number; templates: number }) {
  return (
    <Rise delay={0} className="h-full">
      <Link
        href="/design-systems/andromeda-pro"
        aria-label="Design systems: explore Andromeda Pro"
        className={FRAME}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={TITLE}>Design systems</span>
          <span className="rounded-chip border border-sand-200 bg-sand-50 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-sand-700 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-300">
            Andromeda Pro
          </span>
        </div>
        <p className={CAPTION}>Foundations, components, templates and the skills your agent reads.</p>
        {components > 0 || templates > 0 ? (
          <p className="mt-1 font-mono text-[11px] tracking-wide text-sand-600 dark:text-sand-400">
            {components} components · {templates} templates
          </p>
        ) : null}

        <div aria-hidden className="mt-4 grid flex-1 grid-cols-2 gap-2 sm:gap-3">
          <Tile label="Foundations" index={0}>{(land) => <Foundations land={land} />}</Tile>
          <Tile label="Components" index={1}>{(land) => <Components land={land} />}</Tile>
          <Tile label="Templates" index={2}>{(land) => <Templates land={land} />}</Tile>
          <Tile label="Skills" index={3}>{(land) => <Skills land={land} />}</Tile>
        </div>
      </Link>
    </Rise>
  )
}

function PiecesFrame({ wall, floor }: { wall: WallItem[]; floor: string }) {
  const { play } = useContext(MapContext)
  const at = useAt()
  const shots: (WallItem | null)[] = Array.from({ length: 6 }, (_, i) => wall[i] ?? null)

  return (
    <Rise delay={0.06} className="h-full">
      <Link href="/components" aria-label="Standalone components and blocks: browse components" className={FRAME}>
        <span className={TITLE}>Standalone components and blocks</span>
        <p className={CAPTION}>{floor} pieces that fit any system.</p>

        <div aria-hidden className="mt-4 grid flex-1 auto-rows-fr grid-cols-3 gap-2">
          {shots.map((item, i) => {
            const tilt = i % 2 === 0 ? -4 : 3
            const hidden = { opacity: 0, y: -14, rotate: tilt, scale: 0.94 }
            return (
              <motion.div
                key={item?.slug ?? i}
                initial={hidden}
                animate={play ? { opacity: 1, y: 0, rotate: 0, scale: 1 } : hidden}
                transition={at(T.deal + i * T.dealStep, 0.45)}
                className="relative aspect-[4/3] overflow-hidden rounded-inset border border-sand-200 bg-sand-200 sm:aspect-auto sm:min-h-16 dark:border-sand-800 dark:bg-sand-950"
              >
                {item ? (
                  <>
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={`absolute inset-0 h-full w-full object-cover ${item.imageLight ? 'hidden dark:block' : ''}`}
                    />
                    {/* The light shot on a light site, as on the component wall. */}
                    {item.imageLight ? (
                      <img
                        src={item.imageLight}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover dark:hidden"
                      />
                    ) : null}
                  </>
                ) : null}
              </motion.div>
            )
          })}
        </div>
      </Link>
    </Rise>
  )
}

// ─── Design-system tiles ─────────────────────────────────────────────────────

function Tile({
  label,
  index,
  children,
}: {
  label: string
  index: number
  /** Renders the illustration; `land` is when the tile lands on the timeline. */
  children: (land: number) => ReactNode
}) {
  const { play } = useContext(MapContext)
  const at = useAt()
  const land = T.tiles + index * T.tileStep
  const hidden = { opacity: 0, y: 8, scale: 0.97 }
  return (
    <motion.div
      initial={hidden}
      animate={play ? { opacity: 1, y: 0, scale: 1 } : hidden}
      transition={at(land, 0.35)}
      className={`flex h-[112px] min-w-0 flex-col rounded-card p-2.5 sm:h-[120px] sm:p-3 lg:h-[132px] ${WELL}`}
    >
      <span className="text-xs font-semibold leading-none text-sand-700 dark:text-sand-300">{label}</span>
      <div className="relative mt-2.5 min-h-0 flex-1">{children(land + 0.2)}</div>
    </motion.div>
  )
}

/** Shorthand for a piece of an illustration that appears at `delay`. */
function Bit({
  delay,
  from,
  className,
  style,
  children,
}: {
  delay: number
  from: Record<string, number>
  className?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  const { play } = useContext(MapContext)
  const at = useAt()
  const to = Object.fromEntries(Object.keys(from).map((k) => [k, k === 'opacity' || k.startsWith('scale') ? 1 : 0]))
  return (
    <motion.span
      initial={from}
      animate={play ? to : from}
      transition={at(delay, 0.35)}
      className={className}
      style={style}
    >
      {children}
    </motion.span>
  )
}

const SWATCHES = ['bg-sand-200', 'bg-sand-400', 'bg-sand-600', 'bg-sand-800', 'bg-sand-950']
const RADII = [
  { size: 'size-4', r: 4 },
  { size: 'size-6', r: 8 },
  { size: 'size-9', r: 16 },
]

function Foundations({ land }: { land: number }) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex gap-1">
        {SWATCHES.map((bg, i) => (
          <Bit
            key={bg}
            delay={land + i * 0.04}
            from={{ opacity: 0, scaleY: 0 }}
            className={`block h-4 flex-1 origin-bottom rounded-tag ring-1 ring-inset ring-sand-950/10 sm:h-5 dark:ring-sand-50/10 ${bg}`}
          />
        ))}
      </div>
      <div className="flex items-end justify-between">
        {/* The radius ladder: 4, 8 and 16, nested at one corner. */}
        <span className="relative block size-9">
          {RADII.map(({ size, r }, i) => (
            <Bit
              key={r}
              delay={land + 0.15 + i * 0.07}
              from={{ opacity: 0, scale: 0.6 }}
              className={`absolute bottom-0 left-0 block origin-bottom-left border-r border-t border-sand-400 dark:border-sand-600 ${size}`}
              style={{ borderTopRightRadius: r }}
            />
          ))}
        </span>
        <Bit
          delay={land + 0.3}
          from={{ opacity: 0, y: 4 }}
          className="block text-2xl font-bold leading-none tracking-tight text-sand-900 sm:text-[28px] dark:text-sand-50"
        >
          Aa
        </Bit>
      </div>
    </div>
  )
}

function Components({ land }: { land: number }) {
  const { play, idle, reduce } = useContext(MapContext)
  const [on, setOn] = useState(false)

  // Flips on as the tile lands, then every few seconds while idle.
  useEffect(() => {
    if (!play || reduce) return
    const id = setTimeout(() => setOn(true), (land + 0.45) * 1000)
    return () => clearTimeout(id)
  }, [play, reduce, land])
  useEffect(() => {
    if (!idle) return
    const id = setInterval(() => setOn((v) => !v), TOGGLE_EVERY * 1000)
    return () => clearInterval(id)
  }, [idle])
  const isOn = reduce || on

  return (
    <div className="flex h-full flex-col justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <Bit
          delay={land}
          from={{ opacity: 0, y: 4 }}
          className="inline-flex h-5 items-center rounded-control bg-accent px-2 text-[10px] font-semibold text-accent-foreground"
        >
          Button
        </Bit>
        <Bit delay={land + 0.08} from={{ opacity: 0, y: 4 }} className="inline-flex">
          <span
            className={`relative inline-flex h-3.5 w-6 items-center rounded-full p-0.5 transition-colors duration-300 ${
              isOn ? 'bg-accent' : 'bg-sand-300 dark:bg-sand-700'
            }`}
          >
            <motion.span
              className={`block size-2.5 rounded-full transition-colors duration-300 ${
                isOn ? 'bg-accent-foreground' : 'bg-sand-50'
              }`}
              initial={false}
              animate={{ x: isOn ? 10 : 0 }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 34 }}
            />
          </span>
        </Bit>
        <Bit
          delay={land + 0.16}
          from={{ opacity: 0, y: 4 }}
          className="hidden h-5 items-center rounded-full border border-sand-300 px-2 text-[10px] font-semibold text-sand-700 lg:inline-flex dark:border-sand-700 dark:text-sand-300"
        >
          Chip
        </Bit>
      </div>
      <Bit
        delay={land + 0.12}
        from={{ opacity: 0, y: 4 }}
        className="flex h-6 items-center rounded-control border border-sand-300 bg-sand-100 px-2.5 dark:border-sand-700 dark:bg-sand-900"
      >
        <span className="text-[10px] text-sand-600 dark:text-sand-400">Search</span>
        <motion.span
          className="ml-0.5 block h-3 w-px bg-sand-900 dark:bg-sand-50"
          initial={false}
          animate={idle ? { opacity: [1, 1, 0, 0] } : { opacity: 1 }}
          transition={idle ? { duration: 1.06, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: 'linear' } : { duration: 0 }}
        />
      </Bit>
    </div>
  )
}

function Templates({ land }: { land: number }) {
  const block = 'block rounded-tag bg-sand-200 dark:bg-sand-800'
  return (
    <div className="flex h-full gap-1.5">
      <Bit delay={land} from={{ opacity: 0, scaleY: 0 }} className={`${block} w-1/5 origin-top`} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Bit delay={land + 0.1} from={{ opacity: 0, scaleX: 0 }} className={`${block} h-2.5 origin-left`} />
        <div className="grid flex-1 grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <Bit
              key={i}
              delay={land + 0.2 + i * 0.1}
              from={{ opacity: 0, y: 6 }}
              className="block rounded-tag border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function Skills({ land }: { land: number }) {
  const { play, settled, idle, reduce } = useContext(MapContext)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (!idle) return
    const id = setInterval(() => setCycle((c) => c + 1), SKILL_EVERY * 1000)
    return () => clearInterval(id)
  }, [idle])
  // Nothing is singled out until the intro has typed every line.
  const active = settled ? cycle % SKILL_LINES.length : -1

  const typed = 'inset(0 0% 0 0)'
  const blank = 'inset(0 100% 0 0)'

  return (
    <div className="flex h-full flex-col">
      <Bit
        delay={land}
        from={{ opacity: 0, y: 4 }}
        className="inline-flex w-fit items-center rounded-t-chip border border-b-0 border-sand-300 bg-sand-100 px-1.5 py-0.5 font-mono text-[10px] leading-none text-sand-700 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-300"
      >
        SKILL.md
      </Bit>
      <Bit
        delay={land}
        from={{ opacity: 0 }}
        className="flex min-h-0 flex-1 flex-col justify-center gap-1 rounded-b-chip rounded-tr-chip border border-sand-300 bg-sand-100 px-2 dark:border-sand-700 dark:bg-sand-900"
      >
        {SKILL_LINES.map((line, i) => {
          const isActive = i === active
          // The active line re-types each time it comes round; the rest stay
          // put once the intro has typed them.
          const key = isActive ? `a${cycle}` : `s${i}`
          return (
            <span key={i} className="flex min-w-0 items-center gap-1">
              <span
                className={`block size-1 shrink-0 rounded-full transition-colors duration-300 ${
                  isActive ? 'bg-accent' : 'bg-sand-300 dark:bg-sand-700'
                }`}
              />
              <motion.span
                key={key}
                className={`block min-w-0 truncate text-[9.5px] leading-tight transition-colors duration-300 sm:text-[10px] ${
                  isActive ? 'text-sand-900 dark:text-sand-50' : 'text-sand-600 dark:text-sand-400'
                }`}
                initial={settled && !isActive ? false : { clipPath: blank }}
                animate={{ clipPath: play ? typed : blank }}
                transition={
                  reduce ? { duration: 0 } : settled ? { duration: 0.7, ease: 'linear' } : { delay: land + 0.15 + i * 0.4, duration: 0.45, ease: 'linear' }
                }
              >
                {line}
              </motion.span>
            </span>
          )
        })}
      </Bit>
    </div>
  )
}

// ─── Connectors ──────────────────────────────────────────────────────────────

function Wire({ left, className = '', order }: { left: string; className?: string; order: number }) {
  const { play, idle } = useContext(MapContext)
  const at = useAt()
  const port = 'absolute left-1/2 block size-1.5 -translate-x-1/2 rounded-full bg-sand-300 dark:bg-sand-700'
  return (
    <div aria-hidden className={`absolute inset-y-0 w-px -translate-x-1/2 ${className}`} style={{ left }}>
      <svg className="absolute inset-0 h-full w-px overflow-visible" fill="none">
        <motion.line
          x1="0.5"
          x2="0.5"
          y1="100%"
          y2="0"
          strokeWidth={1}
          className="stroke-sand-300 dark:stroke-sand-700"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: play ? 1 : 0 }}
          transition={at(T.wires + order * 0.1, 0.6, 'easeInOut')}
        />
      </svg>
      <Bit delay={T.wires} from={{ opacity: 0, scale: 0 }} className={`${port} -bottom-[3px]`} />
      <Bit delay={T.wires + 0.55 + order * 0.1} from={{ opacity: 0, scale: 0 }} className={`${port} -top-[3px]`} />
      {/* The pulse: icons going up into the frame. Mounted only while idle,
          so off screen it stops. */}
      {idle ? (
        <motion.span
          className="absolute left-1/2 block h-3 w-px -translate-x-1/2 bg-gradient-to-t from-transparent via-accent to-transparent"
          initial={{ top: '100%', opacity: 0 }}
          animate={{ top: ['100%', '-12px'], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 0.9,
            ease: 'easeOut',
            repeat: Infinity,
            repeatDelay: PULSE_EVERY - 0.9,
            delay: order * 0.3,
          }}
        />
      ) : null}
    </div>
  )
}

// ─── Icon rail ───────────────────────────────────────────────────────────────

function IconRail({ icons, count }: { icons: HeroIcon[]; count: number }) {
  return (
    <Rise delay={T.rail} y={16}>
      <Link href="/icons" aria-label="Icons: browse the icon set" className={`${FRAME} sm:flex-row sm:items-center sm:gap-6`}>
        <div className="shrink-0 sm:w-56">
          <span className={TITLE}>Icons</span>
          <p className={CAPTION}>
            {count > 0
              ? `${count} ${count === 1 ? 'icon' : 'icons'}, used across both.`
              : 'Our own line icons, used across both.'}
          </p>
        </div>
        {icons.length > 0 ? <Marquee icons={icons} /> : null}
      </Link>
    </Rise>
  )
}

const MARQUEE_MASK = 'linear-gradient(to right, transparent, black 2.5rem, black calc(100% - 2.5rem), transparent)'
// Seconds each icon takes to drift past; slow on purpose.
const SECONDS_PER_ICON = 2.5

function Marquee({ icons }: { icons: HeroIcon[] }) {
  const { idle, reduce } = useContext(MapContext)
  // Enough copies that the track always overfills the rail; it loops by one
  // copy's width.
  const copies = reduce ? 1 : icons.length < 10 ? 4 : 2
  const progress = useMotionValue(0)
  const x = useTransform(progress, (p) => `${-p}%`)
  const span = 100 / copies

  useAnimationFrame((_, delta) => {
    if (!idle) return
    const step = (span / (icons.length * SECONDS_PER_ICON * 1000)) * delta
    progress.set((progress.get() + step) % span)
  })

  return (
    <div
      aria-hidden
      className="relative mt-4 min-w-0 flex-1 overflow-hidden sm:mt-0"
      style={{ maskImage: MARQUEE_MASK, WebkitMaskImage: MARQUEE_MASK }}
    >
      <motion.div className="flex w-max" style={{ x }}>
        {Array.from({ length: copies }, (_, c) =>
          icons.map((icon) => (
            <span key={`${c}-${icon.name}`} className="pr-2">
              <span className={`grid size-10 place-items-center rounded-inset text-sand-700 dark:text-sand-300 ${WELL}`}>
                <IconSvg markup={icon.markup} size={20} strokeWidth={2} />
              </span>
            </span>
          )),
        )}
      </motion.div>
    </div>
  )
}
