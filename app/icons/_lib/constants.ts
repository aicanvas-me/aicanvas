import { pascalCase, takesStroke, variantProp } from './icon-utils'
import type { IconStyle } from './types'

export const ALL_ICONS_INSTALL = 'npx shadcn@latest add https://aicanvas.me/r/icons.json'
export const DARK_PREVIEW_COLOUR = '#F4F4FA'
export const LIGHT_PREVIEW_COLOUR = '#1B1B1C'
// The grid tiles' fills (sand-100, sand-900), for the colour picker's contrast note.
export const LIGHT_TILE = '#EEEEF3'
export const DARK_TILE = '#1B1B1C'
// The note on Stroke and Absolute while a solid style is picked.
export const FIXED_WEIGHT = 'Solid styles are filled shapes with a fixed weight'

// The colour picker's presets. Content colours, not chrome: every one has the
// same contrast, 3.3:1 on the light tile and 4.5:1 on the dark one, so no pick
// reads weaker than another in either theme, and each hue is as vivid as sRGB
// allows at that lightness (OKLCH; amber and teal can go no further).
export const COLOUR_SWATCHES: { label: string; hex: string }[] = [
  { label: 'Grey', hex: '#828285' },
  { label: 'Red', hex: '#EA4747' },
  { label: 'Orange', hex: '#C8690F' },
  { label: 'Amber', hex: '#A57C0F' },
  { label: 'Green', hex: '#119647' },
  { label: 'Teal', hex: '#12918E' },
  { label: 'Blue', hex: '#277FF9' },
  { label: 'Violet', hex: '#9A65F0' },
  { label: 'Pink', hex: '#DB4AA0' },
]

export const iconInstallCommand = (name: string) =>
  `npx shadcn@latest add https://aicanvas.me/r/icons/${name}.json`

export const iconImportLine = (name: string) =>
  `import { ${pascalCase(name)} } from '@/components/icons'`

// colour: the user's pick, or null to leave the icon on the text colour
// A solid style leaves strokeWidth and absoluteStrokeWidth out: they do not change it.
export const iconJsxLine = (name: string, size: number, strokeWidth: number, style: IconStyle, absolute = true, colour: string | null = null) =>
  `<${pascalCase(name)} size={${size}}${takesStroke(style) ? ` strokeWidth={${strokeWidth}}${absolute ? '' : ' absoluteStrokeWidth={false}'}` : ''}${colour ? ` color="${colour}"` : ''}${variantProp(style)} />`

export function agentPrompt(name: string, size: number, strokeWidth: number, style: IconStyle, absolute = true, colour: string | null = null): string {
  const component = pascalCase(name)
  const weight = takesStroke(style) ? ` with strokeWidth ${strokeWidth}${absolute ? '' : ', the line scaling with the size (absoluteStrokeWidth off)'}` : ''
  return `Use the ${component} icon in the ${style} style at ${size}px${weight}${colour ? `, in ${colour}` : ''}. If this project does not have the icon, install it with \`${iconInstallCommand(name)}\`. Import it with \`${iconImportLine(name)}\`, then render \`${iconJsxLine(name, size, strokeWidth, style, absolute, colour)}\`.`
}
