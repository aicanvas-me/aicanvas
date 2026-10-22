'use client'

import { useLayoutEffect, useEffect, useRef, useState } from 'react'
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect



const N_RADIALS = 24
const N_RINGS   = 14


const SWAY_AMP  = 3.5
const SWAY_SPD  = 0.00045


const BOW_AMP   = 6
const BOW_SPD   = 0.55


const NODE_PUSH_R   = 90
const NODE_PUSH_STR = 3.2
const SPRING_K      = 0.07
const SPRING_DAMP   = 0.84


const PUSH_RADIUS = 280
const PUSH_MAX    = 18


interface WebNode {
  bx: number; by: number
  phase: number
  sx: number; sy: number
  svx: number; svy: number
}

interface Strand {
  a: number; b: number
  kind: 'radial' | 'ring'
  ring: number
  bowPhase: number
  bowPerpX: number
  bowPerpY: number
}


function buildWeb(W: number, H: number): { nodes: WebNode[]; strands: Strand[] } {
  const cx   = W / 2
  const cy   = H / 2
  const maxR = Math.sqrt(W * W + H * H) * 0.56

  const nodes: WebNode[] = []

  nodes.push({ bx: cx, by: cy, phase: 0, sx: 0, sy: 0, svx: 0, svy: 0 })

  for (let r = 1; r <= N_RINGS; r++) {
    const baseR = maxR * (r / N_RINGS)
    for (let s = 0; s < N_RADIALS; s++) {
      const angle  = s * (2 * Math.PI / N_RADIALS) - Math.PI / 2
      const jitter = 1 + (Math.random() - 0.5) * 0.18
      nodes.push({
        bx: cx + Math.cos(angle) * baseR * jitter,
        by: cy + Math.sin(angle) * baseR * jitter,
        phase: Math.random() * Math.PI * 2,
        sx: 0, sy: 0, svx: 0, svy: 0,
      })
    }
  }

  const strands: Strand[] = []

  function addStrand(a: number, b: number, kind: 'radial' | 'ring', ring: number) {
    const na = nodes[a], nb = nodes[b]
    const dx = nb.bx - na.bx, dy = nb.by - na.by
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    strands.push({
      a, b, kind, ring,
      bowPhase: (na.phase + nb.phase) / 2,
      bowPerpX: -dy / len,
      bowPerpY:  dx / len,
    })
  }

  for (let s = 0; s < N_RADIALS; s++) {
    addStrand(0, 1 + s, 'radial', 1)
    for (let r = 1; r < N_RINGS; r++) {
      const ai = 1 + (r - 1) * N_RADIALS + s
      const bi = 1 +  r      * N_RADIALS + s
      addStrand(ai, bi, 'radial', r + 1)
    }
  }

  for (let r = 1; r <= N_RINGS; r++) {
    for (let s = 0; s < N_RADIALS; s++) {
      const ai = 1 + (r - 1) * N_RADIALS + s
      const bi = 1 + (r - 1) * N_RADIALS + (s + 1) % N_RADIALS
      addStrand(ai, bi, 'ring', r)
    }
  }

  return { nodes, strands }
}


function detectDark(el: HTMLElement): boolean {
  const w = el.closest('[data-card-theme]')
  if (w) return w.classList.contains('dark')
  return document.documentElement.classList.contains('dark')
}


