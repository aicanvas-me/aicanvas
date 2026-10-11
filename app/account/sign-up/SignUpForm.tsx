'use client'

import { useSearchParams } from 'next/navigation'
import { SignUpFormFields } from '../../components/auth/SignUpFormFields'
import { safeNext } from '../../lib/safe-next'
import { AgentSignInNote, isAgentSignIn } from '../AgentSignInNote'
import { AuthPagePopup } from '../AuthPagePopup'

export function SignUpForm({ fallback = '/account' }: { fallback?: string }) {
  const searchParams = useSearchParams()
  const next = safeNext(searchParams.get('next'), fallback)

  return (
    <AuthPagePopup>
      {isAgentSignIn(next) && <AgentSignInNote mode="sign-up" />}
      <SignUpFormFields next={next} />
    </AuthPagePopup>
  )
}
