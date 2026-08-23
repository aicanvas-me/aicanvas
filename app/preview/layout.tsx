import type { Metadata } from 'next'

// Preview routes render a component full-bleed for screenshots and checks.
// They duplicate the component pages, so they stay out of the index; a page
// that sets its own metadata still wins over this default.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return children
}
