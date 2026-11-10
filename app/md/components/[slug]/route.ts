import { COMPONENTS, isBlockEntry } from '../../../lib/component-registry'
import { rankRelated } from '../../../lib/related-order'
import COMPONENT_ORDER from '../../../../component-order.json'
import { STANDALONE_PROPS } from '../../../lib/standalone-props.generated'
import { SITE_URL } from '../../../lib/config'
import { classifyPremium } from '@/lib/registry/premium-gate'
import { componentMarkdown } from '@/lib/agent-markdown/component'
import { markdownResponse } from '@/lib/agent-markdown/response'

// Markdown twin of /components/[slug]. Reached through the rewrites in
// next.config.ts (/components/<slug>.md, or Accept: text/markdown on the page
// URL); /md/* itself is an internal path. Static and anonymous by design: it
// never reads a session, so it is always the signed-out view of the page.
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return COMPONENTS.map((c) => ({ slug: c.slug }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = COMPONENTS.find((c) => c.slug === slug)
  if (!entry) return new Response('Not found\n', { status: 404 })

  const body = componentMarkdown({
    slug,
    name: entry.name,
    description: entry.description,
    tags: entry.tags,
    isBlock: isBlockEntry(entry),
    designSystem: entry.designSystem,
    code: entry.code,
    prompt: entry.prompts['Claude Code'] ?? Object.values(entry.prompts).find((p): p is string => !!p),
    about: entry.about,
    useCases: entry.useCases,
    propTables: STANDALONE_PROPS[slug] ?? [],
    related: rankRelated(entry, COMPONENTS, COMPONENT_ORDER).slice(0, 5),
    isPremium: classifyPremium(slug).isPremium,
    enforcing: process.env.REGISTRY_ENFORCEMENT === 'enforce',
    freeAccountGate: process.env.FREE_ACCOUNT_GATE === 'on',
    siteUrl: SITE_URL,
  })

  return markdownResponse(body)
}
