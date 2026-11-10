// The homepage (rendered at / and /home): hero, proof, the Andromeda chapter,
// the library, how to get it, value, plans, questions, as a home for the whole
// catalog. Server component: copy and counts render as static HTML; the
// template frame, the FAQ stickers, the agent install panel and the islands
// hydrate.

import Link from 'next/link'
import { ArrowRight } from '@/app/_icons/icons/arrow-right'
import { ChevronRight } from '@/app/_icons/icons/chevron-right'
import { Code } from '@/app/_icons/icons/code'
import { Search } from '@/app/_icons/icons/search'
import { Terminal } from '@/app/_icons/icons/terminal'
import { buttonClasses } from '../components/buttonClasses'
import { SiteFooter } from '../components/SiteFooter'
import { PremiumCards } from '../components/billing/PremiumCards'
import { AndromedaProSection } from './AndromedaProSection'
import { Reveal } from './Reveal'
import { AnimatedCount, WireIcons } from './islands'
import { GITHUB_URL } from '../lib/config'
import { HOME_FAQ, faqJsonLd } from '../lib/faq'
import { lifetimeEnabled, premiumEnabled } from '../../lib/flags'
import { ANDROMEDA_COMPONENT_META, ANDROMEDA_TEMPLATE_META } from '../_lib/andromeda/andromeda-meta'
import {
  ANDROMEDA_COMPONENT_META as ANDROMEDA_PRO_COMPONENT_META,
  ANDROMEDA_TEMPLATE_META as ANDROMEDA_PRO_TEMPLATE_META,
} from '../_lib/andromeda-pro/andromeda-meta'
import { TemplateDeck, type DeckTemplate } from './TemplateDeck'
import { ComponentWall, type WallItem } from './ComponentWall'
import { HeroBoard, type BoardPiece, type BoardSystem, type HeroIcon } from './HeroBoard'
import { AgentInstall } from './AgentInstall'
import { StickerFaq } from './StickerFaq'
import { ValueBento } from './ValueBento'
import { Wordmark } from '../components/Wordmark'
import { StageLight } from '../components/StageLight'

interface Props {
  /** Every standalone, free and premium. */
  total: number
  /** Free MIT standalones (everything not badged Premium). */
  freeTotal: number
  /** Live registry pulls served, from PostHog. See app/lib/registry-stats.ts. */
  pulls: number
  templates: DeckTemplate[]
  wall: WallItem[]
  /** The hero board's Line icons (markup); empty in a build without the icon source. */
  heroIcons: HeroIcon[]
  /** Every icon in the set; 0 in a build without the icon source. */
  iconCount: number
  /** The hero board's standalone cards. */
  boardPieces: BoardPiece[]
}

const PREMIUM = premiumEnabled()

const EYEBROW = 'text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400'
const H2 = 'text-balance text-3xl font-bold tracking-tight text-sand-900 sm:text-4xl dark:text-sand-50'
const SUB = 'text-base leading-relaxed text-sand-600 dark:text-sand-400'


// The homepage's questions come from the one site FAQ (app/lib/faq.ts), so a
// question repeated on /faq or pricing carries the same answer everywhere.
const HOME_FAQ_JSON_LD = faqJsonLd(HOME_FAQ)

const STEPS = [
  {
    num: '01',
    icon: <Search size={16} />,
    title: 'Browse',
    desc: 'Find a standalone, a design system or a ready-made template, and preview it live.',
  },
  {
    num: '02',
    icon: <Terminal size={16} />,
    title: 'Install',
    desc: 'Run one shadcn command, or connect the free AI Canvas MCP once and ask your agent.',
  },
  {
    num: '03',
    icon: <Code size={16} />,
    title: 'Build',
    desc: 'Change colors, swap parts or add your own components, by hand or through your agent. It is all your source.',
  },
]

