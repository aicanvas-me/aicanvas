'use client'

import { useLayoutEffect, useEffect, useRef, useState } from 'react'
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect


const SPACING = 20
const RADIUS_FRAC = 0.30
const LENS_FRAC = 0.06
const BASE_A = 0.13
const PEAK_A = 0.95
const LINE_A_DARK = 0.07
const LINE_A_LIGHT = 0.12
const MOUSE_LERP = 0.14
type Dot = { x: number; y: number; b: number; l: number; px: number; py: number }
type Segment = { a: Dot; b: Dot }

export default function GridLines() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef<{ x: number; y: number } | null>(null)
  const isDarkRef = useRef(typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false)
  const [isDark, setIsDark] = useState(() => typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false)

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const check = () => {
      const card = el.closest('[data-card-theme]')
      const dark = card
        ? card.classList.contains('dark')
        : document.documentElement.classList.contains('dark')
      setIsDark(dark)
      isDarkRef.current = dark
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = el.closest('[data-card-theme]')
    if (cardWrapper) observer.observe(cardWrapper, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas: HTMLCanvasElement = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    let dots: Dot[] = []
    let hSegs: Segment[] = []
    let vSegs: Segment[] = []
    let animId = 0
    let alive = true
    let cw = 0, ch = 0

    let smoothMx = -99999
    let smoothMy = -99999

    function build() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      cw = rect.width
      ch = rect.height
      if (!cw || !ch) return
      canvas.width = Math.round(cw * dpr)
      canvas.height = Math.round(ch * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const cols = Math.floor(cw / SPACING) + 2
      const rows = Math.floor(ch / SPACING) + 2
      const ox = (cw % SPACING) / 2
      const oy = (ch % SPACING) / 2

      const prev = new Map<string, Dot>()
      for (const d of dots) {
        prev.set(`${d.x.toFixed(0)},${d.y.toFixed(0)}`, d)
      }

      const grid: Dot[][] = []
      dots = []
      for (let r = 0; r < rows; r++) {
        grid[r] = []
        for (let c = 0; c < cols; c++) {
          const x = ox + c * SPACING
          const y = oy + r * SPACING
          const key = `${x.toFixed(0)},${y.toFixed(0)}`
          const d: Dot = prev.get(key) ?? { x, y, b: 0, l: 0, px: x, py: y }

          dots.push(d)
          grid[r][c] = d
        }
      }

      hSegs = []
      vSegs = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (c + 1 < cols) hSegs.push({ a: grid[r][c], b: grid[r][c + 1] })
          if (r + 1 < rows) vSegs.push({ a: grid[r][c], b: grid[r + 1][c] })
        }
      }
    }

    function frame() {
      if (!alive) return
      ctx.clearRect(0, 0, cw, ch)

      const raw = mouseRef.current
      if (raw) {
        if (smoothMx === -99999) { smoothMx = raw.x; smoothMy = raw.y }
        smoothMx += (raw.x - smoothMx) * MOUSE_LERP
        smoothMy += (raw.y - smoothMy) * MOUSE_LERP
      } else {
        smoothMx = -99999
        smoothMy = -99999
      }

      const mx = smoothMx
      const my = smoothMy
      const R = RADIUS_FRAC * Math.max(cw, ch)
      const r2 = R * R
      const lensPush = LENS_FRAC * R
      const dotRGB = isDarkRef.current ? '255,255,255' : '28,25,22'
      const baseA = isDarkRef.current ? BASE_A : 0.22
      const lineRestA = isDarkRef.current ? LINE_A_DARK : LINE_A_LIGHT

      for (const d of dots) {
        const dx = d.x - mx
        const dy = d.y - my
        const dist2 = dx * dx + dy * dy
        const dist = Math.sqrt(dist2)

        const tgtB = dist2 < r2 ? Math.exp(-dist2 / (r2 * 0.45)) : 0
        d.b += (tgtB > d.b ? 0.16 : 0.07) * (tgtB - d.b)
        if (d.b < 0.004) d.b = 0

        const tgtL = dist < R ? Math.sin(Math.PI * (dist / R)) : 0
        d.l += (tgtL > d.l ? 0.18 : 0.08) * (tgtL - d.l)
        if (d.l < 0.004) d.l = 0

        if (dist > 0.5 && d.l > 0.004) {
          const push = lensPush * d.l
          const ux = dx / dist
          const uy = dy / dist
          d.px = d.x + ux * push
          d.py = d.y + uy * push
        } else {
          d.px = d.x
          d.py = d.y
        }
      }

      const allSegs = [...hSegs, ...vSegs]
      for (const seg of allSegs) {
        const segB = (seg.a.b + seg.b.b) / 2
        const lineA = lineRestA + (PEAK_A - lineRestA) * segB
        ctx.strokeStyle = `rgba(${dotRGB},${lineA.toFixed(3)})`
        ctx.lineWidth = 0.5 + segB * 0.6
        ctx.beginPath()
        ctx.moveTo(seg.a.px, seg.a.py)
        ctx.lineTo(seg.b.px, seg.b.py)
        ctx.stroke()
      }

      for (const d of dots) {
        const alpha = baseA + (PEAK_A - baseA) * d.b
        const sz = 1 + d.b * 2.2
        ctx.fillStyle = `rgba(${dotRGB},${alpha.toFixed(2)})`
        ctx.fillRect(d.px - sz / 2, d.py - sz / 2, sz, sz)
      }

      animId = requestAnimationFrame(frame)
    }

    build()
    frame()

    const ro = new ResizeObserver(build)
    ro.observe(canvas.parentElement!)

    return () => {
      alive = false
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  function updateMouse(clientX: number, clientY: number) {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseRef.current = { x: clientX - rect.left, y: clientY - rect.top }
  }

  const bg = isDark ? '#110F0C' : '#F5F1EA'
  const labelColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(28,25,22,0.45)'
  const hintColor = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(28,25,22,0.22)'

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: bg }}
      onMouseMove={(e) => updateMouse(e.clientX, e.clientY)}
      onMouseLeave={() => { mouseRef.current = null }}
      onTouchMove={(e) => { const t = e.touches[0]; if (t) updateMouse(t.clientX, t.clientY) }}
      onTouchEnd={() => { mouseRef.current = null }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
        <span style={{ color: labelColor, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Grid Lines
        </span>
        <span style={{ color: hintColor, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          hover to illuminate
        </span>
      </div>
    </div>
  )
}
