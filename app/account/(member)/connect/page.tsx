import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CircleCheck } from '@/app/_icons/icons/circle-check'
import { ConnectAgentCard } from '../../../mcp/ConnectAgentCard'
import { createClient } from '../../../lib/supabase/server'
import { connectedAgents } from '../settings/connected-agents'
import { hostedMcpOAuthEnabled } from '../../../../lib/flags'

// ─── /account/connect ────────────────────────────────────────────────────────
// Where a new account lands after sign-up (the sign-up fallback), and where settings
// sends someone who wants to connect another AI agent. Never shown mid-install or on
// sign-in. The member layout already requires a session.

export const metadata: Metadata = {
  title: 'Connect your AI agent',
  robots: { index: false, follow: false },
}

export default async function ConnectPage() {
  if (!hostedMcpOAuthEnabled()) redirect('/account')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const agents = user ? await connectedAgents(user.id) : []
  // Two connections from one agent (two computers) name it once.
  const names = [...new Set(agents.map((a) => a.name))]

  if (names.length === 0) return <ConnectAgentCard skipHref="/components" />

  return (
    <ConnectAgentCard
      title="Connect another AI agent"
      note={
        <p className="flex items-start gap-2 rounded-inset border border-sand-200 bg-sand-50 px-4 py-3 text-sm text-sand-700 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-300">
          <CircleCheck size={18} className="mt-px shrink-0 text-success" />
          <span>
            Already connected: <span className="font-semibold text-sand-900 dark:text-sand-50">{names.join(', ')}</span>.{' '}
            <Link href="/account/settings#ai-agents" className="font-semibold text-accent transition-colors hover:text-accent/70">
              Manage in Settings
            </Link>
          </span>
        </p>
      }
    />
  )
}
