import Link from 'next/link'
import { Scale } from '@/app/_icons/icons/scale'
import { CONTACT_EMAIL } from '../lib/config'
import { PageHero, PageShell } from '../components/PageKit'
import { LegalArticle } from '../components/LegalArticle'

// ─── /refund ────────────────────────────────────────────────────────────────
// Refund & Cancellation Policy for the AI Canvas Premium subscription. Kept as
// a standalone, footer-linked page because Paddle's Merchant-of-Record domain
// review requires a clearly accessible refund policy. Mirrors the subscription
// clause in /terms § 2b; Paddle is the seller of record and handles payment and
// any refunds. Operator details live in /impressum.
//
// A server component: the policy is static text, and LegalArticle is the one
// client piece (its "On this page" list).

const SECTION = 'mt-12 first:mt-0'
const HEADING = 'text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50'
const BODY = 'mt-4 leading-relaxed text-sand-600 dark:text-sand-400'
const LINK =
  'font-medium text-accent underline-offset-4 hover:text-accent/70 hover:underline'

export default function RefundPage() {
  return (
    <PageShell>
      <PageHero
        size="md"
        pill="Legal"
        pillIcon={<Scale size={12} className="text-accent" aria-hidden />}
        title="Refund & Cancellation Policy"
        sub={
          <span className="block text-balance">
            Last updated: 2026-11-10. This policy applies to AI Canvas Premium: the subscription and Lifetime.
          </span>
        }
      />

      <LegalArticle>
        {/* ── 1. Overview ──────────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>1. Overview</h2>
          <p className={BODY}>
            Browsing AI Canvas, remixing free components with AI, and
            installing free components with a free account are always free:
            there is nothing to pay and nothing to refund. This policy covers the
            optional paid{' '}
            <strong className="font-semibold text-sand-700 dark:text-sand-300">Premium</strong>
            , sold as a subscription or as Lifetime, a one-time purchase. Premium
            unlocks the premium closed-source components, blocks, design systems
            and templates.
          </p>
        </section>

        {/* ── 2. How billing works ─────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>2. How billing works</h2>
          <p className={BODY}>
            Premium costs $8.99 per month as a subscription, or $125 once for
            Lifetime. Yearly subscriptions started earlier at $49.99 per year
            keep renewing on the same terms. Payment runs through{' '}
            <a href="https://www.paddle.com" target="_blank" rel="noopener noreferrer" className={LINK}>
              Paddle.com
            </a>
            , our reseller and Merchant of Record. Paddle is the seller of record
            for these transactions and handles payment, billing, and any refunds,
            so your purchase is also governed by{' '}
            <a
              href="https://www.paddle.com/legal/checkout-buyer-terms"
              target="_blank"
              rel="noopener noreferrer"
              className={LINK}
            >
              Paddle&apos;s buyer terms
            </a>
            . Your subscription renews automatically at the end of each billing
            period until you cancel. Lifetime is paid once and never renews.
          </p>
        </section>

        {/* ── 3. Cancelling your subscription ──────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>3. Cancelling your subscription</h2>
          <p className={BODY}>
            You can cancel at any time from the customer portal linked in your{' '}
            <code className="rounded-chip border border-sand-200 bg-sand-100 px-1.5 py-0.5 font-mono text-[0.8125rem] text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300">
              /account/settings
            </code>
            , or without signing in on the{' '}
            <Link href="/kuendigen" className={LINK}>
              cancellation page
            </Link>
            . Cancellation stops future renewals and takes effect at the end of
            your current billing period: you keep Premium access until then, and
            you are not charged again. The period already paid is not refunded.
          </p>
          <p className={BODY}>
            Lifetime has nothing to cancel. If you buy Lifetime while a
            subscription is active, we cancel that subscription for the end of
            its current billing period, so you are not charged for it again.
            Lifetime starts the moment you buy it.
          </p>
        </section>

        {/* ── 4. Refunds & EU/UK right of withdrawal ───────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>4. Refunds &amp; EU/UK right of withdrawal</h2>
          <p className={BODY}>
            Purchases are non-refundable, except where the law requires a
            refund.
          </p>
          <p className={BODY}>
            If you are a consumer in the EU or the UK, you have the statutory
            14-day right of withdrawal for a first purchase, as set out in
            Paddle&apos;s buyer terms. Where the law allows, that right ends
            once you have asked for access to begin and access has begun.
            Renewal payments carry no right of withdrawal. Your statutory
            rights remain unaffected.
          </p>
          <p className={BODY}>
            Refund and withdrawal requests are handled by Paddle, the seller of
            record, under its buyer terms. Use the links in the receipt email
            Paddle sent you, or write to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <p className={BODY}>
            A full refund, a withdrawal, or a chargeback ends Premium access. It
            also ends the licence to the Premium Components installed under that
            payment: you may no longer use or distribute them. A partial refund
            keeps both. Lifetime follows these same rules.
          </p>
        </section>

        {/* ── 5. Billing questions & disputes ──────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>5. Billing questions &amp; disputes</h2>
          <p className={BODY}>
            For a billing question or a wrong charge, email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
              {CONTACT_EMAIL}
            </a>{' '}
            before you dispute a charge with your bank. As Merchant of Record,
            Paddle provides customer service for orders and pays refunds back
            to the original payment method.
          </p>
        </section>

        {/* ── 6. Components you've installed ────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>6. Components you&apos;ve installed</h2>
          <p className={BODY}>
            Free registry components are released under the MIT License and stay
            yours forever; there is no purchase and nothing to refund for them.
          </p>
          <p className={BODY}>
            For Premium, the licence to Premium Components you have already
            installed survives cancellation: you may keep using and shipping
            those components in your projects. This is set out in the{' '}
            <Link href="/premium-license" className={LINK}>
              AI Canvas Premium License
            </Link>
            . Cancelling stops future Premium access, including downloads,
            updates, new components, and the full remix prompts; it does not
            reach back into code already in your project. The licence does not
            survive a full refund, a withdrawal, or a chargeback of the payment
            the components were installed under (Section 4), or termination for
            breach of its terms (for example, redistributing or publishing the
            source).
          </p>
        </section>

        {/* ── 7. Contact ───────────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>7. Contact</h2>
          <p className={BODY}>
            Questions about refunds or cancellation? Email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </LegalArticle>
    </PageShell>
  )
}
