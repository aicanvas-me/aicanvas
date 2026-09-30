import type { ReactNode } from 'react'

// Server layout: carries metadata for the template route (the page itself is a
// client component and cannot export metadata). Transparent pass-through.
export const metadata = {
  title: 'Service Order · Andromeda Template',
  description:
    'A field-service work order built with Andromeda: SLA gauge, line items, order metadata, and a customer summary panel.',
  alternates: { canonical: '/design-systems/andromeda-pro/templates/service-order' },
}

export default function ServiceOrderTemplateLayout({ children }: { children: ReactNode }) {
  return children
}
