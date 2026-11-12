'use client'

import Link from 'next/link'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { Check } from '@/app/_icons/icons/check'
import { Copy } from '@/app/_icons/icons/copy'
import { Bolt } from '@/app/_icons/icons/bolt'
import { Terminal } from '@/app/_icons/icons/terminal'
import { useTopBarInstallSlot } from '../components/PageCrumbs'
import { usePaywallModal } from '../components/billing/PaywallModalProvider'
import { usePremiumStatus } from '../components/billing/usePremiumStatus'
import { Button } from '../components/Button'
import { buttonClasses } from '../components/buttonClasses'
import { INSTALL_CONTENTS } from '../lib/install-contents.generated'
import { useInstallToken } from '../_lib/useInstallToken'
import { useKeepInViewport } from '../_lib/useKeepInViewport'
import { copyText } from '../components/useCopied'
import { track } from '../lib/analytics'
import { InstallCopiedToast } from './InstallCopiedToast'

interface InstallAction {
  slug: string
  label: string
  description?: string[]
  /**
   * This item installs on a free account, so its command is shown to everyone.
   * Set it only for content the registry itself serves on the free lane: a free
   * system's components bundle or template, never a paid system's item, a brain
   * or an `-all` bundle.
   */
  free?: boolean
}

// Showcase install — the SAME pattern as the brain reader: install button(s)
// in the crumb row above the page title (PageCrumbs), each opening a CLI
// popover (One command / Copy Command / masked tokenized command / contents
// bullets). Portaled into the row's slot, which is drawn at every width.
// Premium-gated: a resolved free/anon tier sees "Unlock with Premium" →
// /pricing.
export function ShowcaseInstall({ installs }: { installs: InstallAction[] }) {
  const slot = useTopBarInstallSlot()
  return slot ? createPortal(<ShowcaseInstallButtons installs={installs} />, slot) : null
}

// Self-contained button group + popover (own state, so two copies never share a
// popover).
function ShowcaseInstallButtons({ installs }: { installs: InstallAction[] }) {
  const { open: openPaywall } = usePaywallModal()
  const status = usePremiumStatus()
  // Premium AND the in-flight 'unknown' window see the CLI popover; only a
  // resolved free/anon tier is routed to /pricing (never flash upsell at a
  // paying customer). handleInstall fails open, so defaulting to Install is safe.
  const premiumOk = status !== 'not-premium'
  // A group holding even one free item still renders: hiding the whole control
  // behind the upsell is what kept MIT components out of reach of the people
  // they are free for. The per-item check below still sends a paid item to the
  // paywall.
  const canInstall = premiumOk || installs.some((a) => a.free)
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const active = installs.find((i) => i.slug === openSlug) ?? null
  const panelRef = useKeepInViewport<HTMLDivElement>(active !== null)

  // Tokenized command so the registry attributes the pull to the account
  // (these are premium; a bare command would 402). Masked on screen; copy
  // writes the real token.
  const userToken = useInstallToken()
  const commandFor = (slug: string, masked: boolean) => {
    const r = userToken
      ? `"https://aicanvas.me/r/${slug}.json?token=${masked ? 'aic_••••••••' : userToken}"`
      : `@aicanvas/${slug}`
    return `npx shadcn@latest add ${r}`
  }
  const cliCommand = active ? commandFor(active.slug, false) : ''
  const cliCommandMasked = active ? commandFor(active.slug, true) : ''
  const bullets = active
    ? active.description ?? INSTALL_CONTENTS[active.slug] ?? [`Installs ${active.label}.`]
    : []

  async function handleInstall(slug: string) {
    if (!premiumOk && !installs.find((a) => a.slug === slug)?.free) {
      openPaywall({ reason: 'premium-only' })
      return
    }
    try {
      const res = await fetch(`/api/me/install-check?slug=${slug}`)
      const d = await res.json().catch(() => null)
      if (d?.blocked) {
        openPaywall({ reason: 'premium-only', limit: d.limit, resetAt: d.resetAt })
        return
      }
    } catch {}
    setCopied(false)
    setOpenSlug((prev) => (prev === slug ? null : slug))
  }

  async function handleCopy() {
    if (!active) return
    const ok = await copyText(cliCommand)
    track('CLI Copy', { component: active.slug, ok })
    if (!ok) return
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (openSlug === null) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenSlug(null)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenSlug(null)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [openSlug])

  if (!canInstall) {
    return (
      <Link href="/pricing" className={buttonClasses({ variant: 'primary', size: 'xs' })}>
        <Bolt size={13} />
        Unlock with Premium
      </Link>
    )
  }

  return (
    <div className="relative flex items-center gap-1.5" ref={ref}>
      <InstallCopiedToast show={copied} />
      {installs.map((action, i) => (
        <Button
          key={action.slug}
          variant={i === installs.length - 1 ? 'primary' : 'outline'}
          size="xs"
          onClick={() => handleInstall(action.slug)}
        >
          <Terminal size={13} />
          {action.label}
        </Button>
      ))}

      {active && (
        <div ref={panelRef} className="absolute right-0 top-full z-50 mt-2 w-[min(480px,calc(100vw-24px))] overflow-hidden rounded-card border border-sand-200 bg-sand-100 shadow-2xl dark:border-sand-800 dark:bg-sand-900">
          <div className="space-y-3 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">
                  {active.label}
                </span>
                <span className="rounded-full border border-accent/30 bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                  One command
                </span>
              </div>
              <Button variant="outline" size="xs" onClick={handleCopy} aria-label="Copy install command">
                {copied ? (
                  <>
                    <Check size={13} className="text-success" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    Copy Command
                  </>
                )}
              </Button>
            </div>
            <div className="rounded-inset bg-sand-200 dark:bg-sand-950 px-4 py-3">
              <code className="block break-all font-mono text-xs text-sand-700 dark:text-sand-300">{cliCommandMasked}</code>
            </div>
            <div className="space-y-1.5">
              {bullets.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check size={12} className="shrink-0 text-accent" />
                  <p className="text-xs leading-relaxed text-sand-600 dark:text-sand-400">{line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
