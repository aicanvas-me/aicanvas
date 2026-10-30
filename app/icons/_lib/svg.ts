import { effectiveStrokeWidth } from './icon-utils'

// The file a user copies or downloads. No colour picked: currentColor, so the
// icon takes the text colour in code and black in a design tool. A picked
// colour is written into every stroke and fill: Figma and other design tools
// read currentColor as black and ignore the svg's color attribute.
export function buildSvg(
  markup: string,
  size: number,
  strokeWidth: number,
  colour: string | null = null,
  absolute = true,
): string {
  const paint = colour ? colour.replace(/["&<>]/g, '') : 'currentColor'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${effectiveStrokeWidth(size, strokeWidth, absolute)}" stroke-linecap="round" stroke-linejoin="round">${markup}</svg>`
  return paint === 'currentColor' ? svg : svg.replaceAll('"currentColor"', `"${paint}"`)
}

