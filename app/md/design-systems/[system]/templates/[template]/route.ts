import { systemTemplateMarkdown } from '@/lib/agent-markdown/design-system'
import { markdownResponse } from '@/lib/agent-markdown/response'
import { systemInput, systemSlugs } from '../../../_systems'
import { installedDependencies, installedUsage } from '../../../../_installed'

// Markdown twin of /design-systems/<system>/templates/<template>. Static and
// anonymous like every twin: the signed-out view, never the source.
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return systemSlugs().flatMap((system) =>
    (systemInput(system)?.templates ?? []).map((t) => ({ system, template: t.folder })),
  )
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ system: string; template: string }> },
) {
  const { system, template } = await params
  const input = systemInput(system)
  const entry = input?.templates.find((t) => t.folder === template)
  if (!input || !entry) return new Response('Not found\n', { status: 404 })
  const bySlug = new Map(input.components.map((c) => [c.registrySlug, c]))
  // The install also writes what its components depend on (User Card brings Avatar).
  const all = new Set(installedDependencies(entry.registrySlug))
  for (const d of all) if (bySlug.has(d)) installedDependencies(d).forEach((n) => all.add(n))
  const deps = [...all]
  return markdownResponse(
    systemTemplateMarkdown({
      system: { slug: system, name: input.name, paid: input.paid },
      template: entry,
      others: input.templates.filter((t) => t.folder !== template),
      uses: deps.flatMap((d) => bySlug.get(d) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
      iconCount: deps.filter((d) => d.startsWith('icon-')).length,
      withTokens: deps.includes(`${system}-tokens`),
      usage: installedUsage(entry.registrySlug, 'index'),
      siteUrl: input.siteUrl,
    }),
  )
}
