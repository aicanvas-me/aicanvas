'use client'

// npm install @phosphor-icons/react framer-motion

import { useEffect, useRef, useState, type ComponentType, type RefObject } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { Footprints, Fire, Moon, Drop, Heart, Lightning, Path } from '@phosphor-icons/react'


const SECONDS_PER_TURN = 45
const REDUCED_SECONDS_PER_TURN = SECONDS_PER_TURN * 4

const ENGAGED_LIFT_Z = 120
const REDUCED_LIFT_Z = 30
const ENGAGED_SCALE = 1.18
const REDUCED_ENGAGED_SCALE = 1.06


const LIFT_SPRING = { stiffness: 140, damping: 28, mass: 1 } as const


const SPRING = { stiffness: 200, damping: 24, mass: 1 } as const
const SPEED_SPRING = { stiffness: 90, damping: 20, mass: 1 } as const


const CARD_W = 240
const CARD_H = 138



const PETAL_SKEW_Y = 0





const OUTWARD_OFFSET_PX = '0px'



// One angle per METRICS entry, in the same order.
const SLOT_ANGLES: readonly number[] = [
  -35.55,
  22.14,
  71.01,
  122.25,
  161.58,
  -150.4,
  -108.41,
]





const STAGE_SIZE = 'clamp(300px, 50vw, 560px)'


type PhosphorIconProps = {
  size?: number | string
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
  color?: string
}

type Metric = {
  title: string
  label: string
  value: string
  delta: string
  surface: string
  gradientEnd: string
  dark: string
  // Sparkline y positions, 0 (top) to 36 (bottom), not raw data values.
  sparkline: readonly number[]
  Icon: ComponentType<PhosphorIconProps>
}

const METRICS: Metric[] = [
  {
    title: 'Steps',
    label: 'TODAY',
    value: '20.5K',
    delta: '+5K',
    surface: '#EAF6AE',
    gradientEnd: '#ACC13C',
    dark: '#5C662A',
    sparkline: [28, 18, 10, 6],
    Icon: Footprints,
  },
  {
    title: 'Calories',
    label: 'BURNED',
    value: '1,820',
    delta: '+120',
    surface: '#F9C8A7',
    gradientEnd: '#D4783A',
    dark: '#853C0B',
    sparkline: [30, 8, 20, 6],
    Icon: Fire,
  },
  {
    title: 'Sleep',
    label: 'LAST NIGHT',
    value: '7h 42m',
    delta: '+18m',
    surface: '#C1C2FA',
    gradientEnd: '#7B7DF0',
    dark: '#363885',
    sparkline: [22, 30, 14, 18],
    Icon: Moon,
  },
  {
    title: 'Water',
    label: 'TODAY',
    value: '2.1 L',
    delta: '+0.4 L',
    surface: '#96D9F7',
    gradientEnd: '#4BB8F0',
    dark: '#085B80',
    sparkline: [26, 14, 20, 4],
    Icon: Drop,
  },
  {
    title: 'Heart',
    label: 'RESTING',
    value: '72 BPM',
    delta: '−4',
    surface: '#FBB1BE',
    gradientEnd: '#F07090',
    dark: '#862334',
    sparkline: [8, 22, 16, 28],
    Icon: Heart,
  },
  {
    title: 'Active',
    label: 'THIS WEEK',
    value: '48 min',
    delta: '+12 min',
    surface: '#9BE6DD',
    gradientEnd: '#48C7B8',
    dark: '#0B655B',
    sparkline: [32, 20, 10, 4],
    Icon: Lightning,
  },
  {
    title: 'Distance',
    label: 'THIS WEEK',
    value: '8.4 km',
    delta: '+1.2 km',
    surface: '#FAD79C',
    gradientEnd: '#E8B040',
    dark: '#875706',
    sparkline: [24, 12, 20, 6],
    Icon: Path,
  },
]



function SparkLine({ points, color, id }: { points: readonly number[]; color: string; id: string }) {
  const W = 54, H = 36
  const n = points.length
  const xs = points.map((_, i) => (i / (n - 1)) * W)
  const pts = points.map((y, i) => ({ x: xs[i], y }))

  const segs: string[] = [`M ${pts[0].x},${pts[0].y}`]
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(n - 1, i + 2)]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    segs.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`)
  }
  const linePath = segs.join(' ')
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`
  const gradId = `spark-${id}`

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}



