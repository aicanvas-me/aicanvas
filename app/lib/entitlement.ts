import 'server-only'
import { extractToken } from '@/lib/identity/token'
import { getPremiumForUser } from '@/lib/identity/premium'
import type { Tier } from '@/lib/registry/entitlement'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { createClient } from '@/app/lib/supabase/server'

export interface Entitlement {
  tier: Tier
  userId: string | null
  /**
   * A well-formed token came in but matches no account, which is what a token looks like
   * right after the user rotated it. Access is exactly anonymous; this only lets the
   * registry tell the MCP "your token changed" instead of "sign up".
   */
  tokenUnknown?: true
}

/**
 * Resolve a request to a tier + user. The single entry point the registry gate
 * calls. Token path first (CLI/MCP), then the website session (cookies).
 * Tokens do not expire: they only identify the account, and premium is
 * derived live from the subscription and Lifetime rows (getPremiumForUser).
 *
 * A FAILED read must NOT be coerced to free: that silently downgrades a paying
 * customer and 402s them on content they paid for. getPremiumForUser throws on
 * a read failure; the premium gate's try/catch turns that into a retryable 503
 * and the standalone path fails OPEN, so a paying customer is never wrongly
 * blocked on a transient DB blip.
 */
export async function getEntitlement(req: Request): Promise<Entitlement> {
  const token = extractToken(req)

  if (token) {
    const admin = createAdminClient()
    const { data: key, error: keyError } = await admin
      .from('user_api_keys')
      .select('user_id')
      .eq('token', token)
      .eq('revoked', false)
      .maybeSingle()
    // bad/revoked token. A failed read is not labelled: "your token changed" would be wrong.
    if (!key) return keyError ? { tier: 'anonymous', userId: null } : { tier: 'anonymous', userId: null, tokenUnknown: true }
    // Fire-and-forget usage stamp so leaked-token anomalies are detectable.
    void admin
      .from('user_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('user_id', key.user_id)
      .then(() => {})
    const { premium } = await getPremiumForUser(admin, key.user_id)
    return { tier: premium ? 'premium' : 'free', userId: key.user_id }
  }

  // No token: fall back to the website session (cookies).
  return getSessionEntitlement()
}

/**
 * The cookie half of getEntitlement(), callable from a server COMPONENT — a
 * page render has no Request object, so it cannot call getEntitlement(). Same
 * resolution and same failure semantics (a failed premium read throws);
 * the token path is deliberately absent because a browser page view never
 * carries one.
 */
export async function getSessionEntitlement(): Promise<Entitlement> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { tier: 'anonymous', userId: null }
  const admin = createAdminClient()
  const { premium } = await getPremiumForUser(admin, user.id)
  return { tier: premium ? 'premium' : 'free', userId: user.id }
}
