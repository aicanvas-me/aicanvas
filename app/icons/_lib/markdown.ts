import { ICON_CATEGORIES, ICON_CATEGORY_COUNTS, ICON_CATEGORY_LABELS, ICON_COUNT } from './categories'
import { ALL_ICONS_INSTALL, iconImportLine, iconInstallCommand, iconJsxLine } from './constants'
import { formatDate, iconLead, titleCase } from './icon-utils'
import type { IconMeta } from './types'

export function overviewMarkdown(): string {
  const categories = ICON_CATEGORIES.map(
    ([slug, label]) => `- [${label}](https://aicanvas.me/icons?category=${slug}): ${ICON_CATEGORY_COUNTS[slug]}`,
  ).join('\n')

  return `# Icons\n\nDrawn on one 24 px grid, in four styles. Line is free with a one-line credit in the code, the other three come with Premium.\n\n## Facts\n\n- Icons: ${ICON_COUNT}\n- Styles: 4\n- Categories: ${ICON_CATEGORIES.length}\n\n## Categories\n\n${categories}\n\n## Install\n\n\`\`\`sh\n${ALL_ICONS_INSTALL}\n\`\`\``
}

export function iconMarkdown(icon: IconMeta, svg: string): string {
  const label = ICON_CATEGORY_LABELS[icon.category]
  const title = titleCase(icon.name)
  const added = icon.added ? `- Added: ${formatDate(icon.added)}\n` : ''
  return `# ${title}\n\n${iconLead(icon, label)}\n\n## Facts\n\n- Category: ${label}\n- Styles: 4\n${added}- Tags: ${icon.tags.join(', ')}\n\n## Install\n\n\`\`\`sh\n${iconInstallCommand(icon.name)}\n\`\`\`\n\n## Import\n\n\`\`\`tsx\n${iconImportLine(icon.name)}\n\`\`\`\n\n## Usage\n\n\`\`\`tsx\n${iconJsxLine(icon.name, 24, 'regular', 'line')}\n\`\`\`\n\n## SVG\n\n\`\`\`svg\n${svg}\n\`\`\``
}
