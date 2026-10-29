import { pascalCase, variantProp } from './icon-utils'
import type { IconStyle } from './types'

export const ALL_ICONS_INSTALL = 'npx shadcn@latest add https://aicanvas.me/r/icons.json'
export const DARK_PREVIEW_COLOUR = '#F4F4FA'
export const LIGHT_PREVIEW_COLOUR = '#1B1B1C'
// The grid tiles' fills (sand-100, sand-900), for the colour picker's contrast note.
export const LIGHT_TILE = '#EEEEF3'
export const DARK_TILE = '#1B1B1C'

// The colour picker's presets. Content colours, not chrome: each one keeps at
// least 3:1 on both the light and the dark tile, so a pick reads in either theme.
export const COLOUR_SWATCHES: { label: string; hex: string }[] = [
  { label: 'Grey', hex: '#7B7B7D' },
  { label: 'Red', hex: '#E5484D' },
  { label: 'Orange', hex: '#D9650B' },
  { label: 'Amber', hex: '#A87A00' },
  { label: 'Green', hex: '#2A9461' },
  { label: 'Teal', hex: '#0F9484' },
  { label: 'Blue', hex: '#3E7BFA' },
  { label: 'Violet', hex: '#8E5BD9' },
  { label: 'Pink', hex: '#D6409F' },
]

export const iconInstallCommand = (name: string) =>
  `npx shadcn@latest add https://aicanvas.me/r/icons/${name}.json`

export const iconImportLine = (name: string) =>
  `import { ${pascalCase(name)} } from '@/components/icons'`

export const iconJsxLine = (name: string, size: number, strokeWidth: number, style: IconStyle, absolute = true) =>
  `<${pascalCase(name)} size={${size}} strokeWidth={${strokeWidth}}${absolute ? '' : ' absoluteStrokeWidth={false}'}${variantProp(style)} />`

export function agentPrompt(name: string, size: number, strokeWidth: number, style: IconStyle, absolute = true): string {
  const component = pascalCase(name)
  return `Use the ${component} icon in the ${style} style at ${size}px with strokeWidth ${strokeWidth}${absolute ? '' : ', the line scaling with the size (absoluteStrokeWidth off)'}. If this project does not have the icon, install it with \`${iconInstallCommand(name)}\`. Import it with \`${iconImportLine(name)}\`, then render \`${iconJsxLine(name, size, strokeWidth, style, absolute)}\`.`
}
