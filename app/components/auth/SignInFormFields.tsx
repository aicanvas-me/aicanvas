'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase/client'
import { formatAuthError } from '../../lib/auth-errors'
import { GoogleSignInButton } from '../../account/GoogleSignInButton'
import { PasswordInput } from '../../account/PasswordInput'
import { Button } from '../Button'
import { TerminatorReveal } from './TerminatorReveal'

// ─── SignInFormFields ─────────────────────────────────────────────────────────
// The actual sign-in form. Mirrors SignUpFormFields visually — same NerdToHero
// header, same Google → divider → form → switch-link → legal rhythm — so the
// two modes feel like a single product surface in two flavors.
//
// Two ways in, one form at a time:
//   • password mode (default): email + password, "Sign in", and a button that
//     switches to link mode
//   • link mode: email only, "Send sign-in link", and a way back. A password
//     field next to a passwordless action only confused people, so it is not
//     there at all.
// The email input is the same element in both modes, so what the user typed
// carries across the switch.
//
// Shared between:
//   • the standalone /account/sign-in page (wraps it in a card)
//   • the global AuthModal in "sign-in" mode (wraps it in a dialog)
//
// onSuccess fires after a password sign-in succeeds. Page version pushes to
// `next`; modal version closes itself. Both then call router.refresh().

type Props = {
  next: string
  onSuccess: () => void
  // When provided (modal context), the "Create an account" link becomes a
  // button that flips the modal mode in place. When omitted (standalone page
  // context), it renders as a Link that navigates to /account/sign-up.
  onSwitchToSignUp?: () => void
  // Pre-seeded error to display (e.g. the callback page failed and bounced
  // here with `?error=…`). Cleared on the first keystroke or submit so the
  // user sees feedback for their new action instead of stale callback text.
  initialError?: string | null
}

type Mode = 'password' | 'link'

