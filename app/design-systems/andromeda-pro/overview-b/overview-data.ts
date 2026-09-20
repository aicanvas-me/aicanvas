// Plain data for overview variant B: the shapes page.tsx hands to the client
// overview, the curated "All" set, and the template cards. No React and no
// Node APIs, so both the server page and the client overview can import it.
import { DESIGN_SYSTEMS } from '../../../../scripts/lib/design-systems.config.mjs'
import { optimizeImageKitUrl } from '../../../lib/imagekit'

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
  'andromeda-pro-city-operations':
    'A city operations centre: a live incident map, air and traffic readings, an alert queue and response trends.',
}

// The card art slot for each template, a filename in ImageKit's
// andromeda/templates/ folder. New art is a one-line edit here. An EMPTY string
// means "no art yet": the card keeps its dark fallback panel, because a URL
// built from an empty filename resolves to the folder and paints a broken image.
// The Pro art sits on brand-500; Legacy's cards keep their own files.
export const TEMPLATE_IMAGE_FILE: Record<string, string> = {
  'andromeda-pro-mission-control': 'Mission_control_pro.png',
  'andromeda-pro-service-order': 'Service_order_pro.png',
  'andromeda-pro-resource-planning': 'Resource_planning_pro.png',
  'andromeda-pro-signal-room': 'Signal_Room_pro.png',
  'andromeda-pro-sign-in': 'Sign_in_pro.png',
  'andromeda-pro-city-operations': 'City_operations_pro.png',
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

// City Operations is the one poster served untouched: it leads at double width
// and it is the densest shot in the set, the only one where the resize shows.
// Every other poster is small enough on screen that the helper's 1600px is
// already twice what its card paints.
const UNCOMPRESSED_ART = new Set(['andromeda-pro-city-operations'])

const BUILT_TEMPLATES: OverviewTemplate[] = (pro?.templates ?? []).map(
  (t: { slug: string; name: string; category?: string }) => {
    const file = TEMPLATE_IMAGE_FILE[t.slug]
    return {
      slug: t.slug,
      name: t.name,
      category: t.category ?? '',
      folder: t.slug.replace(/^andromeda-pro-/, ''),
      blurb: TEMPLATE_BLURBS[t.slug] ?? '',
      // v busts the browser cache when the art is re-shot under the same name;
      // the optimized lane needs none, its transform is already a fresh URL.
      image: file
        ? UNCOMPRESSED_ART.has(t.slug)
          ? `${ART_BASE}${encodeURIComponent(file)}?tr=orig-true&v=4`
          : optimizeImageKitUrl(`${ART_BASE}${encodeURIComponent(file)}`, 'detail')
        : null,
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
