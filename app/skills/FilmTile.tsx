'use client'

import { useEffect, useRef, useState } from 'react'
import { useMedia } from '../home/useMedia'
import { VolumeHigh } from '@/app/_icons/icons/volume-high'

// An example film. Every tile plays muted and looping while it is on screen;
// hovering or focusing one turns its sound on, and only that one. Reduced
// motion keeps them still until the viewer presses a tile.
export function FilmTile({
  src,
  poster,
  label,
  className = '',
  clip,
  framed = true,
}: {
  src: string
  poster?: string
  label: string
  className?: string
  // Loop only this stretch of the film, in seconds.
  clip?: { from: number; to: number }
  // false when a card around the tile already draws the frame.
  framed?: boolean
}) {
  const video = useRef<HTMLVideoElement>(null)
  const [loud, setLoud] = useState(false)
  const still = useMedia('(prefers-reduced-motion: reduce)', false)

  useEffect(() => {
    const v = video.current
    if (!v || !clip) return
    const { from, to } = clip
    const wrap = () => { if (v.currentTime < from || v.currentTime >= to) v.currentTime = from }
    // Checked on every painted frame where the browser allows, so the loop never shows the next chapter.
    const rvfc = typeof v.requestVideoFrameCallback === 'function'
    const tick = () => { wrap(); frame = v.requestVideoFrameCallback(tick) }
    let frame = rvfc ? v.requestVideoFrameCallback(tick) : 0
    if (!rvfc) v.addEventListener('timeupdate', wrap)
    v.addEventListener('loadedmetadata', wrap)
    if (v.readyState >= 1) wrap()
    return () => {
      if (rvfc) v.cancelVideoFrameCallback(frame)
      else v.removeEventListener('timeupdate', wrap)
      v.removeEventListener('loadedmetadata', wrap)
    }
  }, [clip])

  useEffect(() => {
    const v = video.current
    if (!v || still) return
    // Off-screen films stay paused, so the autoplaying tiles cost one screen's worth.
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() },
      { rootMargin: '200px' },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [still])

  const sound = (on: boolean) => {
    const v = video.current
    if (!v) return
    if (on) document.querySelectorAll('video[data-film]').forEach((o) => { if (o !== v) (o as HTMLVideoElement).muted = true })
    v.muted = !on
    setLoud(on)
    if (on) v.play().catch(() => {})
    else if (still) v.pause()
  }
  // Under reduced motion only a press starts a film; hover and focus leave it still.
  const hover = (on: boolean) => { if (!still || !on) sound(on) }

  return (
    <div
      className={`group relative overflow-hidden bg-sand-950 ${framed ? 'rounded-card ring-1 ring-sand-200 dark:ring-sand-800' : ''} ${className}`}
    >
      <video
        ref={video}
        data-film
        src={src}
        poster={poster}
        muted
        playsInline
        loop
        preload="metadata"
        className="h-full w-full object-cover"
        aria-hidden
      />
      <button
        type="button"
        aria-label={`${loud ? 'Mute' : 'Play sound for'} ${label}`}
        aria-pressed={loud}
        onClick={() => sound(!loud)}
        onMouseEnter={() => hover(true)}
        onMouseLeave={() => hover(false)}
        onFocus={() => hover(true)}
        onBlur={() => hover(false)}
        className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sand-50/60"
      />
      <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-chip bg-sand-950/60 px-2 py-1 font-mono text-[11px] text-sand-50/80">
        {label}
        <VolumeHigh size={13} className={`transition-opacity duration-150 ${loud ? 'opacity-100' : 'opacity-0'}`} />
      </span>
    </div>
  )
}
