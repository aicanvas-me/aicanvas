'use client'

import { useEffect, useRef } from 'react'
import { useMedia } from '../home/useMedia'

// An example video. Every tile plays silent and looping while it is on screen;
// only the hero has sound. Reduced motion keeps them still until a press plays one.
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
    if (!v) return
    if (still) { v.pause(); return }
    // Off-screen films stay paused, so the autoplaying tiles cost one screen's worth.
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() },
      { rootMargin: '200px' },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [still])

  const toggle = () => {
    const v = video.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  return (
    <div
      className={`relative overflow-hidden bg-sand-950 ${framed ? 'rounded-card ring-1 ring-sand-200 dark:ring-sand-800' : ''} ${className}`}
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
      {still && (
        <button
          type="button"
          aria-label={`Play or pause ${label}`}
          onClick={toggle}
          className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sand-50/60"
        />
      )}
      <span className="pointer-events-none absolute bottom-3 left-3 rounded-chip bg-sand-950/60 px-2 py-1 font-mono text-[11px] text-sand-50/80">
        {label}
      </span>
    </div>
  )
}
