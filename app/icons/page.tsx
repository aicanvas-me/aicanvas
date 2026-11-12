import type { Metadata } from 'next'
import { SITE_URL } from '@/app/lib/config'
import { pageMetadata } from '@/app/lib/page-metadata'
import { ICON_CATEGORIES, ICON_COUNT, isIconCategory } from './_lib/categories'
import { icons, readLineIcons } from './_lib/server-data'
import { IconsOverview } from './_components/IconsOverview'

export const metadata: Metadata = pageMetadata({
  title: `${ICON_COUNT} Icons for React and AI Agents`,
  social: `AI Canvas Icons: ${ICON_COUNT} icons for React and AI agents`,
  description: `Browse ${ICON_COUNT} interface icons in four styles, customize their size, weight and colour, then copy SVG or React usage.`,
  url: `${SITE_URL}/icons`,
})

export default async function IconsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: rawCategory } = await searchParams
  const category = isIconCategory(rawCategory) ? rawCategory : undefined
  const filtered = category ? icons.filter((icon) => icon.category === category) : icons
  const allLineIcons = await readLineIcons()
  // The first category is the complete above-the-fold server preview. Every
  // link still ships in HTML; the remaining line drawings hydrate from the
  // public style file rather than duplicating 700 paths in HTML and RSC.
  const serverPreview = category
    ? filtered
    : filtered.filter((icon) => icon.category === ICON_CATEGORIES[0][0])
  const lineIcons = Object.fromEntries(serverPreview.map((icon) => [icon.name, allLineIcons[icon.name]]))

  return (
    <IconsOverview
      icons={filtered.map(({ name, category: iconCategory, isNew }) => ({ name, category: iconCategory, isNew }))}
      lineIcons={lineIcons}
      loadFullLine={!category}
      category={category}
    />
  )
}
