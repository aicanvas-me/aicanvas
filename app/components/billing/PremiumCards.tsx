'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { CircleCheck } from '@/app/_icons/icons/circle-check'
import { Infinity as InfinityIcon } from '@/app/_icons/icons/infinity'
import { Bolt } from '@/app/_icons/icons/bolt'
import { Lock } from '@/app/_icons/icons/lock'
import { motion, useReducedMotion } from 'framer-motion'
import { buttonClasses } from '../buttonClasses'
import { TopLight } from '../TopLight'
import { useSession } from '../auth/SessionProvider'
import { usePremiumDetails } from './usePremiumStatus'
import { UpgradeButton } from './UpgradeButton'
import { LIFETIME_PRICE, MONTHLY_PRICE, YEARLY_ANCHOR, YEARLY_PER_MONTH, YEARLY_PRICE, YEARLY_SAVING_PCT, usd } from '../../lib/offer'
import { lifetimeEnabled } from '../../../lib/flags'

// Single source of truth for the Free / Premium cards. Rendered full-size on
// /pricing and `compact` inside the Code-tab paywall. The Premium card lists
// only real unlocks; every free perk stays on the Free card so the copy never
// sells free things as premium. Every free perk is scoped to FREE entries:
// premium source and the full premium remix prompt are both withheld
// server-side, so an unqualified "every component" belongs on the Premium card.

const FREE_FEATURES = [
  'Full source code of every free component',
  'Unlimited one-command installs of free components',
  'Remix with AI on every free component',
  'MCP server for Claude Code, Codex and Cursor',
  'Save your favorite components',
]

// The toggle's two options. One accent fill for both: the highlight keeps its
// colour and only travels, so nothing about it changes except where it is.
const CYCLES = ['monthly', 'yearly'] as const

export const PREMIUM_FEATURES = [
  'Every premium component and block, one command install',
  'Remix with AI on every component',
  'Full design systems, tokens to templates',
  'All premium templates, source included',
  'New premium releases included as they ship',
  'Use in commercial and client projects',
  'Cancel anytime',
]

// The Lifetime card's own list: what one payment adds on top of Premium, each
// line from the Lifetime ruling (every future release, no renewal, installs
// stay theirs). Shown only while the Lifetime switch is on.
const LIFETIME_FEATURES = [
  'One payment, no renewal to manage',
  'Every future premium release included',
  'Installed components stay yours forever',
]

const LIFETIME = lifetimeEnabled()
// Side by side, the descriptions share one height (two lines) so the prices
// and buttons line up across the row: three plans on /pricing from lg, the
// modal's two from sm.
const DESC_3UP = 'lg:min-h-[2.875rem]'
const DESC_2UP = 'sm:min-h-[2.875rem]'

