import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HomeClient } from '../../HomeClient'
// Registry-free metadata so collection pages never bundle the heavy registry.
import { COMPONENT_META } from '../../../lib/component-meta.generated'
import {
  COLLECTIONS,
  collectionMembers,
  getCollectionBySlug,
} from '../../../lib/collections'
import { SITE_URL } from '../../../lib/config'
import { buildItemListJsonLd } from '../../../lib/jsonld'
import { buildBreadcrumbJsonLd, pageMetadata } from '../../../lib/page-metadata'

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const collection = getCollectionBySlug(slug)
  if (!collection) return {}

  return pageMetadata({
    title: { absolute: collection.title },
    social: collection.title,
    description: collection.description,
    url: `${SITE_URL}/components/collection/${collection.slug}`,
    imageAlt: `AI Canvas: ${collection.h1}`,
  })
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const collection = getCollectionBySlug(slug)
  if (!collection) notFound()

  const members = collectionMembers(collection, COMPONENT_META)
  // A collection below 3 members would ship a skeleton page; 404 instead.
  if (members.length < 3) notFound()

  const url = `${SITE_URL}/components/collection/${collection.slug}`

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Components & Blocks', item: `${SITE_URL}/components` },
    { name: collection.h1, item: url },
  ])

  const itemListJsonLd = buildItemListJsonLd({
    name: collection.h1,
    description: collection.intro,
    items: members,
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
        components={members}
        categoryLabel={collection.h1}
        heading={{ h1: collection.h1, intro: collection.intro }}
      />
    </>
  )
}
