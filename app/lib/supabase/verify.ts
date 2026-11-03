import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { ipFromHeaders } from '../quota'

/**
 * Cookie-backed server client for verifying email links on our server.
 *
 * Supabase rate-limits link verification per IP. Verified from our server,
 * every user would share Vercel's IPs, so the user's own IP is forwarded in
 * `sb-forwarded-for`. Supabase only honours that header on requests made with
 * the secret key and only once `security_sb_forwarded_for_enabled` is on for
 * the project; until then it is ignored and nothing else changes.
 *
 * The secret key never leaves the server: the cookies this client writes hold
 * the user's own session, exactly as the publishable-key client would.
 * Without the secret key it falls back to the publishable key (no forwarding),
 * so sign-in never depends on it.
 */
export async function createVerifyClient(requestHeaders: Headers) {
  const cookieStore = await cookies()
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!secret) console.error('[auth] SUPABASE_SECRET_KEY missing: link verify runs without IP forwarding')
  const ip = secret ? ipFromHeaders(requestHeaders) : null

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: ip ? { headers: { 'sb-forwarded-for': ip } } : undefined,
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    },
  )
}
