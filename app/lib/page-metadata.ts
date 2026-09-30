// Shared page head: the OG card every page carries, and the listing pages'
// BreadcrumbList JSON-LD.

import type { Metadata } from 'next'

const OG_IMAGE = '/og-aug2026-aicanvas.me.png'
const OG_ALT =
  'AI Canvas: AI native components, design systems, blocks, templates and skills'

/**
 * Title, description, canonical and the shared OG image in one shape. `social`
 * titles the OG and Twitter cards, which name the site where the title does not.
 */
export function pageMetadata({
  title,
  social,
  description,
  url,
  imageAlt = OG_ALT,
}: {
  title: Metadata['title']
  social: string
  description: string
  url: string
  imageAlt?: string
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: social,
      description,
      url,
      type: 'website',
      images: [
        {
          url: OG_IMAGE,
          width: 2400,
          height: 1260,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: social,
      description,
      images: [OG_IMAGE],
    },
  }
}

export function buildBreadcrumbJsonLd(
  crumbs: readonly { name: string; item: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.item,
    })),
  }
}
