'use client'
// npm install framer-motion
// font: Anton


import { useEffect, useRef, useState } from 'react'
import React from 'react'
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
} from 'framer-motion'
import type { AnimationPlaybackControls, MotionValue } from 'framer-motion'






















const DARK_BG = '#1a1a19'
const LIGHT_BG = '#efeee6'

function useTheme(ref: React.RefObject<HTMLElement | null>) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const readTheme = () => {
      const cardScope = element.closest('[data-card-theme]') as HTMLElement | null
      if (cardScope) {
        setTheme(cardScope.dataset.cardTheme === 'dark' ? 'dark' : 'light')
        return
      }
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    }
    readTheme()

    const observers: MutationObserver[] = []
    let current: HTMLElement | null = element
    while (current) {
      const observer = new MutationObserver(readTheme)
      observer.observe(current, { attributes: true, attributeFilter: ['class', 'data-card-theme'] })
      observers.push(observer)
      current = current.parentElement
    }

    return () => observers.forEach((o) => o.disconnect())
  }, [ref])

  return { theme }
}



const ENTER_SPRING = { type: 'spring', stiffness: 280, damping: 14, mass: 1.8 } as const


const RETURN_SPRING = { type: 'spring', stiffness: 280, damping: 16, mass: 1.8 } as const


























type Pt = readonly [number, number]

function solve8(
  A: number[][],
  b: number[],
): number[] {
  const n = 8
  const M: number[][] = A.map((row, i) => [...row, b[i]])

  for (let col = 0; col < n; col++) {
    let pivot = col
    let maxAbs = Math.abs(M[col][col])
    for (let r = col + 1; r < n; r++) {
      const v = Math.abs(M[r][col])
      if (v > maxAbs) {
        maxAbs = v
        pivot = r
      }
    }
    if (maxAbs < 1e-12) {
      return [1, 0, 0, 1, 0, 0, 0, 0]
    }
    if (pivot !== col) {
      const tmp = M[col]
      M[col] = M[pivot]
      M[pivot] = tmp
    }
    const p = M[col][col]
    for (let c = col; c <= n; c++) M[col][c] /= p
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const factor = M[r][col]
      if (factor === 0) continue
      for (let c = col; c <= n; c++) {
        M[r][c] -= factor * M[col][c]
      }
    }
  }

  const x: number[] = new Array(n)
  for (let i = 0; i < n; i++) x[i] = M[i][n]
  return x
}

function cornerPinMatrix3d(
  tl: Pt,
  tr: Pt,
  br: Pt,
  bl: Pt,
  w: number,
  h: number,
): string {
  const src: readonly Pt[] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ] as const
  const dst: readonly Pt[] = [tl, tr, br, bl] as const

  const A: number[][] = []
  const rhs: number[] = []

  for (let i = 0; i < 4; i++) {
    const [u, v] = src[i]
    const [x, y] = dst[i]
    A.push([u, 0, v, 0, 1, 0, -u * x, -v * x])
    rhs.push(x)
    A.push([0, u, 0, v, 0, 1, -u * y, -v * y])
    rhs.push(y)
  }

  const [a, b, c, d, e, f, g, hh] = solve8(A, rhs)

  return `matrix3d(${a},${b},0,${g},${c},${d},0,${hh},0,0,1,0,${e},${f},0,1)`
}





const X_OUTER_LEFT = -1.0
const X_OUTER_RIGHT = 1.05
const Y_LEFT_MAG = 1.55
const Y_RIGHT_MAG = 1.48





type Mode = 'none' | 'top' | 'bottom'



type Offsets8 = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]


function targetsFor(mode: Mode, w: number, h: number): Offsets8 {
  if (mode === 'top') {
    return [
      X_OUTER_LEFT * w,
      -Y_LEFT_MAG * h,
      X_OUTER_RIGHT * w,
      -Y_RIGHT_MAG * h,
      0,
      0,
      0,
      0,
    ] as const
  }
  if (mode === 'bottom') {
    return [
      0,
      0,
      0,
      0,
      X_OUTER_LEFT * w,
      Y_LEFT_MAG * h,
      X_OUTER_RIGHT * w,
      Y_RIGHT_MAG * h,
    ] as const
  }
  return [0, 0, 0, 0, 0, 0, 0, 0] as const
}

