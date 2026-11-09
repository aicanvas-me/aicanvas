'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CheckoutEventsData } from '@paddle/paddle-js/types/checkout/events'
import { ArrowLeft } from '@/app/_icons/icons/arrow-left'
import { CircleCheck } from '@/app/_icons/icons/circle-check'
import { Lock } from '@/app/_icons/icons/lock'
import { Refresh } from '@/app/_icons/icons/refresh'
import { ShieldCheck } from '@/app/_icons/icons/shield-check'
import { BrandIcon } from '../BrandIcon'
import { buttonClasses } from '../buttonClasses'
import { getPaddle, PRICES, subscribePaddleEvents, type BillingCycle } from '../../lib/paddle/client'
import { LIFETIME_FEATURES, LIFETIME_PRICE, MONTHLY_PRICE, PREMIUM_FEATURES, YEARLY_PRICE, usd } from '../../lib/offer'

const PLANS = {
  monthly: { name: 'Monthly', price: MONTHLY_PRICE, suffix: '/ month', label: 'What you get', features: PREMIUM_FEATURES, terms: 'Renews monthly, cancel anytime' },
  yearly: { name: 'Yearly', price: YEARLY_PRICE, suffix: '/ year', label: 'What you get', features: PREMIUM_FEATURES, terms: 'Renews yearly, cancel anytime' },
  lifetime: { name: 'Lifetime', price: LIFETIME_PRICE, suffix: '/ one time', label: 'Everything in Monthly, plus', features: LIFETIME_FEATURES, terms: 'One payment, no subscription' },
}

type Totals = Pick<CheckoutEventsData, 'totals' | 'currency_code'>
type Stage = 'loading' | 'ready' | 'completing' | 'error'

