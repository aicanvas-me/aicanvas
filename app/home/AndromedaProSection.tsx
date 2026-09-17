// The homepage's Andromeda Pro spotlight: a light falls on a browser window,
// the window holds three live wells (tokens, themes, interactions), and the
// Brain turns underneath. Server component: the copy, frame and counts render
// as static HTML; only the wells and the Brain hydrate, lazily, via
// ./AndromedaProIslands.
//
// The stage is always dark, in both site themes, like every component preview
// on the site: it is a window into the system, not site chrome. So the classes
// here carry no dark: variants.
//
// Every number is counted from source, the same way the Pro overview counts.

import Link from 'next/link'
import { ArrowRight, CircleHalf, HandTap, Swatches } from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'
import { buttonClasses } from '../components/buttonClasses'
import { SystemTierChip } from '../_components/SystemTierChip'
import { ANDROMEDA_COMPONENT_META as PRO_COMPONENT_META } from '../_lib/andromeda-pro/andromeda-meta'
import { COMPONENT_COUNTS } from '../design-systems/andromeda-pro/system/component-counts'
import { TEMPLATES } from '../design-systems/andromeda-pro/overview-b/overview-data'
import { BrainWireframe, InteractionDemo, ThemeDemo, TokenDemo } from './AndromedaProIslands'
import { ProCardStack } from './ProCardStack'

const PRO_HREF = '/design-systems/andromeda-pro'

// Counts in running copy read as words up to twenty, as on the Pro overview.
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
const word = (n: number) => WORDS[n] ?? String(n)

const components = PRO_COMPONENT_META.length
const states = Object.values(COMPONENT_COUNTS).reduce((sum, c) => sum + c.states, 0)

type Demo = 'tokens' | 'themes' | 'interactions'

const CARDS: { icon: Icon; label: string; value: string; line: string; demo: Demo }[] = [
  {
    icon: Swatches,
    label: 'Token driven',
    value: '3 layers',
    line: 'Swap one ramp, every part follows',
    demo: 'tokens',
  },
  {
    icon: CircleHalf,
    label: 'Dual themes',
    value: 'Dark + light',
    line: 'Drag the line across the panel',
    demo: 'themes',
  },
  {
    icon: HandTap,
    label: 'Premium interactions',
    value: `${states} states`,
    line: `Tuned across ${components} components`,
    demo: 'interactions',
  },
]

// Faint grid under the light, faded out toward the edges.
const GRID_STYLE = {
  backgroundImage:
    'linear-gradient(to right, rgb(255 255 255 / 0.045) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.045) 1px, transparent 1px)',
  backgroundSize: '40px 40px',
  maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 75%)',
  WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 75%)',
}

function Spotlight() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[440px] w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="aic-pro-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(34 211 238)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="rgb(34 211 238)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="aic-pro-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(103 232 249)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="rgb(103 232 249)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points="36,0 64,0 88,100 12,100" fill="url(#aic-pro-beam)" />
      <line x1="36" y1="0" x2="12" y2="100" stroke="url(#aic-pro-edge)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <line x1="64" y1="0" x2="88" y2="100" stroke="url(#aic-pro-edge)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function DemoFor({ demo }: { demo: Demo }) {
  if (demo === 'tokens') return <TokenDemo />
  if (demo === 'themes') return <ThemeDemo />
  return <InteractionDemo />
}

function Card({ icon: CardIcon, label, value, line, demo }: (typeof CARDS)[number]) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-sand-800 bg-sand-900/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-sand-300">{label}</span>
        <CardIcon weight="regular" aria-hidden className="size-4 shrink-0 text-cyan-400" />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-sand-50">{value}</p>
      <p className="mt-1 text-xs font-semibold text-cyan-400">{line}</p>
      <div className="mt-4 h-[148px] overflow-hidden rounded-lg border border-sand-800">
        <DemoFor demo={demo} />
      </div>
    </div>
  )
}

// The window and the Brain row: dark stages in both site themes. Version 1
// shows both; version 2 keeps only the Brain.
function WindowAndBrain() {
  return (
    <>
      <ProWindow />
      <Brain />
    </>
  )
}

function ProWindow() {
  return (
    <>
      {/* ── The window ── */}
      <div className="relative mt-12 rounded-2xl border border-sand-800 bg-sand-900 p-2 shadow-[0_2px_4px_rgba(0,0,0,0.4),0_24px_64px_rgba(0,0,0,0.6)]">
        <div className="overflow-hidden rounded-xl border border-sand-800 bg-sand-950">
          <div className="flex h-11 items-center gap-3 border-b border-sand-800 px-4">
            <div aria-hidden className="flex shrink-0 gap-1.5">
              <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
              <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
              <span className="size-2.5 rounded-full bg-[#28c840]/80" />
            </div>
            <span className="min-w-0 flex-1 truncate text-center font-mono text-xs text-sand-400">
              aicanvas.me/design-systems/andromeda-pro
            </span>
            <span className="hidden shrink-0 rounded-full border border-sand-800 px-2.5 py-0.5 text-xs font-semibold text-sand-300 sm:inline">
              {`${TEMPLATES.length} templates`}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 lg:grid-cols-3">
            {CARDS.map((card) => (
              <Card key={card.label} {...card} />
            ))}
          </div>
        </div>
      </div>

    </>
  )
}

