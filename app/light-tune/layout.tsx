import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

// Dev-only, and pinned dark like the other consoles: the tuner's own chrome must
// not move while the surfaces it is tuning do.
export const metadata = { robots: { index: false, follow: false } }

export default function LightTuneLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV !== 'development') notFound()
  return <div className="dark min-h-full bg-sand-950">{children}</div>
}
