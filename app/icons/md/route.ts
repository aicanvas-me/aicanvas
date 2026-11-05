import { overviewMarkdown } from '../_lib/markdown'

export const dynamic = 'force-static'

export function GET() {
  return new Response(overviewMarkdown(), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}

