import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Credits',
  description: 'Third-party creative assets used on AI Canvas, with their authors and licenses.',
  alternates: { canonical: '/credits' },
}

export default function CreditsLayout({ children }: { children: React.ReactNode }) {
  return children
}
