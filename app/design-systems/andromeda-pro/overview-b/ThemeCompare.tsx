'use client'

// The light/dark compare stage: one bento of Andromeda Pro components rendered
// twice, dark underneath and light on top, with the top layer clipped at the
// divider. One line crosses every tile at once.
//
// THEME PINNING. Each layer carries its OWN full --at-* set as inline custom
// properties, so neither layer reads the root. That matters because the page's
// AndromedaThemeWrap writes the LIGHT set onto documentElement when the site is
// light: a dark layer that relied on the var() fallbacks would inherit that
// write and turn light too. Only pure-CSS components go on the stage; canvas,
// chart and Object components re-resolve from documentElement and would ignore
// a layer's local set.

import { useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion'
import { DotsSixVertical } from '@phosphor-icons/react'
import { andromedaLightVars, andromedaVars } from '../../../lib/andromeda-pro-helpers.generated'
import { CompareBento } from './CompareBento'

const AT_VAR = /^var\((--at-[a-z0-9-]+), (.*)\)$/

function readThemeMaps() {
  // The dark set is the authored one, carried as the fallback of every
  // var(--at-<name>, <dark literal>) that andromedaVars() emits.
  const dark: Record<string, string> = {}
  for (const value of Object.values(andromedaVars() as Record<string, string>)) {
    const m = AT_VAR.exec(String(value))
    if (m) dark[m[1]] = m[2]
  }
  const light = andromedaLightVars() as Record<string, string>
  // A name only the light set carries has no dark literal to pin. `initial`
  // makes it the guaranteed-invalid value, so the component's own var() falls
  // back to its authored dark literal instead of inheriting the root's write.
  const darkPinned: Record<string, string> = { ...dark }
  for (const name of Object.keys(light)) if (!(name in darkPinned)) darkPinned[name] = 'initial'
  return { dark, darkPinned, light }
}

const { darkPinned: DARK_VARS, light: LIGHT_VARS } = readThemeMaps()

const LAYER_GROUND: CSSProperties = { background: 'var(--at-surface-base)', color: 'var(--at-text-primary)' }
const DARK_LAYER = { ...DARK_VARS, ...LAYER_GROUND } as CSSProperties
const LIGHT_LAYER = { ...LIGHT_VARS, ...LAYER_GROUND } as CSSProperties

const STEP = 5
const BIG_STEP = 10
// Sideways travel, in px, before a touch on the stage counts as a drag.
const SLOP = 6
// Half the grip's 44px hit area.
const GRIP_HALF = 22
const clamp = (v: number) => Math.min(100, Math.max(0, v))

const LINE_SHADOW = 'shadow-[0_1px_2px_rgba(0,0,0,0.30),0_4px_12px_rgba(0,0,0,0.25)]'

export function ThemeCompare() {
  const descId = useId()
  const pos = useMotionValue(50)
  const [now, setNow] = useState(50)
  useMotionValueEvent(pos, 'change', (v) => setNow(Math.round(v)))

  const clipPath = useTransform(pos, (v) => `inset(0 0 0 ${v}%)`)
  const left = useTransform(pos, (v) => `${v}%`)
  const darkLabelOpacity = useTransform(pos, [4, 20], [0, 1])
  const lightLabelOpacity = useTransform(pos, [80, 96], [1, 0])

  // The grip rides the line but stays a full hit area inside the stage at both
  // ends, so it and its focus ring are never half clipped.
  const gripLeft = useTransform(pos, (v) => `clamp(${GRIP_HALF}px, ${v}%, calc(100% - ${GRIP_HALF}px))`)

  const areaRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const pending = useRef<{ id: number; x: number; y: number } | null>(null)
  const touched = useRef(false)
  // No intro sweep. The line used to run itself left and right on first
  // scroll to explain the gesture; it read as the page glitching, so the
  // control is silent now and only ever moves under the pointer.
  const takeOver = () => {
    touched.current = true
  }

  const moveTo = (clientX: number) => {
    const el = areaRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    if (!r.width) return
    pos.set(clamp(((clientX - r.left) / r.width) * 100))
  }

  const startDrag = (e: PointerEvent<HTMLDivElement>) => {
    pending.current = null
    takeOver()
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    moveTo(e.clientX)
  }

  // Mouse, or any press on the grip: the line jumps there and follows the
  // drag. Touch and pen elsewhere on the stage wait until the gesture is
  // clearly sideways, so a vertical scroll through the section never moves
  // the line.
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const onGrip = e.target instanceof Element && e.target.closest('[role="slider"]') !== null
    if (e.pointerType === 'mouse' || onGrip) startDrag(e)
    else pending.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) {
      moveTo(e.clientX)
      return
    }
    const p = pending.current
    if (!p || p.id !== e.pointerId) return
    const dx = Math.abs(e.clientX - p.x)
    const dy = Math.abs(e.clientY - p.y)
    if (dx > SLOP && dx > dy) startDrag(e)
    else if (dy > SLOP) pending.current = null
  }
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    pending.current = null
    dragging.current = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }
  // A touch tap that never became a drag or a scroll: the line jumps to it.
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (pending.current?.id === e.pointerId) {
      takeOver()
      moveTo(e.clientX)
    }
    endDrag(e)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? BIG_STEP : STEP
    let next: number | null = null
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = pos.get() - step
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = pos.get() + step
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = 100
    if (next === null) return
    e.preventDefault()
    takeOver()
    pos.set(clamp(next))
  }

  // Built once: the per-frame re-render (aria-valuenow) hands React the same
  // element, so the two bento copies never re-render while the line moves.
  const bento = useMemo(() => <CompareBento />, [])

  return (
    <div>
      <div
        className="rounded-2xl border border-sand-200 bg-sand-100 p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.10)] dark:border-sand-800 dark:bg-sand-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.40),0_12px_32px_rgba(0,0,0,0.55)]"
      >
        <p id={descId} className="sr-only">
          Andromeda Pro components shown side by side in the dark and light themes
        </p>
        <div aria-hidden className="flex items-center justify-between px-1 pb-3">
          <motion.span
            style={{ opacity: darkLabelOpacity }}
            className="text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400"
          >
            Dark
          </motion.span>
          <motion.span
            style={{ opacity: lightLabelOpacity }}
            className="text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400"
          >
            Light
          </motion.span>
        </div>

        <div
          ref={areaRef}
          className="relative cursor-ew-resize select-none overflow-hidden rounded-xl"
          style={{ touchAction: 'pan-y' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={endDrag}
        >
          <div inert aria-hidden className="pointer-events-none" style={DARK_LAYER}>
            {bento}
          </div>
          <motion.div inert aria-hidden className="pointer-events-none absolute inset-0" style={{ clipPath }}>
            <div className="h-full" style={LIGHT_LAYER}>
              {bento}
            </div>
          </motion.div>

          <motion.div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 z-10 w-px -translate-x-1/2 bg-sand-50/80 ${LINE_SHADOW}`}
            style={{ left }}
          />
          <motion.div
            role="slider"
            tabIndex={0}
            aria-label="Compare light and dark themes"
            aria-describedby={descId}
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={now}
            aria-valuetext={`${now} percent dark, ${100 - now} percent light`}
            onKeyDown={onKeyDown}
            onFocus={takeOver}
            className="group absolute top-1/2 z-20 flex size-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center outline-none"
            style={{ left: gripLeft }}
          >
            <span
              className={`flex h-10 w-3 items-center justify-center rounded-full bg-sand-50 text-sand-950 ${LINE_SHADOW} group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-olive-500`}
            >
              <DotsSixVertical weight="regular" className="size-4 shrink-0" />
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
