import type { ReactNode } from 'react'

// Server layout: carries metadata for the template route (the page itself is a
// client component and cannot export metadata). Transparent pass-through.
export const metadata = {
  title: 'Resource Planning · Andromeda Template',
  description:
    'A capacity-planning board built with Andromeda: team capacity, allocation trend, and request triage in one view.',
  alternates: { canonical: '/design-systems/andromeda-pro/templates/resource-planning' },
}

export default function ResourcePlanningTemplateLayout({ children }: { children: ReactNode }) {
  return children
}
