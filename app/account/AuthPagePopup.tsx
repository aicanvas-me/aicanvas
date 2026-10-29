'use client'

import { useRouter } from 'next/navigation'
import { AuthCard } from '../components/auth/AuthCard'

// ─── AuthPagePopup ───────────────────────────────────────────────────────────
// Shared frame for the standalone auth pages — sign-in, sign-up,
// forgot-password, reset-password. People land on these from emails, redirect
// failures or a typed URL. The card is the in-app AuthModal's card (AuthCard:
// art left, form right on a laptop), set on the
// page under the site's top navigation instead of over a dimmed backdrop, so
// the bar stays in view as the way back to the rest of the site. One soft accent
// light sits behind it in dark; on the light page a wash that size reads as a
// grey smudge, so light goes without it.
//
// The main must stay free to grow past the viewport: the page slot above it
// has a fixed height, and any overflow other than visible or clip would let
// this flex item shrink to that height and cut the card off on a short window
// with nothing left to scroll. overflow-x-clip only keeps the glow's blur from
// widening the page.
//
// The close button navigates to `closeHref` (default `/`) — for these pages
// there's no "previous in-app" location to return to, so home is the safe
// default. Caller can override (forgot-password closes to sign-in).

type Props = {
  children: React.ReactNode
  closeHref?: string
}

export function AuthPagePopup({ children, closeHref = '/' }: Props) {
  const router = useRouter()
  return (
    <main className="relative isolate flex flex-1 flex-col items-center justify-center overflow-x-clip px-4 py-10 sm:py-16">
      {/* A radial gradient, not a blurred disc: a blur this large renders as
          visible vertical bands in Chrome on the dark page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
        style={{ backgroundImage: 'radial-gradient(36rem 24rem at 50% 50%, color-mix(in srgb, var(--color-accent) 5%, transparent), transparent 70%)' }}
      />
      <AuthCard
        onClose={() => router.push(closeHref)}
        className="aic-hero-rise shadow-[0_1px_2px_rgba(0,0,0,0.05),0_16px_40px_-16px_rgba(0,0,0,0.14)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_24px_56px_-20px_rgba(0,0,0,0.7)]"
      >
        {children}
      </AuthCard>
    </main>
  )
}
