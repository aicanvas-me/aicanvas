'use client'

import { useEffect, useRef } from 'react'


const SPACING      = 22
const DOT_RADIUS   = 1.5
const INFLUENCE_R  = 180
const SPRING_K     = 0.055
const DAMPING      = 0.11
const MAG_STRENGTH = 16
const LERP_FACTOR  = 0.06
const MOUSE_LERP   = 0.14


type Dot = {
  restX: number
  restY: number
  x: number
  y: number
  vx: number
  vy: number
}


export default function MagneticDots() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const mouseRef     = useRef<{ x: number; y: number } | null>(null)
  const hoverStrRef  = useRef(0)
  const isDarkRef    = useRef(true)
  const bgRef        = useRef('#110F0C')

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const apply = (dark: boolean) => {
      isDarkRef.current = dark
      bgRef.current = dark ? '#110F0C' : '#F5F1EA'
      if (containerRef.current) {
        containerRef.current.style.background = bgRef.current
      }
    }

    const check = () => {
      const card = el.closest('[data-card-theme]')
      const dark = card
        ? card.classList.contains('dark')
        : document.documentElement.classList.contains('dark')
      apply(dark)
    }

    check()

    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = el.closest('[data-card-theme]')
    if (cardWrapper) {
      observer.observe(cardWrapper, { attributes: true, attributeFilter: ['class'] })
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dots: Dot[] = []
    let animId  = 0
    let alive   = true
    let cw      = 0
    let ch      = 0
    let dpr     = 1
    let smoothMx = -99999
    let smoothMy = -99999

    function build() {
      if (!canvas) return
      dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      cw = rect.width
      ch = rect.height
      if (!cw || !ch) return

      canvas.width  = Math.round(cw * dpr)
      canvas.height = Math.round(ch * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      const cols = Math.ceil(cw / SPACING) + 1
      const rows = Math.ceil(ch / SPACING) + 1
      const ox   = ((cw % SPACING) / 2)
      const oy   = ((ch % SPACING) / 2)

      const prev = new Map<string, Dot>()
      for (const d of dots) {
        prev.set(`${d.restX},${d.restY}`, d)
      }

      dots = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const rx = ox + c * SPACING
          const ry = oy + r * SPACING
          const key = `${rx},${ry}`
          if (prev.has(key)) {
            dots.push(prev.get(key)!)
          } else {
            dots.push({ restX: rx, restY: ry, x: rx, y: ry, vx: 0, vy: 0 })
          }
        }
      }
    }

    function frame() {
      if (!alive || !ctx) return

      const hasPointer = mouseRef.current !== null
      const targetStr  = hasPointer ? 1 : 0
      hoverStrRef.current += (targetStr - hoverStrRef.current) * LERP_FACTOR

      const hStr = hoverStrRef.current
      const raw  = mouseRef.current
      if (raw) {
        if (smoothMx === -99999) { smoothMx = raw.x; smoothMy = raw.y }
        smoothMx += (raw.x - smoothMx) * MOUSE_LERP
        smoothMy += (raw.y - smoothMy) * MOUSE_LERP
      } else if (hStr <= 0.001) {
        smoothMx = -99999
        smoothMy = -99999
      }
      const mx = smoothMx
      const my = smoothMy
      const r2 = INFLUENCE_R * INFLUENCE_R

      ctx.clearRect(0, 0, cw, ch)

      const dotColor = isDarkRef.current
        ? 'rgba(255,255,255,0.5)'
        : 'rgba(28,25,22,0.4)'

      ctx.fillStyle = dotColor

      for (const d of dots) {
        if (hStr > 0.001) {
          const dx   = d.x - mx
          const dy   = d.y - my
          const dist2 = dx * dx + dy * dy

          if (dist2 < r2 && dist2 > 0.01) {
            const dist  = Math.sqrt(dist2)
            const t     = 1 - dist / INFLUENCE_R
            const force = t * t * MAG_STRENGTH * hStr
            d.vx += (-dx / dist) * force
            d.vy += (-dy / dist) * force
          }
        }

        d.vx += (d.restX - d.x) * SPRING_K
        d.vy += (d.restY - d.y) * SPRING_K

        d.vx *= (1 - DAMPING)
        d.vy *= (1 - DAMPING)

        d.x += d.vx
        d.y += d.vy

        ctx.beginPath()
        ctx.arc(d.x, d.y, DOT_RADIUS, 0, Math.PI * 2)
        ctx.fill()
      }

      animId = requestAnimationFrame(frame)
    }

    build()
    frame()

    const ro = new ResizeObserver(build)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

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

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: '#110F0C' }}
      onMouseMove={(e) => updateMouse(e.clientX, e.clientY)}
      onMouseLeave={() => { mouseRef.current = null }}
      onTouchMove={(e) => {
        const t = e.touches[0]
        if (t) updateMouse(t.clientX, t.clientY)
      }}
      onTouchEnd={() => { mouseRef.current = null }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
