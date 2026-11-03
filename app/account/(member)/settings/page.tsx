import { createClient } from '../../../lib/supabase/server'
import { SettingsForm } from './SettingsForm'
import { PasswordSection } from './PasswordSection'
import { AccountBilling } from './AccountBilling'
import { McpTokenSection } from './McpTokenSection'
import { DeleteAccountSection } from './DeleteAccountSection'
import { ConnectedAgentsSection, type ConnectedAgent } from './ConnectedAgentsSection'
import { createAdminClient } from '../../../lib/supabase/admin'
import { hostedMcpOAuthEnabled } from '../../../../lib/flags'
import type { PackageManager } from '../../../lib/supabase/types'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // ai_platform is no longer read: the multi-platform prompt drawer is gone
  // (one general Remix prompt now), so the preference has nothing to drive.
  // The column stays in Supabase untouched.
  const { data } = await supabase
    .from('user_preferences')
    .select('package_manager')
    .eq('user_id', user.id)
    .maybeSingle()

  // Newsletter state lives in newsletter_subscribers (migration 0015) — the
  // toggle shows the MAILABLE truth: 'subscribed' and 'soft' render as on
  // (matching who a campaign actually mails); only 'unsubscribed' or no row
  // is off. user_preferences.newsletter_opt_in is deprecated.
  const { data: sub } = await supabase
    .from('newsletter_subscribers')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle()

  const initial = {
    package_manager: (data?.package_manager ?? null) as PackageManager | null,
    newsletter_opt_in: sub != null && sub.status !== 'unsubscribed',
  }

  // change vs set mode = whether the account has a usable password. Providers
  // can't tell us (setting a password on a Google account doesn't add an
  // 'email' identity), so read encrypted_password via a self-scoped RPC.
  const { data: hasPw } = await supabase.rpc('current_user_has_password')
  const hasPassword = hasPw === true

  // MCP access token — same RLS-scoped read the /api/me/token route uses.
  // Resilient: any error (e.g. table not migrated) falls back to null, and the
  // section renders its "not set up yet" state instead of breaking the page.
  const { data: keyRow } = await supabase
    .from('user_api_keys')
    .select('token')
    .eq('user_id', user.id)
    .maybeSingle()
  const apiToken = (keyRow?.token ?? null) as string | null

  const agents = hostedMcpOAuthEnabled() ? await connectedAgents(user.id) : null

  return (
    <div className="space-y-6">
      <SettingsForm initial={initial} />
      <PasswordSection hasPassword={hasPassword} email={user.email ?? ''} />
      <AccountBilling />
      {/* Rendered outside AccountBilling so the token never depends on the
          premium/billing feature flag — it always shows for signed-in users. */}
      <McpTokenSection token={apiToken} />
      {agents && <ConnectedAgentsSection agents={agents} />}
      <DeleteAccountSection />
    </div>
  )
}

const regions = new Intl.DisplayNames(['en'], { type: 'region' })
const country = (code: string | null) => (code && /^[A-Z]{2}$/.test(code) ? (regions.of(code) ?? code) : null)

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
async function connectedAgents(userId: string): Promise<ConnectedAgent[]> {
  const { data } = await createAdminClient()
    .from('mcp_grants')
    .select('id, client_name, redirect_uri, created_at, last_used_at, stale_refresh_seen_at, browser_country, agent_country')
    .eq('user_id', userId)
    .not('code_used_at', 'is', null)
    .order('created_at', { ascending: false })
  return (data ?? []).map((g) => {
    const agentCountry = country(g.agent_country)
    const browserCountry = country(g.browser_country)
    return {
      id: g.id,
      name: g.client_name,
      destination: destination(g.redirect_uri),
      connectedAt: g.created_at,
      lastUsedAt: g.last_used_at,
      staleRefreshAt: g.stale_refresh_seen_at,
      countryMismatch:
        agentCountry && browserCountry && agentCountry !== browserCountry
          ? `It finished signing in from ${agentCountry} while your browser was in ${browserCountry}.`
          : null,
    }
  })
}
