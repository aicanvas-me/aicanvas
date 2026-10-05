import type { ReactNode } from 'react'

// Server layout: carries metadata for the template route (the page itself is a
// client component and cannot export metadata). Transparent pass-through.
export const metadata = {
  title: 'Fintech Landing · Andromeda Template',
  description:
    'A landing page for a money app: a hero with a live wallet, card and transfer features, testimonials, pricing, FAQ, articles and a call to action.',
  alternates: { canonical: '/design-systems/andromeda-pro/templates/fintech-landing' },
}

export default function FintechLandingTemplateLayout({ children }: { children: ReactNode }) {
  return children
}
