// Colour maths for the icon colour picker. Hue and shade move in OKLCH, so
// every step of the strips looks as far apart as the last (an HSL strip shows
// a glaring yellow band and muddy blues).

export type Oklch = { l: number; c: number; h: number }

// The shade strip's lightness range. Wide enough to reach both theme inks.
export const SHADE_MIN = 0.2
export const SHADE_MAX = 0.97

export function normalizeHex(input: string): string | null {
  const raw = input.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(raw)) return `#${raw.split('').map((digit) => digit + digit).join('')}`.toUpperCase()
  if (/^[0-9a-f]{6}$/i.test(raw)) return `#${raw}`.toUpperCase()
  return null
}

const toLinear = (value: number) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
const toGamma = (value: number) => (value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055)

export function hexToOklch(hex: string): Oklch {
  const normal = normalizeHex(hex) ?? '#000000'
  const [r, g, b] = [1, 3, 5].map((index) => toLinear(parseInt(normal.slice(index, index + 2), 16) / 255))
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const h = (Math.atan2(B, A) * 180) / Math.PI
  return { l: L, c: Math.hypot(A, B), h: h < 0 ? h + 360 : h }
}

function oklchToLinear({ l, c, h }: Oklch): [number, number, number] {
  const A = c * Math.cos((h * Math.PI) / 180)
  const B = c * Math.sin((h * Math.PI) / 180)
  const lc = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const mc = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const sc = (l - 0.0894841775 * A - 1.291485548 * B) ** 3
  return [
    4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
  ]
}

const inGamut = (channels: number[]) => channels.every((value) => value >= -0.0001 && value <= 1.0001)

const luminance = (hex: string) => {
  const normal = normalizeHex(hex) ?? '#000000'
  const [r, g, b] = [1, 3, 5].map((index) => toLinear(parseInt(normal.slice(index, index + 2), 16) / 255))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// WCAG contrast ratio between two hex colours.
export function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

// Out-of-gamut colours keep their lightness and hue and lose chroma until they
// fit sRGB, the way CSS Color 4 maps them.
export function oklchToHex(colour: Oklch): string {
  let channels = oklchToLinear(colour)
  if (!inGamut(channels)) {
    let low = 0
    let high = colour.c
    for (let step = 0; step < 20; step++) {
      const mid = (low + high) / 2
      if (inGamut(oklchToLinear({ ...colour, c: mid }))) low = mid
      else high = mid
    }
    channels = oklchToLinear({ ...colour, c: low })
  }
  return `#${channels
    .map((value) => Math.round(Math.min(1, Math.max(0, toGamma(Math.min(1, Math.max(0, value))))) * 255).toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase()
}
