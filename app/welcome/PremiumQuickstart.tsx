'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, Eye, EyeSlash } from '@phosphor-icons/react'
import { track } from '../lib/analytics'
import { copyText } from '../components/useCopied'

// ─── PremiumQuickstart ────────────────────────────────────────────────────────
// The quiet helper card on the premium /welcome view. The page has already led
// with the advantage (every install command on the site carries your token) and
// the two browse CTAs; this card serves people already sitting in a terminal or
// wiring up MCP. Buyers who never found their token installed nothing (verified
// against real accounts) — the card stays visible on the page, never behind a
// click. Token masked until revealed; copy always copies the real value.

const MASK = 'aic_••••••••'

export function PremiumQuickstart({ token }: { token: string | null }) {
  const [revealed, setRevealed] = useState(false)
  const [cmdCopied, setCmdCopied] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)

  const cmd = (t: string) => `npx shadcn@latest add "https://aicanvas.me/r/andromeda-all.json?token=${t}"`

  async function copyCmd() {
    if (!token) return
    const ok = await copyText(cmd(token))
    track('CLI Copy', { component: 'welcome-quickstart', ok })
    if (!ok) return
    setCmdCopied(true)
    setTimeout(() => setCmdCopied(false), 2000)
  }

  async function copyToken() {
    if (!token) return
    const ok = await copyText(`AICANVAS_TOKEN=${token}`)
    track('MCP Token Copy', { ok })
    if (!ok) return
    setTokenCopied(true)
    setTimeout(() => setTokenCopied(false), 2000)
  }

  if (!token) {
    return (
      <div className="mx-auto mt-10 w-full max-w-2xl rounded-2xl border border-sand-800 bg-sand-900 p-5 text-left text-sm leading-relaxed text-sand-300">
        Your install token isn&rsquo;t set up yet. Check{' '}
        <Link href="/account/settings" className="font-medium text-olive-400 transition-colors hover:text-olive-300">
          account settings
        </Link>{' '}
        in a moment, or reach out to support if it stays missing.
      </div>
    )
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-2xl rounded-2xl border border-sand-800 bg-sand-900/50 p-5 text-left">
      <h2 className="text-sm font-semibold text-sand-200">
        Already in a terminal or setting up MCP?
      </h2>

      <p className="mt-3 text-xs font-medium text-sand-500">Install command</p>
      <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-sand-950 px-4 py-3">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-sand-300">
          {cmd(revealed ? token : MASK)}
        </code>
        <button
          type="button"
          onClick={copyCmd}
          aria-label="Copy install command"
          className="shrink-0 rounded-md p-1.5 text-sand-500 transition-all hover:text-sand-200 active:scale-90"
        >
          {cmdCopied ? <Check weight="regular" size={16} className="text-olive-400" /> : <Copy weight="regular" size={16} />}
        </button>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-sand-500">
        Installs the full Andromeda design system. Swap the file name for any
        component or template.
      </p>

      <p className="mt-4 text-xs font-medium text-sand-500">MCP token</p>
      <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-sand-950 px-4 py-3">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-sand-300">
          AICANVAS_TOKEN={revealed ? token : MASK}
        </code>
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? 'Hide token' : 'Reveal token'}
          aria-pressed={revealed}
          className="shrink-0 rounded-md p-1.5 text-sand-500 transition-all hover:text-sand-200 active:scale-90"
        >
          {revealed ? <EyeSlash weight="regular" size={16} /> : <Eye weight="regular" size={16} />}
        </button>
        <button
          type="button"
          onClick={copyToken}
          aria-label="Copy MCP token"
          className="shrink-0 rounded-md p-1.5 text-sand-500 transition-all hover:text-sand-200 active:scale-90"
        >
          {tokenCopied ? <Check weight="regular" size={16} className="text-olive-400" /> : <Copy weight="regular" size={16} />}
        </button>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-sand-500">
        For AI agents and the AI Canvas MCP server. Keep it private. Both live in{' '}
        <Link href="/account/settings" className="font-medium text-olive-400 transition-colors hover:text-olive-300">
          account settings
        </Link>{' '}
        too.
      </p>
    </div>
  )
}
