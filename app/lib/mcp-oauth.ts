import 'server-only'
import { createAdminClient } from '@/app/lib/supabase/admin'

// Browser sign-in for the hosted MCP. Supabase's OAuth 2.1 server signs the person in and
// hands their agent a normal Supabase access token that also names the agent (`client_id`).
// That token only says who the person is: the hosted server then uses the account's current
// API key, exactly like a key caller, so /r stays the one gate and a rotated key breaks nothing.

export const MCP_HOST = 'mcp.aicanvas.me'

/** The address the agent connected to: the sign-in is issued for it (RFC 8707 `resource`). */
export function resourceFor(url: URL): string {
  return url.host === MCP_HOST ? `https://${MCP_HOST}` : `${url.origin}/api/mcp`
}

/** Where an agent reads how to sign in (RFC 9728), named in every 401. */
export function resourceMetadataUrl(url: URL): string {
  return url.host === MCP_HOST
    ? `https://${MCP_HOST}/.well-known/oauth-protected-resource`
    : `${url.origin}/.well-known/oauth-protected-resource/api/mcp`
}

/** Supabase Auth is the authorization server; its metadata lives under this issuer. */
export function authorizationServer(): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`
}

/** A JWT's `client_id` claim, unverified. Only an agent sign-in carries one. */
function clientIdOf(jwt: string): string | null {
  try {
    const claims = JSON.parse(Buffer.from(jwt.split('.')[1] ?? '', 'base64url').toString('utf8'))
    return typeof claims?.client_id === 'string' && claims.client_id ? claims.client_id : null
  } catch {
    return null
  }
}

export function looksLikeJwt(bearer: string): boolean {
  return bearer.split('.').length === 3
}

/**
 * The account's current API key for a signed-in agent. Null when the bearer is not an agent
 * sign-in (a website session token has no `client_id`) or the sign-in has ended: disconnected,
 * signed out of other devices, account deleted. Supabase is asked on every request, so ending
 * a sign-in takes effect at once, not when the hour-long token runs out. Throws when Supabase
 * or the database cannot answer, which the route turns into a 503 instead of a sign-in prompt.
 */
export async function keyForSignIn(jwt: string): Promise<string | null> {
  if (!clientIdOf(jwt)) return null
  const admin = createAdminClient()
  const { data, error } = await admin.auth.getUser(jwt)
  if (error) {
    if (!error.status || error.status >= 500) throw error
    return null
  }
  const { data: key, error: keyError } = await admin
    .from('user_api_keys')
    .select('token')
    .eq('user_id', data.user.id)
    .eq('revoked', false)
    .maybeSingle()
  if (keyError) throw keyError
  return key?.token ?? null
}
