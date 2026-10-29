import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  ArrowsClockwise,
  Package,
  PlugsConnected,
  Sparkle,
  Terminal,
} from '@phosphor-icons/react/dist/ssr'
import { InstallCards } from './InstallCards'
import { buttonClasses } from '../components/buttonClasses'
import { FaqRows } from '../components/FaqRows'
import { CARD, CtaBand, PageHero, PageShell, SectionHead } from '../components/PageKit'
import { Reveal } from '../home/Reveal'
import { SITE_URL } from '../lib/config'
import { MCP_FAQ, faqJsonLd } from '../lib/faq'

export const metadata: Metadata = {
  title: 'AI Canvas MCP: shadcn Components for Claude Code, Cursor, Codex',
  description:
    'Connect Claude Code, Cursor or Codex to AI Canvas components and design systems through MCP. Your agent installs editable React source with shadcn.',
  alternates: { canonical: `${SITE_URL}/mcp` },
  openGraph: {
    title: 'AI Canvas MCP connects Claude Code, Codex, and Cursor',
    description:
      'Connect Claude Code, Cursor, or Codex to browse, inspect, and install AI Canvas components, design systems, and templates as editable source with shadcn.',
    url: `${SITE_URL}/mcp`,
  },
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
    icon: <Terminal weight="regular" size={18} />,
  },
  {
    title: 'No more from-scratch UI',
    body: 'Instead of generating UI from zero, your agent pulls a real component with full source, the design spec, and Framer Motion.',
    icon: <Package weight="regular" size={18} />,
  },
  {
    title: 'Always current',
    body: 'The server fetches from the live registry at runtime, so new components reach your agent about five minutes after they ship.',
    icon: <ArrowsClockwise weight="regular" size={18} />,
  },
]

const PROMPTS = [
  'Use AI Canvas to show me what categories of components are available.',
  'Add the task cards from AI Canvas to my dashboard and match my dark theme.',
  'My hero section feels boring. Find something animated in AI Canvas to fix it.',
  'I need an animated background for my landing page. Find me a good one in AI Canvas.',
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
            <PlugsConnected weight="regular" size={12} className="text-olive-600 dark:text-olive-400" aria-hidden />
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

        {/* ── Install ── the setup comes first: it is what the page is for. */}
        <section aria-labelledby="mcp-install" className="mx-auto mt-16 max-w-4xl sm:mt-24">
          <SectionHead id="mcp-install" eyebrow="Setup" title="How to install the MCP" />
          {/* Not in a Reveal: its resting transform would become the
              containing block of the fixed copy toast and pin it inside the
              card instead of the viewport. */}
          <div className="mt-10">
            <InstallCards />
          </div>
        </section>

        {/* ── What you get ── */}
        <section aria-labelledby="mcp-get" className="mx-auto mt-20 max-w-6xl sm:mt-32">
          <SectionHead id="mcp-get" eyebrow="Why connect it" title="What you get" />
          {/* Three across only from lg: at tablet width a third of the column
              leaves the body a narrow strip of six or seven lines. */}
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {BENEFITS.map((card, i) => (
              <Reveal key={card.title} delay={i * 0.08} className="h-full">
                <div className={`relative h-full overflow-hidden p-6 sm:p-8 ${CARD}`}>
                  {/* One soft olive light on the middle card, so the row has a
                      centre without any card claiming more weight. */}
                  {i === 1 && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-olive-400/35 blur-3xl dark:bg-olive-500/20"
                    />
                  )}
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-sand-300 bg-sand-50 text-sand-700 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-200">
                    {card.icon}
                  </div>
                  <h3 className="relative mt-6 text-lg font-bold tracking-tight text-sand-900 dark:text-sand-50">
                    {card.title}
                  </h3>
                  <p className="relative mt-2 text-[15px] leading-relaxed text-sand-600 dark:text-sand-400">
                    {card.body}
                  </p>
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
                  className="flex items-start gap-3 rounded-2xl border border-sand-200 bg-sand-100 px-5 py-4 text-[15px] leading-relaxed text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300"
                >
                  <Sparkle
                    weight="regular"
                    size={16}
                    aria-hidden
                    className="mt-1 shrink-0 text-olive-600 dark:text-olive-400"
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
            <ArrowRight weight="regular" size={14} />
          </Link>
          <Link href="/design-systems/andromeda-pro" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
            Explore Andromeda Pro
          </Link>
        </CtaBand>
      </PageShell>
    </>
  )
}
