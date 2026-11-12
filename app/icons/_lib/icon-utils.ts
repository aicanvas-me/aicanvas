import type { IconMeta, IconStyle } from './types'

export const ICON_STYLES: { id: IconStyle; label: string; shortLabel: string; tier: 'Free' | 'Premium' }[] = [
  { id: 'line', label: 'Line', shortLabel: 'Line', tier: 'Free' },
  { id: 'duotone', label: 'Duotone', shortLabel: 'Duotone', tier: 'Premium' },
  { id: 'solid', label: 'Solid', shortLabel: 'Solid', tier: 'Premium' },
  { id: 'solid-duotone', label: 'Solid duotone', shortLabel: 'Solid duo', tier: 'Premium' },
]

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'extrabold'

// IconBase's weights as stroke widths in viewBox units, so the line scales
// with the size. Each is x1.01 so a line never lands on exactly one device
// pixel, which Chrome draws as broken dots. Keep in step with IconBase.
export const ICON_WEIGHTS: { id: IconWeight; label: 'Thin' | 'Light' | 'Regular' | 'Bold' | 'Extra Bold'; stroke: number }[] = [
  { id: 'thin', label: 'Thin', stroke: 0.7575 },
  { id: 'light', label: 'Light', stroke: 1.13625 },
  { id: 'regular', label: 'Regular', stroke: 1.515 },
  { id: 'bold', label: 'Bold', stroke: 1.89375 },
  { id: 'extrabold', label: 'Extra Bold', stroke: 2.2725 },
]

export function weightStroke(weight: IconWeight): number {
  return (ICON_WEIGHTS.find((entry) => entry.id === weight) ?? ICON_WEIGHTS[2]).stroke
}

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
    .replace(/^(\d)/, 'Icon$1')
}

export function iconLead(icon: IconMeta, categoryLabel: string): string {
  return `${titleCase(icon.name)} is an icon for ${categoryLabel} interfaces, available in four styles.`
}

// The solid styles are filled shapes with a fixed weight: weight does not
// change them.
export function takesStroke(style: IconStyle): boolean {
  return style === 'line' || style === 'duotone'
}

export function iconFileName(name: string, style: IconStyle): string {
  return style === 'line' ? name : `${name}-${style}`
}

export function iconComponentName(name: string, style: IconStyle): string {
  return pascalCase(iconFileName(name, style))
}
