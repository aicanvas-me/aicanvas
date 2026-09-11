'use client'

// ThemeCompare: one scene, painted twice, split by a draggable divider. Dark
// shows to the left of the divider and light to the right.
//
// HOW THE THEMES ARE PINNED. Andromeda Pro components read every colour as
// var(--at-<name>, <dark literal>). The page's AndromedaThemeWrap may already
// have written the LIGHT set onto documentElement (a visitor on the light site),
// so the dark half cannot lean on the fallbacks: it pins an explicit dark map,
// read out of those very fallbacks. The light half pins andromedaLightVars().
// Each half also paints its own ground, so neither inherits the root's theme.
// This retints pure-CSS components only; a scene must never contain a canvas,
// chart or Object (they resolve their ink from documentElement).
//
// Both copies are inert and aria-hidden: the stage owns the pointer, the grip
// owns the keyboard, so a click inside the scene never fights the drag.
//
// `mode="tilted"` leans the frame back 12deg and flattens it as it scrolls into
// place. `mode="flat"` is the same control without the lean.
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type AnimationPlaybackControls,
} from 'framer-motion'
import { ArrowsHorizontal } from '@phosphor-icons/react'
import { andromedaLightVars, andromedaVars } from '../../../lib/andromeda-pro-helpers.generated'

// ── The two pinned token sets, built once ───────────────────────────
const AT_FALLBACK = /^var\((--at-[a-z0-9-]+), (.*)\)$/

const LIGHT_VARS = andromedaLightVars()

// The dark set is the authored one: each var(--at-x, <dark>) fallback IS the
// dark value, so group 2 of the match is the literal to pin. The pin covers
// every key either set names, so a key the light set adds later cannot leak a
// light root's value into the dark half. A light-only key has no dark literal
// (--at-selection-active-text today), so it pins `initial`: that drops the
// inherited value and the consumer's own var() fallback, the dark one, applies.
function pinnedDarkVars(): Record<string, string> {
  const dark: Record<string, string> = {}
  for (const value of Object.values(andromedaVars())) {
    const m = AT_FALLBACK.exec(String(value))
    if (m) dark[m[1]] = m[2]
  }
  const out: Record<string, string> = {}
  for (const name of new Set([...Object.keys(dark), ...Object.keys(LIGHT_VARS)])) {
    out[name] = dark[name] ?? 'initial'
  }
  return out
}

// The --andromeda-* definitions ride along so every part inside the layer
// (including one that does not spread them on its own root) reads the pinned
// --at-* set, and so the layer can paint its ground from the same names.
const ANDROMEDA_VARS = andromedaVars()
const PAINT = {
  background: 'var(--andromeda-surface-base)',
  color: 'var(--andromeda-text-primary)',
  fontFamily: 'var(--andromeda-font-sans)',
}
const DARK_LAYER_STYLE = { ...ANDROMEDA_VARS, ...pinnedDarkVars(), ...PAINT } as CSSProperties
const LIGHT_LAYER_STYLE = { ...ANDROMEDA_VARS, ...LIGHT_VARS, ...PAINT } as CSSProperties

// Two-layer drop shadow, lit from straight above, so the divider and grip read
// on both the dark and the light half.
const EDGE_SHADOW = '0 1px 2px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.35)'

const clamp = (v: number) => Math.min(100, Math.max(0, v))

type ThemeCompareProps = {
  scene: ReactNode
  mode?: 'tilted' | 'flat'
  introSweep?: boolean
  /** Accessible name of the grip. */
  label?: string
  /** Accessible name of the stage group. */
  stageLabel?: string
  /** Visually hidden description of what the stage shows. */
  description?: string
  darkLabel?: string
  lightLabel?: string
}

