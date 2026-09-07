'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { GithubLogo, ArrowRight } from '@phosphor-icons/react'
import { GITHUB_URL } from '../lib/config'
import { buttonClasses } from '../components/Button'
import { SiteFooter } from '../components/SiteFooter'
import { HeaderSocials } from '../components/HeaderSocials'
import { TOTAL_COMPONENTS } from '../lib/component-nav.generated'
import { ANDROMEDA_COMPONENT_META } from '../_lib/andromeda/andromeda-meta'

function Section({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <Section className="mt-20 sm:mt-28">
      <blockquote className="border-l-2 border-olive-500 pl-5 sm:pl-6">
        <p className="text-xl font-medium leading-snug text-sand-900 dark:text-sand-100 sm:text-2xl">
          {children}
        </p>
      </blockquote>
    </Section>
  )
}

export default function AboutPage() {
  // Mirrors the home CTA count: registry components + Andromeda system components.
  // TOTAL_COMPONENTS is a generated constant equal to COMPONENT_META.length, so we
  // get the live number without shipping the heavy meta array to this route.
  const componentTotal = TOTAL_COMPONENTS + ANDROMEDA_COMPONENT_META.length

  return (
    <div className="min-h-full bg-sand-50 dark:bg-sand-950">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-50 hidden h-14 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-sand-200 bg-sand-50 px-6 dark:border-sand-800 dark:bg-sand-950 md:grid">
        <div />
        <Link href="/components" className="text-sm font-semibold text-olive-600 transition-colors hover:text-olive-800 dark:text-olive-500 dark:hover:text-olive-400">
          /About
        </Link>
        <div className="flex items-center justify-end">
          <HeaderSocials />
        </div>
      </header>

      <main className="relative mx-auto max-w-4xl px-4 pt-6 pb-8 sm:px-6 sm:pt-12">
        {/* Mobile breadcrumb */}
        <p className="mb-6 text-sm font-semibold md:hidden">
          <span className="text-olive-600 dark:text-olive-500">/About</span>
        </p>

        {/* ── Hook ── */}
        <Section>
          <h1 className="text-3xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-4xl">
            Stop building on sand
          </h1>
          <p className="mt-6 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            There is a blank file, a blinking cursor, and a deadline. You point
            an AI at it and ask for an interface, and it invents the whole world
            from nothing. Layout, spacing, every state, every transition, one
            guess at a time. What comes back usually looks right. Then a real
            person hovers, tabs, or hits an error, and the cracks show.
          </p>
          <p className="mt-4 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            The magic was never in the asking. It is in what you start from.
            Point an agent at a blank page and it guesses. Point it at something
            already good and it stops guessing and starts editing. AI Canvas
            exists to be that something already good.
          </p>
        </Section>

        {/* ── Why it exists ── */}
        <Section className="mt-20 sm:mt-28">
          <h2 className="text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
            Why it exists
          </h2>
          <p className="mt-6 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            AI Canvas started as a small experiment. I kept rebuilding the same
            button, the same modal, the same focus ring on every project, then
            watching my agent rebuild them worse from scratch. So I started
            keeping the good versions somewhere an agent could reach them.
          </p>
          <p className="mt-4 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            The question underneath was simple. What if a piece of UI did not
            arrive as a screenshot you had to chase, but as finished, readable
            code you could drop into a project and ship? It felt like there
            should be a place where components are treated with the same care as
            code. Built thoughtfully, tested honestly, and shared openly.
          </p>
        </Section>

        {/* ── Craft ── */}
        <Section className="mt-20 sm:mt-28">
          <h2 className="text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
            Craft you can feel
          </h2>
          <p className="mt-6 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            You cannot always name what makes an interface feel right. You feel
            instantly when it is wrong. The spacing that drifts on a narrow
            phone. The animation that lurches. The button that does nothing for
            half a second and leaves you wondering if you missed.
          </p>
          <p className="mt-4 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            The work lives in the parts most libraries skip. The easing curve and
            the duration behind a single transition. The rhythm that holds at 320
            pixels and at 1440. The focus ring, the disabled state, the empty
            state, the loading state, the small flash of feedback when something
            is pressed. That is the boring eighty percent, and it is exactly
            where generated UI quietly gives up. A model front-loads the visible
            happy path and drops the states people hit when something goes wrong.
            Here those states are built first, not last.
          </p>
          <p className="mt-4 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            None of this asks for your trust. Open any component, resize it to
            320 pixels, tab through it, read the easing curve. Some run real 2D
            physics instead of scripted ease curves, and you can read that in the
            source. The care is in the code, not in the marketing.
          </p>
        </Section>

        <PullQuote>
          A component is not finished when it renders. It is finished when it
          behaves, in every state a real person can reach.
        </PullQuote>

        {/* ── Three ways in ── */}
        <Section className="mt-20 sm:mt-28">
          <h2 className="text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
            Three ways in, all yours
          </h2>
          <p className="mt-6 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            Browse the registry and preview every component live. When one fits,
            you have options, because different people build differently and that
            is the whole point.
          </p>
          <p className="mt-4 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            Developers run one shadcn CLI command and the fully typed source
            lands in the project, React with Tailwind CSS and Framer Motion,
            ready to run. Agents like Claude Code, Codex, and Cursor reach for
            the AI Canvas MCP and install components themselves. Designers and
            anyone working in plain language can remix a component with AI
            instead, changing colors, motion, and layout by describing the
            change, never from a blank prompt. You can always just copy the
            source too.
          </p>
          <p className="mt-4 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            A comprehensive AI remix prompt still ships with every free
            component, and it works in any AI tool. Premium components and
            blocks publish the setup and the constants to everyone, and Premium
            unlocks the rest of the build spec. It is one lane now, the
            remix lane, not the headline. However it arrives, it arrives as
            real code in your codebase.
          </p>
        </Section>

        {/* ── One language ── */}
        <Section className="mt-20 sm:mt-28">
          <h2 className="text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
            One language for designers and developers
          </h2>
          <p className="mt-6 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            Most component libraries serve one audience. AI Canvas fits however
            you build, and that means designers and developers reaching for the
            same thing and meaning the same thing.
          </p>
          <p className="mt-4 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            A pre-built component is not a shortcut. It is a decision already
            made well. For a designer it is a vocabulary, so primary action means
            one thing across every screen instead of a dozen subtly different
            things. For a developer it is a foundation they do not have to
            reinvent. The real value was never the pixels. It is the agreement.
            When design and engineering point at the same component and mean the
            same thing, the handoff stops being a negotiation.
          </p>
        </Section>

        {/* ── Foundation ── */}
        <Section className="mt-20 sm:mt-28">
          <h2 className="text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
            Build on rock, not on sand
          </h2>
          <p className="mt-6 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            What you start from quietly decides what you can finish. Begin on a
            coherent base, a sane spacing scale, consistent tokens, accessible
            defaults, real states, and every later decision gets easier. Begin on
            a shaky one and you pay forever. The spacing never quite lines up.
            Dark mode is an afterthought. The third feature fights the first.
          </p>
          <p className="mt-4 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            The forty-first modal is never free. Every inconsistent pattern is a
            thing someone has to find, re-learn, and reconcile later, and that
            bill compounds in the dark. A polished component is not just
            today&apos;s screen looking good. It is the next ten screens costing
            less.
          </p>
        </Section>

        {/* ── Token economics ── */}
        <Section className="mt-20 sm:mt-28">
          <h2 className="text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
            Do not pay your AI to start from zero
          </h2>
          <p className="mt-6 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            Craft is not just how it feels. It is what it costs to generate. When
            you prompt an AI from nothing, you are paying it to invent
            everything, layout, tokens, states, motion, one token at a time. The
            output is the expensive part, and from-scratch work is almost all
            output. Worse, the first pass is rarely the last, so you iterate, and
            every round re-sends the whole context and re-pays for it.
          </p>
          <p className="mt-4 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            Start from a finished AI Canvas component and the job flips from
            generate to adapt. The agent reads a strong, correct base and remixes
            it. Fewer tokens, fewer rounds, a better result, because a known-good
            reference makes the hallucinations structurally unlikely. Spend your
            tokens shaping the last twenty percent, not regenerating the first
            eighty you could have had for free.
          </p>
        </Section>

        <PullQuote>
          A blank prompt makes the AI guess, and you pay for every guess. Hand it
          something already good and it stops guessing and starts editing.
        </PullQuote>

        {/* ── Open + free to start ── */}
        <Section className="mt-20 sm:mt-28">
          <h2 className="text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
            Open, and free to start
          </h2>
          <p className="mt-6 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            The free library is open source under MIT, and that source is never
            hidden. Premium is our one paid exception: proprietary components,
            design systems, and templates whose sales keep the free library
            free. Remixing the free library with AI stays free for everyone.
          </p>
          <p className="mt-4 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            Browsing and previewing are free. Installing is free with a free
            account, unlimited. Premium is there for people who lean on AI
            Canvas every day, and what you pay keeps the open library growing.
          </p>
        </Section>

        {/* ── Independence ── */}
        <Section className="mt-20 sm:mt-28">
          <h2 className="text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
            A note on independence
          </h2>
          <p className="mt-6 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            AI Canvas is not sponsored by, partnered with, or endorsed by Claude
            Code, Codex, Cursor, Lovable, or V0. It simply works alongside the
            tools builders already use.
          </p>
        </Section>

        {/* ── Close ── */}
        <Section className="mt-20 sm:mt-28">
          <h2 className="text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
            Still early, still growing
          </h2>
          <p className="mt-6 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            This is a solo project, built one component at a time by someone who
            cares about the easing curve more than is strictly reasonable. It is
            still early and still growing.
          </p>
        </Section>

        {/* ── Final CTA (mirrors the home CTA) ── */}
        <Section className="mt-12 sm:mt-16">
          <div className="relative overflow-hidden rounded-2xl border border-olive-500/20 bg-gradient-to-br from-olive-500/8 via-transparent to-transparent p-8 text-center ring-1 ring-inset ring-olive-500/10">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-64 rounded-full bg-olive-500/10 blur-3xl" />
            </div>
            <p className="relative text-xs font-semibold uppercase tracking-wider text-sand-600">
              Ready to build?
            </p>
            <h2 className="relative mt-2 text-xl font-bold text-sand-900 dark:text-sand-50">
              Your agent already knows the way.
            </h2>
            <p className="relative mx-auto mt-2 max-w-xl text-base text-sand-600 dark:text-sand-500">
              {componentTotal}+ components, design systems, and templates, one
              command away. Browse them yourself or tell your agent what to
              build.
            </p>
            <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/components"
                className={buttonClasses({ variant: 'primary', size: 'lg' })}
              >
                Browse Components
                <ArrowRight weight="regular" size={14} />
              </Link>
              <Link
                href="/design-systems/andromeda"
                className={buttonClasses({ variant: 'outline', size: 'lg' })}
              >
                Discover Andromeda
              </Link>
            </div>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-5 inline-flex items-center gap-1.5 text-sm text-sand-600 transition-colors hover:text-sand-900 dark:text-sand-500 dark:hover:text-sand-300"
            >
              <GithubLogo weight="regular" size={16} />
              Read the source on GitHub
            </a>
          </div>
        </Section>

        <SiteFooter />
      </main>
    </div>
  )
}
