'use client'

import { useId, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle } from '@phosphor-icons/react'
import { BusinessWaitlist } from './BusinessWaitlist'
import { PREMIUM_FEATURES } from './PremiumCards'

// The four things the Business tier adds. Seats are the parity part: a ten
// person cap is what every component library sells a team licence as. The
// shared brain and the shared MCP config are the part none of them have, and
// they answer the problem a team actually has, which is that ten developers
// pointing AI at the same product get ten different-looking apps. They lead the
// list because they are the reason to buy this card over the Premium one.
const BUSINESS_EXTRAS = [
  'Up to 10 team members',
  'One shared AI Brain, so every agent on the team builds to the same rules',
  'One MCP config for the whole team',
  'Priority support',
]

const BUSINESS_FEATURES = [...BUSINESS_EXTRAS, ...PREMIUM_FEATURES]

type Cycle = 'monthly' | 'yearly'

const CYCLES: Cycle[] = ['monthly', 'yearly']

// One place to change the numbers. Nothing here is wired to a checkout: there
// is no Paddle price for this tier and seats are not built yet, so the card
// asks for a conversation instead of pretending to sell.
const BUSINESS_PRICES: Record<Cycle, { amount: string; suffix: string; note: string; perMonth?: string }> = {
  monthly: {
    amount: '$120',
    suffix: 'month',
    note: 'Billed monthly. Cancel anytime.',
  },
  yearly: {
    amount: '$980',
    suffix: 'year',
    note: 'Billed yearly. Cancel anytime.',
    perMonth: '$81.67/mo',
  },
}

/**
 * One Business card with the billing cycle switched inside it.
 *
 * Monthly and yearly are the same plan billed differently, so two cards side by
 * side repeated every word except the number and read as one card duplicated.
 * Swapping the price in place leaves the comparison where it belongs: on the
 * two numbers, in the same spot.
 */
export function BusinessCards({ compact = false }: { compact?: boolean }) {
  const [cycle, setCycle] = useState<Cycle>('yearly')
  const reduceMotion = useReducedMotion()
  const pillId = useId()
  const price = BUSINESS_PRICES[cycle]

  // Same compact ladder as the Premium card, so the two read as one family
  // wherever they swap for each other.
  const iconBox = compact ? 'h-12 w-12' : 'h-16 w-16'
  const heading = compact ? 'text-2xl' : 'text-3xl'
  const priceText = compact ? 'text-4xl' : 'text-4xl sm:text-5xl'
  const cardPad = compact ? 'px-2 pt-5 pb-5' : 'px-2 pt-6 pb-6 sm:px-2.5 sm:pt-7'
  const listPad = compact ? 'px-2 py-4' : 'px-2 py-6 sm:px-2.5'

  return (
    <>
      <div className={`mx-auto max-w-md ${compact ? '' : 'mt-12 sm:mt-16'}`}>
        <div className="relative flex flex-col rounded-3xl border border-olive-500/50 bg-sand-100 p-2 dark:border-olive-500/40 dark:bg-sand-900">
          <div className={cardPad}>
            {/* The unreleased marker sits on the card, in the corner the eye
                leaves the price by, so it qualifies the number rather than the
                tab. Neutral sand on purpose: olive is the buy colour. */}
            <span className="absolute right-5 top-5 rounded-full bg-sand-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-sand-700 dark:bg-sand-950 dark:text-sand-300">
              Soon
            </span>

            <div className="flex items-center gap-4">
              {/* Its own avatar, so Business reads as a third member of the
                  family rather than a second Premium card. Hosted on ImageKit
                  with the rest of the site chrome art; w-160 covers the 64px
                  slot at 2x. */}
              <div className={`flex ${iconBox} shrink-0 items-end justify-center`}>
                <img
                  src="https://ik.imagekit.io/aitoolkit/site/avatar-business.png?tr=w-160,f-auto"
                  width={160}
                  height={160}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-auto"
                />
              </div>
              <h2 className={`${heading} font-bold tracking-tight text-sand-900 dark:text-sand-50`}>
                Business
              </h2>
            </div>
            {/* Billing cycle toggle — same sliding-pill mechanic as the Premium
                card, minus the discount chip and the struck yearly anchor,
                which were deliberately removed from this tier. */}
            <div className="mt-5 inline-flex rounded-lg border border-sand-200 bg-sand-50/70 p-0.5 dark:border-sand-700 dark:bg-sand-950">
              {CYCLES.map((key) => {
                const selected = cycle === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCycle(key)}
                    aria-pressed={selected}
                    className={`relative rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                      selected
                        ? 'text-sand-950'
                        : 'text-sand-600 hover:text-sand-700 dark:text-sand-500 dark:hover:text-sand-300'
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId={`business-cycle-pill-${pillId}`}
                        className="absolute inset-0 rounded-md bg-olive-500"
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }
                        }
                      />
                    )}
                    <span className="relative">{key === 'monthly' ? 'Monthly' : 'Yearly'}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className={`${priceText} font-extrabold tracking-tight text-sand-900 dark:text-sand-50`}>
                {price.amount}
              </span>
              <span className="text-sm font-medium text-sand-600 dark:text-sand-500">
                / {price.suffix}
              </span>
              {price.perMonth && (
                <span className="text-sm font-semibold text-olive-600 dark:text-olive-400">
                  ({price.perMonth})
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">{price.note}</p>

            <BusinessWaitlist plan={cycle} featured />
          </div>

          <div className={`flex-1 rounded-2xl bg-sand-50/70 dark:bg-sand-950 ${listPad}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sand-600 dark:text-sand-500">
              EVERYTHING INCLUDED
            </p>
            <ul className="mt-4 space-y-3">
              {BUSINESS_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm leading-relaxed text-sand-700 dark:text-sand-200"
                >
                  <CheckCircle
                    weight="regular"
                    size={18}
                    className="mt-0.5 shrink-0 text-olive-600 dark:text-olive-400"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* The bracket line is a pricing-page aside. In the modal it competes
          with the gate the visitor actually opened, so it stays off there. */}
      {!compact && (
        <p className="mt-6 text-center text-sm text-sand-600 dark:text-sand-400">
          More than 10 people? Join the list above and tell us how many. That number is
          what decides the next bracket.
        </p>
      )}
    </>
  )
}
