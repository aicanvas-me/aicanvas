'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Robot, Warning } from '@phosphor-icons/react'
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

  async function run(key: string, body: { id: string } | { all: true }) {
    setBusy(key)
    setFailed(false)
    const ok = await post('/api/me/agents', body)
    setBusy(null)
    if (!ok) return setFailed(true)
    startRefresh(() => router.refresh())
  }

  return (
    <section id="ai-agents" className="scroll-mt-20 rounded-2xl border border-sand-200 bg-sand-100 p-5 dark:border-sand-800 dark:bg-sand-900">
      <h2 className="text-base font-bold text-sand-900 dark:text-sand-50">Connected AI agents</h2>
      <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
        AI agents you allowed to use your account through the AI Canvas MCP.{' '}
        <Link href="/account/connect" className="font-medium text-olive-600 hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-300">
          Connect an AI agent
        </Link>
      </p>

      {agents.length === 0 ? (
        <p className="mt-4 rounded-lg bg-sand-200 px-4 py-3 text-sm text-sand-600 dark:bg-sand-950 dark:text-sand-400">
          No AI agents connected.
        </p>
      ) : (
        <>
          <ul className="mt-4 space-y-2">
            {agents.map((agent) => (
              <li key={agent.id} className="rounded-lg bg-sand-200 px-4 py-3 dark:bg-sand-950">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <Robot weight="regular" size={20} className="mt-0.5 shrink-0 text-sand-600 dark:text-sand-400" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-sand-900 dark:text-sand-50">{agent.name}</p>
                      <p className="mt-0.5 text-xs text-sand-600 dark:text-sand-400">
                        {agent.destination} · Connected {day(agent.connectedAt)}
                        {agent.lastUsedAt ? ` · Last used ${day(agent.lastUsedAt)}` : ''}
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
                    <Warning weight="regular" size={14} className="mt-0.5 shrink-0" />
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
