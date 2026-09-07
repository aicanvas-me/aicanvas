'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle, Sparkle } from '@phosphor-icons/react'
import type { ComponentType, ReactNode } from 'react'
import { buttonClasses } from '../components/Button'
import { HeaderSocials } from '../components/HeaderSocials'
import { SiteFooter } from '../components/SiteFooter'
import { TerminatorCool } from '../components/auth/TerminatorReveal'
import { premiumEnabled } from '../../lib/flags'
import { PremiumCards } from '../components/billing/PremiumCards'
import { FaqAccordion, type FaqItem } from '../components/FaqAccordion'

// ─── Plan data ──────────────────────────────────────────────────────────────
// Legacy fallback, rendered only when premiumEnabled() is false. The first card
// is the anonymous baseline; the second is the signed-in (still free)
// experience. The live Free vs Premium pricing is rendered separately when the
// premium flag is on. Avatars are the TerminatorReveal sign-in characters
// (TerminatorCool); both legacy cards are free (anonymous + signed-in).

type Plan = {
  name: string
  Icon: ComponentType
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
    Icon: TerminatorCool,
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
      'Experiment in the Lab',
    ],
  },
  {
    name: 'Free account',
    Icon: TerminatorCool,
    tagline:
      'Sign in and unlock the canvas. Save what you love, tune in the Lab, export to your machine.',
    priceLabel: 'Free',
    priceSuffix: 'Forever',
    cta: {
      label: 'Sign up Free',
      href: '/account/sign-up',
      variant: 'primary',
    },
    listLabel: 'EVERYTHING IN FREE, PLUS',
    features: [
      'Save your favorite components',
      'Save preferences across sessions',
      'Keep Lab presets you can revisit',
      'Export from the Lab directly to your computer',
      'Access to more resources and features',
    ],
    featured: true,
  },
]

// ─── Section wrapper ────────────────────────────────────────────────────────

function Section({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

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
      className={`relative flex flex-col rounded-3xl border bg-sand-100 p-2 dark:bg-sand-900 ${
        plan.featured
          ? 'border-olive-500/50 dark:border-olive-500/40'
          : 'border-sand-200 dark:border-sand-800'
      }`}
    >
      {/* Top — icon + name row, tagline below, then price, CTA */}
      <div className="px-5 pt-6 pb-6 sm:px-6 sm:pt-7">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-end justify-center">
            <plan.Icon />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
            {plan.name}
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
          {plan.tagline}
        </p>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-5xl">
            {plan.priceLabel}
          </span>
          <span className="text-sm font-medium text-sand-600 dark:text-sand-500">
            / {plan.priceSuffix}
          </span>
        </div>

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
      <div className="flex-1 rounded-2xl bg-sand-50/70 px-5 py-6 dark:bg-sand-950 sm:px-6">
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
                    ? 'text-olive-600 dark:text-olive-400'
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


// Curated billing/about FAQ shown under the pricing cards. These mirror entries
// on /faq — keep the answers in sync if those change.
const PRICING_FAQ: FaqItem[] = [
  {
    q: 'How are payments handled, and what is Paddle?',
    qLink: { label: 'Paddle', href: 'https://www.paddle.com/' },
    a: 'Payments run through Paddle, a trusted billing company that acts as the seller of record, meaning it sells Premium and processes the payment on our behalf. Checkout happens in a secure Paddle popup right on the page, so it stays simple and quick.',
  },
  {
    q: 'Is paying secure?',
    a: 'Yes. Payment is handled entirely by Paddle, a professional billing company and seller of record, so your payment details go straight to them and never sit with us. Your account only unlocks Premium after Paddle confirms the payment, keeping everything verified and safe.',
  },
  {
    q: 'Do you handle taxes?',
    a: 'Yes. As the seller of record, Paddle calculates and handles any applicable taxes for your country at checkout, so the right amount is included automatically. You see the full total before you confirm, with nothing to file yourself.',
  },
  {
    q: 'Who is AI Canvas for?',
    a: 'It is built for three ways of working. Designers get a polished starting point and shape it toward their own goals. Developers install a component with one command. And AI agents like Claude Code, Codex, or Cursor browse and install components for you. Pick whichever fits how you work.',
  },
  {
    q: 'Is AI Canvas affiliated with Claude, Cursor, Lovable, or V0?',
    a: 'No. AI Canvas is an independent, solo-built project and is not sponsored by, partnered with, or endorsed by any of those tools. It simply works alongside them so your existing AI workflow gets finished components.',
  },
]

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const premium = premiumEnabled()
  return (
    <div className="flex min-h-full flex-col bg-sand-50 dark:bg-sand-950">
      {/* ── Top bar — mirrors /About: olive /Pricing centered, HeaderSocials right ── */}
      <div className="sticky top-0 z-10 hidden h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-sand-200 bg-sand-50 px-6 dark:border-sand-800 dark:bg-sand-950 md:grid">
        <div />
        <Link
          href="/pricing"
          className="text-sm font-semibold text-olive-600 transition-colors dark:text-olive-500 dark:hover:text-olive-400"
        >
          /Pricing
        </Link>
        <div className="flex justify-end">
          <HeaderSocials />
        </div>
      </div>

      <main className="relative mx-auto w-full max-w-4xl px-4 pt-6 pb-8 sm:px-6 sm:pt-12">
        {/* Mobile breadcrumb */}
        <p className="mb-6 text-sm font-semibold md:hidden">
          <span className="text-olive-600 dark:text-olive-500">/Pricing</span>
        </p>

        {/* ── Hero ── */}
        <Section className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-sand-100 px-3 py-1 text-xs font-semibold text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300">
            <Sparkle weight="regular" size={12} className="text-olive-600 dark:text-olive-400" />
            Our Pricing Plan
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50">
            {premium ? 'Start free, upgrade when you need more' : 'Pick your side'}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-sand-600 dark:text-sand-400">
            {premium
              ? 'A free account unlocks unlimited one-command installs and remix with AI on every free component, free forever. Premium adds the closed-source components, blocks, design systems and templates, with their full remix prompts.'
              : 'The free library is free, forever. Browse anonymously, or sign up to save your work, keep Lab presets, and export to your machine.'}
          </p>
        </Section>

        {/* ── Plan cards ── */}
        {premium ? (
          <PremiumCards />
        ) : (
          <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-2">
            {PLANS.map((plan, i) => (
              <PlanCard key={plan.name} plan={plan} delay={0.1 + i * 0.08} />
            ))}
          </div>
        )}

        {/* ── Pricing FAQ ── */}
        <Section className="mt-16 sm:mt-20" delay={0.15}>
          <h2 className="text-center text-2xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
            Frequently asked questions
          </h2>
          <div className="mx-auto mt-8 max-w-3xl">
            <FaqAccordion items={PRICING_FAQ} idPrefix="pricing-faq" />
          </div>
        </Section>

        <SiteFooter />
      </main>
    </div>
  )
}
