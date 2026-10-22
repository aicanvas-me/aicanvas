import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import { ForgotPasswordForm } from './ForgotPasswordForm'

// ─── /account/forgot-password ────────────────────────────────────────────────
// Server entry: if the user is already signed in there's nothing to recover,
// so bounce them to /account directly. Otherwise render the client form.
// `?error=link_expired` comes from /account/auth/confirm when a reset link was
// already used or has expired; it shows on first paint.

const LINK_EXPIRED_MESSAGE =
  'That reset link has expired or was already used. Enter your email for a new one, and use the newest email.'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/account')

  const { error } = await searchParams
  return <ForgotPasswordForm initialError={error === 'link_expired' ? LINK_EXPIRED_MESSAGE : null} />
}
