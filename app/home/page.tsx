import type { Metadata } from 'next'
import { HomePageClient } from './HomePageClient'
// Registry-free metadata so the homepage never bundles the heavy registry
// (three.js etc.); mirrors COMPONENT_META.map(toMeta).
import { COMPONENT_META } from '../lib/component-meta.generated'
import { getRegistryPulls } from '../lib/registry-stats'

// Mirrors the root homepage metadata (this route renders the same page);
// canonical points at the root so search engines fold the two together.
const HOMEPAGE_TITLE = 'React Component Registry: Components, Blocks & Design Systems | AI Canvas'
const HOMEPAGE_DESCRIPTION = 'Install finished React components, blocks, and design systems with one shadcn CLI command. Real, editable code you own, no AI tokens spent.'

export const metadata: Metadata = {
  title: { absolute: HOMEPAGE_TITLE },
  description: HOMEPAGE_DESCRIPTION,
  alternates: { canonical: 'https://aicanvas.me' },
  openGraph: {
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
    url: 'https://aicanvas.me/home',
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

export default async function HomePage() {
  const total = COMPONENT_META.length
  const pulls = await getRegistryPulls()

  // Featured carousel — fixed 5 components, order matters (center starts at index 0)
  const FEATURED_SLUGS = ['tilted-coverflow', 'product-card-deck', 'interactive-card-stack', 'voice-chat-pill', 'sticker-wall']
  const carouselItems = FEATURED_SLUGS
    .map((slug) => COMPONENT_META.find((c) => c.slug === slug))
    .filter((c) => c !== undefined)
    .map((c) => ({ slug: c.slug, name: c.name, description: c.description, tags: c.tags, image: c.image, badge: c.badge }))

  return <HomePageClient total={total} pulls={pulls} carouselItems={carouselItems} />
}
