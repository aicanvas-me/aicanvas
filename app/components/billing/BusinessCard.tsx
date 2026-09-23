'use client'

import Link from 'next/link'
import { CheckCircle, Users } from '@phosphor-icons/react'
import { buttonClasses } from '../buttonClasses'
import { TerminatorSkull } from '../auth/TerminatorReveal'

// The Business tier is four things and nothing else. Seats are the parity part:
// a ten-person cap is what every component library sells a team licence as. The
// shared brain and the shared MCP config are the part none of them have, and
// they answer the problem a team actually has, which is that ten developers
// pointing AI at the same product get ten different-looking apps.
const BUSINESS_FEATURES = [
  'Up to 10 team members',
  'One shared AI Brain, so every agent on the team builds to the same rules',
  'One MCP config for the whole team',
  'Priority support',
]

// One place to change the number. It is deliberately not wired to a checkout:
// there is no Paddle price for this tier and seats are not built yet, so the
// card asks for a conversation instead of pretending to sell.
const BUSINESS_PRICE = {
  amount: '$59',
  suffix: 'month',
  note: 'For the whole team, up to 10 people.',
}

export function BusinessCard() {
  return (
    <div className="mx-auto mt-12 max-w-md sm:mt-16">
      <div className="relative flex flex-col rounded-3xl border border-olive-500/50 bg-sand-100 p-2 dark:border-olive-500/40 dark:bg-sand-900">
        <div className="px-2 pt-6 pb-6 sm:px-2.5 sm:pt-7">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-end justify-center">
              <TerminatorSkull />
            </div>
            <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
              Business
              <Users weight="regular" size={22} className="text-olive-600 dark:text-olive-400" />
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
            Everything in Premium for your whole team, building to one set of rules.
          </p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-5xl">
              {BUSINESS_PRICE.amount}
            </span>
            <span className="text-sm font-medium text-sand-600 dark:text-sand-500">
              / {BUSINESS_PRICE.suffix}
            </span>
          </div>
          <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">{BUSINESS_PRICE.note}</p>

          <Link
            href="/contact"
            className={`mt-6 ${buttonClasses({ variant: 'primary', size: 'lg', fullWidth: true })}`}
          >
            Talk to us
          </Link>
        </div>

        <div className="flex-1 rounded-2xl bg-sand-50/70 px-2 py-6 dark:bg-sand-950 sm:px-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sand-600 dark:text-sand-500">
            EVERYTHING IN PREMIUM, PLUS
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

      <p className="mt-6 text-center text-sm text-sand-600 dark:text-sand-400">
        More than 10 people?{' '}
        <Link href="/contact" className="font-semibold text-olive-600 underline-offset-2 hover:text-olive-800 hover:underline dark:text-olive-400 dark:hover:text-olive-300">
          Tell us how many
        </Link>{' '}
        and we will size it with you.
      </p>
    </div>
  )
}
