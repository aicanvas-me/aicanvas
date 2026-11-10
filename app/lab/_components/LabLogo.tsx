'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'

// Pixel-art grids for "lab". 1 = circle, 0 = empty.

// ── Tall variant — 11 rows, used on the hero ───────────────────────────────

// l — 3 cols, ascender
const L_GRID: number[][] = [
  [1, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [1, 1, 1],
]

// a — 5 cols, x-height only (top rows empty)
const A_GRID: number[][] = [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 0, 1],
  [0, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 1],
]

// b — 5 cols, ascender
const B_GRID: number[][] = [
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 1, 1, 1, 0],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 0],
]

// ── Compact variant — 7 rows, used in the header badge ─────────────────────

const L_COMPACT: number[][] = [
  [1, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [1, 1, 1],
]

const A_COMPACT: number[][] = [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 0, 1],
  [0, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 1],
]

const B_COMPACT: number[][] = [
  [1, 0, 0, 0],
  [1, 0, 0, 0],
  [1, 1, 1, 0],
  [1, 0, 0, 1],
  [1, 0, 0, 1],
  [1, 0, 0, 1],
  [1, 1, 1, 0],
]

const TALL_LETTERS = [L_GRID, A_GRID, B_GRID]
const COMPACT_LETTERS = [L_COMPACT, A_COMPACT, B_COMPACT]

type Dot = { col: number; row: number; key: string }
type Bubble = {
  id: number
  left: number
  top: number
  size: number
  drift: number
  duration: number
}

function buildLayout(letters: number[][][], letterGap: number) {
  const dots: Dot[] = []
  const topRowByCol = new Map<number, number>()
  let xOffset = 0
  letters.forEach((grid, letterIdx) => {
    const w = grid[0].length
    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          const col = xOffset + c
          dots.push({ col, row: r, key: `${letterIdx}-${c}-${r}` })
          const cur = topRowByCol.get(col)
          if (cur === undefined || r < cur) topRowByCol.set(col, r)
        }
      })
    })
    xOffset += w + letterGap
  })
  const cols = xOffset - letterGap
  const rows = letters[0].length
  return { dots, cols, rows, topCols: Array.from(topRowByCol.entries()) }
}

type LabLogoProps = {
  pixel?: number
  gap?: number
  letterGap?: number
  bubbleHeadRoom?: number
  assemblyDuration?: number
  bubbleMinDelay?: number
  bubbleMaxDelay?: number
  bubbles?: boolean
  variant?: 'tall' | 'compact'
  idleAnimation?: boolean
  /**
   * Skip the dot-cascade assembly animation and render every dot at its
   * settled state from the first frame. Useful in navbar usage where the
   * mark should read as a static logo, not as a one-time intro.
   */
  noAssembly?: boolean
}

