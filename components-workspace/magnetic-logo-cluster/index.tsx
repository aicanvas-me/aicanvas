'use client'

// npm install framer-motion

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

const DRIFT_ROT_AMPLITUDE = 3.5
const DRIFT_MAG_MIN_FRAC = 0.012
const DRIFT_MAG_MAX_FRAC = 0.03
const DRIFT_DURATION_MIN = 4
const DRIFT_DURATION_MAX = 8
const ENTRY_SPRING = { type: 'spring' as const, stiffness: 100, damping: 18, mass: 1 }
const MAGNET_SPRING = { stiffness: 180, damping: 14, mass: 0.6 }
const PARKED = 99999

type Palette = {
  id: string
  from: string
  to: string
  mid: string
  dark: string
}

const OLIVE_PALETTES: Palette[] = [
  { id: 'op0', from: '#EBF0C8', to: '#C5D672', mid: '#5C5C58', dark: '#262624' },
  { id: 'op1', from: '#DAE4A0', to: '#BECF5D', mid: '#4F4F4C', dark: '#1E1E1E' },
  { id: 'op2', from: '#BECF5D', to: '#92A143', mid: '#4F4F4C', dark: '#1E1E1E' },
  { id: 'op3', from: '#A8B94D', to: '#6E7E22', mid: '#3A3A38', dark: '#1A1A19' },
  { id: 'op4', from: '#869631', to: '#5C6A1C', mid: '#2E2E2C', dark: '#141413' },
]
const SAND_PALETTES: Palette[] = [
  { id: 'sp0', from: '#C8C8C0', to: '#BABAB4', mid: '#4F4F4C', dark: '#21211F' },
  { id: 'sp1', from: '#BABAB4', to: '#9E9E98', mid: '#383836', dark: '#1A1A19' },
  { id: 'sp2', from: '#9E9E98', to: '#7D7D78', mid: '#21211F', dark: '#141413' },
  { id: 'sp3', from: '#7D7D78', to: '#666662', mid: '#21211F', dark: '#141413' },
  { id: 'sp4', from: '#666662', to: '#4F4F4C', mid: '#1A1A19', dark: '#141413' },
]
const ALL_PALETTES: Palette[] = [...OLIVE_PALETTES, ...SAND_PALETTES]

const PALETTE_WEIGHTS: Array<[Palette, number]> = [
  [OLIVE_PALETTES[0], 2],
  [OLIVE_PALETTES[1], 4],
  [OLIVE_PALETTES[2], 14],
  [OLIVE_PALETTES[3], 15],
  [OLIVE_PALETTES[4], 10],
  [SAND_PALETTES[0], 6],
  [SAND_PALETTES[1], 17],
  [SAND_PALETTES[2], 30],
  [SAND_PALETTES[3], 36],
  [SAND_PALETTES[4], 16],
]

// Seeded, never Math.random(): the server and the browser must build the same pack.
function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice()
  const rand = mulberry32(seed)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function halton(index: number, base: number): number {
  let result = 0
  let f = 1
  let i = index
  while (i > 0) {
    f /= base
    result += f * (i % base)
    i = Math.floor(i / base)
  }
  return result
}

type Item = {
  id: number
  xFrac: number
  yFrac: number
  sizeFrac: number
  rotation: number
  palette: Palette
  iconIndex: number
  tint?: string
  fromXFrac: number
  fromYFrac: number
  driftXFrac: number
  driftYFrac: number
  driftDuration: number
  driftDelay: number
  entryDelay: number
  zIndex: number
}

type ClusterConfig = {
  count: number
  seed: number
  layout: 'diamond' | 'rect'
  spreadX: number
  spreadY: number
  minIconSize: number
  maxIconSize: number
  drift: number
  entryStagger: number
  iconCount: number
  tints: string[]
}