export function SignInFormFields({ next, onSuccess, onSwitchToSignUp, initialError = null }: Props) {
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  // Magic-link state. Separate submitting flag so it doesn't fight the
  // password Sign in button's spinner.
  const [magicSubmitting, setMagicSubmitting] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // Any edit clears the last message. A message about a value the user has
  // since changed is worse than none: it kept telling people to enter an email
  // they had already entered.
  function clearStatus() {
    setError(null)
  }

  // Swapping modes is a new action, so the old message goes too, and focus
  // lands on the email field so the user can type straight away.
  function switchMode(to: Mode) {
    setMode(to)
    clearStatus()
    emailRef.current?.focus()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    // The password field is not `required` in the markup, on purpose: the
    // browser's own "fill in this field" bubble cannot mention the other way
    // in. Our message can.
    if (!password) {
      setError('Enter your password, or use "Email me a sign-in link" below.')
      passwordRef.current?.focus()
      return
    }
    setSubmitting(true)
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      // A common dead-end: the user signed up with Google and forgot, so the
      // password never matches. Ask the server if this email is a Google-only
      // account and, if so, point them at the Google button instead.
      let handled = false
      try {
        const r = await fetch('/api/auth/login-hint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (r.ok) {
          const j = (await r.json()) as { provider?: string }
          if (j.provider === 'google') {
            setError('You signed up with Google. Use "Sign in with Google" above to continue.')
            handled = true
          }
        }
      } catch {
        // network hiccup → fall through to the generic message
      }
      if (!handled) setError(formatAuthError(signInError))
      setSubmitting(false)
      return
    }
    onSuccess()
  }

  // Passwordless sign-in: email the user a one-time link that lands on
  // /account/auth/callback (the same route OAuth + confirmations use, which
  // already exchanges the code for a session). shouldCreateUser:false keeps
  // account creation on the deliberate sign-up path. We stay neutral about
  // whether the email has an account, so this can't be used to probe who's
  // registered — only a genuine rate-limit surfaces an error.
  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setError('Enter your email to get a sign-in link.')
      emailRef.current?.focus()
      return
    }
    setMagicSubmitting(true)
    setError(null)
    const supabase = createClient()
    const emailRedirectTo = `${window.location.origin}/account/auth/callback?next=${encodeURIComponent(next)}`
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo, shouldCreateUser: false },
    })
    if (otpError) {
      const msg = (otpError.message ?? '').toLowerCase()
      if (msg.includes('rate') || msg.includes('too many') || (otpError as { status?: number }).status === 429) {
        setError('Too many requests. Please wait a minute and try again.')
        setMagicSubmitting(false)
        return
      }
      // Any other error (e.g. no account for this email) stays neutral.
    }
    setMagicSent(true)
    setMagicSubmitting(false)
  }

  if (magicSent) {
    return (
      <>
        <TerminatorReveal />
        <div className="mt-6 rounded-lg border border-olive-500/30 bg-olive-500/10 px-4 py-3 text-sm leading-relaxed text-sand-700 dark:text-sand-200">
          Check your inbox. If an account exists for <strong>{email}</strong>, a one-time sign-in link is on its way. It expires in 1 hour.
        </div>
        <button
          type="button"
          onClick={() => setMagicSent(false)}
          className="mt-4 text-sm font-semibold text-olive-600 hover:underline dark:text-olive-400"
        >
          Use a different email
        </button>
      </>
    )
  }

  const linkMode = mode === 'link'

  return (
    <>
      <TerminatorReveal />

      <div className="mt-6 space-y-3">
        <GoogleSignInButton next={next} label="Sign in with Google" />
        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-sand-200 dark:bg-sand-800" />
          <span className="text-xs uppercase tracking-wider text-sand-600 dark:text-sand-500">
            or
          </span>
          <span className="h-px flex-1 bg-sand-200 dark:bg-sand-800" />
        </div>
      </div>

      <form onSubmit={linkMode ? handleMagicLink : handleSubmit} className="mt-4">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400"
            >
              Email
            </label>
            <input
              ref={emailRef}
              id="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clearStatus()
              }}
              className="w-full rounded-lg border border-sand-200 bg-sand-100 px-3 py-2 text-base text-sand-900 outline-none transition-colors placeholder:text-sand-600 focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20 md:text-sm dark:border-sand-800 dark:bg-sand-950 dark:text-sand-50 dark:placeholder:text-sand-500"
            />
            {linkMode && (
              <p className="mt-2 text-xs text-sand-600 dark:text-sand-400">
                We&apos;ll email you a one-time sign-in link. No password needed.
              </p>
            )}
          </div>

          {!linkMode && (
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400"
              >
                Password
              </label>
              <PasswordInput
                ref={passwordRef}
                id="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  clearStatus()
                }}
              />
              <Link
                href="/account/forgot-password"
                className="mt-2 inline-block text-xs font-semibold text-olive-600 hover:underline dark:text-olive-400"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {error && (
            // role="alert": this box replaced the browser's own validation
            // bubble for the password, which screen readers used to announce.
            <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
        </div>

        {linkMode ? (
          <>
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={magicSubmitting}
              className="mt-6"
            >
              {magicSubmitting ? 'Sending link…' : 'Send sign-in link'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              disabled={magicSubmitting}
              onClick={() => switchMode('password')}
              className="mt-3"
            >
              Use a password instead
            </Button>
          </>
        ) : (
          <>
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={submitting}
              className="mt-6"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              disabled={submitting}
              onClick={() => switchMode('link')}
              className="mt-3"
            >
              Email me a sign-in link
            </Button>
          </>
        )}
      </form>

      <p className="mt-4 text-center text-sm text-sand-600 dark:text-sand-400">
        New here?{' '}
        {onSwitchToSignUp ? (
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="font-semibold text-olive-600 hover:underline dark:text-olive-400"
          >
            Create an account
          </button>
        ) : (
          <Link
            href={`/account/sign-up?next=${encodeURIComponent(next)}`}
            className="font-semibold text-olive-600 hover:underline dark:text-olive-400"
          >
            Create an account
          </Link>
        )}
      </p>

      {/* "By continuing…" footer covers both the email and Google sign-in
          paths above. Lighter than the sign-up footer because the user
          already accepted the Terms / Privacy / marketing notice when they
          first created the account. */}
      <p className="mt-6 text-xs leading-relaxed text-sand-600 dark:text-sand-500">
        By continuing, you agree to our{' '}
        <Link
          href="/terms"
          className="underline hover:text-sand-700 dark:hover:text-sand-100"
        >
          Terms &amp; Conditions
        </Link>{' '}
        and{' '}
        <Link
          href="/privacy"
          className="underline hover:text-sand-700 dark:hover:text-sand-100"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </>
  )
}
