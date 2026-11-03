import { iconComponentName, iconFileName, takesStroke, type IconWeight } from './icon-utils'
import type { IconStyle } from './types'

const REGISTRY_BASE = 'https://aicanvas.me'
export const ALL_ICONS_INSTALL = `npx shadcn@latest add ${REGISTRY_BASE}/r/icons.json`
// Reuse the existing registry's premium install wording.
export const PREMIUM_ICON_INSTALL_NOTE = 'Requires AI Canvas Premium to install.'
export const DARK_PREVIEW_COLOUR = '#F4F4FA'
export const LIGHT_PREVIEW_COLOUR = '#1B1B1C'
// The grid tiles' fills (sand-100, sand-900), for the colour picker's contrast note.
export const LIGHT_TILE = '#EEEEF3'
export const DARK_TILE = '#1B1B1C'
// The note on Weight while a solid style is picked.
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

export const iconInstallCommand = (name: string, style: IconStyle = 'line') =>
  `npx shadcn@latest add ${REGISTRY_BASE}/r/icon-${iconFileName(name, style)}.json`

export const iconImportLine = (name: string, style: IconStyle = 'line') =>
  `import { ${iconComponentName(name, style)} } from '@/components/icons/${iconFileName(name, style)}'`

// weight goes in only when it is not IconBase's default (regular), and never
// on a solid style, which it does not change.
const namesWeight = (weight: IconWeight, style: IconStyle) => takesStroke(style) && weight !== 'regular'

// colour: the user's pick, or null to leave the icon on the text colour
export const iconJsxLine = (name: string, size: number, weight: IconWeight, style: IconStyle, colour: string | null = null) =>
  `<${iconComponentName(name, style)} size={${size}}${namesWeight(weight, style) ? ` weight="${weight}"` : ''}${colour ? ` color="${colour}"` : ''} />`

export function agentPrompt(name: string, size: number, weight: IconWeight, style: IconStyle, colour: string | null = null): string {
  const component = iconComponentName(name, style)
  const weightText = namesWeight(weight, style) ? ` in the ${weight} weight` : ''
  return `Use the ${component} icon in the ${style} style at ${size}px${weightText}${colour ? `, in ${colour}` : ''}.${style === 'line' ? '' : ` ${PREMIUM_ICON_INSTALL_NOTE}`} If this project does not have the icon, install it with \`${iconInstallCommand(name, style)}\`. Import it with \`${iconImportLine(name, style)}\`, then render \`${iconJsxLine(name, size, weight, style, colour)}\`.`
}
