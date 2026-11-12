import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight } from '@/app/_icons/icons/arrow-right'
import { Refresh } from '@/app/_icons/icons/refresh'
import { Bot } from '@/app/_icons/icons/bot'
import { Check } from '@/app/_icons/icons/check'
import { ListChecks } from '@/app/_icons/icons/list-checks'
import { Swatches } from '@/app/_icons/icons/swatches'
import { Package } from '@/app/_icons/icons/package'
import { PlugsConnected } from '@/app/_icons/icons/plugs-connected'
import { Sparkle } from '@/app/_icons/icons/sparkle'
import { Terminal } from '@/app/_icons/icons/terminal'
import { InstallCards } from './InstallCards'
import { buttonClasses } from '../components/buttonClasses'
import { FaqRows } from '../components/FaqRows'
import { CARD, CtaBand, PageHero, PageShell, SectionHead } from '../components/PageKit'
import { Reveal } from '../home/Reveal'
import { StageLight } from '../components/StageLight'
import { ConnectAgentCard } from './ConnectAgentCard'
import { hostedMcpOAuthEnabled } from '../../lib/flags'
import { SITE_URL } from '../lib/config'
import { pageMetadata } from '../lib/page-metadata'
import { MCP_FAQ, faqJsonLd } from '../lib/faq'

const MCP_SOCIAL_DESCRIPTION =
  'Connect Claude Code, Cursor, or Codex to browse, inspect, and install AI Canvas components, design systems, and templates as editable source with shadcn.'
const MCP_HEAD = pageMetadata({
  title: 'AI Canvas MCP: shadcn Components for Claude Code, Cursor, Codex',
  social: 'AI Canvas MCP connects Claude Code, Codex, and Cursor',
  description:
    'Connect Claude Code, Cursor or Codex to AI Canvas components and design systems through MCP. Your agent installs editable React source with shadcn.',
  url: `${SITE_URL}/mcp`,
})

export const metadata: Metadata = {
  ...MCP_HEAD,
  alternates: { canonical: `${SITE_URL}/mcp`, types: { 'text/markdown': `${SITE_URL}/mcp.md` } },
  openGraph: { ...MCP_HEAD.openGraph, description: MCP_SOCIAL_DESCRIPTION },
  twitter: { ...MCP_HEAD.twitter, description: MCP_SOCIAL_DESCRIPTION },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '@aicanvas/mcp',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Cross-platform',
  description:
    'Free MCP server for Claude Code, Cursor, and Codex to browse, search, inspect, and install AI Canvas components, design systems, and templates as editable source.',
  url: `${SITE_URL}/mcp`,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'AI Canvas', url: SITE_URL },
}

const MCP_FAQ_JSON_LD = faqJsonLd(MCP_FAQ)

const BENEFITS: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: 'One command, then forget it',
    body: 'Install the MCP with a single command. After that your agent can search, inspect, and install AI Canvas components on its own.',
    icon: <Terminal size={18} />,
  },
  {
    title: 'No more from-scratch UI',
    body: 'Instead of generating UI from zero, your agent pulls a real component with full source, the design spec, and Framer Motion.',
    icon: <Package size={18} />,
  },
  {
    title: 'Always current',
    body: 'The server fetches from the live registry at runtime, so new components reach your agent about five minutes after they ship.',
    icon: <Refresh size={18} />,
  },
  {
    title: 'Works in the agent you use',
    body: 'Claude Code, Claude, ChatGPT, Codex, VS Code and Cursor, or any other client that speaks MCP.',
    icon: <Bot size={18} />,
  },
  {
    title: 'A whole system in one call',
    body: 'Ask for a design system and your agent gets every component plus the shared tokens in a single response.',
    icon: <Swatches size={18} />,
  },
  {
    title: 'Checks its own work',
    body: 'Before it finishes, your agent can flag props that do not exist, required props it missed and values outside the allowed options, each with its line.',
    icon: <ListChecks size={18} />,
  },
]

// The lit panel's marquee: real tool calls, two rows running opposite ways.
const CALL_ROWS = [
  [
    'search_components("animated hero")',
    'get_system("andromeda-pro")',
    'get_icon_install("check")',
    'get_component("plan-runner")',
    'list_templates()',
    'list_categories()',
  ],
  [
    'get_component_props("glass-ai-compose")',
    'validate_usage("page.tsx")',
    'search_icons("arrow")',
    'get_install_command("charging-widget")',
    'list_systems()',
    'get_audit_checklist()',
  ],
]