export default function ParticleConstellation() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef     = useRef<{ x: number; y: number } | null>(null)
  const webRef       = useRef<{ nodes: WebNode[]; strands: Strand[] } | null>(null)
  const rafRef       = useRef<number>(0)
  const [isDark, setIsDark] = useState(() => typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false)
  const isDarkRef = useRef(typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false)

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const check = () => { const d = detectDark(el); setIsDark(d); isDarkRef.current = d }
    check()
    const mo = new MutationObserver(check)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const w = el.closest('[data-card-theme]')
    if (w) mo.observe(w, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])

  useIsomorphicLayoutEffect(() => {
    const canvas    = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let alive = true
    let time  = 0

    function resize() {
      if (!canvas || !container) return
      const dpr = window.devicePixelRatio || 1
      const w   = container.clientWidth
      const h   = container.clientHeight
      canvas.width  = w * dpr
      canvas.height = h * dpr
      canvas.style.width  = `${w}px`
      canvas.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      webRef.current = buildWeb(w, h)
    }
    resize()

    const ro = new ResizeObserver(() => { if (alive) resize() })
    ro.observe(container)

    const mo = new MutationObserver(() => {
      if (alive && container) isDarkRef.current = detectDark(container)
    })
    const wrapper = container.closest('[data-card-theme]')
    if (wrapper) mo.observe(wrapper, { attributes: true, attributeFilter: ['class'] })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    function tick() {
      if (!alive || !canvas || !ctx) return
      rafRef.current = requestAnimationFrame(tick)

      time += SWAY_SPD
      const mouse = mouseRef.current
      const web   = webRef.current
      if (!web) return

      const W = container!.clientWidth
      const H = container!.clientHeight

      for (const n of web.nodes) {
        const swayX = n.bx + Math.sin(time * 1.1 + n.phase)       * SWAY_AMP
        const swayY = n.by + Math.cos(time * 0.9 + n.phase * 1.4) * SWAY_AMP

        if (mouse) {
          const liveX = swayX + n.sx
          const liveY = swayY + n.sy
          const dx = liveX - mouse.x
          const dy = liveY - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < NODE_PUSH_R && dist > 0.1) {
            const force = (1 - dist / NODE_PUSH_R) * NODE_PUSH_STR
            n.svx += (dx / dist) * force
            n.svy += (dy / dist) * force
          }
        }

        n.svx += -n.sx * SPRING_K
        n.svy += -n.sy * SPRING_K
        n.svx *= SPRING_DAMP
        n.svy *= SPRING_DAMP
        n.sx  += n.svx
        n.sy  += n.svy
      }

      const pos = web.nodes.map(n => ({
        x: n.bx + Math.sin(time * 1.1 + n.phase)       * SWAY_AMP + n.sx,
        y: n.by + Math.cos(time * 0.9 + n.phase * 1.4) * SWAY_AMP + n.sy,
      }))

      const dark = isDarkRef.current
      const fg   = dark ? '255,255,255' : '28,25,22'

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = dark ? '#110F0C' : '#F5F1EA'
      ctx.fillRect(0, 0, W, H)
      ctx.lineCap  = 'round'
      ctx.lineJoin = 'round'

      for (const s of web.strands) {
        const pa = pos[s.a]
        const pb = pos[s.b]

        const mx = (pa.x + pb.x) / 2
        const my = (pa.y + pb.y) / 2

        const bow    = BOW_AMP * Math.sin(time * BOW_SPD * 60 + s.bowPhase)
        let cpx = mx + s.bowPerpX * bow
        let cpy = my + s.bowPerpY * bow

        if (mouse) {
          const cdx    = mouse.x - mx
          const cdy    = mouse.y - my
          const cdist2 = cdx * cdx + cdy * cdy
          const cdist  = Math.sqrt(cdist2)
          const falloff = Math.exp(-cdist2 / (PUSH_RADIUS * PUSH_RADIUS))
          const bend    = PUSH_MAX * falloff
          if (cdist > 0.1) {
            cpx -= (cdx / cdist) * bend
            cpy -= (cdy / cdist) * bend
          }
        }

        const depthFade = 1 - (s.ring - 1) / (N_RINGS + 2)
        let alpha = s.kind === 'radial' ? 0.42 * depthFade : 0.20 * depthFade

        if (mouse) {
          const cdx = mouse.x - mx, cdy = mouse.y - my
          const proximity = Math.exp(-(cdx * cdx + cdy * cdy) / (PUSH_RADIUS * PUSH_RADIUS * 0.35))
          alpha = alpha * (1 - proximity * 0.82)
        }

        ctx.strokeStyle = `rgba(${fg},${alpha.toFixed(3)})`
        ctx.lineWidth   = s.kind === 'radial' ? 0.75 : 0.5

        ctx.beginPath()
        ctx.moveTo(pa.x, pa.y)
        ctx.quadraticCurveTo(cpx, cpy, pb.x, pb.y)
        ctx.stroke()
      }

      for (let i = 0; i < pos.length; i++) {
        const p = pos[i]
        let alpha = i === 0 ? 0.45 : 0.16
        if (mouse) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y
          const prox = Math.exp(-(dx * dx + dy * dy) / (160 * 160))
          alpha = alpha * (1 - prox * 0.82)
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, i === 0 ? 1.8 : 1.1, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${fg},${alpha.toFixed(3)})`
        ctx.fill()
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onLeave() { mouseRef.current = null }
    function onTouch(e: TouchEvent) {
      const t = e.touches[0]
      if (!t) return
      const rect = canvas!.getBoundingClientRect()
      mouseRef.current = { x: t.clientX - rect.left, y: t.clientY - rect.top }
    }
    function onTouchEnd() { mouseRef.current = null }
    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseleave', onLeave)
    container.addEventListener('touchstart', onTouch, { passive: true })
    container.addEventListener('touchmove', onTouch, { passive: true })
    container.addEventListener('touchend', onTouchEnd)

    return () => {
      alive = false
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      mo.disconnect()
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
      container.removeEventListener('touchstart', onTouch)
      container.removeEventListener('touchmove', onTouch)
      container.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: isDark ? '#110F0C' : '#F5F1EA' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
