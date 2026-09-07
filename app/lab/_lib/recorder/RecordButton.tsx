'use client'

// Bottom-of-canvas Record control. Sized to match the rest of the lab
// chrome (xs button height + rounded-lg corners + text-xs) so it reads as
// part of the same family as the auth pill, Save image, etc. Three
// states: idle (outline + red dot icon), recording (filled red pill +
// pulse + live timer), encoding (disabled outline + Saving…).

import { Record, Stop } from '@phosphor-icons/react'

export type RecordButtonProps = {
  state: 'idle' | 'recording' | 'encoding'
  elapsedMs: number
  maxDurationMs: number
  supported: boolean
  onClick: () => void
}

const BASE =
  'inline-flex h-7 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold backdrop-blur transition-colors'

function formatElapsed(ms: number) {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function RecordButton({
  state,
  elapsedMs,
  maxDurationMs,
  supported,
  onClick,
}: RecordButtonProps) {
  if (state === 'recording') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Stop recording"
        className={`${BASE} bg-red-500/95 text-white hover:bg-red-600`}
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        <span>
          Stop {formatElapsed(elapsedMs)} / {formatElapsed(maxDurationMs)}
        </span>
      </button>
    )
  }

  if (state === 'encoding') {
    return (
      <button
        type="button"
        disabled
        aria-label="Saving recording"
        className={`${BASE} cursor-not-allowed border border-sand-300 bg-sand-50/90 text-sand-500 dark:border-sand-700 dark:bg-sand-900/90 dark:text-sand-500`}
      >
        <Stop weight="fill" size={11} />
        Saving…
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!supported}
      aria-label="Record MP4"
      className={`${BASE} border border-sand-300 bg-sand-50/90 text-sand-800 hover:border-sand-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sand-700 dark:bg-sand-900/90 dark:text-sand-100 dark:hover:border-sand-600`}
    >
      <Record weight="fill" size={11} className="text-red-500" />
      Record MP4
    </button>
  )
}
