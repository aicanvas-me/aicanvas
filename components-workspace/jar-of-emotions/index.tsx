'use client'

// npm install framer-motion matter-js

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Engine, World, Body, Runner } from 'matter-js'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

function useTheme(ref: RefObject<HTMLElement | null>): { theme: 'light' | 'dark' } {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  useEffect(() => {
    if (typeof document === 'undefined') return
    const el = ref.current
    const update = () => {
      const card = el?.closest('[data-card-theme]') ?? null
      const dark = card
        ? card.classList.contains('dark')
        : document.documentElement.classList.contains('dark')
      setTheme(dark ? 'dark' : 'light')
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = el?.closest('[data-card-theme]')
    if (cardWrapper) observer.observe(cardWrapper, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [ref])
  return { theme }
}


const GRAVITY_SCALE = 0.0018
const EMOJI_SIZE = 34
const EMOJI_FONT = 30
const MAX_BODIES = 30
const MAX_INTERIOR = 8
const WALL_THICKNESS = 40
const JAR_WALL_THICKNESS = 24


const JAR_VIEW_W = 200
const JAR_VIEW_H = 240

const MOUTH_LEFT = 40
const MOUTH_RIGHT = 160

const JAR_INNER_LEFT = 32
const JAR_INNER_RIGHT = 168
const JAR_INNER_TOP = 46
const JAR_INNER_BOTTOM = 226

const LID_X = 26
const LID_Y = 22
const LID_W = 148
const LID_H = 18
const LID_HINGE_X = LID_X
const LID_HINGE_Y = LID_Y + LID_H / 2


type Emotion = {
  id: string
  emoji: string
  label: string
  darkColor: string
  lightColor: string
}

const EMOTIONS: Emotion[] = [
  { id: 'banger',   emoji: '🔥', label: 'Banger',   darkColor: '#FF6B35', lightColor: '#C94400' },
  { id: 'perfect',  emoji: '👌', label: 'Perfect',  darkColor: '#6BD97A', lightColor: '#1E8A35' },
  { id: 'purejoy',  emoji: '😄', label: 'Pure joy', darkColor: '#F5C046', lightColor: '#C47A00' },
  { id: 'crying',   emoji: '😭', label: 'Crying',   darkColor: '#7FB4F0', lightColor: '#2E6FC1' },
  { id: 'cooking',  emoji: '🧑‍🍳', label: 'Cooking',  darkColor: '#FFB347', lightColor: '#B86A00' },
  { id: 'goat',     emoji: '🐐', label: 'GOAT',     darkColor: '#C4A0F5', lightColor: '#7A45CF' },
]


type Dispensed = {
  id: number
  body: Body
  emoji: string
  emotionId: string
  location: 'inside' | 'outside'
}

type BodyWithMeta = Body & { plugin?: { emotion?: string } }

let uid = 0

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export default function JarOfEmotions() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme(containerRef)
  const isDark = theme === 'dark'
  const overlayRef = useRef<HTMLDivElement>(null)
  const jarWrapRef = useRef<HTMLDivElement>(null)
  const buttonRowRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const matterRef = useRef<typeof import('matter-js') | null>(null)
  const engineRef = useRef<Engine | null>(null)
  const runnerRef = useRef<Runner | null>(null)
  const worldRef = useRef<World | null>(null)
  const dispensedRef = useRef<Dispensed[]>([])
  const jarBoxRef = useRef<{
    x: number
    y: number
    w: number
    h: number
    scale: number
  }>({ x: 0, y: 0, w: 0, h: 0, scale: 1 })

  const [lidOpen, setLidOpen] = useState(false)
  const [dispensedTotal, setDispensedTotal] = useState(0)
  const [renderTick, setRenderTick] = useState(0)
  const lidCloseTimerRef = useRef<number | null>(null)

  useEffect(() => {
    let alive = true
    let rafId = 0
    let ro: ResizeObserver | null = null
    let outerWalls: Body[] = []
    let jarWalls: Body[] = []
    let buttonFloors: Body[] = []

    function recomputeJarBox() {
      const container = containerRef.current
      const jarWrap = jarWrapRef.current
      if (!container || !jarWrap) return
      const cRect = container.getBoundingClientRect()
      const jRect = jarWrap.getBoundingClientRect()
      jarBoxRef.current = {
        x: jRect.left - cRect.left,
        y: jRect.top - cRect.top,
        w: jRect.width,
        h: jRect.height,
        scale: jRect.width / JAR_VIEW_W,
      }
    }

    function buildOuterWalls(
      Matter: typeof import('matter-js'),
      w: number,
      h: number,
    ): Body[] {
      const t = WALL_THICKNESS
      const opts = { isStatic: true, render: { visible: false } }
      return [
        Matter.Bodies.rectangle(w / 2, h + t / 2, w + t * 2, t, opts),
        Matter.Bodies.rectangle(-t / 2, h / 2, t, h * 2, opts),
        Matter.Bodies.rectangle(w + t / 2, h / 2, t, h * 2, opts),
        Matter.Bodies.rectangle(w / 2, -t * 3, w + t * 2, t, opts),
      ]
    }

    function buildJarWalls(Matter: typeof import('matter-js')): Body[] {
      const { x, y, scale } = jarBoxRef.current
      const jy = y
      const t = JAR_WALL_THICKNESS
      const opts = { isStatic: true, render: { visible: false }, friction: 0.6 }

      const leftX = x + (JAR_INNER_LEFT - 2) * scale
      const rightX = x + (JAR_INNER_RIGHT + 2) * scale
      const topY = y + JAR_INNER_TOP * scale
      const botY = y + JAR_INNER_BOTTOM * scale
      const innerH = botY - topY

      return [
        Matter.Bodies.rectangle(
          leftX - t / 2,
          topY + innerH / 2,
          t,
          innerH,
          opts,
        ),
        Matter.Bodies.rectangle(
          rightX + t / 2,
          topY + innerH / 2,
          t,
          innerH,
          opts,
        ),
        ...(() => {
          // Hard-coded trace of the jar path's bottom curve (SVG units); update it with the path.
          const pts = [
            [30, 218], [40, 226], [65, 233], [100, 236],
            [135, 233], [160, 226], [170, 218],
          ]
          const segs: Body[] = []
          for (let i = 0; i < pts.length - 1; i++) {
            const [x1s, y1s] = pts[i]
            const [x2s, y2s] = pts[i + 1]
            const cx = x + (x1s + x2s) / 2 * scale
            const cy = y + (y1s + y2s) / 2 * scale + t / 2
            const len = Math.hypot((x2s - x1s) * scale, (y2s - y1s) * scale)
            const angle = Math.atan2(y2s - y1s, x2s - x1s)
            const seg = Matter.Bodies.rectangle(cx, cy, len + 2, t, opts)
            Matter.Body.setAngle(seg, angle)
            segs.push(seg)
          }
          return segs
        })(),
      ]
    }

    function buildButtonFloors(Matter: typeof import('matter-js')): Body[] {
      const container = containerRef.current
      const row = buttonRowRef.current
      if (!container || !row) return []
      const cRect = container.getBoundingClientRect()
      const bodies: Body[] = []
      for (const emotion of EMOTIONS) {
        const el = buttonRefs.current[emotion.id]
        if (!el) continue
        const r = el.getBoundingClientRect()
        const x = r.left - cRect.left + r.width / 2
        const y = r.top - cRect.top + 4
        const body = Matter.Bodies.rectangle(x, y, r.width, 8, {
          isStatic: true,
          render: { visible: false },
          friction: 0.9,
          restitution: 0.15,
        }) as BodyWithMeta
        body.plugin = { emotion: emotion.id }
        bodies.push(body)
      }
      return bodies
    }

    function seedInterior(Matter: typeof import('matter-js')) {
      const world = worldRef.current
      if (!world) return
      const { x, y, scale } = jarBoxRef.current
      const leftX = x + (JAR_INNER_LEFT + 12) * scale
      const rightX = x + (JAR_INNER_RIGHT - 12) * scale
      const topY = y + JAR_INNER_TOP * scale
      const botY = y + (JAR_INNER_BOTTOM - 10) * scale
      const innerH = botY - topY
      for (let i = 0; i < EMOTIONS.length; i++) {
        const e = EMOTIONS[i]
        const px = rand(leftX, rightX)
        const py = botY - rand(0, innerH * 0.6)
        const body = Matter.Bodies.circle(px, py, EMOJI_SIZE / 2, {
          friction: 0.55,
          frictionAir: 0.06,
          restitution: 0.05,
          density: 0.0018,
          render: { visible: false },
        }) as BodyWithMeta
        body.plugin = { emotion: e.id }
        Matter.Body.setVelocity(body, { x: 0, y: 0 })
        Matter.Composite.add(world, body)
        dispensedRef.current.push({
          id: ++uid,
          body,
          emoji: e.emoji,
          emotionId: e.id,
          location: 'inside',
        })
      }
    }

    function rebuildStatics() {
      const Matter = matterRef.current
      const world = worldRef.current
      if (!Matter || !world) return
      const container = containerRef.current
      if (!container) return
      const cw = container.clientWidth
      const ch = container.clientHeight

      if (outerWalls.length) for (const w of outerWalls) Matter.Composite.remove(world, w)
      if (jarWalls.length) for (const w of jarWalls) Matter.Composite.remove(world, w)
      if (buttonFloors.length) for (const w of buttonFloors) Matter.Composite.remove(world, w)

      outerWalls = buildOuterWalls(Matter, cw, ch)
      Matter.Composite.add(world, outerWalls)

      recomputeJarBox()
      jarWalls = buildJarWalls(Matter)
      Matter.Composite.add(world, jarWalls)

      buttonFloors = buildButtonFloors(Matter)
      Matter.Composite.add(world, buttonFloors)

      for (const d of dispensedRef.current) {
        const p = d.body.position
        let nx = p.x
        let ny = p.y
        if (nx < 8) nx = 8
        if (nx > cw - 8) nx = cw - 8
        if (ny > ch - 8) ny = ch - 8
        if (nx !== p.x || ny !== p.y) Matter.Body.setPosition(d.body, { x: nx, y: ny })
      }
    }

    function tick() {
      if (!alive) return
      const Matter = matterRef.current
      if (Matter) {
        const list = dispensedRef.current
        const outsideCount = list.filter(d => d.location === 'outside').length
        if (outsideCount > MAX_BODIES) {
          const extra = outsideCount - MAX_BODIES
          let removed = 0
          for (let i = 0; i < list.length && removed < extra; i++) {
            const d = list[i]
            if (d.location === 'outside') {
              Matter.Composite.remove(worldRef.current!, d.body)
              list.splice(i, 1)
              i--
              removed++
            }
          }
        }
      }
      setRenderTick((t) => (t + 1) & 0xffff)
      rafId = requestAnimationFrame(tick)
    }

    import('matter-js').then((Matter) => {
      if (!alive) return
      matterRef.current = Matter

      const engine = Matter.Engine.create({
        gravity: { x: 0, y: 1, scale: GRAVITY_SCALE },
      })
      engine.timing.timeScale = 1
      engineRef.current = engine
      worldRef.current = engine.world

      const runner = Matter.Runner.create()
      runnerRef.current = runner
      Matter.Runner.run(runner, engine)

      rebuildStatics()
      seedInterior(Matter)

      ro = new ResizeObserver(() => {
        rebuildStatics()
      })
      if (containerRef.current) ro.observe(containerRef.current)

      rafId = requestAnimationFrame(tick)
    })

    return () => {
      alive = false
      cancelAnimationFrame(rafId)
      if (ro) ro.disconnect()
      if (lidCloseTimerRef.current !== null) {
        clearTimeout(lidCloseTimerRef.current)
        lidCloseTimerRef.current = null
      }
      const Matter = matterRef.current
      if (Matter) {
        if (runnerRef.current) Matter.Runner.stop(runnerRef.current)
        if (worldRef.current) Matter.Composite.clear(worldRef.current, false, true)
        if (engineRef.current) Matter.Engine.clear(engineRef.current)
      }
      matterRef.current = null
      engineRef.current = null
      runnerRef.current = null
      worldRef.current = null
      dispensedRef.current = []
    }
  }, [])

  useIsomorphicLayoutEffect(() => {
    return () => {
      if (lidCloseTimerRef.current !== null) {
        clearTimeout(lidCloseTimerRef.current)
        lidCloseTimerRef.current = null
      }
    }
  }, [])

  function dispense(emotion: Emotion) {
    const Matter = matterRef.current
    const world = worldRef.current
    const container = containerRef.current
    if (!Matter || !world || !container) return

    setLidOpen(true)
    if (lidCloseTimerRef.current !== null) clearTimeout(lidCloseTimerRef.current)
    lidCloseTimerRef.current = window.setTimeout(() => {
      setLidOpen(false)
      lidCloseTimerRef.current = null
    }, 900)

    const list = dispensedRef.current
    let candidate = list.find(
      (d) => d.location === 'inside' && d.emotionId === emotion.id,
    )
    if (!candidate) {
      const interiorCount = list.filter(d => d.location === 'inside').length
      if (interiorCount < MAX_INTERIOR) {
        const { x, y, scale } = jarBoxRef.current
        const leftX = x + (JAR_INNER_LEFT + 14) * scale
        const rightX = x + (JAR_INNER_RIGHT - 14) * scale
        const botY = y + (JAR_INNER_BOTTOM - 14) * scale
        const px = rand(leftX, rightX)
        const py = botY - 4
        const body = Matter.Bodies.circle(px, py, EMOJI_SIZE / 2, {
          friction: 0.55,
          frictionAir: 0.06,
          restitution: 0.05,
          density: 0.0018,
          render: { visible: false },
        }) as BodyWithMeta
        body.plugin = { emotion: emotion.id }
        Matter.Composite.add(world, body)
        candidate = {
          id: ++uid,
          body,
          emoji: emotion.emoji,
          emotionId: emotion.id,
          location: 'inside',
        }
        list.push(candidate)
      }
    }

    if (!candidate) {
      const { x: jx, y: jy, scale: s } = jarBoxRef.current
      const mouthCx = jx + ((MOUTH_LEFT + MOUTH_RIGHT) / 2) * s
      const exitY = jy - 18
      const body = Matter.Bodies.circle(mouthCx, exitY, EMOJI_SIZE / 2, {
        friction: 0.55,
        frictionAir: 0.06,
        restitution: 0.05,
        density: 0.0018,
        render: { visible: false },
      }) as BodyWithMeta
      body.plugin = { emotion: emotion.id }
      Matter.Composite.add(world, body)
      candidate = {
        id: ++uid,
        body,
        emoji: emotion.emoji,
        emotionId: emotion.id,
        location: 'outside',
      }
      list.push(candidate)
    }

    const btn = buttonRefs.current[emotion.id]
    if (!btn) return
    const cRect = container.getBoundingClientRect()
    const bRect = btn.getBoundingClientRect()
    const targetX = bRect.left - cRect.left + bRect.width / 2
    const targetY = bRect.top - cRect.top + 4

    const { x: jx, y: jy, scale: s } = jarBoxRef.current
    const mouthCx = jx + ((MOUTH_LEFT + MOUTH_RIGHT) / 2) * s
    const exitY = jy - 18

    Matter.Body.setPosition(candidate.body, {
      x: mouthCx + rand(-6, 6),
      y: exitY,
    })
    Matter.Body.setAngularVelocity(candidate.body, rand(-0.12, 0.12))

    const dx = targetX - mouthCx
    const upKick = -14 - Math.min(2, Math.abs(dx) / 200)
    const hVel = dx / 60
    Matter.Body.setVelocity(candidate.body, {
      x: hVel + rand(-0.3, 0.3),
      y: upKick,
    })

    candidate.location = 'outside'
    setDispensedTotal(t => t + 1)

    const remainingInside = list.some(
      (d) => d.location === 'inside' && d.emotionId === emotion.id,
    )
    if (!remainingInside) {
      window.setTimeout(() => {
        const w = worldRef.current
        const M = matterRef.current
        if (!w || !M) return
        const innerCount = dispensedRef.current.filter(d => d.location === 'inside').length
        if (innerCount >= MAX_INTERIOR) return
        const { x, y, scale } = jarBoxRef.current
        const lx = x + (JAR_INNER_LEFT + 14) * scale
        const rx = x + (JAR_INNER_RIGHT - 14) * scale
        const spawnY = y + (JAR_INNER_TOP + EMOJI_SIZE / 2 + 4) * scale
        const body = M.Bodies.circle(rand(lx, rx), spawnY, EMOJI_SIZE / 2, {
          friction: 0.55,
          frictionAir: 0.06,
          restitution: 0.05,
          density: 0.0018,
          render: { visible: false },
        }) as BodyWithMeta
        body.plugin = { emotion: emotion.id }
        M.Composite.add(w, body)
        dispensedRef.current.push({ id: ++uid, body, emoji: emotion.emoji, emotionId: emotion.id, location: 'inside' })
      }, 600)
    }
  }

  const styles = useMemo(
    () => ({
      jarFill: isDark ? 'rgba(220, 235, 245, 0.10)' : 'rgba(120, 140, 160, 0.18)',
      jarStroke: isDark ? 'rgba(220, 235, 245, 0.55)' : 'rgba(70, 90, 110, 0.55)',
      jarHighlight: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)',
      jarShadow: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(60,80,100,0.22)',
      lidFill: isDark ? '#B4A27A' : '#8B7349',
      lidStroke: isDark ? '#7A6A47' : '#5C4A28',
      promptColor: isDark ? 'rgba(250, 246, 238, 0.92)' : 'rgba(40, 36, 32, 0.88)',
    }),
    [isDark],
  )

  void renderTick

  return (
    <div
      className="flex min-h-screen w-full items-stretch justify-center"
      style={{ background: isDark ? '#1A1A19' : '#E8E8DF' }}
    >
      <div
        ref={containerRef}
        className="relative flex w-full max-w-2xl flex-col items-center justify-center gap-7 overflow-hidden px-4 py-6 sm:gap-8 sm:px-6 sm:py-10"
        style={{ minHeight: 520 }}
      >
        <div className="relative">
        <div className="relative z-10 flex items-center justify-center">
          <div
            ref={jarWrapRef}
            className="relative"
            style={{
              width: 'min(62vw, 280px)',
              aspectRatio: `${JAR_VIEW_W} / ${JAR_VIEW_H}`,
            }}
          >
            <svg
              viewBox={`0 0 ${JAR_VIEW_W} ${JAR_VIEW_H}`}
              className="block h-full w-full overflow-visible"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="jar-body-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="rgba(255,255,255,0.35)" />
                  <stop offset="18%"  stopColor="rgba(255,255,255,0.08)" />
                  <stop offset="82%"  stopColor="rgba(0,0,0,0.06)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
                </linearGradient>
                <linearGradient id="lid-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="rgba(255,255,255,0.55)" stopOpacity={1} />
                  <stop offset="8%"   stopColor={styles.lidFill} stopOpacity={1} />
                  <stop offset="50%"  stopColor={styles.lidFill} stopOpacity={1} />
                  <stop offset="100%" stopColor={styles.lidStroke} stopOpacity={1} />
                </linearGradient>
                <filter id="lid-drop-shadow" x="-20%" y="-20%" width="160%" height="160%">
                  <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.35)" />
                </filter>
                <filter id="shadow-blur" x="-40%" y="-100%" width="180%" height="400%">
                  <feGaussianBlur stdDeviation="6" />
                </filter>
                <linearGradient id="jar-right-shadow" x1="1" y1="0" x2="0" y2="0">
                  <stop offset="0%"  stopColor="rgba(0,0,0,0.18)" />
                  <stop offset="30%" stopColor="rgba(0,0,0,0)" />
                </linearGradient>
                <radialGradient id="jar-bottom-glow" cx="50%" cy="100%" r="50%" fx="50%" fy="100%">
                  <stop offset="0%"   stopColor="rgba(255,255,255,0.12)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
                <clipPath id="jar-clip">
                  <path
                    d={`
                      M ${JAR_INNER_LEFT - 4} 44
                      Q ${JAR_INNER_LEFT - 10} 120, ${JAR_INNER_LEFT - 2} ${JAR_INNER_BOTTOM - 8}
                      Q ${JAR_INNER_LEFT} ${JAR_VIEW_H - 6}, ${JAR_VIEW_W / 2} ${JAR_VIEW_H - 4}
                      Q ${JAR_INNER_RIGHT} ${JAR_VIEW_H - 6}, ${JAR_INNER_RIGHT + 2} ${JAR_INNER_BOTTOM - 8}
                      Q ${JAR_INNER_RIGHT + 10} 120, ${JAR_INNER_RIGHT + 4} 44
                      Z
                    `}
                  />
                </clipPath>
              </defs>

              <ellipse
                cx={JAR_VIEW_W / 2}
                cy={JAR_VIEW_H - 16}
                rx={JAR_VIEW_W / 2.1}
                ry={10}
                fill={styles.jarShadow}
                opacity={0.75}
                filter="url(#shadow-blur)"
              />

              <path
                d={`
                  M ${JAR_INNER_LEFT - 4} 44
                  Q ${JAR_INNER_LEFT - 10} 120, ${JAR_INNER_LEFT - 2} ${JAR_INNER_BOTTOM - 8}
                  Q ${JAR_INNER_LEFT} ${JAR_VIEW_H - 6}, ${JAR_VIEW_W / 2} ${JAR_VIEW_H - 4}
                  Q ${JAR_INNER_RIGHT} ${JAR_VIEW_H - 6}, ${JAR_INNER_RIGHT + 2} ${JAR_INNER_BOTTOM - 8}
                  Q ${JAR_INNER_RIGHT + 10} 120, ${JAR_INNER_RIGHT + 4} 44
                  Z
                `}
                fill="url(#jar-body-grad)"
                stroke={styles.jarStroke}
                strokeWidth={2}
                strokeLinejoin="round"
              />

              <rect
                x={JAR_INNER_LEFT - 8}
                y={36}
                width={JAR_INNER_RIGHT - JAR_INNER_LEFT + 16}
                height={12}
                rx={4}
                fill={styles.jarFill}
                stroke={styles.jarStroke}
                strokeWidth={1.5}
                opacity={0.85}
              />

              <g clipPath="url(#jar-clip)">
                <ellipse
                  cx={JAR_INNER_LEFT + 10}
                  cy={(JAR_INNER_TOP + JAR_INNER_BOTTOM) / 2}
                  rx={8}
                  ry={60}
                  fill="white"
                  opacity={0.30}
                />
                <rect
                  x={JAR_INNER_RIGHT - 18}
                  y={JAR_INNER_TOP}
                  width={18}
                  height={JAR_INNER_BOTTOM - JAR_INNER_TOP}
                  fill="url(#jar-right-shadow)"
                />
                <path
                  d={`
                    M ${JAR_INNER_LEFT - 4} ${JAR_INNER_BOTTOM - 40}
                    L ${JAR_INNER_RIGHT + 4} ${JAR_INNER_BOTTOM - 40}
                    L ${JAR_INNER_RIGHT + 2} ${JAR_INNER_BOTTOM - 8}
                    Q ${JAR_INNER_RIGHT} ${JAR_VIEW_H - 6}, ${JAR_VIEW_W / 2} ${JAR_VIEW_H - 4}
                    Q ${JAR_INNER_LEFT} ${JAR_VIEW_H - 6}, ${JAR_INNER_LEFT - 2} ${JAR_INNER_BOTTOM - 8}
                    Z
                  `}
                  fill="url(#jar-bottom-glow)"
                />
              </g>

              <motion.g
                animate={{ rotate: lidOpen ? -70 : 0 }}
                transition={{
                  type: 'spring',
                  stiffness: lidOpen ? 260 : 200,
                  damping: lidOpen ? 14 : 22,
                }}
                style={{
                  originX: 0,
                  originY: 0.5,
                  transformBox: 'fill-box',
                }}
              >
                <rect
                  x={LID_X}
                  y={LID_Y}
                  width={LID_W}
                  height={LID_H}
                  rx={6}
                  fill="url(#lid-grad)"
                  stroke={styles.lidStroke}
                  strokeWidth={1.5}
                  filter="url(#lid-drop-shadow)"
                />
                <rect
                  x={LID_X + 4}
                  y={LID_Y + 2}
                  width={LID_W - 8}
                  height={2}
                  rx={1}
                  fill="white"
                  opacity={0.35}
                />
                <rect
                  x={LID_X + 6}
                  y={LID_Y + 5}
                  width={LID_W - 12}
                  height={1}
                  rx={0.5}
                  fill={styles.lidStroke}
                  opacity={0.20}
                />
                <rect
                  x={LID_X + 6}
                  y={LID_Y + 9}
                  width={LID_W - 12}
                  height={1}
                  rx={0.5}
                  fill={styles.lidStroke}
                  opacity={0.18}
                />
                <rect
                  x={LID_X + 6}
                  y={LID_Y + 13}
                  width={LID_W - 12}
                  height={1}
                  rx={0.5}
                  fill={styles.lidStroke}
                  opacity={0.15}
                />
                <circle
                  cx={LID_HINGE_X + 3}
                  cy={LID_HINGE_Y}
                  r={1.8}
                  fill={styles.lidStroke}
                />
              </motion.g>
            </svg>
          </div>
        </div>

        <AnimatePresence>
          {dispensedTotal >= 30 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="pointer-events-none absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-2xl px-5 py-3"
              style={{ background: '#ef4444', boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.5)' }}
            >
              <p className="text-center font-sans text-sm font-bold leading-snug text-white sm:text-base">
                Full. Please Stop.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="z-10 flex flex-col items-center gap-1 text-center"
        >
          <h2
            className="font-sans text-xl font-extrabold tracking-tight sm:text-2xl"
            style={{ color: styles.promptColor, letterSpacing: '-0.02em' }}
          >
            Emoji Reaction Jar
          </h2>
          <p
            className="font-sans text-xs font-medium sm:text-sm"
            style={{ color: isDark ? 'rgba(250,246,238,0.45)' : 'rgba(40,36,32,0.45)' }}
          >
            Reactions on tap
          </p>
        </motion.div>

        <div
          ref={buttonRowRef}
          className="z-10 flex w-full flex-wrap items-end justify-center gap-2 sm:gap-3"
        >
          {EMOTIONS.map((e) => (
            <motion.button
              key={e.id}
              ref={(el) => {
                buttonRefs.current[e.id] = el
              }}
              type="button"
              onClick={() => dispense(e)}
              whileHover={{ y: -2, scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="flex min-w-[58px] flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-2 font-sans transition-colors sm:min-w-[68px] sm:px-3"
              style={{
                minHeight: 48,
                background: isDark
                  ? 'rgba(255, 250, 235, 0.04)'
                  : 'rgba(255, 255, 255, 0.7)',
                borderColor: isDark
                  ? 'rgba(255, 250, 235, 0.14)'
                  : 'rgba(40, 36, 32, 0.12)',
                boxShadow: isDark
                  ? '0 2px 6px rgba(0,0,0,0.18)'
                  : '0 2px 8px rgba(40, 36, 32, 0.08)',
              }}
              aria-label={e.label}
            >
              <span className="text-xl leading-none sm:text-2xl" aria-hidden>
                {e.emoji}
              </span>
              <span
                className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs"
                style={{
                  letterSpacing: '0.06em',
                  color: isDark ? 'rgba(255,250,235,0.65)' : 'rgba(40,36,32,0.55)',
                }}
              >
                {e.label}
              </span>
            </motion.button>
          ))}
        </div>

        <div
          ref={overlayRef}
          className="pointer-events-none absolute inset-0 z-20"
          aria-hidden
        >
          <AnimatePresence>
            {dispensedRef.current.map((d) => {
              const p = d.body.position
              const angle = d.body.angle
              if (d.location !== 'outside') return null
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    left: p.x - EMOJI_SIZE / 2,
                    top: p.y - EMOJI_SIZE / 2,
                    width: EMOJI_SIZE,
                    height: EMOJI_SIZE,
                    fontSize: EMOJI_FONT,
                    lineHeight: `${EMOJI_SIZE}px`,
                    textAlign: 'center',
                    transform: `rotate(${angle}rad)`,
                    willChange: 'transform, left, top',
                    userSelect: 'none',
                    filter: isDark
                      ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))'
                      : 'drop-shadow(0 2px 3px rgba(40,36,32,0.25))',
                  }}
                >
                  {d.emoji}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-[15]"
          aria-hidden
        >
          {dispensedRef.current.map((d) => {
            if (d.location !== 'inside') return null
            const p = d.body.position
            const angle = d.body.angle
            return (
              <div
                key={d.id}
                style={{
                  position: 'absolute',
                  left: p.x - EMOJI_SIZE / 2,
                  top: p.y - EMOJI_SIZE / 2,
                  width: EMOJI_SIZE,
                  height: EMOJI_SIZE,
                  fontSize: EMOJI_FONT,
                  lineHeight: `${EMOJI_SIZE}px`,
                  textAlign: 'center',
                  transform: `rotate(${angle}rad)`,
                  willChange: 'transform, left, top',
                  userSelect: 'none',
                  opacity: 0.92,
                }}
              >
                {d.emoji}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
