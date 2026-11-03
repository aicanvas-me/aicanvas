'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Copy } from '@/app/_icons/icons/copy'
import { Check } from '@/app/_icons/icons/check'
import { Eye } from '@/app/_icons/icons/eye'
import { EyeOff } from '@/app/_icons/icons/eye-off'
import { track } from '../../../lib/analytics'
import { copyText } from '../../../components/useCopied'
import { CARD } from '../../../components/PageKit'

// ─── McpTokenSection ──────────────────────────────────────────────────────────
// Shows the signed-in user's AI Canvas API token on /account/settings, the
// by-hand fallback: every Copy CLI button and the /mcp setup commands already
// carry it. Masked by default so it stays off screen shares; the eye reveals it.
// The token is read server-side in page.tsx and passed in, so there's no
// loading flash.

type Props = { token: string | null }

const MASKED = 'aic_••••••••'

export function McpTokenSection({ token }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  async function copy() {
    if (!token) return
    const ok = await copyText(token)
    // Anonymous adoption signal — the event carries no token and no account.
    track('MCP Token Copy', { ok })
    if (!ok) return
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className={`${CARD} p-6 sm:p-8`}>
      <h2 className="text-lg font-bold tracking-tight text-sand-900 dark:text-sand-50">API token</h2>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-sand-600 dark:text-sand-400">
        You don&rsquo;t need to copy this token for installs. Open any component and
        press <span className="font-semibold">Copy CLI</span>. The command it copies
        already includes your token.
      </p>

      {token ? (
        <>
          <div className="mt-5 flex items-center justify-between gap-2 rounded-inset border border-sand-200 bg-sand-50 px-4 py-3 dark:border-sand-800 dark:bg-sand-950">
            <code className="min-w-0 flex-1 truncate font-mono text-sm text-sand-800 dark:text-sand-300">
              {revealed ? token : MASKED}
            </code>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => setRevealed((v) => !v)}
                className="rounded-control p-1.5 text-sand-600 transition-all hover:text-sand-800 active:scale-90 dark:text-sand-500 dark:hover:text-sand-200"
                aria-label={revealed ? 'Hide token' : 'Reveal token'}
                aria-pressed={revealed}
              >
                {revealed
                  ? <EyeOff size={16} />
                  : <Eye size={16} />}
              </button>
              <button
                type="button"
                onClick={copy}
                className="rounded-control p-1.5 text-sand-600 transition-all hover:text-sand-800 active:scale-90 dark:text-sand-500 dark:hover:text-sand-200"
                aria-label="Copy token"
              >
                {copied
                  ? <Check size={16} className="text-success" />
                  : <Copy size={16} />}
              </button>
            </div>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-sand-600 dark:text-sand-400">
            You only need it to set things up by hand, or to give to your AI agent. The
            Copy CLI button and the{' '}
            <Link href="/mcp" className="font-medium text-olive-600 transition-colors hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-300">
              MCP setup page
            </Link>{' '}
            already include it.
          </p>
        </>
      ) : (
        <div className="mt-5 rounded-inset border border-sand-200 bg-sand-50 px-4 py-3 text-sm leading-relaxed text-sand-600 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-400">
          Your token isn&rsquo;t set up yet. Install the AI Canvas MCP once, or
          reach out to support if this persists.
        </div>
      )}
    </section>
  )
}
