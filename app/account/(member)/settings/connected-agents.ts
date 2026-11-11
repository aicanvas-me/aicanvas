import 'server-only'
import { createAdminClient } from '../../../lib/supabase/admin'
import type { ConnectedAgent } from './ConnectedAgentsSection'

function destination(redirectUri: string): string {
  try {
    const url = new URL(redirectUri)
    if (['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) return 'On a computer'
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.host
    return `${url.protocol.slice(0, -1)} app`
  } catch {
    return 'Unknown'
  }
}

// mcp_grants is server-only (no RLS policy), so it is read with the secret key, scoped
// to this person. Only finished connections are listed, never unanswered requests.
export async function connectedAgents(userId: string): Promise<ConnectedAgent[]> {
  const { data } = await createAdminClient()
    .from('mcp_grants')
    .select('id, client_name, redirect_uri, created_at, last_used_at, stale_refresh_seen_at')
    .eq('user_id', userId)
    .not('code_used_at', 'is', null)
    .order('created_at', { ascending: false })
  return (data ?? []).map((g) => ({
    id: g.id,
    name: g.client_name,
    destination: destination(g.redirect_uri),
    connectedAt: g.created_at,
    lastUsedAt: g.last_used_at,
    staleRefreshAt: g.stale_refresh_seen_at,
  }))
}
