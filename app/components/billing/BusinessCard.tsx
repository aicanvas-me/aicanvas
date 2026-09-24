'use client'

import { CheckCircle, UsersThree } from '@phosphor-icons/react'
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

type BusinessPlan = {
  key: 'monthly' | 'yearly'
  amount: string
  suffix: string
  note: string
  /** Yearly only: what a month works out at, so the two cards compare directly. */
  perMonth?: string
  featured?: boolean
}

// One place to change the numbers. Neither card is wired to a checkout: there
// is no Paddle price for this tier and seats are not built yet, so both ask for
// a conversation instead of pretending to sell.
const BUSINESS_PLANS: BusinessPlan[] = [
  {
    key: 'monthly',
    amount: '$120',
    suffix: 'month',
    note: 'Billed monthly. Cancel anytime.',
  },
  {
    key: 'yearly',
    amount: '$980',
    suffix: 'year',
    note: 'Billed yearly, for up to 10 people.',
    perMonth: '$81.67/mo',
    featured: true,
  },
]

function BusinessPlanCard({ plan }: { plan: BusinessPlan }) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl border bg-sand-100 p-2 dark:bg-sand-900 ${
        plan.featured
          ? 'border-olive-500/50 dark:border-olive-500/40'
          : 'border-sand-200 dark:border-sand-800'
      }`}
    >
      <div className="px-2 pt-6 pb-6 sm:px-2.5 sm:pt-7">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950">
            <UsersThree
              weight="regular"
              size={30}
              className="text-olive-600 dark:text-olive-400"
            />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
            Business
          </h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
          Everything in Premium for your whole team, building to one set of rules.
        </p>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-5xl">
            {plan.amount}
          </span>
          <span className="text-sm font-medium text-sand-600 dark:text-sand-500">/ {plan.suffix}</span>
          {plan.perMonth && (
            <span className="text-sm font-semibold text-olive-600 dark:text-olive-400">
              ({plan.perMonth})
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">{plan.note}</p>

        <BusinessWaitlist plan={plan.key} featured={plan.featured} />
      </div>

      <div className="flex-1 rounded-2xl bg-sand-50/70 px-2 py-6 dark:bg-sand-950 sm:px-2.5">
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
  )
}

export function BusinessCards() {
  return (
    <>
      <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-2">
        {BUSINESS_PLANS.map((plan) => (
          <BusinessPlanCard key={plan.key} plan={plan} />
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-sand-600 dark:text-sand-400">
        More than 10 people? Join the list above and tell us how many. That number is
        what decides the next bracket.
      </p>
    </>
  )
}
