import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Question } from '@phosphor-icons/react/dist/ssr'
import { SITE_URL } from '../lib/config'
import { FAQ_PAGE_CATEGORIES, faqJsonLd } from '../lib/faq'
import { buttonClasses } from '../components/buttonClasses'
import { CtaBand, PageHero, PageShell } from '../components/PageKit'
import { FaqView, type FaqCategory } from './FaqView'

// The questions live in the one site FAQ (app/lib/faq.ts), shared with the
// homepage, pricing and the AI Brain page, so a repeated question never drifts.
const FAQ_CATEGORIES: FaqCategory[] = FAQ_PAGE_CATEGORIES

const FAQ_DESCRIPTION =
  'Answers about AI Canvas: installing components with the shadcn CLI, the MCP server for AI agents, design systems, plans and Premium pricing, secure payments through Paddle, and remixing with AI. Free to start and open source.'

export const metadata: Metadata = {
  title: 'FAQ',
  description: FAQ_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: 'AI Canvas FAQ',
    description: FAQ_DESCRIPTION,
    url: `${SITE_URL}/faq`,
    type: 'website',
  },
}

const FAQ_JSON_LD = faqJsonLd(FAQ_PAGE_CATEGORIES.flatMap((c) => c.items))

// A server page: the hero and the closing band are static HTML, and FaqView is
// the one client piece (the open rows and the list that follows the reader).
export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <PageShell>
        <PageHero
          pill="FAQ"
          pillIcon={<Question weight="regular" size={12} className="text-olive-600 dark:text-olive-400" aria-hidden />}
          title="Questions, answered."
          sub="Everything worth knowing before you ship your first component. Start free, install with one command, and upgrade only when AI Canvas is already paying off."
        />

        <FaqView categories={FAQ_CATEGORIES} />

        <CtaBand
          eyebrow="Still curious?"
          title="Start free, build now."
          sub="Browse the registry, install with one command, and remix the free library with AI at no cost. Go Premium for the premium components and blocks, their full prompts, and complete design systems."
        >
          <Link href="/components" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
            Browse Components
            <ArrowRight weight="regular" size={14} />
          </Link>
          <Link href="/pricing" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
            See Pricing
          </Link>
        </CtaBand>
      </PageShell>
    </>
  )
}
