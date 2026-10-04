import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '../../lib/supabase/server'
import { SignInForm } from './SignInForm'
import { safeNext } from '../../lib/safe-next'

// ─── /account/sign-in ────────────────────────────────────────────────────────
// Server entry: if the user already has a valid session, skip the form and
// drop them straight into /account. The `next` and `error` search params are
// read here (server-side) so the friendly callback-error message renders on
// the first paint — reading them via `useSearchParams` in the client
// component would leave the message blank until after hydration.

// Friendly text for the `?error=…` codes the auth callback may pass through
// after an OAuth / email-confirmation failure. Unknown codes still show a
// generic message so users at least see *something* went wrong.
const CALLBACK_ERROR_MESSAGES: Record<string, string> = {
  callback_failed: 'We couldn’t complete that sign-in. Please try again.',
  missing_code: 'That sign-in link is incomplete or expired. Please request a new one.',
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Already signed in: go where the sign-in was for (an AI agent's consent screen, say).
  if (user) redirect(safeNext(params.next))

  const next = params.next ?? '/account'
  const errorCode = params.error ?? null
  const initialError = errorCode
    ? (CALLBACK_ERROR_MESSAGES[errorCode] ?? 'Sign-in failed. Please try again.')
    : null

  return (
    <Suspense>
      <SignInForm next={next} initialError={initialError} />
    </Suspense>
  )
}
