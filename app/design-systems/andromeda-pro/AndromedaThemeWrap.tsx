'use client'

// Light/dark wrap for the Andromeda PREVIEW surfaces (the /system/preview
// matrix and the per-component pages). This is the consumer of the theme
// channel: `andromedaVars()` emits every colour as var(--at-<name>, <dark>),
// so defining the --at-* set retints every Andromeda root — no component
// edits, and the site chrome keeps NO relation to this toggle (plan ruling:
// the Andromeda theme is the design system's own axis, not the site's; sand
// chrome never reads an --at- var, so root-level vars cannot touch it).
//
// The set lands on documentElement, NOT on a mid-tree div, because that is
// the system's swap contract: the Objects and useResolvedVars observe the
// root's class/style/data-theme and re-resolve their canvas ink from computed
// style. A mid-tree wrapper retints the pure-CSS var() chains but fires no
// observer, so canvases and charts silently keep the old palette.

import { createContext, useContext, useEffect, useId, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Moon, Palette, Sun } from '@phosphor-icons/react'
import { tokens } from '../../lib/andromeda-v2.generated'
import { ANDROMEDA_PALETTES, andromedaLightVars, andromedaVars } from '../../lib/andromeda-v2-helpers.generated'

type AndromedaTheme = 'dark' | 'light'

const ThemeCtx = createContext<{
  theme: AndromedaTheme
  setTheme: (t: AndromedaTheme) => void
  knobs: Knobs
  setKnobs: (next: Knobs | ((k: Knobs) => Knobs)) => void
  palette: string
  setPalette: (name: string) => void
  dockOpen: boolean
  setDockOpen: (next: boolean | ((o: boolean) => boolean)) => void
} | null>(null)

// 'current' is the live token set. Every other name is a frozen snapshot from
// the vault (_tools/snapshot-palette.mjs), so a named version can be put back
// on screen without touching a single token.
const LIVE = 'current'
const DOCK_STORE = 'andromeda-theme-dock'
const PALETTE_NAMES: string[] = [LIVE, ...Object.keys(ANDROMEDA_PALETTES ?? {})]

// `className` lets a caller decide what box the carrier div is. The template
// pages pass `contents`: their shell is a percentage-height flex item of the
// Andromeda layout row, and a plain div in between breaks that chain, so the
// template's own scroll region never gets a bounded height.
export function AndromedaThemeWrap({ children, className }: { children: ReactNode; className?: string }) {
  const [theme, setTheme] = useState<AndromedaTheme>('dark')
  const [knobs, setKnobs] = useState<Knobs>(DEFAULTS)
  const [palette, setPalette] = useState<string>(LIVE)
  const [dockOpen, setDockOpen] = useState(false)

  // The dock remembers itself. It is a tool you leave open across a whole
  // afternoon of looking, and it used to reset on every navigation because all
  // of its state was React state. Restored on mount, never during render: a
  // value read from storage while rendering would not match the server's HTML.
  // Theme is deliberately NOT persisted — that control ships to visitors, and
  // what it remembers is a product decision, not a tooling one.
  useEffect(() => {
    if (!DEV_ONLY) return
    try {
      const saved = JSON.parse(window.localStorage.getItem(DOCK_STORE) ?? 'null')
      if (!saved) return
      if (typeof saved.open === 'boolean') setDockOpen(saved.open)
      if (typeof saved.palette === 'string') setPalette(saved.palette)
      if (saved.knobs) setKnobs({ ...DEFAULTS, ...saved.knobs })
    } catch {
      // Private windows, blocked site data, a half-written value: the dock
      // opens at its defaults rather than taking the page down with it.
    }
  }, [])

  useEffect(() => {
    if (!DEV_ONLY) return
    try {
      window.localStorage.setItem(
        DOCK_STORE,
        JSON.stringify({ open: dockOpen, palette, knobs }),
      )
    } catch {
      // Storage full or refused. Losing the memory is not worth an error.
    }
  }, [dockOpen, palette, knobs])

  // ONE writer for the whole --at- set. The palette tuner sets knobs and this
  // effect re-emits; a second effect writing the same properties would race
  // this one on every theme flip and a reset would strip the light set with it.
  useEffect(() => {
    const tuned = isTuned(knobs)
    const snapshot = palette === LIVE ? null : ANDROMEDA_PALETTES?.[palette]
    // Dark, untuned and on the live palette is the authored set, which the
    // var() fallbacks already resolve to. Emitting nothing keeps it identical.
    if (theme !== 'light' && !tuned && !snapshot) return
    const root = document.documentElement
    // A snapshot replaces the base outright: it IS a resolved set, so the
    // knobs still apply on top and a version can be tuned like any other.
    const base = (snapshot?.[theme] as Record<string, string> | undefined) ?? baseSet(theme)
    const names = Object.keys(base)
    for (const name of names) {
      root.style.setProperty(name, tuned ? retint(base[name], knobs) : base[name])
    }
    if (theme === 'light') root.setAttribute('data-andromeda-theme', 'light')
    return () => {
      for (const name of names) root.style.removeProperty(name)
      root.removeAttribute('data-andromeda-theme')
    }
  }, [theme, knobs, palette])

  return (
    <ThemeCtx.Provider
      value={{ theme, setTheme, knobs, setKnobs, palette, setPalette, dockOpen, setDockOpen }}
    >
      <div data-andromeda-theme={theme} className={className}>{children}</div>
      <AndromedaPaletteTuner />
    </ThemeCtx.Provider>
  )
}

