import 'server-only'
import { classifyContent, type ContentLookup, type ContentType } from './content-type'
import { loadContentLookup } from './lookup'

/**
 * Who may install a registry slug, worded for agents. Comes from the /r gate's
 * own manifest and classifier, so no public text ever promises an install the
 * gate refuses. Used by llms.txt and the markdown twins.
 */
export function installTier(slug: string, lookup: ContentLookup = loadContentLookup()): string {
  const type = classifyContent(slug, lookup)
  if (type === 'meta') return 'no account needed'
  if (type === 'standalone' || type === 'design-system-component') return 'free account'
  return 'Premium, requires an AI Canvas token'
}

/**
 * The design system a slug belongs to, if any. The longest system name a slug
 * starts with owns it, so Legacy's `andromeda-` never claims `andromeda-pro-`.
 */
export function systemOfSlug(slug: string, lookup: ContentLookup = loadContentLookup()): string | undefined {
  return [...lookup.systemSlugs]
    .filter((sys) => slug.startsWith(`${sys}-`))
    .sort((a, b) => b.length - a.length)[0]
}

/**
 * Is this slug closed (premium) content? The one predicate every public
 * surface that renders a component must ask before it ships source or the
 * full prompt: the component page and its markdown twin both read it here,
 * so the two can never disagree about what a signed-out visitor may see.
 *
 * A degraded lookup (missing manifest) fails closed: treated as premium, so
 * nothing ever claims "free and open source" over closed content.
 */
export function classifyPremium(slug: string): { contentType: ContentType; isPremium: boolean } {
  const lookup = loadContentLookup()
  const contentType = classifyContent(slug, lookup)
  return {
    contentType,
    isPremium:
      lookup.degraded === true ||
      contentType === 'premium-standalone' ||
      contentType === 'design-system' ||
      contentType === 'template',
  }
}
