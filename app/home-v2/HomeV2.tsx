// Homepage v2, previewed at /v2 next to v1 at /. Same approved copy and the
// same proven sections as v1 (proof pair, showcase, feature grid, carousel,
// pricing, FAQ, CTA); what is new is how the product is SHOWN:
//   1. the hero ends in a live agent run (AgentStage): the transcript beside
//      a real Andromeda Pro template assembling, checked against the rules;
//   2. a copyable sentence for the visitor's own agent (AgentPrompt);
//   3. "Same prompt" (CompareSlider): a generic build against the template;
//   4. How it works shows the agent's side of each step (RulesWorkflow).
// Server component; the islands above are the only client JS it adds.
// ponytail: v1 and v2 share the proof pair, pricing, FAQ and CTA markup by
// copy, not import, so v1 stays byte-identical; whichever loses is deleted.

import Link from 'next/link'
import { ArrowRight, CaretRight } from '@phosphor-icons/react/dist/ssr'
import { buttonClasses } from '../components/buttonClasses'
import { SiteFooter } from '../components/SiteFooter'
import { HomeShowcase } from '../home/HomeShowcase'
import { FeatureGrid } from '../home/FeatureGrid'
import { Reveal } from '../home/Reveal'
import { AnimatedCount, FeaturedCarousel, FaqAccordion } from '../home/islands'
import type { ComponentMeta } from '../lib/component-registry'
import { GITHUB_URL } from '../lib/config'
import { premiumEnabled } from '../../lib/flags'
import { PremiumCards } from '../components/billing/PremiumCards'
import { ANDROMEDA_COMPONENT_META, ANDROMEDA_TEMPLATE_META } from '../_lib/andromeda/andromeda-meta'
import {
  ANDROMEDA_COMPONENT_META as ANDROMEDA_PRO_COMPONENT_META,
  ANDROMEDA_TEMPLATE_META as ANDROMEDA_PRO_TEMPLATE_META,
} from '../_lib/andromeda-pro/andromeda-meta'
import { TEMPLATES } from '../design-systems/andromeda-pro/overview-b/overview-data'
import { STAGE_SCREENS } from './stage-screens'
import { AgentStage, type StageRun } from './AgentStage'
import { AgentPrompt } from './AgentPrompt'
import { CompareSlider } from './CompareSlider'
import { RulesWorkflow } from './RulesWorkflow'
import { HeroGrid } from './HeroGrid'
import { PosterWall } from './PosterWall'

interface Props {
  total: number
  /** Free MIT standalones (everything not badged Premium). */
  freeTotal: number
  /** Live registry pulls served, from PostHog. See app/lib/registry-stats.ts. */
  pulls: number
  carouselItems: ComponentMeta[]
}

const PREMIUM = premiumEnabled()

const poster = (slug: string) => {
  const t = TEMPLATES.find((x) => x.slug === slug)
  return { dark: t?.image ?? null, light: t?.imageLight ?? null }
}

const RUNS: StageRun[] = STAGE_SCREENS.map((s) => ({ ...s, ...poster(s.slug) })).filter(
  (r) => r.dark || r.light,
)

const COMPARE_POSTER = poster('andromeda-pro-mission-control')

const RULE_CARDS = [
  {
    title: 'Color only where it measures',
    line: 'Deltas and live status carry color. Titles, labels and button text stay neutral.',
  },
  {
    title: 'One primary action per region',
    line: 'One filled button leads each panel. Everything else steps back.',
  },
  {
    title: 'One size per row',
    line: 'Buttons, inputs and avatars that share a row share a size.',
  },
]

