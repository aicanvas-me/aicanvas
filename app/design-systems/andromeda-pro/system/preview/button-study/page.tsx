// Button DEFAULT-variant study. INTERNAL, dev-only, decision aid — not a
// product page and not a change to the system: every candidate below is the
// REAL Button with a className override, so what you see is what the component
// does, and nothing here ships until one is chosen and folded into Button.tsx.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ButtonStudy } from './ButtonStudy'

const DEV_ONLY = process.env.NODE_ENV !== 'production'

export const metadata: Metadata = {
  title: 'Button study (internal)',
  robots: { index: false, follow: false },
}

export default function ButtonStudyPage() {
  if (!DEV_ONLY) notFound()
  return <ButtonStudy />
}
