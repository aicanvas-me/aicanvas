import type { Crumb } from './Breadcrumbs'
import { CATEGORIES } from '../lib/categories'
import { COLLECTIONS } from '../lib/collections'
import { COMPONENT_NAMES } from '../lib/component-nav.generated'
import { ANDROMEDA_COMPONENT_META } from '../_lib/andromeda/andromeda-meta'
import { ANDROMEDA_COMPONENT_META as ANDROMEDA_PRO_COMPONENT_META } from '../_lib/andromeda-pro/andromeda-meta'

// The breadcrumb trail for the site top bar, derived from the URL alone.
//
// The bar is rendered once by the root layout and stays mounted across
// navigations, so it cannot ask each page what to show: by the time a page
// could tell it, the server HTML would already be out. Deriving the trail from
// the pathname keeps the crumbs in the first byte and keeps every page free of
// bar markup. Everything here is registry-free: names come from the generated
// slug map and the two Andromeda meta lists, never from component-registry.

// Template routes are full-screen compositions with no chrome at all; the
// TemplatePreviewShell owns those. The sidebar hides on the same test.
export const TEMPLATE_LEAF_RE = /^\/design-systems\/[^/]+\/templates\/[^/]+/

// The card-art capture route renders one component alone on a void canvas for
// scripts/screenshot-andromeda.mjs. It is a tool, not a page: any chrome left
// in the frame is baked into the poster that ships on the gallery card. It
// used to escape the chrome by living at the app root, which stopped being
// true when the bar and the rail moved into the root layout.
export const CAPTURE_LEAF_RE = /^\/andromeda-capture\//

const SYSTEM_LABELS: Record<string, string> = {
  andromeda: 'Andromeda Legacy',
  'andromeda-pro': 'Andromeda Pro',
}
const SYSTEM_ALT = Object.keys(SYSTEM_LABELS).join('|')
const overviewHref = (system: string) => `/design-systems/${system}`

const ANDROMEDA_COMPONENT_RE = new RegExp(
  `^/design-systems/(${SYSTEM_ALT})/(?!examples|showcase|system|templates|brain)([^/]+)/?$`,
)
const SYSTEM_SECTION_RE = new RegExp(`^/design-systems/(${SYSTEM_ALT})(?:/([^/]+))?/?$`)
const BRAIN_READER_RE = new RegExp(`^/design-systems/(${SYSTEM_ALT})/brain/explore/?$`)

const SEGMENT_NAMES: Record<string, string> = {
  ideation: 'Ideation',
  components: 'Components',
  'design-systems': 'Design Systems',
  andromeda: 'Andromeda Legacy',
  'andromeda-pro': 'Andromeda Pro',
  showcase: 'Showcase',
  examples: 'See It in Action',
  dashboard: 'Dashboard',
  'service-order': 'Service Order',
  'image-pack': 'Image Pack',
}

// Single-segment site pages. The label is what the page used to put in its
// own bar, so nothing a visitor reads has changed.
const PAGE_NAMES: Record<string, string> = {
  '/': 'Overview',
  '/pricing': 'Pricing',
  '/about': 'About',
  '/faq': 'FAQ',
  '/contact': 'Contact',
  '/feedback': 'Feedback',
  '/mcp': 'Get MCP',
  '/welcome': 'Welcome',
  '/privacy': 'Privacy',
  '/terms': 'Terms',
  '/impressum': 'Impressum',
  '/kuendigen': 'Kündigen',
  '/refund': 'Refund',
  '/credits': 'Credits',
  '/premium-license': 'Premium License',
  '/account': 'Account',
}

