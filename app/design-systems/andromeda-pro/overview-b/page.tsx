// Overview variant B ("the deal first, then the proof"): a review page for the
// Andromeda Pro landing redesign, kept out of search. Same shell as the real
// overview: the site theme cookie seeds the Andromeda preview theme.
//
// Everything countable is computed here, on the server, from the same sources
// the components index reads, so no number on the page is typed by hand.
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { readFileSync } from 'fs'
import { join } from 'path'
import { AndromedaThemeWrap } from '../AndromedaThemeWrap'
import { ANDROMEDA_COMPONENT_META } from '../../../_lib/andromeda-pro/andromeda-meta'
import { ANDROMEDA_COMPONENT_META as LEGACY_COMPONENT_META } from '../../../_lib/andromeda/andromeda-meta'
import { CATEGORY } from '../system/categories'
import { COMPONENT_COUNTS } from '../system/component-counts'
import { firstSentence } from '../system/first-sentence'
import { splitProPromptAtPaywall } from '../../../../lib/registry/prompt-blocks'
import { OverviewB } from './OverviewB'
import { TEMPLATES, type Family, type OverviewComponent, type OverviewStats } from './overview-data'

export const metadata: Metadata = {
  title: 'Andromeda Pro Overview B',
  description: 'Review variant of the Andromeda Pro overview.',
  robots: { index: false, follow: false },
}

// The opening prose of one component's remix prompt, for the Remix card. Only
// the free head is read: the same paywall cut the component page applies to a
// visitor without Premium, so this excerpt is text that is already public.
// It stops at the first markdown heading and drops the markdown marks, so it
// reads as prose rather than an unrendered doc. Returns null when the bundle
// is absent (a build without it traced), and the card shows its fallback.
function readPromptExcerpt(sourceName: string): string | null {
  try {
    const raw = readFileSync(join(process.cwd(), 'registry-data', '_andromeda-pro-prompts.json'), 'utf8')
    const { prompts } = JSON.parse(raw) as { prompts: Record<string, string> }
    const full = prompts[sourceName]
    if (!full) return null
    const split = splitProPromptAtPaywall(full)
    if (!split) return null
    const opening = split.head.split(/^#{1,6}\s/m)[0] ?? ''
    const paragraphs = opening
      .replace(/\*\*|__|`/g, '')
      .replace(/\s*[—–]\s*/g, ', ')
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
    return paragraphs.length ? paragraphs.join('\n\n') : null
  } catch {
    return null
  }
}

export default async function AndromedaOverviewBPage() {
  const siteTheme = (await cookies()).get('theme')?.value === 'light' ? 'light' : 'dark'

  // Same card data as the components index page.
  const components: OverviewComponent[] = ANDROMEDA_COMPONENT_META.map((m) => ({
    slug: m.slug,
    name: m.name,
    category: CATEGORY[m.slug] ?? 'Other',
    description: firstSentence(m.description),
    variants: COMPONENT_COUNTS[m.slug]?.variants ?? 0,
    states: COMPONENT_COUNTS[m.slug]?.states ?? 0,
  }))

  // Families in the taxonomy's own order, each counted from the live list.
  const order: string[] = []
  for (const name of Object.values(CATEGORY)) if (!order.includes(name)) order.push(name)
  if (components.some((c) => c.category === 'Other')) order.push('Other')
  const families: Family[] = order
    .map((name) => ({ name, count: components.filter((c) => c.category === name).length }))
    .filter((f) => f.count > 0)

  const stats: OverviewStats = {
    components: components.length,
    variants: Object.values(COMPONENT_COUNTS).reduce((sum, c) => sum + c.variants, 0),
    states: Object.values(COMPONENT_COUNTS).reduce((sum, c) => sum + c.states, 0),
    families: families.length,
    templates: TEMPLATES.length,
    // Dark and light: the two sets andromedaVars() and andromedaLightVars() emit.
    themes: 2,
  }

  return (
    <AndromedaThemeWrap initialTheme={siteTheme}>
      <OverviewB
        components={components}
        families={families}
        stats={stats}
        promptExcerpt={readPromptExcerpt('Button')}
        // Same source the Legacy overview counts from.
        legacyComponents={LEGACY_COMPONENT_META.length}
      />
    </AndromedaThemeWrap>
  )
}
