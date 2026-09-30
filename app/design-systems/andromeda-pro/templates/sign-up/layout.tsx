import type { ReactNode } from 'react'

// Server layout: carries metadata for the template route (the page itself is a
// client component and cannot export metadata). Transparent pass-through.
export const metadata = {
  title: 'Sign Up · Andromeda Template',
  description:
    'A complete authentication flow built with Andromeda: create an account, sign in, recover a password and set a new one, with the form floating on a card over a full-screen hairline lattice.',
  alternates: { canonical: '/design-systems/andromeda-pro/templates/sign-up' },
}

export default function SignUpTemplateLayout({ children }: { children: ReactNode }) {
  return children
}
