'use client'

// Post-recording download chooser. Shown when the recorder has a finalised
// MP4 buffer in memory and the user hasn't picked a download variant yet.
// Two cards: 60 fps (the captured original, instant) and 30 fps (re-encoded
// via MediaBunny's Conversion API). Visual language mirrors PresetSaveDialog
// so the lab popups feel consistent.

import { useEffect, useState } from 'react'
import { X, FilmReel, FilmSlate, CheckCircle } from '@phosphor-icons/react'
import { Button } from '../../../components/Button'

type Props = {
  isOpen: boolean
  /** Size of the captured 60fps buffer, in bytes. */
  sourceSizeBytes: number
  /** Recording duration in seconds — drives the 30fps size estimate. */
  durationSec: number
  /** Error from the most recent download / transcode attempt, if any. */
  error: string | null
  /**
   * Fire-and-forget. The popup shows a brief acknowledgement and then
   * auto-closes via onCancel — the caller's hook handles the actual file
   * write in the background.
   */
  onDownload: (fps: 30 | 60) => void
  onCancel: () => void
}

/** Ms the popup shows its "Saving…" confirmation before auto-closing. */
const AUTO_CLOSE_MS = 2000

function formatMB(bytes: number) {
  if (bytes <= 0) return '—'
  const mb = bytes / (1024 * 1024)
  return mb >= 10 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`
}

export function RecordingDownloadDialog({
  isOpen,
  sourceSizeBytes,
  durationSec,
  error,
  onDownload,
  onCancel,
}: Props) {
  // Once the user picks an option we flip into a brief "Saving…" view and
  // schedule onCancel — the actual download/transcode runs in the caller's
  // hook independently, so closing the popup doesn't cancel anything.
  const [savingFps, setSavingFps] = useState<30 | 60 | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  // Reset the "saving" state whenever the popup opens fresh (i.e. for a new
  // recording).
  useEffect(() => {
    if (isOpen) setSavingFps(null)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && savingFps === null) onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, savingFps, onCancel])

  // Auto-close after acknowledging the save.
  useEffect(() => {
    if (savingFps === null) return
    const id = window.setTimeout(() => onCancel(), AUTO_CLOSE_MS)
    return () => window.clearTimeout(id)
  }, [savingFps, onCancel])

  if (!isOpen) return null

  // 30fps at the same bits-per-pixel target is ~half the bandwidth of the
  // 60fps source, so size estimates linearly. Real result varies with scene
  // complexity but this is the right ballpark for a UI hint.
  const sizeAt60 = sourceSizeBytes
  const sizeAt30 = Math.round(sourceSizeBytes * 0.5)

  function handlePick(fps: 30 | 60) {
    if (savingFps !== null) return
    onDownload(fps)
    setSavingFps(fps)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Download recording"
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-sand-950/80 backdrop-blur-sm"
        onClick={savingFps !== null ? undefined : onCancel}
      />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-sand-300 bg-sand-50 p-7 shadow-2xl dark:border-sand-800 dark:bg-sand-900">
        <Button
          variant="icon"
          size="md"
          onClick={onCancel}
          aria-label="Close"
          className="absolute right-3 top-3"
        >
          <X weight="regular" size={18} />
        </Button>

        {savingFps === null ? (
          <>
            <h2 className="text-xl font-bold text-sand-900 dark:text-sand-50">
              Download your recording
            </h2>
            <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
              {Math.round(durationSec)}s clip at 1920×1080. Pick a frame rate.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <DownloadCard
                label="60 fps"
                sublabel="Smooth motion"
                sizeHint={formatMB(sizeAt60)}
                icon={<FilmReel weight="regular" size={22} />}
                badge="Original"
                onClick={() => handlePick(60)}
              />
              <DownloadCard
                label="30 fps"
                sublabel="Smaller file, share-friendly"
                sizeHint={`~${formatMB(sizeAt30)}`}
                icon={<FilmSlate weight="regular" size={22} />}
                onClick={() => handlePick(30)}
              />
            </div>

            {error && (
              <p className="mt-4 text-xs text-red-500" role="alert">{error}</p>
            )}

            <div className="mt-5 flex justify-end">
              <Button variant="outline" size="md" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <SavingView fps={savingFps} />
        )}
      </div>
    </div>
  )
}

function SavingView({ fps }: { fps: 30 | 60 }) {
  const headline = fps === 60 ? 'Saved!' : 'Preparing your 30 fps clip…'
  const body =
    fps === 60
      ? 'Your file is downloading. Check the downloads tray.'
      : "It'll land in your downloads when the re-encode finishes. You can close this and keep working."
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <CheckCircle weight="fill" size={36} className="text-olive-500 dark:text-olive-400" />
      <h2 className="text-xl font-bold text-sand-900 dark:text-sand-50">{headline}</h2>
      <p className="max-w-sm text-sm text-sand-600 dark:text-sand-400">{body}</p>
    </div>
  )
}

function DownloadCard({
  label,
  sublabel,
  sizeHint,
  icon,
  badge,
  disabled = false,
  onClick,
}: {
  label: string
  sublabel: string
  sizeHint: string
  icon: React.ReactNode
  badge?: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative flex flex-col items-start gap-2 rounded-lg border border-sand-300 bg-sand-100 p-4 text-left transition-colors hover:border-olive-500 hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sand-700 dark:bg-sand-800 dark:hover:border-olive-400 dark:hover:bg-sand-800"
    >
      <div className="flex w-full items-center justify-between">
        <div className="text-sand-700 dark:text-sand-300">{icon}</div>
        {badge && (
          <span className="rounded-full bg-olive-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-olive-600 dark:text-olive-400">
            {badge}
          </span>
        )}
      </div>
      <div>
        <div className="text-base font-bold text-sand-900 dark:text-sand-50">{label}</div>
        <div className="text-[11px] leading-snug text-sand-500 dark:text-sand-500">
          {sublabel}
        </div>
      </div>
      <div className="mt-auto text-xs font-mono text-sand-600 dark:text-sand-400">
        {sizeHint}
      </div>
    </button>
  )
}
