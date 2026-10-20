'use client'
// npm install @phosphor-icons/react framer-motion

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Eraser, Signature } from '@phosphor-icons/react'

type Pt = { x: number; y: number; t: number }
type Stroke = Pt[]
type ButtonRect = { x: number; y: number; w: number; h: number }

const MIN_W = 1.1
const MAX_W = 2.6
const MORPH = { type: 'spring' as const, stiffness: 320, damping: 30, mass: 1 }

function widthForVelocity(prev: Pt, curr: Pt) {
  const d = Math.hypot(curr.x - prev.x, curr.y - prev.y)
  const dt = Math.max(1, curr.t - prev.t)
  const v = d / dt
  return Math.max(MIN_W, MAX_W - v * 0.55)
}



function buildPillPalette(isDark: boolean) {
  if (isDark) {
    return {
      pillBg: '#e0dfd8',
      pillHover: '#d4d3cc',
      pillText: '#1a1a18',
      iconTileBg: '#1a1a18',
      iconTileFg: '#f1f1f0',
    }
  }
  return {
    pillBg: '#1a1a18',
    pillHover: '#2d2d2b',
    pillText: '#f1f1f0',
    iconTileBg: '#f1f1f0',
    iconTileFg: '#1a1a18',
  }
}

const MODAL_PALETTE = {
  surfaceBg: '#f1f1f0',
  fieldBg: '#f8f8f8',
  fieldHover: '#ececec',
  labelColor: '#6c6c6c',
  titleColor: '#1a1a18',
  primaryBg: '#1a1a18',
  primaryFg: '#f2f1ec',
  inkColor: '#1a1a18',
  baselineColor: 'rgba(26,26,24,0.14)',
} as const

