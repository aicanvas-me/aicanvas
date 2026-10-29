'use client'

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CaretDown, Warning } from '@phosphor-icons/react'
import { SHADE_MAX, SHADE_MIN, contrast, hexToOklch, normalizeHex, oklchToHex, type Oklch } from '../_lib/colour'
import { COLOUR_SWATCHES, DARK_PREVIEW_COLOUR, LIGHT_PREVIEW_COLOUR } from '../_lib/constants'

// No pick means the theme's own ink, drawn as a split disc: the colour icons
// take on a dark page and on a light one.
const THEME_DISC: CSSProperties = {
  background: `linear-gradient(135deg, ${DARK_PREVIEW_COLOUR} 50%, ${LIGHT_PREVIEW_COLOUR} 50%)`,
}
const PRESETS: { label: string; hex: string | null }[] = [{ label: 'Theme default', hex: null }, ...COLOUR_SWATCHES]
const COLUMNS = 5
// Moving the hue of a grey lifts it to this chroma and a mid shade, so the
// strip turns a grey into a colour instead of into another grey.
const MIN_HUE_CHROMA = 0.12
const HUE_STRIP = `linear-gradient(to right, ${Array.from({ length: 13 }, (_, step) => oklchToHex({ l: 0.7, c: 0.16, h: step * 30 })).join(', ')})`
const DOT_RING = 'ring-1 ring-inset ring-sand-950/15 dark:ring-sand-50/20'

// Next mounts React on the document itself, so an enclosing dialog's own
// document listener sits beside React's: only stopping the native event
// outright keeps the picker's keys (arrows, Escape) from reaching it.
function keepKey(event: KeyboardEvent) {
  event.stopPropagation()
  event.nativeEvent.stopImmediatePropagation()
}

