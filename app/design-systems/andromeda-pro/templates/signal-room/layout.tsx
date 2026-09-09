import type { ReactNode } from 'react'

// Server layout: carries metadata for the template route (the page itself is a
// client component and cannot export metadata). Transparent pass-through.
export const metadata = {
  title: 'Signal Room · Andromeda Template',
  description:
    'A broadcast control room built with Andromeda: now-transmitting, channel levels, mixes, and a transport bar.',
  alternates: { canonical: '/design-systems/andromeda-pro/templates/signal-room' },
}

export default function SignalRoomTemplateLayout({ children }: { children: ReactNode }) {
  return children
}
