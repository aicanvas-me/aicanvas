// Server component: renders the static homepage HTML (which ships and hydrates
// no JS) and mounts the interactive client islands from ./islands. Kept as its
// own file so app/page.tsx stays focused on metadata + data prep.

import Link from 'next/link'
// Server component -> import the hook-free SSR icons. The main entry is the CSR
// version (createContext/useContext) and crashes in a server component. Client
// islands (./islands) keep the main import.
import {
  ArrowRight,
  MagnifyingGlass,
  RocketLaunch,
  Code,
  Palette,
  Terminal,
  Sparkle,
  Fire,
  CaretRight,
} from '@phosphor-icons/react/dist/ssr'
import { buttonClasses } from '../components/buttonClasses'
import { HeaderSocials } from '../components/HeaderSocials'
import { SiteFooter } from '../components/SiteFooter'
import { FoundationLoop } from '../_components/FoundationLoop'
import { Reveal } from './Reveal'
import { StackedCards, AnimatedCount, WireIcons, FeaturedCarousel, FaqAccordion } from './islands'
import type { ComponentMeta } from '../lib/component-registry'
import { GITHUB_URL } from '../lib/config'
import { ANDROMEDA_COMPONENT_META, ANDROMEDA_TEMPLATE_META } from '../_lib/andromeda/andromeda-meta'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  total: number
  /** Live registry pulls served, from PostHog. See app/lib/registry-stats.ts. */
  pulls: number
  carouselItems: ComponentMeta[]
}

// ─── HomePageClient ────────────────────────────────────────────────────────────

