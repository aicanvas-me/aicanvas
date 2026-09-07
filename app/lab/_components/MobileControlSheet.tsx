'use client'

// Mobile bottom-sheet for LAB tool control panels. Canvas fills the screen;
// this sheet floats over the bottom with three snap points (peek / half / full).
// Drag the handle to move between snaps; flick to skip a snap. The body scrolls
// only when the sheet is at the full snap, so a half-open sheet acts like a
// glanceable summary instead of competing with the canvas for scroll.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useDragControls, useMotionValue, useTransform, animate } from 'framer-motion'

type Snap = 'peek' | 'half' | 'full'

// Sheet's own max height (top reaches this far from the bottom). Pixel offsets
// below are computed against this — y=0 means fully open.
const SHEET_HEIGHT_VH = 92
// Peek = handle + title visible. Half = "tune one knob without losing the
// canvas". Full = scroll the whole panel.
const SNAP_FRACTIONS: Record<Snap, number> = {
  peek: 0.10,
  half: 0.55,
  full: 1.0,
}
const ORDER: readonly Snap[] = ['peek', 'half', 'full'] as const

interface MobileControlSheetProps {
  children: ReactNode
}

export function MobileControlSheet({ children }: MobileControlSheetProps) {
  const [snap, setSnap] = useState<Snap>('peek')
  const [sheetHeight, setSheetHeight] = useState(0)
  // Start well off-screen so the first paint doesn't flash the sheet at its
  // full-open position before measurement lands. The first snap effect below
  // will then animate it up to the peek — a nice "slides up from below" entry.
  const y = useMotionValue(9999)
  const dragControls = useDragControls()
  const sheetRef = useRef<HTMLDivElement | null>(null)

  // Backdrop opacity: 0.4 when sheet is fully open, 0 once it's at the peek.
  // `clamp` keeps the off-screen entry from briefly producing a negative value
  // that some browsers paint as fully opaque.
  const backdropOpacity = useTransform(
    y,
    [0, Math.max(sheetHeight * 0.9, 1)],
    [0.4, 0],
    { clamp: true },
  )

  // Measure the sheet's rendered height so snap offsets are in real pixels
  // (vh math + dynamic viewports get fiddly on iOS Safari otherwise).
  useEffect(() => {
    if (!sheetRef.current) return
    const el = sheetRef.current
    const measure = () => setSheetHeight(el.getBoundingClientRect().height)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  // y for a given snap: full = 0, peek = (1 - 0.10) * height pushed down.
  const yForSnap = (s: Snap) => sheetHeight * (1 - SNAP_FRACTIONS[s])

  // Whenever the snap or measured height changes (orientation change, font
  // load shifting layout), spring back to the right offset.
  useEffect(() => {
    if (sheetHeight === 0) return
    const target = yForSnap(snap)
    const controls = animate(y, target, {
      type: 'spring',
      stiffness: 300,
      damping: 32,
      mass: 0.6,
    })
    return () => controls.stop()
    // y is a stable MotionValue; eslint can't see that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap, sheetHeight])

  // Flick threshold — higher than typical scroll drift, low enough that an
  // intentional swipe always skips a snap.
  const FLICK_VELOCITY = 500

  const onDragEnd = (_e: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    const currentY = y.get()
    const vy = info.velocity.y

    // Flick wins over position — a fast downward flick collapses even from
    // mid-screen; a fast upward flick expands even from near-peek.
    if (vy > FLICK_VELOCITY) {
      const idx = ORDER.indexOf(snap)
      setSnap(ORDER[Math.max(0, idx - 1)])
      return
    }
    if (vy < -FLICK_VELOCITY) {
      const idx = ORDER.indexOf(snap)
      setSnap(ORDER[Math.min(ORDER.length - 1, idx + 1)])
      return
    }

    // Otherwise, snap to the nearest target by absolute pixel distance.
    let nearest: Snap = 'peek'
    let nearestDist = Infinity
    for (const candidate of ORDER) {
      const dist = Math.abs(currentY - yForSnap(candidate))
      if (dist < nearestDist) {
        nearest = candidate
        nearestDist = dist
      }
    }
    setSnap(nearest)
  }

  return (
    <>
      {/* Backdrop — fades in once the sheet starts expanding past peek. Tap
          to collapse. Pointer-events off when fully transparent so the canvas
          stays interactive. */}
      <motion.div
        aria-hidden="true"
        onClick={() => setSnap('peek')}
        className="fixed inset-0 z-30 bg-black"
        style={{
          opacity: backdropOpacity,
          pointerEvents: snap === 'peek' ? 'none' : 'auto',
        }}
      />

      <motion.div
        ref={sheetRef}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: sheetHeight }}
        dragElastic={{ top: 0.05, bottom: 0.1 }}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        style={{ y, height: `${SHEET_HEIGHT_VH}vh` }}
        initial={false}
        className="fixed inset-x-0 bottom-0 z-40 flex flex-col rounded-t-2xl border-t border-sand-300 bg-sand-50 shadow-[0_-12px_40px_-8px_rgba(0,0,0,0.25)] dark:border-sand-700 dark:bg-sand-900"
      >
        {/* Drag affordance — the only region that initiates the drag, so the
            content area can scroll without yanking the whole sheet. */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          onClick={() => {
            // Tap-to-cycle as an accessibility shortcut for users who can't
            // drag (assistive input, mouse on touch-screen laptop, etc).
            const idx = ORDER.indexOf(snap)
            setSnap(ORDER[(idx + 1) % ORDER.length])
          }}
          className="flex shrink-0 cursor-grab touch-none flex-col items-center px-5 pb-2 pt-3 active:cursor-grabbing"
          role="button"
          tabIndex={0}
          aria-label={`Controls panel, ${snap} state. Tap or drag to resize.`}
        >
          <span className="h-1 w-10 rounded-full bg-sand-400 dark:bg-sand-600" />
        </div>

        {/* Content — only scrolls in the full snap so half-open doesn't fight
            with vertical scrolling. */}
        <div
          className={`flex-1 px-5 pb-8 ${snap === 'full' ? 'overflow-y-auto' : 'overflow-hidden'}`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </div>
      </motion.div>
    </>
  )
}

