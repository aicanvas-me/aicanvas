'use client'

import { useState } from 'react'
import { Info } from '@/app/_icons/icons/info'
import { createClient } from '../lib/supabase/client'
import { formatAuthError } from '../lib/auth-errors'
import { PasswordInput } from '../account/PasswordInput'
import { buttonClasses } from '../components/buttonClasses'

// For an account a checkout made: a password now means next week's sign-in
// needs no email link. Set mode only (the account has no password the buyer
// knows); clearing password_unknown hands settings back its change mode.
export function AddPasswordCard({ email }: { email: string | null }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) return setError('Use at least 8 characters.')
    if (password !== confirm) return setError("Passwords don't match.")
    setSubmitting(true)
    setError(null)
    const { error: updateError } = await createClient().auth.updateUser({ password, data: { password_unknown: null } })
    setSubmitting(false)
    if (updateError) return setError(formatAuthError(updateError))
    setDone(true)
  }

  const who = email ?? 'your email'

  return (
    <div
      className="aic-hero-rise mx-auto mt-12 w-full max-w-md rounded-3xl border border-sand-200 bg-sand-100 p-2 text-left dark:border-sand-800 dark:bg-sand-900"
      style={{ animationDelay: '0.5s' }}
    >
      <div className="px-4 pt-4 pb-5 sm:px-5 sm:pt-5">
        <h2 className="text-lg font-bold tracking-tight text-sand-900 dark:text-sand-50">Add a password</h2>
        {done ? (
          <p role="status" className="mt-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3.5 text-sm leading-relaxed text-sand-700 dark:text-sand-200">
            Password saved. Next time, sign in with{' '}
            <strong className="break-words text-sand-900 dark:text-sand-50">{who}</strong> and this password.
          </p>
        ) : (
          <>
            <p className="mt-1.5 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
              Next time, sign in with <strong className="break-words font-semibold text-sand-900 dark:text-sand-50">{who}</strong> and
              your password. No email link needed.
            </p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <label htmlFor="welcome-password" className="sr-only">Password</label>
              <PasswordInput
                id="welcome-password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
              />
              <label htmlFor="welcome-password-confirm" className="sr-only">Confirm password</label>
              <PasswordInput
                id="welcome-password-confirm"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Type it again"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value)
                  setError(null)
                }}
              />
              {error && (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className={`h-11 ${buttonClasses({ variant: 'primary', size: 'lg', fullWidth: true })}`}
              >
                {submitting ? 'Saving…' : 'Save password'}
              </button>
            </form>
          </>
        )}
      </div>
      <div className="flex items-start gap-2.5 rounded-2xl bg-sand-50/70 px-4 py-4 text-sm leading-relaxed text-sand-600 sm:px-5 dark:bg-sand-950 dark:text-sand-400">
        <Info size={16} className="mt-0.5 shrink-0 text-accent" />
        <span>Optional. You can add one later in account settings.</span>
      </div>
    </div>
  )
}