export function HomePage({ total, freeTotal, pulls, templates, wall, heroIcons, iconCount, boardPieces }: Props) {
  // Everything installable, counted from source so it can never drift from
  // reality: standalones (`total`, premium included) + the Andromeda
  // design-system components and templates, which live in their own registry.
  const componentTotal =
    total +
    ANDROMEDA_COMPONENT_META.length +
    ANDROMEDA_TEMPLATE_META.length +
    ANDROMEDA_PRO_COMPONENT_META.length +
    ANDROMEDA_PRO_TEMPLATE_META.length
  const standalonesFloor = `${Math.floor(total / 10) * 10}+`
  const boardSystems: BoardSystem[] = [
    {
      slug: 'andromeda-pro',
      name: 'Andromeda Pro',
      premium: true,
      isNew: true,
      components: ANDROMEDA_PRO_COMPONENT_META.length,
      templates: ANDROMEDA_PRO_TEMPLATE_META.length,
    },
    {
      slug: 'andromeda',
      name: 'Andromeda Legacy',
      premium: false,
      isNew: false,
      components: ANDROMEDA_COMPONENT_META.length,
      templates: ANDROMEDA_TEMPLATE_META.length,
    },
  ]

  return (
    <div
      // overflow-x-hidden makes this element own the page's vertical scroll,
      // via two CSS rules at once: a non-visible value on one axis computes
      // the other axis to auto, and a flex item with non-visible overflow gets
      // an automatic minimum size of 0 so it shrinks to the column instead of
      // growing past it. So this scrolls and the root chrome column does not,
      // and the column must not reserve a gutter it can never paint a bar in.
      // See .app-scroll-column in globals.css.
      data-owns-scroll
      className="aic-page-scroll flex min-h-full flex-col overflow-x-hidden bg-sand-50 dark:bg-sand-950"
    >
      <main className="relative mx-auto w-full min-w-0 max-w-7xl px-4 pt-12 pb-8 sm:px-6 sm:pt-20">
        {/* ── Hero ── */}
        <section className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <span
            className="aic-hero-rise mb-5 inline-flex items-center rounded-full border border-sand-300 bg-sand-100 px-3 py-1 text-xs font-semibold text-sand-700 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-300"
            style={{ animationDelay: '0.1s' }}
          >
            No more AI slop.
          </span>

          <h1
            className="aic-hero-slide text-balance text-3xl font-extrabold tracking-tight text-sand-900 sm:text-5xl dark:text-sand-50"
            style={{ animationDelay: '0.18s' }}
          >
            AI agents finally design badass interfaces.
          </h1>

          <p
            className="aic-hero-rise mt-5 max-w-2xl text-base leading-relaxed text-sand-600 sm:text-lg dark:text-sand-400"
            style={{ animationDelay: '0.26s' }}
          >
            Complete React design systems for Claude, ChatGPT, Cursor or any AI agent. Plus{' '}
            {standalonesFloor} standalone components and blocks that fit any of them
            {iconCount > 0 ? `, and ${iconCount} icons` : ''}. Each piece installs with one shadcn command or through
            the AI Canvas MCP.
          </p>

          <div
            className="aic-hero-rise mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: '0.34s' }}
          >
            <Link href="/design-systems/andromeda-pro" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
              Explore design systems
              <ArrowRight size={14} />
            </Link>
            <Link href="/components" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
              Browse components
            </Link>
          </div>
        </section>

        {/* An agent building from AI Canvas: the full page column, so it sits
            outside the hero's text column. */}
        <div className="mt-12 w-full sm:mt-16">
          <HeroBoard
            systems={boardSystems}
            pieces={boardPieces}
            icons={heroIcons}
            standalonesFloor={standalonesFloor}
            iconCount={iconCount}
          />
        </div>

        <div className="mx-auto max-w-4xl">
          {/* ── Proof pair ──
               Two cards side by side under the hero: the live pull counter on the
               left, the at-a-glance facts on the right. Both share one shell so
               they read as a pair (rounded-card / border-sand-800 / bg-sand-900).

               In both cards the big value and its label sit on ONE baseline-
               aligned row rather than stacked, which is what makes this read as a
               statement instead of a dashboard tile.

               The left number is PULLS SERVED, never "installs". Roughly two
               thirds of it is crawlers indexing the registry, so the noun stays
               "Requests served" — true of every one of them. Source and fallback:
               app/lib/registry-stats.ts ── */}
          <section className="mt-16 sm:mt-24">
            <div className="relative grid gap-4 sm:grid-cols-2">

              {/* One beam tracing the OUTER edge of both cards as a single
                  rectangle, so it runs the full width across the top rather than
                  dipping into the gap between them. Lives on the grid, not on
                  either card, which is what makes that possible.

                  overflow-visible + a rect at the full box means the stroke is
                  centred ON the boundary, half in and half out, so the light
                  rides the edge instead of sitting inside it. Absolutely
                  positioned, so it is not a grid item and does not affect layout.

                  rx matches the cards' rounded-section (24px). Animation and the
                  dash-length rationale: .aic-beam-* in globals.css. */}
              <svg
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                fill="none"
              >
                <rect
                  className="aic-beam-tail stroke-sand-600 dark:stroke-glow"
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
                  className="aic-beam-head stroke-sand-600 [filter:drop-shadow(0_0_5px_color-mix(in_srgb,var(--color-sand-600)_35%,transparent))] dark:stroke-glow dark:[filter:drop-shadow(0_0_5px_color-mix(in_srgb,var(--color-glow)_65%,transparent))]"
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
                <div className="relative flex h-full flex-col justify-center rounded-section p-4 sm:p-5">
                  {/* No border, no fill — the soft light IS the card. One light
                      only, cool blue, from straight above like every lit
                      surface on the site.

                      Inline rather than a Tailwind arbitrary value: gradients need
                      commas, which arbitrary values escape awkwardly. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-section"
                    style={{
                      background:
                        'radial-gradient(85% 85% at 50% 0%, color-mix(in srgb, var(--color-glow) 7.5%, transparent), transparent 58%)',
                    }}
                  />
                  <div className="relative">
                    <span className="inline-flex items-center gap-2 rounded-full bg-sand-100/70 px-2.5 py-1 text-[10px] font-semibold text-sand-900 dark:bg-sand-800/70 dark:text-sand-200">
                      {/* The pulsing dot carries the "alive" feeling so the words
                          do not have to overpromise: the cache window is 24h, so
                          "Live" would be false. See REVALIDATE_SECONDS. */}
                      <span className="relative flex h-1.5 w-1.5" aria-hidden>
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
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
                <div className="relative flex h-full flex-col justify-center rounded-section p-4 sm:p-5">
                  {/* One light only, the accent, from straight above like the left
                      card.

                      The accent is the site's own ink, so this card is
                      on-palette. Its alpha is lower than the blue card's
                      because a neutral ink reads far stronger than a tinted
                      light at the same value. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-section"
                    style={{
                      background:
                        'radial-gradient(65% 65% at 50% 0%, color-mix(in srgb, var(--color-accent) 2.8%, transparent), transparent 60%)',
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
                        { text: 'CLI', label: 'One shadcn command, editable source', href: '#how-remix' },
                        { text: 'MCP', label: 'Ready for your AI editor', href: '/mcp' },
                      ] as { count?: number; text?: string; label: string; href: string; external?: boolean }[]
                    ).map(({ count, text, label, href, external }) => (
                      <li key={label}>
                        <Link
                          href={href}
                          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          className="group flex items-center gap-x-5 rounded-control"
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
                          <ChevronRight
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
        </div>

        <div className="mx-auto max-w-4xl">
          <WireIcons target="v3-chapter" />
        </div>

        {/* ── The Andromeda chapter: the system, its Brain, then its screens ── */}
        <div id="v3-chapter" className="mx-auto max-w-6xl scroll-mt-24">
          <AndromedaProSection />

          <section aria-labelledby="v3-templates" className="mt-14 sm:mt-16">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className={EYEBROW}>Included with Premium</p>
              <h2 id="v3-templates" className={`mt-2 ${H2}`}>
                Start from a complete screen.
              </h2>
              <p className={`mx-auto mt-3 max-w-xl ${SUB}`}>
                Andromeda Pro templates for AI products, operations, sign in and marketing. Try the real page before
                you install it.
              </p>
            </Reveal>
            <Reveal y={16} delay={0.05} className="mt-8">
              <TemplateDeck templates={templates} />
            </Reveal>
            {/* Below the deck, the way the standalone library closes. */}
            <div className="mt-8 flex justify-center">
              <Link
                href="/design-systems/andromeda-pro#ovb-templates"
                className={buttonClasses({ variant: 'outline', size: 'lg' })}
              >
                Browse all {ANDROMEDA_PRO_TEMPLATE_META.length} templates
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        </div>

        {/* ── The standalone library ── */}
        <section aria-labelledby="v3-library" className="mt-20 sm:mt-32">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center">
            <p className={EYEBROW}>The standalone library</p>
            <h2 id="v3-library" className={`mt-2 ${H2}`}>
              One component when you do not need a whole system.
            </h2>
            <p className={`mx-auto mt-3 max-w-xl ${SUB}`}>
              Free MIT components and premium standalones for the React project you already have. Each one installs as
              editable source.
            </p>
          </Reveal>
          <ComponentWall items={wall} />
          {/* Below the wall, never over it: pulled up into the wall's fade it
              sat on the bottom row of cards. */}
          <div className="mt-8 flex justify-center">
            <Link href="/components" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
              Browse all {total} standalones
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ── From catalog to code: the three-step timeline on the
             left, the agent's way in on the right; stacked on phones ── */}
        <section id="how-remix" aria-labelledby="v3-how" className="mx-auto mt-20 max-w-6xl scroll-mt-24 sm:mt-32">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className={EYEBROW}>From catalog to code</p>
            <h2 id="v3-how" className={`mt-2 ${H2}`}>
              Browse it yourself. Or ask your agent.
            </h2>
            <p className={`mx-auto mt-3 max-w-xl ${SUB}`}>Both paths end the same way: real source in your project.</p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="relative flex flex-col lg:col-span-5">
              {/* Connecting dotted line */}
              <style>{`@keyframes v3DotFlow { from { background-position-y: 0 } to { background-position-y: 8px } } @media (prefers-reduced-motion: reduce) { .v3-dot-flow { animation: none !important } }`}</style>
              {STEPS.map((step, i) => (
                <Reveal key={step.num} x={-20} y={0} delay={i * 0.12} className="relative flex items-start gap-5 py-5">
                  {i < STEPS.length - 1 && (
                    <div
                      aria-hidden
                      className="v3-dot-flow absolute -bottom-5 left-[19px] top-[60px] w-px overflow-hidden"
                      style={{
                        backgroundImage: 'radial-gradient(circle, color-mix(in srgb, var(--color-sand-500) 60%, transparent) 1px, transparent 1px)',
                        backgroundSize: '1px 8px',
                        animation: 'v3DotFlow 1.5s linear infinite',
                      }}
                    />
                  )}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-inset border border-sand-300 bg-sand-100 text-sand-700 shadow-[0_2px_10px_rgba(0,0,0,0.08)] dark:border-sand-700 dark:bg-sand-900 dark:text-sand-300 dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                    {step.icon}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-bold tabular-nums text-accent">{step.num}</span>
                      <h3 className="text-base font-bold text-sand-900 dark:text-sand-50">{step.title}</h3>
                    </div>
                    <p className="mt-1.5 text-base leading-relaxed text-sand-600 dark:text-sand-400">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal y={16} className="lg:col-span-7">
              <div className="relative isolate overflow-hidden rounded-section border border-sand-200 px-5 py-10 sm:px-8 sm:py-12 dark:border-sand-800">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 opacity-60 dark:opacity-100"
                  style={{ backgroundImage: 'radial-gradient(60% 55% at 50% 0%, color-mix(in srgb, var(--color-accent) 8%, transparent), transparent 70%)' }}
                />
                <AgentInstall />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Why AI Canvas ── */}
        <section aria-labelledby="v3-why" className="mx-auto mt-20 max-w-6xl sm:mt-32">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center">
            <p className={EYEBROW}>Why AI Canvas</p>
            <h2 id="v3-why" className={`mt-2 ${H2} sm:text-5xl`}>
              More than a component gallery.
            </h2>
            <p className={`mx-auto mt-3 max-w-xl ${SUB}`}>
              Pick a system or a single component. Build with it yourself or with an agent. The source stays yours.
            </p>
          </Reveal>
          <ValueBento freeTotal={freeTotal} />
        </section>

        {/* ── Pricing ──
            The same <PremiumCards /> that /pricing renders, so plans, prices,
            the billing switch and the entitlement-aware button never drift.
            Premium off = no section. */}
        {PREMIUM && (
          <section aria-labelledby="v3-pricing" className={`mx-auto mt-20 sm:mt-32 ${lifetimeEnabled() ? 'max-w-6xl' : 'max-w-4xl'}`}>
            <Reveal className="text-center">
              <p className={EYEBROW}>Pricing</p>
              <h2 id="v3-pricing" className={`mt-2 ${H2}`}>
                The free library stays free.
              </h2>
              <p className={`mx-auto mt-3 max-w-2xl ${SUB}`}>
                Every free component ships its full source and its remix prompt, installed with one command. Premium adds
                Andromeda Pro, its templates, the AI Brain and the premium standalones.
              </p>
            </Reveal>
            <div className="mt-10">
              <PremiumCards />
            </div>
          </section>
        )}

        {/* ── FAQ ──
            After the plans, so the questions a price raises are answered
            right under it, then the final call to action. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_FAQ_JSON_LD) }} />
        <section aria-label="Frequently asked questions" className="mt-20 sm:mt-32">
          <StickerFaq
            items={HOME_FAQ}
            eyebrow="FAQ"
            title="Questions, answered."
            sub="The short version of everything people ask before adding their first component."
          />
        </section>

        {/* ── Final CTA ── */}
        <section className="mx-auto mt-20 max-w-4xl sm:mt-32">
          <Reveal
            y={12}
            className="relative overflow-hidden rounded-section px-6 py-12 text-center sm:py-16"
          >
            <StageLight />
            <p className={`relative ${EYEBROW}`}>Ready to build?</p>
            <h2 className={`relative mt-2 ${H2}`}>Start with the source, not a blank prompt.</h2>
            <p className={`relative mx-auto mt-3 max-w-xl ${SUB}`}>
              {componentTotal}+ components, blocks and templates. Browse them yourself, or connect AI Canvas to the agent
              you already use.
            </p>
            <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/components" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
                Browse components
                <ArrowRight size={14} />
              </Link>
              <Link href="/mcp" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
                Set up MCP
              </Link>
            </div>
          </Reveal>
        </section>

        <SiteFooter />
      </main>

      <Wordmark />
    </div>
  )
}
