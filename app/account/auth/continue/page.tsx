import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { safeNext } from '../../../lib/safe-next'
import { isEmailLinkType, kindFor, type EmailLinkKind } from '../../../lib/auth/email-link'
import { AuthPagePopup } from '../../AuthPagePopup'
import { ContinueForm } from './ContinueForm'

// ─── /account/auth/continue ──────────────────────────────────────────────────
// The one-click stop between an auth email and a session. /account/auth/confirm
// sends every email link here; pressing Continue POSTs back to it, which
// verifies the token. Opening this page (a person, or a mail scanner) uses
// nothing up.

export const metadata: Metadata = {
  title: 'Continue',
  robots: { index: false, follow: false },
  // The URL carries a one-time token. same-origin keeps it out of any
  // cross-site Referer while still sending Origin on the Continue POST
  // (no-referrer would make browsers send `Origin: null` and fail the check).
  referrer: 'same-origin',
}

const COPY: Record<EmailLinkKind, { heading: string; body: string }> = {
  signin: {
    heading: 'Sign in to AI Canvas',
    body: 'Press Continue to finish signing in.',
  },
  signup: {
    heading: 'Confirm your email',
    body: 'Press Continue to confirm your email and sign in.',
  },
  recovery: {
    heading: 'Reset your password',
    body: 'Press Continue to choose a new password.',
  },
}

export default async function ContinuePage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; kind?: string; next?: string }>
}) {
  const params = await searchParams
  const type = params.type
  if (!params.token_hash || !isEmailLinkType(type)) redirect('/account/sign-in?error=link_invalid')

  // Someone already signed in may be about to switch accounts (a link for a
  // second account, or one somebody else sent). Say so before they press.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { heading, body } = COPY[kindFor(type, params.kind)]

  return (
    <AuthPagePopup>
      <h1 className="text-2xl font-bold text-sand-900 dark:text-sand-50">{heading}</h1>
      <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">{body}</p>
      {user?.email && (
        <p className="mt-4 rounded-lg border border-sand-200 px-3 py-2 text-sm text-sand-700 dark:border-sand-800 dark:text-sand-300">
          You&apos;re signed in as <strong className="font-semibold break-all">{user.email}</strong>. If this link
          is for a different account, Continue switches to it.
        </p>
      )}
      <ContinueForm tokenHash={params.token_hash} type={type} next={safeNext(params.next)} />
    </AuthPagePopup>
  )
}