export function HomePageClient({ total, pulls, carouselItems }: Props) {
  // Everything installable, counted from source so it can never drift from
  // reality: standalones (`total`, premium included — the premium injection
  // runs before the registry is generated, so a production build counts the
  // gated ones too) + the Andromeda design-system components and templates,
  // which live in their own registry and are not part of `total`.
  //
  // Templates were previously missing from this sum, which undercounted the
  // catalogue. The label says "components, blocks and templates", so all three
  // have to be in the number.
  const componentTotal =
    total + ANDROMEDA_COMPONENT_META.length + ANDROMEDA_TEMPLATE_META.length
  return (
    <div
      // overflow-x-hidden makes this element own the page's vertical scroll,
      // via two CSS rules at once: a non-visible value on one axis computes
      // the other axis to auto, and a flex item with non-visible overflow gets
      // an automatic minimum size of 0 so it shrinks to the column instead of
      // growing past it. So this scrolls and the root chrome column does not —
      // and the column must not reserve a gutter it can never paint a bar in.
      // (/components has the same min-h-full wrapper WITHOUT overflow-x-hidden,
      // so there the column scrolls and keeps its gutter. That is the whole
      // difference between the two pages.) See .app-scroll-column in globals.css.
      data-owns-scroll
      className="aic-page-scroll flex min-h-full flex-col overflow-x-hidden bg-sand-950"
    >

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 hidden h-14 shrink-0 items-center justify-between border-b border-sand-800 bg-sand-950 px-6 md:flex">
        <span className="text-sm font-semibold text-sand-50">Overview</span>
        <HeaderSocials />
      </div>

      <main className="relative mx-auto w-full min-w-0 max-w-4xl px-4 pt-6 pb-8 sm:px-6 sm:pt-12">

        {/* ── Hero ── */}
        <section className="flex flex-col items-center text-center">
          <StackedCards />

          <span
            className="aic-hero-rise mb-5 inline-flex items-center rounded-full border border-sand-700 bg-sand-900 px-3 py-1 text-xs font-semibold text-sand-300"
            style={{ animationDelay: '0.1s' }}
          >
            One command, zero tokens
          </span>

          <h1
            className="aic-hero-slide text-balance text-2xl font-extrabold tracking-tight text-sand-50 sm:text-4xl"
            style={{ animationDelay: '0.18s' }}
          >
            AI
            {' '}
            <img
              src="/ai-canvas-icon.svg"
              alt=""
              aria-hidden
              className="inline-block h-[0.6em] w-auto align-[0.02em]"
            />
            {' '}Native Components and Blocks,
            <br />
            <span className="mt-2 inline-block text-olive-500">Design Systems and Templates</span>
          </h1>

          <p
            className="aic-hero-rise mt-4 max-w-2xl text-base leading-relaxed text-sand-400"
            style={{ animationDelay: '0.26s' }}
          >
            Copy one shadcn CLI command and a finished component, block, or complete
            design system lands in your project in seconds. No tokens spent asking an
            AI to generate it from scratch, just real, editable React you own.
          </p>

          <div
            className="aic-hero-rise mt-7 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: '0.34s' }}
          >
            <Link
              href="/components"
              className={buttonClasses({ variant: 'primary', size: 'lg' })}
            >
              Browse Components
              <ArrowRight weight="regular" size={14} />
            </Link>
            <Link
              href="/mcp"
              className="flex items-center gap-1.5 rounded-xl border border-sand-700 px-5 py-2.5 text-sm font-semibold text-sand-300 transition-colors hover:border-sand-600 hover:text-sand-100"
            >
              Get MCP
            </Link>
          </div>
        </section>

        {/* ── Proof pair ──
             Two cards side by side under the hero: the live pull counter on the
             left, the at-a-glance facts on the right. Both share one shell so
             they read as a pair (rounded-2xl / border-sand-800 / bg-sand-900,
             matching the Andromeda spotlight further down).

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

                rx matches the cards' rounded-3xl (24px). Animation and the
                dash-length rationale: .aic-beam-* in globals.css. */}
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              fill="none"
            >
              <rect
                className="aic-beam-tail"
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx="24"
                pathLength={100}
                stroke="#D6E2FF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="26 74"
                opacity={0.22}
              />
              <rect
                className="aic-beam-head"
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx="24"
                pathLength={100}
                stroke="#D6E2FF"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeDasharray="7 93"
                opacity={0.9}
                style={{ filter: 'drop-shadow(0 0 5px rgba(214,226,255,0.65))' }}
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
                  <span className="inline-flex items-center gap-2 rounded-full bg-sand-800/70 px-2.5 py-1 text-[10px] font-semibold text-sand-200">
                    {/* The pulsing dot carries the "alive" feeling so the words
                        do not have to overpromise: the cache window is 24h, so
                        "Live" would be false. See REVALIDATE_SECONDS. */}
                    <span className="relative flex h-1.5 w-1.5" aria-hidden>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-olive-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-olive-400" />
                    </span>
                    Updates daily
                  </span>

                  <div className="mt-3">
                    <span className="block text-3xl font-extrabold tabular-nums leading-none text-sand-50 sm:text-4xl">
                      <AnimatedCount to={pulls} suffix="" />
                    </span>
                    <span className="mt-1.5 block text-sm font-semibold text-sand-100 sm:text-base">
                      Requests served
                    </span>
                  </div>

                  {/* Hairline separating the headline stat from its breakdown.
                      border-t rather than an <hr>: it is decoration, not a
                      thematic break, so it stays out of the a11y tree. */}
                  <p className="mt-3 border-t border-sand-800/70 pt-3 text-[13px] leading-relaxed text-sand-500">
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
                        <span className="w-[3.5rem] shrink-0 text-xl font-extrabold tabular-nums leading-none text-sand-50 sm:text-2xl">
                          {count !== undefined ? <AnimatedCount to={count} suffix="" /> : text}
                        </span>
                        <span className="text-[13px] font-medium leading-snug text-sand-300 transition-colors group-hover:text-sand-100">
                          {label}
                        </span>
                        {/* ml-auto pins the arrow to the right edge regardless of
                            label length, so all four line up in a column. */}
                        <CaretRight
                          weight="regular"
                          size={13}
                          aria-hidden
                          className="ml-auto shrink-0 text-sand-600 transition-all group-hover:translate-x-0.5 group-hover:text-sand-300"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

          </div>
        </section>

        {/* ── Wire icon divider ── */}
        <WireIcons />

        {/* ── Andromeda spotlight (foundation loop) — same bordered-card treatment
             as the Overview page's System card, with the homepage's own copy/CTA ── */}
        <section className="mt-16 sm:mt-24">
          <Reveal>
            <Link
              href="/design-systems/andromeda"
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-sand-800 bg-sand-900 transition-all duration-200 hover:border-sand-700 sm:flex-row"
            >
              <span
                aria-hidden
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/40 bg-sand-950/85 text-red-500 backdrop-blur-sm"
              >
                <Fire weight="fill" size={15} />
              </span>
              <div className="flex flex-col justify-center gap-3 p-6 sm:w-1/2 sm:p-8">
                <span className="text-xs font-semibold uppercase tracking-wider text-olive-400">Featured</span>
                <h2 className="text-2xl font-bold tracking-tight text-sand-50">Andromeda • Design System</h2>
                <p className="text-sm leading-relaxed text-sand-400">
                  A complete design system for dashboards, control panels, and data-dense
                  interfaces. Components, templates, and the rules that keep them all speaking the
                  same visual language.
                </p>
                <div className="mt-1">
                  <span className={`${buttonClasses({ variant: 'primary', size: 'md' })} group-hover:bg-olive-400`}>
                    Discover more
                    <ArrowRight weight="regular" size={14} />
                  </span>
                </div>
              </div>
              <div className="relative min-h-[280px] overflow-hidden sm:min-h-[360px] sm:w-1/2">
                <FoundationLoop />
              </div>
            </Link>
          </Reveal>
        </section>

        {/* ── Featured carousel ── */}
        <FeaturedCarousel items={carouselItems} />



        {/* ── Who it's for ── */}
        <section id="audience" className="mt-16 sm:mt-24 scroll-mt-24">
          <Reveal className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-sand-600">Built for everyone</p>
            <h2 className="mt-1 text-xl font-bold text-sand-50">
              For developers. For designers. For makers. For your AI agent.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-sand-400">
              Most component libraries serve one kind of person. AI Canvas installs the same finished code for everyone who builds, and every install costs zero AI tokens instead of burning them on a from-scratch generation. Drop a component in with the shadcn CLI, reshape it with an AI agent, or let an agent browse and install it for you.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-4">
            {[
              {
                icon: <Code weight="regular" size={18} />,
                audience: 'Developers',
                description: 'Drop finished, typed components into your project with one command. No boilerplate, no screenshot to rebuild, and no tokens spent generating what already works.',
                badges: ['TypeScript', 'Motion', 'Tailwind CSS'],
                badgeStyle: 'text-sand-500 ring-sand-800',
              },
              {
                icon: <Palette weight="regular" size={18} />,
                audience: 'Designers',
                description: 'Start from something already crafted, then reshape it in your AI agent, Cursor, Claude Code, or Codex, whichever you use: the colors, the layout, the motion, fast, without rebuilding it from scratch.',
                badges: ['Cursor', 'Claude Code', 'Codex'],
                badgeStyle: 'text-olive-500 ring-olive-500/30 bg-olive-500/5',
              },
              {
                icon: <RocketLaunch weight="regular" size={18} />,
                audience: 'Makers & Founders',
                description: 'Building with AI in Lovable, V0, Cursor, or any AI agent? Hand it real, polished components to install so your product ships fast and does not look generated, with no tokens spent regenerating UI from scratch.',
                badges: ['No-code', 'AI-built', 'Real code'],
                badgeStyle: 'text-sand-400 ring-sand-700',
              },
              {
                icon: <Sparkle weight="regular" size={18} />,
                audience: 'AI agents',
                description: 'Point your agent at the AI Canvas MCP and it browses, inspects, and installs finished components for you: fewer tokens, no writing UI from scratch, and you keep control. Works with any MCP client, Claude Code, Cursor, Codex, Copilot, Gemini, and more.',
                badges: ['MCP', 'Agent-ready', 'No copy-paste'],
                badgeStyle: 'text-sand-400 ring-sand-700',
              },
            ].map(({ icon, audience, description, badges, badgeStyle }, i) => (
              <Reveal
                key={audience}
                y={14}
                delay={i * 0.08}
                className="flex flex-col rounded-xl border border-sand-800 bg-sand-900 p-5"
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sand-800 text-sand-300">
                    {icon}
                  </div>
                  <span className="text-sm font-bold text-sand-50">{audience}</span>
                </div>
                <p className="flex-1 text-base leading-relaxed text-sand-400">{description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {badges.map((badge) => (
                    <span
                      key={badge}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${badgeStyle}`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── How it works — vertical timeline ── */}
        <section id="how-remix" className="mt-16 sm:mt-24">
          <Reveal className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-sand-600">How it works</p>
            <h2 className="mt-1 text-xl font-bold text-sand-50">Three steps. Your way.</h2>
          </Reveal>

          <div className="relative flex flex-col gap-0">
            {/* Connecting dotted line */}
            <div
              className="dot-flow absolute left-[19px] top-6 bottom-16 w-px overflow-hidden"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(79,79,76,0.5) 1px, transparent 1px)',
                backgroundSize: '1px 8px',
                animation: 'dotFlow 1.5s linear infinite',
              }}
            />
            <style>{`@keyframes dotFlow { from { background-position-y: 0; } to { background-position-y: 8px; } } @media (prefers-reduced-motion: reduce) { .dot-flow { animation: none !important; } }`}</style>

            {[
              {
                num: '01',
                icon: <MagnifyingGlass weight="regular" size={16} />,
                title: 'Browse',
                desc: 'Search components, blocks, and design systems, and preview each one live before you choose.',
              },
              {
                num: '02',
                icon: <Terminal weight="regular" size={16} />,
                title: 'Install',
                desc: 'Run the one shadcn CLI command, or point your AI agent at the MCP. The finished, typed source lands in your project, no tokens spent generating it.',
              },
              {
                num: '03',
                icon: <RocketLaunch weight="regular" size={16} />,
                title: 'Ship',
                desc: 'It arrives as real code you own. Ship it as is, or reshape it with an AI agent in seconds. It is yours.',
              },
            ].map((step, i) => (
              <Reveal
                key={step.num}
                x={-20}
                y={0}
                delay={i * 0.12}
                className="flex items-start gap-5 py-5"
              >
                {/* Node on the timeline */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sand-700 bg-sand-900 text-sand-300 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                  {step.icon}
                </div>
                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-bold tabular-nums text-olive-500">{step.num}</span>
                    <h3 className="text-base font-bold text-sand-50">{step.title}</h3>
                  </div>
                  <p className="mt-1.5 text-base leading-relaxed text-sand-500">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>


        {/* ── FAQ ── */}
        <section className="mt-16 sm:mt-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-[2fr_3fr] sm:gap-12">
            {/* Intro rail, sticky on desktop */}
            <Reveal className="self-start sm:sticky sm:top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-sand-600">FAQ</p>
              <h2 className="mt-1 text-xl font-bold text-sand-50">Questions, answered.</h2>
              <p className="mt-3 text-base leading-relaxed text-sand-400">
                The short version of everything people ask before shipping their
                first component.
              </p>
              <Link
                href="/faq"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-olive-500 transition-colors hover:text-olive-400"
              >
                See all FAQs
                <CaretRight weight="regular" size={14} />
              </Link>
            </Reveal>

            {/* Accordion cards (client island — only the open/close state) */}
            <FaqAccordion />
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="mt-16 sm:mt-24">
          <Reveal
            y={12}
            className="relative overflow-hidden rounded-2xl border border-olive-500/20 bg-gradient-to-br from-olive-500/8 via-transparent to-transparent p-8 text-center ring-1 ring-inset ring-olive-500/10"
          >
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-64 rounded-full bg-olive-500/10 blur-3xl" />
            </div>
            <p className="relative text-xs font-semibold uppercase tracking-wider text-sand-600">
              Ready to build?
            </p>
            <h2 className="relative mt-2 text-xl font-bold text-sand-50">
              One command from your next screen.
            </h2>
            <p className="relative mt-2 text-base text-sand-500">
              {componentTotal}+ components and design systems, each one command away. Copy it
              yourself, or tell your agent to install it. No tokens spent generating what
              already works.
            </p>
            <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/components"
                className={buttonClasses({ variant: 'primary', size: 'lg' })}
              >
                Browse Components
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