function buildCluster(cfg: ClusterConfig): Item[] {
  const pool: Palette[] = []
  for (const [palette, weight] of PALETTE_WEIGHTS) {
    const n = Math.max(1, Math.round((weight / 150) * cfg.count))
    for (let i = 0; i < n; i++) pool.push(palette)
  }
  const palettes = shuffle(pool, cfg.seed ^ 0xabcdef12)
  const items: Item[] = []

  for (let i = 0; i < cfg.count; i++) {
    const rand = mulberry32(cfg.seed * 0x2545f491 + 0x9e3779b1 + i * 2654435761)

    const u = halton(i + 1, 2) - 0.5
    const v = halton(i + 1, 3) - 0.5
    const ux = cfg.layout === 'diamond' ? u - v : u * 2
    const uy = cfg.layout === 'diamond' ? u + v : v * 2
    const xFrac = ux * cfg.spreadX + (rand() - 0.5) * 0.018
    const yFrac = uy * cfg.spreadY + (rand() - 0.5) * 0.018

    const sizeFrac =
      cfg.minIconSize + Math.pow(rand(), 1.4) * (cfg.maxIconSize - cfg.minIconSize)

    const fromAngle = rand() * Math.PI * 2
    const fromDist = 1.6 + rand() * 0.4

    const driftAngle = rand() * Math.PI * 2
    const driftMag =
      (DRIFT_MAG_MIN_FRAC + rand() * (DRIFT_MAG_MAX_FRAC - DRIFT_MAG_MIN_FRAC)) *
      cfg.drift

    items.push({
      id: i,
      xFrac,
      yFrac,
      sizeFrac,
      rotation: (rand() - 0.5) * 360,
      palette: palettes[i % palettes.length],
      iconIndex: cfg.iconCount > 0 ? i % cfg.iconCount : 0,
      tint: cfg.tints.length ? cfg.tints[Math.floor(rand() * cfg.tints.length)] : undefined,
      fromXFrac: Math.cos(fromAngle) * fromDist,
      fromYFrac: Math.sin(fromAngle) * fromDist,
      driftXFrac: Math.cos(driftAngle) * driftMag,
      driftYFrac: Math.sin(driftAngle) * driftMag,
      driftDuration:
        DRIFT_DURATION_MIN + rand() * (DRIFT_DURATION_MAX - DRIFT_DURATION_MIN),
      driftDelay: -rand() * DRIFT_DURATION_MAX,
      entryDelay: i * cfg.entryStagger,
      zIndex: Math.round(sizeFrac * 10000),
    })
  }
  return items
}

// Not display:none: gradients inside a hidden SVG stop rendering.
function GradientDefs({ uid }: { uid: string }) {
  return (
    <svg
      aria-hidden='true'
      width='0'
      height='0'
      style={{ position: 'absolute', width: 0, height: 0 }}
    >
      <defs>
        {ALL_PALETTES.map((p) => (
          <linearGradient
            key={p.id}
            id={`${uid}-${p.id}`}
            x1='9'
            y1='3'
            x2='24.8756'
            y2='17'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor={p.from} />
            <stop offset='1' stopColor={p.to} />
          </linearGradient>
        ))}
      </defs>
    </svg>
  )
}

function DefaultMark({ palette, uid }: { palette: Palette; uid: string }) {
  return (
    <svg viewBox='0 0 28 24' fill='none' aria-hidden='true'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M19.8513 0C20.5626 0 21.2204 0.377823 21.5788 0.992258L22.75 3L27.4122 10.9923C27.7754 11.615 27.7754 12.385 27.4122 13.0077L22.75 21L21.5788 23.0077C21.2204 23.6222 20.5626 24 19.8513 24H8.14874C7.43741 24 6.7796 23.6222 6.42118 23.0077L0.587849 13.0077C0.224593 12.385 0.224593 11.615 0.58785 10.9923L6.42118 0.992257C6.7796 0.377822 7.43741 0 8.14874 0H19.8513ZM4 12L9 21H18.25L13 12L18.25 3H9L4 12Z'
        fill={`url(#${uid}-${palette.id})`}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M9 21L4 12H13L18.25 21H9Z'
        fill={palette.dark}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M13 12H4L9 3H18.25L13 12Z'
        fill={palette.mid}
      />
    </svg>
  )
}

