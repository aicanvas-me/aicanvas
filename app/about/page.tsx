import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from '@/app/_icons/icons/arrow-right'
import { Info } from '@/app/_icons/icons/info'
import { GithubLogo } from '@phosphor-icons/react/dist/ssr'
import { GITHUB_URL } from '../lib/config'
import { buttonClasses } from '../components/buttonClasses'
import { CARD, CtaBand, PageHero, PageShell } from '../components/PageKit'
import { Reveal } from '../home/Reveal'
import { OpenLock, SystemFill } from '../components/LoopArt'
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
// into view. A chapter with a picture shows it on a quiet stage under the
// heading, lit from above, so a long read gets a place to rest the eye.
function Chapter({ title, art, children }: { title: ReactNode; art?: ReactNode; children: ReactNode }) {
  return (
    <Reveal className="mx-auto mt-16 max-w-2xl sm:mt-20">
      <section>
        <h2 className={H}>{title}</h2>
        {art && (
          <div
            aria-hidden
            className="mt-6 flex h-48 items-center justify-center rounded-section border border-sand-200 bg-[radial-gradient(ellipse_80%_90%_at_50%_0%,var(--color-sand-100),transparent)] sm:h-56 dark:border-sand-800 dark:bg-[radial-gradient(ellipse_80%_90%_at_50%_0%,var(--color-sand-900),transparent)]"
          >
            {art}
          </div>
        )}
        {children}
      </section>
    </Reveal>
  )
}

