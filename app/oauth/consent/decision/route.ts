import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { hostedMcpOAuthEnabled } from '../../../../lib/flags'

export const runtime = 'nodejs'

// The consent page's Allow / Cancel. Supabase records the choice for the signed-in person
// and returns the agent's callback address, which the browser is sent on to. The session
// cookie is SameSite=Lax, so a form posted from another site arrives signed out and fails.
export async function POST(req: Request): Promise<Response> {
  if (!hostedMcpOAuthEnabled()) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const form = await req.formData()
  const id = String(form.get('authorization_id') ?? '')
  const allow = form.get('decision') === 'allow'

  const supabase = await createClient()
  const { data, error } = allow
    ? await supabase.auth.oauth.approveAuthorization(id, { skipBrowserRedirect: true })
    : await supabase.auth.oauth.denyAuthorization(id, { skipBrowserRedirect: true })

  // Expired, already answered, or signed out: the page says so and offers nothing to click.
  if (error || !data?.redirect_url) {
    return NextResponse.redirect(new URL(`/oauth/consent?authorization_id=${encodeURIComponent(id)}`, req.url), 303)
  }
  return NextResponse.redirect(data.redirect_url, 303)
}
