'use client'

import { useRouter } from 'next/navigation'
import { SignInFormFields } from '../../components/auth/SignInFormFields'
import { safeNext } from '../../lib/safe-next'
import { AgentSignInHeader } from '../AgentSignInHeader'
import { AuthPagePopup } from '../AuthPagePopup'

// Client wrapper for /account/sign-in. The page-level server component reads
// `?next=` and `?error=` from the URL and passes them in as props — so we
// avoid the `useSearchParams` Suspense dance and the error message renders
// on the first paint (instead of post-hydration).
//
// Wrapped in AuthPagePopup so the standalone page carries the in-app
// AuthModal's card and X close, set under the site's top navigation.

type Props = {
  next: string
  initialError: string | null
  /** Opened by an AI agent's sign-in while HOSTED_MCP_OAUTH is on (decided on the server). */
  agent?: boolean
}

export function SignInForm({ next: rawNext, initialError, agent = false }: Props) {
  const router = useRouter()
  const next = safeNext(rawNext)

  return (
    <AuthPagePopup aside={agent ? <AgentSignInHeader mode="sign-in" /> : undefined}>
      <SignInFormFields
        next={next}
        initialError={initialError}
        header={agent ? <></> : undefined}
        onSuccess={() => {
          router.push(next)
          router.refresh()
        }}
      />
    </AuthPagePopup>
  )
}
