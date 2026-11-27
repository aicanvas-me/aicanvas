'use client'

import { useEffect, useRef, useState } from 'react'
import { TILE_FILMS } from '@/app/skills/_lib/media'
import { Play } from '@/app/_icons/icons/play'
import { Pause } from '@/app/_icons/icons/pause'
import { buttonClasses } from '@/app/components/buttonClasses'
import styles from './variant.module.css'

const FILMS = ['product-launch', 'app-demo', 'mobile-app-ad'].map(id => TILE_FILMS.find(film => film.id === id)!)

// FilmTile has no persistent pause control outside reduced-motion mode.
// These cards keep playback directly controllable for every visitor.
function Film({ film, className }: { film: typeof TILE_FILMS[number]; className: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [requested, setRequested] = useState<boolean | null>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    const sync = () => {
      if (visible && !document.hidden && (requested ?? !reduced.matches)) void video.play().catch(() => {})
      else video.pause()
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() }, { threshold: 0.15 })
    observer.observe(video)
    reduced.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      observer.disconnect()
      reduced.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
      video.pause()
    }
  }, [requested])

  return (
    <div className={`relative min-h-0 overflow-hidden rounded-card bg-sand-950 ${className}`}>
      <video ref={ref} src={film.src} poster={film.poster} muted loop playsInline preload="none" aria-label={`${film.label} made with whoosh`} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} className="absolute inset-0 h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-sand-950/90 to-transparent" />
      <span className="pointer-events-none absolute bottom-3 left-3 max-w-[calc(100%-3.5rem)] text-[11px] font-semibold text-sand-50 sm:text-xs">{film.label}</span>
      <button type="button" aria-label={`${playing ? 'Pause' : 'Play'} ${film.label}`} onClick={() => setRequested(!playing)} className={`${buttonClasses({ variant: 'icon', size: 'sm' })} ${styles.filmControl} absolute right-1.5 bottom-1.5`}>
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
    </div>
  )
}

export function FilmWall() {
  return (
    <div className="grid grid-cols-[1.55fr_1fr] gap-2 sm:gap-3">
      <Film film={FILMS[0]} className="aspect-video" />
      <Film film={FILMS[2]} className="col-start-2 row-span-2 row-start-1" />
      <Film film={FILMS[1]} className="aspect-video" />
    </div>
  )
}
