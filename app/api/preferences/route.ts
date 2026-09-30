import { NextResponse, type NextRequest } from 'next/server'
import { sessionUser, unauthenticated } from '../../lib/require-user'
import { createAdminClient } from '../../lib/supabase/admin'
import { syncBrevoContact } from '../../lib/brevo'
import type { AiPlatform, PackageManager } from '../../lib/supabase/types'

const PKG_VALUES: PackageManager[] = ['pnpm', 'npm', 'yarn', 'bun']
const AI_VALUES: AiPlatform[] = ['Claude Code', 'Lovable', 'V0']

export async function GET() {
  const { supabase, user } = await sessionUser()
  if (!user) return NextResponse.json({ preferences: null })

  const { data, error } = await supabase
    .from('user_preferences')
    .select('package_manager, ai_platform')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[preferences GET]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Newsletter state lives in newsletter_subscribers (migration 0015); the old
  // user_preferences.newsletter_opt_in column is deprecated. The toggle shows
  // the MAILABLE truth: 'subscribed' and 'soft' (on the list since sign-up,
  // never opted out) both read as on — the settings page must never show OFF
  // to an address the next campaign will mail. Only 'unsubscribed' (or no row
  // at all) is off.
  const { data: sub } = await supabase
    .from('newsletter_subscribers')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({
    preferences: {
      package_manager: data?.package_manager ?? null,
      ai_platform: data?.ai_platform ?? null,
      newsletter_opt_in: sub != null && sub.status !== 'unsubscribed',
    },
  })
}

export async function PUT(request: NextRequest) {
  const { supabase, user } = await sessionUser()
  if (!user) return unauthenticated()

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 })

  const pkg = body.package_manager
  const platform = body.ai_platform
  const newsletter = body.newsletter_opt_in

  if (pkg !== null && pkg !== undefined && !PKG_VALUES.includes(pkg)) {
    return NextResponse.json({ error: 'invalid package_manager' }, { status: 400 })
  }
  if (platform !== null && platform !== undefined && !AI_VALUES.includes(platform)) {
    return NextResponse.json({ error: 'invalid ai_platform' }, { status: 400 })
  }
  if (newsletter !== undefined && typeof newsletter !== 'boolean') {
    return NextResponse.json({ error: 'invalid newsletter_opt_in' }, { status: 400 })
  }

  // Newsletter routes to newsletter_subscribers (migration 0015), not
  // user_preferences. Toggling OFF is an explicit opt-out — status becomes
  // 'unsubscribed' with a timestamp, never back to 'soft', so the choice is
  // recorded and the address is excluded from every future send.
  //
  // Admin client, not the RLS client: the row for this email may be orphaned
  // (user_id null after account deletion + re-signup, or webhook-inserted),
  // and ON CONFLICT DO UPDATE against a row failing the RLS USING clause
  // raises 42501 instead of skipping — the toggle would 500 forever. The
  // write is still self-scoped: both email and id come from the verified
  // session, never from the request body.
  if (newsletter !== undefined) {
    if (!user.email) return NextResponse.json({ error: 'no email on account' }, { status: 400 })
    const admin = createAdminClient()
    const now = new Date().toISOString()

    // If this account's row lives under a previous email address, detach it
    // first so the upsert below can't collide with the partial unique index
    // on user_id. The old row stays as an address-level suppression record.
    await admin
      .from('newsletter_subscribers')
      .update({ user_id: null, updated_at: now })
      .eq('user_id', user.id)
      .neq('email', user.email)

    const { error } = await admin
      .from('newsletter_subscribers')
      .upsert(
        newsletter
          ? {
              email: user.email, user_id: user.id, status: 'subscribed',
              source: 'account_settings', subscribed_at: now, updated_at: now,
            }
          : {
              email: user.email, user_id: user.id, status: 'unsubscribed',
              source: 'account_settings', unsubscribed_at: now, updated_at: now,
            },
        { onConflict: 'email' },
      )
    if (error) {
      console.error('[preferences PUT newsletter]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    // Mirror to Brevo. The DB row above is the truth; the campaign runbook
    // additionally runs scripts/sync-brevo-contacts.mjs before every send,
    // so a missed mirror here cannot cause a mail to an opted-out address.
    await syncBrevoContact(user.email, newsletter)
  }

  // Only include fields the client explicitly sent. Without this, a partial
  // update (e.g. just toggling the newsletter) would clobber other fields
  // to null when the client's in-memory preferences haven't loaded yet.
  const upsert: {
    user_id: string
    package_manager?: PackageManager | null
    ai_platform?: AiPlatform | null
    updated_at: string
  } = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
  }
  if (pkg !== undefined) upsert.package_manager = pkg
  if (platform !== undefined) upsert.ai_platform = platform

  if (pkg !== undefined || platform !== undefined) {
    const { error } = await supabase
      .from('user_preferences')
      .upsert(upsert)

    if (error) {
      console.error('[preferences PUT]', error, 'payload:', upsert)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
  return NextResponse.json({ ok: true })
}
