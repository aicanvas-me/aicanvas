import { buildSvg } from '../../_lib/svg'
import { iconMarkdown } from '../../_lib/markdown'
import { getIcon, readLineIcons } from '../../_lib/server-data'

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const icon = getIcon(name)
  if (!icon) return new Response('Icon not found', { status: 404 })
  const line = await readLineIcons()
  return new Response(iconMarkdown(icon, buildSvg(line[icon.name], 24, 'regular', null, 'line')), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}

