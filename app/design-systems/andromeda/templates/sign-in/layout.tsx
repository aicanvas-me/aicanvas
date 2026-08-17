import type { ReactNode } from 'react'

// Server layout: carries metadata for the template route (the page itself is a
// client component and cannot export metadata). Transparent pass-through.
export const metadata = {
  title: 'Sign In · Andromeda Template',
  description:
    'A split-screen authentication screen built with Andromeda: email and password, federated sign-in, and the Burst object filling the right half.',
  alternates: { canonical: '/design-systems/andromeda/templates/sign-in' },
}

export default function SignInTemplateLayout({ children }: { children: ReactNode }) {
  return children
}
