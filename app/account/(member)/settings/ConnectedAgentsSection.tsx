'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bot } from '@/app/_icons/icons/bot'
import { Plus } from '@/app/_icons/icons/plus'
import { TriangleAlert } from '@/app/_icons/icons/triangle-alert'
import { CARD } from '../../../components/PageKit'
import { buttonClasses } from '../../../components/buttonClasses'

// ─── ConnectedAgentsSection ───────────────────────────────────────────────────
// Every AI agent this account allowed on the hosted MCP's consent screen. The new-
// connection email links here (#ai-agents). One calm action per agent; changing the API
// key lives in the API key section, not here.

export type ConnectedAgent = {
  id: string
  name: string
  destination: string
  connectedAt: string
  lastUsedAt: string | null
  staleRefreshAt: string | null
  countryMismatch: string | null
}

const day = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
// UTC, like day(): the row renders on the server first, so a local time would mismatch.
const time = (iso: string) =>
  `${new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC`

function connectedLine(agent: ConnectedAgent, twin: boolean) {
  const connected = `Connected ${day(agent.connectedAt)}${twin ? `, ${time(agent.connectedAt)}` : ''}`
  const used = agent.lastUsedAt ? `Last used ${day(agent.lastUsedAt)}` : twin ? 'Never used' : null
  return [agent.destination, connected, used].filter(Boolean).join(' · ')
}

async function post(url: string, body?: unknown): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    return res.ok
  } catch {
    return false
  }
}

export function ConnectedAgentsSection({ agents }: { agents: ConnectedAgent[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [, startRefresh] = useTransition()
  // Rows with the same name and destination look identical; those get the time and use state.
  const sameAs = (a: ConnectedAgent) => agents.filter((b) => b.name === a.name && b.destination === a.destination).length

  async function run(key: string, body: { id: string } | { all: true }) {
    setBusy(key)
    setFailed(false)
    const ok = await post('/api/me/agents', body)
    setBusy(null)
    if (!ok) return setFailed(true)
    startRefresh(() => router.refresh())
  }

  return (
    <section id="ai-agents" className={`scroll-mt-20 ${CARD} p-6 sm:p-8`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-sand-900 dark:text-sand-50">Connected AI agents</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-sand-600 dark:text-sand-400">
            AI agents you allowed to use your account through the AI Canvas MCP. Each one signs in on its own.
          </p>
        </div>
        {agents.length > 0 && (
          <Link href="/account/connect" className={buttonClasses({ variant: 'outline', size: 'sm' })}>
            <Plus size={16} />
            Connect another
          </Link>
        )}
      </div>

      {agents.length === 0 ? (
        <div className="mt-5 flex flex-col items-start gap-4 rounded-inset border border-sand-200 bg-sand-50 px-4 py-4 dark:border-sand-800 dark:bg-sand-950 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-sand-600 dark:text-sand-400">
            No AI agents connected yet. Add AI Canvas to Claude Code, Cursor, Codex or VS Code and sign in once.
          </p>
          <Link href="/account/connect" className={`shrink-0 ${buttonClasses({ variant: 'primary', size: 'md' })}`}>
            <Plus size={16} />
            Connect an AI agent
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-5 space-y-2">
            {agents.map((agent) => (
              <li key={agent.id} className="rounded-inset border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950 px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <Bot size={20} className="mt-0.5 shrink-0 text-sand-600 dark:text-sand-400" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-sand-900 dark:text-sand-50">{agent.name}</p>
                      <p className="mt-0.5 text-xs text-sand-600 dark:text-sand-400">
                        {connectedLine(agent, sameAs(agent) > 1)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => run(agent.id, { id: agent.id })}
                    className={buttonClasses({ variant: 'outline', size: 'sm' })}
                  >
                    {busy === agent.id ? 'Disconnecting…' : 'Disconnect'}
                  </button>
                </div>
                {(agent.countryMismatch || agent.staleRefreshAt) && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-red-700 dark:text-red-400">
                    <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                    {agent.countryMismatch ?? `An old sign-in of this agent was used on ${day(agent.staleRefreshAt!)}.`}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {agents.length > 1 && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => run('all', { all: true })}
              className={`mt-4 ${buttonClasses({ variant: 'outline', size: 'sm' })}`}
            >
              {busy === 'all' ? 'Disconnecting…' : 'Disconnect all'}
            </button>
          )}
        </>
      )}

      {failed && (
        <p role="alert" className="mt-3 text-xs text-red-700 dark:text-red-400">
          That did not go through. Please try again.
        </p>
      )}
    </section>
  )
}
