import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import iconsJson from '../_data/icons.generated.json'
import type { IconMarkupMap, IconMeta } from './types'

export const icons = iconsJson as IconMeta[]

export async function readLineIcons(): Promise<IconMarkupMap> {
  const source = await readFile(join(process.cwd(), 'public/icons-data/line.json'), 'utf8')
  return JSON.parse(source) as IconMarkupMap
}

export function getIcon(name: string): IconMeta | undefined {
  return icons.find((icon) => icon.name === name)
}

export function suggestedIcons(icon: IconMeta, limit = 24): IconMeta[] {
  const tagSet = new Set(icon.tags.map((tag) => tag.toLowerCase()))
  return icons
    .filter((candidate) => candidate.name !== icon.name)
    .map((candidate) => ({
      candidate,
      shared: candidate.tags.reduce((score, tag) => score + (tagSet.has(tag.toLowerCase()) ? 1 : 0), 0),
      sameCategory: candidate.category === icon.category,
    }))
    .sort((a, b) =>
      b.shared - a.shared ||
      Number(b.sameCategory) - Number(a.sameCategory) ||
      a.candidate.name.localeCompare(b.candidate.name),
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate)
}

