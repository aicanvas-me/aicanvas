import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '../../lib/supabase/server'
import { SignUpForm } from './SignUpForm'
import { hostedMcpOAuthEnabled } from '../../../lib/flags'

// ─── /account/sign-up ────────────────────────────────────────────────────────
// Server entry: bounce already-signed-in visitors to /account so the form
// never flashes for someone who doesn't need it.

export default async function SignUpPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/account')

  return (
    <Suspense>
      {/* A new account lands on the AI agent setup unless it came here for something else. */}
      <SignUpForm fallback={hostedMcpOAuthEnabled() ? '/account/connect' : '/account'} agentFlag={hostedMcpOAuthEnabled()} />
    </Suspense>
  )
}
