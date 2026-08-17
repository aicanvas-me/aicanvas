'use client'

import { usePathname } from 'next/navigation'
import { HeaderSocials } from '../components/HeaderSocials'
import { TopAuthPill } from '../components/auth/TopAuthPill'
import { Breadcrumbs, type Crumb } from '../components/Breadcrumbs'
import { ANDROMEDA_COMPONENT_META } from '../_lib/andromeda/andromeda-meta'

// The sticky top-bar breadcrumb for design-system + ideation routes. One
// consistent, left-aligned trail so a visitor can click straight up the tree —
// the components side uses the same Breadcrumbs (HomeClient + ComponentPageView).
// Distraction-free template/example leaves render no chrome at all; the
// TemplatePreviewShell owns those.

const SEGMENT_NAMES: Record<string, string> = {
  ideation: 'Ideation',
  components: 'Components',
  'design-systems': 'Design Systems',
  andromeda: 'Andromeda',
  showcase: 'Showcase',
  examples: 'See It in Action',
  dashboard: 'Dashboard',
  'service-order': 'Service Order',
}

// Template routes are full-screen — chrome is suppressed to let the composition
// fill the viewport.
const TEMPLATE_LEAF_RE = /^\/design-systems\/[^/]+\/templates\/[^/]+/
// The Andromeda overview lives at /design-systems/andromeda — the clickable
// "Andromeda" crumb points here from deeper pages.
const ANDROMEDA_OVERVIEW = '/design-systems/andromeda'
// Per-component pages live at /design-systems/andromeda/<slug>; showcase,
// templates, examples, and brain are excluded so they resolve to their own crumbs.
const ANDROMEDA_COMPONENT_RE =
  /^\/design-systems\/andromeda\/(?!examples|showcase|system|templates|brain)([^/]+)\/?$/

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
  // Andromeda component leaf → Design Systems · Andromeda / <name>
  const componentMatch = pathname.match(ANDROMEDA_COMPONENT_RE)
  if (componentMatch) {
    const slug = componentMatch[1]
    const meta = ANDROMEDA_COMPONENT_META.find((c) => c.slug === slug)
    return [DESIGN_SYSTEMS, { label: 'Andromeda', href: ANDROMEDA_OVERVIEW }, { label: meta?.name ?? prettify(slug) }]
  }
  // System → Design Systems · Andromeda / System
  if (pathname === '/design-systems/andromeda/system') {
    return [DESIGN_SYSTEMS, { label: 'Andromeda', href: ANDROMEDA_OVERVIEW }, { label: 'System' }]
  }
  // Brain reader → Design Systems · Andromeda / Brain (Brain links to the story
  // landing; the reader is the current page).
  if (pathname === '/design-systems/andromeda/brain/explore') {
    return [
      DESIGN_SYSTEMS,
      { label: 'Andromeda', href: ANDROMEDA_OVERVIEW },
      { label: 'Brain', href: '/design-systems/andromeda/brain' },
      { label: 'Reader' },
    ]
  }
  // Overview → Design Systems · Andromeda (Andromeda is the current page)
  if (pathname === ANDROMEDA_OVERVIEW) {
    return [DESIGN_SYSTEMS, { label: 'Andromeda' }]
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
  if (pathname === '/design-systems/andromeda/brain') return null

  const crumbs = buildCrumbs(pathname)
  if (!crumbs) return null

  // The Brain READER and the Showcase mirror the template top bar: install
  // control(s) portaled into a slot next to the auth pill, replacing the
  // Lightning status pill. BrainViewer owns the brain slot; ShowcaseInstall
  // owns the showcase slot.
  const isBrainReader = pathname === '/design-systems/andromeda/brain/explore'
  const isShowcase = pathname === '/design-systems/andromeda/system'

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
