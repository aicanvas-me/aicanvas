'use client'

/**
 * Renders a seeded diamond grid with traveling ignition pulses.
 * It adapts its canvas animation to visibility, theme, and reduced motion.
 */

import { useEffect, useRef } from 'react'

type DiamondGridProps = {
  /** Extra classes merged onto the outermost root element. */
  className?: string
  /** Determines grid placement, ignition positions and the complete loop sequence. */
  seed?: number
}

const LOOP_MS = 64000
// tune: raise the event count to increase concurrent ignitions
const EVENT_COUNT = 34
const STATIC_TIME_MS = 27000
const STAR_SIZE = 30
const TAU = Math.PI * 2
const GRID_COS = Math.SQRT1_2

const DARK = {
  ground: '#000000',
  ink: '255,255,255',
  line: 0.3,
  pulse: 0.7,
  comp: 'lighter' as GlobalCompositeOperation,
}

const LIGHT = {
  ground: '#FAF8F5',
  ink: '14,14,16',
  line: 0.34,
  pulse: 0.5,
  comp: 'source-over' as GlobalCompositeOperation,
}

type Palette = typeof DARK | typeof LIGHT

type Ignition = {
  col: number
  row: number
  start: number
  duration: number
  decayStart: number
  travel: number
  reach: number
  phase: number
}

type GridTransform = {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
}

type Field = {
  cell: number
  x0: number
  y0: number
  cols: number
  rows: number
  transform: GridTransform
  events: Ignition[]
}

function makeAlphaStyles(ink: string) {
  const styles: string[] = []
  for (let i = 0; i < 256; i++) styles.push(`rgba(${ink},${i / 255})`)
  return styles
}

const DARK_STYLES = makeAlphaStyles(DARK.ink)
const LIGHT_STYLES = makeAlphaStyles(LIGHT.ink)

function mulberry32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp = (value: number, low: number, high: number) =>
  value < low ? low : value > high ? high : value

const clampInt = (value: number, low: number, high: number) =>
  Math.round(clamp(value, low, high))

const smoothstep = (value: number) => {
  const p = clamp(value, 0, 1)
  return p * p * (3 - 2 * p)
}

function diagonalStrength(x: number, y: number, W: number, H: number) {
  const distance = Math.abs(x / W - y / H)
  return 1 - smoothstep((distance - 0.16) / 0.64)
}

function makeGridTransform(W: number, H: number): GridTransform {
  return {
    a: GRID_COS,
    b: GRID_COS,
    c: -GRID_COS,
    d: GRID_COS,
    e: W * 0.5,
    f: H * 0.5,
  }
}

function gridToScreen(transform: GridTransform, x: number, y: number) {
  return {
    x: transform.a * x + transform.c * y + transform.e,
    y: transform.b * x + transform.d * y + transform.f,
  }
}

function screenToGrid(transform: GridTransform, x: number, y: number) {
  const dx = x - transform.e
  const dy = y - transform.f
  return {
    x: transform.a * dx + transform.b * dy,
    y: transform.c * dx + transform.d * dy,
  }
}

