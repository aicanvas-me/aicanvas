'use client'

// Stippled light falling from above the top bar onto the hero. The dots are
// generated once, in idle time, then sprinkled in over ~2 s and left alone: no
// loop runs after the intro (variant b adds a compositor-only opacity breath).
// Two variants under test: ?light=a (default), ?light=b, ?light=off.

import { useEffect, useRef } from 'react'

type Variant = 'a' | 'b'

const HEIGHT = 460 // CSS px of the window's top the light covers
const NAV = 56 // the top bar: dots there are thinned so the bar stays readable
const STEP = 1.5 // CSS px per sampling cell, one dot at most per cell
const FRAMES = 90 // reveal buckets
const LEVELS = [0.35, 0.6, 0.95]

type Ray = { a: number; w: number; k: number }
type Field = (x: number, y: number) => void

// Written by the field for each sample: brightness 0..1 and reveal time 0..1.
const out = { i: 0, t: 0 }

function smooth(e0: number, e1: number, v: number) {
  const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

function edges(y: number) {
  const nav = y < NAV ? 0.4 : y < NAV + 40 ? 0.4 + 0.6 * ((y - NAV) / 40) : 1
  return nav * (1 - smooth(HEIGHT * 0.5, HEIGHT * 0.95, y))
}

// Three angled rays from a source above the top right, lit one after another.
function fieldA(W: number): Field {
  const sx = W * 0.72
  const sy = -HEIGHT * 0.45
  const rays: Ray[] = [
    { a: 0.12, w: 0.045, k: 1 },
    { a: 0.45, w: 0.085, k: 0.75 },
    { a: 0.85, w: 0.055, k: 0.6 },
  ]
  return (x, y) => {
    const dx = sx - x
    const dy = y - sy
    const phi = Math.atan2(dx, dy)
    const d = Math.sqrt(dx * dx + dy * dy)
    const fall = Math.exp(-Math.max(0, d + sy) / (HEIGHT * 0.75))
    const streak = 0.75 + 0.25 * Math.sin(phi * 120 + 2) * Math.sin(phi * 37 + 0.7)
    let best = -1
    let bestV = 0
    let sum = 0
    for (let r = 0; r < rays.length; r++) {
      const u = (phi - rays[r].a) / rays[r].w
      const v = rays[r].k * Math.exp(-u * u)
      sum += v
      if (v > bestV) {
        bestV = v
        best = r
      }
    }
    const gx = (x - sx) / (W * 0.28)
    const gy = y / (HEIGHT * 0.5)
    const glow = 0.9 * Math.exp(-(gx * gx + gy * gy))
    out.i = Math.min(1, (sum * streak * fall + glow) * edges(y))
    out.t =
      bestV > glow
        ? 0.08 + best * 0.22 + (y / HEIGHT) * 0.45 + Math.random() * 0.12
        : (y / HEIGHT) * 0.25 + Math.random() * 0.18
  }
}

// A dawn halo from high above the centre with two near-vertical beams; it
// descends like a curtain, then breathes.
function fieldB(W: number): Field {
  const sx = W * 0.5
  const sy = -HEIGHT * 0.9
  const rays: Ray[] = [
    { a: -0.16, w: 0.07, k: 0.7 },
    { a: 0.11, w: 0.05, k: 0.85 },
  ]
  return (x, y) => {
    const dx = sx - x
    const dy = y - sy
    const phi = Math.atan2(dx, dy)
    const d = Math.sqrt(dx * dx + dy * dy)
    const fall = Math.exp(-Math.max(0, d + sy) / (HEIGHT * 0.6))
    const streak = 0.8 + 0.2 * Math.sin(phi * 150 + 1.3) * Math.sin(phi * 41)
    const cone = 0.45 * Math.exp(-((phi / 0.32) ** 2))
    let sum = cone
    for (const r of rays) {
      const u = (phi - r.a) / r.w
      sum += r.k * Math.exp(-u * u)
    }
    const gx = (x - sx) / (W * 0.4)
    const gy = y / (HEIGHT * 0.45)
    const glow = 0.6 * Math.exp(-(gx * gx + gy * gy))
    out.i = Math.min(1, (sum * streak * fall + glow) * edges(y))
    out.t = (y / HEIGHT) * 0.75 + Math.random() * 0.25
  }
}

type Dots = { x: Uint16Array; y: Uint16Array; l: Uint8Array; order: Uint32Array; starts: Uint32Array }

function build(W: number, dpr: number, v: Variant): Dots {
  const field = v === 'a' ? fieldA(W) : fieldB(W)
  const dmax = v === 'a' ? 0.8 : 0.7
  const cols = Math.ceil(W / STEP)
  const rows = Math.ceil((HEIGHT * 0.95) / STEP)
  const xs: number[] = []
  const ys: number[] = []
  const ls: number[] = []
  const bs: number[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c + Math.random()) * STEP
      const y = (r + Math.random()) * STEP
      field(x, y)
      if (out.i <= 0.01 || Math.random() >= dmax * out.i ** 1.4) continue
      const roll = Math.random()
      xs.push(Math.round(x * dpr))
      ys.push(Math.round(y * dpr))
      ls.push(roll < 0.35 ? 0 : roll < 0.7 ? 1 : 2)
      bs.push(Math.min(FRAMES - 1, Math.floor(Math.min(1, out.t) * FRAMES)))
    }
  }
  // Counting sort by reveal bucket, so each frame draws one contiguous run.
  const starts = new Uint32Array(FRAMES + 1)
  for (const b of bs) starts[b + 1]++
  for (let b = 0; b < FRAMES; b++) starts[b + 1] += starts[b]
  const fill = starts.slice(0, FRAMES)
  const order = new Uint32Array(bs.length)
  for (let n = 0; n < bs.length; n++) order[fill[bs[n]]++] = n
  return { x: Uint16Array.from(xs), y: Uint16Array.from(ys), l: Uint8Array.from(ls), order, starts }
}

