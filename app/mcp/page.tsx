import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkle } from '@phosphor-icons/react/dist/ssr'
import { InstallCards } from './InstallCards'
import { SiteFooter } from '../components/SiteFooter'
import { HeaderSocials } from '../components/HeaderSocials'
import { SITE_URL } from '../lib/config'

export const metadata: Metadata = {
  title: 'MCP Server for Claude Code, Cursor and Codex',
  description:
    'Add production-ready React components to Claude Code, Cursor, and Codex from one MCP server. Source, design specs, and Framer Motion included. Install in seconds.',
  alternates: { canonical: `${SITE_URL}/mcp` },
  openGraph: {
    title: 'AI Canvas MCP connects Claude Code, Codex, and Cursor',
    description:
      'One command gives your AI agent every AI Canvas component, with the design spec and motion built in. Save tokens, stop starting from scratch, adapt in seconds.',
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
    'MCP server that gives Claude Code, Codex, and Cursor access to every AI Canvas React component, with source, design specs, and Framer Motion.',
  url: `${SITE_URL}/mcp`,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'AI Canvas', url: SITE_URL },
}

export default function McpPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── Sticky top bar — h-14 (56px) matches the sidebar logo block ── */}
      <header className="sticky top-0 z-10 hidden h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-sand-200 bg-sand-50 px-6 dark:border-sand-800 dark:bg-sand-950 md:grid">
        <div />
        <Link
          href="/mcp"
          className="text-sm font-semibold text-olive-600 transition-colors hover:text-olive-800 dark:text-olive-500 dark:hover:text-olive-400"
        >
          /MCP
        </Link>
        <div className="flex items-center justify-end">
          <HeaderSocials />
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-4xl px-4 pt-6 pb-8 sm:px-6 sm:pt-12">
        {/* Mobile breadcrumb */}
        <p className="mb-6 text-sm font-semibold md:hidden">
          <span className="text-olive-600 dark:text-olive-500">/MCP</span>
        </p>

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <header className="mb-10 sm:mb-14">
          <h1 className="max-w-xl text-3xl font-extrabold leading-[1.2] tracking-tight sm:text-4xl">
            <span className="block font-normal text-sand-600 dark:text-sand-300">
              AI Canvas MCP connected with
            </span>
            <span className="block text-olive-600 dark:text-olive-500">
              Claude Code, Codex, and Cursor.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-sand-600 dark:text-sand-300">
            Save tokens. Don&rsquo;t start from scratch. Your agent pulls a
            finished component with the design spec and the motion included, and
            you just adapt it to your project. It takes seconds.
          </p>
        </header>

      {/* ── Install cards ────────────────────────────────────────────────── */}
      <InstallCards />

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="mt-14 sm:mt-20">
        <h2 className="text-xl font-bold text-sand-900 dark:text-sand-50">
          What you get
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: 'One command, then forget it',
              body: 'Install the MCP with a single command. After that your agent can search, inspect, and install AI Canvas components on its own.',
            },
            {
              title: 'No more from-scratch UI',
              body: 'Instead of generating UI from zero, your agent pulls a real component with full source, the design spec, and Framer Motion.',
            },
            {
              title: 'Always current',
              body: 'The server fetches from the live registry at runtime, so new components reach your agent about five minutes after they ship.',
            },
          ].map((card, i) => (
            <div
              key={card.title}
              className="relative overflow-hidden rounded-xl border border-sand-200 bg-sand-100 p-5 dark:border-sand-800 dark:bg-sand-900"
            >
              {i === 1 && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-olive-400/35 blur-3xl dark:bg-olive-500/25"
                />
              )}
              <h3 className="relative text-base font-bold text-sand-900 dark:text-sand-50">
                {card.title}
              </h3>
              <p className="relative mt-2 text-sm text-sand-600 dark:text-sand-400">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Try it prompts ───────────────────────────────────────────────── */}
      <section className="mt-14 sm:mt-20">
        <h2 className="text-xl font-bold text-sand-900 dark:text-sand-50">
          Try these prompts after installing
        </h2>
        <ul className="mt-5 space-y-2.5">
          {[
            'Use AI Canvas to show me what categories of components are available.',
            'Add the task cards from AI Canvas to my dashboard and match my dark theme.',
            'My hero section feels boring. Find something animated in AI Canvas to fix it.',
            'I need an animated background for my landing page. Find me a good one in AI Canvas.',
          ].map((prompt) => (
            <li
              key={prompt}
              className="flex items-start gap-2.5 rounded-lg border border-sand-200 bg-sand-100 px-4 py-3 text-sm text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300"
            >
              <Sparkle
                weight="regular"
                size={14}
                className="mt-0.5 shrink-0 text-olive-600 dark:text-olive-500"
              />
              <span>{prompt}</span>
            </li>
          ))}
        </ul>
      </section>

      <SiteFooter />
      </main>
    </>
  )
}
