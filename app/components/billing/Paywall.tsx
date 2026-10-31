'use client'

import Link from 'next/link'
import { LockSimple } from '@/app/_icons'
import { useAuthModal } from '../auth/AuthModalProvider'
import { useSession } from '../auth/SessionProvider'
import type { PaywallReason } from './PaywallModalProvider'
import { AsciiArt } from '../auth/AsciiArt'

export type { PaywallReason }

// Decorative, blurred faux-source — for PREMIUM content the REAL bytes are
// withheld server-side (the source gate serves a placeholder item; the prompt
// gate never renders block 3 onward), so there is nothing real to blur. Free
// source and free prompts stay public to read.
const FAUX_SOURCE = `import { motion } from 'framer-motion'
import { useState, useCallback } from 'react'

export function Component({ value, onChange }: Props) {
  const [active, setActive] = useState(false)
  const handle = useCallback(() => setActive((a) => !a), [])

  return (
    <motion.button onClick={handle} animate={{ scale: active ? 1.02 : 1 }}>
      {value}
    </motion.button>
  )
}`

// Default sub-copy. True for standalones and blocks, where the source AND the
// build blocks of the prompt are both withheld. Surfaces that gate only one of
// the two Andromeda component views pass their own.
const DEFAULT_SUBTITLE = 'The full source and the remix prompt ship with Premium.'

/**
 * Inline locked state rendered where withheld content would be — the Code tab,
 * and the withheld blocks of a premium prompt. Shows a blurred teaser over two
 * CTAs: buy, and (signed out only) log in, since a subscriber who lands here
 * logged out has no other way in from this panel. `teaser` overrides the
 * blurred decoration so it matches whatever was withheld; `name` titles the
 * lock with the thing being unlocked.
 */
