'use client'

import { useLayoutEffect, useEffect, useRef, useState } from 'react'
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect



const SPACING      = 32
const ROW_STEP     = 4
const AMP          = 18
const FREQ_Y       = 0.015
const FREQ_X       = 0.006
const HOVER_BOOST  = 5.0
const LOCAL_AMP    = 58
const LOCAL_RADIUS = 220
const LINE_A_DARK  = 0.55
const LINE_A_LIGHT = 0.75

export default function WaveLines() {
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
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!

    let cols = 0, rows = 0, cw = 0, ch = 0
    let ox = 0
    let animId  = 0
    let alive   = true
    let t       = 0
    let hoverStr = 0

    function build() {
      const dpr  = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      cw = rect.width
      ch = rect.height
      if (!cw || !ch) return
      canvas.width  = Math.round(cw * dpr)
      canvas.height = Math.round(ch * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      cols = Math.ceil(cw / SPACING) + 2
      rows = Math.ceil(ch / ROW_STEP) + 1
      ox   = (cw % SPACING) / 2
    }

    function frame() {
      if (!alive) return
      t += 0.003

      const hasHover = mouseRef.current !== null
      hoverStr += ((hasHover ? 1 : 0) - hoverStr) * (hasHover ? 0.018 : 0.010)

      ctx.clearRect(0, 0, cw, ch)

      const dotRGB = isDarkRef.current ? '255,255,255' : '28,25,22'
      const lineA  = isDarkRef.current ? LINE_A_DARK : LINE_A_LIGHT
      const amp    = AMP * (1 + hoverStr * HOVER_BOOST)

      const mx = mouseRef.current?.x ?? -99999
      const my = mouseRef.current?.y ?? -99999
      const r2 = LOCAL_RADIUS * LOCAL_RADIUS

      ctx.strokeStyle = `rgba(${dotRGB},${lineA.toFixed(3)})`
      ctx.lineWidth = 0.8

      for (let c = 0; c < cols; c++) {
        const rx = ox + c * SPACING
        ctx.beginPath()

        let prevX = 0, prevY = 0

        for (let r = 0; r <= rows; r++) {
          const ry = r * ROW_STEP

          const wx = amp * Math.sin(ry * FREQ_Y + rx * FREQ_X + t)
                   + amp * 0.38 * Math.sin(ry * FREQ_Y * 1.6 + rx * FREQ_X * 1.4 + t * 1.5 + 1.1)
          const wy = amp * 0.12 * Math.cos(rx * FREQ_X * 0.9 + ry * FREQ_Y * 0.4 + t * 0.8)

          const dx = rx - mx
          const dy = ry - my
          const dist2 = dx * dx + dy * dy
          let px = 0, py = 0
          if (dist2 < r2 * 4) {
            const push = LOCAL_AMP * Math.exp(-dist2 / (r2 * 0.5))
            const dist = Math.sqrt(dist2) || 1
            px = (dx / dist) * push
            py = (dy / dist) * push
          }

          const x = rx + wx + px
          const y = ry + wy + py

          if (r === 0) {
            ctx.moveTo(x, y)
          } else {
            const mx2 = (prevX + x) / 2
            const my2 = (prevY + y) / 2
            ctx.quadraticCurveTo(prevX, prevY, mx2, my2)
          }
          prevX = x
          prevY = y
        }
        ctx.lineTo(prevX, prevY)
        ctx.stroke()
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
      onTouchMove={(e) => { const t2 = e.touches[0]; if (t2) updateMouse(t2.clientX, t2.clientY) }}
      onTouchEnd={() => { mouseRef.current = null }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
        <span style={{ color: labelColor, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Wave Lines
        </span>
        <span style={{ color: hintColor, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          hover to fold
        </span>
      </div>
    </div>
  )
}
