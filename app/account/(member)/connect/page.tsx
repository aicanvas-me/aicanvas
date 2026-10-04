import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ConnectAgentCard } from '../../../mcp/ConnectAgentCard'
import { hostedMcpOAuthEnabled } from '../../../../lib/flags'

// ─── /account/connect ────────────────────────────────────────────────────────
// Where a new account lands after sign-up (the sign-up fallback), and where settings
// sends someone who wants to connect another AI agent. Never shown mid-install or on
// sign-in. The member layout already requires a session.

export const metadata: Metadata = {
  title: 'Connect your AI agent',
  robots: { index: false, follow: false },
}

export default function ConnectPage() {
  if (!hostedMcpOAuthEnabled()) redirect('/account')
  return <ConnectAgentCard skipHref="/components" />
}