function buildField(W: number, H: number, seed: number): Field {
  const rnd = mulberry32(seed)
  // tune: raise the scale factor to widen the grid spacing
  const cell = clamp(Math.min(W, H) * 0.113, 65, 124)
  const transform = makeGridTransform(W, H)
  const corners = [
    screenToGrid(transform, 0, 0),
    screenToGrid(transform, W, 0),
    screenToGrid(transform, 0, H),
    screenToGrid(transform, W, H),
  ]
  const minX = Math.min(...corners.map((point) => point.x))
  const maxX = Math.max(...corners.map((point) => point.x))
  const minY = Math.min(...corners.map((point) => point.y))
  const maxY = Math.max(...corners.map((point) => point.y))
  const x0 = minX - cell * (1 + rnd())
  const y0 = minY - cell * (1 + rnd())
  const cols = Math.ceil((maxX + cell - x0) / cell) + 1
  const rows = Math.ceil((maxY + cell - y0) / cell) + 1
  const gaps = new Float32Array(EVENT_COUNT)
  let gapTotal = 0

  for (let i = 0; i < EVENT_COUNT; i++) {
    const gap = i % 3 === 0 ? 1200 + rnd() * 1400 : 3600 + rnd() * 3200
    gaps[i] = gap
    gapTotal += gap
  }

  const gapScale = LOOP_MS / gapTotal
  const events: Ignition[] = []
  let cursor = 0

  const pickVisibleNode = () => {
    let col = 1
    let row = 1
    for (let attempt = 0; attempt < 40; attempt++) {
      col = 1 + Math.floor(rnd() * Math.max(1, cols - 2))
      row = 1 + Math.floor(rnd() * Math.max(1, rows - 2))
      const point = gridToScreen(transform, x0 + col * cell, y0 + row * cell)
      if (
        point.x >= 0 &&
        point.x <= W &&
        point.y >= 0 &&
        point.y <= H &&
        diagonalStrength(point.x, point.y, W, H) > 0.28
      ) {
        break
      }
    }
    return { col, row }
  }

  for (let i = 0; i < EVENT_COUNT; i++) {
    let position = pickVisibleNode()

    if (i % 3 === 1 && events.length > 0) {
      const previous = events[i - 1]
      const offset = (rnd() < 0.5 ? -1 : 1) * (2 + Math.floor(rnd() * 2))
      if (rnd() < 0.5) {
        position = {
          col: clampInt(previous.col + offset, 1, cols - 2),
          row: previous.row,
        }
      } else {
        position = {
          col: previous.col,
          row: clampInt(previous.row + offset, 1, rows - 2),
        }
      }

      const point = gridToScreen(
        transform,
        x0 + position.col * cell,
        y0 + position.row * cell,
      )
      if (
        point.x < 0 ||
        point.x > W ||
        point.y < 0 ||
        point.y > H ||
        diagonalStrength(point.x, point.y, W, H) < 0.2
      ) {
        position = pickVisibleNode()
      }
    }

    const duration = 25000 + rnd() * 7000
    events.push({
      col: position.col,
      row: position.row,
      start: cursor,
      duration,
      decayStart: 10500 + rnd() * 4500,
      travel: 3200 + rnd() * 900,
      reach: 2.5 + rnd() * 1.25,
      phase: rnd() * TAU,
    })
    cursor += gaps[i] * gapScale
  }

  return { cell, x0, y0, cols, rows, transform, events }
}

function addStarPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  inner: number,
) {
  context.moveTo(x, y - radius)
  context.lineTo(x + inner, y - inner)
  context.lineTo(x + radius, y)
  context.lineTo(x + inner, y + inner)
  context.lineTo(x, y + radius)
  context.lineTo(x - inner, y + inner)
  context.lineTo(x - radius, y)
  context.lineTo(x - inner, y - inner)
  context.closePath()
}

/**
 * @typedef {object} DiamondGridProps
 * @property {string} [className] Extra classes merged onto the outermost root element.
 * @property {number} [seed=1337] Determines grid placement, ignition positions and the complete loop sequence.
 */
