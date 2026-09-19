import type { Metadata } from 'next'
import { HomeClient } from './HomeClient'
// Registry-free metadata so the grid never bundles the heavy registry
// (three.js etc.); mirrors COMPONENTS.map(toMeta).
import { COMPONENT_META } from '../lib/component-meta.generated'
import { getCategoryByLabel, COMPONENTS_SECTION_OVERLINE } from '../lib/categories'
import { SITE_URL } from '../lib/config'

const INDEX_TITLE = `All Components: Browse ${COMPONENT_META.length} Animated React Components`
const INDEX_DESCRIPTION = `Browse all ${COMPONENT_META.length} components in the AI Canvas registry: animated cards, glass morphism, backgrounds, buttons, and more. Each installable via the shadcn CLI.`

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}): Promise<Metadata> {
  const { category } = await searchParams
  // When the legacy ?category= filter is in use, point the canonical at the
  // new /components/category/<slug> page so Google doesn't index the query
  // variant as a duplicate of /components.
  const cat = category ? getCategoryByLabel(category) : undefined
  const canonical = cat
    ? `${SITE_URL}/components/category/${cat.slug}`
    : `${SITE_URL}/components`

  return {
    title: { absolute: INDEX_TITLE },
    description: INDEX_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      title: INDEX_TITLE,
      description: INDEX_DESCRIPTION,
      url: `${SITE_URL}/components`,
      type: 'website',
      images: [
        {
          url: '/og-aug2026-aicanvas.me.png',
          width: 2400,
          height: 1260,
          alt: 'AI Canvas: AI native components, design systems, blocks, templates and skills',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: INDEX_TITLE,
      description: INDEX_DESCRIPTION,
      images: ['/og-aug2026-aicanvas.me.png'],
    },
  }
}

export default async function ComponentsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const filtered =
    category && category !== 'All Components'
      ? COMPONENT_META.filter((c) => c.tags.some((t) => t.accent && t.label === category))
      : COMPONENT_META

  const mitCount = COMPONENT_META.filter((c) => c.badge !== 'Premium').length

  // The legacy ?category= filter shows a subset, so the all-components heading
  // would misdescribe the page; that variant canonicalises to the category page.
  const heading =
    category && category !== 'All Components'
      ? undefined
      : {
          overline: COMPONENTS_SECTION_OVERLINE,
          h1: 'One command installs it. One prompt rebuilds it.',
          // The count and the licence must agree: injected premium entries also
          // sit in the grid, and they are not MIT.
          intro: `${mitCount} standalone React components and blocks, MIT, built with Tailwind CSS and Motion. Every one installs with the shadcn CLI and ships a remix prompt written for AI coding tools, so you or your agent can drop it in or make it yours.`,
        }

  return <HomeClient components={filtered} heading={heading} />
}
