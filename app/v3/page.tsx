import type { Metadata } from 'next'
import { HomeV3 } from '../home-v3/HomeV3'
import type { WallItem } from '../home-v3/ComponentWall'
import { COMPONENT_META } from '../lib/component-meta.generated'
import { SITE_URL } from '../lib/config'
import { optimizeImageKitUrl } from '../lib/imagekit'
import { getRegistryPulls } from '../lib/registry-stats'
import { TEMPLATES } from '../design-systems/andromeda-pro/overview-b/overview-data'

// Homepage v3 preview, beside v1 at / and v2 at /v2. Not for search: it points
// its canonical at the root and stays out of the index until one version wins.
// ponytail: a review route; delete it (and its TopBar/Sidebar checks) once a
// version is chosen, before the REBRANDING ship.
export const metadata: Metadata = {
  title: { absolute: 'AI Canvas: Design Systems for AI Agents and Humans' },
  description:
    'React design systems, templates, components and blocks for people and their AI agents. Real source you own, installed with shadcn or MCP.',
  alternates: { canonical: SITE_URL },
  robots: { index: false, follow: false },
}

// The device frame's tabs, in order: one of each kind of screen.
const TEMPLATE_TABS = [
  'andromeda-pro-ai-chat',
  'andromeda-pro-fintech-landing',
  'andromeda-pro-sign-in',
  'andromeda-pro-resource-planning',
  'andromeda-pro-city-operations',
  'andromeda-pro-signal-room',
]

// The component wall, dealt into four columns in this order (round robin).
// Free and premium mixed, and as many kinds of piece as possible.
const WALL_SLUGS = [
  'fluid-simulation-hero', 'agent-cost-flow', 'perspective-showcase-hero', 'agent-feedback-loop',
  'crypto-swap', 'scroll-wipe-gallery', 'ai-knowledge-map', '3d-gem-pricing-section',
  'slice-type', 'mood-tracker', 'signature-pad', '3d-product-card',
  'glass-ai-compose', 'ai-job-cards', 'sticker-wall', 'radial-cards',
  'sphere-lines', 'polaroid-stack', 'charging-widget', 'traveldeck',
]

export default async function HomeV3Page() {
  const total = COMPONENT_META.length
  const pulls = await getRegistryPulls()
  const freeTotal = COMPONENT_META.filter((c) => c.badge !== 'Premium').length

  const templates = TEMPLATE_TABS.map((slug) => TEMPLATES.find((t) => t.slug === slug))
    .filter((t) => t !== undefined)
    .map(({ folder, name, image, imageLight }) => ({ folder, name, image, imageLight }))

  const wall: WallItem[] = WALL_SLUGS.flatMap((slug) => {
    const c = COMPONENT_META.find((m) => m.slug === slug)
    return c?.image
      ? [{ slug: c.slug, name: c.name, image: optimizeImageKitUrl(c.image, 'card'), premium: c.badge === 'Premium' }]
      : []
  })

  return <HomeV3 total={total} freeTotal={freeTotal} pulls={pulls} templates={templates} wall={wall} />
}
