import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, GithubLogo, Info, Quotes } from '@phosphor-icons/react/dist/ssr'
import { GITHUB_URL } from '../lib/config'
import { buttonClasses } from '../components/buttonClasses'
import { CARD, CtaBand, PageHero, PageShell } from '../components/PageKit'
import { Reveal } from '../home/Reveal'
import { TOTAL_COMPONENTS } from '../lib/component-nav.generated'
import { ANDROMEDA_COMPONENT_META } from '../_lib/andromeda/andromeda-meta'
import { ANDROMEDA_COMPONENT_META as ANDROMEDA_PRO_COMPONENT_META } from '../_lib/andromeda-pro/andromeda-meta'

// ─── /about ───────────────────────────────────────────────────────────────────
// The founder story, read as an essay: the homepage hero over one centred
// reading column, the two pull quotes breaking out wide as the page's rhythm,
// and the homepage's closing band. A server page: Reveal is the only client
// piece, so the essay ships as static HTML.

// One measure for every paragraph, so the column reads at a steady ~70
// characters a line. Body text takes the body role, a step brighter than the
// secondary grey the hero line uses, because this is the copy people read.
const P = 'mt-5 text-pretty text-[17px] leading-[1.8] text-sand-700 dark:text-sand-300'
const H = 'text-balance text-2xl font-bold tracking-tight text-sand-900 sm:text-[1.75rem] sm:leading-tight dark:text-sand-50'

// A chapter of the essay: its heading and paragraphs, rising in as it scrolls
// into view.
function Chapter({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <Reveal className="mx-auto mt-16 max-w-2xl sm:mt-20">
      <section>
        <h2 className={H}>{title}</h2>
        {children}
      </section>
    </Reveal>
  )
}

// The pull quotes leave the reading column and set the pace of the page. The
// second sentence carries the olive accent, the way the homepage hero's
// second line does; the two halves stay inline so the quote reads as one line.
function PullQuote({ lead, accent }: { lead: ReactNode; accent: ReactNode }) {
  return (
    <Reveal y={16} className="mx-auto my-20 max-w-4xl text-center sm:my-28">
      <figure>
        {/* Phosphor's mark is a closing quote; turned over it opens one. */}
        <span
          aria-hidden="true"
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-sand-300 bg-sand-100 text-olive-600 dark:border-sand-700 dark:bg-sand-900 dark:text-olive-400"
        >
          <Quotes weight="regular" size={22} className="rotate-180" />
        </span>
        <blockquote className="mt-7">
          <p className="text-balance text-2xl font-bold leading-snug tracking-tight text-sand-900 sm:text-4xl sm:leading-tight dark:text-sand-50">
            {lead} <span className="text-olive-600 dark:text-olive-500">{accent}</span>
          </p>
        </blockquote>
      </figure>
    </Reveal>
  )
}