function useTheme(ref: RefObject<HTMLElement | null>) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const read = () => {
      const scope = element.closest('[data-card-theme]') as HTMLElement | null
      if (scope) {
        setTheme(scope.dataset.cardTheme === 'dark' ? 'dark' : 'light')
        return
      }
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    }
    read()
    const observers: MutationObserver[] = []
    let current: HTMLElement | null = element
    while (current) {
      const o = new MutationObserver(read)
      o.observe(current, { attributes: true, attributeFilter: ['class', 'data-card-theme'] })
      observers.push(o)
      current = current.parentElement
    }
    return () => observers.forEach((o) => o.disconnect())
  }, [ref])
  return { theme }
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}


type CardProps = {
  index: number
  metric: Metric
  rotation: MotionValue<number>
  engagedIndex: number | null
  topIndex: number | null
  reduced: boolean
  onToggle: (index: number) => void
}

function Card({
  index,
  metric,
  rotation,
  engagedIndex,
  topIndex,
  reduced,
  onToggle,
}: CardProps) {
  const engaged = engagedIndex === index
  const isTop = topIndex === index

  const slotTargetDeg = SLOT_ANGLES[index]

  const outwardFactorTarget = useMotionValue(1)
  const outwardFactor = useSpring(outwardFactorTarget, SPRING)

  const centeringFactorTarget = useMotionValue(0)
  const centeringFactor = useSpring(centeringFactorTarget, LIFT_SPRING)

  const skewFactorTarget = useMotionValue(1)
  const skewFactor = useSpring(skewFactorTarget, SPRING)

  const liftTarget = useMotionValue(0)
  const lift = useSpring(liftTarget, LIFT_SPRING)

  const scaleTarget = useMotionValue(1)
  const scale = useSpring(scaleTarget, LIFT_SPRING)

  const opacityTarget = useMotionValue(1)
  const cardOpacity = useSpring(opacityTarget, SPRING)

  const initialRot = SLOT_ANGLES[index] + rotation.get()
  const cardRotation = useMotionValue(initialRot)
  const followModeRef = useRef<boolean>(true)
  const followBaseRef = useRef<number>(SLOT_ANGLES[index])

  useMotionValueEvent(rotation, 'change', (latest) => {
    if (!followModeRef.current) return
    cardRotation.set(followBaseRef.current + latest)
  })

  useEffect(() => {
    const shortestEquivalent = (current: number, target: number): number => {
      let delta = target - current
      while (delta > 180) delta -= 360
      while (delta <= -180) delta += 360
      return current + delta
    }

    if (engaged) {
      followBaseRef.current = 0
      followModeRef.current = false

      const current = cardRotation.get()
      const shortestTarget = shortestEquivalent(current, 0)

      const controls = animate(cardRotation, shortestTarget, {
        type: 'spring',
        ...LIFT_SPRING,
      })
      return () => controls.stop()
    } else {
      followBaseRef.current = slotTargetDeg
      cardRotation.set(slotTargetDeg + rotation.get())
      followModeRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engaged, slotTargetDeg, index])

  useEffect(() => {
    if (engaged) {
      outwardFactorTarget.set(0)
      centeringFactorTarget.set(1)
      skewFactorTarget.set(0)
      liftTarget.set(reduced ? REDUCED_LIFT_Z : ENGAGED_LIFT_Z)
      scaleTarget.set(reduced ? REDUCED_ENGAGED_SCALE : ENGAGED_SCALE)
      opacityTarget.set(1)
    } else {
      outwardFactorTarget.set(1)
      centeringFactorTarget.set(0)
      skewFactorTarget.set(1)
      liftTarget.set(0)
      scaleTarget.set(1)
      opacityTarget.set(reduced && engagedIndex != null ? 0.7 : 1)
    }
  }, [
    engaged,
    engagedIndex,
    reduced,
    slotTargetDeg,
    outwardFactorTarget,
    centeringFactorTarget,
    skewFactorTarget,
    liftTarget,
    scaleTarget,
    opacityTarget,
  ])

  const pivotTransform = useTransform(
    cardRotation,
    (r) => `rotate(${r as number}deg)`,
  )

  const cardBodyTransform = useTransform(
    [centeringFactor, skewFactor, outwardFactor],
    ([c, sk, ow]) => {
      const cf = c as number
      const skf = sk as number
      const owf = ow as number
      const txPct = -50 * cf
      return (
        `translate(${txPct}%, calc(-50% - (50% + (${OUTWARD_OFFSET_PX}) * ${owf}) * ${1 - cf})) ` +
        `skewY(${PETAL_SKEW_Y * skf}deg)`
      )
    },
  )

  // translateZ needs preserve-3d on every wrapper up to the perspective stage.
  const liftTransform = useTransform(
    [lift, scale],
    ([z, s]) => `translateZ(${z as number}px) scale(${s as number})`,
  )

  const dynamicZIndex = useTransform(lift, (z) => {
    if (z > 4) return 50
    if (engaged) return 40
    if (isTop) return 30
    return 1
  })

  useEffect(() => {
    lift.set(lift.get())
  }, [engaged, isTop, lift])

  const restShadow =
    '4px 6px 14px rgba(0,0,0,0.18), 12px 18px 40px rgba(0,0,0,0.22)'
  const liftedShadow =
    '8px 14px 26px rgba(0,0,0,0.30), 28px 36px 70px rgba(0,0,0,0.34)'

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.stopPropagation()
    onToggle(index)
  }

  const interStack =
    '"Manrope", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'

  const frontShadow =
    '-8px 16px 32px rgba(0,0,0,0.12), -3px 6px 14px rgba(0,0,0,0.18)'

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 0,
        height: 0,
        transformOrigin: '0 0',
        zIndex: dynamicZIndex,
        transformStyle: 'preserve-3d',
        transform: pivotTransform,
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: CARD_W,
          height: CARD_H,
          transformOrigin: '0% 100%',
          transformStyle: 'preserve-3d',
          transform: cardBodyTransform,
          opacity: cardOpacity,
          touchAction: 'manipulation',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onPointerDown={handlePointerDown}
      >
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transform: liftTransform,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 24,
              overflow: 'hidden',
              background: `linear-gradient(to bottom, ${metric.surface}, ${metric.gradientEnd})`,
              boxShadow: engaged ? liftedShadow : frontShadow,
              transition: 'box-shadow 320ms ease',
              padding: '12px 4px 4px 4px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontFamily: interStack,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingLeft: 6,
                paddingTop: 2,
                flexShrink: 0,
              }}
            >
              <metric.Icon size={12} weight="regular" color={metric.dark} />
              <span
                style={{
                  color: '#1a1a1a',
                  fontSize: 12,
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                {metric.title}
              </span>
            </div>

            <div
              style={{
                flex: '1 0 0',
                background: '#f7f7f5',
                borderRadius: 20,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0px 1px 12px rgba(0,0,0,0.25)',
                minHeight: 0,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span
                  style={{
                    background: metric.dark,
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '5px 10px',
                    borderRadius: 999,
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {metric.delta}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <span
                    style={{
                      color: '#1a1a1a',
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.48px',
                      lineHeight: 1,
                    }}
                  >
                    {metric.label}
                  </span>
                  <span
                    style={{
                      color: metric.dark,
                      fontSize: 23,
                      fontWeight: 600,
                      letterSpacing: '-0.28px',
                      lineHeight: 1,
                    }}
                  >
                    {metric.value}
                  </span>
                </div>

                <SparkLine points={metric.sparkline} color={metric.dark} id={String(index)} />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}



export default function RadialCards() {
  const rootRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme(rootRef)
  const isDark = theme === 'dark'
  const reduced = useReducedMotion()

  const rotation = useMotionValue(0)

  const speedTargetRef = useRef(1)
  const speedTarget = useMotionValue(1)
  const speedSmooth = useSpring(speedTarget, SPEED_SPRING)

  const [engagedIndex, setEngagedIndex] = useState<number | null>(null)

  const [topIndex, setTopIndex] = useState<number | null>(null)

  useEffect(() => {
    speedTargetRef.current = 1
    speedTarget.set(speedTargetRef.current)
  }, [engagedIndex, speedTarget])

  const prevTs = useRef<number | null>(null)
  useAnimationFrame((t) => {
    const last = prevTs.current
    prevTs.current = t
    if (last == null) return
    const dt = (t - last) / 1000
    const seconds = reduced ? REDUCED_SECONDS_PER_TURN : SECONDS_PER_TURN
    const degPerSec = 360 / seconds
    const next = rotation.get() + degPerSec * speedSmooth.get() * dt
    rotation.set(((next % 360) + 360) % 360)
  })

  function handleToggle(i: number) {
    setTopIndex(i)
    setEngagedIndex((prev) => (prev === i ? null : i))
  }

  function handleStageRelease() {
    setEngagedIndex(null)
  }

  return (
    <div
      ref={rootRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
      style={{
        background: isDark ? '#1A1A19' : '#F0F0E8',
      }}
      onPointerDown={handleStageRelease}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(60% 60% at 50% 50%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 35%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: STAGE_SIZE,
          height: STAGE_SIZE,
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
          touchAction: 'manipulation',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
          }}
        >
          {METRICS.map((metric, i) => (
            <Card
              key={metric.title}
              index={i}
              metric={metric}
              rotation={rotation}
              engagedIndex={engagedIndex}
              topIndex={topIndex}
              reduced={reduced}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
