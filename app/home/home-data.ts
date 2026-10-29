import type { WallItem } from './ComponentWall'
// Registry-free metadata so the homepage never bundles the heavy registry
// (three.js etc.); mirrors COMPONENT_META.map(toMeta).
import { COMPONENT_META } from '../lib/component-meta.generated'
import { lightShot, optimizeImageKitUrl } from '../lib/imagekit'
import { getRegistryPulls } from '../lib/registry-stats'
import { TEMPLATES } from '../design-systems/andromeda-pro/overview-b/overview-data'

// The homepage renders at / and at /home; both routes share this data and
// these words.
export const HOMEPAGE_TITLE = 'AI Canvas: No More AI Slop. Design Systems for AI Agents'
export const HOMEPAGE_DESCRIPTION = 'No more AI slop. Design systems your agent builds with and you reshape, plus standalone components for any project, in Claude Code, Cursor or Codex.'

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

export async function getHomeData() {
  const total = COMPONENT_META.length
  const pulls = await getRegistryPulls()
  // The free MIT standalones: everything not badged Premium.
  const freeTotal = COMPONENT_META.filter((c) => c.badge !== 'Premium').length

  const templates = TEMPLATE_TABS.map((slug) => TEMPLATES.find((t) => t.slug === slug))
    .filter((t) => t !== undefined)
    .map(({ folder, name, image, imageLight }) => ({ folder, name, image, imageLight }))

  const wall: WallItem[] = WALL_SLUGS.flatMap((slug) => {
    const c = COMPONENT_META.find((m) => m.slug === slug)
    return c?.image
      ? [{
          slug: c.slug,
          name: c.name,
          image: optimizeImageKitUrl(c.image, 'card'),
          ...(c.dualTheme ? { imageLight: optimizeImageKitUrl(lightShot(c.slug), 'card') } : {}),
          premium: c.badge === 'Premium',
        }]
      : []
  })

  return { total, freeTotal, pulls, templates, wall }
}
