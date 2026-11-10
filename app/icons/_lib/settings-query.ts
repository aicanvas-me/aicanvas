import { ICON_STYLES, ICON_WEIGHTS, type IconWeight } from './icon-utils'
import type { IconStyle } from './types'

// The look of an icon as a query string, so the overview's choices carry into
// the icon page and the icon page's URL can be shared as it looks.

export type IconSettings = {
  style: IconStyle
  size: number
  weight: IconWeight
  /** The picked colour, or null for the theme's own ink. */
  colour: string | null
}

// The icon page's slider ranges.
const SIZE_MIN = 16
const SIZE_MAX = 96
const SIZE_STEP = 4
// The one form the colour picker hands out: six uppercase hex digits.
const COLOUR = /^#[0-9A-F]{6}$/

const snap = (value: number, min: number, max: number, step: number) =>
  Math.min(max, Math.max(min, min + Math.round((value - min) / step) * step))

const toNumber = (raw: string | null) => {
  if (raw === null || raw.trim() === '') return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

/** Only what differs from `defaults` goes in; nothing differing gives ''. */
export function toIconQuery(settings: IconSettings, defaults: IconSettings): string {
  const params = new URLSearchParams()
  if (settings.style !== defaults.style) params.set('style', settings.style)
  if (settings.size !== defaults.size) params.set('size', String(Math.round(settings.size)))
  if (settings.weight !== defaults.weight) params.set('weight', settings.weight)
  if (settings.colour !== defaults.colour && settings.colour !== null) params.set('colour', settings.colour)
  const query = params.toString()
  return query ? `?${query}` : ''
}

/** Reads back only the keys that hold a valid value; anything else is dropped. */
export function fromIconQuery(search: string): Partial<IconSettings> {
  const params = new URLSearchParams(search)
  const settings: Partial<IconSettings> = {}

  const style = ICON_STYLES.find((candidate) => candidate.id === params.get('style'))
  if (style) settings.style = style.id

  const size = toNumber(params.get('size'))
  if (size !== null) settings.size = snap(size, SIZE_MIN, SIZE_MAX, SIZE_STEP)

  const weight = ICON_WEIGHTS.find((candidate) => candidate.id === params.get('weight'))
  if (weight) settings.weight = weight.id

  const colour = params.get('colour')
  if (colour !== null && COLOUR.test(colour)) settings.colour = colour

  return settings
}
