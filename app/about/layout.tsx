import type { Metadata } from 'next'

const description =
  'Why AI Canvas exists: real, reviewed components with every state built, instead of an AI guessing an interface from nothing.'

export const metadata: Metadata = {
  title: 'About',
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About AI Canvas',
    description,
    url: '/about',
    type: 'website',
    images: [
      {
        url: '/og-aug2026-aicanvas.me.png',
        width: 2400,
        height: 1260,
        alt: 'AI Canvas: AI native components, design systems, blocks, templates and skills',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About AI Canvas',
    description,
    images: ['/og-aug2026-aicanvas.me.png'],
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