// One row, listed twice so the loop has no seam; the copy is hidden from
// screen readers. Hover pauses it; reduced motion holds it still.
function CallRow({ calls, reverse }: { calls: string[]; reverse?: boolean }) {
  return (
    <div className="mcp-calls flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          aria-hidden={copy === 1 || undefined}
          className={`mcp-calls-track flex shrink-0 gap-2 pr-2 ${reverse ? 'mcp-calls-rev' : ''}`}
        >
          {calls.map((call) => (
            <li
              key={call}
              className="flex shrink-0 items-center gap-1.5 rounded-chip border border-sand-200 bg-sand-50 px-2.5 py-1.5 font-mono text-[12px] text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300"
            >
              <Check size={12} className="text-success" aria-hidden />
              {call}
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}

const PROMPTS = [
  'Use the aicanvas MCP to show me what categories of components are available.',
  'Use the aicanvas MCP: add the task cards to my dashboard and match my dark theme.',
  'Use the aicanvas MCP: my hero section feels boring, find something animated to fix it.',
  'Use the aicanvas MCP to find me a good animated background for my landing page.',
]

export default function McpPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(MCP_FAQ_JSON_LD) }}
      />
      <PageShell>
        <PageHero
          pill="MCP server"
          pillIcon={
            <PlugsConnected size={12} className="text-accent" aria-hidden />
          }
          title="AI Canvas MCP connected with"
          accent="Claude Code, Codex, and Cursor."
          sub={
            <>
              Save tokens. Don&rsquo;t start from scratch. Your agent pulls a finished component with the design
              spec and the motion included, and you just adapt it to your project.
            </>
          }
        />

        {/* ── Install ── the setup comes first: it is what the page is for. The
            hosted sign-in leads while it is on, npm below it. Not in a Reveal:
            its resting transform would become the containing block of the fixed
            copy toast and pin it inside the card instead of the viewport. */}
        {hostedMcpOAuthEnabled() ? (
          <>
            <section aria-labelledby="mcp-install" className="mx-auto mt-16 max-w-4xl sm:mt-24">
              <SectionHead
                id="mcp-install"
                eyebrow="Setup"
                title="Connect your AI agent"
                sub="Add AI Canvas to your AI agent and sign in once in the browser. No key to copy."
              />
              <div className="mt-10">
                <ConnectAgentCard heading={false} lit />
              </div>
            </section>
            <section aria-labelledby="mcp-local" className="mx-auto mt-20 max-w-4xl sm:mt-32">
              <SectionHead id="mcp-local" eyebrow="Local" title="Run it locally with npm" />
              <div className="mt-10">
                <InstallCards />
              </div>
            </section>
          </>
        ) : (
          <section aria-labelledby="mcp-install" className="mx-auto mt-16 max-w-4xl sm:mt-24">
            <SectionHead id="mcp-install" eyebrow="Setup" title="How to install the MCP" />
            <div className="mt-10">
              <InstallCards />
            </div>
          </section>
        )}

        {/* ── What you get ── one lit panel (the agent at work, as the calls it
            makes), then the six reasons as plain cards. */}
        <section aria-labelledby="mcp-get" className="mx-auto mt-20 max-w-6xl sm:mt-32">
          <SectionHead id="mcp-get" eyebrow="Why connect it" title="What you get" />
          <style>{`
            @keyframes mcp-calls { from { transform: translateX(0) } to { transform: translateX(-100%) } }
            .mcp-calls-track { animation: mcp-calls 48s linear infinite }
            .mcp-calls-rev { animation-direction: reverse }
            .mcp-calls:hover .mcp-calls-track { animation-play-state: paused }
            @media (prefers-reduced-motion: reduce) { .mcp-calls-track { animation: none } }
          `}</style>
          <Reveal y={16} delay={0.05} className="mt-10">
            <div className="relative overflow-hidden rounded-section px-4 pb-10 pt-12 text-center sm:px-10 sm:pt-14">
              <StageLight />
              <h3 className="relative text-balance text-2xl font-bold tracking-tight text-sand-900 sm:text-3xl dark:text-sand-50">
                Your agent works the catalog itself
              </h3>
              <p className="relative mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-sand-600 dark:text-sand-400">
                It searches, pulls the source and checks the result, one tool call at a time.
              </p>
              <div className="relative mt-8 space-y-2">
                {CALL_ROWS.map((calls, i) => (
                  <CallRow key={i} calls={calls} reverse={i === 1} />
                ))}
              </div>
            </div>
          </Reveal>
          {/* Two across from sm, three from lg: at tablet width a third of the
              column would leave the body a narrow strip. */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((card, i) => (
              <Reveal key={card.title} delay={(i % 3) * 0.08} className="h-full">
                <div className={`h-full p-6 sm:p-8 ${CARD}`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-inset border border-sand-300 bg-sand-50 text-sand-700 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-200">
                    {card.icon}
                  </div>
                  <h3 className="mt-6 text-lg font-bold tracking-tight text-sand-900 dark:text-sand-50">{card.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-sand-600 dark:text-sand-400">{card.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Try it prompts ── plain sentences, not buttons: they are
            examples to read, so nothing here looks clickable. */}
        <section aria-labelledby="mcp-prompts" className="mx-auto mt-20 max-w-4xl sm:mt-32">
          <SectionHead id="mcp-prompts" eyebrow="Examples" title="Try these prompts after installing" />
          <Reveal y={16} delay={0.05} className="mt-10">
            <ul className="grid gap-3 sm:grid-cols-2">
              {PROMPTS.map((prompt) => (
                <li
                  key={prompt}
                  className="flex items-start gap-3 rounded-card border border-sand-200 bg-sand-100 px-5 py-4 text-[15px] leading-relaxed text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300"
                >
                  <Sparkle
                    size={16}
                    aria-hidden
                    className="mt-1 shrink-0 text-accent"
                  />
                  <span>{prompt}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <section aria-labelledby="mcp-faq" className="mx-auto mt-20 max-w-4xl sm:mt-32">
          <SectionHead id="mcp-faq" eyebrow="Questions" title="MCP questions, answered" />
          <div className="mt-8">
            <FaqRows items={MCP_FAQ} idPrefix="mcp-faq-row" />
          </div>
        </section>

        {/* The homepage's closing words. Not <SiteCta />: its second button
            leads back to this page. */}
        <CtaBand eyebrow="Ready to build?" title="Start with the source, not a blank prompt.">
          <Link href="/components" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
            Browse components
            <ArrowRight size={14} />
          </Link>
          <Link href="/design-systems/andromeda-pro" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
            Explore Andromeda Pro
          </Link>
        </CtaBand>
      </PageShell>
    </>
  )
}
