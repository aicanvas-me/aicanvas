import type { Metadata } from 'next'
import { HomePage } from './home/HomePage'
import { getHomeData, HOMEPAGE_DESCRIPTION, HOMEPAGE_TITLE } from './home/home-data'
import { SITE_URL } from './lib/config'

export const metadata: Metadata = {
  title: { absolute: HOMEPAGE_TITLE },
  description: HOMEPAGE_DESCRIPTION,
  alternates: { canonical: SITE_URL, types: { 'text/markdown': `${SITE_URL}/index.md` } },
  openGraph: {
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
    url: SITE_URL,
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
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
    images: ['/og-aug2026-aicanvas.me.png'],
  },
}

export default async function Home() {
  return <HomePage {...await getHomeData()} />
}
