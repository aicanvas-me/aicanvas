// Overview variant B: state the deal, make it exact in a ledger, then prove it.
// Site chrome throughout (sand, olive, Manrope). The only surfaces drawn in
// Andromeda's own tokens are the compare stage, the foundation wells and the
// Brain preview.
'use client'

import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, Brain, ChatText, Check, Minus, TerminalWindow, type Icon } from '@phosphor-icons/react'
import { buttonClasses } from '../../../components/buttonClasses'
import { usePremiumStatus } from '../../../components/billing/usePremiumStatus'
import { SiteFooter } from '../../../components/SiteFooter'
import { SystemTierChip } from '../../../_components/SystemTierChip'
import { PageFrame, PageOverline, PageTitle, PageLead, PAGE_TOP } from '../../../_components/DesignSystemPage'
import { AndromedaComponentCard } from '../system/AndromedaComponentCard'
import { ThemeCompare } from './ThemeCompare'
import { FoundationLayers } from './FoundationLayers'
import { Inventory } from './Inventory'
import { BrainWireframe } from './BrainWireframe'
import { BENTO_TILES } from './CompareBento'
import {
  CURATED_SLUGS,
  TEMPLATES,
  type OverviewComponent,
  type OverviewStats,
  type OverviewTemplate,
} from './overview-data'

// Medium buttons are 40px tall with 14px text and 16px side padding.
const BTN_PRIMARY = `${buttonClasses({ variant: 'primary', size: 'md' })} h-10`
const BTN_SECONDARY = `${buttonClasses({ variant: 'outline', size: 'md' })} h-10`

const PANEL = 'rounded-2xl border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900'
const PANEL_SHADOW =
  'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.10)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.40),0_12px_32px_rgba(0,0,0,0.55)]'

// Counts in running copy read as words; anything past twenty stays a numeral.
const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
]
const numberWord = (n: number) => NUMBER_WORDS[n] ?? String(n)
const capitalWord = (n: number) => {
  const w = numberWord(n)
  return w.charAt(0).toUpperCase() + w.slice(1)
}

// The compare stage's own counts: every tile on wider screens, the phone cap
// below sm.
type BentoTile = (typeof BENTO_TILES)[number]
const countParts = (tiles: readonly BentoTile[]) => tiles.reduce((n, t) => n + t.parts.length, 0)
const PHONE_TILES = BENTO_TILES.filter((t) => t.onPhone)

const LEDGER_ROWS: { label: string; free: boolean }[] = [
  { label: 'Every component, running live', free: true },
  { label: 'Light and dark themes', free: true },
  { label: 'Every variant and state', free: true },
  { label: 'Live template previews', free: true },
  { label: 'Code view for every component', free: false },
  { label: 'CLI install into your repo', free: false },
  { label: 'A remix prompt per component', free: false },
  { label: `Install all ${numberWord(TEMPLATES.length)} templates`, free: false },
  { label: "The Brain's rule files, ready for your agent", free: false },
]

