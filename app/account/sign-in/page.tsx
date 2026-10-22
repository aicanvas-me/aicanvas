import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '../../lib/supabase/server'
import { SignInForm } from './SignInForm'

// ─── /account/sign-in ────────────────────────────────────────────────────────
// Server entry: if the user already has a valid session, skip the form and
// drop them straight into /account. The `next` and `error` search params are
// read here (server-side) so the friendly callback-error message renders on
// the first paint — reading them via `useSearchParams` in the client
// component would leave the message blank until after hydration.

// Friendly text for the `?error=…` codes the auth callback and the email-link
// confirm route may pass through. Unknown codes still show a generic message so
// users at least see *something* went wrong.
const CALLBACK_ERROR_MESSAGES: Record<string, string> = {
  callback_failed: 'We couldn’t complete that sign-in. Please try again.',
  missing_code: 'That sign-in link is incomplete or expired. Please request a new one.',
  link_expired:
    'That link has expired or was already used. Request a new one below, and use the newest email.',
  link_invalid: 'That link is incomplete. Request a new one below.',
}

// An email link sent before the switch to /account/auth/confirm only works in
// the browser that asked for it. Its failure names the missing PKCE verifier.
const OTHER_BROWSER_MESSAGE =
  'Open the link in the browser you requested it from, or request a new one below.'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; reason?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/account')

  const params = await searchParams
  const next = params.next ?? '/account'
  const errorCode = params.error ?? null
  const initialError = !errorCode
    ? null
    : errorCode === 'callback_failed' && /code verifier/i.test(params.reason ?? '')
      ? OTHER_BROWSER_MESSAGE
      : (CALLBACK_ERROR_MESSAGES[errorCode] ?? 'Sign-in failed. Please try again.')

  return (
    <Suspense>
      <SignInForm next={next} initialError={initialError} />
    </Suspense>
  )
}
