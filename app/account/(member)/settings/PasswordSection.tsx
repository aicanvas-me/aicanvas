'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import { formatAuthError } from '../../../lib/auth-errors'
import { PasswordInput } from '../../PasswordInput'
import { Button } from '../../../components/Button'

// ─── PasswordSection ──────────────────────────────────────────────────────────
// In-account password management on /account/settings. The server decides the
// mode via `hasPassword`:
//   • change — the account already has a password. We require the CURRENT
//     password and re-verify it (signInWithPassword) before updating, so an
//     unlocked / stolen but already-signed-in session can't silently rotate the
//     password.
//   • set — an OAuth-only account (e.g. signed up with Google) with no password
//     yet. There's no current password to verify; updateUser({ password }) ADDS
//     an email+password identity so the user can also sign in with email later.
//
// Either path triggers Supabase's (now-enabled) "password changed" notification.

type Props = { hasPassword: boolean; email: string }

const LABEL = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400'

export function PasswordSection({ hasPassword, email }: Props) {
  const router = useRouter()
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function clearStatus() {
    setError(null)
    setDone(false)
  }

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
    if (hasPassword && current === password) {
      setError('Your new password must be different from your current one.')
      return
    }

    setSubmitting(true)
    const supabase = createClient()

    // Change mode: re-verify the current password first so a session that's
    // already signed in can't rotate the password without proving knowledge of it.
    if (hasPassword) {
      const { error: reauthError } = await supabase.auth.signInWithPassword({ email, password: current })
      if (reauthError) {
        setSubmitting(false)
        setError('Your current password is incorrect.')
        return
      }
    }

    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (updateError) {
      setError(formatAuthError(updateError))
      return
    }

    setCurrent('')
    setPassword('')
    setConfirm('')
    setDone(true)
    // A "set" becomes a "change" once the password exists — re-render to reflect it.
    router.refresh()
  }

  return (
    <div className="rounded-xl border border-sand-200 bg-sand-100 p-6 dark:border-sand-800 dark:bg-sand-900">
      <div className="text-lg font-bold text-sand-900 dark:text-sand-50">
        {hasPassword ? 'Change password' : 'Set a password'}
      </div>
      <div className="mt-1 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
        {hasPassword
          ? 'Update the password you use to sign in.'
          : 'You signed up with Google. Add a password so you can also sign in with your email.'}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 max-w-sm space-y-4">
        {hasPassword && (
          <div>
            <label htmlFor="current-password" className={LABEL}>
              Current password
            </label>
            <PasswordInput
              id="current-password"
              required
              autoComplete="current-password"
              placeholder="Your current password"
              value={current}
              onChange={(e) => {
                setCurrent(e.target.value)
                clearStatus()
              }}
            />
          </div>
        )}

        <div>
          <label htmlFor="new-password" className={LABEL}>
            New password
          </label>
          <PasswordInput
            id="new-password"
            required
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              clearStatus()
            }}
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className={LABEL}>
            Confirm new password
          </label>
          <PasswordInput
            id="confirm-password"
            required
            autoComplete="new-password"
            minLength={8}
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value)
              clearStatus()
            }}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
        {done && (
          <div className="rounded-lg border border-olive-500/30 bg-olive-500/10 px-3 py-2 text-sm text-sand-700 dark:text-sand-200">
            {hasPassword
              ? 'Password updated.'
              : 'Password set. You can now sign in with your email and password too.'}
          </div>
        )}

        <Button type="submit" variant="primary" size="md" disabled={submitting}>
          {submitting ? 'Saving…' : hasPassword ? 'Update password' : 'Set password'}
        </Button>
      </form>
    </div>
  )
}
