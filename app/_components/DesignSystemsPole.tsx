'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { CaretDown, Cube, Lightning } from '@phosphor-icons/react'
import { ANDROMEDA_COMPONENT_META } from '../_lib/andromeda/andromeda-meta'
import { ANDROMEDA_COMPONENT_META as ANDROMEDA_PRO_COMPONENT_META } from '../_lib/andromeda-pro/andromeda-meta'
import { AndromedaIcon } from '../../design-systems/andromeda/AndromedaIcon'
import { SystemTierChip } from './SystemTierChip'

// ── Shared "Design Systems" sidebar pole ────────────────────────────────────
// SINGLE SOURCE OF TRUTH for the Design Systems pole. Rendered by the one
// `app/components/Sidebar.tsx` — plain in the root layout, and with `embedded`
// in the design-systems / ideation layouts — so the pole is identical on every
// page. The sidebar owns the collapse state + toggle (mutual-exclusion with the
// Components pole) and passes it in here; the data (systems → templates →
// components) and the full pole JSX live here.

// Design systems shown under the Design Systems pole.
// Two systems live side by side, each at its own routes: Andromeda Legacy
// (MIT) and Andromeda Pro. Neither replaces the other and neither redirects to the other.
const SYSTEMS = [
  {
    slug: 'andromeda-pro',
    name: 'Andromeda Pro',
    tier: 'pro',
    brain: true,
    // Pro's sections: Foundation, then Components. Neither
    // carries the premium mark - the foundation is open and single components
    // are free to explore.
    sections: [
      { slug: 'foundation', label: 'Foundation', premium: false },
      { slug: 'components', label: 'Components', premium: false },
      // The images download free; only the two files behind the set are Pro,
      // so the row carries no premium mark either.
      { slug: 'image-pack', label: 'Image Pack', premium: false },
    ],
    components: ANDROMEDA_PRO_COMPONENT_META.map((c) => ({ slug: c.slug, name: c.name })),
    templates: [
      { slug: 'signal-room', name: 'Signal Room', domain: 'Audio' },
      { slug: 'mission-control', name: 'Mission Control', domain: 'Sci-Fi' },
      { slug: 'service-order', name: 'Service Order', domain: 'Telecom' },
      { slug: 'resource-planning', name: 'Resource Planning', domain: 'Operations' },
    ],
  },
  {
    slug: 'andromeda',
    name: 'Andromeda Legacy',
    tier: 'mit',
    // Has a premium Brain page at /design-systems/<slug>/brain (rules +
    // foundations + per-component intelligence).
    brain: true,
    // Legacy ships exactly the rail production ships: one System row, premium
    // marked, then Brain. It has no /foundation or /components route.
    sections: [{ slug: 'system', label: 'System', premium: true }],
    components: ANDROMEDA_COMPONENT_META.map((c) => ({ slug: c.slug, name: c.name })),
    templates: [
      { slug: 'signal-room', name: 'Signal Room', domain: 'Audio' },
      { slug: 'mission-control', name: 'Mission Control', domain: 'Sci-Fi' },
      { slug: 'service-order', name: 'Service Order', domain: 'Telecom' },
      // exchange-terminal — hidden, source preserved (see design-systems.config.mjs)
      { slug: 'resource-planning', name: 'Resource Planning', domain: 'Operations' },
    ],
  },
] as const

// Template routes are full-screen — chrome is suppressed to let the composition
// fill the viewport. Exported so the sidebars can suppress themselves on them.
export const TEMPLATE_LEAF_RE = /^\/design-systems\/[^/]+\/templates\/[^/]+/

