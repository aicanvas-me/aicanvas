'use client'

// npm install framer-motion

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'


const SETS = [
  {
    label: 'Party!',
    emojis: ['🎉', '🎊', '🥳', '🎈', '🎁', '✨', '🌟', '🪅'],
    bg: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
    shadow: 'rgba(139,92,246,0.5)',
  },
  {
    label: 'Boom!',
    emojis: ['🔥', '💥', '⚡', '🌪️', '💫', '⭐', '🌈', '☄️'],
    bg: 'linear-gradient(135deg, #F97316, #DC2626)',
    shadow: 'rgba(249,115,22,0.5)',
  },
  {
    label: 'Yum!',
    emojis: ['🍕', '🍔', '🌮', '🍣', '🍩', '🧁', '🍦', '🍇'],
    bg: 'linear-gradient(135deg, #22C55E, #16A34A)',
    shadow: 'rgba(34,197,94,0.5)',
  },
  {
    label: 'Cute!',
    emojis: ['🐱', '🐶', '🐼', '🦊', '🦄', '🐸', '🐧', '🐨'],
    bg: 'linear-gradient(135deg, #06B6D4, #0284C7)',
    shadow: 'rgba(6,182,212,0.5)',
  },
  {
    label: 'Love!',
    emojis: ['❤️', '💜', '💙', '💚', '💛', '🧡', '💖', '💝'],
    bg: 'linear-gradient(135deg, #EC4899, #BE185D)',
    shadow: 'rgba(236,72,153,0.5)',
  },
] as const

const PARTICLE_COUNT = 18


interface Particle {
  id: number
  emoji: string
  angle: number
  distance: number
  rotation: number
  size: number
  duration: number
}

let uid = 0


function EmojiParticle({ p }: { p: Particle }) {
  const tx = Math.cos(p.angle) * p.distance
  const ty = Math.sin(p.angle) * p.distance
  const lift = 18 + Math.abs(Math.cos(p.angle)) * 22

  return (
    <motion.span
      className="pointer-events-none absolute select-none"
      style={{
        left: '50%',
        top: '50%',
        fontSize: `${p.size}rem`,
        lineHeight: 1,
        transformOrigin: 'center center',
        translateX: '-50%',
        translateY: '-50%',
      }}
      initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
      animate={{
        x: [0, tx * 0.5, tx],
        y: [0, ty * 0.5 - lift, ty],
        scale: [0, 1.25, 0.55],
        opacity: [1, 1, 0],
        rotate: [0, p.rotation * 0.5, p.rotation],
      }}
      transition={{
        duration: p.duration,
        ease: [[0.08, 0.82, 0.17, 1], 'linear'] as never,
        times: [0, 0.2, 1],
      }}
    >
      {p.emoji}
    </motion.span>
  )
}


export default function EmojiBurst() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [setIdx, setSetIdx]       = useState(0)
  const [isPopping, setIsPopping] = useState(false)

  const currentSet = SETS[setIdx % SETS.length]

  const explode = useCallback(() => {
    if (isPopping) return
    setIsPopping(true)

    const { emojis } = SETS[setIdx % SETS.length]

    const burst: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const baseAngle = (i / PARTICLE_COUNT) * Math.PI * 2
      const jitter    = (Math.random() - 0.5) * ((Math.PI * 2) / PARTICLE_COUNT) * 0.8
      return {
        id:       uid++,
        emoji:    emojis[Math.floor(Math.random() * emojis.length)],
        angle:    baseAngle + jitter,
        distance: 85 + Math.random() * 95,
        rotation: (Math.random() - 0.5) * 640,
        size:     1.4 + Math.random() * 0.9,
        duration: 0.55 + Math.random() * 0.25,
      }
    })

    setParticles(burst)
    setSetIdx(prev => prev + 1)

    // Particles live up to 0.8 s: keep this clear-out longer than their duration.
    setTimeout(() => {
      setParticles([])
      setIsPopping(false)
    }, 850)
  }, [setIdx, isPopping])

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#E8E8DF] dark:bg-[#1A1A19]">
      <div className="relative flex items-center justify-center">

        <AnimatePresence>
          {particles.map(p => (
            <EmojiParticle key={p.id} p={p} />
          ))}
        </AnimatePresence>

        <motion.button
          onClick={explode}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          className="relative z-10 cursor-pointer rounded-full px-14 py-4 text-xl font-bold text-white select-none"
          style={{
            background:  currentSet.bg,
            boxShadow:   `0 8px 32px ${currentSet.shadow}, 0 2px 8px rgba(0,0,0,0.3)`,
            letterSpacing: '-0.01em',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={setIdx}
              className="block"
              initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
              exit={{    opacity: 0, y:  8,  filter: 'blur(4px)' }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
            >
              {currentSet.label}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  )
}