function draw(ctx: CanvasRenderingContext2D, d: Dots, from: number, to: number) {
  for (let lvl = 0; lvl < LEVELS.length; lvl++) {
    ctx.globalAlpha = LEVELS[lvl]
    ctx.beginPath()
    for (let k = d.starts[from]; k < d.starts[to]; k++) {
      const n = d.order[k]
      if (d.l[n] === lvl) ctx.rect(d.x[n], d.y[n], 1, 1)
    }
    ctx.fill()
  }
}

export function HeroLight() {
  const outer = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('light')
    if (param === 'off') return
    const variant: Variant = param === 'b' ? 'b' : 'a'
    const box = outer.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!box || !canvas || !ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let scrollRaf = 0
    let resizeTimer = 0
    let width = 0
    let breath: Animation | null = null

    const paint = (animate: boolean) => {
      cancelAnimationFrame(raf)
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      width = window.innerWidth
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(HEIGHT * dpr)
      ctx.fillStyle = '#F4F4FA'
      const dots = build(width, dpr, variant)
      if (!animate) {
        draw(ctx, dots, 0, FRAMES)
        return
      }
      const duration = variant === 'a' ? 2000 : 2400
      const start = performance.now()
      let drawn = 0
      const tick = (now: number) => {
        const e = Math.min(1, (now - start) / duration)
        const upto = e >= 1 ? FRAMES : Math.floor((1 - (1 - e) * (1 - e)) * FRAMES)
        if (upto > drawn) {
          draw(ctx, dots, drawn, upto)
          drawn = upto
        }
        if (e < 1) raf = requestAnimationFrame(tick)
        else if (variant === 'b')
          breath = canvas.animate([{ opacity: 1 }, { opacity: 0.72 }], {
            duration: 6000,
            direction: 'alternate',
            iterations: Infinity,
            easing: 'ease-in-out',
          })
      }
      raf = requestAnimationFrame(tick)
    }

    // Fixed above the top bar, so it follows the page's own scroller by hand.
    const scroller = box.closest<HTMLElement>('[data-owns-scroll]')
    const follow = () => {
      scrollRaf = 0
      const y = scroller?.scrollTop ?? 0
      box.style.transform = `translate3d(0, ${-y}px, 0)`
      const hidden = y > HEIGHT
      box.style.visibility = hidden ? 'hidden' : ''
      if (hidden) breath?.pause()
      else if (breath?.playState === 'paused') breath.play()
    }
    const onScroll = () => {
      if (!scrollRaf) scrollRaf = requestAnimationFrame(follow)
    }
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        if (window.innerWidth !== width) paint(false)
      }, 150)
    }

    follow()
    scroller?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => paint(!reduce), { timeout: 600 })
      : window.setTimeout(() => paint(!reduce), 60)

    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      else clearTimeout(idle)
      cancelAnimationFrame(raf)
      cancelAnimationFrame(scrollRaf)
      clearTimeout(resizeTimer)
      breath?.cancel()
      scroller?.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div
      ref={outer}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-20 will-change-transform"
      style={{ height: HEIGHT }}
    >
      {/* Light dots on dark; on light the same dots turn to ink at half strength. */}
      <div className="h-full opacity-50 invert dark:opacity-100 dark:invert-0">
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </div>
  )
}