function prettify(seg: string): string {
  if (SEGMENT_NAMES[seg]) return SEGMENT_NAMES[seg]
  return seg
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

const DESIGN_SYSTEMS: Crumb = { label: 'Design Systems' }
const COMPONENTS: Crumb = { label: 'Components & Blocks', href: '/components' }

// Routes where the bar carries an install CTA between the theme toggle and
// the user pill. The CTA itself is portalled in by the page; the bar only
// provides the mount point, keyed by id.
const INSTALL_SLOTS: Record<string, string> = {
  '/design-systems/andromeda/system': 'andromeda-install-slot',
  '/design-systems/andromeda-pro/foundation': 'andromeda-install-slot',
  '/design-systems/andromeda-pro/components': 'andromeda-install-slot',
}

export function installSlotId(pathname: string): string | null {
  if (BRAIN_READER_RE.test(pathname)) return 'brain-install-slot'
  return INSTALL_SLOTS[pathname.replace(/\/$/, '') || '/'] ?? null
}

export function buildTopBarCrumbs(pathname: string): Crumb[] | null {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname

  // ── Components & Blocks ──
  if (path === '/components') return [{ label: 'Components & Blocks' }]
  const categoryMatch = path.match(/^\/components\/category\/([^/]+)$/)
  if (categoryMatch) {
    const cat = CATEGORIES.find((c) => c.slug === categoryMatch[1])
    return [COMPONENTS, { label: cat?.label ?? prettify(categoryMatch[1]) }]
  }
  // Collections sit under /components/collection/<slug>, but there is no index
  // at /components/collection, so this must not fall through to the generic
  // segment walk: that would hand 8 indexed pages a crumb linking to a 404.
  const collectionMatch = path.match(/^\/components\/collection\/([^/]+)$/)
  if (collectionMatch) {
    const col = COLLECTIONS.find((c) => c.slug === collectionMatch[1])
    return [COMPONENTS, { label: col?.h1 ?? prettify(collectionMatch[1]) }]
  }
  const componentMatch = path.match(/^\/components\/([^/]+)$/)
  if (componentMatch) {
    const slug = componentMatch[1]
    return [COMPONENTS, { label: COMPONENT_NAMES[slug] ?? prettify(slug) }]
  }

  // ── Design systems ──
  // Per-component page → Design Systems · <System> · <Component>
  const dsComponent = path.match(ANDROMEDA_COMPONENT_RE)
  if (dsComponent) {
    const [, system, slug] = dsComponent
    const list = system === 'andromeda-pro' ? ANDROMEDA_PRO_COMPONENT_META : ANDROMEDA_COMPONENT_META
    const meta = list.find((c) => c.slug === slug)
    return [
      DESIGN_SYSTEMS,
      { label: SYSTEM_LABELS[system], href: overviewHref(system) },
      { label: meta?.name ?? prettify(slug) },
    ]
  }
  // Brain reader → Design Systems · <System> · Brain · Reader
  const reader = path.match(BRAIN_READER_RE)
  if (reader) {
    const system = reader[1]
    return [
      DESIGN_SYSTEMS,
      { label: SYSTEM_LABELS[system], href: overviewHref(system) },
      { label: 'Brain', href: `/design-systems/${system}/brain` },
      { label: 'Reader' },
    ]
  }
  // Overview and its one-level sections → Design Systems · <System> [ · Section ]
  const section = path.match(SYSTEM_SECTION_RE)
  if (section) {
    const [, system, sec] = section
    if (!sec) return [DESIGN_SYSTEMS, { label: SYSTEM_LABELS[system] }]
    return [
      DESIGN_SYSTEMS,
      { label: SYSTEM_LABELS[system], href: overviewHref(system) },
      { label: prettify(sec) },
    ]
  }

  // ── Site pages ──
  if (PAGE_NAMES[path]) return [{ label: PAGE_NAMES[path] }]
  const accountSub = path.match(/^\/account\/([^/]+)$/)
  if (accountSub) return [{ label: 'Account', href: '/account' }, { label: prettify(accountSub[1]) }]

  // Fallback: a generic trail from the path segments.
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) return null
  return segments.map((seg, i) => ({
    label: prettify(seg),
    href: i === segments.length - 1 ? undefined : '/' + segments.slice(0, i + 1).join('/'),
  }))
}
