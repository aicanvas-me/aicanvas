'use client'

// The three live wells inside the homepage's Andromeda Pro window. Each one is
// a small Andromeda root painted from Pro's own tokens, never the site chrome,
// so what a visitor sees here is the system itself. Loaded lazily through
// ./AndromedaProIslands, so none of this lands in the homepage's first load.
//
// THEME PINNING. Every well spreads its own full --at-* set, the same way the
// overview's compare stage does, so a light site theme can never repaint the
// dark well and the light layer never reads the root.

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from 'framer-motion'
import { DotsSixVertical } from '@phosphor-icons/react'
import {
  Badge,
  Button,
  ProgressBar,
  SegmentedControl,
  Slider,
  Toggle,
  tokens,
} from '../lib/andromeda-pro.generated'
import { andromedaLightVars, andromedaVars } from '../lib/andromeda-pro-helpers.generated'

const AT_VAR = /^var\((--at-[a-z0-9-]+), (.*)\)$/

// The dark set is the authored one: every value andromedaVars() emits is
// var(--at-<name>, <dark literal>). A name only the light set carries is pinned
// to `initial` so the dark layer never inherits a light write from above.
function readThemeMaps() {
  const emitted = andromedaVars() as Record<string, string>
  const dark: Record<string, string> = {}
  for (const value of Object.values(emitted)) {
    const m = AT_VAR.exec(String(value))
    if (m) dark[m[1]] = m[2]
  }
  const light = andromedaLightVars() as Record<string, string>
  for (const name of Object.keys(light)) if (!(name in dark)) dark[name] = 'initial'
  return { emitted, dark, light }
}

const { emitted: EMITTED, dark: DARK_AT, light: LIGHT_AT } = readThemeMaps()

const WELL_GROUND: CSSProperties = {
  background: 'var(--andromeda-surface-base)',
  color: 'var(--andromeda-text-primary)',
  fontFamily: tokens.typography.fontSans,
}
const DARK_WELL = { ...EMITTED, ...DARK_AT, ...WELL_GROUND } as CSSProperties
const LIGHT_WELL = { ...EMITTED, ...LIGHT_AT, ...WELL_GROUND } as CSSProperties

const MONO: CSSProperties = { fontFamily: tokens.typography.fontMono }

function Well({ children, style = DARK_WELL }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-4" style={style}>
      {children}
    </div>
  )
}

// ─── Token driven ─────────────────────────────────────────────────────────────
// One primitive ramp swapped, and every semantic role that points at it
// follows: the button fill, the badge, the progress mark. The swap is computed,
// not authored: any emitted variable whose dark value is a brand stop is
// re-pointed at the same stop of the next ramp.

type Ramp = Record<string, string>
const COLOR = tokens.color as unknown as Record<string, Ramp>
const RAMP_KEYS = ['100', '200', '300', '400', '500', 'alpha', 'alphaStrong']
const RAMPS = [
  { name: 'brand', ramp: COLOR.brand },
  { name: 'success', ramp: COLOR.success },
  { name: 'warning', ramp: COLOR.warning },
]

function retint(to: Ramp): CSSProperties {
  const from = COLOR.brand
  const byValue = new Map(RAMP_KEYS.map((k) => [from[k], to[k]]))
  const out: Record<string, string> = {}
  for (const [name, value] of Object.entries(EMITTED)) {
    const m = AT_VAR.exec(String(value))
    const swap = m ? byValue.get(m[2]) : undefined
    if (swap) out[name] = swap
  }
  return out as CSSProperties
}

const RETINTS = RAMPS.map((r) => ({ name: r.name, ramp: r.ramp, style: { ...DARK_WELL, ...retint(r.ramp) } }))
const HOLD_MS = 2600

