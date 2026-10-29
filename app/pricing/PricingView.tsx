'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle, Sparkle } from '@phosphor-icons/react'
import { buttonClasses } from '../components/buttonClasses'
import { lifetimeEnabled, premiumEnabled } from '../../lib/flags'
import { PremiumCards } from '../components/billing/PremiumCards'
import { FaqHelpCard, FaqRows } from '../components/FaqRows'
import { PRICING_FAQ } from '../lib/faq'
import { PageHero, SectionHead } from '../components/PageKit'

// ─── Plan data ──────────────────────────────────────────────────────────────
// Legacy fallback, rendered only when premiumEnabled() is false. The first card
// is the anonymous baseline; the second is the signed-in (still free)
// experience. The live Free vs Premium pricing is rendered separately when the
// premium flag is on. Both legacy cards are free (anonymous + signed-in).

type Plan = {
  name: string
  tagline: string
  priceLabel: string
  priceSuffix: string
  cta: { label: string; href: string; variant: 'primary' | 'outline' }
  listLabel: string
  features: string[]
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    tagline:
      'Browse the canvas freely. Copy any free component and its prompt with no account, no friction.',
    priceLabel: 'Free',
    priceSuffix: 'Forever',
    cta: { label: 'Browse Components', href: '/components', variant: 'outline' },
    listLabel: 'GET STARTED WITH',
    features: [
      'Browse every public component',
      'Copy the source of any free component',
      'Copy the AI remix prompt for any free component',
      'Access the MCP server',
    ],
  },
  {
    name: 'Free account',
    tagline:
      'Sign in and unlock the canvas. Save what you love.',
    priceLabel: 'Free',
    priceSuffix: 'Forever',
    cta: {
      label: 'Sign up free',
      href: '/account/sign-up',
      variant: 'primary',
    },
    listLabel: 'EVERYTHING IN FREE, PLUS',
    features: [
      'Save your favorite components',
      'Save preferences across sessions',
      'Access to more resources and features',
    ],
    featured: true,
  },
]

// ─── Plan card ──────────────────────────────────────────────────────────────

function PlanCard({ plan, delay }: { plan: Plan; delay: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={`relative flex flex-col rounded-section border bg-sand-100 p-2 dark:bg-sand-900 ${
        plan.featured
          ? 'border-accent/50 dark:border-accent/40'
          : 'border-sand-200 dark:border-sand-800'
      }`}
    >
      {/* Top: name, price, tagline, then the CTA */}
      <div className="px-5 pt-6 pb-6 sm:px-6 sm:pt-7">
        <h2 className="text-3xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
          {plan.name}
        </h2>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-5xl">
            {plan.priceLabel}
          </span>
          <span className="text-sm font-medium text-sand-600 dark:text-sand-500">
            / {plan.priceSuffix}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
          {plan.tagline}
        </p>

        <Link
          href={plan.cta.href}
          className={`mt-6 ${buttonClasses({
            variant: plan.cta.variant,
            size: 'lg',
            fullWidth: true,
          })}`}
        >
          {plan.cta.label}
        </Link>
      </div>

      {/* Bottom — features inset */}
      <div className="flex-1 rounded-card bg-sand-50/70 px-5 py-6 dark:bg-sand-950 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sand-600 dark:text-sand-500">
          {plan.listLabel}
        </p>
        <ul className="mt-4 space-y-3">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-sm leading-relaxed text-sand-700 dark:text-sand-200"
            >
              <CheckCircle
                weight="regular"
                size={18}
                className={`mt-0.5 shrink-0 ${
                  plan.featured
                    ? 'text-accent'
                    : 'text-sand-600 dark:text-sand-300'
                }`}
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}



// ─── Page ───────────────────────────────────────────────────────────────────
// The client half of /pricing: the hero, the plans and the questions live
// here. page.tsx wraps them in the shared page shell and closes with the site
// band. One plan family for one person; there is no Business plan.

export function PricingView() {
  const premium = premiumEnabled()
  return (
    <>
      <PageHero
        pill="Pricing"
        pillIcon={<Sparkle weight="regular" size={12} className="text-accent" aria-hidden />}
        title={premium ? 'Simple, honest pricing' : 'Pick your side'}
        sub={
          !premium
            ? 'The free library is free, forever. Browse anonymously, or sign up to save your favorites.'
            : 'Every open component installs with one command, free with an account. Premium adds the design systems, blocks and templates, and the AI Brain.'
        }
      />

      {/* ── Plan cards ── the homepage's pricing width; three plans (Free,
          Monthly, Lifetime) take the wider column. */}
      <div className={`mx-auto ${lifetimeEnabled() ? 'max-w-6xl' : 'max-w-4xl'}`}>
        {premium ? (
          <div className="mt-10 sm:mt-12">
            <PremiumCards />
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-2">
            {PLANS.map((plan, i) => (
              <PlanCard key={plan.name} plan={plan} delay={0.1 + i * 0.08} />
            ))}
          </div>
        )}
      </div>

      {/* ── Pricing FAQ ── the homepage's question rows. */}
      <section aria-labelledby="pricing-faq" className="mx-auto mt-20 max-w-3xl sm:mt-32">
        <SectionHead id="pricing-faq" eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mt-10">
          <FaqRows items={PRICING_FAQ} idPrefix="pricing-faq-row" />
          <FaqHelpCard />
        </div>
      </section>
    </>
  )
}
