import { effectiveStrokeWidth } from './icon-utils'

export function buildSvg(
  markup: string,
  size: number,
  strokeWidth: number,
  colour = 'currentColor',
  absolute = true,
): string {
  const escapedColour = colour.replace(/["&<>]/g, '')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${effectiveStrokeWidth(size, strokeWidth, absolute)}" stroke-linecap="round" stroke-linejoin="round" color="${escapedColour}">${markup}</svg>`
}

