import { LINE_ICON_NOTICE } from '../../../scripts/lib/icon-notice.mjs'
import { weightStroke, type IconWeight } from './icon-utils'
import type { IconStyle } from './types'

// The file a user copies or downloads. No colour picked: currentColor, so the
// icon takes the text colour in code and black in a design tool. A picked
// colour is written into every stroke and fill: Figma and other design tools
// read currentColor as black and ignore the svg's color attribute. A Line file
// carries its licence notice; the "!" keeps it through SVGO's comment removal.
export function buildSvg(
  markup: string,
  size: number,
  weight: IconWeight,
  colour: string | null,
  style: IconStyle,
): string {
  const paint = colour ? colour.replace(/["&<>]/g, '') : 'currentColor'
  const notice = style === 'line' ? `<!--! ${LINE_ICON_NOTICE} -->` : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${weightStroke(weight)}" stroke-linecap="round" stroke-linejoin="round">${notice}${markup}</svg>`
  return paint === 'currentColor' ? svg : svg.replaceAll('"currentColor"', `"${paint}"`)
}

