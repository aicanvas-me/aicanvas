// Overview variant B: state the deal, make it exact in a ledger, then prove it.
// Site chrome throughout (sand, olive, Manrope). The only surfaces drawn in
// Andromeda's own tokens are the compare stage and the Brain preview.
'use client'

import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Minus } from '@phosphor-icons/react'
import { buttonClasses } from '../../../components/buttonClasses'
import { SiteFooter } from '../../../components/SiteFooter'
import { SystemTierChip } from '../../../_components/SystemTierChip'
import { ThemeCompare } from './ThemeCompare'
import { ComponentFilter } from './ComponentFilter'
import { Inventory } from './Inventory'
import { BrainWireframe } from './BrainWireframe'
import { BENTO_TILES } from './CompareBento'
import {
  CURATED_SLUGS,
  TEMPLATES,
  type Family,
  type OverviewComponent,
  type OverviewStats,
} from './overview-data'

// Medium buttons are 40px tall with 14px text and 16px side padding.
const BTN_PRIMARY = `${buttonClasses({ variant: 'primary', size: 'md' })} h-10`
const BTN_SECONDARY = `${buttonClasses({ variant: 'outline', size: 'md' })} h-10`

const PANEL = 'rounded-2xl border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900'
const PANEL_SHADOW =
  'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.10)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.40),0_12px_32px_rgba(0,0,0,0.55)]'

const PRICE_MONTH = 8.99
const PRICE_YEAR = 49.99
const PRICE_YEAR_PER_MONTH = (PRICE_YEAR / 12).toFixed(2)

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

const EXCERPT_MASK = 'linear-gradient(to bottom, #000 50%, transparent)'
// The Remix card's stand-in when the prompt bundle is missing: decorative lines.
const PROMPT_LINE_WIDTHS = [92, 78, 86, 0, 88, 64, 82, 70]

