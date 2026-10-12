import type { Metadata } from 'next'
import { HomeV2 } from '../home-v2/HomeV2'
import { COMPONENT_META } from '../lib/component-meta.generated'
import { SITE_URL } from '../lib/config'
import { getRegistryPulls } from '../lib/registry-stats'

// Homepage v2 preview, side by side with v1 at /. Not for search: it points
// its canonical at the root and stays out of the index until one version wins.
// ponytail: a review route; delete it (and its TopBar/Sidebar checks) once v1
// or v2 is chosen, before the REBRANDING ship.
export const metadata: Metadata = {
  title: { absolute: 'AI Canvas: Design Systems for AI Agents and Humans' },
  description:
    'Andromeda is a React design system written for AI agents: components, templates, light and dark themes, and designer rules. Install with shadcn.',
  alternates: { canonical: SITE_URL },
  robots: { index: false, follow: false },
}

export default async function HomeV2Page() {
  const total = COMPONENT_META.length
  const pulls = await getRegistryPulls()
  const FEATURED_SLUGS = ['tilted-coverflow', 'product-card-deck', 'interactive-card-stack', 'voice-chat-pill', 'sticker-wall']
  const carouselItems = FEATURED_SLUGS
    .map((slug) => COMPONENT_META.find((c) => c.slug === slug))
    .filter((c) => c !== undefined)
    .map((c) => ({ slug: c.slug, name: c.name, description: c.description, tags: c.tags, image: c.image, badge: c.badge }))
  const freeTotal = COMPONENT_META.filter((c) => c.badge !== 'Premium').length
  return <HomeV2 total={total} freeTotal={freeTotal} pulls={pulls} carouselItems={carouselItems} />
}
