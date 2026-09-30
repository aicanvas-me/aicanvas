// Plain data for overview variant B: the shapes page.tsx hands to the client
// overview, the curated "All" set, and the template cards. No React and no
// Node APIs, so both the server page and the client overview can import it.
import { DESIGN_SYSTEMS } from '../../../../scripts/lib/design-systems.config.mjs'
import { optimizeImageKitUrl, TEMPLATE_ART_VERSION } from '../../../lib/imagekit'

export type OverviewComponent = {
  slug: string
  name: string
  category: string
  description: string
  variants: number
  states: number
}

export type Family = { name: string; count: number }

export type OverviewStats = {
  components: number
  variants: number
  states: number
  families: number
  templates: number
  themes: number
}

export type OverviewTemplate = {
  slug: string
  name: string
  category: string
  folder: string
  blurb: string
  image: string | null
  // The light-theme poster. Null means none was shot yet, and the card shows
  // `image` in both themes.
  imageLight: string | null
}

// What the "All" tab shows: one strong card per kind of work, in reading order.
export const CURATED_SLUGS = [
  'table-data',
  'date-range-picker',
  'stat-tile',
  'button',
  'input',
  'segmented-control',
  'chart-trend',
  'drawer',
  'nav-item',
]

const TEMPLATE_BLURBS: Record<string, string> = {
  'andromeda-pro-mission-control':
    'Spacecraft telemetry: live altitude, a vehicle roster, a comms log and a system-status readout in one mission view.',
  'andromeda-pro-service-order':
    'A field-service work order: an SLA gauge, line items and order metadata.',
  'andromeda-pro-resource-planning':
    'Capacity, allocation trend and request triage across teams on one planning board.',
  'andromeda-pro-signal-room':
    'A broadcast control room: now transmitting, channel levels, mixes and a transport bar.',
  'andromeda-pro-sign-in':
    'A whole authentication flow: create an account, sign in, recover a password and set a new one.',
  'andromeda-pro-sign-up':
    'The same authentication flow with no columns: a hairline lattice is the ground and the form floats on it.',
  'andromeda-pro-city-operations':
    'A city operations centre: a live incident map, air and traffic readings, an alert queue and response trends.',
}

// The card art slot for each template, a filename in ImageKit's
// andromeda/templates/ folder. New art is a one-line edit here. An EMPTY string
// means "no art yet": the card keeps its dark fallback panel, because a URL
// built from an empty filename resolves to the folder and paints a broken image.
// A poster is the template's dark shot on its mat; the light twin is in
// TEMPLATE_IMAGE_FILE_LIGHT. Legacy's cards keep their own files, under their
// own spelling.
export const TEMPLATE_IMAGE_FILE: Record<string, string> = {
  'andromeda-pro-mission-control': 'Mission_control_pro_dark.png',
  'andromeda-pro-service-order': 'Service_order_pro_dark.png',
  'andromeda-pro-resource-planning': 'Resource_planning_pro_dark.png',
  'andromeda-pro-signal-room': 'Signal_Room_pro_dark.png',
  'andromeda-pro-sign-in': 'Sign_in_pro_dark.png',
  'andromeda-pro-sign-up': 'Sign_up_pro_dark.png',
  'andromeda-pro-city-operations': 'City_operations_pro_dark.png',
}

// The light-theme poster for each template, shown when the site is light.
const TEMPLATE_IMAGE_FILE_LIGHT: Record<string, string> = {
  'andromeda-pro-mission-control': 'Mission_control_pro_light.png',
  'andromeda-pro-service-order': 'Service_order_pro_light.png',
  'andromeda-pro-resource-planning': 'Resource_planning_pro_light.png',
  'andromeda-pro-signal-room': 'Signal_Room_pro_light.png',
  'andromeda-pro-sign-in': 'Sign_in_pro_light.png',
  'andromeda-pro-sign-up': 'Sign_up_pro_light.png',
  'andromeda-pro-city-operations': 'City_operations_pro_light.png',
}

const ART_BASE = 'https://ik.imagekit.io/aitoolkit/andromeda/templates/'

const pro = DESIGN_SYSTEMS.find((s: { slug: string }) => s.slug === 'andromeda-pro')

// The card order of the template bento. The first one spans both columns, so
// it leads; anything not listed here falls in behind, in registry order.
const TEMPLATE_ORDER = [
  'andromeda-pro-city-operations',
  'andromeda-pro-sign-in',
  'andromeda-pro-signal-room',
  'andromeda-pro-mission-control',
  'andromeda-pro-service-order',
  'andromeda-pro-resource-planning',
]

// City Operations leads the bento at double width and is the densest shot in
// the set, the only one where a resize shows, so it keeps the full 1920px of
// the source. Every other poster is small enough on screen that 1600px is
// already twice what its card paints.
const LEAD_ART = new Set(['andromeda-pro-city-operations'])

const artUrl = (slug: string, file: string | undefined) =>
  file
    ? optimizeImageKitUrl(
        `${ART_BASE}${encodeURIComponent(file)}?v=${TEMPLATE_ART_VERSION}`,
        LEAD_ART.has(slug) ? 'lead' : 'detail',
      )
    : null

const BUILT_TEMPLATES: OverviewTemplate[] = (pro?.templates ?? []).map(
  (t: { slug: string; name: string; category?: string }) => {
    return {
      slug: t.slug,
      name: t.name,
      category: t.category ?? '',
      folder: t.slug.replace(/^andromeda-pro-/, ''),
      blurb: TEMPLATE_BLURBS[t.slug] ?? '',
      image: artUrl(t.slug, TEMPLATE_IMAGE_FILE[t.slug]),
      imageLight: artUrl(t.slug, TEMPLATE_IMAGE_FILE_LIGHT[t.slug]),
    }
  },
)

const rank = (slug: string) => {
  const i = TEMPLATE_ORDER.indexOf(slug)
  return i === -1 ? TEMPLATE_ORDER.length : i
}

export const TEMPLATES: OverviewTemplate[] = [...BUILT_TEMPLATES].sort(
  (a, b) => rank(a.slug) - rank(b.slug),
)
