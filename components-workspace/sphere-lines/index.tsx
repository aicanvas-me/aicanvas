'use client'

import { useLayoutEffect, useEffect, useRef, useState } from 'react'
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect



const N_LATS      = 42
const N_STEPS     = 240
const WAVE_PHI    = 0.28
const WAVE_FREQ_T = 2.0
const WAVE_FREQ_P = 1.8
const WAVE_SPEED_IDLE  = 0.003
const WAVE_SPEED_HOVER = 0.012
const ROT_SPEED_IDLE   = 0.003
const ROT_SPEED_HOVER  = 0.012
const BACK_A      = 0.05
const ALPHA_MIN   = 0.12
const ALPHA_MAX   = 0.40
const LW_MIN      = 0.35
const LW_MAX      = 0.90
const BAND_SIGMA  = 0.35
const BAND_FREQ   = 2.5
const HOVER_RADIUS = 90
const HOVER_AMP    = 0.45
const TWO_PI      = Math.PI * 2

export default function SphereLines() {
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

    let cw = 0, ch = 0
    let animId   = 0
    let alive    = true
    let t        = 0
    let rot      = 0
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
    }

    const xs = new Float32Array(N_STEPS + 1)
    const ys = new Float32Array(N_STEPS + 1)
    const zs = new Float32Array(N_STEPS + 1)

    function frame() {
      if (!alive) return
      const hasHover = mouseRef.current !== null
      hoverStr += ((hasHover ? 1 : 0) - hoverStr) * (hasHover ? 0.025 : 0.015)

      t   += WAVE_SPEED_IDLE + hoverStr * (WAVE_SPEED_HOVER - WAVE_SPEED_IDLE)
      rot += ROT_SPEED_IDLE  + hoverStr * (ROT_SPEED_HOVER  - ROT_SPEED_IDLE)

      ctx.clearRect(0, 0, cw, ch)

      const R          = Math.min(cw, ch) * 0.42
      const cx         = cw / 2
      const cy         = ch / 2
      const mouse      = mouseRef.current
      const bandCenter = Math.sin(t * BAND_FREQ) * (Math.PI * 0.4)
      const dotRGB     = isDarkRef.current ? '255,255,255' : '28,25,22'

      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.clip()

      for (let i = 0; i < N_LATS; i++) {
        const phi  = -Math.PI / 2 + (i + 1) * Math.PI / (N_LATS + 1)

        const depth = Math.cos(phi)
        const lineA = ALPHA_MIN + depth * (ALPHA_MAX - ALPHA_MIN)
        const lw    = LW_MIN + depth * (LW_MAX - LW_MIN)

        const dist    = phi - bandCenter
        const autoEnv = Math.exp(-(dist * dist) / (2 * BAND_SIGMA * BAND_SIGMA))
        const autoAmp = WAVE_PHI * autoEnv

        for (let j = 0; j <= N_STEPS; j++) {
          const theta = j * 2 * Math.PI / N_STEPS
          const tR    = theta + rot

          const autoDPhi = autoAmp * (
            Math.sin(tR * WAVE_FREQ_T + phi * WAVE_FREQ_P + t) +
            0.45 * Math.sin(tR * WAVE_FREQ_T * 1.7 + phi * WAVE_FREQ_P * 1.3 + t * 1.4)
          )

          let localDPhi = 0
          if (mouse && hoverStr > 0.01) {
            const sx = cx + R * Math.cos(phi) * Math.cos(tR)
            const sy = cy - R * Math.sin(phi)
            const dx = sx - mouse.x
            const dy = sy - mouse.y
            const localEnv = Math.exp(-(dx * dx + dy * dy) / (HOVER_RADIUS * HOVER_RADIUS))
            localDPhi = HOVER_AMP * localEnv * hoverStr *
              Math.sin(tR * 3 + phi * 2 + t * 6)
          }

          const phiD = phi + autoDPhi + localDPhi
          xs[j] = cx + R * Math.cos(phiD) * Math.cos(tR)
          ys[j] = cy - R * Math.sin(phiD)
        }

        ctx.strokeStyle = `rgba(${dotRGB},${BACK_A})`
        ctx.lineWidth   = 0.4
        ctx.beginPath()
        {
          const mx0 = (xs[N_STEPS - 1] + xs[0]) / 2
          const my0 = (ys[N_STEPS - 1] + ys[0]) / 2
          ctx.moveTo(mx0, my0)
          for (let j = 0; j < N_STEPS; j++) {
            const nx  = j + 1 < N_STEPS ? xs[j + 1] : xs[0]
            const ny  = j + 1 < N_STEPS ? ys[j + 1] : ys[0]
            const mx2 = (xs[j] + nx) / 2
            const my2 = (ys[j] + ny) / 2
            ctx.quadraticCurveTo(xs[j], ys[j], mx2, my2)
          }
          ctx.closePath()
          ctx.stroke()
        }

        let startJ = 0
        for (let j = 0; j < N_STEPS; j++) {
          if (Math.sin(j * TWO_PI / N_STEPS + rot) < 0) { startJ = j; break }
        }

        ctx.strokeStyle = `rgba(${dotRGB},${lineA.toFixed(3)})`
        ctx.lineWidth   = lw
        ctx.beginPath()
        let inFront = false
        let prevX   = 0
        let prevY   = 0
        for (let jj = 0; jj <= N_STEPS; jj++) {
          const j       = (startJ + jj) % N_STEPS
          const isFront = Math.sin(j * TWO_PI / N_STEPS + rot) >= 0
          const x = xs[j], y = ys[j]
          if (isFront) {
            if (!inFront) {
              ctx.moveTo(x, y)
              inFront = true
            } else {
              ctx.quadraticCurveTo(prevX, prevY, (prevX + x) / 2, (prevY + y) / 2)
            }
            prevX = x; prevY = y
          } else if (inFront) {
            ctx.lineTo(prevX, prevY)
            inFront = false
          }
        }
        if (inFront) ctx.lineTo(prevX, prevY)
        ctx.stroke()
      }

      ctx.restore()
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
    </div>
  )
}
