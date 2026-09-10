'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase/client'
import { formatAuthError } from '../../lib/auth-errors'
import { Button } from '../../components/Button'
import { AuthPagePopup } from '../AuthPagePopup'

// ─── ForgotPasswordForm ──────────────────────────────────────────────────────
// Step 1 of recovery: user enters email, we send a Supabase recovery link.
// The email's link points at /account/auth/callback?next=/account/reset-password
// — the existing callback exchanges the code for a recovery session and then
// the user lands on the reset-password page already authenticated.

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account/auth/callback?next=/account/reset-password`,
    })
    setSubmitting(false)
    if (resetError) {
      setError(formatAuthError(resetError))
      return
    }
    setSent(true)
  }

  return (
    <AuthPagePopup closeHref="/account/sign-in">
      <h1 className="text-2xl font-bold text-sand-900 dark:text-sand-50">
        Reset your password
      </h1>
        <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">
          Enter the email on your account and we&apos;ll send you a link to set a new
          password.
        </p>

        {sent ? (
          <div className="mt-6 rounded-lg border border-olive-500/30 bg-olive-500/10 p-4 text-sm text-sand-900 dark:text-sand-100">
            If an account uses <strong>{email}</strong>, a reset link is on its
            way. Check your inbox (and spam folder) — the link expires in about
            an hour.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-sand-200 bg-sand-100 px-3 py-2 text-base text-sand-900 outline-none transition-colors placeholder:text-sand-600 focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20 md:text-sm dark:border-sand-700 dark:bg-sand-950 dark:text-sand-50 dark:placeholder:text-sand-600"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        )}

      <p className="mt-6 text-center text-sm text-sand-600 dark:text-sand-400">
        Remembered it?{' '}
        <Link
          href="/account/sign-in"
          className="font-semibold text-olive-600 hover:underline dark:text-olive-400"
        >
          Sign in
        </Link>
      </p>
    </AuthPagePopup>
  )
}
