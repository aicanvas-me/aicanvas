'use client'

// npm install framer-motion

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WORDS = ['Craft', 'interfaces', 'that', 'feel', 'like', 'magic.']
const ACCENTED = new Set([1, 5])


const STAGGER = 100
const DURATION = 650
const LAST_WORD_END = (WORDS.length - 1) * STAGGER + DURATION
const SHOW_BUTTON_AT = LAST_WORD_END + 150

export default function TextBlurReveal() {
  const [showCTA, setShowCTA] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowCTA(true), SHOW_BUTTON_AT)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden">

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-40 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
      </div>

      <div className="relative flex flex-wrap justify-center gap-x-[0.4em] gap-y-1">
        {WORDS.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 22, filter: 'blur(14px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{
              duration: DURATION / 1000,
              delay: (i * STAGGER) / 1000,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className={
              ACCENTED.has(i)
                ? 'bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-4xl tracking-tight text-transparent'
                : 'text-4xl tracking-tight text-white'
            }
            style={{ fontFamily: 'var(--font-geist-pixel-circle)' }}
          >
            {word}
          </motion.span>
        ))}
      </div>

      <motion.p
        key="sub"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.55,
          delay: ((WORDS.length - 1) * STAGGER + 200) / 1000,
          ease: 'easeOut',
        }}
        className="relative text-base text-zinc-400"
      >
        Drop any phrase. Works with any text.
      </motion.p>

      <div className="flex h-10 items-center justify-center">
      <AnimatePresence>
        {showCTA && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            whileHover={{ scale: 1.04, opacity: 0.9 }}
            whileFocus={{ opacity: 0.9 }}
            whileTap={{ scale: 0.97, opacity: 0.9 }}
            className="relative rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30"
          >
            Start building
          </motion.button>
        )}
      </AnimatePresence>
      </div>

    </div>
  )
}
