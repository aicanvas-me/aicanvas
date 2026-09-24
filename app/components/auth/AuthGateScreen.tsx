'use client'

import { buttonClasses } from '../buttonClasses'

// ─── AuthGateScreen ──────────────────────────────────────────────────────────
// Soft-pitch screen rendered by AuthModal when mode === 'gate'. Pitches the
// value of signing in before asking for credentials — used by gated actions
// like Lab Save / Record / Save Preset where we don't want the user to
// bounce off a raw form. Two buttons hand off to the existing sign-in /
// sign-up forms by flipping the modal's mode in place (no remount, no
// new modal — just a screen swap inside the same dialog).

type AuthGateScreenProps = {
  onChooseSignIn: () => void
  onChooseSignUp: () => void
  // Optional copy overrides so a gated action (e.g. an install) can tailor the
  // pitch. Absent for the Lab callers, which keep the default canvas copy.
  title?: string
  subtitle?: string
}

export function AuthGateScreen({ onChooseSignIn, onChooseSignUp, title, subtitle }: AuthGateScreenProps) {
  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-bold leading-tight tracking-tight text-sand-900 dark:text-sand-50">
        {title ?? 'Sign in and unlock the canvas.'}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
        {subtitle ?? 'Save what you love. AI Canvas is open core: a free MIT library plus an optional Premium tier.'}
      </p>

      <div className="mt-7 flex flex-col gap-3">
        <button
          type="button"
          onClick={onChooseSignIn}
          className={buttonClasses({ variant: 'outline', size: 'lg', fullWidth: true })}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={onChooseSignUp}
          className={buttonClasses({ variant: 'primary', size: 'lg', fullWidth: true })}
        >
          Sign up
        </button>
      </div>
    </div>
  )
}
