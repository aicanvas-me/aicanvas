'use client'

import { useEffect, useRef } from 'react'

// ─── AsciiArt ────────────────────────────────────────────────────────────────
// The art panel of the sign-in card and of the unlock wall: a shape drawn as a
// field of monospace glyphs, one glyph per cell of a grid, on a canvas.
//
// Each subject is a few regions, and each region has its own glyph set, so the
// shape reads by texture the way the real mark reads by tone: the AI Canvas
// mark's ring is dense type shaded along the logo's own gradient, its upper
// facet is hatched, its lower facet is dots. Code fragments stream into the
// shape from the left, the canvas being built.
//
// Motion: the shape decodes in on mount (a diagonal sweep of scrambled glyphs
// settling), then a few cells flicker at a time, a light band passes over it
// every few seconds, and glyphs under the pointer scramble. Reduced motion gets
// the settled frame and nothing else. The loop pauses off screen and in a
// hidden tab.
//
// The ink is the canvas element's own CSS `color`, read on every frame, so the
// art follows the site theme (and a pinned-dark route) without a prop.
// Canvas, not a <pre>: the glyph sets mix shapes a monospace font does not
// carry at one width, and a canvas puts each one at the centre of its cell
// whatever its advance.

export type AsciiSubject = 'mark' | 'lock'

type Region = {
  path: Path2D
  rule: CanvasFillRule
  // Empty: the region is a hole (the keyhole), drawn as nothing.
  ramp: string
  scramble: string
  // 0..1 across the region, picks the glyph from the ramp and dims the ink.
  shade: (bx: number, by: number) => number
  alpha: number
}

type Cell = {
  x: number
  y: number
  ramp: string
  scramble: string
  glyph: string
  alpha: number
  // Normalised position across the subject, for the intro sweep and the band.
  d: number
  reveal: number
  noiseUntil: number
  noise: string
}

// A row of code fragments beside the shape: `edge` is the column next to it,
// and the stream runs `length` columns away from there, to the left (-1) or
// the right (1).
type Streak = { row: number; edge: number; side: -1 | 1; length: number; pattern: string; speed: number }

// public/ai-canvas-icon.svg, its viewBox and its three regions.
const MARK_BOX = [36.64, 62.29, 340, 291.43] as const
const MARK_RING =
  'M279.051 62.2856C287.689 62.2856 295.676 66.8735 300.029 74.3345L314.25 98.7142L363.724 183.526C372.546 198.65 372.546 217.35 363.724 232.474L314.25 317.286L300.029 341.665C295.676 349.126 287.689 353.714 279.051 353.714H136.949C128.311 353.714 120.324 349.126 115.972 341.665L45.1382 220.237C40.7272 212.675 40.7272 203.325 45.1382 195.763L115.972 74.3345C120.324 66.8735 128.311 62.2856 136.949 62.2856H279.051ZM86.5714 208L147.286 317.286H259.607L195.857 208L259.607 98.7142H147.286L86.5714 208Z'
const MARK_TOP = 'M195.857 208H86.5715L147.286 98.7144H259.607L195.857 208Z'
const MARK_BOTTOM = 'M147.286 317.286L86.5715 208H195.857L259.607 317.286H147.286Z'
// The logo's own gradient runs from here to there across the ring.
const MARK_GRADIENT = [147.286, 98.714, 340.061, 268.714] as const

// An open padlock in a 100 x 100 box: the shackle lifted, its right leg out of
// the body, because the wall it stands on is the way in.
const LOCK_BOX = [0, 0, 100, 100] as const

// Densest first. No @: it reads as a blob at this size.
const DENSE = '#*+=-'
const NOISE = '#%&*+=<>/\\|-:'
const TOKENS = ['</>', '{ }', '//', '<div>', '=>', '[ ]', '( )', '::', '/>']

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

function rampGlyph(ramp: string, t: number) {
  return ramp[Math.min(ramp.length - 1, Math.floor(clamp01(t) * ramp.length))]
}

function markRegions(m: DOMMatrix): Region[] {
  const [gx1, gy1, gx2, gy2] = MARK_GRADIENT
  const gdx = gx2 - gx1
  const gdy = gy2 - gy1
  const glen = gdx * gdx + gdy * gdy
  const along = (bx: number, by: number) => ((bx - gx1) * gdx + (by - gy1) * gdy) / glen
  const at = (d: string) => {
    const p = new Path2D()
    p.addPath(new Path2D(d), m)
    return p
  }
  return [
    { path: at(MARK_RING), rule: 'evenodd', ramp: DENSE, scramble: NOISE, shade: along, alpha: 1 },
    // The facets sit darker than the ring, as in the logo, so the chevron
    // reads as a cut into the hexagon.
    { path: at(MARK_TOP), rule: 'nonzero', ramp: '/', scramble: '/\\|-', shade: () => 0, alpha: 0.45 },
    { path: at(MARK_BOTTOM), rule: 'nonzero', ramp: ':', scramble: ':·.', shade: () => 0, alpha: 0.28 },
  ]
}

