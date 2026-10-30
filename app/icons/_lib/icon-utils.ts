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

// A solid style's markup comes wrapped in <g data-fit="cx cy l"> (scripts/icons-data.mjs):
// the centre and long side of the solid, drawn at a line weight of 2. At another
// weight w it scales about that centre by (l + w - 2) / l, so its outer edge moves
// as a line's does; at 2 the wrapper is dropped and the markup is the file's.
export function fitMarkup(markup: string, weight: number): string {
  const m = markup.match(/^<g data-fit="(-?[\d.]+) (-?[\d.]+) ([\d.]+)">([\s\S]*)<\/g>$/)
  if (!m) return markup
  const [cx, cy, l] = [Number(m[1]), Number(m[2]), Number(m[3])]
  if (!Number.isFinite(weight) || Math.abs(weight - 2) < 1e-6 || !(l > 0)) return m[4]
  const k = (l + weight - 2) / l
  const r = (v: number) => Number(v.toFixed(4))
  return `<g transform="matrix(${r(k)} 0 0 ${r(k)} ${r(cx * (1 - k))} ${r(cy * (1 - k))})">${m[4]}</g>`
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

export function variantProp(style: IconStyle): string {
  return style === 'line' ? '' : ` variant="${style}"`
}
