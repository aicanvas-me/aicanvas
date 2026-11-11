'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import { buttonClasses } from '../components/buttonClasses'

// ─── ClaimForm ────────────────────────────────────────────────────────────────
// The one claim path on /welcome: email in, one-time sign-in link out. This is
// deliberately the ONLY sign-in affordance on the page — no OAuth button. A
// buyer whose Google address differs from the checkout email would land in a
// fresh free account and see a paywall seconds after paying (it happened); the
// magic link can only go to the address that owns the Premium account.
// shouldCreateUser:false keeps account creation on the deliberate sign-up path,
// and the sent-state copy stays neutral about whether the email has an account.
// It fills the claim card it sits on: the page owns its width and spacing.
// With presetEmail (the checkout email this tab already knows) it is one
// secondary button that sends a new link to that address.

export function ClaimForm({
  presetEmail,
  submitLabel = 'Email me my sign-in link',
}: { presetEmail?: string; submitLabel?: string } = {}) {
  const [email, setEmail] = useState(presetEmail ?? '')
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

  // Any edit clears the last message, same as every other account form.
  function clearStatus() {
    setError(null)
  }

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
      <div className="w-full">
        <div
          ref={sentRef}
          tabIndex={-1}
          role="status"
          className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3.5 text-left text-sm leading-relaxed text-sand-200 outline-none"
        >
          Check your inbox. If an account exists for <strong className="text-sand-50">{email}</strong>,
          a one-time sign-in link is on its way. It expires in 1 hour.
        </div>
        {!presetEmail && (
          <button
            type="button"
            onClick={() => {
              setSent(false)
              setEmail('')
            }}
            className="mt-3 rounded-md text-sm font-medium text-sand-400 transition-colors hover:text-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Use a different email
          </button>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {!presetEmail && (
        <>
          <label htmlFor="claim-email" className="sr-only">
            Email you used at checkout
          </label>
          <input
            id="claim-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearStatus()
            }}
            placeholder="Email you used at checkout"
            className="mb-3 h-11 w-full rounded-control border border-sand-700 bg-sand-950 px-4 text-sm text-sand-100 transition-colors placeholder:text-sand-500 hover:border-sand-600 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
          />
        </>
      )}
      <button
        type="submit"
        disabled={submitting}
        className={`h-11 ${buttonClasses({ variant: presetEmail ? 'outline' : 'primary', size: 'lg', fullWidth: true })}`}
      >
        {submitting ? 'Sending…' : submitLabel}
      </button>
      {!presetEmail && (
        <p className="mt-3 text-center text-xs leading-relaxed text-sand-400">
          Newsletter included. Unsubscribe anytime, free.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-left text-sm text-red-400">
          {error}
        </p>
      )}
    </form>
  )
}
