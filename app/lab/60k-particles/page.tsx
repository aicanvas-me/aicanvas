'use client'

// 60K Particles — LAB tool
// Two-pane layout: live preview (left, DOM first) + control sidebar (right).
// Source order matches visual order so hydration doesn't flash from one to the
// other when the dynamically-imported Canvas mounts.
//
// Export / Record / Save Preset / Copy code are gated behind sign-in via
// useLabAuthGate. Signed-out users see the same buttons but clicking them
// snapshots the current tune to localStorage and opens the auth modal in
// sign-up mode; on return the tune hydrates and the originally-clicked
// action auto-fires.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Renderer from '../_lib/particleMark/Renderer'
import { useCanvasRecorder } from '../_lib/recorder/useCanvasRecorder'
import { RecordingDownloadDialog } from '../_lib/recorder/RecordingDownloadDialog'
import { exportCanvasImage, type ImageScale } from '../_lib/recorder/exportImage'
import { RecordButton } from '../_lib/recorder/RecordButton'
import { RecordInfoTooltip } from '../_lib/recorder/RecordInfoTooltip'
import {
  type Config,
  type ColorMode,
  type Idle,
  type HoverArea,
  type Spring,
  type Light,
  type Depth,
  DEFAULT_CONFIG,
  BG_PRESETS,
} from '../_lib/particleMark/config'
import { generateTSX } from '../_lib/particleMark/codeGen'
import { PLACEHOLDER_SVG } from '../_lib/particleMark/svgSampler'
import { SectionLabel } from '../_lib/particleMark/controls/SectionLabel'
import { Segmented } from '../_lib/particleMark/controls/Segmented'
import { Slider } from '../_lib/particleMark/controls/Slider'
import { ColorInput } from '../_lib/particleMark/controls/ColorInput'
import { FileDrop } from '../_lib/particleMark/controls/FileDrop'
import { CircleHalfTilt, Sun, Prohibit, BookmarkSimple, CaretDown, Check } from '@phosphor-icons/react'
import { useLabAuthGate } from '../_lib/useLabAuthGate'
import {
  serializeParticleConfig,
  deserializeParticleConfig,
  type SerializedParticleConfig,
} from '../_lib/preset/serialize'
import { PresetSaveDialog } from '../_lib/preset/PresetSaveDialog'
import { PresetMenu, type PresetSummary } from '../_lib/preset/PresetMenu'
import { useSession } from '../../components/auth/SessionProvider'
import { Button } from '../../components/Button'
import { MobileControlSheet } from '../_components/MobileControlSheet'

const MAX_RECORDING_MS = 20_000
const TOOL = '60k-particles' as const

// Phosphor icons for the Light Direction segmented control. Each icon depicts
// a sphere shaded as if the light were coming from that direction — much more
// semantically accurate than plain directional arrows.
const LIGHT_ICONS: Record<Light, React.ReactNode> = {
  'Top-Right': <CircleHalfTilt size={16} weight="regular" />,
  'Top-Left':  <CircleHalfTilt size={16} weight="regular" className="-scale-x-100" />,
  'Center':    <Sun            size={16} weight="regular" />,
  'None':      <Prohibit       size={16} weight="regular" />,
}

const COLOR_MODE_OPTIONS: readonly ColorMode[]   = ['Original', 'Mono'] as const
const IDLE_OPTIONS:      readonly Idle[]         = ['Still', 'Calm', 'Lively', 'Frantic'] as const
const HOVER_OPTIONS:     readonly HoverArea[]    = ['Small', 'Medium', 'Large'] as const
const SPRING_OPTIONS:    readonly Spring[]       = ['Stiff', 'Smooth', 'Bouncy'] as const
const LIGHT_OPTIONS:     readonly Light[]        = ['Top-Right', 'Top-Left', 'Center', 'None'] as const
const DEPTH_OPTIONS:     readonly Depth[]        = ['Flat', 'Subtle', '3D'] as const

type PresetRow = PresetSummary & { config: SerializedParticleConfig }

