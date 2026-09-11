'use client'

// Overview variant A, "Showroom": live first, price last. The product shows up
// as an object in the first scroll (the tilted light and dark stage), then how
// much there is, then the agent layer, then the finished screens, and only then
// the price. Site chrome throughout (sand, olive, Manrope); the only Andromeda
// surfaces are the stage scene and the Brain wireframe.
//
// Cyan appears twice and only twice: the tier chip in the hero and the one on
// the price panel, the two moments that say Premium out loud.
import Link from 'next/link'
import { ArrowRight, Brain, ChatText, TerminalWindow, type Icon } from '@phosphor-icons/react'
import { SiteFooter } from '../../../components/SiteFooter'
import { SystemTierChip } from '../../../_components/SystemTierChip'
import {
  AndromedaComponentCard,
  type AndromedaComponentCardData,
} from '../system/AndromedaComponentCard'
import { BrainWireframePreview } from './BrainWireframePreview'
import { ServiceOrdersScene } from './ServiceOrdersScene'
import { ThemeCompare } from './ThemeCompare'
import type { OverviewTemplate } from './template-data'

const PRICE = {
  monthly: '$8.99',
  yearly: '$49.99',
  yearlyPerMonth: '$4.17',
}

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const inWords = (n: number) => NUMBER_WORDS[n] ?? String(n)
const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// Medium buttons: 40px tall, 14px text, 16px side padding.
const BTN_BASE =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40'
const BTN_PRIMARY = `${BTN_BASE} bg-olive-500 text-sand-950 hover:bg-olive-400`
const BTN_SECONDARY = `${BTN_BASE} border border-sand-300 text-sand-900 hover:border-sand-400 dark:border-sand-700 dark:text-sand-50 dark:hover:border-sand-600`

// Two-layer drop shadows, light from straight above. The stage and the price
// panel take the larger step; the Brain panel sits one step below.
const SHADOW_STAGE =
  'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.10)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.40),0_12px_32px_rgba(0,0,0,0.55)]'
const SHADOW_PANEL =
  'shadow-[0_1px_2px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.35),0_8px_24px_rgba(0,0,0,0.50)]'

const OVERLINE = 'text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400'
const H2 = 'text-2xl font-bold tracking-tight text-sand-900 dark:text-sand-50'
const SUB = 'text-base leading-relaxed text-sand-700 dark:text-sand-300'

type Counts = { components: number; variants: number; templates: number }

type OverviewAProps = {
  featured: AndromedaComponentCardData[]
  templates: OverviewTemplate[]
  counts: Counts
}

function SectionHeading({ overline, title, sub }: { overline: string; title: string; sub: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className={OVERLINE}>{overline}</p>
      <h2 className={`mt-2 ${H2}`}>{title}</h2>
      <p className={`mt-3 ${SUB}`}>{sub}</p>
    </div>
  )
}

const BRAIN_POINTS: { icon: Icon; title: string; line: string }[] = [
  {
    icon: Brain,
    title: 'Foundations and rules',
    line: 'Colour, type, spacing and motion, written as rules an agent follows.',
  },
  {
    icon: ChatText,
    title: 'A remix prompt per component',
    line: 'Ask for a variation in any AI tool and it stays on the system.',
  },
  {
    icon: TerminalWindow,
    title: 'One-command install',
    line: 'The CLI drops components straight into your repo.',
  },
]

