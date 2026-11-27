import type { WallItem } from './ComponentWall'
// Registry-free metadata so the homepage never bundles the heavy registry
// (three.js etc.); mirrors COMPONENT_META.map(toMeta).
import { COMPONENT_META } from '../lib/component-meta.generated'
import { lightShot, optimizeImageKitUrl } from '../lib/imagekit'
import { getRegistryPulls } from '../lib/registry-stats'
import { TEMPLATES } from '../design-systems/andromeda-pro/overview-b/overview-data'
import { icons, readLineIcons } from '../icons/_lib/server-data'
import type { BoardPiece, HeroIcon } from './HeroBoard'
import type { SpecimenIcon } from './section-types'

// The homepage renders at / and at /home; both routes share this data and
// these words.
export const HOMEPAGE_TITLE = 'AI Canvas: No More AI Slop. Design Systems for AI Agents'
export const HOMEPAGE_DESCRIPTION = 'No more AI slop. Design systems your agent builds with and you reshape, plus standalone components for any project, in Claude, ChatGPT, Cursor or any AI agent.'

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
  'crypto-swap', 'agent-composer', 'ai-knowledge-map', '3d-gem-pricing-section',
  'tilted-coverflow', 'plan-runner', 'signature-pad', '3d-product-card',
  'glass-ai-compose', 'ai-job-cards', 'change-review', 'radial-cards',
  'sphere-lines', 'agent-checkpoint', 'tool-ledger', 'traveldeck',
]

// The hero board's Line card, in this order; names missing from the icon set
// are skipped.
const HERO_ICON_NAMES = ['agent-skill', 'mcp-server', 'palette', 'sparkle', 'code', 'terminal']

// The icon specimen's Line spread, in this order: navigation, actions, commerce,
// media, agent work and data, so the coverage reads as a working set rather than
// a sampler. 32 names fill four rows of eight; narrower panels show the first 24 or 16.
const SPECIMEN_ICON_NAMES = [
  'house', 'compass', 'layout-dashboard', 'layers', 'kanban', 'search', 'download',
  'share', 'trash', 'pen', 'shopping-cart', 'credit-card', 'wallet', 'tag',
  'play', 'music', 'video', 'image', 'mic', 'terminal', 'code',
  'cpu', 'brain', 'bot', 'database', 'mail', 'message-circle-text', 'chart-line-up',
  'calendar', 'bell', 'user', 'globe',
]

// The hero board's standalone column, in this order; the agent pulls the first.
const BOARD_SLUGS = ['plan-runner', 'glass-ai-compose', '3d-gem-pricing-section', 'charging-widget']

// A build without the icon source writes empty data (or none at all), so this
// never throws: no markup means an empty Line card and fallback glyphs in the
// icon workbench, not a broken homepage. One read feeds both the hero board and the icon section.
async function getLineIcons(): Promise<{ heroIcons: HeroIcon[]; specimenIcons: SpecimenIcon[] }> {
  try {
    const markup = await readLineIcons()
    const pick = (names: string[]) =>
      names.flatMap((name) =>
        typeof markup[name] === 'string' && markup[name] ? [{ name, markup: markup[name] }] : [],
      )
    return { heroIcons: pick(HERO_ICON_NAMES), specimenIcons: pick(SPECIMEN_ICON_NAMES) }
  } catch {
    return { heroIcons: [], specimenIcons: [] }
  }
}

export async function getHomeData() {
  const total = COMPONENT_META.length
  const [pulls, { heroIcons, specimenIcons }] = await Promise.all([getRegistryPulls(), getLineIcons()])
  const iconCount = Array.isArray(icons) ? icons.length : 0
  // The free MIT standalones: everything not badged Premium.
  const freeTotal = COMPONENT_META.filter((c) => c.badge !== 'Premium').length

  const templates = TEMPLATE_TABS.map((slug) => TEMPLATES.find((t) => t.slug === slug))
    .filter((t) => t !== undefined)
    .map(({ folder, name }) => ({ folder, name }))

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

  const boardPieces: BoardPiece[] = BOARD_SLUGS.flatMap((slug) => {
    const c = COMPONENT_META.find((m) => m.slug === slug)
    const kind = c?.tags[0]?.label ?? 'Component'
    return c ? [{ slug, name: c.name, premium: c.badge === 'Premium', kind: kind === 'Blocks' ? 'Block' : kind }] : []
  })

  return { total, freeTotal, pulls, templates, wall, heroIcons, specimenIcons, iconCount, boardPieces }
}
