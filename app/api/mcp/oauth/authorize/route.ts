import { authorize } from '@/app/lib/mcp-oauth'
import { hostedMcpOAuthEnabled } from '@/lib/flags'
import { country, notFound } from '../http'

export const runtime = 'nodejs'

// The agent opens this in the browser. Everything is checked here and the request travels
// on, signed, to the consent page on the site; nothing is stored and no cookie is read.
// A request whose return address is not trusted gets a plain page, never a redirect.
export function GET(req: Request): Response {
  if (!hostedMcpOAuthEnabled()) return notFound()
  const outcome = authorize(new URL(req.url), country(req))
  if (outcome.kind === 'redirect') {
    return new Response(null, { status: 302, headers: { location: outcome.location, 'cache-control': 'no-store' } })
  }
  const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Sign-in stopped</title></head><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1rem;line-height:1.5"><h1 style="font-size:1.25rem">Sign-in stopped</h1><p>${outcome.message}</p></body></html>`
  return new Response(page, {
    status: 400,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'content-security-policy': "frame-ancestors 'none'" },
  })
}