export default function AboutPage() {
  // Mirrors the home CTA count: registry components + BOTH design systems'
  // components. TOTAL_COMPONENTS is a generated constant equal to
  // COMPONENT_META.length, so we get the live number without shipping the heavy
  // meta array to this route.
  const componentTotal =
    TOTAL_COMPONENTS + ANDROMEDA_COMPONENT_META.length + ANDROMEDA_PRO_COMPONENT_META.length

  return (
    <PageShell>
      {/* ── Hook ── */}
      <PageHero
        pill="About"
        pillIcon={<Info weight="regular" size={12} className="text-olive-600 dark:text-olive-400" aria-hidden />}
        title="Stop building on sand"
        sub={
          <p className="text-pretty">
            There is a blank file, a blinking cursor, and a deadline. You point
            an AI at it and ask for an interface, and it invents the whole world
            from nothing. Layout, spacing, every state, every transition, one
            guess at a time. What comes back usually looks right. Then a real
            person hovers, tabs, or hits an error, and the cracks show.
          </p>
        }
      />

      {/* The thesis opens the essay a size up, as its standfirst. */}
      <div
        className="aic-hero-rise mx-auto mt-14 max-w-2xl border-t border-sand-200 pt-10 sm:mt-20 sm:pt-12 dark:border-sand-800"
        style={{ animationDelay: '0.34s' }}
      >
        <p className="text-pretty text-xl leading-relaxed text-sand-900 sm:text-[1.375rem] sm:leading-[1.6] dark:text-sand-50">
          The magic was never in the asking. It is in what you start from.
          Point an agent at a blank page and it guesses. Point it at something
          already good and it stops guessing and starts editing. AI Canvas
          exists to be that something already good.
        </p>
      </div>

      {/* ── Why it exists ── */}
      <Chapter title="Why it exists">
        <p className={P}>
          AI Canvas started as a small experiment. I kept rebuilding the same
          button, the same modal, the same focus ring on every project, then
          watching my agent rebuild them worse from scratch. So I started
          keeping the good versions somewhere an agent could reach them.
        </p>
        <p className={P}>
          The question underneath was simple. What if a piece of UI did not
          arrive as a screenshot you had to chase, but as finished, readable
          code you could drop into a project and ship? It felt like there
          should be a place where components are treated with the same care as
          code. Built thoughtfully, tested honestly, and shared openly.
        </p>
      </Chapter>

      {/* ── Craft ── */}
      <Chapter title="Craft you can feel">
        <p className={P}>
          You cannot always name what makes an interface feel right. You feel
          instantly when it is wrong. The spacing that drifts on a narrow
          phone. The animation that lurches. The button that does nothing for
          half a second and leaves you wondering if you missed.
        </p>
        <p className={P}>
          The work lives in the parts most libraries skip. The easing curve and
          the duration behind a single transition. The rhythm that holds at 320
          pixels and at 1440. The focus ring, the disabled state, the empty
          state, the loading state, the small flash of feedback when something
          is pressed. That is the boring eighty percent, and it is exactly
          where generated UI quietly gives up. A model front-loads the visible
          happy path and drops the states people hit when something goes wrong.
          Here those states are built first, not last.
        </p>
        <p className={P}>
          None of this asks for your trust. Open any component, resize it to
          320 pixels, tab through it, read the easing curve. Some run real 2D
          physics instead of scripted ease curves, and you can read that in the
          source. The care is in the code, not in the marketing.
        </p>
      </Chapter>

      <PullQuote
        lead="A component is not finished when it renders."
        accent="It is finished when it behaves, in every state a real person can reach."
      />

      {/* ── Three ways in ── */}
      <Chapter title="Three ways in, all yours">
        <p className={P}>
          Browse the registry and preview every component live. When one fits,
          you have options, because different people build differently and that
          is the whole point.
        </p>
        <p className={P}>
          Developers run one shadcn CLI command and the fully typed source
          lands in the project, React with Tailwind CSS and Framer Motion,
          ready to run. Agents like Claude Code, Codex, and Cursor reach for
          the AI Canvas MCP and install components themselves. Designers and
          anyone working in plain language can remix a component with AI
          instead, changing colors, motion, and layout by describing the
          change, never from a blank prompt. You can always just copy the
          source too.
        </p>
        <p className={P}>
          A comprehensive AI remix prompt still ships with every free
          component, and it works in any AI tool. Premium components and
          blocks publish the setup and the constants to everyone, and Premium
          unlocks the rest of the build spec. It is one lane now, the
          remix lane, not the headline. However it arrives, it arrives as
          real code in your codebase.
        </p>
      </Chapter>

      {/* ── One language ── */}
      <Chapter title="One language for designers and developers">
        <p className={P}>
          Most component libraries serve one audience. AI Canvas fits however
          you build, and that means designers and developers reaching for the
          same thing and meaning the same thing.
        </p>
        <p className={P}>
          A pre-built component is not a shortcut. It is a decision already
          made well. For a designer it is a vocabulary, so primary action means
          one thing across every screen instead of a dozen subtly different
          things. For a developer it is a foundation they do not have to
          reinvent. The real value was never the pixels. It is the agreement.
          When design and engineering point at the same component and mean the
          same thing, the handoff stops being a negotiation.
        </p>
      </Chapter>

      {/* ── Foundation ── */}
      <Chapter title="Build on rock, not on sand">
        <p className={P}>
          What you start from quietly decides what you can finish. Begin on a
          coherent base, a sane spacing scale, consistent tokens, accessible
          defaults, real states, and every later decision gets easier. Begin on
          a shaky one and you pay forever. The spacing never quite lines up.
          Dark mode is an afterthought. The third feature fights the first.
        </p>
        <p className={P}>
          The forty-first modal is never free. Every inconsistent pattern is a
          thing someone has to find, re-learn, and reconcile later, and that
          bill compounds in the dark. A polished component is not just
          today&apos;s screen looking good. It is the next ten screens costing
          less.
        </p>
      </Chapter>

      {/* ── Token economics ── */}
      <Chapter title="Do not pay your AI to start from zero">
        <p className={P}>
          Craft is not just how it feels. It is what it costs to generate. When
          you prompt an AI from nothing, you are paying it to invent
          everything, layout, tokens, states, motion, one token at a time. The
          output is the expensive part, and from-scratch work is almost all
          output. Worse, the first pass is rarely the last, so you iterate, and
          every round re-sends the whole context and re-pays for it.
        </p>
        <p className={P}>
          Start from a finished AI Canvas component and the job flips from
          generate to adapt. The agent reads a strong, correct base and remixes
          it. Fewer tokens, fewer rounds, a better result, because a known-good
          reference makes the hallucinations structurally unlikely. Spend your
          tokens shaping the last twenty percent, not regenerating the first
          eighty you could have had for free.
        </p>
      </Chapter>

      <PullQuote
        lead="A blank prompt makes the AI guess, and you pay for every guess."
        accent="Hand it something already good and it stops guessing and starts editing."
      />

      {/* ── Open + free to start ── */}
      <Chapter title="Open, and free to start">
        <p className={P}>
          The free library is open source under MIT, and that source is never
          hidden. Premium is our one paid exception: proprietary components,
          design systems, and templates whose sales keep the free library
          free. Remixing the free library with AI stays free for everyone.
        </p>
        <p className={P}>
          Browsing and previewing are free. Installing is free with a free
          account, unlimited. Premium is there for people who lean on AI
          Canvas every day, and what you pay keeps the open library growing.
        </p>
      </Chapter>

      {/* ── Independence ── an aside, so it sits in a quiet card instead of
          reading as another chapter. */}
      <Reveal className="mx-auto mt-16 max-w-2xl sm:mt-20">
        <section className={`p-6 sm:p-8 ${CARD}`}>
          <h2 className="text-lg font-bold tracking-tight text-sand-900 dark:text-sand-50">
            A note on independence
          </h2>
          <p className="mt-3 text-pretty text-base leading-relaxed text-sand-600 dark:text-sand-400">
            AI Canvas is not sponsored by, partnered with, or endorsed by Claude
            Code, Codex, Cursor, Lovable, or V0. It simply works alongside the
            tools builders already use.
          </p>
        </section>
      </Reveal>

      {/* ── Close ── */}
      <Chapter title="Still early, still growing">
        <p className={P}>
          This is a solo project, built one component at a time by someone who
          cares about the easing curve more than is strictly reasonable. It is
          still early and still growing.
        </p>
      </Chapter>

      {/* ── Final CTA ── the GitHub link takes its own row under the buttons. */}
      <CtaBand
        eyebrow="Ready to build?"
        title="Your agent already knows the way."
        sub={`${componentTotal}+ components, design systems, and templates, one command away. Browse them yourself or tell your agent what to build.`}
      >
        <Link href="/components" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
          Browse Components
          <ArrowRight weight="regular" size={14} />
        </Link>
        <Link href="/design-systems/andromeda" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
          Discover Andromeda
        </Link>
        <div className="mt-2 basis-full">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-sand-600 transition-colors hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-50"
          >
            <GithubLogo weight="regular" size={16} />
            Read the source on GitHub
          </a>
        </div>
      </CtaBand>
    </PageShell>
  )
}
