'use client'

// npm install @phosphor-icons/react framer-motion

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimationFrame, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Queue, ArrowLeft } from '@phosphor-icons/react'

// 6-digit hex only: two-digit alpha suffixes are appended to these colors.
const TRACKS = [
  { title: 'Midnight Drive',  artist: 'Neon Collective', color: '#FF6BF5', duration: 234 },
  { title: 'Glass Horizons',  artist: 'Aurora Synth',    color: '#06D6A0', duration: 198 },
  { title: 'Warm Signal',     artist: 'Dusk Protocol',   color: '#FF7B54', duration: 267 },
]

function formatTime(s: number) {
  const m   = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function GlassMusicPlayer() {
  const [trackIdx,  setTrackIdx]  = useState(0)
  const [playing,   setPlaying]   = useState(false)
  const [liked,     setLiked]     = useState(false)
  const [shuffled,  setShuffled]  = useState(false)
  const [elapsed,   setElapsed]   = useState(0)
  const rafRef      = useRef<number>(0)
  const startRef    = useRef(0)
  const progressRef = useRef(0)

  const progressMV  = useMotionValue(0)
  const barWidth    = useTransform(progressMV, v => `${v * 100}%`)
  const discRotation = useMotionValue(0)
  const reduceMotion = useReducedMotion()

  const track = TRACKS[trackIdx]

  useAnimationFrame((_, delta) => {
    if (playing && !reduceMotion) discRotation.set(discRotation.get() + delta * 0.09)
  })

  useEffect(() => {
    if (!playing) { cancelAnimationFrame(rafRef.current); return }
    const SPEED = 15
    startRef.current = performance.now() - progressRef.current * track.duration * (1000 / SPEED)
    let lastLabelUpdate = 0
    const tick = (now: number) => {
      const ms  = now - startRef.current
      const pct = Math.min(ms / (track.duration * (1000 / SPEED)), 1)
      progressRef.current = pct

      progressMV.set(pct)

      if (now - lastLabelUpdate > 250) {
        setElapsed(pct * track.duration)
        lastLabelUpdate = now
      }

      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setPlaying(false)
        progressRef.current = 0
        progressMV.set(0)
        setElapsed(0)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [playing, track.duration, progressMV])

  const skipTo = (dir: -1 | 1) => {
    setPlaying(false)
    progressRef.current = 0
    progressMV.set(0)
    setElapsed(0)
    setTrackIdx(i => (i + dir + TRACKS.length) % TRACKS.length)
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]">
      <img
        src="https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
      />

      <motion.div
        // No opacity in initial: below 1 it hides the blur until the fade ends.
        initial={{ y: 24, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="relative isolate w-[320px] overflow-hidden rounded-[32px]"
        style={{
          background: 'rgba(12,10,14,0.55)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        {/* z-[-1] relies on the card's isolate; without it the blur falls behind the page. */}
        <div
          className="pointer-events-none absolute inset-0 z-[-1] rounded-[32px]"
          style={{ backdropFilter: 'blur(48px) saturate(1.6)', WebkitBackdropFilter: 'blur(48px) saturate(1.6)' }}
        />
        <div
          className="absolute left-12 right-12 top-0 h-[1px]"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)' }}
        />

        <div className="flex flex-col items-center px-7 pb-7 pt-6">

          <div className="mb-6 flex w-full items-center justify-between">
            <motion.div
              aria-hidden
              whileHover={{ scale: 1.15, color: 'rgba(255,255,255,0.8)' }}
              whileTap={{ scale: 0.85 }}
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              <ArrowLeft size={20} weight="regular" />
            </motion.div>

            <span
              className="text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Now Playing
            </span>

            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => setLiked(l => !l)}
              className="cursor-pointer"
              animate={{ color: liked ? track.color : 'rgba(255,255,255,0.35)' }}
              transition={{ duration: 0.2 }}
            >
              <Heart size={20} weight={liked ? 'fill' : 'regular'} />
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={trackIdx}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className="relative mb-7"
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: track.color,
                  opacity: 0.18,
                  filter: 'blur(28px)',
                  transform: 'scale(1.15)',
                }}
              />
              <div
                className="relative flex h-44 w-44 items-center justify-center rounded-full"
                style={{
                  background: `radial-gradient(circle at 38% 35%, ${track.color}28, ${track.color}08 60%, transparent)`,
                  border: `1.5px solid ${track.color}25`,
                  boxShadow: `0 0 0 8px rgba(255,255,255,0.03), 0 12px 40px rgba(0,0,0,0.5)`,
                }}
              >
                <motion.div
                  className="relative h-28 w-28"
                  style={{ rotate: discRotation }}
                >
                  {[1, 0.78, 0.58, 0.38].map((s, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 rounded-full"
                      style={{
                        transform: `scale(${s})`,
                        border: `1px solid ${track.color}${i === 0 ? '30' : i === 1 ? '1e' : '14'}`,
                      }}
                    />
                  ))}
                  <div
                    className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      background: `radial-gradient(circle at 40% 40%, ${track.color}cc, ${track.color}66)`,
                      boxShadow: `0 0 10px ${track.color}55`,
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={trackIdx}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
              className="mb-4 flex flex-col items-center gap-1"
            >
              <h3 className="text-lg font-bold tracking-tight text-white/95">{track.title}</h3>
              <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.38)' }}>{track.artist}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mb-5 flex items-center gap-[7px]">
            {TRACKS.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  setPlaying(false)
                  progressRef.current = 0
                  progressMV.set(0)
                  setElapsed(0)
                  setTrackIdx(i)
                }}
                animate={{
                  width:           i === trackIdx ? 20 : 5,
                  opacity:         i === trackIdx ? 0.5 : 0.22,
                  backgroundColor: i === trackIdx ? track.color : '#ffffff',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="h-[5px] cursor-pointer rounded-full"
                style={{ minWidth: 5 }}
              />
            ))}
          </div>

          <div className="mb-5 w-full">
            <div
              className="relative h-[3px] w-full overflow-hidden rounded-full"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: barWidth,
                  background: `linear-gradient(90deg,${track.color}70,${track.color}dd)`,
                }}
              />
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-[10px] font-medium tabular-nums" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {formatTime(elapsed)}
              </span>
              <span className="text-[10px] font-medium tabular-nums" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {formatTime(track.duration)}
              </span>
            </div>
          </div>

          <div className="flex w-full items-center justify-between">

            <motion.button
              whileHover={{ scale: 1.15, color: shuffled ? track.color : 'rgba(255,255,255,0.75)' }}
              whileTap={{ scale: 0.85 }}
              onClick={() => setShuffled(s => !s)}
              className="cursor-pointer"
              animate={{ color: shuffled ? track.color : 'rgba(255,255,255,0.35)' }}
              transition={{ duration: 0.2 }}
            >
              <Shuffle size={19} weight="regular" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.12, color: 'rgba(255,255,255,0.95)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => skipTo(-1)}
              className="cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              <SkipBack size={26} weight="fill" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setPlaying(p => !p)}
              className="flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-full"
              animate={{
                background: `radial-gradient(circle at 38% 35%, ${track.color}ee, ${track.color}99)`,
                boxShadow: `0 4px 20px ${track.color}55, 0 0 0 1px ${track.color}33`,
              }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {playing ? (
                  <motion.div
                    key="pause"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Pause size={22} weight="fill" className="text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="play"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Play size={22} weight="fill" className="ml-0.5 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.12, color: 'rgba(255,255,255,0.95)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => skipTo(1)}
              className="cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              <SkipForward size={26} weight="fill" />
            </motion.button>

            <motion.div
              aria-hidden
              whileHover={{ scale: 1.15, color: 'rgba(255,255,255,0.75)' }}
              whileTap={{ scale: 0.85 }}
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              <Queue size={19} weight="regular" />
            </motion.div>

          </div>

        </div>
      </motion.div>
    </div>
  )
}
