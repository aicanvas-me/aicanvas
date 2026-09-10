'use client'

import { AuthIntroAnimation } from './AuthIntroAnimation'

// ─── TerminatorReveal ────────────────────────────────────────────────────────
// Sign-in intro pair. Thin wrapper around AuthIntroAnimation supplying the
// terminator illustrations (cool shades → exposed cyborg skull) and the
// "I'll be back." → "Told you." headline beat. Illustrations are referenced
// from /public/auth as SVG files (sourced from Figma node 410:1144) — Tailwind
// classes scale them inside the engine's fixed illustration slot.

export function TerminatorReveal() {
  return (
    <AuthIntroAnimation
      BeforeIllustration={TerminatorCool}
      AfterIllustration={TerminatorSkull}
      beforeHeadline={<>I&apos;ll be back.</>}
      afterHeadline={
        <>
          <span className="text-olive-600 dark:text-olive-400">Told</span> you.
        </>
      }
    />
  )
}

export function TerminatorCool() {
  return (
    <img
      src="/auth/terminator-cool.svg"
      alt=""
      aria-hidden="true"
      className="h-full w-auto"
    />
  )
}

export function TerminatorSkull() {
  return (
    <img
      src="/auth/terminator-skull.svg"
      alt=""
      aria-hidden="true"
      className="h-full w-auto"
    />
  )
}