function money(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

// Paddle's frame sits on the right and the order summary on the left. Inline
// frames show no price, so the taxed totals come from Paddle's own events.
export function CheckoutSplit({
  cycle,
  email,
  userId,
  discountCode,
  onClose,
}: {
  cycle: BillingCycle
  email?: string
  userId?: string
  discountCode?: string
  onClose: () => void
}) {
  const [stage, setStage] = useState<Stage>('loading')
  const [totals, setTotals] = useState<Totals | null>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const plan = PLANS[cycle]
  const completing = stage === 'completing'

  // Capture phase: the paywall under this panel also closes on Escape, and
  // closing it would unmount the checkout.
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    backRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      if (!completing) onClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey, true)
      previousFocus?.focus()
    }
  }, [completing, onClose])

  useEffect(
    () =>
      subscribePaddleEvents((e) => {
        const data = e.data as CheckoutEventsData | undefined
        if (data?.totals) setTotals({ totals: data.totals, currency_code: data.currency_code })
        if (e.name === 'checkout.completed') setStage('completing')
        else if (e.name === 'checkout.loaded') setStage((s) => (s === 'completing' ? s : 'ready'))
        else if (e.name === 'checkout.error' || e.name === 'checkout.failed') {
          setStage((s) => (s === 'completing' ? s : 'error'))
        }
      }),
    [],
  )

  // Paddle resizes its frame a beat after the content changes; without this a
  // scrollbar flashes inside it on every switch of payment method.
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const observer = new MutationObserver(() => frame.querySelector('iframe')?.setAttribute('scrolling', 'no'))
    observer.observe(frame, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let live = true
    const paddleReady = getPaddle()
    paddleReady.then((paddle) => {
      if (!live) return
      if (!paddle) {
        setStage('error')
        return
      }
      paddle.Checkout.open({
        items: [{ priceId: PRICES[cycle], quantity: 1 }],
        ...(email ? { customer: { email } } : {}),
        ...(userId ? { customData: { user_id: userId } } : {}),
        ...(discountCode ? { discountCode } : {}),
        settings: {
          displayMode: 'inline',
          variant: 'one-page',
          frameTarget: 'paddle-checkout-frame',
          frameInitialHeight: 520,
          frameStyle: 'width: 100%; min-width: 286px; background-color: transparent; border: none',
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
          showAddDiscounts: false,
        },
      })
    })
    return () => {
      live = false
      paddleReady.then((paddle) => paddle?.Checkout.close())
    }
  }, [cycle, email, userId, discountCode])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Checkout, AI Canvas Premium ${plan.name}`}
      className="fixed inset-0 z-[130] overflow-y-auto bg-sand-50 text-sand-900 dark:bg-sand-950 dark:text-sand-50"
    >
      <div className="grid min-h-full md:grid-cols-2">
        <section className="flex justify-center border-b border-sand-200 bg-sand-100 px-5 py-5 sm:px-8 md:justify-end md:border-b-0 md:border-r md:py-8 lg:px-14 dark:border-sand-800 dark:bg-sand-900">
          <div className="flex w-full max-w-md flex-col">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-bold">
                <BrandIcon width={20} height={17} className="shrink-0" />
                AI Canvas
              </span>
              <button
                ref={backRef}
                type="button"
                onClick={onClose}
                disabled={completing}
                className={buttonClasses({ variant: 'outline', size: 'sm' })}
              >
                <ArrowLeft size={14} aria-hidden />
                Back
              </button>
            </div>

            <div className="mt-8 md:my-auto md:py-10">
              <p className="text-sm font-semibold text-sand-600 dark:text-sand-400">AI Canvas Premium, {plan.name}</p>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight">{usd(plan.price)}</span>
                <span className="text-sm text-sand-600 dark:text-sand-400">{plan.suffix}</span>
              </p>

              <dl aria-live="polite" className="mt-6 space-y-2 border-t border-sand-200 pt-5 text-sm dark:border-sand-800">
                <div className="flex justify-between gap-4">
                  <dt className="text-sand-600 dark:text-sand-400">Subtotal</dt>
                  <dd>{totals ? money(totals.totals.subtotal, totals.currency_code) : '…'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-sand-600 dark:text-sand-400">Tax</dt>
                  <dd>{totals ? money(totals.totals.tax, totals.currency_code) : '…'}</dd>
                </div>
                {totals && totals.totals.discount > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-sand-600 dark:text-sand-400">Discount</dt>
                    <dd>-{money(totals.totals.discount, totals.currency_code)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 pt-1 text-base font-semibold">
                  <dt>Due today</dt>
                  <dd>{totals ? money(totals.totals.total, totals.currency_code) : '…'}</dd>
                </div>
              </dl>

              <div className="mt-6 hidden border-t border-sand-200 pt-5 md:block dark:border-sand-800">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sand-600 dark:text-sand-500">{plan.label}</p>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-sand-700 dark:text-sand-200">
                      <CircleCheck size={18} className="mt-0.5 shrink-0 text-accent" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <ul className="mt-6 space-y-2 border-t border-sand-200 pt-5 text-xs text-sand-600 dark:border-sand-800 dark:text-sand-400">
                <li className="flex items-center gap-2.5">
                  <Lock size={14} className="shrink-0" aria-hidden />
                  Secure checkout by Paddle
                </li>
                <li className="flex items-center gap-2.5">
                  <ShieldCheck size={14} className="shrink-0" aria-hidden />
                  Paddle handles payment, tax and your receipt
                </li>
                <li className="flex items-center gap-2.5">
                  <Refresh size={14} className="shrink-0" aria-hidden />
                  {plan.terms}
                </li>
              </ul>
            </div>
            <div aria-hidden className="hidden h-9 shrink-0 md:block" />
          </div>
        </section>

        <section className="flex justify-center px-5 py-6 sm:px-8 md:items-center md:justify-start md:py-8 lg:px-14">
          <div className="w-full max-w-md">
            {stage === 'error' && (
              <p role="alert" className="mb-3 rounded-card border border-sand-200 bg-sand-100 px-4 py-3 text-sm text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300">
                The checkout could not load. Go back and try again, or contact support if it keeps happening.
              </p>
            )}
            <div className={`relative ${stage === 'ready' ? '' : 'min-h-[520px]'}`}>
              {(stage === 'loading' || completing) && (
                <p role="status" className="absolute inset-0 flex items-center justify-center text-center text-sm text-sand-600 dark:text-sand-400">
                  {completing ? 'Payment received, activating your account…' : 'Loading secure checkout…'}
                </p>
              )}
              <div ref={frameRef} className={`paddle-checkout-frame ${completing ? 'invisible' : ''}`} />
            </div>
          </div>
        </section>
      </div>
    </div>,
    document.body,
  )
}