// For page code OUTSIDE the DOM subtree (a portalled overlay): React context
// crosses a portal where CSS inheritance cannot, so the overlay reads the
// theme here and spreads the vars on its own root.
export function useAndromedaPreviewTheme() {
  return useContext(ThemeCtx)
}

const THEMES = [
  { key: 'light' as const, label: 'Light theme', icon: Sun },
  { key: 'dark' as const, label: 'Dark theme', icon: Moon },
]

// Site-chrome styled (sand), because it is page chrome ABOUT the design system,
// not design-system content. Renders nothing outside a wrap, so shared page
// shells can carry it unconditionally.
//
// Both themes are on the control and the current one is lit, the same shape as
// the Desktop/Mobile device toggle in the template top bar. A one-button switch
// that named the OTHER theme read as a label of the current state to half the
// people who saw it. The selected chip slides between the two on the site's own
// switch spring (app/components/Toggle.tsx).
export function AndromedaThemeToggle({ className = '', label }: { className?: string; label?: string }) {
  const ctx = useContext(ThemeCtx)
  // Instance-scoped: two toggles mounted at once (a page header and a portalled
  // overlay) would otherwise share one chip and animate it between them.
  const chipId = useId()
  if (!ctx) return null
  const { theme, setTheme } = ctx

  return (
    <div
      role="group"
      aria-label="Andromeda theme"
      className={`flex items-center gap-0.5 rounded-lg border border-sand-300 bg-sand-100 p-0.5 dark:border-sand-800 dark:bg-sand-900 ${className}`}
    >
      {label ? (
        <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-sand-500">
          {label}
        </span>
      ) : null}
      {THEMES.map(({ key, label: name, icon: Icon }) => {
        const active = theme === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => setTheme(key)}
            aria-label={name}
            aria-pressed={active}
            title={name}
            className={`relative flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              active
                ? 'text-sand-900 dark:text-sand-50'
                : 'text-sand-500 hover:text-sand-800 dark:text-sand-400 dark:hover:text-sand-100'
            }`}
          >
            {active ? (
              <motion.span
                aria-hidden
                layoutId={chipId}
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                className="absolute inset-0 rounded-md bg-sand-50 shadow-sm dark:bg-sand-800"
              />
            ) : null}
            <Icon weight="regular" size={16} className="relative" />
          </button>
        )
      })}
    </div>
  )
}

// The dock: the same control, floating bottom-right instead of pinned beside a
// heading. On a page whose whole content is specimens the switch belongs to the
// page, not to the section it happens to sit next to, and floating keeps it
// reachable at any scroll depth. Named Theme, because that is what it moves.
export function AndromedaThemeDock() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) return null
  return (
    <div className="fixed bottom-16 right-5 z-40 rounded-lg shadow-lg">
      <AndromedaThemeToggle label="Theme" />
    </div>
  )
}