export default function ParticleMarkLabPage() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [imageError, setImageError] = useState<string | null>(null)
  const [imageSaved, setImageSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const recorder = useCanvasRecorder()
  const { start: startRecording, stop: stopRecording, state: recorderState } = recorder

  // Preload the default source image (the AI Canvas mark parrot) on first
  // mount. Skipped once a source is set (preset / auth-gate handoff, user
  // upload, or the default itself once it lands). The effect's own dep
  // condition handles the "don't refetch" guard — no extra ref is needed,
  // and adding one breaks React 19 StrictMode (the ref persists across
  // dev's mount/unmount/remount cycle while the cleanup cancels the first
  // mount's fetch, so the second mount short-circuits with nothing
  // applied). The `<File>` constructor only exists client-side, so the
  // default can't sit in the module-level DEFAULT_CONFIG.
  useEffect(() => {
    if (config.imageFile || config.svgSource) return
    let cancelled = false
    fetch('/lab/ai-canvas-mark.webp')
      .then((r) => {
        if (!r.ok) throw new Error(`default image fetch failed (${r.status})`)
        return r.blob()
      })
      .then((blob) => {
        if (cancelled) return
        const file = new File([blob], 'ai-canvas.webp', {
          type: blob.type || 'image/webp',
        })
        const url = URL.createObjectURL(blob)
        setConfig((prev) => {
          // Re-check inside the updater: if a preset / auth handoff landed
          // between the fetch start and this resolve, leave it alone and
          // free the object URL we just allocated.
          if (prev.imageFile || prev.svgSource) {
            URL.revokeObjectURL(url)
            return prev
          }
          return {
            ...prev,
            imageFile: file,
            imageUrl: url,
            svgSource: null,
            svgFileName: null,
          }
        })
      })
      .catch(() => {
        // Silent — the renderer falls back to the inline PLACEHOLDER_SVG.
      })
    return () => {
      cancelled = true
    }
  }, [config.imageFile, config.svgSource])

  // Close the Save image dropdown on outside click or Escape.
  useEffect(() => {
    if (!exportMenuOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setExportMenuOpen(false)
    }
    function onClick(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [exportMenuOpen])

  const { user } = useSession()
  const [presets, setPresets] = useState<PresetRow[]>([])
  const [presetsLoading, setPresetsLoading] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<{ id: string; currentName: string } | null>(null)
  // Captured when the Save dialog opens so the suggested name doesn't drift
  // on every parent re-render while the dialog is on screen.
  const [saveDefaultName, setSaveDefaultName] = useState('')

  const onCanvasReady = useCallback((c: HTMLCanvasElement | null) => {
    canvasRef.current = c
  }, [])

  const onSaveImage = useCallback(async (scale: ImageScale) => {
    if (!canvasRef.current) return
    setImageError(null)
    // Filename convention: `aicanvas-<name>-<format/spec>.<ext>`. Brand prefix
    // is unspaced so it reads as one token; the name keeps its readable spaces.
    const resolution = scale === '2x' ? '3840x2160' : '1920x1080'
    const spec = `PNGx${scale === '2x' ? '2' : '1'}-${resolution}`
    try {
      await exportCanvasImage(canvasRef.current, scale, `aicanvas-it's possible-${spec}.png`)
      setImageSaved(true)
      setTimeout(() => setImageSaved(false), 1500)
    } catch (e) {
      setImageError(e instanceof Error ? e.message : 'Failed to export PNG')
    }
  }, [])

  const onRecord = useCallback(() => {
    if (recorderState === 'recording') {
      stopRecording()
      return
    }
    if (!canvasRef.current) return
    // Recorder appends `-<fps>fps` to the base name automatically, so the final
    // download lands as `aicanvas-it's possible-60fps.mp4`.
    startRecording(canvasRef.current, {
      fps: 60,
      filename: "aicanvas-it's possible.mp4",
      colorBoost: true,
      maxDurationMs: MAX_RECORDING_MS,
    })
  }, [recorderState, startRecording, stopRecording])

  const onCopy = useCallback(async () => {
    const tsx = config.imageFile
      ? generateTSX(config, { kind: 'raster', filename: config.imageFile.name })
      : generateTSX(config, {
          kind: 'svg',
          svg: config.svgSource ?? PLACEHOLDER_SVG,
        })
    try {
      await navigator.clipboard.writeText(tsx)
    } catch {
      // Clipboard API can fail without a user gesture or in cross-origin
      // contexts; fall back to the legacy execCommand path.
      const ta = document.createElement('textarea')
      ta.value = tsx
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch { /* swallow */ }
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [config])

  // Auth gate. Each gated action is registered with a stable name; gate.run
  // looks the action up at click time (and again on post-auth resume from
  // localStorage). serializeState / applyState handle the tune handoff so
  // the user lands back on the same canvas after sign-up.
  const gate = useLabAuthGate({
    tool: TOOL,
    serializeState: () => serializeParticleConfig(config),
    applyState: (s) => setConfig(deserializeParticleConfig(s)),
    actions: {
      'export-png-1x': () => onSaveImage('1x'),
      'export-png-2x': () => onSaveImage('2x'),
      'record':        () => onRecord(),
      'copy-code':     () => onCopy(),
      'save-preset':   () => {
        setSaveDefaultName(`Untitled · ${new Date().toLocaleString()}`)
        setSaveDialogOpen(true)
      },
    },
  })

  // Record button lives in a fixed bottom-center strip rendered below.
  // Export controls live back in the sidebar (Save image dropdown + Copy
  // code button).

  // Load presets when the user becomes available; clear them when they sign out.
  const refreshPresets = useCallback(async () => {
    if (!user) {
      setPresets([])
      return
    }
    setPresetsLoading(true)
    try {
      const res = await fetch(`/api/lab-presets?tool=${TOOL}`)
      if (res.ok) {
        const { presets: rows } = (await res.json()) as { presets: PresetRow[] }
        setPresets(rows ?? [])
      }
    } catch {
      // Network failure — leave the prior list in place.
    } finally {
      setPresetsLoading(false)
    }
  }, [user])

  useEffect(() => {
    void refreshPresets()
  }, [refreshPresets])

  const onSavePreset = useCallback(async (name: string) => {
    const serialized = await serializeParticleConfig(config)
    const res = await fetch('/api/lab-presets', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tool: TOOL, name, config: serialized }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.error ?? 'Could not save preset')
    }
    setSaveDialogOpen(false)
    await refreshPresets()
  }, [config, refreshPresets])

  const onLoadPreset = useCallback((id: string) => {
    const preset = presets.find((p) => p.id === id)
    if (!preset) return
    setConfig(deserializeParticleConfig(preset.config))
  }, [presets])

  const onRenamePreset = useCallback((id: string, currentName: string) => {
    setRenameTarget({ id, currentName })
  }, [])

  const onSubmitRename = useCallback(async (nextName: string) => {
    if (!renameTarget) return
    if (nextName === renameTarget.currentName) {
      setRenameTarget(null)
      return
    }
    const res = await fetch('/api/lab-presets', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: renameTarget.id, name: nextName }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.error ?? 'Could not rename preset')
    }
    setRenameTarget(null)
    await refreshPresets()
  }, [renameTarget, refreshPresets])

  const onDeletePreset = useCallback(async (id: string) => {
    const preset = presets.find((p) => p.id === id)
    const ok = window.confirm(
      preset ? `Delete preset "${preset.name}"? This can't be undone.` : 'Delete this preset?',
    )
    if (!ok) return
    const res = await fetch('/api/lab-presets', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) await refreshPresets()
  }, [presets, refreshPresets])

  const update = useCallback(<K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }, [])

  // File handling — branch on SVG (text) vs raster (Blob/ObjectURL).
  const onSvgFile = useCallback((file: File) => {
    const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)
    if (isSvg) {
      const reader = new FileReader()
      reader.onload = () => {
        const text = typeof reader.result === 'string' ? reader.result : ''
        if (!text.trim().startsWith('<')) return
        setConfig((prev) => {
          if (prev.imageUrl) URL.revokeObjectURL(prev.imageUrl)
          return {
            ...prev,
            svgSource: text,
            svgFileName: file.name,
            imageFile: null,
            imageUrl: null,
          }
        })
      }
      reader.readAsText(file)
      return
    }
    const url = URL.createObjectURL(file)
    setConfig((prev) => {
      if (prev.imageUrl) URL.revokeObjectURL(prev.imageUrl)
      return {
        ...prev,
        svgSource: null,
        svgFileName: file.name,
        imageFile: file,
        imageUrl: url,
      }
    })
  }, [])

  const onClearSvg = useCallback(() => {
    setConfig((prev) => {
      if (prev.imageUrl) URL.revokeObjectURL(prev.imageUrl)
      return {
        ...prev,
        svgSource: null,
        svgFileName: null,
        imageFile: null,
        imageUrl: null,
      }
    })
  }, [])

  const presetSummaries: PresetSummary[] = useMemo(
    () => presets.map(({ id, name, updated_at }) => ({ id, name, updated_at })),
    [presets],
  )

  // Shared control panel — rendered into the desktop right sidebar AND the
  // mobile bottom sheet. Lives here (not as a sub-component) so it captures
  // page state directly without a long props handshake.
  const panelContent = (
    <>
      <header className="mb-5">
        <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50">
          60K Particles
        </h1>
        <p className="mt-2 text-[13px] leading-snug text-sand-600 dark:text-sand-400">
          Drop an SVG or PNG. Move your mouse to animate the scene. Export PNG • Export MP4 • Copy Code
        </p>
      </header>

      <div className="space-y-5">
        {/* SOURCE */}
        <section>
          <SectionLabel>Source</SectionLabel>
          <FileDrop
            accept="image/svg+xml,image/png,image/jpeg,image/webp"
            onFile={onSvgFile}
            fileName={config.svgFileName}
            onClear={onClearSvg}
          />
        </section>

        <Slider
          label="Density"
          value={config.density}
          min={2000}
          max={60000}
          step={1000}
          onChange={(v) => update('density', v)}
          format={(v) => v.toLocaleString()}
        />

        <Slider
          label="Particle Size"
          value={config.particleSize}
          min={2}
          max={12}
          step={0.5}
          onChange={(v) => update('particleSize', v)}
          format={(v) => v.toFixed(1)}
        />

        <Slider
          label="Mark Size"
          value={config.markSize}
          min={1}
          max={4}
          step={0.05}
          onChange={(v) => update('markSize', v)}
          format={(v) => v.toFixed(2)}
        />

        <section>
          <SectionLabel>Colors</SectionLabel>
          <Segmented
            options={COLOR_MODE_OPTIONS}
            value={config.colorMode}
            onChange={(v) => update('colorMode', v)}
          />
          {config.colorMode === 'Mono' && (
            <div className="mt-3 flex items-center gap-2">
              <ColorInput
                variant="swatch"
                appearance="solid"
                value={config.monoColor}
                onChange={(v) => update('monoColor', v)}
              />
              <span className="font-mono text-xs text-sand-700 dark:text-sand-300">
                {config.monoColor.toUpperCase()}
              </span>
            </div>
          )}
        </section>

        <section>
          <SectionLabel>Background</SectionLabel>
          <div className="flex flex-wrap items-center gap-2">
            {BG_PRESETS.map((hex) => {
              const active = config.backgroundColor.toLowerCase() === hex.toLowerCase()
              return (
                <button
                  key={hex}
                  type="button"
                  onClick={() => update('backgroundColor', hex)}
                  title={hex}
                  aria-label={`Use ${hex} as background`}
                  className={`h-7 w-7 rounded-full border transition-all ${
                    active
                      ? 'border-olive-500 ring-2 ring-olive-500/40'
                      : 'border-sand-400 hover:scale-110 dark:border-sand-700'
                  }`}
                  style={{ background: hex }}
                />
              )
            })}
            <ColorInput
              variant="swatch"
              active={
                !BG_PRESETS.some(
                  (p) => p.toLowerCase() === config.backgroundColor.toLowerCase(),
                )
              }
              value={config.backgroundColor}
              onChange={(v) => update('backgroundColor', v)}
            />
          </div>
        </section>

        <section>
          <SectionLabel>Idle Motion</SectionLabel>
          <Segmented
            options={IDLE_OPTIONS}
            value={config.idle}
            onChange={(v) => update('idle', v)}
          />
        </section>

        <section>
          <SectionLabel>Hover Area</SectionLabel>
          <Segmented
            options={HOVER_OPTIONS}
            value={config.hoverArea}
            onChange={(v) => update('hoverArea', v)}
          />
        </section>

        <Slider
          label="Hover Strength"
          value={config.hoverStrength}
          min={0}
          max={2}
          step={0.05}
          onChange={(v) => update('hoverStrength', v)}
          format={(v) => v.toFixed(2)}
        />

        <section>
          <SectionLabel>Return Spring</SectionLabel>
          <Segmented
            options={SPRING_OPTIONS}
            value={config.spring}
            onChange={(v) => update('spring', v)}
          />
        </section>

        <section>
          <SectionLabel>Light Direction</SectionLabel>
          <Segmented
            options={LIGHT_OPTIONS}
            value={config.light}
            onChange={(v) => update('light', v)}
            renderOption={(opt) => LIGHT_ICONS[opt]}
          />
        </section>

        <Slider
          label="Highlight Strength"
          value={config.highlightStrength}
          min={0}
          max={0.5}
          step={0.025}
          disabled={config.light === 'None'}
          onChange={(v) => update('highlightStrength', v)}
          format={(v) => v.toFixed(3)}
        />

        <section>
          <SectionLabel>Depth</SectionLabel>
          <Segmented
            options={DEPTH_OPTIONS}
            value={config.depth}
            onChange={(v) => update('depth', v)}
          />
        </section>

        {/* PRESETS — placed near the export actions so saving / loading a
            tune lives next to the other "take this with me" controls. */}
        <section>
          <SectionLabel>Presets</SectionLabel>
          <div className="space-y-2">
            <PresetMenu
              presets={presetSummaries}
              loading={presetsLoading}
              signedIn={!!user}
              onLoad={onLoadPreset}
              onRename={onRenamePreset}
              onDelete={onDeletePreset}
            />
            <Button variant="outline" size="xs" fullWidth onClick={() => gate.run('save-preset')}>
              <BookmarkSimple size={12} weight="regular" />
              Save preset
            </Button>
          </div>
        </section>

        <section className="space-y-2 pt-2">
          <SectionLabel>Export</SectionLabel>
          <div className="relative" ref={exportMenuRef}>
            <Button
              variant="primary"
              size="xs"
              fullWidth
              onClick={() => setExportMenuOpen((o) => !o)}
              className="relative"
            >
              {imageSaved && <Check weight="regular" size={12} />}
              {imageSaved ? 'Saved!' : 'Save image'}
              {!imageSaved && (
                <CaretDown
                  weight="regular"
                  size={12}
                  className={`absolute right-3 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`}
                />
              )}
            </Button>
            {exportMenuOpen && (
              <div className="absolute bottom-full left-0 z-40 mb-2 w-full overflow-hidden rounded-lg border border-sand-300 bg-sand-50 shadow-xl dark:border-sand-700 dark:bg-sand-900">
                <button
                  type="button"
                  onClick={() => {
                    setExportMenuOpen(false)
                    gate.run('export-png-1x')
                  }}
                  className="flex w-full items-center justify-between gap-2.5 px-3 py-2 text-xs text-sand-700 transition-colors hover:bg-sand-200 dark:text-sand-300 dark:hover:bg-sand-800"
                >
                  <span>PNG · 1x</span>
                  <span className="font-mono text-[10px] text-sand-500">1920×1080</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExportMenuOpen(false)
                    gate.run('export-png-2x')
                  }}
                  className="flex w-full items-center justify-between gap-2.5 px-3 py-2 text-xs text-sand-700 transition-colors hover:bg-sand-200 dark:text-sand-300 dark:hover:bg-sand-800"
                >
                  <span>PNG · 2x</span>
                  <span className="font-mono text-[10px] text-sand-500">3840×2160</span>
                </button>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="xs"
            fullWidth
            onClick={() => gate.run('copy-code')}
          >
            {copied ? 'Copied ✓' : 'Copy code'}
          </Button>
        </section>

        {/* Recorder / image-export status. Hidden until there's
            something to surface — Record itself lives in the
            bottom-bar. */}
        {(!recorder.supported || recorder.error || imageError) && (
          <section className="space-y-1.5 pt-2">
            {!recorder.supported && (
              <p className="text-[11px] leading-snug text-sand-500 dark:text-sand-500">
                Recording needs Chrome / Edge / Safari 16.4+ / Firefox 130+.
              </p>
            )}
            {recorder.error && (
              <p className="text-[11px] leading-snug text-red-500">{recorder.error}</p>
            )}
            {imageError && (
              <p className="text-[11px] leading-snug text-red-500">{imageError}</p>
            )}
          </section>
        )}
      </div>
    </>
  )

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .particle-mark-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 2px;
          background: var(--color-sand-300);
          outline: none;
        }
        .dark .particle-mark-slider {
          background: var(--color-sand-700);
        }
        .particle-mark-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-sand-50);
          border: 1px solid var(--color-sand-400);
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        }
        .dark .particle-mark-slider::-webkit-slider-thumb {
          background: var(--color-sand-100);
          border-color: var(--color-sand-600);
        }
        .particle-mark-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-sand-50);
          border: 1px solid var(--color-sand-400);
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        }
        .particle-mark-slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `,
        }}
      />

      <main className="flex min-h-0 flex-1 flex-col bg-sand-200 dark:bg-sand-950">
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <section className="relative flex w-full min-w-0 flex-1 flex-col overflow-hidden">
            <CanvasArea config={config} onFile={onSvgFile} onCanvasReady={onCanvasReady} />
            {/* Bottom-of-canvas Record strip — centred over the live preview
                rather than the full viewport, so it stays put when the
                sidebar's width changes. On mobile, lifted higher so it
                clears the bottom-sheet's peek state. */}
            <div className="pointer-events-none absolute bottom-[88px] left-1/2 z-20 -translate-x-1/2 md:bottom-4">
              <div className="pointer-events-auto flex items-center gap-2">
                <RecordButton
                  state={recorder.state}
                  elapsedMs={recorder.elapsedMs}
                  maxDurationMs={MAX_RECORDING_MS}
                  supported={recorder.supported}
                  onClick={() => gate.run('record')}
                />
                <RecordInfoTooltip />
              </div>
            </div>
          </section>

          <aside className="hidden w-full shrink-0 border-t border-sand-300 px-5 py-6 dark:border-sand-800 md:block md:w-[340px] md:overflow-y-auto md:border-l md:border-t-0 md:px-5 md:py-6">
            {panelContent}
          </aside>

          {/* Mobile-only bottom sheet — drag handle, 3 snap points. Hidden on
              md+ where the right sidebar takes over. */}
          <div className="md:hidden">
            <MobileControlSheet>{panelContent}</MobileControlSheet>
          </div>

        </div>
      </main>

      <PresetSaveDialog
        isOpen={saveDialogOpen}
        defaultName={saveDefaultName}
        onSave={onSavePreset}
        onCancel={() => setSaveDialogOpen(false)}
      />

      <PresetSaveDialog
        isOpen={renameTarget !== null}
        defaultName={renameTarget?.currentName ?? ''}
        onSave={onSubmitRename}
        onCancel={() => setRenameTarget(null)}
        title="Rename preset"
        description="Give this preset a new name."
        submitLabel="Rename"
        submittingLabel="Renaming…"
      />

      <RecordingDownloadDialog
        isOpen={recorder.pending !== null}
        sourceSizeBytes={recorder.pending?.sizeBytes ?? 0}
        durationSec={recorder.pending?.durationSec ?? 0}
        error={recorder.error}
        onDownload={(fps) => recorder.downloadRecording(fps)}
        onCancel={recorder.dismissRecording}
      />

    </>
  )
}

// Wraps the renderer with a drop zone that covers the canvas area so files
// dropped on the preview also load.
function CanvasArea({
  config,
  onFile,
  onCanvasReady,
}: {
  config: Config
  onFile: (file: File) => void
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void
}) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const f = e.dataTransfer.files?.[0]
        if (f) onFile(f)
      }}
      className="relative w-full flex-1 min-h-0"
    >
      <Renderer config={config} onCanvasReady={onCanvasReady} />
      {dragOver && (
        <div className="pointer-events-none absolute inset-2 flex items-center justify-center rounded-lg border-2 border-dashed border-olive-500 bg-olive-500/10 text-sm font-semibold text-olive-500 dark:text-olive-400">
          Drop SVG to load
        </div>
      )}
    </div>
  )
}
