import type { Metadata } from 'next'
import { HomePage } from './HomePage'
import { getHomeData, HOMEPAGE_DESCRIPTION, HOMEPAGE_TITLE } from './home-data'
import { SITE_URL } from '../lib/config'

// The same page as the root, with the same words; canonical points at the root
// so search engines fold the two together.
export const metadata: Metadata = {
  title: { absolute: HOMEPAGE_TITLE },
  description: HOMEPAGE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
    url: `${SITE_URL}/home`,
    type: 'website',
    images: [
      {
        url: '/og-nov2026-aicanvas.me.png',
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
    images: ['/og-nov2026-aicanvas.me.png'],
  },
}

export default async function Home() {
  return <HomePage {...await getHomeData()} />
}
