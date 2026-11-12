import type { MetadataRoute } from 'next'
import { COMPONENTS } from './lib/component-registry'
import { CATEGORIES } from './lib/categories'
import { COLLECTIONS, collectionMembers } from './lib/collections'
import { SITE_URL } from './lib/config'
import { ANDROMEDA_COMPONENT_META } from './_lib/andromeda/andromeda-meta'
import { ANDROMEDA_COMPONENT_META as ANDROMEDA_PRO_COMPONENT_META } from './_lib/andromeda-pro/andromeda-meta'
import { availableDesignSystems } from './lib/available-design-systems'
import { DOC_PAGES } from './docs/_lib/nav'
import { icons } from './icons/_lib/server-data'
import SITEMAP_DATES from './lib/sitemap-dates.json'

// Real per-page dates from git, written at commit time by scripts/sitemap-dates.mjs.
// Never new Date(): a build-time date on every URL teaches Google to ignore lastmod.
const DATES: Record<string, string> = SITEMAP_DATES

export default function sitemap(): MetadataRoute.Sitemap {
  return entries().map((entry) => {
    const date = DATES[entry.url.slice(SITE_URL.length) || '/']
    return date ? { ...entry, lastModified: date } : entry
  })
}

function entries(): MetadataRoute.Sitemap {
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
  // Each system lists only the section routes it actually has. Andromeda Legacy
  // ships /system; Andromeda Pro ships /foundation and /components. Emitting one
  // system's IA for both advertised URLs that 404.
  const SYSTEM_SECTIONS: Record<string, string[]> = {
    andromeda: ['system'],
    'andromeda-pro': ['foundation', 'components', 'image-pack'],
  }
  const designSystemPages: MetadataRoute.Sitemap = availableDesignSystems().flatMap(
    (s: { slug: string; templates?: { slug: string }[] }) => [
      {
        url: `${SITE_URL}/design-systems/${s.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      ...(SYSTEM_SECTIONS[s.slug] ?? []).map((section) => ({
        url: `${SITE_URL}/design-systems/${s.slug}/${section}`,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
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

  // Per-component pages, each system under its own prefix. Pairing Pro's list
  // with Legacy's prefix put 15 dead URLs in the sitemap.
  const andromedaComponentPages: MetadataRoute.Sitemap = [
    ...ANDROMEDA_COMPONENT_META.map((c: { slug: string }) => `/design-systems/andromeda/${c.slug}`),
    ...ANDROMEDA_PRO_COMPONENT_META.map((c: { slug: string }) => `/design-systems/andromeda-pro/${c.slug}`),
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

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
      url: `${SITE_URL}/icons`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...icons.map((icon) => ({
      url: `${SITE_URL}/icons/${icon.name}`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    ...DOC_PAGES.map((p) => ({
      url: `${SITE_URL}${p.href}`,
      changeFrequency: 'monthly' as const,
      priority: p.href === '/docs' ? 0.7 : 0.6,
    })),
    ...designSystemPages,
    ...categoryPages,
    ...collectionPages,
    ...componentPages,
    ...andromedaComponentPages,
  ]
}
