'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import { formatAuthError } from '../../lib/auth-errors'
import { PasswordInput } from '../PasswordInput'
import { Button, buttonClasses } from '../../components/Button'
import { AuthPagePopup } from '../AuthPagePopup'

// ─── ResetPasswordForm ───────────────────────────────────────────────────────
// Sets a new password on a recovery-issued session. The recovery flow:
//   1. user clicks the email link
//   2. /account/auth/callback exchanges the code, sets a session, AND drops a
//      short-lived HTTP-only cookie (`ac_recovery_session`)
//   3. user lands here; the server page reads the cookie and tells us via
//      `hasRecoveryMarker` whether this session is a fresh recovery one
//
// Without the marker, we refuse to render the form — that blocks the
// "attacker with a stolen signed-in browser navigates here to rotate the
// password" path while still letting legitimate recovery emails through.
// (We don't inspect the JWT for `amr: recovery` because Supabase doesn't
// reliably stamp that across versions, and the cookie marker is
// authoritative anyway.)

type Props = {
  hasRecoveryMarker: boolean
}

export function ResetPasswordForm({ hasRecoveryMarker }: Props) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    if (password.length < 8) {
      setError('Use at least 8 characters.')
      return
    }

    setSubmitting(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (updateError) {
      setError(formatAuthError(updateError))
      return
    }
    router.push('/account')
    router.refresh()
  }

  if (!hasRecoveryMarker) {
    return (
      <AuthPagePopup>
        <h1 className="text-2xl font-bold text-sand-900 dark:text-sand-50">
          Use a fresh recovery link
        </h1>
        <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">
          For your security, the password reset page only works right after
          you click a recovery link in your email. Request a new one to
          continue.
        </p>
        <Link
          href="/account/forgot-password"
          className={`mt-6 ${buttonClasses({ variant: 'primary', size: 'md', fullWidth: true })}`}
        >
          Send me a recovery link
        </Link>
      </AuthPagePopup>
    )
  }

  return (
    <AuthPagePopup>
      <h1 className="text-2xl font-bold text-sand-900 dark:text-sand-50">
        Set a new password
      </h1>
      <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">
        Choose something at least 8 characters long.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400"
          >
            New password
          </label>
          <PasswordInput
            id="password"
            required
            autoFocus
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="confirm"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400"
          >
            Confirm new password
          </label>
          <PasswordInput
            id="confirm"
            required
            autoComplete="new-password"
            minLength={8}
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
          {submitting ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthPagePopup>
  )
}
