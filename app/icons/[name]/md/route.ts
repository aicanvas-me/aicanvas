import { buildSvg } from '../../_lib/svg'
import { iconMarkdown } from '../../_lib/markdown'
import { fromIconQuery } from '../../_lib/settings-query'
import { ICON_DEFAULTS } from '../../_lib/settings-store'
import { getIcon, readLineIcons } from '../../_lib/server-data'

// The page's look rides in the query, so View as Markdown matches what was picked.
// Paid styles carry no SVG here: their vectors are served to Premium only.
export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const icon = getIcon(name)
  if (!icon) return new Response('Icon not found', { status: 404 })
  const look = { ...ICON_DEFAULTS, ...fromIconQuery(new URL(request.url).search) }
  const line = await readLineIcons()
  const svg = look.style === 'line' ? buildSvg(line[icon.name], look.size, look.weight, look.colour, 'line') : null
  return new Response(iconMarkdown(icon, svg, look), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
