import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Check, DotsThree, Robot } from '@phosphor-icons/react/dist/ssr'
import { createClient } from '../../lib/supabase/server'
import { buttonClasses } from '../../components/buttonClasses'
import { hostedMcpOAuthEnabled } from '../../../lib/flags'
import { readRequest, redirectWarning } from '../../lib/mcp-oauth'
import { SwitchAccount } from './SwitchAccount'

// ─── /oauth/consent ──────────────────────────────────────────────────────────
// The hosted MCP's sign-in sends the browser here with a signed, 10-minute request
// (?request=…). Signed out: sign in first and come back. Each connection is one click;
// nothing is stored until Allow. The choice is a plain form POST to ./decision, so it
// works before any JavaScript loads.

export const metadata: Metadata = {
  title: 'Connect your agent',
  robots: { index: false, follow: false },
}

// A focus page: the site rail and top bar step aside (FOCUS_ROUTE_RE), so the card is the
// whole screen. The logo is the only way out.
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-sand-50 px-4 py-10 dark:bg-sand-950">
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-sand-900 dark:text-sand-50">
        <img src="/ai-canvas-icon.svg" alt="" width={20} height={17} className="shrink-0" />
        AI Canvas
      </Link>
      <div className="w-full max-w-md rounded-xl border border-sand-200 bg-sand-100 p-6 sm:p-8 dark:border-sand-800 dark:bg-sand-900">
        {children}
      </div>
    </div>
  )
}

// The agent and AI Canvas, joined. The agent gets a plain robot, never a brand mark: its
// name is whatever it registered as, and a borrowed logo would lend a look-alike trust.
function Pairing() {
  const tile =
    'flex h-12 w-12 items-center justify-center rounded-xl border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950'
  return (
    <div className="mb-6 flex items-center justify-center gap-3" aria-hidden="true">
      <div className={tile}>
        <Robot weight="regular" size={24} className="text-sand-700 dark:text-sand-300" />
      </div>
      <DotsThree weight="regular" size={24} className="text-sand-500" />
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
        It expired or was already answered. Start the sign-in again from your AI agent. In Claude Code, run:
      </p>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-sand-200 px-4 py-3 font-mono text-sm text-sand-700 dark:bg-sand-950 dark:text-sand-300">
        <code>claude mcp login aicanvas</code>
      </pre>
      <p className="mt-4 text-sm text-sand-600 dark:text-sand-400">
        Another AI agent, or still stuck?{' '}
        <Link
          href="/mcp/docs#stuck"
          className="font-medium text-olive-600 hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-300"
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
      <h1 className="text-center text-xl font-bold leading-tight tracking-tight text-sand-900 dark:text-sand-50">
        Allow your AI agent to use your AI Canvas account?
      </h1>
      <ul className="mt-6 space-y-2.5 text-sm text-sand-700 dark:text-sand-300">
        {[
          'Search AI Canvas and read components',
          'Install the components your plan includes',
          'Use the other AI Canvas resources your plan includes',
        ].map((line) => (
          <li key={line} className="flex items-start gap-2.5">
            <Check weight="regular" size={16} className="mt-0.5 shrink-0 text-olive-600 dark:text-olive-400" />
            {line}
          </li>
        ))}
      </ul>
      {target && (
        <p className="mt-6 rounded-lg border border-red-500/40 px-3 py-2.5 text-xs leading-relaxed text-red-700 dark:border-red-500/30 dark:text-red-400">
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
      </p>
    </Card>
  )
}
