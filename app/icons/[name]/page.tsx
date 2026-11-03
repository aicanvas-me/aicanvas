import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ICON_CATEGORY_LABELS } from '../_lib/categories'
import { iconLead, titleCase } from '../_lib/icon-utils'
import { iconMarkdown } from '../_lib/markdown'
import { buildSvg } from '../_lib/svg'
import { getIcon, icons, readLineIcons, suggestedIcons } from '../_lib/server-data'
import { IconDetail } from '../_components/IconDetail'

export function generateStaticParams() {
  return icons.map((icon) => ({ name: icon.name }))
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params
  const icon = getIcon(name)
  if (!icon) return { title: 'Icon not found' }
  const title = `${titleCase(icon.name)} Icon for React and SVG`
  const description = iconLead(icon, ICON_CATEGORY_LABELS[icon.category])
  return { title, description, alternates: { canonical: `/icons/${icon.name}` } }
}

export default async function IconPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const icon = getIcon(name)
  if (!icon) notFound()

  const line = await readLineIcons()
  const suggestions = suggestedIcons(icon, 12)
  const categoryIcons = icons
    .filter((candidate) => candidate.category === icon.category)
    .sort((a, b) => a.name.localeCompare(b.name))
  const index = categoryIcons.findIndex((candidate) => candidate.name === icon.name)
  const previousMeta = index > 0 ? categoryIcons[index - 1] : undefined
  const nextMeta = index < categoryIcons.length - 1 ? categoryIcons[index + 1] : undefined
  const currentSvg = buildSvg(line[icon.name], 24, 'regular')

  return (
    <IconDetail
      icon={icon}
      lineIcons={{ [icon.name]: line[icon.name] }}
      suggestions={suggestions.map((suggestion) => ({ ...suggestion, markup: line[suggestion.name] }))}
      previous={previousMeta ? { ...previousMeta, markup: line[previousMeta.name] } : undefined}
      next={nextMeta ? { ...nextMeta, markup: line[nextMeta.name] } : undefined}
      markdown={iconMarkdown(icon, currentSvg)}
    />
  )
}

