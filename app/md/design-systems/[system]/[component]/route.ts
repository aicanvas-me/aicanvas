import { systemComponentMarkdown, systemMarkdown } from '@/lib/agent-markdown/design-system'
import { markdownResponse } from '@/lib/agent-markdown/response'
import { installTier } from '@/lib/registry/premium-gate'
import { nextInOrder } from '@/app/lib/related-order'
import { SITE_URL } from '@/app/lib/config'
import {
  isPaidSystem,
  overviewAliases,
  systemComponents,
  systemInput,
  systemPrompt,
  systemPropTables,
  systemSlugs,
} from '../../_systems'

// Markdown twin of /design-systems/<system>/<component>. The system's other
// pages (system, brain, foundation, ...) share this URL shape, so a markdown
// request for one of them is answered with the system overview instead of 404.
// Static and anonymous: never reads a session, so a Pro prompt is always cut
// to its public head, exactly as a signed-out visitor sees it.
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return systemSlugs().flatMap((system) => [
    ...systemComponents(system).map((c) => ({ system, component: c.slug })),
    ...overviewAliases(system).map((component) => ({ system, component })),
  ])
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ system: string; component: string }> },
) {
  const { system, component } = await params
  if (overviewAliases(system).includes(component)) {
    const input = systemInput(system)
    return input ? markdownResponse(systemMarkdown(input)) : new Response('Not found\n', { status: 404 })
  }

  const components = systemComponents(system)
  const entry = components.find((c) => c.slug === component)
  const overview = systemInput(system)
  if (!entry || !overview) return new Response('Not found\n', { status: 404 })

  return markdownResponse(
    systemComponentMarkdown({
      system: { slug: system, name: overview.name, paid: isPaidSystem(system) },
      component: entry,
      installTier: installTier(entry.registrySlug),
      propTables: systemPropTables(system, component),
      prompt: systemPrompt(system, component),
      related: nextInOrder(components, component).slice(0, 5),
      siteUrl: SITE_URL,
    }),
  )
}
