import type { ReactNode } from 'react'

// Server layout: carries metadata for the template route (the page itself is a
// client component and cannot export metadata). Transparent pass-through.
export const metadata = {
  title: 'Mission Control · Andromeda Template',
  description:
    'A spacecraft telemetry dashboard built with Andromeda: live altitude, vehicle roster, comms log, and a system-status readout in one mission view.',
  alternates: { canonical: '/design-systems/andromeda-pro/templates/mission-control' },
}

export default function MissionControlTemplateLayout({ children }: { children: ReactNode }) {
  return children
}
