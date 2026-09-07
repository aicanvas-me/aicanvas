'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { X } from '@phosphor-icons/react'
import { Button } from '../Button'
import { useDialogFocus } from '../useDialogFocus'
import { useAuthModal } from './AuthModalProvider'
import { isPinnedDarkRoute } from '../../lib/pinned-dark'
import { AuthGateScreen } from './AuthGateScreen'
import { SignInFormFields } from './SignInFormFields'
import { SignUpFormFields } from './SignUpFormFields'

// ─── AuthModal ────────────────────────────────────────────────────────────────
// Global auth dialog. Opens via useAuthModal().open() and closes on X click
// or any pathname change — backdrop clicks and ESC are intentionally NOT
// handled, so users only exit deliberately via the close button. Renders
// SignInFormFields or SignUpFormFields depending on `mode`. The internal
// "Create an account" / "Already have one? Sign in" links flip the mode in
// place rather than navigating, keeping the modal open for a single
// seamless flow.

export function AuthModal() {
  const router = useRouter()
  const pathname = usePathname()
  const { isOpen, mode, next, title, subtitle, close, setMode } = useAuthModal()
  const dialogRef = useRef<HTMLDivElement>(null)

  // Close on route change. The "Forgot password?" link inside the sign-in
  // form navigates to /account/forgot-password — we want the modal to
  // dismiss when that happens. Switching between sign-in and sign-up modes
  // doesn't change the pathname, so this doesn't fire on those.
  useEffect(() => {
    close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Lock body scroll while open so the page beneath doesn't shift.
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  // Focus management while open: the shared dialog contract (Tab trap with
  // wrap-around, focus restored to the opener on close). Initial focus is
  // provided by the form's `autoFocus` on the email input, so we don't
  // force-focus anything ourselves on open.
  useDialogFocus(dialogRef, isOpen)

  if (!isOpen) return null

  // Stay on the current page after sign-in unless an explicit `next` was
  // provided when opening. router.refresh() re-runs RSCs so the page picks
  // up the new auth state (header pill, gated content, etc.).
  function handleSignInSuccess() {
    close()
    if (next) router.push(next)
    router.refresh()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        mode === 'gate'
          ? 'Unlock the canvas'
          : mode === 'sign-in'
            ? 'Sign in'
            : 'Create your account'
      }
      // Opened from a route that pins itself dark, this dialog is rendered by
      // the root layout and so sits outside that route's scoped `dark` wrapper.
      // Without this a light-theme visitor gets a light sand dialog over a dark
      // console. Match the page it is covering.
      className={`fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 ${
        isPinnedDarkRoute(pathname) ? 'dark' : ''
      }`}
    >
      {/* Backdrop — visual only; clicks do NOT dismiss the modal. The X
          button is the sole exit so users don't fall out of the auth flow
          accidentally. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-sand-950/80 backdrop-blur-sm"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-md rounded-xl border border-sand-200 bg-sand-100 p-8 shadow-2xl dark:border-sand-800 dark:bg-sand-900"
      >
        <Button
          variant="icon"
          size="md"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3"
        >
          <X weight="regular" size={18} />
        </Button>

        {mode === 'gate' ? (
          <AuthGateScreen
            title={title ?? undefined}
            subtitle={subtitle ?? undefined}
            onChooseSignIn={() => setMode('sign-in')}
            onChooseSignUp={() => setMode('sign-up')}
          />
        ) : mode === 'sign-in' ? (
          <SignInFormFields
            next={next ?? '/'}
            onSuccess={handleSignInSuccess}
            onSwitchToSignUp={() => setMode('sign-up')}
          />
        ) : (
          <SignUpFormFields
            next={next ?? '/'}
            onSwitchToSignIn={() => setMode('sign-in')}
          />
        )}
      </div>
    </div>
  )
}
