import type { ReactNode } from 'react'

// Server layout: carries metadata for the template route (the page itself is a
// client component and cannot export metadata). Transparent pass-through.
export const metadata = {
  title: 'Sign In · Andromeda Template',
  description:
    'A complete authentication flow built with Andromeda: create an account, sign in, recover a password and set a new one, with the form on a card and a picture panel beside it.',
  alternates: { canonical: '/design-systems/andromeda-pro/templates/sign-in' },
}

export default function SignInTemplateLayout({ children }: { children: ReactNode }) {
  return children
}
