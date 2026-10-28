import { pascalCase, variantProp } from './icon-utils'
import type { IconStyle } from './types'

export const ALL_ICONS_INSTALL = 'npx shadcn@latest add https://aicanvas.me/r/icons.json'

export const iconInstallCommand = (name: string) =>
  `npx shadcn@latest add https://aicanvas.me/r/icons/${name}.json`

export const iconImportLine = (name: string) =>
  `import { ${pascalCase(name)} } from '@/components/icons'`

export const iconJsxLine = (name: string, size: number, strokeWidth: number, style: IconStyle) =>
  `<${pascalCase(name)} size={${size}} strokeWidth={${strokeWidth}}${variantProp(style)} />`

export function agentPrompt(name: string, size: number, strokeWidth: number, style: IconStyle): string {
  const component = pascalCase(name)
  return `Use the ${component} icon in the ${style} style at ${size}px with strokeWidth ${strokeWidth}. If this project does not have the icon, install it with \`${iconInstallCommand(name)}\`. Import it with \`${iconImportLine(name)}\`, then render \`${iconJsxLine(name, size, strokeWidth, style)}\`.`
}