export function Paywall({
  teaser = FAUX_SOURCE,
  name,
  subtitle = DEFAULT_SUBTITLE,
  appearance = 'dark',
}: {
  // Accepted but unused: the lock no longer varies by reason, and callers still
  // pass what they know so the call site reads as the gate it is.
  reason?: PaywallReason
  limit?: number
  teaser?: string
  name?: string
  subtitle?: string
  /**
   * 'dark' (default) keeps the wall a dark slab in both site themes - right
   * for a surface that is dark either way. 'themed' fades into the surface it
   * was dropped on: that surface names its own colour, both halves, in
   * --paywall-surface. A themed caller that names nothing gets the remix
   * panel's ground, which is what every themed caller sat on before.
   */
  appearance?: 'dark' | 'themed'
}) {
  const { open } = useAuthModal()
  const { user } = useSession()
  // Metering is gone — the inline lock only ever covers premium content now.
  // Named when the caller knows what it is gating; the fallback carries no type
  // noun, because this lock also covers blocks and templates.
  const title = name ? `Unlock ${name}` : 'Premium content'

  // No ground of its own: the teaser shows the surrounding slab at the top and
  // the overlay gradient fades it out, so the wall blends in instead of
  // starting on a hard edge. A themed wall fades to the surface it actually
  // sits on rather than a fixed grey, because those surfaces differ - the code
  // panel is near-white, the remix panel a step darker - and a fade to the
  // wrong one reads as a band across the panel. The surface names its colour
  // in --paywall-surface; --paywall-fallback is the remix panel's ground, kept
  // as the default so a caller that names nothing looks exactly as it did.
  const themed = appearance === 'themed'
  const overlay = themed
    ? '[--paywall-fallback:var(--color-sand-300)] dark:[--paywall-fallback:var(--color-sand-950)] bg-gradient-to-b from-[var(--paywall-surface,var(--paywall-fallback))]/0 via-[var(--paywall-surface,var(--paywall-fallback))]/85 to-[var(--paywall-surface,var(--paywall-fallback))]'
    : 'bg-gradient-to-b from-sand-950/0 via-sand-950/85 to-sand-950'
  // The chip is a tint of the same ground, not a fixed grey, for the reason the
  // fade is: a fixed fill flattens against a ground that matches it and floats
  // against one that does not. 90% reads as the same slight step down on every
  // themed ground, 62% gives the ring the separation border-sand-400 used to.
  // Dark keeps its literals, so it cannot move.
  const chip = themed
    ? 'border-[color-mix(in_srgb,var(--paywall-surface,var(--paywall-fallback))_62%,#000)] bg-[color-mix(in_srgb,var(--paywall-surface,var(--paywall-fallback))_90%,#000)] dark:border-sand-800 dark:bg-sand-900'
    : 'border-sand-800 bg-sand-900'
  // Themed grounds follow the site theme, so the glyph takes the accent ink;
  // the plain ground is dark in both themes and keeps a fixed light ink.
  const lockIcon = themed ? 'text-accent' : 'text-sand-50'
  const heading = themed ? 'text-sand-900 dark:text-sand-50' : 'text-sand-50'
  const sub = themed ? 'text-sand-600 dark:text-sand-400' : 'text-sand-400'
  // transition-colors lives per appearance, not on the button, because only the
  // themed half changes colour on a theme flip. CSS cannot tell a theme flip
  // from a hover, so a themed button that eases its hover also eases the flip
  // and lands after the panel behind it. Snapping both is the trade. The dark
  // half has no dark: variants, so it never moved on a flip and keeps its ease.
  const login = themed
    ? 'border-sand-500 text-sand-700 hover:border-sand-600 hover:text-sand-900 dark:border-sand-700 dark:text-sand-200 dark:hover:border-sand-600 dark:hover:text-sand-50'
    : 'transition-colors border-sand-700 text-sand-200 hover:border-sand-600 hover:text-sand-50'

  // Wide enough (the Code tab, an install box), the wall is the sign-in card's
  // split: an open padlock in glyphs on the left in its own inset card, the
  // words on the right, on a solid ground. Narrow (the remix side panel), it
  // stays the centred lock over the blurred teaser. The switch is a container
  // query, so each caller gets the layout its own width can hold.
  const splitGround = themed
    ? '@2xl:bg-none @2xl:bg-[var(--paywall-surface,var(--paywall-fallback))]'
    : '@2xl:bg-none @2xl:bg-sand-950'
  const artCard = themed
    ? 'border-sand-200 bg-sand-100 text-sand-900 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-100'
    : 'border-sand-800 bg-sand-900 text-sand-100'

  return (
    // h-full fills a pane of fixed height (the Code tab); in a pane that grows
    // with its content it resolves to auto and the 360px floor holds.
    <div className="@container relative h-full min-h-[360px] w-full overflow-hidden">
      <pre
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none overflow-hidden whitespace-pre-wrap p-5 font-mono text-sm leading-relaxed text-sand-600 opacity-30 blur-[3px] @2xl:hidden"
      >
        {teaser}
      </pre>
      <div className={`absolute inset-0 flex ${overlay} ${splitGround} @2xl:p-2`}>
        <div aria-hidden className={`relative hidden w-1/2 shrink-0 overflow-hidden rounded-card border @2xl:block ${artCard}`}>
          <AsciiArt subject="lock" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center @2xl:items-start @2xl:px-12 @2xl:text-left">
          <div className={`flex h-11 w-11 items-center justify-center rounded-full border @2xl:hidden ${chip}`}>
            <LockSimple size={20} className={lockIcon} />
          </div>
          <h3 className={`text-base font-bold @2xl:text-xl ${heading}`}>{title}</h3>
          <p className={`max-w-xs text-sm leading-relaxed ${sub}`}>{subtitle}</p>
          {/* Hand-skinned, not buttonClasses: the wall pairs its buttons with its
              own ground per appearance. */}
          <div className="mt-1 flex items-center gap-2">
            <Link
              href="/pricing"
              className="rounded-control bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/85"
            >
              Get Premium
            </Link>
            {!user && (
              <button
                type="button"
                onClick={() => open()}
                className={`rounded-control border px-4 py-2 text-sm font-semibold ${login}`}
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
