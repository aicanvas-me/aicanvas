import { after, NextResponse } from 'next/server'
import { phCapture } from '../../../lib/analytics-server'
import { createClient } from '../../../lib/supabase/server'
import { approve, deny, readRequest } from '../../../lib/mcp-oauth'
import { hostedMcpOAuthEnabled } from '../../../../lib/flags'

export const runtime = 'nodejs'

// The consent page's Allow / Cancel. Only a form posted from this site counts: the
// browser's Sec-Fetch-Site (or Origin) must say same-origin, and the session cookie is
// SameSite=Lax besides. The browser is only ever sent to the return address inside the
// signed request, never to anything the form carries.
function fromThisSite(req: Request): boolean {
  const site = req.headers.get('sec-fetch-site')
  if (site) return site === 'same-origin'
  const origin = req.headers.get('origin')
  return origin !== null && origin === new URL(req.url).origin
}

export async function POST(req: Request): Promise<Response> {
  if (!hostedMcpOAuthEnabled()) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (!fromThisSite(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const form = await req.formData()
  const request = readRequest(String(form.get('request') ?? ''))
  const ended = NextResponse.redirect(new URL('/oauth/consent', req.url), 303)
  if (!request) return ended

  if (form.get('decision') !== 'allow') return NextResponse.redirect(deny(request), 303)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return ended

  const location = await approve(request, user.id)
  if (!location) return ended
  // Anonymous count of connections made (constant distinct id, no person, no cookie).
  after(() => phCapture('mcp_connect_approved', {}))
  return NextResponse.redirect(location, 303)
}