export function LabLogo({
  pixel = 14,
  gap = 4,
  letterGap = 1,
  bubbleHeadRoom = 70,
  assemblyDuration = 2.0,
  bubbleMinDelay = 750,
  bubbleMaxDelay = 2650,
  bubbles: bubblesEnabled = true,
  variant = 'tall',
  idleAnimation = false,
  noAssembly = false,
}: LabLogoProps = {}) {
  const step = pixel + gap
  const letters = variant === 'compact' ? COMPACT_LETTERS : TALL_LETTERS
  const { dots, cols, rows, topCols } = useMemo(
    () => buildLayout(letters, letterGap),
    [letters, letterGap]
  )
  const widthPx = (cols - 1) * step + pixel
  const lettersHeightPx = (rows - 1) * step + pixel
  const effectiveHeadRoom = bubblesEnabled ? bubbleHeadRoom : 0
  const totalHeightPx = lettersHeightPx + effectiveHeadRoom

  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const nextId = useRef(0)

  // Idle: continuously spawn random dot lifts. Up to 4 can overlap at once.
  // Each picked dot rises + fades, then reappears in place by opacity 0→1
  // (no downward motion on the return).
  type ActiveDot = { lift: number; duration: number; cycleId: number }
  const [activeDots, setActiveDots] = useState<Map<string, ActiveDot>>(
    () => new Map()
  )
  const idleCycleRef = useRef(0)

  useEffect(() => {
    if (!idleAnimation) return
    let cancelled = false
    let spawnTimer: ReturnType<typeof setTimeout> | null = null

    // Only animate dots in the upper half of the grid AND only from letters
    // A (letterIdx 1) and B (letterIdx 2). L (letterIdx 0) stays still.
    const upperDots = dots.filter(
      (d) => d.row < rows / 2 && !d.key.startsWith('0-')
    )
    if (upperDots.length === 0) return

    const spawn = () => {
      if (cancelled) return
      setActiveDots((curr) => {
        if (curr.size >= 4) return curr
        const d = upperDots[Math.floor(Math.random() * upperDots.length)]
        if (curr.has(d.key)) return curr
        const next = new Map(curr)
        next.set(d.key, {
          lift: pixel * (1.4 + Math.random() * 2.0),
          duration: 2.6 + Math.random() * 3.0,
          cycleId: ++idleCycleRef.current,
        })
        return next
      })
      spawnTimer = setTimeout(spawn, 380 + Math.random() * 1100)
    }

    const start = setTimeout(spawn, assemblyDuration * 1000 + 800)
    return () => {
      cancelled = true
      clearTimeout(start)
      if (spawnTimer) clearTimeout(spawnTimer)
    }
  }, [idleAnimation, dots, rows, pixel, assemblyDuration])

  const clearActiveDot = (key: string) => {
    setActiveDots((curr) => {
      if (!curr.has(key)) return curr
      const next = new Map(curr)
      next.delete(key)
      return next
    })
  }

  useEffect(() => {
    if (!bubblesEnabled) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const spawn = () => {
      if (cancelled) return
      const [col, topRow] = topCols[Math.floor(Math.random() * topCols.length)]
      const left = col * step + pixel / 2
      const top = effectiveHeadRoom + topRow * step + pixel / 2
      const size = pixel * 0.45 + Math.random() * pixel * 0.45
      const drift = (Math.random() - 0.5) * pixel * 2
      const duration = 2.4 + Math.random() * 1.2
      const id = nextId.current++
      setBubbles((b) => [...b, { id, left, top, size, drift, duration }])
      const delay = bubbleMinDelay + Math.random() * (bubbleMaxDelay - bubbleMinDelay)
      timer = setTimeout(spawn, delay)
    }

    const start = setTimeout(spawn, assemblyDuration * 1000 + 250)
    return () => {
      cancelled = true
      clearTimeout(start)
      if (timer) clearTimeout(timer)
    }
  }, [
    bubblesEnabled,
    topCols,
    step,
    pixel,
    effectiveHeadRoom,
    assemblyDuration,
    bubbleMinDelay,
    bubbleMaxDelay,
  ])

  return (
    <div
      className="relative"
      style={{ width: widthPx, height: totalHeightPx }}
      aria-hidden="true"
    >
      {dots.map((d, i) => {
        const active = activeDots.get(d.key)
        return (
          <motion.span
            key={d.key}
            className="absolute rounded-full bg-accent"
            style={{
              width: pixel,
              height: pixel,
              left: d.col * step,
              top: effectiveHeadRoom + d.row * step,
            }}
            initial={
              noAssembly
                ? false
                : {
                    opacity: 0,
                    scale: 0.2,
                    y: -40 - Math.random() * 80,
                    x: (Math.random() - 0.5) * 12,
                  }
            }
            animate={
              active
                ? {
                    opacity: [1, 1, 0, 0, 1],
                    y: [0, -active.lift, -active.lift, 0, 0],
                    scale: 1,
                    x: 0,
                  }
                : { opacity: 1, scale: 1, y: 0, x: 0 }
            }
            transition={
              active
                ? {
                    duration: active.duration,
                    times: [0, 0.45, 0.55, 0.7, 1],
                    ease: 'easeOut',
                  }
                : noAssembly
                  ? { duration: 0 }
                  : {
                      delay:
                        (i / dots.length) * (assemblyDuration - 0.55) +
                        Math.random() * 0.18,
                      duration: 0.55,
                      ease: [0.2, 0.7, 0.2, 1],
                    }
            }
            onAnimationComplete={() => {
              if (active) clearActiveDot(d.key)
            }}
          />
        )
      })}

      {bubbles.map((b) => (
        <motion.span
          key={b.id}
          className="absolute rounded-full bg-accent"
          style={{
            width: b.size,
            height: b.size,
            left: b.left - b.size / 2,
            top: b.top - b.size / 2,
          }}
          initial={{ opacity: 0, y: 0, x: 0, scale: 0.4 }}
          animate={{
            opacity: [0, 0.85, 0.85, 0],
            y: -(effectiveHeadRoom + 4),
            x: b.drift,
            scale: 1,
          }}
          transition={{
            duration: b.duration,
            times: [0, 0.2, 0.7, 1],
            ease: 'easeOut',
          }}
          onAnimationComplete={() => {
            setBubbles((curr) => curr.filter((x) => x.id !== b.id))
          }}
        />
      ))}
    </div>
  )
}