// What the Brain gives an agent, in the order it matters.
const BRAIN_POINTS: { icon: Icon; title: string; line: string }[] = [
  {
    icon: Brain,
    title: 'Foundations and rules',
    line: 'Color, type, spacing and motion, written as rules an agent follows.',
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

function SectionHead({ overline, title, sub, id }: { overline: string; title: string; sub?: ReactNode; id: string }) {
  return (
    <div className="max-w-2xl">
      <PageOverline>{overline}</PageOverline>
      <h2 id={id} className="mt-2 text-2xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
        {title}
      </h2>
      {sub ? <p className="mt-2 text-base leading-relaxed text-sand-600 dark:text-sand-400">{sub}</p> : null}
    </div>
  )
}

function WithPremium({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 text-sm text-sand-600 dark:text-sand-400">
      <span className="font-bold text-sand-900 dark:text-sand-50">With Premium:</span> {children}
    </p>
  )
}

// The template bento: the lead card spans both columns at 16:9, the rest sit
// at 16:10 beside it. The art is 16:9 with the screenshot inset from the top
// and left, so it is pinned to its top-left corner: a narrower frame crops the
// right edge, where the screenshot already runs off, never the inset.
function TemplateCard({ t, lead }: { t: OverviewTemplate; lead: boolean }) {
  return (
    <Link
      href={`/design-systems/andromeda-pro/templates/${t.folder}`}
      className={`group flex flex-col rounded-2xl border border-sand-200 bg-sand-100 p-3 transition-colors hover:border-sand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:border-sand-800 dark:bg-sand-900 dark:hover:border-sand-700 ${
        lead ? 'lg:col-span-2' : ''
      }`}
    >
      <div className={`relative overflow-hidden rounded-xl bg-sand-900 ${lead ? 'aspect-video' : 'aspect-[16/10]'}`}>
        {t.image ? (
          <img
            src={t.image}
            alt={`${t.name} template`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full origin-top-left object-cover object-[left_top] transition-transform duration-200 ease-out motion-safe:group-hover:scale-[1.02]"
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
          {t.domain ? <span className="text-xs text-sand-600 dark:text-sand-400">{t.domain}</span> : null}
        </div>
        <h3 className="mt-3 text-base font-bold text-sand-900 dark:text-sand-50">{t.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-sand-600 dark:text-sand-400">{t.blurb}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-olive-600 transition-colors group-hover:text-olive-800 dark:text-olive-400 dark:group-hover:text-olive-300">
          View template
          <ArrowRight
            weight="regular"
            aria-hidden
            className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  )
}

function LedgerMark({ included, column }: { included: boolean; column: string }) {
  return included ? (
    <>
      <Check weight="regular" aria-hidden className="size-5 text-olive-600 dark:text-olive-400" />
      <span className="sr-only">{column}: Included</span>
    </>
  ) : (
    <>
      <Minus weight="regular" aria-hidden className="size-5 text-sand-400 dark:text-sand-500" />
      <span className="sr-only">{column}: Not included</span>
    </>
  )
}

export function OverviewB({
  components,
  stats,
  legacyComponents,
}: {
  components: OverviewComponent[]
  stats: OverviewStats
  legacyComponents: number
}) {
  // Get Premium shows only to a visitor known not to have it. A signed-in
  // visitor starts as 'unknown' until the entitlement check returns, so a
  // subscriber never sees the button flash in and out.
  const showGetPremium = usePremiumStatus() === 'not-premium'
  // Header row, one row per ledger line, and the button row when it shows.
  const ledgerRowCount = LEDGER_ROWS.length + (showGetPremium ? 2 : 1)
  // The curated nine, in the order the curated list sets. A slug missing from
  // the live metadata is skipped rather than rendering a hole.
  const featured = CURATED_SLUGS.flatMap((slug) => {
    const c = components.find((x) => x.slug === slug)
    return c ? [c] : []
  })

  return (
    <main className={`w-full ${PAGE_TOP}`}>
      {/* ── 1. Hero ─────────────────────────────────────────── */}
      <PageFrame>
        <section aria-labelledby="ovb-hero" className="max-w-3xl">
          <PageOverline>Design system</PageOverline>
          {/* Same hero row as Legacy: the chip sits beside the h1, not inside
              it, so the heading stays the system's name alone. */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <PageTitle id="ovb-hero" className="mt-0">
              Andromeda Pro
            </PageTitle>
            <SystemTierChip tier="pro" />
          </div>
          <p className="mt-3 text-xl font-bold text-sand-900 dark:text-sand-50">
            See all of it running. Take it home with Premium.
          </p>
          <PageLead>
            {/* One string, not numbers interleaved with JSX text: the split form
                hydrated with the space before "templates" missing on the server. */}
            {`${stats.components} components, ${stats.variants} variants and ${stats.templates} templates for any product UI, in light and dark. Every one runs on this site for free. Premium adds the code, the CLI install, the remix prompts, the Brain's rule files and template installs.`}
          </PageLead>
          <div className="mt-6 flex flex-wrap gap-3">
            {showGetPremium && (
              <Link href="/pricing" className={BTN_PRIMARY}>
                Get Premium
              </Link>
            )}
            <Link href="/design-systems/andromeda-pro/components" className={BTN_SECONDARY}>
              Explore every component
            </Link>
          </div>
        </section>

        {/* ── 2. The inventory ───────────────────────────────── */}
        <section aria-labelledby="ovb-inventory" className="mt-16">
          <SectionHead
            id="ovb-inventory"
            overline="The inventory"
            title="Everything the system ships."
            sub="Every count here is read from the system itself when the page builds, never typed in by hand."
          />
          <div className="mt-10">
            <Inventory stats={stats} />
          </div>
        </section>

        {/* ── 3. The ledger ────────────────────────────────────────────── */}
        <section aria-labelledby="ovb-ledger" className="mt-20">
          <SectionHead
            id="ovb-ledger"
            overline="Free and Premium"
            title="Explore it all. Unlock what you ship."
            sub="Every visitor sees every component running. Premium is for the parts that go into your project."
          />
          <div className={`mt-8 p-2 sm:p-3 ${PANEL} ${PANEL_SHADOW}`}>
            <div
              className="grid grid-cols-[minmax(0,1fr)_64px_76px] sm:grid-cols-[minmax(0,1fr)_128px_176px]"
              style={{ gridTemplateRows: `repeat(${ledgerRowCount}, auto)` }}
            >
              {/* The Premium column's lift: one surface behind every cell of
                  column 3, so the eye lands there without any colour. */}
              <div
                aria-hidden
                className="rounded-xl border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950"
                style={{ gridColumn: 3, gridRow: '1 / -1' }}
              />
              <div style={{ gridColumn: 1, gridRow: 1 }} className="relative" />
              <div
                style={{ gridColumn: 2, gridRow: 1 }}
                className="relative flex items-end justify-center px-1 py-4 text-center text-xs font-semibold text-sand-900 dark:text-sand-50 sm:text-sm"
              >
                Explore free
              </div>
              <div
                style={{ gridColumn: 3, gridRow: 1 }}
                className="relative flex flex-col items-center justify-end gap-1.5 py-4 text-center sm:px-1"
              >
                <SystemTierChip tier="pro" />
                {/* Same type as "Explore free", so both column titles sit on one line. */}
                <span className="text-xs font-semibold text-sand-900 dark:text-sand-50 sm:text-sm">
                  Install and ship
                </span>
              </div>

              {LEDGER_ROWS.map((row, i) => {
                const r = i + 2
                const line = 'border-t border-sand-200 dark:border-sand-800'
                return (
                  <Fragment key={row.label}>
                    <div
                      style={{ gridColumn: 1, gridRow: r }}
                      className={`relative py-3 pl-3 pr-2 text-sm text-sand-700 dark:text-sand-300 ${line}`}
                    >
                      {row.label}
                    </div>
                    <div
                      style={{ gridColumn: 2, gridRow: r }}
                      className={`relative flex items-center justify-center py-3 ${line}`}
                    >
                      <LedgerMark included={row.free} column="Explore free" />
                    </div>
                    <div
                      style={{ gridColumn: 3, gridRow: r }}
                      className={`relative flex items-center justify-center py-3 ${line}`}
                    >
                      <LedgerMark included column="Premium" />
                    </div>
                  </Fragment>
                )
              })}

              {showGetPremium && (
                <div
                  style={{ gridColumn: 3, gridRow: ledgerRowCount }}
                  className="relative hidden border-t border-sand-200 px-3 py-4 dark:border-sand-800 sm:block"
                >
                  <Link href="/pricing" className={`${BTN_PRIMARY} w-full`}>
                    Get Premium
                  </Link>
                </div>
              )}
            </div>

            {/* Phones: the Premium column is 64px, too narrow for a button. */}
            {showGetPremium && (
              <div className="border-t border-sand-200 px-3 pb-2 pt-4 dark:border-sand-800 sm:hidden">
                <Link href="/pricing" className={`${BTN_PRIMARY} w-full`}>
                  Get Premium
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── 4. Compare ───────────────────────────────────────────────── */}
        <section aria-labelledby="ovb-compare" className="mt-20">
          <SectionHead
            id="ovb-compare"
            overline="Light and dark"
            title="One drag, every component retinted."
            sub={
              <>
                <span className="sm:hidden">
                  {capitalWord(PHONE_TILES.length)} tiles, {numberWord(countParts(PHONE_TILES))} components
                </span>
                <span className="hidden sm:inline">
                  {capitalWord(BENTO_TILES.length)} tiles, {numberWord(countParts(BENTO_TILES))} components
                </span>
                , two themes, one set of tokens. Drag the line to switch every one at once.
              </>
            }
          />
          <div className="mt-8">
            <ThemeCompare />
          </div>
          <FoundationLayers />
          <WithPremium>the CLI installs all of it, tokens included.</WithPremium>
        </section>

        {/* ── 5. Components ───────────────────────────────────────── */}
        <section aria-labelledby="ovb-components" className="mt-20">
          <SectionHead
            id="ovb-components"
            overline="Components"
            title={`${stats.components} components. ${stats.variants} variants. All running.`}
            sub="Forms, tables, charts, overlays and navigation, each with its states worked out. Open any card and use it live."
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <AndromedaComponentCard
                key={c.slug}
                slug={c.slug}
                name={c.name}
                description={c.description}
                variants={c.variants}
                states={c.states}
              />
            ))}
          </div>
          <div className="mt-8">
            <Link href="/design-systems/andromeda-pro/components" className={BTN_SECONDARY}>
              See all {stats.components} components
              <ArrowRight weight="regular" aria-hidden className="size-4" />
            </Link>
          </div>
          <WithPremium>the code view and a one-command install on every component.</WithPremium>
        </section>

        {/* ── 6. The Brain ─────────────────────────────────────────────── */}
        <section aria-labelledby="ovb-brain" className="mt-20">
          {/* Two columns from lg: beside the site rail at md the text column was
              too narrow to read. The same holds for the template grid below. */}
          <div className={`grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-2 ${PANEL} ${PANEL_SHADOW}`}>
            <div className="flex flex-col justify-center">
              <PageOverline>Built for agents</PageOverline>
              <h2
                id="ovb-brain"
                className="mt-2 text-2xl font-bold tracking-tight text-sand-900 dark:text-sand-50"
              >
                Your agent reads the rules first.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-sand-700 dark:text-sand-300">
                The Brain holds the foundations, component rules and skills an AI agent reads before it
                writes a line. Every component also carries its own remix prompt, so what your agent builds
                stays on the system.
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
                The Brain&apos;s rule files, remix prompts and the CLI install come with Premium.
              </p>
              <div className="mt-6">
                <Link href="/design-systems/andromeda-pro/brain" className={BTN_SECONDARY}>
                  Explore the Brain
                  <ArrowRight weight="regular" aria-hidden className="size-4" />
                </Link>
              </div>
            </div>
            <div className="relative h-60 overflow-hidden rounded-xl sm:h-72 lg:h-auto lg:min-h-[360px]">
              <BrainWireframe />
            </div>
          </div>
        </section>

        {/* ── 7. Templates ─────────────────────────────────────────────── */}
        <section aria-labelledby="ovb-templates" className="mt-20">
          <SectionHead
            id="ovb-templates"
            overline="Templates"
            title={`${capitalWord(TEMPLATES.length)} finished screens, built from the system.`}
            sub="A live signal room, mission telemetry, work orders and capacity planning. Open any one and watch it run."
          />
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {TEMPLATES.map((t, i) => (
              <TemplateCard key={t.slug} t={t} lead={i === 0} />
            ))}
          </div>
        </section>
      </PageFrame>

      {/* ── 8. Closing band ────────────────────────────────────────────── */}
      {/* Same closing card as the homepage's final CTA: inside the container,
          not a full-bleed band. */}
      <PageFrame className="mt-20">
        <section
          aria-labelledby="ovb-price"
          className="relative overflow-hidden rounded-2xl border border-olive-500/20 bg-gradient-to-br from-olive-500/8 via-transparent to-transparent p-8 text-center ring-1 ring-inset ring-olive-500/10"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-40 w-64 rounded-full bg-olive-500/10 blur-3xl" />
          </div>
          <h2
            id="ovb-price"
            className="relative text-2xl font-bold tracking-tight text-sand-900 dark:text-sand-50"
          >
            Put Andromeda Pro in your project.
          </h2>
          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            {showGetPremium && (
              <Link href="/pricing" className={BTN_PRIMARY}>
                Get Premium
              </Link>
            )}
            <Link href="/design-systems/andromeda-pro/components" className={BTN_SECONDARY}>
              Explore every component
            </Link>
          </div>
          <p className="relative mt-8 text-sm text-sand-600 dark:text-sand-400">
            Andromeda Legacy, {legacyComponents} components under the MIT license, stays live and supported.{' '}
            <Link
              href="/design-systems/andromeda"
              className="font-semibold text-olive-600 transition-colors hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-300"
            >
              Visit Andromeda Legacy
            </Link>
          </p>
        </section>
      </PageFrame>

      {/* ── 9. Footer ──────────────────────────────────────────────────── */}
      <PageFrame className="mt-16 pb-10">
        <SiteFooter />
      </PageFrame>
    </main>
  )
}
