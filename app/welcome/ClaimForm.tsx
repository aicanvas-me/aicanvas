'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '../lib/supabase/client'

// ─── ClaimForm ────────────────────────────────────────────────────────────────
// The one claim path on /welcome: email in, one-time sign-in link out. This is
// deliberately the ONLY sign-in affordance on the page — no OAuth button. A
// buyer whose Google address differs from the checkout email would land in a
// fresh free account and see a paywall seconds after paying (it happened); the
// magic link can only go to the address that owns the Premium account.
// shouldCreateUser:false keeps account creation on the deliberate sign-up path,
// and the sent-state copy stays neutral about whether the email has an account.

export function ClaimForm() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // The sent state REPLACES the form, removing the focused submit button from
  // the DOM. Move focus onto the confirmation so keyboard users don't drop to
  // <body>; role="status" announces it to screen readers.
  const sentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (sent) sentRef.current?.focus()
  }, [sent])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubmitting(true)
    setError(null)
    const supabase = createClient()
    const emailRedirectTo = `${window.location.origin}/account/auth/callback?next=${encodeURIComponent('/welcome')}`
    const attempt = () =>
      supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo, shouldCreateUser: false },
      })
    const isRateLimited = (err: { message?: string; status?: number }) => {
      const msg = (err.message ?? '').toLowerCase()
      return msg.includes('rate') || msg.includes('too many') || err.status === 429
    }

    const started = Date.now()
    let { error: otpError } = await attempt()
    if (otpError && !isRateLimited(otpError)) {
      // A buyer can reach this form seconds after paying, ahead of the webhook
      // that provisions their account (~2s). One silent retry covers that
      // window; the wire already told this browser the first attempt failed,
      // so retrying reveals nothing new.
      await new Promise((r) => setTimeout(r, 4000))
      ;({ error: otpError } = await attempt())
    }
    if (otpError && isRateLimited(otpError)) {
      setError('Too many requests. Please wait a minute and try again.')
      setSubmitting(false)
      return
    }
    // Any other error (e.g. no account for this email) stays neutral: the sent
    // state below reads the same either way, so the form cannot be used to
    // probe which emails are registered. Pad every path to the same floor so
    // the retry above is not distinguishable by timing either.
    const FLOOR_MS = 5000
    const elapsed = Date.now() - started
    if (elapsed < FLOOR_MS) await new Promise((r) => setTimeout(r, FLOOR_MS - elapsed))
    setSent(true)
    setSubmitting(false)
  }

  if (sent) {
    return (
      <div className="mt-8 w-full max-w-sm">
        <div
          ref={sentRef}
          tabIndex={-1}
          role="status"
          className="rounded-lg border border-olive-500/30 bg-olive-500/10 px-4 py-3 text-left text-sm leading-relaxed text-sand-200 outline-none"
        >
          Check your inbox. If an account exists for <strong className="text-sand-50">{email}</strong>,
          a one-time sign-in link is on its way. It expires in 1 hour.
        </div>
        <button
          type="button"
          onClick={() => {
            setSent(false)
            setEmail('')
          }}
          className="mt-3 text-xs text-sand-500 transition-colors hover:text-sand-300"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 w-full max-w-sm">
      <label htmlFor="claim-email" className="sr-only">
        Email you used at checkout
      </label>
      <input
        id="claim-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email you used at checkout"
        className="h-11 w-full rounded-lg border border-sand-700 bg-sand-900 px-4 text-sm text-sand-100 placeholder:text-sand-500 focus:border-olive-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={submitting}
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-lg bg-olive-500 px-6 text-sm font-semibold text-sand-950 transition-colors hover:bg-olive-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Sending…' : 'Email me my sign-in link'}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-left text-sm text-red-400">
          {error}
        </p>
      )}
    </form>
  )
}
