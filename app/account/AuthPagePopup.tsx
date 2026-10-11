'use client'

import { useRouter } from 'next/navigation'
import { X } from '@phosphor-icons/react'
import { Button } from '../components/Button'

// ─── AuthPagePopup ───────────────────────────────────────────────────────────
// Shared modal-style wrapper for the standalone auth pages — sign-in, sign-up,
// forgot-password, reset-password. Matches the AuthModal popup look (dark
// backdrop, centered card, X close in the top-right) so users landing on these
// pages directly (from emails, redirect failures, or direct URLs) see the same
// affordance as the in-app modal.
//
// The close button navigates to `closeHref` (default `/`) — for these pages
// there's no "previous in-app" location to return to, so home is the safe
// default. Caller can override (e.g. sign-up's "Sign in" link could close
// to `/account/sign-in` if needed).

type Props = {
  children: React.ReactNode
  closeHref?: string
  // A side panel next to the form (desktop) or above it (phone): the card widens to two
  // columns. Used when an AI agent's sign-in opened the page, to say why.
  aside?: React.ReactNode
}

export function AuthPagePopup({ children, closeHref = '/', aside }: Props) {
  const router = useRouter()
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-sand-950/80 backdrop-blur-sm"
      />
      <div
        className={`relative z-10 max-h-full w-full overflow-y-auto rounded-xl border border-sand-200 bg-sand-100 shadow-2xl dark:border-sand-800 dark:bg-sand-900 ${
          aside ? 'max-w-4xl' : 'max-w-md p-8'
        }`}
      >
        <Button
          variant="icon"
          size="md"
          onClick={() => router.push(closeHref)}
          aria-label="Close"
          className="absolute right-3 top-3"
        >
          <X weight="regular" size={18} />
        </Button>
        {aside ? (
          <div className="grid md:grid-cols-2">
            <div className="border-b border-sand-200 p-8 md:border-b-0 md:border-r dark:border-sand-800">{aside}</div>
            <div className="p-8">{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