// ── Palette tuner ───────────────────────────────────────────────────────────
// DEV ONLY. A colour experiment used to mean editing tokens.ts and rebuilding.
// Every value in this system is oklch and every colour already travels the
// --at- channel, so a palette can be explored in the browser instead: rotate a
// family's hue, scale its chroma, and the whole 13-stop neutral ladder and all
// five family stops move together with their LIGHTNESS UNTOUCHED. Lightness is
// what carries the contrast guarantees and the depth ordering, so keeping it
// fixed is what makes this safe to play with.
//
// Values are classified by what they ARE, not by their name: near-zero chroma
// is the neutral column, anything else belongs to the family whose hue it sits
// nearest. That way semantic vars (surface.raised, status.danger.text) follow
// their primitive without a name map to keep in sync.
const DEV_ONLY = process.env.NODE_ENV !== 'production'

const OKLCH = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(\/\s*[\d.]+\s*)?\)/g
const NEUTRAL_CHROMA_MAX = 0.02

type Family = 'brand' | 'success' | 'warning' | 'danger'
const FAMILY_ORDER: Family[] = ['brand', 'success', 'warning', 'danger']

// Each family's own hue, read off its mid stop rather than typed in, so this
// keeps working when the palette it is tuning changes underneath it.
function hueOf(value: string): number {
  OKLCH.lastIndex = 0
  const m = OKLCH.exec(String(value))
  return m ? Number(m[3]) : 0
}
const BASE_HUE: Record<Family, number> = {
  brand: hueOf(tokens.color.brand[300]),
  success: hueOf(tokens.color.success[300]),
  warning: hueOf(tokens.color.warning[300]),
  danger: hueOf(tokens.color.danger[300]),
}
const BASE_NEUTRAL_HUE = hueOf(tokens.color.neutral[100])

type Knobs = {
  hue: Record<Family, number>
  chroma: Record<Family, number>
  neutralHue: number
  neutralChroma: number
}
const NEUTRAL_BASE_CHROMA = 1
const DEFAULTS: Knobs = {
  hue: { ...BASE_HUE },
  chroma: { brand: 1, success: 1, warning: 1, danger: 1 },
  neutralHue: BASE_NEUTRAL_HUE,
  neutralChroma: NEUTRAL_BASE_CHROMA,
}

const isTuned = (k: Knobs) => JSON.stringify(k) !== JSON.stringify(DEFAULTS)

const arc = (a: number, b: number) => {
  const d = Math.abs(((a - b) % 360 + 360) % 360)
  return Math.min(d, 360 - d)
}

function familyOf(hue: number): Family {
  return FAMILY_ORDER.reduce((best, f) =>
    arc(hue, BASE_HUE[f]) < arc(hue, BASE_HUE[best]) ? f : best, FAMILY_ORDER[0])
}

// One value in, one value out. A gradient string carries several colours, so
// every oklch inside it is rewritten in place and the geometry is left alone.
function retint(value: string, k: Knobs): string {
  return String(value).replace(OKLCH, (whole, l, c, h, alpha) => {
    const chroma = Number(c)
    const hue = Number(h)
    const a = alpha ? ` ${alpha.trim()}` : ''
    if (chroma <= NEUTRAL_CHROMA_MAX) {
      return `oklch(${l} ${(chroma * k.neutralChroma).toFixed(3)} ${k.neutralHue.toFixed(1)}${a})`
    }
    const family = familyOf(hue)
    const next = Math.min(0.4, chroma * k.chroma[family])
    return `oklch(${l} ${next.toFixed(3)} ${k.hue[family].toFixed(1)}${a})`
  })
}

// The dark set lives inside andromedaVars() as each var's fallback; the light
// set is already a plain map. Either way this is the base the knobs transform.
function baseSet(theme: 'dark' | 'light'): Record<string, string> {
  if (theme === 'light') return andromedaLightVars() as Record<string, string>
  const out: Record<string, string> = {}
  for (const value of Object.values(andromedaVars())) {
    const m = /^var\((--at-[a-z0-9-]+), (.*)\)$/.exec(String(value))
    if (m) out[m[1]] = m[2]
  }
  return out
}

function Slider({
  label, value, min, max, step, onChange, readout,
}: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (n: number) => void; readout: string
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-10 shrink-0 text-[10px] uppercase tracking-wider text-sand-500">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 flex-1 cursor-pointer accent-olive-500"
      />
      <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-sand-500">{readout}</span>
    </label>
  )
}

