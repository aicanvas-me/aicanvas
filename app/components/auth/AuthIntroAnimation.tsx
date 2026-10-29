'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

// ─── AuthIntroAnimation ──────────────────────────────────────────────────────
// Generic two-phase intro animation used atop both auth modals. Cycles between
// a "before" illustration + headline and an "after" illustration + headline,
// with a flash burst, accent aura, and slide-in motion on each transition.
//
// Used by:
//   • NerdToHero      — sign-up flow (nerd → superhero, "YOU just got superpowers.")
//   • TerminatorReveal — sign-in flow (cool → skull, "I'll be back." → "Told you.")
//
// Symmetric dwell — 3s on each phase keeps the rhythm even.
// The "after" headline lands ~150ms after the illustration so the rhythm
// reads as ta-da → punchline instead of both moving in unison.
//
// Honors prefers-reduced-motion: no auto-cycle, no scale/flash; user sees
// the static "after" state with the longer headline.

const BEFORE_MS = 3000
const AFTER_MS = 3000

export type AuthIntroAnimationProps = {
  BeforeIllustration: React.ComponentType
  AfterIllustration: React.ComponentType
  beforeHeadline: React.ReactNode
  afterHeadline: React.ReactNode
}

export function AuthIntroAnimation({
  BeforeIllustration,
  AfterIllustration,
  beforeHeadline,
  afterHeadline,
}: AuthIntroAnimationProps) {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<'before' | 'after'>('before')

  useEffect(() => {
    if (reduceMotion) return
    const delay = phase === 'before' ? BEFORE_MS : AFTER_MS
    const id = setTimeout(() => {
      setPhase((p) => (p === 'before' ? 'after' : 'before'))
    }, delay)
    return () => clearTimeout(id)
  }, [reduceMotion, phase])

  // When reduced-motion is on, lock the visible phase to "after" without
  // touching state — derived value avoids setState-in-effect (and the
  // cascading re-render react-hooks/set-state-in-effect warns about).
  const effectivePhase = reduceMotion ? 'after' : phase
  const isAfter = effectivePhase === 'after'

  return (
    <div className="flex flex-row items-center gap-4">
      {/* Illustration */}
      <div className="relative h-[104px] w-[84px] shrink-0">
        {/* Accent aura behind the "after" — fades in only on after phase */}
        <AnimatePresence>
          {isAfter && !reduceMotion && (
            <motion.div
              key="aura"
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
            >
              <div
                className="h-24 w-24 rounded-full bg-accent/25 blur-2xl"
                style={{ animation: 'authIntroPulse 2.4s ease-in-out infinite' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flash burst at the moment of transformation */}
        <AnimatePresence>
          {!reduceMotion && (
            <motion.div
              key={`flash-${phase}`}
              aria-hidden="true"
              initial={{ opacity: 0.55, scale: 0.4 }}
              animate={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div className="h-16 w-16 rounded-full bg-accent/70 blur-xl" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.82, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.9, rotate: 6 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-end justify-center [--ic-stroke:#000000] [--ic-tint:#D4D4CC]"
          >
            {isAfter ? <AfterIllustration /> : <BeforeIllustration />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Headline — fixed height to prevent layout shift between phases */}
      <div className="h-8 flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.h1
            key={phase}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
              // Stagger — illustration lands first, then the headline. Reads
              // as "ta-da → punchline" instead of both moving in unison.
              delay: reduceMotion ? 0 : 0.15,
            }}
            className="text-xl font-bold leading-tight text-sand-900 dark:text-sand-50"
          >
            {isAfter ? afterHeadline : beforeHeadline}
          </motion.h1>
        </AnimatePresence>
      </div>

      {/* Local keyframes — Tailwind v4 doesn't ship a default `pulse` that
          fits the soft aura we want behind the "after" state. */}
      <style>{`
        @keyframes authIntroPulse {
          0%, 100% { opacity: 0.65; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
    </div>
  )
}