export default function WildMorph({ text = 'wild' }: { text?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme(containerRef)
  const isDark = theme === 'dark'
  const bgColor = isDark ? DARK_BG : LIGHT_BG
  const inkColor = isDark ? LIGHT_BG : DARK_BG

  const tlX: MotionValue<number> = useMotionValue(0)
  const tlY: MotionValue<number> = useMotionValue(0)
  const trX: MotionValue<number> = useMotionValue(0)
  const trY: MotionValue<number> = useMotionValue(0)
  const blX: MotionValue<number> = useMotionValue(0)
  const blY: MotionValue<number> = useMotionValue(0)
  const brX: MotionValue<number> = useMotionValue(0)
  const brY: MotionValue<number> = useMotionValue(0)

  const warpRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const textRef = useRef<SVGTextElement>(null)

  const sizeRef = useRef<{ w: number; h: number }>({ w: 1, h: 1 })

  const controlsRef = useRef<AnimationPlaybackControls[]>([])

  const modeRef = useRef<Mode>('none')

  const [natural, setNatural] = useState({ width: 1, height: 1, ascent: 1 })

  const [fontSize, setFontSize] = useState(144)

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth
      const clamped = Math.min(Math.max(vw * 0.12, 64), 144)
      setFontSize(clamped)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const el = textRef.current
    if (!el) return
    const bbox = el.getBBox()
    if (bbox.width === 0) return
    setNatural({
      width: bbox.width,
      height: bbox.height,
      ascent: -bbox.y,
    })
  }, [fontSize, text])

  const applyTransform = () => {
    const el = warpRef.current
    if (!el) return
    const { w, h } = sizeRef.current

    const tl: Pt = [0 + tlX.get(), 0 + tlY.get()]
    const tr: Pt = [w + trX.get(), 0 + trY.get()]
    const br: Pt = [w + brX.get(), h + brY.get()]
    const bl: Pt = [0 + blX.get(), h + blY.get()]

    el.style.transform = cornerPinMatrix3d(tl, tr, br, bl, w, h)
  }

  useEffect(() => {
    if (natural.width > 1 && natural.height > 1) {
      sizeRef.current = { w: natural.width, h: natural.height }
      applyTransform()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [natural])

  useEffect(() => {
    const el = warpRef.current
    if (!el) return

    const update = () => {
      const w = el.offsetWidth
      const h = el.offsetHeight
      if (w > 0 && h > 0) {
        sizeRef.current = { w, h }
        applyTransform()
      }
    }

    const ro = new ResizeObserver(update)
    ro.observe(el)
    update()

    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useMotionValueEvent(tlX, 'change', applyTransform)
  useMotionValueEvent(tlY, 'change', applyTransform)
  useMotionValueEvent(trX, 'change', applyTransform)
  useMotionValueEvent(trY, 'change', applyTransform)
  useMotionValueEvent(blX, 'change', applyTransform)
  useMotionValueEvent(blY, 'change', applyTransform)
  useMotionValueEvent(brX, 'change', applyTransform)
  useMotionValueEvent(brY, 'change', applyTransform)

  const stopAll = () => {
    for (const c of controlsRef.current) c.stop()
    controlsRef.current = []
  }

  const applyMode = (next: Mode) => {
    if (next === modeRef.current) return
    modeRef.current = next

    // Must stay '0 0': the corner-pin matrix is solved for a top-left origin.
    if (warpRef.current) {
      warpRef.current.style.transformOrigin = '0 0'
    }

    stopAll()

    const { w, h } = sizeRef.current
    const targets = targetsFor(next, w, h)

    const opts = next === 'none' ? RETURN_SPRING : ENTER_SPRING

    controlsRef.current = [
      animate(tlX, targets[0], opts),
      animate(tlY, targets[1], opts),
      animate(trX, targets[2], opts),
      animate(trY, targets[3], opts),
      animate(blX, targets[4], opts),
      animate(blY, targets[5], opts),
      animate(brX, targets[6], opts),
      animate(brY, targets[7], opts),
    ]
  }

  useEffect(() => {
    return () => stopAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const modeFromClientY = (clientY: number): Mode => {
    const el = panelRef.current
    if (!el) return 'none'
    const rect = el.getBoundingClientRect()
    if (clientY < rect.top || clientY > rect.bottom) return 'none'
    return clientY < rect.top + rect.height / 2 ? 'top' : 'bottom'
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    applyMode(modeFromClientY(e.clientY))
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    applyMode(modeFromClientY(e.clientY))
  }

  const onPointerUp = () => applyMode('none')
  const onPointerLeave = () => applyMode('none')
  const onPointerCancel = () => applyMode('none')

  return (
    <div
      ref={(el) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        (panelRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      className="relative flex min-h-screen w-full select-none items-center justify-center"
      style={{
        backgroundColor: bgColor,
        perspective: '1400px',
        perspectiveOrigin: '50% 50%',
        cursor: 'crosshair',
        touchAction: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerCancel}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');`}</style>

      <div
        ref={warpRef}
        className="relative"
        style={{
          transformOrigin: '0 0',
          willChange: 'transform',
          display: 'inline-block',
        }}
      >
        <svg
          ref={svgRef}
          style={{ display: 'block', overflow: 'visible' }}
          width={natural.width}
          height={natural.height}
        >
          <text
            ref={textRef}
            x={0}
            y={natural.ascent}
            fontFamily='Anton, "Arial Narrow", Impact, sans-serif'
            fontStyle="italic"
            fontWeight={400}
            fontSize={fontSize}
            letterSpacing="-0.02em"
            fill={inkColor}
          >
            {text}
          </text>
        </svg>
      </div>
    </div>
  )
}
