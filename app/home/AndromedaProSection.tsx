// The homepage's Andromeda Pro section: one bordered box holding the intro, a
// turning stack of fact cards and the Brain, each part with its own button. Server
// component: the copy and counts render as static HTML; only the card stack
// and the Brain wireframe hydrate. The section follows the site theme.
//
// Every number is counted from source, the same way the Pro overview counts.

import Link from 'next/link'
import { buttonClasses } from '../components/buttonClasses'
import { SystemTierChip } from '../_components/SystemTierChip'
import { ANDROMEDA_COMPONENT_META as PRO_COMPONENT_META } from '../_lib/andromeda-pro/andromeda-meta'
import { COMPONENT_COUNTS } from '../design-systems/andromeda-pro/system/component-counts'
import { TEMPLATES } from '../design-systems/andromeda-pro/overview-b/overview-data'
import { BrainWireframe } from './AndromedaProIslands'
import { ProCardStack } from './ProCardStack'

const PRO_HREF = '/design-systems/andromeda-pro'

// Counts in running copy read as words up to twenty, as on the Pro overview.
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
const word = (n: number) => WORDS[n] ?? String(n)

const components = PRO_COMPONENT_META.length
const states = Object.values(COMPONENT_COUNTS).reduce((sum, c) => sum + c.states, 0)
const variants = Object.values(COMPONENT_COUNTS).reduce((sum, c) => sum + c.variants, 0)

// Faint grid behind the intro, drawn in the theme's ink and faded out.
const GRID_MASK = 'radial-gradient(ellipse 60% 70% at 30% 35%, black 15%, transparent 70%)'
const gridStyle = (ink: string) => ({
  backgroundImage: `linear-gradient(to right, ${ink} 1px, transparent 1px), linear-gradient(to bottom, ${ink} 1px, transparent 1px)`,
  backgroundSize: '40px 40px',
  maskImage: GRID_MASK,
  WebkitMaskImage: GRID_MASK,
})

// The Brain sits straight on the section: no border, no ground (the
// wireframe's own glow and its loading ground are cleared).
function Brain() {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2">
      <div className="relative h-56 sm:h-auto sm:min-h-[300px] [&>div]:!bg-transparent [&>div]:!bg-none">
        <BrainWireframe followSite />
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-olive-600 dark:text-olive-400">The Brain</span>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
          Your agent reads the rules first.
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-sand-700 dark:text-sand-300">
          Foundations, component rules and skills your AI reads before it writes a line, so everything it builds stays
          on the system.
        </p>
        <div className="mt-6">
          <Link href={`${PRO_HREF}/brain`} className={buttonClasses({ variant: 'outline', size: 'md' })}>
            Read the Brain
          </Link>
        </div>
      </div>
    </div>
  )
}

export function AndromedaProSection() {
  return (
    <section aria-labelledby="home-andromeda-pro" className="mt-16 sm:mt-24">
      {/* One box holds the intro, the stack and the Brain, so they read as one section. */}
      <div className="relative isolate overflow-hidden rounded-3xl border border-sand-200 p-4 sm:p-8 lg:p-10 dark:border-sand-800">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] dark:hidden" style={gridStyle('rgb(0 0 0 / 0.05)')} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[520px] dark:block" style={gridStyle('rgb(255 255 255 / 0.045)')} />

        {/* ── Intro on the left, the card stack on the right; stacks on phones ── */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-olive-600 dark:text-olive-400">New design system</span>
            <div className="mt-3 flex items-center gap-3">
              <h2
                id="home-andromeda-pro"
                className="text-balance text-2xl font-extrabold tracking-tight text-sand-900 sm:text-3xl dark:text-sand-50"
              >
                Andromeda Pro
              </h2>
              <SystemTierChip tier="pro" />
            </div>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-sand-700 dark:text-sand-300">
              {`A token-driven design system for any product UI. ${components} components and ${word(TEMPLATES.length)} templates, dark and light, with every state designed.`}
            </p>
            <div className="mt-6">
              <Link href={PRO_HREF} className={buttonClasses({ variant: 'outline', size: 'md' })}>
                Explore Andromeda Pro
              </Link>
            </div>
          </div>
          <div className="w-full max-w-md lg:ml-auto">
            <ProCardStack states={states} variants={variants} components={components} templates={TEMPLATES.length} />
          </div>
        </div>

        <Brain />
      </div>
    </section>
  )
}
