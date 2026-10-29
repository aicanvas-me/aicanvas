'use client'

import { useLayoutEffect, useEffect, useRef, useState } from 'react'
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect


const SPACING     = 20
const RADIUS      = 200
const BASE_R      = 1.5
const BURST_R     = 16
const BASE_A_DARK  = 0.55
const BASE_A_LIGHT = 0.75

type Bubble = { x: number; y: number; b: number; phase: number }

export default function BubbleField() {
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

    let bubbles: Bubble[] = []
    let animId = 0
    let alive  = true
    let cw = 0, ch = 0

    function build() {
      const dpr  = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      cw = rect.width
      ch = rect.height
      if (!cw || !ch) return
      canvas.width  = Math.round(cw * dpr)
      canvas.height = Math.round(ch * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      bubbles = []
      const cols = Math.floor(cw / SPACING) + 2
      const rows = Math.floor(ch / SPACING) + 2
      const ox   = (cw % SPACING) / 2
      const oy   = (ch % SPACING) / 2
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          bubbles.push({ x: ox + c * SPACING, y: oy + r * SPACING, b: 0, phase: Math.random() })
        }
      }
    }

    function frame() {
      if (!alive) return
      ctx.clearRect(0, 0, cw, ch)

      const mx     = mouseRef.current?.x ?? -99999
      const my     = mouseRef.current?.y ?? -99999
      const r2     = RADIUS * RADIUS
      const dotRGB = isDarkRef.current ? '255,255,255' : '28,25,22'
      const baseA  = isDarkRef.current ? BASE_A_DARK : BASE_A_LIGHT

      for (const bub of bubbles) {
        const dx    = bub.x - mx
        const dy    = bub.y - my
        const dist2 = dx * dx + dy * dy
        const tgt   = dist2 < r2 ? Math.exp(-dist2 / (RADIUS * RADIUS * 0.25)) : 0

        bub.b += (tgt > bub.b ? 0.16 : 0.07) * (tgt - bub.b)
        if (bub.b < 0.004) bub.b = 0

        if (bub.b > 0.08) {
          bub.phase = (bub.phase + 0.025 * bub.b) % 1
        }

        const p = bub.phase

        if (bub.b > 0.08) {
          if (p < 0.55) {
            const t     = p / 0.55
            const r     = BASE_R + t * BURST_R
            const alpha = baseA * (1 - t)
            if (alpha > 0.004) {
              ctx.strokeStyle = `rgba(${dotRGB},${alpha.toFixed(3)})`
              ctx.lineWidth   = 0.5
              ctx.beginPath()
              ctx.arc(bub.x, bub.y, r, 0, Math.PI * 2)
              ctx.stroke()
            }
          } else if (p < 0.72) {
          } else {
            const t     = (p - 0.72) / 0.28
            const r     = BASE_R * t
            const alpha = baseA * t
            if (r > 0.2 && alpha > 0.004) {
              ctx.strokeStyle = `rgba(${dotRGB},${alpha.toFixed(3)})`
              ctx.lineWidth   = 0.5
              ctx.beginPath()
              ctx.arc(bub.x, bub.y, r, 0, Math.PI * 2)
              ctx.stroke()
            }
          }
        } else {
          ctx.strokeStyle = `rgba(${dotRGB},${baseA.toFixed(3)})`
          ctx.lineWidth   = 0.5
          ctx.beginPath()
          ctx.arc(bub.x, bub.y, BASE_R, 0, Math.PI * 2)
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
          Bubble Field
        </span>
        <span style={{ color: hintColor, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          hover to burst
        </span>
      </div>
    </div>
  )
}
