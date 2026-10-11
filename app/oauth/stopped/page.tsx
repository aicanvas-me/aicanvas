import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { hostedMcpOAuthEnabled } from '../../../lib/flags'
import { HOSTED_MCP_URL } from '../../mcp/ConnectAgentCard'
import { Card } from '../Card'

// ─── /oauth/stopped ──────────────────────────────────────────────────────────
// Where an AI agent's sign-in lands when it cannot go on and cannot safely be sent back to
// the agent. The authorize endpoint passes a reason code, never text, so nobody can put
// their own words on this page.

export const metadata: Metadata = {
  title: 'Sign-in stopped',
  robots: { index: false, follow: false },
}

const linkClass = 'font-medium text-olive-600 hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-300'
const codeClass =
  'overflow-x-auto rounded-lg bg-sand-200 px-4 py-3 font-mono text-sm text-sand-700 dark:bg-sand-950 dark:text-sand-300'

const COPY = {
  // The agent kept a registration this server no longer accepts. Starting again reuses it,
  // so only removing the server and adding it back gets a fresh one.
  unregistered: {
    title: 'Your AI agent needs to connect again',
    body: 'Its saved connection to AI Canvas is no longer valid. Remove AI Canvas from your AI agent and add it again, and the sign-in starts fresh.',
    fresh: true,
  },
  redirect: {
    title: 'This sign-in was stopped',
    body: 'Your AI agent asked to return somewhere it never registered, so we stopped the sign-in to keep your account safe. Start it again from your AI agent. If this keeps happening, remove AI Canvas from the agent and add it again.',
    fresh: true,
  },
  invalid: {
    title: 'This sign-in was stopped',
    body: 'The sign-in request from your AI agent was incomplete. Start the sign-in again from your AI agent.',
    fresh: false,
  },
} as const

export default async function StoppedPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  if (!hostedMcpOAuthEnabled()) notFound()
  const { reason } = await searchParams
  const copy = COPY[reason === 'unregistered' || reason === 'redirect' ? reason : 'invalid']

  return (
    <Card>
      <h1 className="text-xl font-bold leading-tight tracking-tight text-sand-900 dark:text-sand-50">{copy.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-sand-700 dark:text-sand-300">{copy.body}</p>
      {copy.fresh && (
        <>
          <p className="mt-4 text-sm text-sand-700 dark:text-sand-300">In Claude Code, run these two, then sign in again:</p>
          <pre className={`${codeClass} mt-2`}>
            <code>{`claude mcp remove aicanvas\nclaude mcp add --transport http --scope user aicanvas ${HOSTED_MCP_URL}`}</code>
          </pre>
        </>
      )}
      <p className="mt-4 text-sm text-sand-600 dark:text-sand-400">
        Another AI agent, or still stuck?{' '}
        <Link href="/mcp/docs#stuck" className={linkClass}>
          Read the fix
        </Link>
        .
      </p>
    </Card>
  )
}
