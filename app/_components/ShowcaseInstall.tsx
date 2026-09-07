'use client'

import Link from 'next/link'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Lightning, Terminal } from '@phosphor-icons/react'
import { useSession } from '../components/auth/SessionProvider'
import { usePaywallModal } from '../components/billing/PaywallModalProvider'
import { usePremiumStatus } from '../components/billing/usePremiumStatus'
import { Button, buttonClasses } from '../components/Button'
import { INSTALL_CONTENTS } from '../lib/install-contents.generated'

interface InstallAction {
  slug: string
  label: string
  description?: string[]
}

// Showcase install — the SAME top-bar pattern as the brain reader and the
// template pages: install button(s) next to the auth pill, each opening a CLI
// popover (One command / Copy CLI / masked tokenized command / contents
// bullets). Portaled into the top-bar slot on desktop; a floating fallback
// below md (where the top bar is hidden). Premium-gated: a resolved free/anon
// tier sees "Unlock with Premium" → /pricing.
export function ShowcaseInstall({ installs }: { installs: InstallAction[] }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  useEffect(() => {
    setSlot(document.getElementById('andromeda-install-slot'))
  }, [])

  return (
    <>
      {slot && createPortal(<ShowcaseInstallButtons installs={installs} />, slot)}
      {/* The top bar is hidden below md, so float the install control top-right. */}
      <div className="fixed right-3 top-3 z-50 md:hidden">
        <ShowcaseInstallButtons installs={installs} />
      </div>
    </>
  )
}

// Self-contained button group + popover (own state, so the desktop portal and
// the mobile fallback never share a popover).
function ShowcaseInstallButtons({ installs }: { installs: InstallAction[] }) {
  const { user } = useSession()
  const { open: openPaywall } = usePaywallModal()
  const status = usePremiumStatus()
  // Premium AND the in-flight 'unknown' window see the CLI popover; only a
  // resolved free/anon tier is routed to /pricing (never flash upsell at a
  // paying customer). handleInstall fails open, so defaulting to Install is safe.
  const canInstall = status !== 'not-premium'
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const active = installs.find((i) => i.slug === openSlug) ?? null

  // Tokenized command so the registry attributes the pull to the account
  // (these are premium; a bare command would 402). Masked on screen; copy
  // writes the real token.
  const [token, setToken] = useState<string | null>(null)
  useEffect(() => {
    if (!user) return
    let cancelled = false
    const refresh = () =>
      fetch('/api/me/token')
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) setToken(d?.token ?? null)
        })
        .catch(() => {})
    refresh()
    window.addEventListener('focus', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('focus', refresh)
    }
  }, [user])
  const userToken = user ? token : null
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
    try {
      await navigator.clipboard.writeText(cliCommand)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
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
        <Lightning weight="regular" size={13} />
        Unlock with Premium
      </Link>
    )
  }

  return (
    <div className="relative flex items-center gap-1.5" ref={ref}>
      {installs.map((action, i) => (
        <Button
          key={action.slug}
          variant={i === installs.length - 1 ? 'primary' : 'outline'}
          size="xs"
          onClick={() => handleInstall(action.slug)}
        >
          <Terminal weight="regular" size={13} />
          {action.label}
        </Button>
      ))}

      {active && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(480px,calc(100vw-24px))] overflow-hidden rounded-xl border border-sand-200 bg-sand-100 shadow-2xl dark:border-sand-800 dark:bg-sand-900">
          <div className="space-y-3 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">
                  {active.label}
                </span>
                <span className="rounded-md border border-olive-500/30 bg-olive-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-olive-600 dark:text-olive-400">
                  One command
                </span>
              </div>
              <Button variant="outline" size="xs" onClick={handleCopy} aria-label="Copy CLI command">
                {copied ? (
                  <>
                    <Check weight="regular" size={13} className="text-olive-600 dark:text-olive-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy weight="regular" size={13} />
                    Copy CLI
                  </>
                )}
              </Button>
            </div>
            <div className="rounded-lg bg-sand-200 dark:bg-sand-950 px-4 py-3">
              <code className="block break-all font-mono text-xs text-sand-700 dark:text-sand-300">{cliCommandMasked}</code>
            </div>
            <div className="space-y-1.5">
              {bullets.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check weight="bold" size={12} className="shrink-0 text-olive-600 dark:text-olive-400" />
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
