import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Bot } from '@/app/_icons/icons/bot'
import { Download } from '@/app/_icons/icons/download'
import { Ellipsis } from '@/app/_icons/icons/ellipsis'
import { Layers } from '@/app/_icons/icons/layers'
import { Search } from '@/app/_icons/icons/search'
import { createClient } from '../../lib/supabase/server'
import { buttonClasses } from '../../components/buttonClasses'
import { hostedMcpOAuthEnabled } from '../../../lib/flags'
import { readRequest, redirectWarning } from '../../lib/mcp-oauth'
import { SwitchAccount } from './SwitchAccount'
import { Card } from '../Card'

// ─── /oauth/consent ──────────────────────────────────────────────────────────
// The hosted MCP's sign-in sends the browser here with a signed, 10-minute request
// (?request=…). Signed out: sign in first and come back. Each connection is one click;
// nothing is stored until Allow. The choice is a plain form POST to ./decision, so it
// works before any JavaScript loads.

export const metadata: Metadata = {
  title: 'Connect your agent',
  robots: { index: false, follow: false },
}

// The agent and AI Canvas, joined. The agent gets a plain robot, never a brand mark: its
// name is whatever it registered as, and a borrowed logo would lend a look-alike trust.
function Pairing() {
  const tile =
    'flex h-12 w-12 items-center justify-center rounded-inset border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950'
  return (
    <div className="mb-6 flex items-center justify-center gap-3" aria-hidden="true">
      <div className={tile}>
        <Bot size={24} className="text-sand-700 dark:text-sand-300" />
      </div>
      <Ellipsis size={24} className="text-sand-500" />
      <div className={tile}>
        <img src="/ai-canvas-icon.svg" alt="" width={24} height={20} />
      </div>
    </div>
  )
}

function Ended() {
  return (
    <Card>
      <h1 className="text-xl font-bold leading-tight tracking-tight text-sand-900 dark:text-sand-50">
        This sign-in request has ended
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-sand-700 dark:text-sand-300">
        It expired or was already answered. Start the sign-in again from your AI agent. In Claude Code or Codex:
      </p>
      <pre className="mt-3 overflow-x-auto rounded-inset border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950 px-4 py-3 font-mono text-sm text-sand-700 dark:text-sand-300">
        <code>{'claude mcp login aicanvas\ncodex mcp login aicanvas'}</code>
      </pre>
      <p className="mt-4 text-sm text-sand-600 dark:text-sand-400">
        Another AI agent, or still stuck?{' '}
        <Link
          href="/mcp/docs#stuck"
          className="font-semibold text-accent transition-colors hover:text-accent/70"
        >
          Read the fix
        </Link>
        .
      </p>
    </Card>
  )
}

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ request?: string }>
}) {
  if (!hostedMcpOAuthEnabled()) notFound()

  const { request: signed } = await searchParams
  const request = readRequest(signed ?? null)
  if (!request || !signed) return <Ended />

  const here = `/oauth/consent?request=${encodeURIComponent(signed)}`
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/account/sign-in?next=${encodeURIComponent(here)}`)

  const target = redirectWarning(request.ru)

  return (
    <Card>
      <Pairing />
      {/* The name is the agent's own, so it is shown only when the sign-in returns to this
          computer or a known app. A sign-in sent to a website keeps the plain heading and the
          warning below: a look-alike agent can copy any name, never the address. */}
      <h1 className="text-center text-xl font-bold leading-tight tracking-tight text-sand-900 dark:text-sand-50">
        {target || request.n === 'An app' ? 'Allow your AI agent to use your AI Canvas account?' : `Allow ${request.n} to use your AI Canvas account?`}
      </h1>
      <p className="mt-6 text-xs font-semibold text-sand-600 dark:text-sand-400">This lets it:</p>
      <ul className="mt-3 space-y-3 text-sm text-sand-700 dark:text-sand-300">
        {[
          { Icon: Search, line: 'Search AI Canvas and read what is inside' },
          { Icon: Download, line: 'Install the components, design systems and templates your plan includes' },
          { Icon: Layers, line: 'Check its work against each design system\'s rules' },
        ].map(({ Icon, line }) => (
          <li key={line} className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-chip border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950">
              <Icon size={15} className="text-sand-700 dark:text-sand-300" />
            </span>
            <span className="pt-1">{line}</span>
          </li>
        ))}
      </ul>
      {target && (
        <p className="mt-6 rounded-inset border border-red-500/40 px-3 py-2.5 text-xs leading-relaxed text-red-700 dark:border-red-500/30 dark:text-red-400">
          This sign-in will be sent to <span className="font-semibold">{target}</span>. Only allow it
          if you know it.
        </p>
      )}
      <form action="/oauth/consent/decision" method="post" className="mt-6 flex gap-3">
        <input type="hidden" name="request" value={signed} />
        <button type="submit" name="decision" value="allow" className={buttonClasses({ variant: 'primary', size: 'md', fullWidth: true })}>
          Allow
        </button>
        <button type="submit" name="decision" value="deny" className={buttonClasses({ variant: 'outline', size: 'md', fullWidth: true })}>
          Cancel
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-sand-600 dark:text-sand-400">
        Signed in as <span className="font-semibold text-sand-900 dark:text-sand-50">{user.email}</span>.{' '}
        <SwitchAccount next={here} />
        <br />
        Disconnect it anytime in{' '}
        <Link
          href="/account/settings"
          className="font-semibold text-accent transition-colors hover:text-accent/70"
        >
          Settings, Connected AI agents
        </Link>
        .
      </p>
    </Card>
  )
}
