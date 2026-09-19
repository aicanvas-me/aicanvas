import type { ReactNode } from 'react'

// Server layout: carries metadata for the template route (the page itself is a
// client component and cannot export metadata). Transparent pass-through.
export const metadata = {
  title: 'City Operations · Andromeda Template',
  description:
    'A municipal operations dashboard built with Andromeda: a live incident map, alert queue, traffic and response trends, and the day’s service numbers in one city view.',
  alternates: { canonical: '/design-systems/andromeda-pro/templates/city-operations' },
}

export default function CityOperationsTemplateLayout({ children }: { children: ReactNode }) {
  return children
}