export function HomeV2({ total, freeTotal, pulls, carouselItems }: Props) {
  // Counted from source, exactly as v1 does (see HomePageClient).
  const componentTotal =
    total +
    ANDROMEDA_COMPONENT_META.length +
    ANDROMEDA_TEMPLATE_META.length +
    ANDROMEDA_PRO_COMPONENT_META.length +
    ANDROMEDA_PRO_TEMPLATE_META.length
  const systemComponents = ANDROMEDA_COMPONENT_META.length + ANDROMEDA_PRO_COMPONENT_META.length
  const systemTemplates = ANDROMEDA_TEMPLATE_META.length + ANDROMEDA_PRO_TEMPLATE_META.length
  const standalonesFloor = `${Math.floor(total / 10) * 10}+`
  return (
    <div
      data-owns-scroll
      className="aic-page-scroll relative flex min-h-full flex-col overflow-x-hidden bg-sand-50 dark:bg-sand-950"
    >
      {/* Blueprint grid behind the hero (lit under the pointer), and one low
          olive light where the headline sits. */}
      <HeroGrid />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[900px] max-w-full -translate-x-1/2 -translate-y-1/3 rounded-full bg-olive-500/[0.12] blur-3xl dark:bg-olive-500/[0.07]"
      />

      <main className="relative mx-auto w-full min-w-0 max-w-7xl px-4 pt-10 pb-8 sm:px-6 sm:pt-16">

        {/* ── Hero ── */}
        <section className="flex flex-col items-center text-center">
          <span
            className="aic-hero-rise mb-5 inline-flex items-center rounded-full border border-sand-300 bg-sand-100 px-3 py-1 text-xs font-semibold text-sand-700 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-300"
            style={{ animationDelay: '0.1s' }}
          >
            Best in class, by design
          </span>

          <h1
            className="aic-hero-slide text-balance text-3xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-5xl sm:leading-[1.1]"
            style={{ animationDelay: '0.18s' }}
          >
            Design systems your agent and your team build with.
            <br />
            <span className="mt-2 inline-block text-olive-600 dark:text-olive-500">
              Andromeda Pro, plus {standalonesFloor} standalone components.
            </span>
          </h1>

          <p
            className="aic-hero-rise mt-5 max-w-3xl text-base leading-relaxed text-sand-600 dark:text-sand-400 sm:text-lg"
            style={{ animationDelay: '0.26s' }}
          >
            Complete React design systems with templates, light and dark themes, and the design
            rules your agent follows. Plus standalone components and blocks that fit any React
            project, with or without a design system. Install with one command yourself, or let
            your agent do it.
          </p>

          <div
            className="aic-hero-rise mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: '0.34s' }}
          >
            <Link
              href="/design-systems/andromeda-pro"
              className={buttonClasses({ variant: 'primary', size: 'lg' })}
            >
              Explore Andromeda Pro
              <ArrowRight weight="regular" size={14} />
            </Link>
            <Link href="/components" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
              Browse components
            </Link>
          </div>

          <div className="aic-hero-rise mt-5 flex max-w-full justify-center" style={{ animationDelay: '0.42s' }}>
            <AgentPrompt />
          </div>
        </section>

        {/* ── The agent run ── */}
        <section aria-label="Watch an agent build with Andromeda Pro">
          <AgentStage runs={RUNS} />
          <p className="mt-4 text-center text-xs text-sand-600 dark:text-sand-400">
            A replay of the workflow. Every screen is a real Andromeda Pro template, in light and dark.
          </p>
        </section>

        {/* ── Proof pair ──
             Two cards side by side under the hero: the live pull counter on the
             left, the at-a-glance facts on the right. Both share one shell so
             they read as a pair (rounded-2xl / border-sand-800 / bg-sand-900).

             In both cards the big value and its label sit on ONE baseline-
             aligned row rather than stacked, which is what makes this read as a
             statement instead of a dashboard tile.

             The left number is PULLS SERVED, never "installs". Roughly two
             thirds of it is crawlers indexing the registry, so the noun stays
             "Requests served" — true of every one of them. Source and fallback:
             app/lib/registry-stats.ts ── */}
        <section className="mt-20 sm:mt-28">
          <div className="relative grid gap-4 sm:grid-cols-2">

            {/* One beam tracing the OUTER edge of both cards as a single
                rectangle, so it runs the full width across the top rather than
                dipping into the gap between them. Lives on the grid, not on
                either card, which is what makes that possible.

                overflow-visible + a rect at the full box means the stroke is
                centred ON the boundary, half in and half out, so the light
                rides the edge instead of sitting inside it. Absolutely
                positioned, so it is not a grid item and does not affect layout.

                rx matches the cards' rounded-3xl (24px). Animation and the
                dash-length rationale: .aic-beam-* in globals.css. */}
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              fill="none"
            >
              <rect
                className="aic-beam-tail stroke-sand-600 dark:stroke-[#D6E2FF]"
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx="24"
                pathLength={100}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="26 74"
                opacity={0.22}
              />
              <rect
                className="aic-beam-head stroke-sand-600 [filter:drop-shadow(0_0_5px_rgba(87,87,89,0.35))] dark:stroke-[#D6E2FF] dark:[filter:drop-shadow(0_0_5px_rgba(214,226,255,0.65))]"
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx="24"
                pathLength={100}
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeDasharray="7 93"
                opacity={0.9}
              />
            </svg>

            {/* Left: the live counter */}
            <Reveal className="h-full">
              <div className="relative flex h-full flex-col justify-center rounded-3xl p-4 sm:p-5">
                {/* No border, no fill — the soft light IS the card. One light
                    only: cool blue entering from the TOP-LEFT.

                    The right-hand card is lit from the opposite corner in olive,
                    so the pair reads as a diagonal rather than two matching
                    boxes.

                    Inline rather than a Tailwind arbitrary value: gradients need
                    commas, which arbitrary values escape awkwardly. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-3xl"
                  style={{
                    background:
                      'radial-gradient(85% 85% at 8% 0%, rgba(214,226,255,0.075), transparent 58%)',
                  }}
                />
                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-full bg-sand-100/70 px-2.5 py-1 text-[10px] font-semibold text-sand-900 dark:bg-sand-800/70 dark:text-sand-200">
                    {/* The pulsing dot carries the "alive" feeling so the words
                        do not have to overpromise: the cache window is 24h, so
                        "Live" would be false. See REVALIDATE_SECONDS. */}
                    <span className="relative flex h-1.5 w-1.5" aria-hidden>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-olive-700 opacity-75 dark:bg-olive-400" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-olive-700 dark:bg-olive-400" />
                    </span>
                    Updates daily
                  </span>

                  <div className="mt-3">
                    <span className="block text-3xl font-extrabold tabular-nums leading-none text-sand-900 dark:text-sand-50 sm:text-4xl">
                      <AnimatedCount to={pulls} suffix="" />
                    </span>
                    <span className="mt-1.5 block text-sm font-semibold text-sand-900 dark:text-sand-100 sm:text-base">
                      Requests served
                    </span>
                  </div>

                  {/* Hairline separating the headline stat from its breakdown.
                      border-t rather than an <hr>: it is decoration, not a
                      thematic break, so it stays out of the a11y tree. */}
                  <p className="mt-3 border-t border-sand-200/70 pt-3 text-[13px] leading-relaxed text-sand-600 dark:border-sand-800/70 dark:text-sand-500">
                    Every component, block &amp; design system install.
                    <br />
                    Every AI agent fetching source.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Right: the facts */}
            <Reveal delay={0.08} className="h-full">
              <div className="relative flex h-full flex-col justify-center rounded-3xl p-4 sm:p-5">
                {/* One light only, olive, entering from the BOTTOM-RIGHT — the
                    opposite corner to the left card, so the pair reads as a
                    diagonal.

                    Olive is the brand accent (--color-olive-400, #DAE4A0), so
                    this card is on-palette. Its alpha is lower than the blue
                    card's because olive is a light, high-chroma yellow-green and
                    reads far stronger at the same value. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-3xl"
                  style={{
                    background:
                      'radial-gradient(65% 65% at 100% 100%, rgba(218,228,160,0.028), transparent 60%)',
                  }}
                />
                {/* Every row links. These four sat in the most valuable space on
                    the page — directly under the hero — as inert decoration,
                    while each already had somewhere obvious to point. The
                    LICENSE link is the only one leaving the site, so it is the
                    only one carrying target/rel.

                    <ul>, not <dl>: wrapping <dt>/<dd> in an <a> is invalid
                    inside a definition list, and now that these are navigation
                    a list of links is the honest markup anyway.

                    Row gap stays looser than the left card's internal spacing:
                    four short rows run shorter than the counter card, and since
                    both stretch to the taller one, the slack would show as dead
                    space here. */}
                <ul className="relative flex flex-col gap-y-3.5 sm:gap-y-4">
                  {(
                    [
                      // Computed, never hardcoded — see componentTotal above.
                      { count: componentTotal, label: 'Components, blocks & templates', href: '/components' },
                      // "Free library" first: premium content is proprietary, so
                      // a bare "Open source" here would be false. Every other
                      // surface (terms, faq, impressum, about) already scopes it.
                      { text: 'MIT', label: 'Free library, open source', href: `${GITHUB_URL}/blob/main/LICENSE`, external: true },
                      { text: 'CLI', label: 'One command, done in seconds', href: '#how-remix' },
                      { text: 'MCP', label: 'Ready for your AI editor', href: '/mcp' },
                    ] as { count?: number; text?: string; label: string; href: string; external?: boolean }[]
                  ).map(({ count, text, label, href, external }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="group flex items-center gap-x-5 rounded-lg"
                      >
                        {/* Fixed width so every label starts on the same x, which
                            is what makes the rows scan as a column. It has to
                            clear the WIDEST value, not the average: "MCP" at
                            text-2xl extrabold is ~52px, so a narrower box lets it
                            overflow and collide with its label while "120" still
                            looks fine. */}
                        <span className="w-[3.5rem] shrink-0 text-xl font-extrabold tabular-nums leading-none text-sand-900 dark:text-sand-50 sm:text-2xl">
                          {count !== undefined ? <AnimatedCount to={count} suffix="" /> : text}
                        </span>
                        <span className="text-[13px] font-medium leading-snug text-sand-700 transition-colors group-hover:text-sand-900 dark:text-sand-300 dark:group-hover:text-sand-100">
                          {label}
                        </span>
                        {/* ml-auto pins the arrow to the right edge regardless of
                            label length, so all four line up in a column. */}
                        <CaretRight
                          weight="regular"
                          size={13}
                          aria-hidden
                          className="ml-auto shrink-0 text-sand-600 transition-all group-hover:translate-x-0.5 group-hover:text-sand-800 dark:group-hover:text-sand-300"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

          </div>
        </section>

        {/* ── Same prompt ── */}
        <section aria-labelledby="v2-compare" className="mt-16 sm:mt-24">
          <Reveal className="mx-auto mb-8 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-sand-600">Same prompt</p>
            <h2 id="v2-compare" className="mt-1 text-xl font-bold text-sand-900 dark:text-sand-50 sm:text-2xl">
              Same prompt, same agent. One of them had rules.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-sand-600 dark:text-sand-400">
              Without a system, an agent reaches for the same gradients, emoji and competing buttons
              every time. With Andromeda Pro installed, every choice comes from a rule. Drag to compare.
            </p>
          </Reveal>
          <Reveal y={16}>
            <CompareSlider poster={COMPARE_POSTER} />
          </Reveal>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {RULE_CARDS.map((c, i) => (
              <Reveal key={c.title} y={12} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-sand-200 bg-sand-100 p-5 dark:border-sand-800 dark:bg-sand-900">
                  <p className="font-mono text-[11px] font-semibold text-olive-700 dark:text-olive-400">must</p>
                  <h3 className="mt-1.5 text-base font-bold text-sand-900 dark:text-sand-50">{c.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-sand-600 dark:text-sand-400">{c.line}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Andromeda showcase ── */}
        <HomeShowcase components={systemComponents} templates={systemTemplates} />

        {/* ── How it works: the agent's side of each step ── */}
        <section id="how-remix" className="mt-16 sm:mt-24">
          <RulesWorkflow />
        </section>

        {/* ── Where it works ── */}
        <FeatureGrid />

        {/* ── Standalone components ── */}
        <FeaturedCarousel items={carouselItems} freeTotal={freeTotal} />

        {/* ── Pricing ── */}
        {/* The same <PremiumCards /> that /pricing renders, so the plans, the
            prices, the billing cycle switch and the entitlement-aware CTA can
            never drift between the two pages. Premium off = no section: the
            site is then fully free and has nothing to sell here. */}
        {PREMIUM && (
          <section className="mt-16 sm:mt-24">
            {/* Open-core band: the honest boundary between what is open and
                what Premium adds. Lives at the top of the pricing section, the
                one place on the page where Premium is a decision. */}
            <Reveal className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-sand-600">Open core</p>
              <h2 className="mt-1 text-xl font-bold text-sand-900 dark:text-sand-50">
                One codebase in the open. Premium on top.
              </h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Reveal y={12}>
                <div className="flex h-full flex-col rounded-2xl border border-sand-200 bg-sand-100 p-5 dark:border-sand-800 dark:bg-sand-900">
                  <p className="text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">Open source · MIT</p>
                  <p className="mt-2 flex-1 text-base leading-relaxed text-sand-700 dark:text-sand-300">
                    The aicanvas.me site, {freeTotal} free components, Andromeda Legacy and its rules,
                    and the MCP server.
                  </p>
                  <div className="mt-5">
                    <a
                      href={GITHUB_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClasses({ variant: 'outline', size: 'md' })}
                    >
                      View on GitHub
                    </a>
                  </div>
                </div>
              </Reveal>
              <Reveal y={12} delay={0.08}>
                <div className="flex h-full flex-col rounded-2xl border border-olive-500/30 bg-olive-500/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-olive-600 dark:text-olive-400">Premium</p>
                  <p className="mt-2 flex-1 text-base leading-relaxed text-sand-700 dark:text-sand-300">
                    Andromeda Pro, premium components and blocks, and the AI Brain installs with build
                    and review skills.
                  </p>
                  <div className="mt-5">
                    <Link href="/pricing" className={buttonClasses({ variant: 'outline', size: 'md' })}>
                      See Premium
                    </Link>
                  </div>
                </div>
              </Reveal>
            </div>
            <div className="mt-12" />
            <PremiumCards />
          </section>
        )}

        {/* ── FAQ ── */}
        <section className="mt-16 sm:mt-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-[2fr_3fr] sm:gap-12">
            {/* Intro rail, sticky on desktop */}
            <Reveal className="self-start sm:sticky sm:top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-sand-600">FAQ</p>
              <h2 className="mt-1 text-xl font-bold text-sand-900 dark:text-sand-50">Questions, answered.</h2>
              <p className="mt-3 text-base leading-relaxed text-sand-600 dark:text-sand-400">
                The short version of everything people ask before shipping their
                first component.
              </p>
              <Link
                href="/faq"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-olive-600 transition-colors hover:text-olive-800 dark:text-olive-500 dark:hover:text-olive-400"
              >
                See all FAQs
                <CaretRight weight="regular" size={14} />
              </Link>
            </Reveal>

            {/* Accordion cards (client island — only the open/close state) */}
            <FaqAccordion />
          </div>
        </section>

        {/* ── Final CTA: the whole template set drifting behind the last ask ── */}
        <section className="relative mt-16 overflow-hidden rounded-3xl border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900 sm:mt-24">
          <PosterWall />
          <Reveal y={12} className="relative px-6 py-20 text-center sm:py-28">
            <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-64 w-[36rem] max-w-full rounded-full bg-sand-100/90 blur-3xl dark:bg-sand-900/90" />
            </div>
            <p className="relative text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">
              Ready to build?
            </p>
            <h2 className="relative mt-2 text-balance text-2xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-4xl">
              Start with a system, not a blank page.
            </h2>
            <p className="relative mt-3 text-base text-sand-700 dark:text-sand-300">
              Andromeda Legacy is free. Install it and let your agent build your next screen.
            </p>
            <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/design-systems/andromeda"
                className={buttonClasses({ variant: 'primary', size: 'lg' })}
              >
                Explore Andromeda
                <ArrowRight weight="regular" size={14} />
              </Link>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: 'outline', size: 'lg' })}
              >
                View on GitHub
              </a>
            </div>
          </Reveal>
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}
