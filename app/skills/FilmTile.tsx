'use client'

import { useEffect, useRef, useState } from 'react'
import { VolumeHigh } from '@/app/_icons/icons/volume-high'

// An example film. Every tile plays muted and looping while it is on screen;
// hovering or focusing one turns its sound on, and only that one. Reduced
// motion keeps them still until the viewer presses a tile.
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
  const [loud, setLoud] = useState(false)
  const [still, setStill] = useState(false)

  useEffect(() => {
    const v = video.current
    if (!v) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setStill(true); return }
    // Off-screen films stay paused, so eight autoplaying tiles cost one screen's worth.
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() },
      { rootMargin: '200px' },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  const sound = (on: boolean) => {
    const v = video.current
    if (!v) return
    if (on) document.querySelectorAll('video[data-film]').forEach((o) => { if (o !== v) (o as HTMLVideoElement).muted = true })
    v.muted = !on
    setLoud(on)
    if (on) v.play().catch(() => {})
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-card bg-sand-950 ring-1 ring-sand-200 dark:ring-sand-800 ${className}`}
    >
      <video
        ref={video}
        data-film
        src={src}
        poster={poster}
        muted
        playsInline
        loop
        autoPlay={!still}
        preload="metadata"
        className="h-full w-full object-cover"
        aria-hidden
      />
      <button
        type="button"
        aria-label={`${loud ? 'Mute' : 'Play sound for'} ${label}`}
        aria-pressed={loud}
        onClick={() => sound(!loud)}
        onMouseEnter={() => sound(true)}
        onMouseLeave={() => sound(false)}
        onFocus={() => sound(true)}
        onBlur={() => sound(false)}
        className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sand-50/60"
      />
      <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-chip bg-sand-950/60 px-2 py-1 font-mono text-[11px] text-sand-50/80">
        {label}
        <VolumeHigh size={13} className={`transition-opacity duration-150 ${loud ? 'opacity-100' : 'opacity-0'}`} />
      </span>
    </div>
  )
}