// The pull quotes leave the reading column and set the pace of the page. The
// second sentence carries the accent, the way the homepage hero's
// second line does; the two halves stay inline so the quote reads as one line.
function PullQuote({ lead, accent }: { lead: ReactNode; accent: ReactNode }) {
  return (
    <Reveal y={16} className="mx-auto my-20 max-w-4xl text-center sm:my-28">
      <figure>
        {/* The type's own opening quote, set heavy: Phosphor's thin outline
            mark turned over read as the digits 66. Nudged down because the
            glyph sits at the top of its line box. */}
        <span
          aria-hidden="true"
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-card border border-sand-300 bg-sand-100 text-accent dark:border-sand-700 dark:bg-sand-900"
        >
          <span className="translate-y-3.5 text-6xl font-extrabold leading-none">&ldquo;</span>
        </span>
        <blockquote className="mt-7">
          <p className="text-balance text-2xl font-bold leading-snug tracking-tight text-sand-900 sm:text-4xl sm:leading-tight dark:text-sand-50">
            {lead} <span className="text-accent">{accent}</span>
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
        pillIcon={<Info size={12} className="text-accent" aria-hidden />}
        title="Stop building on sand"
        sub={
          <p className="text-pretty">
            There is a blank file, a blinking cursor, and a deadline. You ask an
            AI for an interface and it invents everything from nothing: layout,
            spacing, every state, one guess at a time. It looks right until a
            real person hovers, tabs, or hits an error. That is AI slop: an
            interface nobody decided, only guessed.
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
          Point an agent at a blank page and it guesses. Point it at a design
          system it can read and you can reshape, and it builds on decisions
          already made. AI Canvas exists to be that starting point.
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
          The question underneath was simple. What if UI arrived not as a
          screenshot to chase, but as finished, readable code you drop into a
          project and ship? Built thoughtfully, tested honestly, and shared
          openly.
        </p>
      </Chapter>

      {/* ── Systems ── the turn from components to design systems you own. */}
      <Chapter title="From components to a system you own" art={<SystemFill />}>
        <p className={P}>
          Good components fixed one screen at a time. They did not stop the
          agent from mixing three spacing scales on the next one. The agent
          never lacked code. It lacked a system.
        </p>
        <p className={P}>
          So the work grew into design systems your agent builds with.
          Andromeda Pro gives it the components, the tokens, and the AI Brain,
          a design skill that Claude Code, Cursor, and Codex read before they
          build, with a check that catches work drifting off the system.
        </p>
        <p className={P}>
          And the system is yours. Change the colors and every component
          follows. Edit a component, swap one out, or ask your agent for a new
          one, and it fits, because the agent carries the system into
          everything it builds. That is what we mean by taste: not a look you
          copy, a way of deciding that you own.
        </p>
      </Chapter>

      {/* ── Standalone ── the other division: effects that belong to no system. */}
      <Chapter title="Standalone, for any system">
        <p className={P}>
          Not everything belongs to a system. The standalone components and
          blocks are the other half of AI Canvas: backgrounds, glass, 3D and
          shaders, typography, and motion effects that belong to no design
          system and drop into any of them, Andromeda, shadcn, or your own.
          Recolor them, retime them, rebuild them. The source is yours.
        </p>
        <p className={P}>
          Underneath both sits a free icon set in four styles, line, duotone,
          solid, and solid duotone, with the size and stroke width yours to
          set.
        </p>
      </Chapter>

      {/* ── Craft ── */}
      <Chapter title="Craft you can feel">
        <p className={P}>
          You cannot always name what makes an interface feel right, but you
          feel instantly when it is wrong. The spacing that drifts on a narrow
          phone. The animation that lurches. The button that does nothing for
          half a second.
        </p>
        <p className={P}>
          The work lives in the parts generated UI skips: the easing curve
          behind a transition, the rhythm that holds at 320 pixels and at 1440,
          the focus, disabled, empty, and loading states. A model front-loads
          the happy path and drops the states people hit when something goes
          wrong. Here those states are built first.
        </p>
        <p className={P}>
          None of this asks for your trust. Open any component, resize it, tab
          through it, read the easing curve. Some run real 2D physics, and you
          can read that in the source too.
        </p>
      </Chapter>

      <PullQuote
        lead="A component is not finished when it renders."
        accent="It is finished when it behaves, in every state a real person can reach."
      />

      {/* ── Ways in ── */}
      <Chapter title="Three ways in, all yours">
        <p className={P}>
          Developers run one shadcn command and typed source lands in the
          project: React, Tailwind CSS, and Framer Motion. Agents like Claude
          Code, Codex, and Cursor connect the AI Canvas MCP and install
          components and design systems themselves. Designers remix a free
          component with AI by describing the change. Or just copy the source.
        </p>
        <p className={P}>
          However it arrives, it arrives as real code in your codebase, yours
          to change.
        </p>
      </Chapter>

      {/* ── One language ── */}
      <Chapter title="One language for you and your agent">
        <p className={P}>
          A pre-built component is a decision already made well. For a designer
          it is a vocabulary, so primary action means one thing on every
          screen. For a developer it is a foundation they do not reinvent. For
          an agent it is a pattern to reuse instead of a guess.
        </p>
        <p className={P}>
          The value was never the pixels. It is the agreement. When design,
          engineering, and the agent point at the same component and mean the
          same thing, the handoff stops being a negotiation.
        </p>
      </Chapter>

      {/* ── Foundation ── */}
      <Chapter title="Build on rock, not on sand">
        <p className={P}>
          What you start from decides what you can finish. Begin on a coherent
          base, a sane spacing scale, consistent tokens, accessible defaults,
          real states, and every later decision gets easier. Begin on a shaky
          one and you pay forever: spacing that never lines up, dark mode as an
          afterthought, the third feature fighting the first. A polished
          component is not just today&apos;s screen looking good. It is the
          next ten screens costing less.
        </p>
      </Chapter>

      {/* ── Token economics ── */}
      <Chapter title="Do not pay your AI to start from zero">
        <p className={P}>
          Prompting from nothing pays the AI to invent everything, layout,
          tokens, states, motion, one token at a time, and every round of fixes
          re-pays for the whole context. Start from a finished component and
          the job flips from generate to adapt: fewer tokens, fewer rounds, a
          better result. Spend your tokens on the last twenty percent, not on
          regenerating the first eighty.
        </p>
      </Chapter>

      <PullQuote
        lead="A blank prompt makes the AI guess, and you pay for every guess."
        accent="Hand it something already good and it stops guessing and starts editing."
      />

      {/* ── Open + free to start ── */}
      <Chapter title="Open, and free to start" art={<OpenLock />}>
        <p className={P}>
          The free library is open source under MIT, and its source is never
          hidden. Browsing and previewing are free, installing is free with a
          free account, and remixing the free library with AI stays free.
          Premium is the one paid exception: proprietary components, design
          systems, and templates for people who lean on AI Canvas every day,
          and their sales keep the free library growing.
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
            Code, Codex, Cursor, or any other AI tool. It simply works alongside
            the tools builders already use.
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
          <ArrowRight size={14} />
        </Link>
        <Link href="/design-systems/andromeda-pro" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
          Discover Andromeda Pro
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