// The three inner layers each own a transform; merged, one overwrites the other.
function ClusterIcon({
  item,
  size,
  mouseX,
  mouseY,
  reduceMotion,
  magnetRadius,
  magnetStrength,
  curl,
  uid,
  children,
}: {
  item: Item
  size: number
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
  reduceMotion: boolean
  magnetRadius: number
  magnetStrength: number
  curl: number
  uid: string
  children?: ReactNode
}) {
  const restX = item.xFrac * size
  const restY = item.yFrac * size
  const box = item.sizeFrac * size
  const influence = magnetRadius * size
  const strength = magnetStrength * size

  const magnetX = useTransform([mouseX, mouseY], (input) => {
    const [mx, my] = input as [number, number]
    const dx = mx - restX
    const dy = my - restY
    const d = Math.hypot(dx, dy)
    if (d >= influence || d < 0.0001) return 0
    const fall = 1 - smoothstep(0, influence, d)
    const normX = dx / d
    const tanX = -(dy / d)
    return (normX + tanX * curl) * strength * fall
  })
  const magnetY = useTransform([mouseX, mouseY], (input) => {
    const [mx, my] = input as [number, number]
    const dx = mx - restX
    const dy = my - restY
    const d = Math.hypot(dx, dy)
    if (d >= influence || d < 0.0001) return 0
    const fall = 1 - smoothstep(0, influence, d)
    const normY = dy / d
    const tanY = dx / d
    return (normY + tanY * curl) * strength * fall
  })

  const springX = useSpring(magnetX, MAGNET_SPRING)
  const springY = useSpring(magnetY, MAGNET_SPRING)

  // --ic-dx/dy/rot/rot-amp stay unitless: CLUSTER_CSS multiplies them by 1px or 1deg.
  const floatStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    ['--ic-dx' as never]: item.driftXFrac * size,
    ['--ic-dy' as never]: item.driftYFrac * size,
    ['--ic-rot' as never]: item.rotation,
    ['--ic-rot-amp' as never]: DRIFT_ROT_AMPLITUDE,
    ['--ic-duration' as never]: `${item.driftDuration}s`,
    ['--ic-delay' as never]: `${item.driftDelay}s`,
  }

  const artwork = children ?? <DefaultMark palette={item.palette} uid={uid} />

  return (
    <div
      style={{
        position: 'absolute',
        left: `calc(50% + ${restX}px)`,
        top: `calc(50% + ${restY}px)`,
        width: box,
        height: box,
        marginLeft: -box / 2,
        marginTop: -box / 2,
        zIndex: item.zIndex,
        color: item.tint,
        pointerEvents: 'none',
      }}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          x: reduceMotion ? 0 : springX,
          y: reduceMotion ? 0 : springY,
          willChange: 'transform',
        }}
      >
        <motion.div
          style={{ width: '100%', height: '100%' }}
          initial={
            reduceMotion
              ? false
              : {
                  x: item.fromXFrac * size,
                  y: item.fromYFrac * size,
                  opacity: 0,
                  scale: 0.5,
                }
          }
          animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          transition={{ ...ENTRY_SPRING, delay: reduceMotion ? 0 : item.entryDelay }}
        >
          {reduceMotion ? (
            <div
              className='aicanvas-cluster-art'
              style={{
                width: '100%',
                height: '100%',
                transform: `rotate(${item.rotation}deg)`,
              }}
            >
              {artwork}
            </div>
          ) : (
            <div className='aicanvas-cluster-art aicanvas-cluster-float' style={floatStyle}>
              {artwork}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

const CLUSTER_CSS = `
.aicanvas-cluster-float {
  animation: aicanvas-cluster-float var(--ic-duration) ease-in-out var(--ic-delay) infinite alternate;
  will-change: transform;
  transform: translateZ(0);
}
.aicanvas-cluster-art > *,
.aicanvas-cluster-art > svg,
.aicanvas-cluster-art > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
@keyframes aicanvas-cluster-float {
  from {
    transform:
      translate(calc(var(--ic-dx) * -1px), calc(var(--ic-dy) * -1px))
      rotate(calc((var(--ic-rot) - var(--ic-rot-amp)) * 1deg));
  }
  to {
    transform:
      translate(calc(var(--ic-dx) * 1px), calc(var(--ic-dy) * 1px))
      rotate(calc((var(--ic-rot) + var(--ic-rot-amp)) * 1deg));
  }
}
@media (prefers-reduced-motion: reduce) {
  .aicanvas-cluster-float { animation: none; }
}
`

/**
 * @typedef {object} MagneticLogoClusterProps
 * @property {React.ReactNode[]} [icons] Your logos or icons, cycled across the pack. Each one is rendered inside a square slot and scaled to fit, so inline SVG, an `<img>` or a whole component all work. Omit it to get the built-in placeholder mark.
 * @property {string[]} [tints=[]] Colours applied as CSS `color` to each slot, picked per icon. Monochrome marks drawn with `currentColor` pick this up; leave it empty to keep your artwork's own colours. Ignored by the built-in mark, which carries its own palette ladder.
 * @property {number} [count=150] How many icons make up the pack.
 * @property {number} [seed=1] Reshuffles the layout, sizes, entry bearings and drift. Same seed renders the same pack on server and client.
 * @property {'diamond' | 'rect'} [layout='diamond'] Pack silhouette. `diamond` is the rotated square with corners up/down/left/right; `rect` fills the container edge to edge.
 * @property {number} [spreadX=0.47] Half-width of the pack, as a fraction of the container. Raise it to stretch the shape horizontally.
 * @property {number} [spreadY=0.47] Half-height of the pack, as a fraction of the container.
 * @property {number} [minIconSize=0.024] Smallest icon, as a fraction of the container width.
 * @property {number} [maxIconSize=0.072] Largest icon, as a fraction of the container width.
 * @property {number} [magnetRadius=0.42] How far the cursor's pull reaches, as a fraction of the container.
 * @property {number} [magnetStrength=0.18] Peak displacement for an icon directly under the cursor, as a fraction of the container.
 * @property {number} [curl=0.3] Mixes in a push perpendicular to the pull, giving the field a swirl instead of a straight-line tug. 0 is a pure radial magnet.
 * @property {number} [drift=1] Multiplier on the idle floating motion. 0 holds the pack perfectly still once it lands.
 * @property {number} [entryStagger=0.012] Seconds between each icon launching, so the pack converges in a wave rather than all at once.
 * @property {boolean} [autoDemo=true] Runs one scripted cursor sweep across the pack after the entry settles, so a visitor who never moves their mouse still sees the magnetic interaction. Cancels the moment they move it themselves.
 * @property {string} [ariaLabel='A drifting cluster of logo marks'] Label for the cluster, which is exposed as a single decorative image to assistive tech.
 * @property {string} [className] Extra classes merged onto the outermost root element.
 */
export type MagneticLogoClusterProps = {
  icons?: ReactNode[]
  tints?: string[]
  count?: number
  seed?: number
  layout?: 'diamond' | 'rect'
  spreadX?: number
  spreadY?: number
  minIconSize?: number
  maxIconSize?: number
  magnetRadius?: number
  magnetStrength?: number
  curl?: number
  drift?: number
  entryStagger?: number
  autoDemo?: boolean
  ariaLabel?: string
  className?: string
}

export default function MagneticLogoCluster({
  icons,
  tints = [],
  count = 150,
  seed = 1,
  layout = 'diamond',
  spreadX = 0.47,
  spreadY = 0.47,
  minIconSize = 0.024,
  maxIconSize = 0.072,
  magnetRadius = 0.42,
  magnetStrength = 0.18,
  curl = 0.3,
  drift = 1,
  entryStagger = 0.012,
  autoDemo = true,
  ariaLabel = 'A drifting cluster of logo marks',
  className = '',
}: MagneticLogoClusterProps) {
  const reduceMotion = useReducedMotion() ?? false
  const uid = useId().replace(/:/g, '')
  const iconCount = icons?.length ?? 0

  // Compared by value, so inline tints arrays don't rebuild the pack.
  const tintsKey = tints.join('|')

  const items = useMemo(
    () =>
      buildCluster({
        count,
        seed,
        layout,
        spreadX,
        spreadY,
        minIconSize,
        maxIconSize,
        drift,
        entryStagger,
        iconCount,
        tints,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      count,
      seed,
      layout,
      spreadX,
      spreadY,
      minIconSize,
      maxIconSize,
      drift,
      entryStagger,
      iconCount,
      tintsKey,
    ],
  )

  const clusterRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState(0)
  const interactedRef = useRef(false)
  // A ref, not state: state would re-run the effect and cancel the demo.
  const demoPlayedRef = useRef(false)

  const mouseX = useMotionValue(PARKED)
  const mouseY = useMotionValue(PARKED)

  useEffect(() => {
    const el = clusterRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      setSize(entries[0]?.contentRect.width ?? 0)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || !clusterRef.current) return
    interactedRef.current = true
    const rect = clusterRef.current.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }
  function handlePointerLeave() {
    mouseX.set(PARKED)
    mouseY.set(PARKED)
  }

  useEffect(() => {
    if (!autoDemo || reduceMotion || size <= 0 || demoPlayedRef.current) return

    const entryDoneMs = count * entryStagger * 1000 + 900
    const startDelay = entryDoneMs + 400
    const sweepDuration = 1500
    const pauseAfter = 400

    let cancelled = false
    let rafId = 0
    let parkTimer = 0

    const startTimer = window.setTimeout(() => {
      if (cancelled || interactedRef.current) return
      demoPlayedRef.current = true
      const startedAt = performance.now()

      const tick = () => {
        if (cancelled) {
          mouseX.set(PARKED)
          mouseY.set(PARKED)
          return
        }
        if (interactedRef.current) return
        const t = Math.min(1, (performance.now() - startedAt) / sweepDuration)
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
        const startX = -size * 0.45
        const endX = size * 0.65
        mouseX.set(startX + (endX - startX) * eased)
        mouseY.set(Math.sin(eased * Math.PI) * size * -0.08)
        if (t < 1) {
          rafId = requestAnimationFrame(tick)
        } else {
          parkTimer = window.setTimeout(() => {
            if (cancelled || interactedRef.current) return
            mouseX.set(PARKED)
            mouseY.set(PARKED)
          }, pauseAfter)
        }
      }
      rafId = requestAnimationFrame(tick)
    }, startDelay)

    return () => {
      cancelled = true
      window.clearTimeout(startTimer)
      window.clearTimeout(parkTimer)
      cancelAnimationFrame(rafId)
      if (demoPlayedRef.current && !interactedRef.current) {
        mouseX.set(PARKED)
        mouseY.set(PARKED)
      }
    }
  }, [autoDemo, size, count, entryStagger, reduceMotion, mouseX, mouseY])

  return (
    <div
      onPointerMove={handlePointer}
      onPointerLeave={handlePointerLeave}
      className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#EFEFEA] dark:bg-[#0E0E0F] ${className}`}
      // pan-y, not none: the page must still scroll on touch.
      style={{ touchAction: 'pan-y' }}
    >
      <style dangerouslySetInnerHTML={{ __html: CLUSTER_CSS }} />
      <GradientDefs uid={uid} />
      <div
        ref={clusterRef}
        role='img'
        aria-label={ariaLabel}
        className='relative aspect-square'
        style={{ width: 'min(86vw, 78vh, 640px)' }}
      >
        {/* Mount after measuring: Framer Motion reads `initial` only once. */}
        {size > 0 &&
          items.map((item) => (
            <ClusterIcon
              key={item.id}
              item={item}
              size={size}
              mouseX={mouseX}
              mouseY={mouseY}
              reduceMotion={reduceMotion}
              magnetRadius={magnetRadius}
              magnetStrength={magnetStrength}
              curl={curl}
              uid={uid}
            >
              {icons?.[item.iconIndex]}
            </ClusterIcon>
          ))}
      </div>
    </div>
  )
}
