'use client'

import { useLayoutEffect, useEffect, useRef, useState } from 'react'
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect



const SPACING = 20
const RADIUS  = 340
const BASE_A  = 0.13
const PEAK_A  = 0.92

export default function XGrid() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const mouseRef     = useRef<{ x: number; y: number } | null>(null)
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

    type Mark = { x: number; y: number; b: number; col: number; row: number }
    let marks: Mark[] = []
    let grid: Mark[][] = []
    let animId = 0
    let alive  = true
    let cw = 0, ch = 0
    const t0 = performance.now()

    function build() {
      const dpr  = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      cw = rect.width
      ch = rect.height
      if (!cw || !ch) return
      canvas.width  = Math.round(cw * dpr)
      canvas.height = Math.round(ch * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      marks = []
      grid  = []
      const cols = Math.floor(cw / SPACING) + 2
      const rows = Math.floor(ch / SPACING) + 2
      const ox   = (cw % SPACING) / 2
      const oy   = (ch % SPACING) / 2
      for (let r = 0; r < rows; r++) {
        grid[r] = []
        for (let c = 0; c < cols; c++) {
          const m: Mark = { x: ox + c * SPACING, y: oy + r * SPACING, b: 0, col: c, row: r }
          marks.push(m)
          grid[r][c] = m
        }
      }
    }

    function frame() {
      if (!alive) return
      ctx.clearRect(0, 0, cw, ch)

      ctx.lineWidth = 0.5

      const mx      = mouseRef.current?.x ?? -99999
      const my      = mouseRef.current?.y ?? -99999
      const r2      = RADIUS * RADIUS
      const dotRGB  = isDarkRef.current ? '255,255,255' : '28,25,22'
      const t       = (performance.now() - t0) / 1000

      for (const d of marks) {
        const dx    = d.x - mx
        const dy    = d.y - my
        const dist2 = dx * dx + dy * dy
        const tgt   = dist2 < r2 ? Math.pow(1 - Math.sqrt(dist2) / RADIUS, 1.5) : 0

        d.b += (tgt > d.b ? 0.16 : 0.05) * (tgt - d.b)
        if (d.b < 0.004) d.b = 0

        const arm   = 2 + d.b * 1.0
        const sw    = 0.5 + d.b * 0.3
        const baseA = isDarkRef.current ? BASE_A : 0.25
        const wave  = Math.sin(d.col * 0.3 + d.row * 0.3 - t * 0.5)
        const restingAlpha = baseA * (1 + wave * 0.3)
        const alpha = restingAlpha + (PEAK_A - restingAlpha) * d.b
        ctx.strokeStyle = `rgba(${dotRGB},${alpha.toFixed(2)})`
        ctx.lineWidth = sw

        ctx.beginPath()
        ctx.moveTo(d.x - arm, d.y - arm)
        ctx.lineTo(d.x + arm, d.y + arm)
        ctx.moveTo(d.x + arm, d.y - arm)
        ctx.lineTo(d.x - arm, d.y + arm)
        ctx.stroke()
      }

      ctx.lineWidth = 0.5
      for (const d of marks) {
        if (d.b < 0.05) continue
        const neighbours = [
          grid[d.row]?.[d.col + 1],
          grid[d.row + 1]?.[d.col],
          grid[d.row + 1]?.[d.col + 1],
          grid[d.row + 1]?.[d.col - 1],
        ]
        for (const n of neighbours) {
          if (!n || n.b < 0.05) continue
          const lineAlpha = Math.min(d.b, n.b) * 0.4
          ctx.strokeStyle = `rgba(${dotRGB},${lineAlpha.toFixed(2)})`
          ctx.beginPath()
          ctx.moveTo(d.x, d.y)
          ctx.lineTo(n.x, n.y)
          ctx.stroke()
        }
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

  const bg         = isDark ? '#110F0C' : '#F5F1EA'
  const labelColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(28,25,22,0.45)'
  const hintColor  = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(28,25,22,0.22)'

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
          X Grid
        </span>
        <span style={{ color: hintColor, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          hover to illuminate
        </span>
      </div>
    </div>
  )
}
