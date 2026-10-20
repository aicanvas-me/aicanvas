'use client'

import { useLayoutEffect, useEffect, useRef, useState } from 'react'
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect


const SPACING = 20
const RADIUS  = 130
const BASE_A  = 0.13
const PEAK_A  = 0.92

export default function InteractiveDotGrid({
  showLabel = true,
  colors,
}: {
  showLabel?: boolean
  /** Overrides the background, dot colors, and resting or highlighted opacity. */
  colors?: {
    background?: string
    // dot and highlight take "r,g,b" strings, not hex: they are split into numbers.
    dot?: string
    highlight?: string
    baseAlpha?: number
    peakAlpha?: number
  }
} = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const mouseRef     = useRef<{ x: number; y: number } | null>(null)
  const colorsRef    = useRef(colors)
  colorsRef.current  = colors
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
    const updateFromClient = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: clientX - rect.left, y: clientY - rect.top }
    }

    const onMouseMove = (e: MouseEvent) => updateFromClient(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) updateFromClient(t.clientX, t.clientY)
    }
    const clearPointer = () => { mouseRef.current = null }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', clearPointer, { passive: true })
    window.addEventListener('touchcancel', clearPointer, { passive: true })
    document.addEventListener('mouseleave', clearPointer)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', clearPointer)
      window.removeEventListener('touchcancel', clearPointer)
      document.removeEventListener('mouseleave', clearPointer)
    }
  }, [])

  useEffect(() => {
    const canvas: HTMLCanvasElement = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    type Dot = { x: number; y: number; b: number }
    let dots: Dot[] = []
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

      dots = []
      const cols = Math.floor(cw / SPACING) + 2
      const rows = Math.floor(ch / SPACING) + 2
      const ox   = (cw % SPACING) / 2
      const oy   = (ch % SPACING) / 2
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({ x: ox + c * SPACING, y: oy + r * SPACING, b: 0 })
        }
      }
    }

    function frame() {
      if (!alive) return
      ctx.clearRect(0, 0, cw, ch)

      const mx      = mouseRef.current?.x ?? -99999
      const my      = mouseRef.current?.y ?? -99999
      const r2      = RADIUS * RADIUS

      const ov      = colorsRef.current
      const dark    = isDarkRef.current
      const restRGB = ov?.dot ?? (dark ? '255,255,255' : '28,25,22')
      const litRGB  = ov?.highlight ?? restRGB
      const baseA   = ov?.baseAlpha ?? (dark ? BASE_A : 0.25)
      const peakA   = ov?.peakAlpha ?? PEAK_A
      const [r0, g0, b0] = restRGB.split(',').map(Number)
      const [r1, g1, b1] = litRGB.split(',').map(Number)

      for (const d of dots) {
        const dx    = d.x - mx
        const dy    = d.y - my
        const dist2 = dx * dx + dy * dy
        const tgt   = dist2 < r2 ? Math.pow(1 - Math.sqrt(dist2) / RADIUS, 1.5) : 0

        d.b += (tgt > d.b ? 0.16 : 0.07) * (tgt - d.b)
        if (d.b < 0.004) d.b = 0

        const alpha = baseA + (peakA - baseA) * d.b
        const sz    = 1 + d.b * 1.2
        const r = Math.round(r0 + (r1 - r0) * d.b)
        const g = Math.round(g0 + (g1 - g0) * d.b)
        const b = Math.round(b0 + (b1 - b0) * d.b)
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(2)})`
        ctx.fillRect(d.x - sz / 2, d.y - sz / 2, sz, sz)
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

  const bg        = colors?.background ?? (isDark ? '#110F0C' : '#F5F1EA')
  const labelColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(28,25,22,0.45)'
  const hintColor  = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(28,25,22,0.22)'

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: bg }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />
      {showLabel && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span style={{ color: labelColor, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Dot Grid
          </span>
          <span style={{ color: hintColor, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            hover to illuminate
          </span>
        </div>
      )}
    </div>
  )
}
