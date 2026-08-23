import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { createClient } from '@/app/lib/supabase/server'
import { createAdminClient } from '@/app/lib/supabase/admin'

export const runtime = 'nodejs'

/**
 * Rotate the signed-in user's API token: issue a fresh value, clear
 * last_used_at, keep revoked=false. The OLD token immediately resolves to
 * anonymous via getEntitlement. The settings UI calls this; it is the one-click
 * fix for a leaked token. Tokens never expire on their own.
 */
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

  const token = 'aic_' + randomBytes(24).toString('hex')
  const admin = createAdminClient()
  const { error } = await admin
    .from('user_api_keys')
    .update({
      token,
      last_used_at: null,
      revoked: false,
    })
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: 'rotation failed' }, { status: 500 })
  return NextResponse.json({ token })
}