export function AndromedaPaletteTuner() {
  const ctx = useContext(ThemeCtx)
  if (!DEV_ONLY || !ctx) return null
  const { theme, knobs, setKnobs, palette, setPalette, dockOpen: open, setDockOpen: setOpen } = ctx
  const touched = isTuned(knobs)

  const set = (patch: Partial<Knobs>) => setKnobs((k) => ({ ...k, ...patch }))
  const setFamily = (key: 'hue' | 'chroma', family: Family, n: number) =>
    setKnobs((k) => ({ ...k, [key]: { ...k[key], [family]: n } }))

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      {open ? (
        <div className="w-72 rounded-lg border border-sand-300 bg-sand-100 p-3 shadow-xl dark:border-sand-800 dark:bg-sand-900">
          {PALETTE_NAMES.length > 1 ? (
            <div className="mb-3 border-b border-sand-300 pb-3 dark:border-sand-800">
              <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-sand-500">
                Version
              </span>
              <div className="flex flex-wrap gap-1">
                {PALETTE_NAMES.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setPalette(name)}
                    className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                      palette === name
                        ? 'bg-sand-50 text-sand-900 shadow-sm dark:bg-sand-800 dark:text-sand-50'
                        : 'text-sand-500 hover:text-sand-800 dark:hover:text-sand-100'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <p className="mb-2 text-[10px] uppercase tracking-wider text-sand-500">
            Hue and chroma only. Lightness is what holds the contrast, so it never moves.
          </p>
          <div className="space-y-3">
            {FAMILY_ORDER.map((family) => (
              <div key={family} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-sm"
                    style={{ background: retint(tokens.color[family][300], knobs) }}
                  />
                  <span className="text-[11px] font-semibold capitalize text-sand-800 dark:text-sand-200">
                    {family}
                  </span>
                </div>
                <Slider
                  label="Hue" value={knobs.hue[family]} min={0} max={360} step={1}
                  onChange={(n) => setFamily('hue', family, n)}
                  readout={`${Math.round(knobs.hue[family])}`}
                />
                <Slider
                  label="Chroma" value={knobs.chroma[family]} min={0} max={2} step={0.05}
                  onChange={(n) => setFamily('chroma', family, n)}
                  readout={knobs.chroma[family].toFixed(2)}
                />
              </div>
            ))}
            <div className="space-y-1 border-t border-sand-300 pt-2 dark:border-sand-800">
              <span className="text-[11px] font-semibold text-sand-800 dark:text-sand-200">Neutrals</span>
              <Slider
                label="Hue" value={knobs.neutralHue} min={0} max={360} step={1}
                onChange={(n) => set({ neutralHue: n })}
                readout={`${Math.round(knobs.neutralHue)}`}
              />
              <Slider
                label="Tint" value={knobs.neutralChroma} min={0} max={6} step={0.1}
                onChange={(n) => set({ neutralChroma: n })}
                readout={knobs.neutralChroma.toFixed(1)}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setKnobs(DEFAULTS)}
              className="text-[11px] font-semibold text-sand-500 transition-colors hover:text-sand-800 dark:hover:text-sand-100"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => {
                const base = baseSet(theme)
                const out = Object.fromEntries(
                  Object.keys(base).map((n) => [n, retint(base[n], knobs)]),
                )
                navigator.clipboard?.writeText(JSON.stringify(out, null, 2))
              }}
              className="text-[11px] font-semibold text-olive-600 transition-colors hover:text-olive-500 dark:text-olive-400"
            >
              Copy values
            </button>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-lg border border-sand-300 bg-sand-100 px-3 text-xs font-semibold uppercase tracking-wider text-sand-600 shadow-lg transition-colors hover:text-sand-900 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-400 dark:hover:text-sand-100"
      >
        <Palette size={15} weight="regular" />
        Palette
        {palette !== LIVE ? <span className="text-[10px] normal-case text-olive-600 dark:text-olive-400">{palette}</span> : null}
        {touched ? <span className="h-1.5 w-1.5 rounded-full bg-olive-500" /> : null}
      </button>
    </div>
  )
}
