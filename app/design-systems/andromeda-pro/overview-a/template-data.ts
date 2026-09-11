// Template data for overview variant A. Plain data only (no React, no icons), so
// the server page can build it and hand it to the client view as strings.
//
// New card art drops in by editing TEMPLATE_IMAGE_FILE and nothing else. An
// empty string means "no art yet": the card paints its own dark panel instead
// of an <img>, because a URL built from an empty filename resolves to the
// folder itself and paints a broken-image glyph.
import { DESIGN_SYSTEMS } from '../../../../scripts/lib/design-systems.config.mjs'

export type OverviewTemplate = {
  slug: string
  name: string
  domain: string
  folder: string
  blurb: string
  image: string | null
}

const TEMPLATE_BLURBS: Record<string, string> = {
  'andromeda-pro-mission-control':
    'Spacecraft telemetry: live altitude, vehicle roster, comms log, and a system-status readout in one mission view.',
  'andromeda-pro-service-order':
    'A field-service work order: an SLA gauge, line items, and order metadata.',
  'andromeda-pro-resource-planning':
    'Capacity, allocation trend, and request triage across teams on one planning board.',
  'andromeda-pro-signal-room':
    'A broadcast control room: now-transmitting, channel levels, mixes, and a transport bar.',
  'andromeda-pro-sign-in':
    'An authentication screen: credential entry, provider options, and inline validation.',
}

// Filenames exactly as uploaded to ImageKit (andromeda/templates/): spaces and
// mixed case, so they are URL-encoded when the src is built.
export const TEMPLATE_IMAGE_FILE: Record<string, string> = {
  'andromeda-pro-mission-control': 'Mission control.png',
  'andromeda-pro-service-order': 'Service order.png',
  'andromeda-pro-resource-planning': 'Resource planning.png',
  'andromeda-pro-signal-room': 'Signal Room.png',
  'andromeda-pro-sign-in': '',
}

// The lead card of the bento: it spans both columns at 16:9.
const LEAD_TEMPLATE = 'andromeda-pro-signal-room'

// `domain` is optional in the config's own typedef.
type TemplateConfig = { slug: string; name: string; domain?: string }

export function buildTemplates(): OverviewTemplate[] {
  const pro = DESIGN_SYSTEMS.find((s: { slug: string }) => s.slug === 'andromeda-pro')
  const configured: TemplateConfig[] = pro?.templates ?? []
  const list = configured.map((t) => {
    const file = TEMPLATE_IMAGE_FILE[t.slug]
    return {
      slug: t.slug,
      name: t.name,
      domain: t.domain ?? '',
      folder: t.slug.replace(/^andromeda-pro-/, ''),
      blurb: TEMPLATE_BLURBS[t.slug] ?? '',
      // tr=orig-true serves the untouched original (no resize, no recompress).
      image: file
        ? `https://ik.imagekit.io/aitoolkit/andromeda/templates/${encodeURIComponent(file)}?tr=orig-true`
        : null,
    }
  })
  return [
    ...list.filter((t) => t.slug === LEAD_TEMPLATE),
    ...list.filter((t) => t.slug !== LEAD_TEMPLATE),
  ]
}
