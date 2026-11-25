'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useMedia } from '../home/useMedia'
import { Play } from '@/app/_icons/icons/play'
import { Pause } from '@/app/_icons/icons/pause'
import { VolumeHigh } from '@/app/_icons/icons/volume-high'
import { VolumeOff } from '@/app/_icons/icons/volume-off'
import { HERO_FILM } from './_lib/media'
import { REEL_CHAPTERS, REEL_LENGTH } from './_lib/entries'

const CHAPTERS = REEL_CHAPTERS.map((c, i) => ({
  ...c,
  end: REEL_CHAPTERS[i + 1]?.at ?? REEL_LENGTH,
}))

const CONTROL =
  'flex h-9 w-9 items-center justify-center rounded-full bg-sand-950/60 text-sand-50 ring-1 ring-sand-50/15 transition-colors hover:bg-sand-950/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-50/60'

const never = () => () => {}
const saveData = () => !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData

// The hero film: plays muted while half of it is in view, never on its own for
// reduced motion or data saver, and drives the chapter rail under it.
export function FilmStage() {
  const video = useRef<HTMLVideoElement>(null)
  const fills = useRef<(HTMLSpanElement | null)[]>([])
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [current, setCurrent] = useState(0)

  // No film on the server: the browser picks the size once it knows the screen.
  const client = useSyncExternalStore(never, () => true, () => false)
  const wide = useMedia('(min-width: 1024px)', false)
  const src = client ? (wide ? HERO_FILM.desktop : HERO_FILM.mobile) : null
  const reduce = useMedia('(prefers-reduced-motion: reduce)', false)
  const lowData = useSyncExternalStore(never, saveData, () => false)
  const manual = reduce || lowData

  // Autoplay in view, pause out of view. A visitor who paused keeps it paused.
  const userPaused = useRef(false)
  useEffect(() => {
    const v = video.current
    if (!v || !src || manual) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !userPaused.current) v.play().catch(() => {})
        else if (!e.isIntersecting) v.pause()
      },
      { threshold: 0.5 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [src, manual])

  // The rail: fills written straight to the DOM each video frame, state only
  // when the chapter changes.
  useEffect(() => {
    const v = video.current
    if (!v) return
    let handle = 0
    let stopped = false
    const paint = () => {
      const t = v.currentTime
      let idx = 0
      CHAPTERS.forEach((c, i) => {
        const p = Math.min(1, Math.max(0, (t - c.at) / (c.end - c.at)))
        const el = fills.current[i]
        if (el) el.style.transform = `scaleX(${p})`
        if (t >= c.at) idx = i
      })
      setCurrent((prev) => (prev === idx ? prev : idx))
    }
    const rvfc = typeof (v as { requestVideoFrameCallback?: unknown }).requestVideoFrameCallback === 'function'
    const loop = () => {
      if (stopped) return
      paint()
      handle = rvfc
        ? (v as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => number }).requestVideoFrameCallback(loop)
        : 0
    }
    if (rvfc) loop()
    else v.addEventListener('timeupdate', paint)
    v.addEventListener('seeked', paint)
    return () => {
      stopped = true
      if (rvfc && handle)
        (v as HTMLVideoElement & { cancelVideoFrameCallback: (h: number) => void }).cancelVideoFrameCallback(handle)
      v.removeEventListener('timeupdate', paint)
      v.removeEventListener('seeked', paint)
    }
  }, [src])

  const toggle = () => {
    const v = video.current
    if (!v) return
    if (v.paused) {
      userPaused.current = false
      v.play().catch(() => {})
    } else {
      userPaused.current = true
      v.pause()
    }
  }

  const seek = (at: number) => {
    const v = video.current
    if (!v) return
    v.currentTime = at
    userPaused.current = false
    v.play().catch(() => {})
  }

  const toggleSound = () => {
    const v = video.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const showBigPlay = manual && !playing

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-card bg-sand-950 ring-1 ring-sand-300 dark:ring-sand-50/10">
        <video
          ref={video}
          src={src ?? undefined}
          poster={HERO_FILM.poster}
          muted
          playsInline
          loop
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-label="whoosh reel: a prompt is typed and becomes a 15 second film"
          className="h-full w-full object-cover"
        />
        {showBigPlay && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Play the whoosh reel"
            className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-sand-50/10 text-sand-50 ring-1 ring-sand-50/20 backdrop-blur-sm transition-colors hover:bg-sand-50/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-50/60"
          >
            <Play size={20} />
          </button>
        )}
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          <button
            type="button"
            onClick={toggle}
            aria-pressed={playing}
            aria-label={playing ? 'Pause film' : 'Play film'}
            className={CONTROL}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={!muted}
            aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
            className={CONTROL}
          >
            {muted ? <VolumeOff size={16} /> : <VolumeHigh size={16} />}
          </button>
        </div>
      </div>

      <div
        className="mt-3 grid gap-1 px-1 sm:mt-4"
        style={{ gridTemplateColumns: CHAPTERS.map((c) => `${c.end - c.at}fr`).join(' ') }}
      >
        {CHAPTERS.map((c, i) => {
          const on = i === current
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => seek(c.at)}
              aria-label={`Jump to chapter ${i + 1}, ${c.label}`}
              aria-current={on ? 'true' : undefined}
              className="group min-w-0 cursor-pointer rounded-chip pt-2.5 pb-1 text-left transition-transform duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.97]"
            >
              <span className="relative block h-0.5 origin-bottom overflow-hidden rounded-full bg-sand-300 transition-[transform,background-color] duration-150 ease-out group-hover:scale-y-[2] group-hover:bg-sand-500 group-active:scale-y-[2] group-active:bg-sand-600 dark:bg-sand-800 dark:group-hover:bg-sand-600 dark:group-active:bg-sand-500">
                <span
                  ref={(el) => {
                    fills.current[i] = el
                  }}
                  className="absolute inset-0 origin-left scale-x-0 bg-sand-900 dark:bg-sand-50"
                />
              </span>
              <span
                className={`mt-2 hidden truncate font-mono text-[11px] tracking-wide transition-colors duration-150 sm:block ${
                  on
                    ? 'text-sand-900 dark:text-sand-50'
                    : 'text-sand-600 group-hover:text-sand-900 dark:text-sand-400 dark:group-hover:text-sand-50'
                }`}
              >
                <span className="text-sand-600 transition-colors duration-150 group-hover:text-sand-700 dark:text-sand-400 dark:group-hover:text-sand-300">
                  {String(i + 1).padStart(2, '0')}
                </span>{' '}
                {c.label}
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-1 px-1 font-mono text-[11px] tracking-wide text-sand-900 sm:hidden dark:text-sand-50" aria-hidden>
        <span className="text-sand-600 dark:text-sand-400">{String(current + 1).padStart(2, '0')}</span>{' '}
        {CHAPTERS[current].label}
      </p>
    </div>
  )
}
