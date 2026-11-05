'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Bolt } from '@/app/_icons/icons/bolt'
import { Key } from '@/app/_icons/icons/key'
import { ShieldCheck } from '@/app/_icons/icons/shield-check'
import { premiumEnabled } from '../../../../lib/flags'
import { buttonClasses } from '../../../components/buttonClasses'
import { CARD } from '../../../components/PageKit'
import { track } from '../../../lib/analytics'
import { usePaywallModal } from '../../../components/billing/PaywallModalProvider'
import { usePremiumDetails } from '../../../components/billing/usePremiumStatus'

/** Display fields from /api/me/subscription (live Paddle read, never ids). */
type SubDetails = {
  plan: 'monthly' | 'annual' | null
  periodEnd: string | null
  scheduledChange: 'cancel' | 'pause' | null
  startedAt: string | null
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * Account billing + token controls. Flag-gated (premium UI). Premium users get
 * the Paddle customer portal ("Manage subscription") while a subscription
 * exists; a Lifetime-only account has nothing to manage or cancel. Free users
 * get an "Upgrade to Premium" CTA that opens the upgrade modal. "Rotate API token" is
 * for any signed-in user: the one-click fix for a leaked token.
 */
export function AccountBilling() {
  const { open: openPaywall } = usePaywallModal()
  const { status, lifetime } = usePremiumDetails()
  const [portalLoading, setPortalLoading] = useState(false)
  const [noPortal, setNoPortal] = useState(false)
  const router = useRouter()
  const [refreshing, startRefresh] = useTransition()
  const [rotateState, setRotateState] = useState<'idle' | 'rotating' | 'done' | 'error'>('idle')
  const [sub, setSub] = useState<SubDetails | null>(null)

  // Live subscription details, premium users only. Any failure leaves `sub`
  // null and the panel falls back to the plain status line — never a guess.
  useEffect(() => {
    if (status !== 'premium') return
    let cancelled = false
    fetch('/api/me/subscription')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!cancelled && j?.subscription) setSub(j.subscription)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [status])

  if (!premiumEnabled()) return null

  const planLabel = sub?.plan === 'annual' ? 'Annual' : sub?.plan === 'monthly' ? 'Monthly' : 'Premium'
  const endDate = sub?.periodEnd ? fmtDate(sub.periodEnd) : ''
  const startDate = sub?.startedAt ? fmtDate(sub.startedAt) : ''

  async function manageSubscription() {
    // Churn early-warning: the portal is where cancel/pause lives. Anonymous
    // count only; the actual cancellation is counted by the Paddle webhook.
    track('Manage Subscription Open', {})
    setPortalLoading(true)
    setNoPortal(false)
    // Open the portal in a NEW tab so AI Canvas stays open. The blank tab is
    // opened synchronously inside the click gesture (popup blockers eat a
    // window.open that happens after an await), then redirected once the
    // session URL is ready.
    const portalTab = window.open('', '_blank')
    try {
      const res = await fetch('/api/billing/portal')
      const { url } = await res.json()
      if (url) {
        if (portalTab) portalTab.location.href = url
        else window.open(url, '_blank', 'noopener,noreferrer') // fallback if blocked
        return
      }
      portalTab?.close()
      setNoPortal(true)
    } catch {
      portalTab?.close()
      setNoPortal(true)
    } finally {
      setPortalLoading(false)
    }
  }

  async function rotateToken() {
    setRotateState('rotating')
    try {
      const res = await fetch('/api/me/token/rotate', { method: 'POST' })
      setRotateState(res.ok ? 'done' : 'error')
      // The token card below is server-rendered; re-read it so it shows the new
      // value, and hold the "Done" line until that re-read has painted.
      if (res.ok) startRefresh(() => router.refresh())
    } catch {
      setRotateState('error')
    }
  }

  return (
    <>
      {/* ── Subscription ──────────────────────────────────────────────── */}
      <section className={`${CARD} p-6 sm:p-8`}>
        <h2 className="text-lg font-bold tracking-tight text-sand-900 dark:text-sand-50">Subscription</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
          {status === 'premium'
            ? lifetime
              ? 'You have Lifetime.'
              : "You're on Premium."
            : status === 'not-premium'
              ? "You're on the Free plan."
              : 'Checking your plan…'}
        </p>

        {lifetime && (
          <p className="mt-3 text-sm font-semibold text-sand-700 dark:text-sand-300">
            Lifetime{' · '}
            <span className="font-normal">Premium for good, nothing to renew</span>
          </p>
        )}

        {status === 'premium' && sub && (
          <div className="mt-3 space-y-1">
            <p className="text-sm font-semibold text-sand-700 dark:text-sand-300">
              {planLabel} subscription
              {endDate && (
                <>
                  {' · '}
                  <span className="font-normal">
                    {sub.scheduledChange === 'cancel'
                      ? 'ends'
                      : sub.scheduledChange === 'pause'
                        ? 'pauses'
                        : 'renews'}{' '}
                    {endDate}
                  </span>
                </>
              )}
            </p>
            {startDate && (
              <p className="text-xs text-sand-600 dark:text-sand-400">Member since {startDate}</p>
            )}
          </div>
        )}

        <div className="mt-5">
          {status === 'premium' && lifetime && !sub ? null : status === 'premium' ? (
            <button
              type="button"
              onClick={manageSubscription}
              disabled={portalLoading}
              className={buttonClasses({ variant: 'outline', size: 'sm' })}
            >
              <Bolt size={15} />
              {portalLoading ? 'Opening…' : 'Manage subscription'}
            </button>
          ) : status === 'not-premium' ? (
            <button
              type="button"
              onClick={() => openPaywall({ reason: 'upgrade' })}
              className={buttonClasses({ variant: 'primary', size: 'sm' })}
            >
              <Bolt size={15} />
              Upgrade to Premium
            </button>
          ) : (
            <button type="button" disabled className={buttonClasses({ variant: 'outline', size: 'sm' })}>
              <Bolt size={15} />
              Checking your plan…
            </button>
          )}
        </div>

        {noPortal && (
          <p className="mt-3 text-xs text-sand-600 dark:text-sand-400">
            No active subscription to manage.
          </p>
        )}

        <p className="mt-6 flex items-start gap-2 border-t border-sand-200 pt-5 text-xs leading-relaxed text-sand-600 dark:border-sand-800 dark:text-sand-400">
          <ShieldCheck size={15} className="mt-px shrink-0 text-accent" />
          <span>
            Billing is securely handled by{' '}
            <span className="font-semibold text-sand-700 dark:text-sand-300">Paddle</span>, our
            payments partner and merchant of record. Your card details go straight to Paddle and
            never touch AI Canvas servers.
          </span>
        </p>
      </section>

      {/* ── API access ────────────────────────────────────────────────── */}
      <section className={`${CARD} p-6 sm:p-8`}>
        <h2 className="text-lg font-bold tracking-tight text-sand-900 dark:text-sand-50">API access</h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-sand-600 dark:text-sand-400">
          Your API token lets your AI agent, the MCP server and the CLI install from your account.
          Giving it to your own agent is expected. Rotate it only if someone else has it: the old one
          stops working at once.
        </p>

        <div className="mt-5">
          <button
            type="button"
            onClick={rotateToken}
            disabled={rotateState === 'rotating' || refreshing}
            className={buttonClasses({ variant: 'outline', size: 'sm' })}
          >
            <Key size={15} />
            {rotateState === 'rotating' || refreshing ? 'Rotating…' : 'Rotate API token'}
          </button>
        </div>

        {rotateState === 'done' && !refreshing && (
          <p className="mt-3 text-xs text-accent">
            Done. The old token no longer works. Copy the new one from the API token card below and
            give it to your AI agent so it updates its AI Canvas setup.
          </p>
        )}
        {rotateState === 'error' && (
          <p className="mt-3 text-xs text-red-700 dark:text-red-500">Could not rotate the token. Try again.</p>
        )}
      </section>
    </>
  )
}
