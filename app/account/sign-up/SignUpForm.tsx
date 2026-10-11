'use client'

import { useSearchParams } from 'next/navigation'
import { SignUpFormFields } from '../../components/auth/SignUpFormFields'
import { safeNext } from '../../lib/safe-next'
import { AgentSignInHeader, isAgentSignIn } from '../AgentSignInHeader'
import { AuthPagePopup } from '../AuthPagePopup'

export function SignUpForm({ fallback = '/account', agentFlag = false }: { fallback?: string; agentFlag?: boolean }) {
  const searchParams = useSearchParams()
  const next = safeNext(searchParams.get('next'), fallback)

  return (
    <AuthPagePopup aside={agentFlag && isAgentSignIn(next) ? <AgentSignInHeader mode="sign-up" /> : undefined}>
      <SignUpFormFields next={next} header={agentFlag && isAgentSignIn(next) ? <></> : undefined} />
    </AuthPagePopup>
  )
}
