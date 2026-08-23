import 'server-only'
import { extractToken } from '@/lib/identity/token'
import { deriveTier, type SubStatus } from '@/lib/identity/tier'
import type { Tier } from '@/lib/registry/entitlement'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { createClient } from '@/app/lib/supabase/server'

export interface Entitlement {
  tier: Tier
  userId: string | null
}

type AdminClient = ReturnType<typeof createAdminClient>

/**
 * Resolve a request to a tier + user. The single entry point the registry gate
 * calls. Token path first (CLI/MCP), then the website session (cookies).
 * Tokens do not expire: they only identify the account, and premium is
 * derived live from the subscription below.
 */
export async function getEntitlement(req: Request): Promise<Entitlement> {
  const token = extractToken(req)

  if (token) {
    const admin = createAdminClient()
    const { data: key } = await admin
      .from('user_api_keys')
      .select('user_id')
      .eq('token', token)
      .eq('revoked', false)
      .maybeSingle()
    if (!key) return { tier: 'anonymous', userId: null } // bad/revoked token
    // Fire-and-forget usage stamp so leaked-token anomalies are detectable.
    void admin
      .from('user_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('user_id', key.user_id)
      .then(() => {})
    const sub = await fetchSubscription(admin, key.user_id)
    return {
      tier: deriveTier({ hasUser: true, status: sub.status, currentPeriodEnd: sub.currentPeriodEnd }),
      userId: key.user_id,
    }
  }

  // No token: fall back to the website session (cookies).
  return getSessionEntitlement()
}

/**
 * The cookie half of getEntitlement(), callable from a server COMPONENT — a
 * page render has no Request object, so it cannot call getEntitlement(). Same
 * resolution and same failure semantics (a failed subscription read throws);
 * the token path is deliberately absent because a browser page view never
 * carries one.
 */
export async function getSessionEntitlement(): Promise<Entitlement> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { tier: 'anonymous', userId: null }
  const admin = createAdminClient()
  const sub = await fetchSubscription(admin, user.id)
  return {
    tier: deriveTier({ hasUser: true, status: sub.status, currentPeriodEnd: sub.currentPeriodEnd }),
    userId: user.id,
  }
}

async function fetchSubscription(
  admin: AdminClient,
  userId: string,
): Promise<{ status: SubStatus; currentPeriodEnd: string | null }> {
  const { data, error } = await admin
    .from('user_subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .maybeSingle()
  // A FAILED read must NOT be coerced to 'none' — that silently downgrades a
  // paying customer to free and 402s them on content they paid for. maybeSingle()
  // returns data:null WITHOUT an error for the legit "no subscription row" case,
  // so only a real read failure throws here. The premium gate's try/catch turns
  // that throw into a retryable 503; the standalone path catches it and fails
  // OPEN — so a paying customer is never wrongly blocked on a transient DB blip.
  if (error) throw error
  return {
    status: (data?.status as SubStatus) ?? 'none',
    currentPeriodEnd: data?.current_period_end ?? null,
  }
}
