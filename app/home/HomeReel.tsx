'use client'

// The whoosh showreel on the homepage. It plays itself once, muted, when it is
// half in view, then holds its last frame with a replay control: the section has
// to prove motion, and a film that loops forever behind the pricing pitch pulls
// attention off it. Reduced motion and data saver get the poster and a play
// button instead, and phones get the small file.

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Play } from '@/app/_icons/icons/play'
import { Pause } from '@/app/_icons/icons/pause'
import { RotateCcw } from '@/app/_icons/icons/rotate-ccw'
import { VolumeHigh } from '@/app/_icons/icons/volume-high'
import { VolumeOff } from '@/app/_icons/icons/volume-off'
import { HERO_FILM } from '../skills/_lib/media'
import { useMedia } from './useMedia'

const CONTROL =
  'flex h-9 items-center gap-1.5 rounded-full bg-sand-950/60 px-3 text-[12px] font-semibold text-sand-50 ring-1 ring-sand-50/15 transition-colors hover:bg-sand-950/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-50/60'

const never = () => () => {}
const saveData = () => !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData

export function HomeReel() {
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [muted, setMuted] = useState(true)

  // No film in the server HTML: the browser picks the size once it knows the screen.
  const client = useSyncExternalStore(never, () => true, () => false)
  const wide = useMedia('(min-width: 1024px)', false)
  const src = client ? (wide ? HERO_FILM.desktop : HERO_FILM.mobile) : null
  const reduce = useMedia('(prefers-reduced-motion: reduce)', false)
  const lowData = useSyncExternalStore(never, saveData, () => false)
  const manual = reduce || lowData

  // One automatic play per visit, when half the player is on screen.
  const autoPlayed = useRef(false)
  useEffect(() => {
    const v = video.current
    if (!v || !src || manual) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !autoPlayed.current) {
          autoPlayed.current = true
          v.play().catch(() => {})
        } else if (!entry.isIntersecting) {
          v.pause()
        }
      },
      { threshold: 0.5 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [src, manual])

  const toggle = () => {
    const v = video.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  // Sound is a restart: the film is 17 seconds and its sound design starts at the top.
  const sound = () => {
    const v = video.current
    if (!v) return
    const next = !muted
    setMuted(next)
    v.muted = next
    if (!next) {
      v.currentTime = 0
      v.play().catch(() => {})
    }
  }

  const replay = () => {
    const v = video.current
    if (!v) return
    v.currentTime = 0
    v.play().catch(() => {})
  }

  return (
    <div className="relative overflow-hidden rounded-section border border-sand-200 bg-sand-950 dark:border-sand-800">
      <video
        ref={video}
        src={src ?? undefined}
        poster={HERO_FILM.poster}
        // The attribute stays set for autoplay; the sound button moves v.muted itself.
        muted
        playsInline
        preload="metadata"
        className="aspect-video h-full w-full object-cover"
        aria-label="The whoosh showreel: a motion-graphics video an agent wrote in code"
        onPlay={() => {
          setPlaying(true)
          setEnded(false)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setEnded(true)
        }}
      />

      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        {ended ? (
          <button type="button" onClick={replay} className={CONTROL}>
            <RotateCcw size={14} />
            Replay
          </button>
        ) : (
          <button type="button" onClick={toggle} className={CONTROL} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause size={14} /> : <Play size={14} />}
            {playing ? 'Pause' : 'Play'}
          </button>
        )}
        <button type="button" onClick={sound} className={CONTROL}>
          {muted ? <VolumeOff size={14} /> : <VolumeHigh size={14} />}
          {muted ? 'Play with sound' : 'Sound on'}
        </button>
      </div>
    </div>
  )
}
