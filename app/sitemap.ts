import type { MetadataRoute } from 'next'
import { COMPONENTS } from './lib/component-registry'
import { CATEGORIES } from './lib/categories'
import { COLLECTIONS, collectionMembers } from './lib/collections'
import { SITE_URL } from './lib/config'
import { ANDROMEDA_COMPONENT_META } from './_lib/andromeda/andromeda-meta'
import { DESIGN_SYSTEMS } from '../scripts/lib/design-systems.config.mjs'

// No `lastModified`. Every entry used to emit `new Date()`, i.e. the build
// timestamp, so all 154 URLs claimed to change on every deploy. Google only
// trusts lastmod when it is verifiably accurate, and a value that is provably
// wrong on every URL teaches it to ignore the field sitewide. Omitting it is
// valid and honest. To restore a real signal, commit a per-slug date map
// (generated from git history at authoring time, not at build time: Vercel
// shallow-clones, so `git log` for a path is unreliable during a build).
export default function sitemap(): MetadataRoute.Sitemap {
  const componentPages: MetadataRoute.Sitemap = COMPONENTS.map((c) => ({
    url: `${SITE_URL}/components/${c.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/components/category/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  // Only list collections that actually render (the page 404s below 3
  // members), so the sitemap never advertises a URL that would 404.
  const collectionPages: MetadataRoute.Sitemap = COLLECTIONS.filter(
    (c) => collectionMembers(c, COMPONENTS).length >= 3,
  ).map((c) => ({
    url: `${SITE_URL}/components/collection/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Design systems. Each system's canonical landing is its bare root
  // (/design-systems/<slug>), followed by /foundation and the /components grid
  // and its template routes. Generated from the shared config so new systems
  // and templates land in the sitemap automatically.
  const designSystemPages: MetadataRoute.Sitemap = DESIGN_SYSTEMS.flatMap(
    (s: { slug: string; templates?: { slug: string }[] }) => [
      {
        url: `${SITE_URL}/design-systems/${s.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/design-systems/${s.slug}/foundation`,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/design-systems/${s.slug}/components`,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      ...(s.templates ?? []).map((t) => ({
        url: `${SITE_URL}/design-systems/${s.slug}/templates/${t.slug.replace(
          new RegExp(`^${s.slug}-`),
          '',
        )}`,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ],
  )

  // Andromeda per-component pages (/design-systems/andromeda/<component>).
  const andromedaComponentPages: MetadataRoute.Sitemap = ANDROMEDA_COMPONENT_META.map(
    (c: { slug: string }) => ({
      url: `${SITE_URL}/design-systems/andromeda/${c.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }),
  )

  return [
    {
      url: SITE_URL,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/components`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/pricing`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/faq`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/mcp`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/lab`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...designSystemPages,
    ...categoryPages,
    ...collectionPages,
    ...componentPages,
    ...andromedaComponentPages,
  ]
}