function lockRegions(m: DOMMatrix): Region[] {
  const keyhole = new Path2D()
  keyhole.arc(50, 63, 7, 0, Math.PI * 2)
  keyhole.rect(46.5, 64, 7, 15)
  const body = new Path2D()
  body.roundRect(16, 46, 68, 48, 9)
  // The shackle, raised 10 units: the left leg still enters the body, the
  // right one stops short of it.
  const shackle = new Path2D()
  shackle.moveTo(26, 50)
  shackle.lineTo(26, 30)
  shackle.arc(50, 30, 24, Math.PI, 0)
  shackle.lineTo(74, 38)
  shackle.lineTo(65, 38)
  shackle.lineTo(65, 30)
  shackle.arc(50, 30, 15, 0, Math.PI, true)
  shackle.lineTo(35, 50)
  shackle.closePath()
  const at = (p: Path2D) => {
    const q = new Path2D()
    q.addPath(p, m)
    return q
  }
  return [
    // First match wins, so the hole is tested before the body around it.
    { path: at(keyhole), rule: 'nonzero', ramp: '', scramble: '', shade: () => 0, alpha: 0 },
    { path: at(body), rule: 'nonzero', ramp: DENSE, scramble: NOISE, shade: (bx, by) => (bx - 16 + (by - 46) * 0.8) / 106, alpha: 1 },
    { path: at(shackle), rule: 'nonzero', ramp: '#*+', scramble: '/\\|-=', shade: (_bx, by) => by / 50, alpha: 0.7 },
  ]
}