export function ThemeCompare({
  scene,
  mode = 'flat',
  introSweep = false,
  label = 'Compare light and dark themes',
  stageLabel = 'Andromeda Pro in light and dark',
  description,
  darkLabel = 'Dark',
  lightLabel = 'Light',
}: ThemeCompareProps) {
  const reduce = useReducedMotion()
  const descId = useId()

  const frameRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const gripRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLElement | null>(null)

  // ── Divider position: 0 = all light, 100 = all dark ─────────────
  const pos = useMotionValue(50)
  const [valueNow, setValueNow] = useState(50)
  useMotionValueEvent(pos, 'change', (v) => setValueNow(Math.round(v)))

  const clip = useTransform(pos, (v) => `inset(0 0 0 ${v}%)`)
  const left = useTransform(pos, (v) => `${v}%`)
  const darkLabelOpacity = useTransform(pos, [0, 12], [0, 1])
  const lightLabelOpacity = useTransform(pos, [88, 100], [1, 0])

  // ── Tilt ─────────────────────────────────────────────────────────
  // The page scrolls inside the Andromeda content column, not the window, so
  // the scroll source is that column. Declared BEFORE useScroll: layout
  // effects run in order, so the ref is set by the time useScroll reads it.
  useLayoutEffect(() => {
    scrollerRef.current =
      frameRef.current?.closest<HTMLElement>('.aic-page-scroll') ??
      (document.scrollingElement as HTMLElement | null) ??
      document.documentElement
  }, [])

  // Flat and sharp by the time the stage is 40 percent up the viewport.
  const { scrollYProgress } = useScroll({
    target: frameRef,
    container: scrollerRef,
    offset: ['start end', 'start 0.6'],
  })
  const rotateX = useTransform(scrollYProgress, [0, 1], [12, 0])

  // No tilt on phones: a leaning plane at 400px wide only blurs the scene.
  const [wide, setWide] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const sync = () => setWide(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  const tilted = mode === 'tilted' && !reduce && wide

  // ── Intro sweep: once, the first time the stage is half in view ──
  const inView = useInView(stageRef, { amount: 0.5, once: true })
  const introRef = useRef<AnimationPlaybackControls | null>(null)
  const touchedRef = useRef(false)
  const playedRef = useRef(false)
  useEffect(() => {
    if (!introSweep || !inView || reduce || touchedRef.current || playedRef.current) return
    playedRef.current = true
    introRef.current = animate(pos, [50, 78, 22, 50], {
      duration: 2.4,
      ease: 'easeInOut',
      times: [0, 1 / 3, 2 / 3, 1],
    })
    return () => introRef.current?.stop()
  }, [introSweep, inView, reduce, pos])

  // Any input from the visitor ends the sweep for good.
  const takeOver = () => {
    touchedRef.current = true
    introRef.current?.stop()
    introRef.current = null
  }

  // ── Pointer: press anywhere, then drag ──────────────────────────
  const dragRef = useRef<{ id: number; touch: boolean; from: number } | null>(null)

  const setFromClientX = (clientX: number) => {
    const stage = stageRef.current
    if (!stage) return
    const r = stage.getBoundingClientRect()
    if (r.width === 0) return
    pos.set(clamp(((clientX - r.left) / r.width) * 100))
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    takeOver()
    const touch = e.pointerType === 'touch'
    dragRef.current = { id: e.pointerId, touch, from: pos.get() }
    e.currentTarget.setPointerCapture(e.pointerId)
    // Every press jumps the divider to the press point. A touch leaves the
    // default alone: touch-action pan-y still hands a vertical swipe to the
    // page, and onPointerCancel puts the divider back when it does.
    setFromClientX(e.clientX)
    if (!touch) {
      e.preventDefault()
      gripRef.current?.focus({ preventScroll: true })
    }
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.id !== e.pointerId) return
    setFromClientX(e.clientX)
  }

  // The browser cancels a touch it took for a page scroll. That swipe was never
  // meant for the divider, so it goes back to where the press found it.
  const onPointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (drag && drag.id === e.pointerId && drag.touch) pos.set(drag.from)
    endDrag(e)
  }

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.id !== e.pointerId) return
    dragRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  // ── Keyboard: the grip is the slider ─────────────────────────────
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 5
    const now = Math.round(pos.get())
    let next: number | null = null
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        next = now - step
        break
      case 'ArrowRight':
      case 'ArrowUp':
        next = now + step
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = 100
        break
    }
    if (next === null) return
    e.preventDefault()
    takeOver()
    pos.set(clamp(next))
  }

  return (
    <div style={tilted ? { perspective: 1200 } : undefined}>
      <motion.div
        ref={frameRef}
        // Origin at the bottom edge: the top recedes and the bottom stays at
        // full size, so the lean never grows wider than the content column.
        style={{ rotateX: tilted ? rotateX : 0, transformOrigin: 'center bottom' }}
        className="rounded-3xl border border-sand-200 bg-sand-100 p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.10)] dark:border-sand-800 dark:bg-sand-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.40),0_12px_32px_rgba(0,0,0,0.55)]"
      >
        <div
          ref={stageRef}
          role="group"
          aria-label={stageLabel}
          aria-describedby={description ? descId : undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={onPointerCancel}
          className="relative isolate cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-xl"
        >
          {description ? (
            <p id={descId} className="sr-only">
              {description}
            </p>
          ) : null}

          {/* Base layer: dark, in flow, sets the stage height. */}
          <div aria-hidden inert className="pointer-events-none select-none" style={DARK_LAYER_STYLE}>
            {scene}
          </div>

          {/* Top layer: light, clipped to the right of the divider. */}
          <motion.div
            aria-hidden
            inert
            className="pointer-events-none absolute inset-0 select-none"
            style={{ clipPath: clip }}
          >
            <div className="h-full" style={LIGHT_LAYER_STYLE}>
              {scene}
            </div>
          </motion.div>

          {/* Corner labels, fading out as the divider nears their edge. They sit
              in the BOTTOM corners on purpose: at the top they would cover the
              scene's title bar. A scene leaves bottom padding to keep them off
              its content. */}
          <motion.span
            aria-hidden
            style={{ opacity: darkLabelOpacity }}
            className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full bg-sand-950/70 px-2.5 py-1 text-xs font-semibold text-sand-50 backdrop-blur-sm"
          >
            {darkLabel}
          </motion.span>
          <motion.span
            aria-hidden
            style={{ opacity: lightLabelOpacity }}
            className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-full bg-sand-50/70 px-2.5 py-1 text-xs font-semibold text-sand-950 backdrop-blur-sm"
          >
            {lightLabel}
          </motion.span>

          {/* Divider line. */}
          <motion.div
            aria-hidden
            style={{ left, boxShadow: EDGE_SHADOW }}
            className="pointer-events-none absolute inset-y-0 z-10 w-px -translate-x-1/2 bg-sand-50/80"
          />

          {/* Grip: a 44px hit area around a 32px disc. */}
          <motion.div
            ref={gripRef}
            role="slider"
            tabIndex={0}
            aria-label={label}
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={valueNow}
            aria-valuetext={`${valueNow} percent dark`}
            onKeyDown={onKeyDown}
            style={{ left }}
            className="group absolute top-1/2 z-20 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none"
          >
            <span
              style={{ boxShadow: EDGE_SHADOW }}
              className="flex size-8 items-center justify-center rounded-full bg-sand-50 text-sand-950 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-olive-500"
            >
              <ArrowsHorizontal weight="regular" className="size-4" />
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
