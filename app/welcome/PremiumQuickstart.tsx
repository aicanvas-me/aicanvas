'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from '@/app/_icons/icons/check'
import { Copy } from '@/app/_icons/icons/copy'
import { Eye } from '@/app/_icons/icons/eye'
import { EyeOff } from '@/app/_icons/icons/eye-off'
import { Info } from '@/app/_icons/icons/info'
import { track } from '../lib/analytics'
import { copyText } from '../components/useCopied'

// ─── PremiumQuickstart ────────────────────────────────────────────────────────
// The quiet helper card on the premium /welcome view. The page has already led
// with the advantage (every install command on the site carries your token) and
// the two browse CTAs; this card serves people already sitting in a terminal or
// wiring up MCP. Buyers who never found their token installed nothing (verified
// against real accounts) — the card stays visible on the page, never behind a
// click. Token masked until revealed; copy always copies the real value.
// Dressed as the pricing card: heading on the card, the two values in the inset
// well under it. The page is pinned dark, so these are dark values only.

const MASK = 'aic_••••••••'

// One value row's pieces, shared so the command and the token line up.
const LABEL = 'text-sm font-semibold text-sand-100'
const WELL = 'mt-2.5 flex items-center gap-1 rounded-xl border border-sand-800 bg-sand-900 py-1.5 pr-1.5 pl-4'
const CODE = 'min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-1.5 font-mono text-xs text-sand-300'
const ICON_BTN =
  'shrink-0 rounded-control p-2 text-sand-400 transition-all hover:bg-sand-800 hover:text-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-90'
const HELP = 'mt-2.5 text-sm leading-relaxed text-sand-400'

export function PremiumQuickstart({ token }: { token: string | null }) {
  const [revealed, setRevealed] = useState(false)
  const [cmdCopied, setCmdCopied] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)

  const cmd = (t: string) => `npx shadcn@latest add "https://aicanvas.me/r/andromeda-pro-all.json?token=${t}"`

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
      <div className="mx-auto mt-14 flex w-full max-w-xl items-start gap-2.5 rounded-3xl border border-sand-800 bg-sand-900 px-5 py-5 text-left text-sm leading-relaxed text-sand-300 sm:mt-16 sm:px-6">
        <Info size={16} className="mt-0.5 shrink-0 text-accent" />
        <span className="text-pretty">
          Your install token isn&rsquo;t set up yet. Check{' '}
          <Link href="/account/settings" className="font-semibold text-accent transition-colors hover:text-accent/70">
            account settings
          </Link>{' '}
          in a moment, or reach out to support if it stays missing.
        </span>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-14 w-full max-w-3xl rounded-3xl border border-sand-800 bg-sand-900 p-2 text-left sm:mt-16">
      <div className="px-4 pt-5 pb-5 sm:px-6 sm:pt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-sand-400">Quickstart</p>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-sand-50">
          Already in a terminal or setting up MCP?
        </h2>
      </div>

      <div className="space-y-7 rounded-2xl bg-sand-950 px-4 py-6 sm:px-6">
        <div>
          <p className={LABEL}>Install command</p>
          <div className={WELL}>
            <code className={CODE}>{cmd(revealed ? token : MASK)}</code>
            <button type="button" onClick={copyCmd} aria-label="Copy install command" className={ICON_BTN}>
              {cmdCopied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
            </button>
          </div>
          <p className={HELP}>
            Installs the full Andromeda Pro design system. Swap the file name for any
            component or template.
          </p>
        </div>

        <div>
          <p className={LABEL}>MCP token</p>
          <div className={WELL}>
            <code className={CODE}>AICANVAS_TOKEN={revealed ? token : MASK}</code>
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-label={revealed ? 'Hide token' : 'Reveal token'}
              aria-pressed={revealed}
              className={ICON_BTN}
            >
              {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button type="button" onClick={copyToken} aria-label="Copy MCP token" className={ICON_BTN}>
              {tokenCopied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
            </button>
          </div>
          <p className={HELP}>
            For AI agents and the AI Canvas MCP server. Keep it private. Both live in{' '}
            <Link href="/account/settings" className="font-semibold text-accent transition-colors hover:text-accent/70">
              account settings
            </Link>{' '}
            too.
          </p>
        </div>
      </div>
    </div>
  )
}
