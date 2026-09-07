import type { Metadata } from 'next'

const description =
  'The AI Canvas site design tokens: color scales, typography, spacing, and semantic mappings, read live from the stylesheet so they always match the site.'

export const metadata: Metadata = {
  title: 'Design System',
  description,
  alternates: { canonical: '/designsystem' },
  openGraph: {
    title: 'AI Canvas Design System',
    description,
    url: '/designsystem',
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
    title: 'AI Canvas Design System',
    description,
    images: ['/og-aug2026-aicanvas.me.png'],
  },
}

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return children
}