function TemplateCard({ t, lead }: { t: OverviewTemplate; lead: boolean }) {
  return (
    <Link
      href={`/design-systems/andromeda-pro/templates/${t.folder}`}
      className={`group flex flex-col rounded-2xl border border-sand-200 bg-sand-100 p-3 transition-colors hover:border-sand-300 dark:border-sand-800 dark:bg-sand-900 dark:hover:border-sand-700 ${
        lead ? 'md:col-span-2' : ''
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-xl bg-sand-900 ${lead ? 'aspect-video' : 'aspect-[16/10]'}`}
      >
        {t.image ? (
          <img
            src={t.image}
            alt={t.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-out motion-safe:group-hover:scale-[1.02]"
          />
        ) : (
          // No art yet: a quiet dark panel, never a broken-image glyph.
          <div
            aria-hidden
            className="absolute inset-0 bg-sand-950"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-sand-950/10 dark:ring-sand-50/10"
        />
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-sand-200 px-2 py-0.5 text-xs font-semibold text-sand-700 dark:bg-sand-800 dark:text-sand-300">
            Premium template
          </span>
          <span className="text-xs text-sand-600 dark:text-sand-400">{t.domain}</span>
        </div>
        <h3 className="mt-3 text-base font-bold text-sand-900 dark:text-sand-50">{t.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-sand-600 dark:text-sand-400">{t.blurb}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-olive-600 transition-colors group-hover:text-olive-800 dark:text-olive-400 dark:group-hover:text-olive-300">
          View template
          <ArrowRight
            weight="regular"
            className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  )
}

function PriceTile({
  overline,
  amount,
  unit,
  note,
}: {
  overline: string
  amount: string
  unit: string
  note?: string
}) {
  return (
    <div className="rounded-xl border border-sand-200 bg-sand-50 p-5 dark:border-sand-800 dark:bg-sand-950">
      <p className={OVERLINE}>{overline}</p>
      <p className="mt-2 flex items-baseline justify-center gap-1">
        <span className="text-4xl font-bold tabular-nums text-sand-900 dark:text-sand-50">{amount}</span>
        <span className="text-sm text-sand-600 dark:text-sand-400">{unit}</span>
      </p>
      {note ? <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">{note}</p> : null}
    </div>
  )
}

export function OverviewA({ featured, templates, counts }: OverviewAProps) {
  const templateWord = inWords(counts.templates)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
      {/* ── 1. Hero ─────────────────────────────────────────────────── */}
      <header className="mx-auto max-w-3xl py-10 text-center sm:py-16">
        <div className="flex items-center justify-center gap-2">
          <p className={OVERLINE}>Design system</p>
          <SystemTierChip tier="pro" />
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-4xl">
          Andromeda Pro
        </h1>
        <p className="mt-2 text-xl font-bold text-sand-900 dark:text-sand-50">
          The premium system for dashboards and control rooms.
        </p>
        <p className={`mx-auto mt-4 max-w-2xl ${SUB}`}>
          {counts.components} components and {counts.variants} variants, every one running live in light and
          dark, plus {templateWord} finished templates. Explore every component for free. Premium puts them
          in your project.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/pricing" className={BTN_PRIMARY}>
            Get Premium
          </Link>
          <Link href="/design-systems/andromeda-pro/components" className={BTN_SECONDARY}>
            Explore every component
          </Link>
        </div>
        <p className="mt-4 text-sm text-sand-600 dark:text-sand-400">
          From {PRICE.yearlyPerMonth} a month, billed yearly.
        </p>
      </header>

      {/* ── 2. The stage ────────────────────────────────────────────── */}
      <section aria-labelledby="stage-heading">
        <div className="mx-auto max-w-2xl text-center">
          <p className={OVERLINE}>Light and dark</p>
          <h2 id="stage-heading" className={`mt-2 ${H2}`}>
            Drag to switch the lights.
          </h2>
          <p className={`mt-3 ${SUB}`}>
            One screen, two themes, no redrawn parts. Three layers of OKLCH tokens retint every surface,
            border and state.
          </p>
        </div>
        <div className="mt-8">
          <ThemeCompare
            scene={<ServiceOrdersScene />}
            mode="tilted"
            introSweep
            label="Compare light and dark themes"
            description="The same service orders screen in the dark and light themes"
          />
        </div>
        <p className="mt-4 text-center text-sm text-sand-600 dark:text-sand-400">
          Every Andromeda Pro component ships in both themes.
        </p>
      </section>

      {/* ── 3. Components ───────────────────────────────────────────── */}
      <section className="mt-20 sm:mt-24">
        <SectionHeading
          overline="Components"
          title={`${counts.components} components. ${counts.variants} variants. All running.`}
          sub="Forms, tables, charts, overlays and navigation, each with its states worked out. Open any card and use it live."
        />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => (
            <AndromedaComponentCard key={c.slug} {...c} />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link href="/design-systems/andromeda-pro/components" className={BTN_SECONDARY}>
            See all {counts.components} components
            <ArrowRight weight="regular" className="size-4" />
          </Link>
        </div>
      </section>

      {/* ── 4. The Brain and remix prompts ──────────────────────────── */}
      <section className="mt-20 sm:mt-24">
        <div
          className={`grid grid-cols-1 gap-8 rounded-2xl border border-sand-200 bg-sand-100 p-6 dark:border-sand-800 dark:bg-sand-900 sm:p-8 md:grid-cols-2 ${SHADOW_PANEL}`}
        >
          <div className="flex flex-col justify-center">
            <p className={OVERLINE}>Built for agents</p>
            <h2 className={`mt-2 ${H2}`}>Your agent reads the rules first.</h2>
            <p className={`mt-3 ${SUB}`}>
              The Brain holds the foundations, component rules and skills an AI agent reads before it writes
              a line. Every component also carries its own remix prompt. What your agent builds already
              matches the system.
            </p>
            <ul className="mt-6 flex flex-col gap-4">
              {BRAIN_POINTS.map(({ icon: PointIcon, title, line }) => (
                <li key={title} className="flex gap-3">
                  <PointIcon
                    weight="regular"
                    aria-hidden
                    className="mt-0.5 size-5 shrink-0 text-olive-600 dark:text-olive-400"
                  />
                  <div>
                    <p className="text-base font-semibold text-sand-900 dark:text-sand-50">{title}</p>
                    <p className="mt-0.5 text-sm text-sand-600 dark:text-sand-400">{line}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-sand-600 dark:text-sand-400">
              Remix prompts and the CLI install come with Premium.
            </p>
            <div className="mt-6">
              <Link href="/design-systems/andromeda-pro/brain" className={BTN_SECONDARY}>
                Tour the Brain
                <ArrowRight weight="regular" className="size-4" />
              </Link>
            </div>
          </div>
          <div className="relative h-60 overflow-hidden rounded-xl md:h-auto md:min-h-[360px]">
            <BrainWireframePreview />
          </div>
        </div>
      </section>

      {/* ── 5. Templates ────────────────────────────────────────────── */}
      <section id="templates" className="mt-20 scroll-mt-24 sm:mt-24">
        <SectionHeading
          overline="Templates"
          title={`${capitalise(templateWord)} finished screens, built from the system.`}
          sub="A live signal room, mission telemetry, work orders, capacity planning and sign-in. Open any one and watch it run."
        />
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {templates.map((t, i) => (
            <TemplateCard key={t.slug} t={t} lead={i === 0} />
          ))}
        </div>
      </section>

      {/* ── 6. Premium panel ────────────────────────────────────────── */}
      <section className="mt-20 sm:mt-24">
        <div
          className={`mx-auto max-w-3xl rounded-2xl border border-sand-200 bg-sand-100 p-6 text-center dark:border-sand-800 dark:bg-sand-900 sm:p-10 ${SHADOW_STAGE}`}
        >
          <SystemTierChip tier="pro" />
          <h2 className={`mt-4 ${H2}`}>Everything on this page, in your project.</h2>
          <p className={`mx-auto mt-3 max-w-xl ${SUB}`}>
            Premium unlocks the code view, the CLI install, every remix prompt and all {templateWord}{' '}
            templates.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PriceTile overline="Monthly" amount={PRICE.monthly} unit="/month" />
            <PriceTile
              overline="Yearly"
              amount={PRICE.yearly}
              unit="/year"
              note={`Works out to ${PRICE.yearlyPerMonth} a month.`}
            />
          </div>
          <Link href="/pricing" className={`${BTN_PRIMARY} mt-6 w-full`}>
            Get Premium
          </Link>
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-sand-600 dark:text-sand-400">
          Prefer MIT source? Andromeda Legacy ships under the MIT license and stays live and supported.{' '}
          <Link
            href="/design-systems/andromeda"
            className="font-semibold text-olive-600 transition-colors hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-300"
          >
            Visit Andromeda Legacy
          </Link>
        </p>
      </section>

      {/* ── 7. Footer ───────────────────────────────────────────────── */}
      <div className="mt-16">
        <SiteFooter />
      </div>
    </main>
  )
}
