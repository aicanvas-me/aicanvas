'use client'
import { initializePaddle, type CheckoutSettings, type Paddle, type PaddleEventData } from '@paddle/paddle-js'
import type { CheckoutEventsData } from '@paddle/paddle-js/types/checkout/events'
import { beacon } from '../analytics'
import { forgetCheckout, rememberCheckout } from '../checkout-handoff'

let paddlePromise: Promise<Paddle | undefined> | null = null

// Local UI only (spinner, totals). Runs after the activation handler below.
const uiListeners = new Set<(e: PaddleEventData) => void>()
export function subscribePaddleEvents(fn: (e: PaddleEventData) => void): () => void {
  uiListeners.add(fn)
  return () => {
    uiListeners.delete(fn)
  }
}

// Overlay lifecycle steps counted anonymously (event name only, no checkout
// data) — makes abandonment and card failures visible next to completions.
const CHECKOUT_STEPS = new Set([
  'checkout.loaded',
  'checkout.payment.selected',
  'checkout.payment.failed',
  'checkout.error',
  'checkout.closed',
  'checkout.completed',
])

// A buyer whose payment just made a brand-new account is signed in on this
// browser (app/api/checkout/sign-in). Asks every 2.5 s for up to 30 s while the
// webhook makes the account; false sends the buyer to the email link instead.
async function signInAfterCheckout(transactionId: string | undefined): Promise<boolean> {
  if (!transactionId) return false
  const until = Date.now() + 30_000
  while (Date.now() < until) {
    const res = await fetch('/api/checkout/sign-in', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ transactionId }),
    }).catch(() => null)
    const status = res?.ok ? (await res.json().catch(() => null))?.status : null
    if (status === 'signed-in') return true
    if (status !== 'pending') return false
    await new Promise((r) => setTimeout(r, 2500))
  }
  return false
}

/** Lazily initialize Paddle.js once. */
export function getPaddle(): Promise<Paddle | undefined> {
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as 'sandbox' | 'production') ?? 'sandbox',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? '',
      // Verified-optimistic activation: on success we POST the transaction id
      // to be checked against the Paddle API server-side before any DB write
      // (a session alone never grants premium). Only leave for /welcome on a
      // confirmed response; otherwise tell the user the webhook will finish it —
      // a blind redirect would silently dump a paying user on a claim page that
      // cannot explain the delay.
      eventCallback: (e) => {
        if (e?.name && CHECKOUT_STEPS.has(e.name)) {
          beacon('Checkout Step', { step: e.name })
        }
        if (e?.name === 'checkout.completed') {
          const data = e.data as CheckoutEventsData | undefined
          const transactionId = data?.transaction_id
          fetch('/api/checkout/completed', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ transactionId }),
          })
            .then(async (res) => {
              if (!res.ok) {
                console.error('[paddle] activation deferred to webhook, status', res.status)
                alert('Payment received. Your account is being activated, this can take a minute. Refresh shortly; contact support if it persists.')
                window.location.reload()
                return
              }
              // Signed out: /welcome names the address the sign-in link went to.
              const body = await res.json().catch(() => null)
              if (body?.status === 'pending-claim') {
                rememberCheckout({
                  email: data?.customer?.email ?? null,
                  lifetime: Boolean(PRICES.lifetime) && (data?.items ?? []).some((i) => i.price_id === PRICES.lifetime),
                })
                if (await signInAfterCheckout(transactionId)) forgetCheckout()
              }
              // Every outcome lands on /welcome, the state-aware post-purchase
              // page: Premium for a session (signed in before paying, or just
              // now), "check your inbox" for a buyer who signs in by email.
              window.location.href = '/welcome'
            })
            .catch(() => {
              alert('Payment received. Your account is being activated. Refresh in a minute.')
              window.location.reload()
            })
        }
        uiListeners.forEach((fn) => fn(e))
      },
    }).catch(() => undefined) // a failed load shows the checkout error, not a stuck spinner
  }
  return paddlePromise
}

/** Paddle price IDs — set per environment. Empty until the Paddle product exists. */
export const PRICES = {
  monthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY ?? '',
  yearly: process.env.NEXT_PUBLIC_PADDLE_PRICE_YEARLY ?? '',
  lifetime: process.env.NEXT_PUBLIC_PADDLE_PRICE_LIFETIME ?? '',
}

/** Overlay settings for payment links; showAddDiscounts:false hides the public discount box so promos stay targeted. */
export const CHECKOUT_SETTINGS: CheckoutSettings = {
  displayMode: 'overlay',
  theme: 'light',
  showAddDiscounts: false,
}

/** What the buy button sells: a subscription cycle, or the one-time Lifetime. */
export type BillingCycle = 'monthly' | 'yearly' | 'lifetime'