export function TokenDemo() {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '120px' })

  useEffect(() => {
    if (reduce || !inView) return
    const t = setTimeout(() => setI((p) => (p + 1) % RETINTS.length), HOLD_MS)
    return () => clearTimeout(t)
  }, [i, reduce, inView])

  const current = RETINTS[i]
  return (
    <div ref={ref} aria-hidden inert className="h-full">
      <Well style={current.style}>
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[10px] uppercase tracking-wider" style={{ ...MONO, color: 'var(--andromeda-text-muted)' }}>
            {current.name}
          </span>
          <div className="flex flex-1 gap-1">
            {['100', '200', '300', '400', '500'].map((stop) => (
              <span
                key={stop}
                className="h-3.5 flex-1 transition-colors duration-500"
                style={{ background: current.ramp[stop], borderRadius: 2 }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">Deploy</Button>
          <Badge variant="accent">Live</Badge>
        </div>
        <ProgressBar label="Uplink" value={72} />
      </Well>
    </div>
  )
}

// ─── Dual themes ──────────────────────────────────────────────────────────────
// The same controls twice, dark underneath and light on top, with the light
// layer clipped at a line the visitor drags.

function ThemePanel() {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs" style={{ color: 'var(--andromeda-text-secondary)' }}>
          Telemetry
        </span>
        <Badge variant="success">Online</Badge>
      </div>
      <Toggle label="Autopilot" defaultChecked size="sm" />
      <ProgressBar label="Buffer" value={62} />
    </>
  )
}

const clamp = (v: number) => Math.min(100, Math.max(0, v))

export function ThemeDemo() {
  const pos = useMotionValue(50)
  const [now, setNow] = useState(50)
  useMotionValueEvent(pos, 'change', (v) => setNow(Math.round(v)))
  const clipPath = useTransform(pos, (v) => `inset(0 0 0 ${v}%)`)
  const left = useTransform(pos, (v) => `${v}%`)
  const areaRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const moveTo = (clientX: number) => {
    const r = areaRef.current?.getBoundingClientRect()
    if (r?.width) pos.set(clamp(((clientX - r.left) / r.width) * 100))
  }
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    moveTo(e.clientX)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) moveTo(e.clientX)
  }
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <div
      ref={areaRef}
      className="relative h-full cursor-ew-resize select-none overflow-hidden"
      style={{ touchAction: 'pan-y' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div inert aria-hidden className="pointer-events-none h-full">
        <Well>
          <ThemePanel />
        </Well>
      </div>
      <motion.div inert aria-hidden className="pointer-events-none absolute inset-0" style={{ clipPath }}>
        <Well style={LIGHT_WELL}>
          <ThemePanel />
        </Well>
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 z-10 w-px -translate-x-1/2 bg-sand-50/80"
        style={{ left }}
      />
      <motion.div
        role="slider"
        tabIndex={0}
        aria-label="Compare light and dark themes"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={now}
        aria-valuetext={`${now} percent dark, ${100 - now} percent light`}
        onKeyDown={(e) => {
          const step = e.key === 'ArrowLeft' ? -10 : e.key === 'ArrowRight' ? 10 : 0
          if (!step) return
          e.preventDefault()
          pos.set(clamp(pos.get() + step))
        }}
        className="group absolute top-1/2 z-20 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center outline-none"
        style={{ left }}
      >
        <span className="flex h-8 w-3 items-center justify-center rounded-full bg-sand-50 text-sand-950 shadow-[0_1px_2px_rgba(0,0,0,0.30),0_4px_12px_rgba(0,0,0,0.25)] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-olive-500">
          <DotsSixVertical weight="regular" className="size-3.5 shrink-0" />
        </span>
      </motion.div>
    </div>
  )
}

// ─── Premium interactions ─────────────────────────────────────────────────────
// Real, pressable controls: the segment indicator slides, the slider drags,
// the button answers the press. Nothing here is a recording.

const RANGES = [
  { value: '1h', label: '1H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
]

export function InteractionDemo() {
  const [range, setRange] = useState('24h')
  return (
    <Well>
      <SegmentedControl size="sm" value={range} onChange={setRange} options={RANGES} ariaLabel="Time range" />
      <Slider label="Gain" defaultValue={64} showValue unit="%" />
      <div className="flex items-center gap-2">
        <Button size="sm">Apply</Button>
        <Button size="sm" variant="ghost">
          Reset
        </Button>
      </div>
    </Well>
  )
}
