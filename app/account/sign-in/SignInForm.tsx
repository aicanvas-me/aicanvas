'use client'

import { useRouter } from 'next/navigation'
import { SignInFormFields } from '../../components/auth/SignInFormFields'
import { safeNext } from '../../lib/safe-next'
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
}

export function SignInForm({ next: rawNext, initialError }: Props) {
  const router = useRouter()
  const next = safeNext(rawNext)

  return (
    <AuthPagePopup>
      <SignInFormFields
        next={next}
        initialError={initialError}
        onSuccess={() => {
          router.push(next)
          router.refresh()
        }}
      />
    </AuthPagePopup>
  )
}
