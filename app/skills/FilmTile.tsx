'use client'

import { useEffect, useRef, useState } from 'react'
import { CirclePlay } from '@/app/_icons/icons/circle-play'

// An example film: plays on hover or focus with a fine pointer, on tap with a
// touch screen, and only on click when motion is reduced.
export function FilmTile({
  src,
  poster,
  label,
  className = '',
}: {
  src: string
  poster: string
  label: string
  className?: string
}) {
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [hoverPlays, setHoverPlays] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setHoverPlays(fine && !reduce)
  }, [])

  const play = () => video.current?.play().catch(() => {})
  const stop = () => {
    const v = video.current
    if (!v) return
    v.pause()
    v.currentTime = 0
  }
  const toggle = () => {
    const v = video.current
    if (!v) return
    if (v.paused) play()
    else v.pause()
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-card bg-sand-950 ring-1 ring-sand-200 dark:ring-sand-800 ${className}`}
    >
      <video
        ref={video}
        src={src}
        poster={poster}
        muted
        playsInline
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="h-full w-full object-cover"
        aria-hidden
      />
      <button
        type="button"
        aria-label={`${playing ? 'Pause' : 'Play'} ${label}`}
        aria-pressed={playing}
        onClick={hoverPlays ? undefined : toggle}
        onMouseEnter={hoverPlays ? play : undefined}
        onMouseLeave={hoverPlays ? stop : undefined}
        onFocus={hoverPlays ? play : undefined}
        onBlur={hoverPlays ? stop : undefined}
        className="absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sand-50/60"
      >
        <CirclePlay
          size={28}
          className={`text-sand-50/90 drop-shadow transition-opacity duration-150 ${playing ? 'opacity-0' : 'opacity-100'}`}
        />
      </button>
      <span className="pointer-events-none absolute bottom-3 left-3 rounded-chip bg-sand-950/60 px-2 py-1 font-mono text-[11px] text-sand-50/80">
        {label}
      </span>
    </div>
  )
}
