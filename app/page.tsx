import type { Metadata } from 'next'
import { HomePageClient } from './home/HomePageClient'
// Registry-free metadata so the homepage never bundles the heavy registry
// (three.js etc.); mirrors COMPONENT_META.map(toMeta).
import { COMPONENT_META } from './lib/component-meta.generated'
import { SITE_URL } from './lib/config'
import { getRegistryPulls } from './lib/registry-stats'

const HOMEPAGE_TITLE = 'AI Canvas: Design Systems for AI Agents and Humans'
const HOMEPAGE_DESCRIPTION = 'Andromeda is a React design system written for AI agents: components, templates, light and dark themes, and designer rules. Install with shadcn.'

export const metadata: Metadata = {
  title: { absolute: HOMEPAGE_TITLE },
  description: HOMEPAGE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
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

export default async function HomePage() {
  const total = COMPONENT_META.length
  const pulls = await getRegistryPulls()

  // Featured carousel — fixed 5 components, order matters (center starts at index 0)
  const FEATURED_SLUGS = ['tilted-coverflow', 'product-card-deck', 'interactive-card-stack', 'voice-chat-pill', 'sticker-wall']
  const carouselItems = FEATURED_SLUGS
    .map((slug) => COMPONENT_META.find((c) => c.slug === slug))
    .filter((c) => c !== undefined)
    .map((c) => ({ slug: c.slug, name: c.name, description: c.description, tags: c.tags, image: c.image, badge: c.badge }))

  // The free MIT standalones: everything not badged Premium.
  const freeTotal = COMPONENT_META.filter((c) => c.badge !== 'Premium').length

  return <HomePageClient total={total} freeTotal={freeTotal} pulls={pulls} carouselItems={carouselItems} />
}
