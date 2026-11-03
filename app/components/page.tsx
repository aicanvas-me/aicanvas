import type { Metadata } from 'next'
import { HomeClient } from './HomeClient'
// Registry-free metadata so the grid never bundles the heavy registry
// (three.js etc.); mirrors COMPONENTS.map(toMeta).
import { COMPONENT_META } from '../lib/component-meta.generated'
import { getCategoryByLabel } from '../lib/categories'
import { SITE_URL } from '../lib/config'

const INDEX_TITLE = `React Component Library: ${COMPONENT_META.length} shadcn Components | AI Canvas`
const INDEX_DESCRIPTION = `Browse ${COMPONENT_META.length} standalone shadcn components and blocks for React, from backgrounds and glass to 3D and buttons. Install with the shadcn CLI or MCP.`

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

  // The legacy ?category= filter shows a subset, so the all-components heading
  // would misdescribe the page; that variant canonicalises to the category page.
  const heading =
    category && category !== 'All Components'
      ? undefined
      : {
          h1: `React Component Library: ${COMPONENT_META.length} shadcn Components`,
          intro:
            'AI agents can install these standalone React components and blocks with the shadcn CLI or MCP, and each includes a remix prompt.',
        }

  return <HomeClient components={filtered} heading={heading} />
}