export function PremiumCards({
  show = 'both',
  compact = false,
  className,
}: {
  /** `both` = Free + Premium (anonymous); `premium-only` = just the Premium card. */
  show?: 'both' | 'premium-only'
  /** Tighter footprint for the Code-tab overlay. */
  compact?: boolean
  className?: string
}) {
  const { user } = useSession()
  const reduceMotion = useReducedMotion()
  // Per-instance, because two of these can be mounted at once: the home page
  // section and the paywall modal that lives in the root layout. A shared
  // layoutId would make framer treat both highlights as one element and fly it
  // from the page into the modal.
  const pillId = useId()
  const [chosen, setCycle] = useState<'monthly' | 'yearly'>('yearly')
  // With Lifetime on, Yearly is gone for new buyers: the Premium card is the
  // monthly plan, with no cycle toggle. Existing annual subscribers keep
  // renewing; only the offer leaves the site.
  const cycle = LIFETIME ? 'monthly' : chosen
  const price = cycle === 'yearly' ? usd(YEARLY_PRICE) : usd(MONTHLY_PRICE)
  const suffix = cycle === 'yearly' ? 'year' : 'month'
  // Per-month equivalent of the yearly plan ($49.99 / 12 ≈ $4.17) — a hook that
  // shows how low the effective monthly cost is. Only shown on the yearly cycle.
  const perMonthHint = cycle === 'yearly' ? `${usd(YEARLY_PER_MONTH)}/mo` : null

  // Reflect the real subscription so a premium user isn't pitched "Go Premium";
  // 'unknown' renders a neutral disabled CTA instead of flashing the wrong one.
  const { status: premiumState, lifetime: hasLifetime } = usePremiumDetails()

  const showFree = show === 'both'
  // Three plans side by side: Free, Monthly, Lifetime. The premium-only set
  // (the upgrade modal) shows the two paid plans side by side.
  const threeUp = LIFETIME && showFree && !compact
  const pairUp = LIFETIME && !showFree
  const desc = threeUp ? DESC_3UP : pairUp ? DESC_2UP : ''
  const heading = compact ? 'text-2xl' : 'text-3xl'
  const priceText = compact ? 'text-4xl' : 'text-4xl sm:text-5xl'
  const cardPad = compact ? 'px-2 pt-5 pb-5' : 'px-2 pt-6 pb-6 sm:px-2.5 sm:pt-7'
  const listPad = compact ? 'px-2 py-4' : 'px-2 py-6 sm:px-2.5'

  return (
    <>
    <div
      className={`grid gap-6 ${threeUp ? 'mx-auto max-w-md lg:max-w-none lg:grid-cols-3 lg:gap-5' : pairUp ? 'mx-auto max-w-md sm:max-w-none sm:grid-cols-2 sm:gap-4' : showFree ? 'md:grid-cols-2' : 'mx-auto max-w-md'} ${
        compact ? '' : 'mt-12 sm:mt-16'
      } ${className ?? ''}`}
    >
      {/* ── Free card ── */}
      {showFree && (
        <div className="relative flex flex-col rounded-section border border-sand-200 bg-sand-100 p-2 dark:border-sand-800 dark:bg-sand-900">
          {/* Name, price, then the one-line description: every plan card
              reads in that order. */}
          <div className={cardPad}>
            <h2 className={`${heading} font-bold tracking-tight text-sand-900 dark:text-sand-50`}>
              Free
            </h2>
            {/* Invisible mirror of the Premium card's billing-cycle toggle so the
                price and CTA align across both cards. Three plans have no
                toggle; there the mirror is the tax line under the paid prices. */}
            {!LIFETIME && (
              <div
                aria-hidden
                className="invisible mt-3 inline-flex rounded-control border border-sand-200 bg-sand-50/70 p-0.5 dark:border-sand-700 dark:bg-sand-950"
              >
                <span className="rounded-control px-3 py-1 text-xs font-semibold">Monthly</span>
              </div>
            )}
            <div className="mt-4 flex items-baseline gap-2">
              <span className={`${priceText} font-extrabold tracking-tight text-sand-900 dark:text-sand-50`}>
                $0
              </span>
              <span className="text-sm font-medium text-sand-600 dark:text-sand-500">/ forever</span>
            </div>
            {threeUp && <p aria-hidden className="invisible mt-1.5 text-xs">+ VAT where applicable</p>}
            <p className={`mt-3 text-sm leading-relaxed text-sand-600 dark:text-sand-400 ${desc}`}>
              Install and remix every free component, free forever.
            </p>
            <Link
              href={user ? '/components' : '/account/sign-up'}
              className={`mt-6 ${buttonClasses({ variant: 'outline', size: 'lg', fullWidth: true })}`}
            >
              {user ? 'Browse components' : 'Sign up free'}
            </Link>
          </div>
          <div className={`flex-1 rounded-card bg-sand-50/70 dark:bg-sand-950 ${listPad}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sand-600 dark:text-sand-500">
              ALWAYS INCLUDED
            </p>
            <ul className="mt-4 space-y-3">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-sand-700 dark:text-sand-200">
                  <CircleCheck size={18} className="mt-0.5 shrink-0 text-sand-600 dark:text-sand-300" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Premium card ── (the Monthly plan when Lifetime is on) */}
      <div
        className={`relative flex flex-col rounded-section border bg-sand-100 p-2 dark:bg-sand-900 ${
          threeUp || pairUp ? 'border-sand-200 dark:border-sand-800' : 'border-accent/50 dark:border-accent/40'
        }`}
      >
        <div className={cardPad}>
          <h2 className={`flex items-center gap-2 ${heading} font-bold tracking-tight text-sand-900 dark:text-sand-50`}>
            {threeUp || pairUp ? 'Monthly' : 'Premium'}
            <Bolt size={22} className="text-accent" />
          </h2>

          {/* Billing cycle toggle + struck yearly-anchor price sit side by side.
              Gone with Lifetime on: the card is the monthly plan only. */}
          {!LIFETIME && (
          <div className="mt-3 flex items-center gap-3">
          {/* Billing cycle toggle — defaults to Yearly. The highlight is one
              element that slides between the two options, so the eye follows
              the selection instead of watching one box blink off and another
              blink on. It resizes as it travels, because the two labels are
              different widths. */}
          <div className="inline-flex rounded-control border border-sand-200 bg-sand-50/70 p-0.5 dark:border-sand-700 dark:bg-sand-950">
            {CYCLES.map((key) => {
              const selected = cycle === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCycle(key)}
                  aria-pressed={selected}
                  className={`relative rounded-control px-3 py-1 text-xs font-semibold transition-colors ${
                    selected
                      ? 'text-accent-foreground'
                      : 'text-sand-600 hover:text-sand-700 dark:text-sand-500 dark:hover:text-sand-300'
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId={`billing-cycle-pill-${pillId}`}
                      className="absolute inset-0 rounded-control bg-accent"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }
                      }
                    />
                  )}
                  <span className="relative">
                    {key === 'monthly' ? (
                      'Monthly'
                    ) : (
                      <>
                        Yearly{' '}
                        <span className={selected ? 'opacity-80' : 'text-accent'}>
                          · save {YEARLY_SAVING_PCT}%
                        </span>
                      </>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
          {/* Yearly anchor: 12 x $8.99 monthly, struck through so the saving reads in money. */}
          {cycle === 'yearly' && (
            <span className="text-sm font-medium text-sand-600 line-through dark:text-sand-500">
              {usd(YEARLY_ANCHOR)}
            </span>
          )}
          </div>
          )}

          <div className="mt-4 flex items-baseline gap-2">
            <span className={`${priceText} font-extrabold tracking-tight text-sand-900 dark:text-sand-50`}>
              {price}
            </span>
            <span className="text-sm font-medium text-sand-600 dark:text-sand-500">/ {suffix}</span>
            {perMonthHint && (
              <span className="text-sm font-semibold text-accent">
                ({perMonthHint})
              </span>
            )}
          </div>
          {LIFETIME && <p className="mt-1.5 text-xs text-sand-600 dark:text-sand-400">+ VAT where applicable</p>}
          <p className={`mt-3 text-sm leading-relaxed text-sand-600 dark:text-sand-400 ${desc}`}>
            Andromeda Pro, its templates, premium components and blocks.
          </p>

          {user && premiumState === 'unknown' ? (
            <button
              type="button"
              disabled
              className={`mt-6 ${buttonClasses({ variant: 'outline', size: 'lg', fullWidth: true })}`}
            >
              Checking your plan…
            </button>
          ) : premiumState === 'premium' ? (
            <Link
              href="/account/settings"
              className={`mt-6 ${buttonClasses({ variant: 'outline', size: 'lg', fullWidth: true })}`}
            >
              {hasLifetime ? 'You have Lifetime' : <>You&rsquo;re on Premium · Manage</>}
            </Link>
          ) : (
            <UpgradeButton
              cycle={cycle}
              className={`mt-6 ${buttonClasses({ variant: 'primary', size: 'lg', fullWidth: true })}`}
            >
              Go Premium
            </UpgradeButton>
          )}
        </div>
        <div className={`flex-1 rounded-card bg-sand-50/70 dark:bg-sand-950 ${listPad}`}>
          {/* The comparison label only makes sense next to the Free card;
              the premium-only modal renders the list without it. */}
          {showFree && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sand-600 dark:text-sand-500">
              EVERYTHING IN FREE, PLUS
            </p>
          )}
          <ul className={showFree ? 'mt-4 space-y-3' : 'space-y-3'}>
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-sand-700 dark:text-sand-200">
                <CircleCheck size={18} className="mt-0.5 shrink-0 text-accent" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {(threeUp || pairUp) && (
        <LifetimeCard
          desc={threeUp ? DESC_3UP : DESC_2UP}
          cardPad={cardPad}
          listPad={listPad}
          heading={heading}
          priceText={priceText}
          checking={Boolean(user) && premiumState === 'unknown'}
          hasLifetime={hasLifetime}
        />
      )}
    </div>
    {/* A compact Free + Premium pair has no room for a third card: Lifetime
        is a line under it. */}
    {LIFETIME && !threeUp && !pairUp && !hasLifetime && (
      <p className="mx-auto mt-3 max-w-md text-center text-xs leading-relaxed text-sand-600 dark:text-sand-400">
        Rather pay once? Lifetime is {usd(LIFETIME_PRICE)}, every future release included.{' '}
        <Link href="/pricing" className="font-semibold text-accent underline-offset-4 hover:text-accent/70 hover:underline">
          See Lifetime
        </Link>
      </p>
    )}
    {!compact && <TrustStrip />}
    </>
  )
}