export default function SignaturePad() {
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [origin, setOrigin] = useState<ButtonRect | null>(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    const check = () => {
      const card = el?.closest('[data-card-theme]') as HTMLElement | null
      setIsDark(
        card
          ? card.classList.contains('dark')
          : document.documentElement.classList.contains('dark'),
      )
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    const card = el?.closest('[data-card-theme]')
    if (card) observer.observe(card, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const pill = buildPillPalette(isDark)

  function handleOpen() {
    if (buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect()
      setOrigin({ x: r.left, y: r.top, w: r.width, h: r.height })
    }
    setOpen(true)
  }

  function close() {
    setOpen(false)
  }

  return (
    <div
      ref={rootRef}
      className="flex min-h-screen w-full items-center justify-center p-6"
      style={{ backgroundColor: isDark ? '#1A1A19' : '#E8E8DF' }}
    >
      <motion.button
        ref={buttonRef}
        onClick={handleOpen}
        animate={{
          opacity: open ? 0 : 1,
          scale: open ? 0.85 : 1,
          backgroundColor: pill.pillBg,
        }}
        transition={
          open
            ? { duration: 0.18 }
            : { type: 'spring', stiffness: 400, damping: 28 }
        }
        whileHover={open ? {} : { scale: 1.03, backgroundColor: pill.pillHover }}
        whileTap={open ? {} : { scale: 0.97 }}
        style={{
          borderRadius: 9999,
          color: pill.pillText,
          boxShadow:
            '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
          pointerEvents: open ? 'none' : 'auto',
        }}
        className="flex items-center gap-3 py-2 pl-2 pr-5 font-sans text-[15px] font-semibold"
      >
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: pill.iconTileBg, color: pill.iconTileFg }}
        >
          <Signature size={18} weight="regular" />
        </span>
        Create your digital signature
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={close}
            className="fixed inset-0 z-40"
            style={{
              backgroundColor: 'rgba(0,0,0,0.28)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && origin && (
          <ModalCard key="modal" origin={origin} onClose={close} />
        )}
      </AnimatePresence>
    </div>
  )
}

function ModalCard({
  origin,
  onClose,
}: {
  origin: ButtonRect
  onClose: () => void
}) {
  const palette = MODAL_PALETTE
  const surfaceRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Stroke[]>([])
  const currentRef = useRef<Stroke>([])
  const drawingRef = useRef(false)
  const sizeRef = useRef({ w: 0, h: 0 })

  const [hasInk, setHasInk] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [today, setToday] = useState('')

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    )
  }, [])

  useEffect(() => {
    surfaceRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const drawSegment = useCallback(
    (stroke: Stroke) => {
      const canvas = canvasRef.current
      if (!canvas || stroke.length < 2) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const prev = stroke[stroke.length - 2]
      const curr = stroke[stroke.length - 1]
      const mid = { x: (prev.x + curr.x) / 2, y: (prev.y + curr.y) / 2 }
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = palette.inkColor
      ctx.lineWidth = widthForVelocity(prev, curr)
      ctx.beginPath()
      if (stroke.length === 2) {
        ctx.moveTo(prev.x, prev.y)
      } else {
        const prev2 = stroke[stroke.length - 3]
        const prevMid = { x: (prev2.x + prev.x) / 2, y: (prev2.y + prev.y) / 2 }
        ctx.moveTo(prevMid.x, prevMid.y)
      }
      ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y)
      ctx.stroke()
    },
    [palette.inkColor],
  )

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { w, h } = sizeRef.current
    ctx.clearRect(0, 0, w, h)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = palette.inkColor
    ctx.fillStyle = palette.inkColor

    for (const stroke of strokesRef.current) {
      if (stroke.length === 1) {
        const p = stroke[0]
        ctx.beginPath()
        ctx.arc(p.x, p.y, MIN_W, 0, Math.PI * 2)
        ctx.fill()
        continue
      }
      for (let i = 1; i < stroke.length; i++) {
        const prev = stroke[i - 1]
        const curr = stroke[i]
        const mid = { x: (prev.x + curr.x) / 2, y: (prev.y + curr.y) / 2 }
        ctx.lineWidth = widthForVelocity(prev, curr)
        ctx.beginPath()
        if (i === 1) {
          ctx.moveTo(prev.x, prev.y)
        } else {
          const prev2 = stroke[i - 2]
          const prevMid = { x: (prev2.x + prev.x) / 2, y: (prev2.y + prev.y) / 2 }
          ctx.moveTo(prevMid.x, prevMid.y)
        }
        ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y)
        ctx.stroke()
      }
    }
  }, [palette.inkColor])

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = canvasContainerRef.current
    if (!canvas || !container) return
    const dpr = window.devicePixelRatio || 1
    const width = container.clientWidth
    const height = container.clientHeight
    if (width === 0 || height === 0) return
    sizeRef.current = { w: width, h: height }
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    redrawAll()
  }, [redrawAll])

  useEffect(() => {
    setupCanvas()
    const ro = new ResizeObserver(setupCanvas)
    const el = canvasContainerRef.current
    if (el) ro.observe(el)
    return () => ro.disconnect()
  }, [setupCanvas])

  useEffect(() => {
    redrawAll()
  }, [redrawAll])

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>): Pt {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (confirming) return
    e.preventDefault()
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
    drawingRef.current = true
    const p = getPoint(e)
    currentRef.current = [p]
    strokesRef.current.push(currentRef.current)
    if (!hasInk) setHasInk(true)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    const p = getPoint(e)
    currentRef.current.push(p)
    drawSegment(currentRef.current)
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    drawingRef.current = false
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}
  }

  function clear() {
    strokesRef.current = []
    currentRef.current = []
    setHasInk(false)
    redrawAll()
  }

  function save() {
    if (!hasInk || confirming) return
    setConfirming(true)
    setTimeout(() => onClose(), 1100)
  }

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768
  const targetW = Math.min(480, vw - 32)
  const initialOffsetX = origin.x + origin.w / 2 - vw / 2
  const initialOffsetY = origin.y + origin.h / 2 - vh / 2
  const initialScaleX = origin.w / targetW

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        ref={surfaceRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signature-pad-title"
        tabIndex={-1}
        initial={{
          x: initialOffsetX,
          y: initialOffsetY,
          scaleX: initialScaleX,
          scaleY: 0.18,
          borderRadius: 9999,
          opacity: 0.85,
        }}
        animate={{
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          borderRadius: 28,
          opacity: 1,
        }}
        exit={{
          x: initialOffsetX,
          y: initialOffsetY,
          scaleX: initialScaleX,
          scaleY: 0.18,
          borderRadius: 9999,
          opacity: 0,
        }}
        transition={{
          default: MORPH,
          borderRadius: { duration: 0.32, ease: [0.32, 0.72, 0.34, 1] },
          opacity: { duration: 0.18 },
        }}
        style={{
          borderRadius: 28,
          willChange: 'transform, border-radius',
          backgroundColor: palette.surfaceBg,
          boxShadow: '0px 16px 56px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] px-6 pb-6 pt-6"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { delay: 0.18, staggerChildren: 0.055 },
            },
            exit: { opacity: 0, transition: { duration: 0.08 } },
          }}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: -6 },
              show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
            }}
            className="mb-5 flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: palette.fieldBg,
                  color: palette.titleColor,
                }}
              >
                <Signature size={20} weight="regular" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span
                  id="signature-pad-title"
                  className="font-sans text-[17px] font-bold leading-tight"
                  style={{ color: palette.titleColor }}
                >
                  Create your digital signature
                </span>
                <span
                  className="font-sans text-[13px] font-medium"
                  style={{ color: palette.labelColor }}
                >
                  Draw using your mouse or finger
                </span>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              aria-label="Close"
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.1, backgroundColor: palette.fieldHover }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              className="flex size-9 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: palette.fieldBg, color: palette.labelColor }}
            >
              <X size={16} weight="bold" />
            </motion.button>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
            }}
            className="relative mb-3"
          >
            <div
              ref={canvasContainerRef}
              className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px]"
              style={{ backgroundColor: palette.fieldBg }}
            >
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
                // touch-none: without it a finger drag scrolls the page instead of drawing.
                className="absolute inset-0 touch-none"
                style={{ cursor: confirming ? 'default' : 'crosshair' }}
              />
              <div
                className="pointer-events-none absolute inset-x-8 bottom-[28%] h-px"
                style={{ backgroundColor: palette.baselineColor }}
              />
              <AnimatePresence>
                {!hasInk && (
                  <motion.span
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="pointer-events-none absolute bottom-[31%] left-1/2 -translate-x-1/2 font-sans text-[13px] font-medium"
                    style={{ color: palette.labelColor, opacity: 0.7 }}
                  >
                    Sign here
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-2 flex h-7 items-center justify-between">
              <span
                className="font-sans text-[12px] font-medium tabular-nums"
                style={{ color: palette.labelColor, opacity: today ? 0.7 : 0 }}
              >
                {today || '—'}
              </span>
              <AnimatePresence>
                {hasInk && !confirming && (
                  <motion.button
                    key="clear"
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 6 }}
                    transition={{ duration: 0.18 }}
                    onClick={clear}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-1.5 rounded-full px-2 py-1 font-sans text-[13px] font-semibold"
                    style={{ color: palette.labelColor }}
                  >
                    <Eraser size={14} weight="regular" />
                    Clear
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
            }}
            className="flex items-center justify-end gap-2"
          >
            <motion.button
              onClick={onClose}
              disabled={confirming}
              whileHover={confirming ? {} : { scale: 1.04, backgroundColor: palette.fieldHover }}
              whileTap={confirming ? {} : { scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              className="rounded-full px-5 py-3 font-sans text-[15px] font-bold"
              style={{
                backgroundColor: palette.fieldBg,
                color: palette.titleColor,
                opacity: confirming ? 0.5 : 1,
              }}
            >
              Cancel
            </motion.button>
            <SaveButton
              hasInk={hasInk}
              confirming={confirming}
              onSave={save}
              primaryBg={palette.primaryBg}
              primaryFg={palette.primaryFg}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function SaveButton({
  hasInk,
  confirming,
  onSave,
  primaryBg,
  primaryFg,
}: {
  hasInk: boolean
  confirming: boolean
  onSave: () => void
  primaryBg: string
  primaryFg: string
}) {
  const enabled = hasInk && !confirming
  return (
    <motion.button
      onClick={onSave}
      disabled={!enabled}
      animate={{
        scale: confirming ? 0.96 : 1,
        opacity: hasInk || confirming ? 1 : 0.4,
      }}
      whileHover={enabled ? { scale: 1.05 } : {}}
      whileTap={enabled ? { scale: 0.96 } : {}}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      className="flex min-w-[148px] items-center justify-center rounded-full px-7 py-3 font-sans text-[15px] font-bold"
      style={{
        backgroundColor: primaryBg,
        color: primaryFg,
        cursor: enabled ? 'pointer' : 'not-allowed',
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {confirming ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="flex items-center justify-center"
          >
            <Check size={16} weight="bold" />
          </motion.span>
        ) : (
          <motion.span
            key="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            Save signature
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