function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-5xl px-4 sm:px-6 ${className}`}>{children}</div>
}

function Overline({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-olive-600 dark:text-olive-400">{children}</p>
  )
}

function SectionHead({ overline, title, sub, id }: { overline: string; title: string; sub?: ReactNode; id: string }) {
  return (
    <div className="max-w-2xl">
      <Overline>{overline}</Overline>
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
  families,
  stats,
  promptExcerpt,
  legacyComponents,
}: {
  components: OverviewComponent[]
  families: Family[]
  stats: OverviewStats
  promptExcerpt: string | null
  legacyComponents: number
}) {
  const ledgerRowCount = LEDGER_ROWS.length + 2
  const templateNames = TEMPLATES.map((t) => t.name)
  const templateList =
    templateNames.length > 1
      ? `${templateNames.slice(0, -1).join(', ')} and ${templateNames[templateNames.length - 1]}`
      : templateNames.join('')

  return (
    <main className="w-full pt-10 sm:pt-16">
      {/* ── 1. Hero ─────────────────────────────────────────── */}
      <Container>
        <section aria-labelledby="ovb-hero" className="max-w-3xl">
          <div className="flex items-center gap-2">
            <Overline>Design system</Overline>
            <SystemTierChip tier="pro" />
          </div>
          <h1
            id="ovb-hero"
            className="mt-3 text-3xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-4xl"
          >
            Andromeda Pro
          </h1>
          <p className="mt-3 text-xl font-bold text-sand-900 dark:text-sand-50">
            See all of it running. Take it home with Premium.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-sand-700 dark:text-sand-300">
            {stats.components} components, {stats.variants} variants and {stats.templates} templates for
            dashboards and control rooms, in light and dark. Every one runs on this site for free. Premium adds
            the code, the CLI install, the remix prompts and the templates.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/pricing" className={BTN_PRIMARY}>
              Get Premium
            </Link>
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
                <span className="hidden text-xs text-sand-600 dark:text-sand-400 sm:block">
                  ${PRICE_MONTH}/month or ${PRICE_YEAR}/year
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

              <div
                style={{ gridColumn: 3, gridRow: ledgerRowCount }}
                className="relative hidden border-t border-sand-200 px-3 py-4 dark:border-sand-800 sm:block"
              >
                <Link href="/pricing" className={`${BTN_PRIMARY} w-full`}>
                  Get Premium
                </Link>
              </div>
            </div>

            {/* Phones: the Premium column is 64px, too narrow for a button. */}
            <div className="flex flex-col gap-3 border-t border-sand-200 px-3 pb-2 pt-4 dark:border-sand-800 sm:hidden">
              <p className="text-xs text-sand-600 dark:text-sand-400">
                Premium: ${PRICE_MONTH}/month or ${PRICE_YEAR}/year
              </p>
              <Link href="/pricing" className={`${BTN_PRIMARY} w-full`}>
                Get Premium
              </Link>
            </div>
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
                , two themes, one set of tokens. Drag the line and every one switches on the same values.
              </>
            }
          />
          <div className="mt-8">
            <ThemeCompare />
          </div>
          <WithPremium>the CLI installs all of it, tokens included.</WithPremium>
        </section>

        {/* ── 5. Components with real filters ─────────────────────────── */}
        <section aria-labelledby="ovb-components" className="mt-20">
          <SectionHead
            id="ovb-components"
            overline="Components"
            title={`${stats.components} components across ${families.length} families.`}
            sub="Pick a family. Every card opens the component running live, with its variants and states."
          />
          <div className="mt-8">
            <ComponentFilter components={components} families={families} curated={CURATED_SLUGS} />
          </div>
          <div className="mt-6">
            <Link href="/design-systems/andromeda-pro/components" className={BTN_SECONDARY}>
              See all {stats.components} components
            </Link>
          </div>
          <WithPremium>the code view and a one-command install on every component.</WithPremium>
        </section>

        {/* ── 6. Built for AI ──────────────────────────────────────────── */}
        <section aria-labelledby="ovb-ai" className="mt-20">
          <SectionHead
            id="ovb-ai"
            overline="Built for AI"
            title="Components are the parts. The Brain is the judgment."
            sub="Two things that make an AI agent build like it knows the system."
          />
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Static cards: only the buttons inside link. */}
            <div className={`flex flex-col p-5 sm:p-6 ${PANEL}`}>
              <div className="relative h-[180px] overflow-hidden rounded-xl">
                <BrainWireframe />
              </div>
              <div className="mt-5">
                <Overline>The Brain</Overline>
                <h3 className="mt-2 text-lg font-bold text-sand-900 dark:text-sand-50">
                  Your agent builds in the system, not near it.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
                  Foundations, component rules and skills, written for an AI agent to read before it builds, so
                  what it makes already matches Andromeda Pro.
                </p>
              </div>
              <div className="mt-auto pt-5">
                <Link href="/design-systems/andromeda-pro/brain" className={BTN_SECONDARY}>
                  Tour the Brain
                </Link>
              </div>
            </div>

            <div className={`flex flex-col p-5 sm:p-6 ${PANEL}`}>
              {/* Same 180px slot as the Brain preview, so the two cards stay
                  equal. Without the prompt bundle it keeps a neutral stand-in
                  of prompt lines instead of collapsing. */}
              <div className="relative h-[180px] overflow-hidden rounded-xl border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950">
                {promptExcerpt ? (
                  <figure className="h-full">
                    <pre
                      className="h-full overflow-hidden whitespace-pre-wrap break-words p-4 font-mono text-sm leading-6 text-sand-700 dark:text-sand-300"
                      style={{ maskImage: EXCERPT_MASK, WebkitMaskImage: EXCERPT_MASK }}
                    >
                      {promptExcerpt}
                    </pre>
                    <figcaption className="sr-only">The opening lines of the Button remix prompt</figcaption>
                  </figure>
                ) : (
                  <div
                    aria-hidden
                    className="flex h-full flex-col gap-3 p-4"
                    style={{ maskImage: EXCERPT_MASK, WebkitMaskImage: EXCERPT_MASK }}
                  >
                    {PROMPT_LINE_WIDTHS.map((w, i) => (
                      <span
                        key={i}
                        className="h-2.5 shrink-0 rounded-full bg-sand-200 dark:bg-sand-800"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-5">
                <Overline>Remix prompts</Overline>
                <h3 className="mt-2 text-lg font-bold text-sand-900 dark:text-sand-50">
                  A remix prompt for every component.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
                  Paste it into any AI tool and ask for a variation. It keeps the tokens, the states and the
                  spacing.
                </p>
              </div>
              <div className="mt-auto pt-5">
                <Link href="/design-systems/andromeda-pro/button" className={BTN_SECONDARY}>
                  View a component
                </Link>
              </div>
            </div>
          </div>
          <WithPremium>the full rule files and every prompt.</WithPremium>
        </section>

        {/* ── 7. Templates ─────────────────────────────────────────────── */}
        <section aria-labelledby="ovb-templates" className="mt-20">
          <SectionHead
            id="ovb-templates"
            overline="Templates"
            title={`${capitalWord(TEMPLATES.length)} templates. Open one and it runs.`}
            sub={`${templateList}. Preview each one live. Premium installs the whole screen.`}
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((t) => (
              <Link
                key={t.slug}
                href={`/design-systems/andromeda-pro/templates/${t.folder}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-sand-100 transition-colors hover:border-sand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:border-sand-800 dark:bg-sand-900 dark:hover:border-sand-700"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-sand-950">
                  {t.image ? (
                    <img
                      src={t.image}
                      alt={`${t.name} template`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                          backgroundSize: '20px 20px',
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-semibold text-sand-500">{t.name}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="self-start rounded-full bg-sand-200 px-2.5 py-1 text-xs font-semibold text-sand-700 dark:bg-sand-800 dark:text-sand-300">
                    Premium template
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-sand-900 dark:text-sand-50">{t.name}</h3>
                  {t.domain ? (
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">
                      {t.domain}
                    </p>
                  ) : null}
                  <p className="mt-2 line-clamp-2 text-sm text-sand-600 dark:text-sand-400">{t.blurb}</p>
                  <span className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-semibold text-olive-600 dark:text-olive-400">
                    View template
                    <ArrowRight
                      weight="regular"
                      aria-hidden
                      className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </Container>

      {/* ── 8. Closing price band ──────────────────────────────────────── */}
      <section
        aria-labelledby="ovb-price"
        className="mt-20 border-y border-sand-200 bg-sand-100 py-12 dark:border-sand-800 dark:bg-sand-900"
      >
        <Container className="flex flex-col items-center text-center">
          <h2 id="ovb-price" className="text-2xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
            Put Andromeda Pro in your project.
          </h2>
          <p className="mt-2 text-base text-sand-700 dark:text-sand-300">
            ${PRICE_MONTH} a month, or ${PRICE_YEAR} a year. Yearly works out to ${PRICE_YEAR_PER_MONTH} a month.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/pricing" className={BTN_PRIMARY}>
              Get Premium
            </Link>
            <Link href="/design-systems/andromeda-pro/components" className={BTN_SECONDARY}>
              Explore every component
            </Link>
          </div>
          <p className="mt-8 text-sm text-sand-600 dark:text-sand-400">
            Andromeda Legacy, {legacyComponents} components under the MIT license, stays live and supported.{' '}
            <Link
              href="/design-systems/andromeda"
              className="font-semibold text-olive-600 transition-colors hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-300"
            >
              Visit Andromeda Legacy
            </Link>
          </p>
        </Container>
      </section>

      {/* ── 9. Footer ──────────────────────────────────────────────────── */}
      <Container className="pb-10">
        <SiteFooter />
      </Container>
    </main>
  )
}