// ── Lifetime card ──
// One payment, Premium for life. The featured plan of the three: the accent
// edge and the site's light from straight above (TopLight). The description is one short
// line, like the other two cards; the Lifetime terms live on the licence page,
// not on the card.
function LifetimeCard({
  desc,
  cardPad,
  listPad,
  heading,
  priceText,
  checking,
  hasLifetime,
}: {
  desc: string
  cardPad: string
  listPad: string
  heading: string
  priceText: string
  checking: boolean
  hasLifetime: boolean
}) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-section border border-accent/50 bg-sand-100 p-2 dark:border-accent/40 dark:bg-sand-900">
      <TopLight />
      <span className="absolute right-4 top-4 rounded-full border border-premium/30 bg-premium/10 px-2.5 py-0.5 text-[11px] font-semibold text-premium">
        Pay once
      </span>
      <div className={`relative ${cardPad}`}>
        <h2 className={`flex items-center gap-2 ${heading} font-bold tracking-tight text-sand-900 dark:text-sand-50`}>
          Lifetime
          <InfinityIcon size={22} className="text-accent" />
        </h2>
        <div className="mt-4 flex items-baseline gap-2">
          <span className={`${priceText} font-extrabold tracking-tight text-sand-900 dark:text-sand-50`}>
            {usd(LIFETIME_PRICE)}
          </span>
          <span className="text-sm font-medium text-sand-600 dark:text-sand-500">/ one time</span>
        </div>
        <p className="mt-1.5 text-xs text-sand-600 dark:text-sand-400">+ VAT where applicable</p>
        <p className={`mt-3 text-sm leading-relaxed text-sand-600 dark:text-sand-400 ${desc}`}>
          Everything in Monthly, paid once. Future releases included.
        </p>
        {checking ? (
          <button
            type="button"
            disabled
            className={`mt-6 ${buttonClasses({ variant: 'outline', size: 'lg', fullWidth: true })}`}
          >
            Checking your plan…
          </button>
        ) : hasLifetime ? (
          <Link
            href="/account/settings"
            className={`mt-6 ${buttonClasses({ variant: 'outline', size: 'lg', fullWidth: true })}`}
          >
            You have Lifetime
          </Link>
        ) : (
          <UpgradeButton
            cycle="lifetime"
            className={`mt-6 ${buttonClasses({ variant: 'primary', size: 'lg', fullWidth: true })}`}
          >
            Get Lifetime
          </UpgradeButton>
        )}
      </div>
      <div className={`relative flex-1 rounded-card bg-sand-50/70 dark:bg-sand-950 ${listPad}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sand-600 dark:text-sand-500">
          EVERYTHING IN PREMIUM, PLUS
        </p>
        <ul className="mt-4 space-y-3">
          {LIFETIME_FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-sand-700 dark:text-sand-200">
              <CircleCheck size={18} className="mt-0.5 shrink-0 text-accent" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Full-width trust strip below the Free/Premium bento. Checkout runs through
// Paddle (PCI-DSS compliant, TLS, cardholder data encrypted — verified), so
// "secure payment encryption" is accurate. "Cancel anytime" already lives in the
// Premium feature list, so this surfaces a different signal (instant access).
// Logos are real SVGs in /public/payment, shown on white chips so the colored
// brand marks stay legible on the dark strip.
const PAYMENT_LOGOS: [string, string][] = [
  ['visa', 'Visa'],
  ['mastercard', 'Mastercard'],
  ['amex', 'American Express'],
  ['paypal', 'PayPal'],
  ['unionpay', 'UnionPay'],
]

function TrustStrip() {
  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-card border border-sand-200 bg-sand-100/60 px-6 py-4 dark:border-sand-800 dark:bg-sand-900/50 sm:flex-row">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-sand-700 dark:text-sand-200">
        <span className="flex items-center gap-1.5">
          <Lock size={16} className="text-accent" />
          Secure payment encryption
        </span>
        <span className="flex items-center gap-1.5">
          <Bolt size={16} className="text-accent" />
          Instant access
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {PAYMENT_LOGOS.map(([file, label]) => (
          <span key={file} className="flex h-7 items-center rounded-chip bg-white px-1.5 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/payment/${file}.svg`} alt={label} className="h-4 w-auto" />
          </span>
        ))}
        <a
          href="https://www.paddle.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-xs text-sand-600 underline-offset-2 hover:underline dark:text-sand-400"
        >
          powered by Paddle
        </a>
      </div>
    </div>
  )
}