export function DesignSystemsPole({
  onNavigate,
}: {
  // Fired when any leaf link is tapped. The mobile drawer passes setOpen(false)
  // so it closes immediately on tap. Templates now navigate in the SAME tab
  // (the TemplatePreviewShell top bar carries you back), so a route change also
  // fires — but closing on tap avoids any flash. The desktop rail omits it —
  // there's no drawer to close.
  onNavigate?: () => void
}) {
  const pathname = usePathname() ?? ''

  // Active leaves inside the Design Systems pole: the overview, showcase,
  // examples, and per-component pages all live under /design-systems/<slug>.
  // Longest slug first: 'andromeda' is a prefix of 'andromeda-pro', so a plain
  // startsWith would light up Legacy on every Pro page.
  // Every system starts CLOSED. `open` only ever holds a system the visitor
  // has toggled by hand, so the default stays closed across navigations; the
  // system you are currently inside opens on its own (below) so the rail never
  // hides where you are.
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const activeSystem = [...SYSTEMS]
    .sort((a, b) => b.slug.length - a.slug.length)
    .find((s) => pathname === `/design-systems/${s.slug}` || pathname.startsWith(`/design-systems/${s.slug}/`))
  // Each system has its own component list; looking the active leaf up in one
  // fixed list left every Pro-only component (Burst, Orb, the charts) unlit.
  const activeAndromedaComponent = activeSystem
    ? activeSystem.components.find(
        (c) => pathname === `/design-systems/${activeSystem.slug}/${c.slug}`,
      )
    : null
  const onTemplates =
    activeSystem &&
    pathname.startsWith(`/design-systems/${activeSystem.slug}/templates`)
  const activeTemplate = onTemplates
    ? activeSystem.templates.find(
        (t) => pathname === `/design-systems/${activeSystem.slug}/templates/${t.slug}`,
      )
    : null

  return (
    <div className="mb-3">
      {/* A label, not a control. Collapsing now lives on each system row, so a
          second collapse here could hide both systems behind a header that
          carries no caret and no way back. */}
      <div className="mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-sand-700 dark:text-sand-300">
        <Cube weight="regular" size={16} />
        <span className="flex-1 text-left">Design Systems</span>
      </div>
      <div className="relative">
        {/* One vertical rail groups the systems under the pole header; it
            replaces the elbow arrow that used to sit on every row. */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-1 left-[14px] top-1 w-px bg-sand-200 dark:bg-sand-800"
        />
      <ul className="space-y-0.5">
          {SYSTEMS.map((system) => {
            // The system row never highlights: every page under it, the bare
            // overview included, now has its own child row (Overview). It used
            // to light on the overview path, which is the
            // same path the Overview child claims, so both lit at once and the
            // pole read as a double-select.
            const systemSelected = activeSystem?.slug === system.slug
            // Closed by default. A hand toggle wins in both directions; with
            // no toggle yet, only the system you are inside opens.
            const expanded = open[system.slug] ?? systemSelected
            return (
              <li key={system.slug}>
                {/* Two targets on one row: the name and the caret. The caret
                    opens or closes the list in place. The name goes to the
                    system and opens it; on the system you are already inside,
                    with its list open, it closes the list instead and stays on
                    the page, the way an accordion header does (the Overview
                    row is the way back to the overview). A button inside a
                    link is not valid markup, so they sit side by side and
                    share the row's hover ground. */}
                <div
                  className="group flex items-center gap-2 rounded-md pr-1 text-sm font-medium text-sand-700 transition-colors hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-100"
                >
                  <Link
                    href={`/design-systems/${system.slug}`}
                    onClick={(e) => {
                      if (systemSelected && expanded) {
                        e.preventDefault()
                        setOpen((o) => ({ ...o, [system.slug]: false }))
                        return
                      }
                      // Inside this system with its list closed: open it now.
                      // Headed to the other system: only drop any old hand
                      // toggle, so its list opens when that page arrives.
                      // Opening it on the click showed both lists at once for
                      // a beat and made the rail jump.
                      setOpen((o) => {
                        const next = { ...o }
                        if (systemSelected) next[system.slug] = true
                        else delete next[system.slug]
                        return next
                      })
                      onNavigate?.()
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pl-2 pr-2"
                  >
                    {/* The two systems are the top rows of the pole now: each
                        carries the Andromeda mark and its own full name. The
                        gap keeps them clear of the group's vertical rail. */}
                    <span aria-hidden className="w-3 shrink-0" />
                    <span aria-hidden className="shrink-0">
                      <AndromedaIcon size={14} mono />
                    </span>
                    <span className="min-w-0 truncate font-semibold">
                      {system.name}
                    </span>
                    <span aria-hidden className="flex">
                      <SystemTierChip tier={system.tier} />
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setOpen((o) => ({ ...o, [system.slug]: !expanded }))}
                    aria-expanded={expanded}
                    aria-label={`${expanded ? 'Collapse' : 'Expand'} ${system.name}`}
                    className="-mr-0.5 shrink-0 rounded p-1 text-sand-600 transition-colors hover:text-sand-900 dark:text-sand-500 dark:hover:text-sand-100"
                  >
                    <CaretDown
                      size={12}
                      weight="regular"
                      className={`shrink-0 transition-transform ${expanded ? '' : '-rotate-90'}`}
                    />
                  </button>
                </div>
                {expanded && (
                  <div className="relative">
                    {/* Nesting rail — groups System / Brain / Templates / Components under Andromeda */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute bottom-1 left-[14px] top-1 w-px bg-sand-200 dark:bg-sand-800"
                    />
                    <ul className="mt-0.5 space-y-0.5">
                    {/* ── Overview: the system's own landing page, above every
                        section. Exact-match active state (not startsWith) so
                        it lights up only on `/design-systems/<slug>` itself,
                        never on a child page underneath it. */}
                    <li className="mt-1">
                      <Link
                        href={`/design-systems/${system.slug}`}
                        onClick={onNavigate}
                        className={`flex items-center gap-2 rounded-md py-1.5 pl-7 pr-2 text-[13px] font-medium transition-colors ${
                          pathname === `/design-systems/${system.slug}`
                            ? 'bg-sand-300/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                            : 'text-sand-700 hover:bg-sand-300/50 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'
                        }`}
                      >
                        <span className="flex-1 truncate">Overview</span>
                      </Link>
                    </li>
                    {/* ── Section rows, per system. Each system names its own
                        because they do not share an IA: Legacy has System,
                        Pro has Foundation then Components. */}
                    {system.sections.map((section) => (
                      <li key={section.slug} className="mt-1">
                        <Link
                          href={`/design-systems/${system.slug}/${section.slug}`}
                          onClick={onNavigate}
                          className={`flex items-center gap-2 rounded-md py-1.5 pl-7 pr-2 text-[13px] font-medium transition-colors ${
                            pathname === `/design-systems/${system.slug}/${section.slug}`
                              ? 'bg-sand-300/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                              : 'text-sand-700 hover:bg-sand-300/50 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'
                          }`}
                        >
                          <span className="flex-1 truncate">{section.label}</span>
                          {/* Lightning marks premium (install is premium). */}
                          {section.premium && (
                            <>
                              <Lightning
                                weight="regular"
                                size={13}
                                aria-hidden
                                className="ml-auto shrink-0 text-sand-600 dark:text-sand-500"
                              />
                              <span className="sr-only">Premium</span>
                            </>
                          )}
                        </Link>
                      </li>
                    ))}
                    {/* ── Brain (premium judgment layer) ─────────── */}
                    {system.brain && (
                      <li className="mt-1">
                        <Link
                          href={`/design-systems/${system.slug}/brain`}
                          onClick={onNavigate}
                          className={`flex items-center gap-2 rounded-md py-1.5 pl-7 pr-2 text-[13px] font-medium transition-colors ${
                            pathname === `/design-systems/${system.slug}/brain` ||
                            pathname.startsWith(`/design-systems/${system.slug}/brain/`)
                              ? 'bg-sand-200/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                              : 'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'
                          }`}
                        >
                          <span className="flex-1 truncate">Brain</span>
                          <Lightning
                            weight="regular"
                            size={13}
                            aria-hidden
                            className="ml-auto shrink-0 text-sand-600 dark:text-sand-500"
                          />
                          <span className="sr-only">Premium</span>
                        </Link>
                      </li>
                    )}
                    {/* ── Templates (label + flat list) ──────────── */}
                    <li className="mt-1">
                      <div className="pt-1.5 pb-0.5 pl-7 pr-2 text-xxs uppercase tracking-wider text-sand-600 dark:text-sand-500">
                        Templates
                      </div>
                      <ul className="space-y-0.5">
                        {system.templates.map((t) => {
                          const isActive = activeTemplate?.slug === t.slug
                          return (
                            <li key={t.slug}>
                              <Link
                                href={`/design-systems/${system.slug}/templates/${t.slug}`}
                                onClick={onNavigate}
                                className={`flex items-center gap-2 rounded-md py-1.5 pl-7 pr-2 text-[13px] font-medium transition-colors ${
                                  isActive
                                    ? 'bg-sand-200/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                                    : 'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'
                                }`}
                              >
                                <span className="flex-1 truncate">{t.name}</span>
                                {/* Lightning marks the template as Premium (replaces
                                    the old domain tag). The bolt is decorative; the
                                    sr-only word folds "Premium" into the link's
                                    accessible name (Phosphor renders a bare <svg>, so
                                    an aria-label on it is unreliably announced). */}
                                <Lightning
                                  weight="regular"
                                  size={13}
                                  aria-hidden
                                  className="ml-auto shrink-0 text-sand-600 dark:text-sand-500"
                                />
                                <span className="sr-only">Premium</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                    {/* ── Components (label + flat list) ──────── */}
                    {/* Shown whenever Andromeda is expanded; the list runs long,
                        so it overflows into the sidebar's own scroll (peeks on
                        tall screens, scroll for the rest). */}
                    <li className="mt-1">
                      <div className="pt-1.5 pb-0.5 pl-7 pr-2 text-xxs uppercase tracking-wider text-sand-600 dark:text-sand-500">
                        Components
                      </div>
                      <ul className="space-y-0.5">
                        {system.components.map((c) => {
                          const isActive = activeAndromedaComponent?.slug === c.slug
                          return (
                            <li key={c.slug}>
                              <Link
                                href={`/design-systems/${system.slug}/${c.slug}`}
                                onClick={onNavigate}
                                className={`flex items-center gap-2 rounded-md py-1.5 pl-7 pr-2 text-[13px] font-medium transition-colors ${
                                  isActive
                                    ? 'bg-sand-200/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                                    : 'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'
                                }`}
                              >
                                {c.name}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  </ul>
                  </div>
                )}
              </li>
            )
          })}
      </ul>
      </div>
    </div>
  )
}
