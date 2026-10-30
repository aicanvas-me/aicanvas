import type { IconMeta, IconStyle } from './types'

export const ICON_STYLES: { id: IconStyle; label: string; shortLabel: string; tier: 'Free' | 'Premium' }[] = [
  { id: 'line', label: 'Line', shortLabel: 'Line', tier: 'Free' },
  { id: 'duotone', label: 'Duotone', shortLabel: 'Duotone', tier: 'Premium' },
  { id: 'solid', label: 'Solid', shortLabel: 'Solid', tier: 'Premium' },
  { id: 'solid-duotone', label: 'Solid duotone', shortLabel: 'Solid duo', tier: 'Premium' },
]

export const DEFAULT_COLOUR = '#f5f3ff'

export function titleCase(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function pascalCase(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

export function effectiveStrokeWidth(size: number, strokeWidth: number, absolute = true): number {
  if (!absolute) return strokeWidth
  return Number(((strokeWidth * 24) / size).toFixed(4))
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
}

export function iconLead(icon: IconMeta, categoryLabel: string): string {
  return `${titleCase(icon.name)} is an icon for ${categoryLabel} interfaces, available in four styles.`
}

// The solid styles are filled shapes with a fixed weight: strokeWidth and
// absoluteStrokeWidth do not change them.
export function takesStroke(style: IconStyle): boolean {
  return style === 'line' || style === 'duotone'
}

export function variantProp(style: IconStyle): string {
  return style === 'line' ? '' : ` variant="${style}"`
}