export default function DiamondGrid({ className, seed = 1337 }: DiamondGridProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isDark = () => {
      const cardTheme = host.closest('[data-card-theme]')?.getAttribute('data-card-theme')
      if (cardTheme === 'light') return false
      if (cardTheme === 'dark') return true
      return document.documentElement.classList.contains('dark')
    }

    const baseCanvas = document.createElement('canvas')
    const liveCanvas = document.createElement('canvas')
    const maskCanvas = document.createElement('canvas')
    const starCanvas = document.createElement('canvas')
    const baseCtx = baseCanvas.getContext('2d')
    const liveCtx = liveCanvas.getContext('2d')
    const maskCtx = maskCanvas.getContext('2d')
    const starCtx = starCanvas.getContext('2d')
    if (!baseCtx || !liveCtx || !maskCtx || !starCtx) return

    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let W = 0
    let H = 0
    let dpr = 1
    let dark = isDark()
    let reduce = motionMq.matches
    let field: Field | null = null
    let elapsed = 0
    let last = 0
    let raf = 0
    let running = false
    let onScreen = false

    const theme = (): Palette => (dark ? DARK : LIGHT)
    const styles = () => (dark ? DARK_STYLES : LIGHT_STYLES)
    const styleAt = (alpha: number) =>
      styles()[Math.round(clamp(alpha, 0, 1) * 255)]

    const sizeSurface = (surface: HTMLCanvasElement, width: number, height: number) => {
      surface.width = Math.max(1, Math.round(width * dpr))
      surface.height = Math.max(1, Math.round(height * dpr))
    }

    const setGridTransform = (target: CanvasRenderingContext2D, f: Field) => {
      const transform = f.transform
      target.setTransform(
        dpr * transform.a,
        dpr * transform.b,
        dpr * transform.c,
        dpr * transform.d,
        dpr * transform.e,
        dpr * transform.f,
      )
    }

    const buildMask = () => {
      maskCtx.setTransform(1, 0, 0, 1, 0, 0)
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
      maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const gx = 1 / W
      const gy = -1 / H
      const scale = 1 / (gx * gx + gy * gy)
      const cx = W * 0.5
      const cy = H * 0.5
      const gradient = maskCtx.createLinearGradient(
        cx - gx * scale,
        cy - gy * scale,
        cx + gx * scale,
        cy + gy * scale,
      )
      gradient.addColorStop(0, 'rgba(255,255,255,0)')
      gradient.addColorStop(0.1, 'rgba(255,255,255,0)')
      gradient.addColorStop(0.16, 'rgba(255,255,255,0.12)')
      gradient.addColorStop(0.24, 'rgba(255,255,255,0.55)')
      gradient.addColorStop(0.325, 'rgba(255,255,255,0.92)')
      gradient.addColorStop(0.42, 'rgba(255,255,255,1)')
      gradient.addColorStop(0.58, 'rgba(255,255,255,1)')
      gradient.addColorStop(0.675, 'rgba(255,255,255,0.92)')
      gradient.addColorStop(0.76, 'rgba(255,255,255,0.55)')
      gradient.addColorStop(0.84, 'rgba(255,255,255,0.12)')
      gradient.addColorStop(0.9, 'rgba(255,255,255,0)')
      gradient.addColorStop(1, 'rgba(255,255,255,0)')
      maskCtx.fillStyle = gradient
      maskCtx.fillRect(0, 0, W, H)
    }

    const applyMask = (
      target: CanvasRenderingContext2D,
      surface: HTMLCanvasElement,
    ) => {
      target.setTransform(1, 0, 0, 1, 0, 0)
      target.globalAlpha = 1
      target.globalCompositeOperation = 'destination-in'
      target.drawImage(maskCanvas, 0, 0, surface.width, surface.height)
      target.globalCompositeOperation = 'source-over'
    }

    const buildStarSprite = () => {
      const C = theme()
      starCanvas.width = Math.max(1, Math.round(STAR_SIZE * dpr))
      starCanvas.height = Math.max(1, Math.round(STAR_SIZE * dpr))
      starCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      starCtx.clearRect(0, 0, STAR_SIZE, STAR_SIZE)
      starCtx.globalCompositeOperation = C.comp

      const center = STAR_SIZE * 0.5
      const bloom = starCtx.createRadialGradient(center, center, 0, center, center, 13)
      bloom.addColorStop(0, styleAt(C.pulse * 0.34))
      bloom.addColorStop(0.32, styleAt(C.pulse * 0.12))
      bloom.addColorStop(1, styleAt(0))
      starCtx.fillStyle = bloom
      starCtx.fillRect(0, 0, STAR_SIZE, STAR_SIZE)

      starCtx.fillStyle = styleAt(C.pulse)
      starCtx.beginPath()
      addStarPath(starCtx, center, center, 10.5, 1.45)
      starCtx.fill()
      starCtx.beginPath()
      starCtx.arc(center, center, 1.65, 0, TAU)
      starCtx.fill()
      starCtx.globalCompositeOperation = 'source-over'
    }

    const buildRestingLayer = () => {
      if (!field) return
      const C = theme()
      const f = field
      baseCtx.setTransform(1, 0, 0, 1, 0, 0)
      baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height)
      setGridTransform(baseCtx, f)
      baseCtx.globalCompositeOperation = C.comp
      baseCtx.lineCap = 'butt'
      baseCtx.lineWidth = 1
      baseCtx.strokeStyle = styleAt(C.line * 0.2)
      baseCtx.beginPath()

      for (let col = 0; col < f.cols; col++) {
        const x = f.x0 + col * f.cell
        baseCtx.moveTo(x, f.y0)
        baseCtx.lineTo(x, f.y0 + (f.rows - 1) * f.cell)
      }
      for (let row = 0; row < f.rows; row++) {
        const y = f.y0 + row * f.cell
        baseCtx.moveTo(f.x0, y)
        baseCtx.lineTo(f.x0 + (f.cols - 1) * f.cell, y)
      }
      baseCtx.stroke()

      baseCtx.fillStyle = styleAt(C.line * 0.55)
      baseCtx.beginPath()
      for (let row = 0; row < f.rows; row++) {
        const y = f.y0 + row * f.cell
        for (let col = 0; col < f.cols; col++) {
          const x = f.x0 + col * f.cell
          addStarPath(baseCtx, x, y, 3.3, 0.68)
        }
      }
      baseCtx.fill()
      applyMask(baseCtx, baseCanvas)
    }

    const rebuildCaches = () => {
      buildMask()
      buildStarSprite()
      buildRestingLayer()
    }

    const eventAge = (event: Ignition, time: number) => {
      const age = time - event.start
      return age < 0 ? age + LOOP_MS : age
    }

    const eventLevel = (event: Ignition, age: number) => {
      if (age >= event.duration) return 0
      const attack = smoothstep(age / 900)
      const decay =
        age <= event.decayStart
          ? 1
          : 1 - smoothstep((age - event.decayStart) / (event.duration - event.decayStart))
      return attack * decay * (0.94 + 0.06 * Math.sin(age * 0.00055 + event.phase))
    }

    const frontDistance = (event: Ignition, age: number) => {
      const span = event.travel * event.reach * 2.6
      const p = Math.min(1, age / span)
      return event.reach * (1 - Math.pow(1 - p, 3))
    }

    const paintRay = (
      x: number,
      y: number,
      dx: number,
      dy: number,
      distance: number,
      level: number,
    ) => {
      if (!field || distance <= 0.002 || level <= 0.002) return
      const C = theme()
      const endX = x + dx * distance * field.cell
      const endY = y + dy * distance * field.cell

      liveCtx.lineCap = 'butt'
      liveCtx.strokeStyle = styleAt(C.pulse * level * 0.13)
      liveCtx.lineWidth = 3.2
      liveCtx.beginPath()
      liveCtx.moveTo(x, y)
      liveCtx.lineTo(endX, endY)
      liveCtx.stroke()

      liveCtx.strokeStyle = styleAt(C.pulse * level * 0.54)
      liveCtx.lineWidth = 0.95
      liveCtx.beginPath()
      liveCtx.moveTo(x, y)
      liveCtx.lineTo(endX, endY)
      liveCtx.stroke()

      liveCtx.fillStyle = styleAt(C.pulse * level * 0.72)
      liveCtx.beginPath()
      liveCtx.arc(endX, endY, 1.1, 0, TAU)
      liveCtx.fill()
    }

    const paintIgnition = (event: Ignition, time: number) => {
      if (!field) return
      const age = eventAge(event, time)
      const level = eventLevel(event, age)
      if (level <= 0.002) return

      const f = field
      const x = f.x0 + event.col * f.cell
      const y = f.y0 + event.row * f.cell
      const front = frontDistance(event, age)
      const left = Math.min(front, event.col)
      const right = Math.min(front, f.cols - 1 - event.col)
      const up = Math.min(front, event.row)
      const down = Math.min(front, f.rows - 1 - event.row)

      paintRay(x, y, -1, 0, left, level)
      paintRay(x, y, 1, 0, right, level)
      paintRay(x, y, 0, -1, up, level)
      paintRay(x, y, 0, 1, down, level)

      const starAlpha = clamp(level * (0.82 + 0.18 * smoothstep(age / 1800)), 0, 1)
      liveCtx.globalAlpha = starAlpha
      liveCtx.drawImage(
        starCanvas,
        x - STAR_SIZE * 0.5,
        y - STAR_SIZE * 0.5,
        STAR_SIZE,
        STAR_SIZE,
      )
      liveCtx.globalAlpha = 1
    }

    const drawScene = (time: number) => {
      if (!field) return
      const C = theme()

      liveCtx.setTransform(1, 0, 0, 1, 0, 0)
      liveCtx.globalCompositeOperation = 'source-over'
      liveCtx.globalAlpha = 1
      liveCtx.clearRect(0, 0, liveCanvas.width, liveCanvas.height)
      setGridTransform(liveCtx, field)
      liveCtx.globalCompositeOperation = C.comp

      for (let i = 0; i < field.events.length; i++) {
        paintIgnition(field.events[i], time)
      }
      applyMask(liveCtx, liveCanvas)

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.fillStyle = C.ground
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(baseCanvas, 0, 0)
      ctx.globalCompositeOperation = C.comp
      ctx.drawImage(liveCanvas, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
    }

    const drawIdle = () => drawScene(reduce ? STATIC_TIME_MS : elapsed)

    const rebuild = () => {
      W = Math.max(1, Math.round(host.clientWidth))
      H = Math.max(1, Math.round(host.clientHeight))
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      sizeSurface(canvas, W, H)
      sizeSurface(baseCanvas, W, H)
      sizeSurface(liveCanvas, W, H)
      sizeSurface(maskCanvas, W, H)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      field = buildField(W, H, seed)
      rebuildCaches()
      drawIdle()
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      elapsed = (elapsed + Math.min(33, last ? now - last : 16)) % LOOP_MS
      last = now
      drawScene(elapsed)
    }

    const start = () => {
      if (running || reduce || !onScreen || document.hidden) return
      running = true
      last = 0
      raf = requestAnimationFrame(frame)
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    rebuild()

    let debounce = 0
    const ro = new ResizeObserver(() => {
      window.clearTimeout(debounce)
      debounce = window.setTimeout(() => {
        if (
          host.clientWidth === W &&
          host.clientHeight === H &&
          dpr === Math.min(window.devicePixelRatio || 1, 2)
        ) {
          return
        }
        rebuild()
      }, 120)
    })
    ro.observe(host)

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0].isIntersecting
        if (onScreen) start()
        else stop()
      },
      { threshold: 0.01 },
    )
    io.observe(host)

    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }
    document.addEventListener('visibilitychange', onVisibility)

    const onMotion = () => {
      reduce = motionMq.matches
      stop()
      drawIdle()
      start()
    }
    motionMq.addEventListener('change', onMotion)

    const mo = new MutationObserver(() => {
      const next = isDark()
      if (next === dark) return
      dark = next
      rebuildCaches()
      if (!running) drawIdle()
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = host.closest('[data-card-theme]')
    if (cardWrapper) {
      mo.observe(cardWrapper, {
        attributes: true,
        attributeFilter: ['class', 'data-card-theme'],
      })
    }

    return () => {
      stop()
      window.clearTimeout(debounce)
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      motionMq.removeEventListener('change', onMotion)
      baseCanvas.width = 0
      baseCanvas.height = 0
      liveCanvas.width = 0
      liveCanvas.height = 0
      maskCanvas.width = 0
      maskCanvas.height = 0
      starCanvas.width = 0
      starCanvas.height = 0
      field = null
    }
  }, [seed])

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label="A faint diagonal diamond grid slowly illuminated by travelling light"
      className={`relative min-h-screen w-full overflow-hidden bg-[#FAF8F5] dark:bg-[#000000]${className ? ` ${className}` : ''}`}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block" />
    </div>
  )
}
