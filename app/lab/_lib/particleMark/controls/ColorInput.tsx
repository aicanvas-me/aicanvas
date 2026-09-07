'use client'

// Custom color input — swatch + hex trigger, popover containing the
// react-colorful picker styled to match the AI Canvas design system.
//
// Two variants:
//   - 'chip' (default): rounded rectangle with swatch + hex text (Mono colour)
//   - 'swatch':         circular conic-gradient + plus icon, sized to slot
//                       in next to the preset swatches in the Background row

import { useEffect, useRef, useState } from 'react'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import { Eyedropper, Plus } from '@phosphor-icons/react'

// Chromium-based browsers expose a screen-eyedropper. Feature-detected at
// runtime so unsupported browsers (Firefox, Safari) hide the button.
type EyeDropperResult = { sRGBHex: string }
type EyeDropperConstructor = new () => { open: () => Promise<EyeDropperResult> }
declare global {
  interface Window {
    EyeDropper?: EyeDropperConstructor
  }
}

export function ColorInput({
  value,
  onChange,
  variant = 'chip',
  appearance = 'gradient',
  active = false,
}: {
  value: string
  onChange: (v: string) => void
  variant?: 'chip' | 'swatch'
  /** For variant='swatch': 'gradient' = conic rainbow + plus (custom-colour cue);
   *  'solid' = filled with `value` + plus overlay (current-colour cue). */
  appearance?: 'gradient' | 'solid'
  active?: boolean
}) {
  const [open, setOpen] = useState(false)
  // Auto-detect which side of the trigger to anchor the popover on, so it
  // never overflows the controls panel into the masked canvas.
  const [anchor, setAnchor] = useState<'left' | 'right'>('left')
  const [eyedropperAvailable, setEyedropperAvailable] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Feature-detect the native screen eyedropper (Chromium only).
  useEffect(() => {
    setEyedropperAvailable(typeof window !== 'undefined' && 'EyeDropper' in window)
  }, [])

  async function pickFromScreen() {
    if (!window.EyeDropper) return
    try {
      const result = await new window.EyeDropper().open()
      if (result?.sRGBHex) {
        onChange(result.sRGBHex)
        setOpen(false)
      }
    } catch {
      // User cancelled — no-op.
    }
  }

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return
    function onPointer(e: MouseEvent) {
      const t = e.target as Node
      if (popoverRef.current?.contains(t)) return
      if (triggerRef.current?.contains(t)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // When the popover opens, pick the side with more room. Width 220 + 8px buffer.
  useEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const popoverWidth = 220
    const margin = 8
    const fitsExtendingRight =
      rect.left + popoverWidth + margin <= window.innerWidth
    setAnchor(fitsExtendingRight ? 'left' : 'right')
  }, [open])

  // Swatch trigger: circular, plus-icon overlay, opens the picker.
  //   gradient → conic rainbow + dark inner core (Background Custom "any colour")
  //   solid    → filled with the current `value` + plus overlay (Mono "this colour")
  const swatchTrigger = (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={appearance === 'solid' ? 'Change colour' : 'Pick a custom colour'}
      title={appearance === 'solid' ? value : 'Custom colour'}
      className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all hover:scale-110 ${
        active ? 'ring-2 ring-olive-500/60 ring-offset-1 ring-offset-sand-100 dark:ring-offset-sand-900' : ''
      }`}
      style={{
        background:
          appearance === 'solid'
            ? value
            : 'conic-gradient(from 180deg, #ff6b6b, #ffd93d, #6bcb77, #4dd0ff, #6b6bff, #d96bff, #ff6bb0, #ff6b6b)',
      }}
    >
      {appearance === 'gradient' && (
        <span className="absolute inset-[3px] rounded-full bg-sand-900 dark:bg-sand-950" />
      )}
      <Plus
        size={appearance === 'solid' ? 14 : 12}
        weight="bold"
        className="relative text-white"
        style={appearance === 'solid' ? { filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.6))' } : undefined}
      />
    </button>
  )

  // Chip trigger: rectangular pill with swatch + hex label.
  const chipTrigger = (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-haspopup="dialog"
      aria-expanded={open}
      className="inline-flex items-center gap-2 rounded-md border border-sand-300 bg-sand-100 px-2 py-1.5 transition-colors hover:border-sand-400 dark:border-sand-700 dark:bg-sand-800 dark:hover:border-sand-600"
    >
      <span
        className="h-5 w-5 rounded border border-sand-400 dark:border-sand-600"
        style={{ background: value }}
        aria-hidden="true"
      />
      <span className="font-mono text-xs text-sand-700 dark:text-sand-300">
        {value.toUpperCase()}
      </span>
    </button>
  )

  return (
    <div className="relative inline-block">
      {variant === 'swatch' ? swatchTrigger : chipTrigger}

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          className={`particle-color-popover absolute z-50 mt-2 w-[220px] rounded-lg border border-sand-300 bg-sand-50 p-3 shadow-lg dark:border-sand-700 dark:bg-sand-900 ${
            anchor === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <HexColorPicker color={value} onChange={onChange} />
          <div className="mt-3 flex items-center gap-2">
            <span className="font-mono text-xs text-sand-500">#</span>
            <HexColorInput
              color={value}
              onChange={onChange}
              prefixed={false}
              className="w-full flex-1 rounded-md border border-sand-300 bg-sand-100 px-2 py-1.5 font-mono text-xs uppercase text-sand-800 outline-none transition-colors focus:border-olive-500 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-100"
            />
            {eyedropperAvailable && (
              <button
                type="button"
                onClick={pickFromScreen}
                aria-label="Pick a colour from the screen"
                title="Pick from screen"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-sand-300 bg-sand-100 text-sand-700 transition-colors hover:border-sand-400 hover:text-sand-900 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-300 dark:hover:border-sand-600 dark:hover:text-sand-50"
              >
                <Eyedropper size={14} weight="regular" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Override react-colorful defaults to match the design system. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .particle-color-popover .react-colorful {
          width: 100% !important;
          height: 160px !important;
          gap: 8px;
        }
        .particle-color-popover .react-colorful__saturation {
          border-radius: 6px;
          border-bottom: none;
        }
        .particle-color-popover .react-colorful__hue {
          height: 12px;
          border-radius: 6px;
        }
        .particle-color-popover .react-colorful__pointer {
          width: 14px;
          height: 14px;
          border-width: 2px;
        }
      ` }} />
    </div>
  )
}
