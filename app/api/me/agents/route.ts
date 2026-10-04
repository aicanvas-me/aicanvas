import { NextResponse } from 'next/server'
import { sessionUser, unauthenticated } from '@/app/lib/require-user'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { hostedMcpOAuthEnabled } from '@/lib/flags'

export const runtime = 'nodejs'

// Settings' "Connected AI agents": disconnect one, or all. Every delete is scoped to the
// signed-in person's own rows. Changing the API key is a separate call the page makes to
// /api/me/token/rotate, so the key logic stays in one place.
export async function POST(req: Request): Promise<Response> {
  if (!hostedMcpOAuthEnabled()) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const { user } = await sessionUser()
  if (!user) return unauthenticated()

  const body = (await req.json().catch(() => null)) as { id?: unknown; all?: unknown } | null
  let query = createAdminClient().from('mcp_grants').delete().eq('user_id', user.id)
  if (body?.all !== true) {
    if (typeof body?.id !== 'string') return NextResponse.json({ error: 'id or all required' }, { status: 400 })
    query = query.eq('id', body.id)
  }
  const { error } = await query
  if (error) return NextResponse.json({ error: 'disconnect failed' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
