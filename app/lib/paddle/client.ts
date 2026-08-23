'use client'
import { initializePaddle, type Paddle } from '@paddle/paddle-js'
import { beacon } from '../analytics'

let paddlePromise: Promise<Paddle | undefined> | null = null

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

/** Lazily initialize Paddle.js once (overlay checkout). */
export function getPaddle(): Promise<Paddle | undefined> {
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as 'sandbox' | 'production') ?? 'sandbox',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? '',
      // Verified-optimistic activation: on success we POST the transaction id
      // to be checked against the Paddle API server-side before any DB write
      // (a session alone never grants premium). Only reload on a confirmed
      // activation; otherwise tell the user the webhook will finish it —
      // a blind reload would silently dump a paying user back on a Free view.
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
            .then(async (res) => {
              const body = (await res.json().catch(() => null)) as { status?: string } | null
              // Anonymous buyer: no session to activate. Send them to the claim
              // page ("check your email") — the webhook creates the account and
              // mails the magic link.
              if (body?.status === 'pending-claim') {
                window.location.href = '/welcome'
                return
              }
              if (!res.ok) {
                console.error('[paddle] activation deferred to webhook, status', res.status)
                alert('Payment received. Your account is being activated, this can take a minute. Refresh shortly; contact support if it persists.')
              }
              window.location.reload()
            })
            .catch(() => {
              alert('Payment received. Your account is being activated. Refresh in a minute.')
              window.location.reload()
            })
        }
      },
    })
  }
  return paddlePromise
}

/** Paddle price IDs — set per environment. Empty until the Paddle product exists. */
export const PRICES = {
  monthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY ?? '',
  yearly: process.env.NEXT_PUBLIC_PADDLE_PRICE_YEARLY ?? '',
}

export type BillingCycle = 'monthly' | 'yearly'