export function ColourControl({
  value,
  resolved,
  onChange,
  background,
  align = 'end',
  className = 'relative',
  triggerClassName = 'h-8 pl-3 pr-2',
}: {
  /** The picked colour, or null for the theme's own ink. */
  value: string | null
  /** The colour the icons draw in right now: the pick, or the theme's ink. */
  resolved: string
  onChange: (value: string | null) => void
  /** The surface the icons sit on; a pick under 3:1 against it gets a note. */
  background?: string
  align?: 'start' | 'end'
  /** The popover hangs from the nearest positioned ancestor, so a caller can
   *  anchor it to a wider row on a phone by leaving this unpositioned there. */
  className?: string
  triggerClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div
      ref={rootRef}
      className={className}
      onBlur={(event) => {
        if (open && event.relatedTarget && !rootRef.current?.contains(event.relatedTarget as Node)) setOpen(false)
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={`Icon colour, ${value ?? 'theme default'}`}
        onClick={() => setOpen((state) => !state)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault()
            setOpen(true)
          }
          // Stop here so an enclosing dialog does not close too.
          if (event.key === 'Escape' && open) {
            keepKey(event)
            setOpen(false)
          }
        }}
        className={`inline-flex shrink-0 items-center gap-2 rounded-full text-xs font-semibold text-sand-700 transition-colors hover:bg-sand-200/70 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 aria-expanded:bg-sand-200 aria-expanded:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-800/70 dark:hover:text-sand-50 dark:aria-expanded:bg-sand-800 dark:aria-expanded:text-sand-50 ${triggerClassName}`}
      >
        Colour
        <span aria-hidden className={`size-5 rounded-full ${DOT_RING}`} style={value ? { backgroundColor: value } : THEME_DISC} />
        <CaretDown
          weight="regular"
          aria-hidden
          className={`size-3 text-sand-600 transition-transform dark:text-sand-400 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <ColourPanel
            id={panelId}
            value={value}
            resolved={resolved}
            background={background}
            align={align}
            onChange={onChange}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ColourPanel({
  id,
  value,
  resolved,
  background,
  align,
  onChange,
  onClose,
}: {
  id: string
  value: string | null
  resolved: string
  background?: string
  align: 'start' | 'end'
  onChange: (value: string | null) => void
  onClose: () => void
}) {
  const reduce = useReducedMotion()
  const current = value ?? resolved
  // The strips keep their own hue, chroma and shade, so a hue survives a pass
  // through a grey and chroma lost at an extreme shade comes back mid-strip.
  const [tune, setTune] = useState(() => ({ hex: current, ...hexToOklch(current) }))
  if (tune.hex !== current) setTune({ hex: current, ...hexToOklch(current) })
  const [draft, setDraft] = useState<string | null>(null)
  const swatchRefs = useRef<(HTMLButtonElement | null)[]>([])
  const checkedIndex = PRESETS.findIndex((preset) => preset.hex === value)
  const tabIndex = checkedIndex === -1 ? 0 : checkedIndex
  const [openOn] = useState(tabIndex)

  // Opening lands on the picked swatch, the way a radio group is entered.
  useEffect(() => {
    swatchRefs.current[openOn]?.focus()
  }, [openOn])

  const apply = ({ l, c, h }: Oklch) => {
    const hex = oklchToHex({ l, c, h })
    setTune({ hex, l, c, h })
    onChange(hex)
  }

  const moveTo = (index: number) => {
    const next = (index + PRESETS.length) % PRESETS.length
    swatchRefs.current[next]?.focus()
    onChange(PRESETS[next].hex)
  }

  const swatchKey = (event: KeyboardEvent, index: number) => {
    const targets: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      ArrowDown: index + COLUMNS,
      ArrowUp: index - COLUMNS,
      Home: 0,
      End: PRESETS.length - 1,
    }
    if (!(event.key in targets)) return
    event.preventDefault()
    moveTo(targets[event.key])
  }

  const commit = () => {
    if (draft === null) return
    const hex = normalizeHex(draft)
    if (hex && hex !== value) onChange(hex)
    setDraft(null)
  }

  const shadeStrip = `linear-gradient(to right, ${Array.from({ length: 7 }, (_, step) =>
    oklchToHex({ ...tune, l: SHADE_MIN + ((SHADE_MAX - SHADE_MIN) * step) / 6 }),
  ).join(', ')})`
  const lowContrast = value !== null && background !== undefined && contrast(value, background) < 3

  return (
    <motion.div
      id={id}
      role="dialog"
      aria-label="Icon colour"
      onKeyDown={(event) => {
        // The picker's own keys stay inside it: an enclosing dialog browses
        // icons with the arrows and closes on Escape.
        if (event.key === 'Escape') {
          keepKey(event)
          onClose()
        } else if (event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End') {
          keepKey(event)
        }
      }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
      transition={{ duration: 0.14, ease: [0.2, 0, 0, 1] }}
      className={`absolute top-full z-50 mt-2 w-60 rounded-card border border-sand-200 bg-sand-50 p-3 shadow-[0_2px_4px_rgba(14,14,15,0.06),0_16px_40px_rgba(14,14,15,0.12)] dark:border-sand-700 dark:bg-sand-900 dark:shadow-[0_2px_4px_rgba(0,0,0,0.4),0_16px_40px_rgba(0,0,0,0.6)] ${
        align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
      }`}
    >
      <div role="radiogroup" aria-label="Preset colours" className="grid grid-cols-5 justify-items-center gap-y-2">
        {PRESETS.map((preset, index) => {
          const checked = preset.hex === value
          return (
            <button
              key={preset.label}
              ref={(node) => {
                swatchRefs.current[index] = node
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={preset.label}
              title={preset.label}
              tabIndex={index === tabIndex ? 0 : -1}
              onClick={() => onChange(preset.hex)}
              onKeyDown={(event) => swatchKey(event, index)}
              style={preset.hex ? { backgroundColor: preset.hex } : THEME_DISC}
              className={`size-7 rounded-full outline-offset-2 transition-transform hover:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100 ${DOT_RING} ${
                checked ? 'outline-2 outline-accent' : 'focus-visible:outline-2 focus-visible:outline-accent/40'
              }`}
            />
          )
        })}
      </div>

      <div className="mt-3 space-y-1">
        <Strip
          label="Hue"
          value={Math.round(tune.h)}
          min={0}
          max={360}
          step={1}
          valueText={`${Math.round(tune.h)} degrees`}
          background={HUE_STRIP}
          thumb={oklchToHex({ l: 0.7, c: 0.16, h: tune.h })}
          onChange={(h) =>
            apply(
              tune.c < MIN_HUE_CHROMA
                ? { l: Math.min(0.8, Math.max(0.5, tune.l)), c: MIN_HUE_CHROMA, h }
                : { ...tune, h },
            )
          }
        />
        <Strip
          label="Shade"
          value={Math.min(SHADE_MAX, Math.max(SHADE_MIN, tune.l))}
          min={SHADE_MIN}
          max={SHADE_MAX}
          step={0.01}
          valueText={`${Math.round(tune.l * 100)} percent lightness`}
          background={shadeStrip}
          thumb={current}
          onChange={(l) => apply({ ...tune, l })}
        />
      </div>

      <div className="mt-2 flex items-center gap-2 border-t border-sand-200 pt-3 dark:border-sand-800">
        <span aria-hidden className={`size-8 shrink-0 rounded-full ${DOT_RING}`} style={{ backgroundColor: current }} />
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Hex colour</span>
          <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-sand-600 dark:text-sand-400">
            #
          </span>
          <input
            value={draft ?? current.slice(1)}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commit()
              // The first Escape drops an unsaved edit; the next one closes.
              if (event.key === 'Escape' && draft !== null) {
                keepKey(event)
                setDraft(null)
              }
            }}
            maxLength={7}
            spellCheck={false}
            autoComplete="off"
            aria-invalid={draft !== null && /[^0-9a-f#]/i.test(draft)}
            className="h-8 w-full rounded-full border border-sand-200 bg-sand-100 pl-6 pr-3 font-mono text-xs uppercase text-sand-900 outline-none focus-visible:ring-2 focus-visible:ring-accent/40 aria-[invalid=true]:border-red-500/60 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-50"
          />
        </label>
      </div>
      {lowContrast && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-sand-600 dark:text-sand-400">
          <Warning weight="regular" aria-hidden className="size-3.5 shrink-0" />
          Low contrast on this background
        </p>
      )}
    </motion.div>
  )
}

function Strip({
  label,
  value,
  min,
  max,
  step,
  valueText,
  background,
  thumb,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  valueText: string
  background: string
  thumb: string
  onChange: (value: number) => void
}) {
  const t = (value - min) / (max - min)
  return (
    // The padding is the touch area: the strip is 12px, the target 28px.
    <div className="relative py-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuetext={valueText}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />
      <div aria-hidden className="h-3 rounded-full ring-1 ring-inset ring-sand-950/10 dark:ring-sand-50/10" style={{ background }} />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sand-50 shadow-[0_0_0_1px_rgba(14,14,15,0.3),0_1px_2px_rgba(14,14,15,0.3)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent/60"
        style={{ left: `calc(8px + (100% - 16px) * ${t})`, backgroundColor: thumb }}
      />
    </div>
  )
}
