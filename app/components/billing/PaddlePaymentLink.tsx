'use client'

import { useEffect } from 'react'
import { CHECKOUT_SETTINGS, getPaddle } from '../../lib/paddle/client'

/**
 * Completes Paddle default payment links (aicanvas.me?_ptxn=txn_...) — the URL
 * Paddle emails to checkout abandoners (recovery), to subscribers whose card
 * fails (dunning / payment-method update), and shows on every transaction in
 * the dashboard. Paddle.js otherwise only loads on upgrade-button click, so
 * these links would land on a page where nothing listens and the checkout
 * would never open. Reads window.location instead of useSearchParams so the
 * root layout needs no Suspense boundary for it.
 */
export function PaddlePaymentLink() {
  useEffect(() => {
    const transactionId = new URLSearchParams(window.location.search).get('_ptxn')
    if (!transactionId || !process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) return
    getPaddle().then((paddle) =>
      // Completion runs the shared eventCallback in getPaddle (verified activation / claim flow).
      paddle?.Checkout.open({ transactionId, settings: CHECKOUT_SETTINGS })
    )
  }, [])
  return null
}
