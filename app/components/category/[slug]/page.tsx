import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HomeClient } from '../../HomeClient'
// Registry-free metadata so category pages never bundle the heavy registry.
import { COMPONENT_META } from '../../../lib/component-meta.generated'
import { CATEGORIES, getCategoryBySlug } from '../../../lib/categories'
import { SITE_URL } from '../../../lib/config'
import { buildItemListJsonLd } from '../../../lib/jsonld'
import { buildBreadcrumbJsonLd, pageMetadata } from '../../../lib/page-metadata'

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) return {}

  return pageMetadata({
    title: { absolute: category.title },
    social: category.title,
    description: category.description,
    url: `${SITE_URL}/components/category/${category.slug}`,
    imageAlt: `AI Canvas: ${category.h1}`,
  })
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) notFound()

  const filtered = COMPONENT_META.filter((c) =>
    c.tags.some((t) => t.accent && t.label === category.label),
  )

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Components & Blocks', item: `${SITE_URL}/components` },
    {
      name: category.label,
      item: `${SITE_URL}/components/category/${category.slug}`,
    },
  ])

  // Names every component the category actually lists, so the page is
  // described as a collection rather than left to be inferred from the card
  // grid. INITIAL_LOAD (48) is above the largest category, so every item in
  // this list really is rendered on first paint.
  const itemListJsonLd = buildItemListJsonLd({
    name: category.h1,
    description: category.intro,
    items: filtered,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <HomeClient
        components={filtered}
        categoryLabel={category.label}
        heading={{ h1: category.h1, intro: category.intro }}
      />
    </>
  )
}
