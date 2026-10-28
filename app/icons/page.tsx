import type { Metadata } from 'next'
import { isIconCategory } from './_lib/categories'
import { icons, readLineIcons } from './_lib/server-data'
import { IconsOverview } from './_components/IconsOverview'

export const metadata: Metadata = {
  title: '821 Icons for React and AI Agents',
  description: 'Browse 821 interface icons in four styles, customize their size, stroke and colour, then copy SVG or React usage.',
}

export default async function IconsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: rawCategory } = await searchParams
  const category = isIconCategory(rawCategory) ? rawCategory : undefined
  const filtered = category ? icons.filter((icon) => icon.category === category) : icons
  const lineIcons = await readLineIcons()

  return <IconsOverview icons={filtered} lineIcons={lineIcons} category={category} />
}
