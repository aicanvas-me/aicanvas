'use client'
import { initializePaddle, type CheckoutSettings, type Paddle, type PaddleEventData } from '@paddle/paddle-js'
import { beacon } from '../analytics'

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
          const transactionId = (e.data as { transaction_id?: string } | undefined)?.transaction_id
          fetch('/api/checkout/completed', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ transactionId }),
          })
            .then((res) => {
              if (!res.ok) {
                console.error('[paddle] activation deferred to webhook, status', res.status)
                alert('Payment received. Your account is being activated, this can take a minute. Refresh shortly; contact support if it persists.')
                window.location.reload()
                return
              }
              // Confirmed fast-path activation (signed-in) and anonymous
              // pending-claim both land on /welcome — the state-aware
              // post-purchase page: Premium quickstart (token + install
              // command) for a live session, the claim form otherwise.
              window.location.href = '/welcome'
            })
            .catch(() => {
              alert('Payment received. Your account is being activated. Refresh in a minute.')
              window.location.reload()
            })
        }
        uiListeners.forEach((fn) => fn(e))
      },
    })
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
