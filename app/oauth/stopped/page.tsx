import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { hostedMcpOAuthEnabled } from '../../../lib/flags'
import { ChevronDown } from '@/app/_icons/icons/chevron-down'
import { HOSTED_MCP_URL } from '../../lib/hosted-mcp'
import { Card } from '../Card'

// ─── /oauth/stopped ──────────────────────────────────────────────────────────
// Where an AI agent's sign-in lands when it cannot go on and cannot safely be sent back to
// the agent. The authorize endpoint passes a reason code, never text, so nobody can put
// their own words on this page.

export const metadata: Metadata = {
  title: 'Sign-in stopped',
  robots: { index: false, follow: false },
}

const linkClass = 'font-semibold text-accent transition-colors hover:text-accent/70'
const codeClass =
  'overflow-x-auto rounded-inset border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950 px-4 py-3 font-mono text-sm text-sand-700 dark:text-sand-300'

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

// How to remove AI Canvas and add it back, per agent, in the connect card's tab order.
// Native <details>, so it works with no JavaScript on a page reached mid-sign-in.
const RECONNECT: { agent: string; code?: string; text?: string }[] = [
  {
    agent: 'Claude Code',
    code: `claude mcp remove aicanvas\nclaude mcp add --transport http --scope user aicanvas ${HOSTED_MCP_URL}\nclaude mcp login aicanvas`,
  },
  { agent: 'Claude', text: 'Claude app or claude.ai → Settings → Customize → Connectors → remove aicanvas → Add → custom connector with the address below → sign in → Allow.' },
  { agent: 'ChatGPT', text: 'ChatGPT desktop app → Settings → Plugins → MCPs → remove aicanvas → Add MCP server with the address below → Authenticate → Allow.' },
  {
    agent: 'Codex',
    code: `codex mcp remove aicanvas\ncodex mcp add aicanvas --url ${HOSTED_MCP_URL}\ncodex mcp login aicanvas`,
  },
  { agent: 'VS Code', text: 'Command Palette → Authentication: Remove Dynamic Authentication Providers → AI Canvas. Then Start above aicanvas in .vscode/mcp.json → sign in → Allow.' },
  { agent: 'Cursor', text: 'Remove the aicanvas entry from ~/.cursor/mcp.json and add it again with the address below. Cursor Settings → Tools & MCPs → Connect → sign in → Allow.' },
  { agent: 'Any other AI agent', text: 'Remove the AI Canvas server, add it again with the address below, and sign in when it asks.' },
]

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
          <p className="mt-5 text-xs font-semibold text-sand-600 dark:text-sand-400">Pick your AI agent:</p>
          <div className="mt-2 divide-y divide-sand-200 rounded-inset border border-sand-200 dark:divide-sand-800 dark:border-sand-800">
            {RECONNECT.map(({ agent, code, text }) => (
              <details key={agent} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-2.5 text-sm font-semibold text-sand-900 dark:text-sand-50 [&::-webkit-details-marker]:hidden">
                  {agent}
                  <ChevronDown size={14} className="text-sand-600 transition-transform group-open:rotate-180 dark:text-sand-400" />
                </summary>
                <div className="px-3.5 pb-3.5">
                  {code ? (
                    <pre className={codeClass}>
                      <code>{code}</code>
                    </pre>
                  ) : (
                    <p className="text-sm text-sand-700 dark:text-sand-300">{text}</p>
                  )}
                </div>
              </details>
            ))}
          </div>
          <p className="mt-4 text-xs font-semibold text-sand-600 dark:text-sand-400">The address:</p>
          <pre className={`${codeClass} mt-2`}>
            <code>{HOSTED_MCP_URL}</code>
          </pre>
        </>
      )}
      <p className="mt-4 text-sm text-sand-600 dark:text-sand-400">
        Still stuck?{' '}
        <Link href="/docs/mcp#stuck" className={linkClass}>
          Read the fix
        </Link>
        .
      </p>
    </Card>
  )
}