export function AsciiArt({ subject = 'mark', className = '' }: { subject?: AsciiSubject; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    // No canvas in a test DOM; the panel is decoration, so it simply stays empty.
    if (!canvas || !ctx || typeof ResizeObserver === 'undefined') return

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    let cells: Cell[] = []
    let streaks: Streak[] = []
    let cell = 9
    let width = 0
    let height = 0
    const start = performance.now()
    let raf = 0
    let last = 0
    let onScreen = true
    let padX = 0

    function layout() {
      const rect = canvas!.getBoundingClientRect()
      width = rect.width
      height = rect.height
      if (!width || !height) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)

      // Big enough that each glyph reads as a glyph, not as grey noise.
      cell = Math.max(9, Math.min(13, Math.round(Math.min(width, height) / 34)))
      const [bx, by, bw, bh] = subject === 'mark' ? MARK_BOX : LOCK_BOX
      // Centred, with room on both sides for the streams.
      const scale = Math.min((width * 0.66) / bw, (height * 0.66) / bh)
      const ox = (width - bw * scale) / 2
      const oy = (height - bh * scale) / 2
      const m = new DOMMatrix().translate(ox, oy).scale(scale).translate(-bx, -by)
      const regions = subject === 'mark' ? markRegions(m) : lockRegions(m)

      // isPointInPath tests the path under the current transform against a
      // point in raw canvas pixels; with the identity both are CSS pixels.
      ctx!.setTransform(1, 0, 0, 1, 0, 0)
      const cols = Math.floor(width / cell)
      const rows = Math.floor(height / cell)
      padX = (width - cols * cell) / 2
      const padY = (height - rows * cell) / 2
      // The first and last column the shape covers on each row.
      const span = new Map<number, [number, number]>()
      cells = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = padX + c * cell + cell / 2
          const y = padY + r * cell + cell / 2
          const region = regions.find((g) => ctx!.isPointInPath(g.path, x, y, g.rule))
          if (!region || !region.ramp) continue
          span.set(r, [span.get(r)?.[0] ?? c, c])
          const t = region.shade((x - ox) / scale + bx, (y - oy) / scale + by)
          const d = clamp01(((x - ox) / (bw * scale)) * 0.62 + ((y - oy) / (bh * scale)) * 0.38)
          cells.push({
            x,
            y,
            ramp: region.ramp,
            scramble: region.scramble,
            glyph: rampGlyph(region.ramp, t),
            alpha: region.alpha * (1 - 0.32 * clamp01(t)),
            d,
            reveal: d * 900 + Math.random() * 160,
            noiseUntil: 0,
            noise: '',
          })
        }
      }

      // Streams on rows that carry the shape, on both sides, each one empty
      // cell clear of it. Many run into the shape from the left and two run
      // out on the right: one flow passing through, the code built in.
      const shapeRows = [...span.keys()]
      streaks = []
      const incoming = Math.min(6, Math.max(4, Math.round(shapeRows.length / 5)))
      const rowsFor = { [-1]: [...Array(incoming).keys()].map((i) => (i + 0.5) / incoming), [1]: [0.36, 0.7] }
      for (const side of [-1, 1] as const) {
        for (const [i, at] of rowsFor[side].entries()) {
          const r = shapeRows[Math.min(shapeRows.length - 1, Math.floor(at * shapeRows.length))]
          const [first, lastCol] = span.get(r)!
          const edge = side === -1 ? first - 2 : lastCol + 2
          const room = side === -1 ? edge + 1 : cols - edge
          if (room < 4) continue
          const length = Math.max(4, Math.min(room, Math.round(room * (0.35 + Math.random() * 0.55))))
          const token = TOKENS[(i * 5 + r + (side === 1 ? 3 : 0)) % TOKENS.length]
          streaks.push({
            row: padY + r * cell + cell / 2,
            edge,
            side,
            length,
            pattern: `${token}${'·'.repeat(2 + (i % 3))}`,
            speed: 0.6 + (i % 3) * 0.35,
          })
        }
      }
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw(now: number) {
      const elapsed = now - start
      ctx!.clearRect(0, 0, width, height)
      const ink = getComputedStyle(canvas!).color
      const family = getComputedStyle(canvas!).fontFamily
      ctx!.fillStyle = ink
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'
      // Regular weight: a light hand, the glyphs read as type, not as blocks.
      ctx!.font = `400 ${Math.round(cell * 1.1)}px ${family}`

      // The band: a diagonal light that crosses the shape every 6s.
      const band = reduceMotion ? -1 : ((elapsed % 6000) / 6000) * 1.6 - 0.3

      for (const k of cells) {
        let glyph = k.glyph
        let alpha = k.alpha
        if (!reduceMotion) {
          const since = elapsed - k.reveal
          if (since < 0) continue
          if (since < 180) {
            glyph = k.scramble[Math.floor(Math.random() * k.scramble.length)]
            alpha *= since / 180
          } else if (now < k.noiseUntil) {
            glyph = k.noise
          }
          const lift = 1 - Math.abs(k.d - band) / 0.09
          if (lift > 0) alpha = Math.min(1, alpha + lift * 0.45)
        }
        ctx!.globalAlpha = alpha
        ctx!.fillText(glyph, k.x, k.y)
      }

      // Streams: every pattern moves left to right (into the shape on the
      // left, out of it on the right), indexed by absolute column so a token
      // reads forwards on both sides, and fades with distance from the shape.
      const n = (a: number, b: number) => ((a % b) + b) % b
      for (const s of streaks) {
        const shift = reduceMotion ? 0 : Math.floor((elapsed / 1000) * s.speed * 6)
        for (let i = 0; i < s.length; i++) {
          const col = s.edge + s.side * i
          const ch = s.pattern[n(col - shift, s.pattern.length)]
          if (ch === ' ') continue
          ctx!.globalAlpha = 0.5 * (1 - i / s.length)
          ctx!.fillText(ch, padX + col * cell + cell / 2, s.row)
        }
      }
      ctx!.globalAlpha = 1
    }

    function tick(now: number) {
      raf = requestAnimationFrame(tick)
      if (!onScreen || document.hidden) return
      // ~24 fps: glyph flicker reads better stepped than smooth, and it halves
      // the work.
      if (now - last < 40) return
      last = now
      // A few cells flicker at a time once the shape has settled.
      if (now - start > 1200) {
        const n = Math.max(1, Math.round(cells.length * 0.01))
        for (let i = 0; i < n; i++) {
          const k = cells[Math.floor(Math.random() * cells.length)]
          if (!k || !k.scramble) continue
          k.noise = k.scramble[Math.floor(Math.random() * k.scramble.length)]
          k.noiseUntil = now + 120 + Math.random() * 200
        }
      }
      draw(now)
    }

    layout()
    if (reduceMotion) draw(performance.now())
    else raf = requestAnimationFrame(tick)

    const ro = new ResizeObserver(() => {
      layout()
      if (reduceMotion) draw(performance.now())
    })
    ro.observe(canvas)

    // A still frame has no loop to pick up a theme flip, so it redraws on one.
    const mo = reduceMotion ? new MutationObserver(() => draw(performance.now())) : null
    mo?.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const io =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting
          })
    io?.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo?.disconnect()
      io?.disconnect()
    }
  }, [subject])

  return <canvas ref={canvasRef} aria-hidden className={`absolute inset-0 h-full w-full font-mono ${className}`} />
}