// bare: no border, for version 2 where the Brain sits inside the section box.
function Brain({ bare = false }: { bare?: boolean }) {
  return (
    <>
      {/* ── The Brain ── */}
      <div className={`mt-6 grid grid-cols-1 overflow-hidden rounded-2xl bg-sand-950 sm:grid-cols-2 ${bare ? '' : 'border border-sand-800'}`}>
        <div className="relative h-56 sm:h-auto sm:min-h-[300px]">
          <BrainWireframe />
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">The Brain</span>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-sand-50">Your agent reads the rules first.</h3>
          <p className="mt-3 text-sm leading-relaxed text-sand-300">
            Foundations, component rules and skills your AI reads before it writes a line, so everything it builds
            stays on the system.
          </p>
          <div className="mt-6">
            <Link
              href={`${PRO_HREF}/brain`}
              className="inline-flex items-center gap-2 rounded-lg border border-sand-700 px-4 py-2 text-sm font-semibold text-sand-300 transition-colors hover:border-sand-600 hover:text-sand-50"
            >
              Explore the Brain
              <ArrowRight weight="regular" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export function AndromedaProSection() {
  return (
    <section aria-labelledby="home-andromeda-pro" className="mt-16 sm:mt-24">
      <div className="relative isolate overflow-hidden rounded-3xl border border-sand-800 bg-sand-950 px-4 pb-6 pt-14 sm:px-8 sm:pb-8 sm:pt-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={GRID_STYLE} />
        <Spotlight />

        {/* ── Intro ── */}
        <div className="relative flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">New design system</span>
            <SystemTierChip tier="pro" />
          </div>
          <h2
            id="home-andromeda-pro"
            className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-sand-50 sm:text-4xl"
          >
            Andromeda Pro
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-sand-300">
            {`A token-driven system for dashboards and control rooms. ${components} components and ${word(TEMPLATES.length)} templates, dark and light, with every state designed.`}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href={PRO_HREF} className={buttonClasses({ variant: 'primary', size: 'md' })}>
              Explore Andromeda Pro
              <ArrowRight weight="regular" size={14} />
            </Link>
            <Link
              href={`${PRO_HREF}/components`}
              className="inline-flex items-center gap-2 rounded-lg border border-sand-700 px-4 py-2 text-sm font-semibold text-sand-300 transition-colors hover:border-sand-600 hover:text-sand-50"
            >
              See the components
            </Link>
          </div>
        </div>

        <WindowAndBrain />
      </div>
    </section>
  )
}

// Version 2: no beam and no outer box. The intro sits straight on the page and
// follows the site theme; the grid stays, drawn in the theme's ink.
const GRID_MASK = 'radial-gradient(ellipse 60% 70% at 30% 35%, black 15%, transparent 70%)'
const gridStyle = (ink: string) => ({
  backgroundImage: `linear-gradient(to right, ${ink} 1px, transparent 1px), linear-gradient(to bottom, ${ink} 1px, transparent 1px)`,
  backgroundSize: '40px 40px',
  maskImage: GRID_MASK,
  WebkitMaskImage: GRID_MASK,
})

export function AndromedaProSectionV2() {
  return (
    <section aria-labelledby="home-andromeda-pro-v2" className="mt-16 sm:mt-24">
      {/* One box holds the intro, the stack and the Brain, so they read as one section. */}
      <div className="relative isolate overflow-hidden rounded-3xl border border-sand-200 p-4 sm:p-8 lg:p-10 dark:border-sand-800">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] dark:hidden" style={gridStyle('rgb(0 0 0 / 0.05)')} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[520px] dark:block" style={gridStyle('rgb(255 255 255 / 0.045)')} />

        {/* ── Intro on the left, the card stack on the right; stacks on phones ── */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">New design system</span>
              <SystemTierChip tier="pro" />
            </div>
            <h2
              id="home-andromeda-pro-v2"
              className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-sand-900 sm:text-4xl dark:text-sand-50"
            >
              Andromeda Pro
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-sand-700 dark:text-sand-300">
              {`A token-driven system for dashboards and control rooms. ${components} components and ${word(TEMPLATES.length)} templates, dark and light, with every state designed.`}
            </p>
          </div>
          <div className="w-full max-w-md lg:ml-auto">
            <ProCardStack states={states} components={components} />
          </div>
        </div>

        <Brain bare />
      </div>

      {/* ── Calls to action, under the Brain ── */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href={PRO_HREF} className={buttonClasses({ variant: 'primary', size: 'md' })}>
          Explore Andromeda Pro
          <ArrowRight weight="regular" size={14} />
        </Link>
        <Link href={`${PRO_HREF}/components`} className={buttonClasses({ variant: 'outline', size: 'md' })}>
          See the components
        </Link>
      </div>
    </section>
  )
}
