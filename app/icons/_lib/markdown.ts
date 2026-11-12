import { ICON_CATEGORIES, ICON_CATEGORY_COUNTS, ICON_CATEGORY_LABELS, ICON_COUNT } from './categories'
import { ALL_ICONS_INSTALL, iconImportLine, iconInstallCommand, iconJsxLine } from './constants'
import { iconLead, titleCase, type IconWeight } from './icon-utils'
import type { IconMeta, IconStyle } from './types'

export function overviewMarkdown(): string {
  const categories = ICON_CATEGORIES.map(
    ([slug, label]) => `- [${label}](https://aicanvas.me/icons?category=${slug}): ${ICON_CATEGORY_COUNTS[slug]}`,
  ).join('\n')

  return `# Icons\n\nDrawn on one 24 px grid, in four styles. Line is free with a one-line credit in the code, the other three come with Premium.\n\n## Facts\n\n- Icons: ${ICON_COUNT}\n- Styles: 4\n- Categories: ${ICON_CATEGORIES.length}\n\n## Categories\n\n${categories}\n\n## Install\n\n\`\`\`sh\n${ALL_ICONS_INSTALL}\n\`\`\``
}

// The icon as the page shows it: the picked style, size, weight and colour.
export type IconLook = { style: IconStyle; size: number; weight: IconWeight; colour: string | null }

const SITE = 'https://aicanvas.me'

// svg: the picked style's SVG, or null when it comes only with Premium
export function iconMarkdown(icon: IconMeta, svg: string | null, look: IconLook): string {
  const label = ICON_CATEGORY_LABELS[icon.category]
  const title = titleCase(icon.name)
  const { style, size, weight, colour } = look
  const installNote =
    style !== 'line'
      ? `\n\nRequires Premium. Set your AI Canvas token as AICANVAS_TOKEN and register the @aicanvas registry with it, as described in the Install section of ${SITE}/llms.txt. Without a Premium token the command writes a placeholder file instead of the icon.`
      : '\n\nFree, no account needed.'
  const svgSection = svg ? `\`\`\`svg\n${svg}\n\`\`\`` : 'The SVG of this style comes with AI Canvas Premium.'
  return `# ${title}\n\n${iconLead(icon, label)}\n\n## Facts\n\n- Category: ${label}\n- Styles: 4\n- Tags: ${icon.tags.join(', ')}\n\n## Install\n\n\`\`\`sh\n${iconInstallCommand(icon.name, style)}\n\`\`\`${installNote}\n\n## Import\n\n\`\`\`tsx\n${iconImportLine(icon.name, style)}\n\`\`\`\n\n## Usage\n\n\`\`\`tsx\n${iconJsxLine(icon.name, size, weight, style, colour)}\n\`\`\`\n\n## SVG\n\n${svgSection}`
}
