import { pascalCase, variantProp } from './icon-utils'
import type { IconStyle } from './types'

export const ALL_ICONS_INSTALL = 'npx shadcn@latest add https://aicanvas.me/r/icons.json'
export const DARK_PREVIEW_COLOUR = '#F4F4FA'
export const LIGHT_PREVIEW_COLOUR = '#1B1B1C'

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
