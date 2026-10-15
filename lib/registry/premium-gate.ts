import 'server-only'
import { classifyContent, type ContentType } from './content-type'
import { loadContentLookup } from './lookup'

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
