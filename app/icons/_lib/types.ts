import type { IconCategorySlug } from './categories'

export type IconMeta = {
  name: string
  category: IconCategorySlug
  tags: string[]
  added: string
  isNew: boolean
}

export type IconStyle = 'line' | 'duotone' | 'solid' | 'solid-duotone'
export type IconMarkupMap = Record<string, string>

export type IconWithMarkup = IconMeta & {
  markup: string
}

