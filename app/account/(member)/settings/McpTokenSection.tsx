'use client'

import { useState } from 'react'
import { Copy, Check, Eye, EyeSlash } from '@phosphor-icons/react'
import { track } from '../../../lib/analytics'
import { copyText } from '../../../components/useCopied'

// ─── McpTokenSection ──────────────────────────────────────────────────────────
// Shows the signed-in user's AI Canvas API token on /account/settings so they
// can reveal + copy it into their MCP server config. Masked by default (it's a
// live secret that acts like a password); the eye reveals it. The token is read
// server-side in page.tsx and passed in, so there's no loading flash.
// Also shows the personal INSTALL COMMAND (the token baked into a /r URL): the
// registry stubs a signed-out CLI receives point here by name, so this page
// must actually hold a copyable command, not just the bare token.

type Props = { token: string | null }

const MASKED = 'aic_••••••••'

const installCmd = (t: string) => `npx shadcn@latest add "https://aicanvas.me/r/component-name.json?token=${t}"`

export function McpTokenSection({ token }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [cmdCopied, setCmdCopied] = useState(false)

  async function copy() {
    if (!token) return
    const ok = await copyText(token)
    // Anonymous adoption signal — the event carries no token and no account.
    track('MCP Token Copy', { ok })
    if (!ok) return
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function copyCmd() {
    if (!token) return
    const ok = await copyText(installCmd(token))
    track('CLI Copy', { component: 'settings', ok })
    if (!ok) return
    setCmdCopied(true)
    setTimeout(() => setCmdCopied(false), 2000)
  }

  return (
    <section className="rounded-2xl border border-sand-200 bg-sand-100 p-5 dark:border-sand-800 dark:bg-sand-900">
      <h2 className="text-base font-bold text-sand-900 dark:text-sand-50">API token</h2>
      <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
        Copy this token into your MCP server config or CLI install so AI Canvas
        authenticates as your account.
      </p>

      {token ? (
        <>
          <div className="mt-4 flex items-center justify-between gap-2 rounded-lg bg-sand-200 px-4 py-3 dark:bg-sand-950">
            <code className="min-w-0 flex-1 truncate font-mono text-sm text-sand-800 dark:text-sand-300">
              {revealed ? token : MASKED}
            </code>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => setRevealed((v) => !v)}
                className="rounded-md p-1.5 text-sand-600 transition-all hover:text-sand-800 active:scale-90 dark:text-sand-500 dark:hover:text-sand-200"
                aria-label={revealed ? 'Hide token' : 'Reveal token'}
                aria-pressed={revealed}
              >
                {revealed
                  ? <EyeSlash weight="regular" size={16} />
                  : <Eye weight="regular" size={16} />}
              </button>
              <button
                type="button"
                onClick={copy}
                className="rounded-md p-1.5 text-sand-600 transition-all hover:text-sand-800 active:scale-90 dark:text-sand-500 dark:hover:text-sand-200"
                aria-label="Copy token"
              >
                {copied
                  ? <Check weight="regular" size={16} className="text-olive-500" />
                  : <Copy weight="regular" size={16} />}
              </button>
            </div>
          </div>

          <h3 className="mt-5 text-sm font-semibold text-sand-900 dark:text-sand-50">
            Personal install command
          </h3>
          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-sand-200 px-4 py-3 dark:bg-sand-950">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-sand-800 dark:text-sand-300">
              {installCmd(revealed ? token : MASKED)}
            </code>
            <button
              type="button"
              onClick={copyCmd}
              className="shrink-0 rounded-md p-1.5 text-sand-600 transition-all hover:text-sand-800 active:scale-90 dark:text-sand-500 dark:hover:text-sand-200"
              aria-label="Copy install command"
            >
              {cmdCopied
                ? <Check weight="regular" size={16} className="text-olive-500" />
                : <Copy weight="regular" size={16} />}
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-sand-500 dark:text-sand-400">
            Swap component-name for the component you want. While you are signed
            in, every install command on the site already carries this token.
          </p>
        </>
      ) : (
        <div className="mt-4 rounded-lg border border-sand-200 bg-sand-100 px-4 py-3 text-sm text-sand-600 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-400">
          Your token isn&rsquo;t set up yet. Install the AI Canvas MCP once, or
          reach out to support if this persists.
        </div>
      )}
    </section>
  )
}
