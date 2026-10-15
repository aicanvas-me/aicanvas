import { COMPONENT_META } from '@/app/lib/component-meta.generated'
import { SITE_URL } from '@/app/lib/config'
import { homeMarkdown } from '@/lib/agent-markdown/site'
import { markdownResponse } from '@/lib/agent-markdown/response'
import { installTier } from '@/lib/registry/premium-gate'
import { isPaidSystem, systemInput, systemSlugs } from '../design-systems/_systems'

// Markdown twin of the home page (/ and /index.md). Built from live data, not
// from the hero copy, so it stays true while the home page is redesigned.
export const dynamic = 'force-static'

export function GET() {
  const systems = systemSlugs()
    .map((slug) => systemInput(slug))
    .filter((s) => s !== null)
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      paid: isPaidSystem(s.slug),
      componentCount: s.components.length,
      templateCount: s.templates.length,
      installTier: installTier(s.slug),
    }))

  return markdownResponse(homeMarkdown({ siteUrl: SITE_URL, systems, standaloneCount: COMPONENT_META.length }))
}
