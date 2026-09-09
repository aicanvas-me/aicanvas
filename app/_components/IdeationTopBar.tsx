'use client'

import { usePathname } from 'next/navigation'
import { HeaderSocials } from '../components/HeaderSocials'
import { TopAuthPill } from '../components/auth/TopAuthPill'
import { Breadcrumbs, type Crumb } from '../components/Breadcrumbs'
import { ANDROMEDA_COMPONENT_META } from '../_lib/andromeda-pro/andromeda-meta'

// The sticky top-bar breadcrumb for design-system + ideation routes. One
// consistent, left-aligned trail so a visitor can click straight up the tree —
// the components side uses the same Breadcrumbs (HomeClient + ComponentPageView).
// Distraction-free template/example leaves render no chrome at all; the
// TemplatePreviewShell owns those.

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
}

// Template routes are full-screen — chrome is suppressed to let the composition
// fill the viewport.
const TEMPLATE_LEAF_RE = /^\/design-systems\/[^/]+\/templates\/[^/]+/
// Two systems live side by side: Andromeda (MIT) and Andromeda Pro. Each owns
// its own route namespace, so every crumb below is built from the system slug
// in the path rather than from a single hardcoded system.
const SYSTEM_LABELS: Record<string, string> = {
  andromeda: 'Andromeda Legacy',
  'andromeda-pro': 'Andromeda Pro',
}
const SYSTEM_ALT = Object.keys(SYSTEM_LABELS).join('|')
const overviewHref = (system: string) => `/design-systems/${system}`
// Per-component pages live at /design-systems/<system>/<slug>; showcase,
// templates, examples, and brain are excluded so they resolve to their own crumbs.
const ANDROMEDA_COMPONENT_RE = new RegExp(
  `^/design-systems/(${SYSTEM_ALT})/(?!examples|showcase|system|templates|brain)([^/]+)/?$`,
)
const SYSTEM_SECTION_RE = new RegExp(`^/design-systems/(${SYSTEM_ALT})(?:/([^/]+))?/?$`)
const BRAIN_READER_RE = new RegExp(`^/design-systems/(${SYSTEM_ALT})/brain/explore/?$`)
const BRAIN_LANDING_RE = new RegExp(`^/design-systems/(${SYSTEM_ALT})/brain/?$`)

function prettify(seg: string): string {
  if (SEGMENT_NAMES[seg]) return SEGMENT_NAMES[seg]
  return seg
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

// "Design Systems" has no dedicated page, so it's plain context (no href).
const DESIGN_SYSTEMS: Crumb = { label: 'Design Systems' }

function buildCrumbs(pathname: string): Crumb[] | null {
  // Component leaf → Design Systems · <System> / <name>
  const componentMatch = pathname.match(ANDROMEDA_COMPONENT_RE)
  if (componentMatch) {
    const [, system, slug] = componentMatch
    // The shared meta array describes the Pro set; the MIT system falls back to
    // the prettified slug until it carries meta of its own.
    const meta = system === 'andromeda-pro' ? ANDROMEDA_COMPONENT_META.find((c) => c.slug === slug) : undefined
    return [
      DESIGN_SYSTEMS,
      { label: SYSTEM_LABELS[system], href: overviewHref(system) },
      { label: meta?.name ?? prettify(slug) },
    ]
  }
  // Brain reader → Design Systems · <System> / Brain (Brain links to the story
  // landing; the reader is the current page).
  const readerMatch = pathname.match(BRAIN_READER_RE)
  if (readerMatch) {
    const system = readerMatch[1]
    return [
      DESIGN_SYSTEMS,
      { label: SYSTEM_LABELS[system], href: overviewHref(system) },
      { label: 'Brain', href: `/design-systems/${system}/brain` },
      { label: 'Reader' },
    ]
  }
  // Overview and its one-level sections → Design Systems · <System> [ / Section ]
  const sectionMatch = pathname.match(SYSTEM_SECTION_RE)
  if (sectionMatch) {
    const [, system, section] = sectionMatch
    if (!section) return [DESIGN_SYSTEMS, { label: SYSTEM_LABELS[system] }]
    return [
      DESIGN_SYSTEMS,
      { label: SYSTEM_LABELS[system], href: overviewHref(system) },
      { label: section === 'components' ? 'System' : prettify(section) },
    ]
  }
  // Fallback — a generic breadcrumb from the path segments (legacy /ideation/*).
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return null
  return segments.map((seg, i) => ({
    label: prettify(seg),
    href: i === segments.length - 1 ? undefined : '/' + segments.slice(0, i + 1).join('/'),
  }))
}

const headerClass =
  'sticky top-0 z-30 hidden h-14 shrink-0 items-center justify-between gap-4 border-b border-sand-300 bg-sand-200 px-6 dark:border-sand-800 dark:bg-sand-950 md:flex'

export function IdeationTopBar() {
  const pathname = usePathname() ?? '/ideation'

  // Distraction-free template/example pages provide their own chrome, so the
  // topbar disappears there.
  if (TEMPLATE_LEAF_RE.test(pathname)) return null

  // The Brain LANDING renders its own full-page header (BrainStoryV4) — no app
  // breadcrumb bar over it.
  if (BRAIN_LANDING_RE.test(pathname)) return null

  const crumbs = buildCrumbs(pathname)
  if (!crumbs) return null

  // The Brain READER and the Showcase mirror the template top bar: install
  // control(s) portaled into a slot next to the auth pill, replacing the
  // Lightning status pill. BrainViewer owns the brain slot; ShowcaseInstall
  // owns the showcase slot.
  const isBrainReader = pathname === '/design-systems/andromeda/brain/explore'
  const isShowcase = pathname === '/design-systems/andromeda/components'

  return (
    <div className={headerClass}>
      <Breadcrumbs crumbs={crumbs} />
      {isBrainReader ? (
        <div className="flex items-center gap-2">
          <div id="brain-install-slot" />
          <TopAuthPill showStatusPill={false} />
        </div>
      ) : isShowcase ? (
        <div className="flex items-center gap-2">
          <div id="andromeda-install-slot" />
          <TopAuthPill showStatusPill={false} />
        </div>
      ) : (
        <HeaderSocials />
      )}
    </div>
  )
}
