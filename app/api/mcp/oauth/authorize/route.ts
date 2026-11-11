import { authorize, publicUrl } from '@/app/lib/mcp-oauth'
import { hostedMcpOAuthEnabled } from '@/lib/flags'
import { notFound } from '../http'

export const runtime = 'nodejs'

// The agent opens this in the browser. Everything is checked here and the request travels
// on, signed, to the consent page on the site; nothing is stored and no cookie is read.
// A request whose return address is not trusted never goes back to it: the browser goes to
// the site's own /oauth/stopped page instead, with a reason code (never free text).
export function GET(req: Request): Response {
  if (!hostedMcpOAuthEnabled()) return notFound()
  const outcome = authorize(publicUrl(req))
  if (outcome.kind === 'redirect') {
    return new Response(null, { status: 302, headers: { location: outcome.location, 'cache-control': 'no-store' } })
  }
  const stopped = new URL(`/oauth/stopped?reason=${outcome.reason}`, req.url)
  return new Response(null, { status: 302, headers: { location: stopped.toString(), 'cache-control': 'no-store' } })
}
