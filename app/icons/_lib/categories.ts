import icons from '../_data/icons.generated.json'

export const ICON_CATEGORIES = [
  ['ai-dev', 'AI & Dev'],
  ['interface', 'Interface'],
  ['arrows', 'Arrows'],
  ['objects', 'Objects'],
  ['media', 'Media'],
  ['files', 'Files'],
  ['devices', 'Devices'],
  ['commerce', 'Commerce'],
  ['text', 'Text'],
  ['communication', 'Communication'],
  ['navigation', 'Navigation'],
  ['security', 'Security'],
  ['editing', 'Editing'],
  ['people', 'People'],
  ['time', 'Time'],
  ['layout', 'Layout'],
  ['weather', 'Weather'],
  ['design', 'Design'],
  ['places', 'Places'],
  ['math', 'Math'],
  ['status', 'Status'],
  ['shapes', 'Shapes'],
  ['charts', 'Charts'],
  ['data', 'Data'],
  ['nature', 'Nature'],
] as const

export type IconCategorySlug = (typeof ICON_CATEGORIES)[number][0]

export const ICON_CATEGORY_LABELS = Object.fromEntries(ICON_CATEGORIES) as Record<IconCategorySlug, string>
export const ICON_COUNT = icons.length
export const ICON_CATEGORY_COUNTS = Object.fromEntries(
  ICON_CATEGORIES.map(([slug]) => [slug, icons.filter((icon) => icon.category === slug).length]),
) as Record<IconCategorySlug, number>

export function isIconCategory(value: string | undefined): value is IconCategorySlug {
  return ICON_CATEGORIES.some(([slug]) => slug === value)
}

