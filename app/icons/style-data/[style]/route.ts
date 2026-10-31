import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getEntitlement } from '@/app/lib/entitlement'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Line is public (public/icons-data/line.json); these three are Premium. Their
// vector markup leaves the server only for a Premium account; everyone else
// gets 403 and the page falls back to the raster previews.
const PAID_STYLES = new Set(['duotone', 'solid', 'solid-duotone'])
const NO_STORE = { 'Cache-Control': 'private, no-store', Vary: 'Cookie, Authorization' }

export async function GET(req: Request, { params }: { params: Promise<{ style: string }> }) {
  const { style } = await params
  if (!PAID_STYLES.has(style)) return Response.json({ error: 'not-found' }, { status: 404, headers: NO_STORE })

  let tier: string
  try {
    tier = (await getEntitlement(req)).tier
  } catch {
    // An unreadable subscription is never a downgrade to free and never a grant.
    return Response.json({ error: 'temporarily-unavailable' }, { status: 503, headers: NO_STORE })
  }
  if (tier !== 'premium') return Response.json({ error: 'premium-required' }, { status: 403, headers: NO_STORE })

  const body = await readFile(join(process.cwd(), '.icons-data', `${style}.json`), 'utf8')
  return new Response(body, { headers: { 'Content-Type': 'application/json', ...NO_STORE } })
}
