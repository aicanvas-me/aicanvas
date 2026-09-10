'use client'

import Link from 'next/link'
import { CONTACT_EMAIL } from '../lib/config'
import { SiteFooter } from '../components/SiteFooter'
import { HeaderSocials } from '../components/HeaderSocials'

// ─── /terms ───────────────────────────────────────────────────────────────────
// Terms & Conditions for AI Canvas. Operator details live in /impressum to
// avoid duplication.

export default function TermsPage() {
  return (
    <div className="min-h-full bg-sand-50 dark:bg-sand-950">
      <header className="sticky top-0 z-50 hidden h-14 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-sand-200 dark:border-sand-800 bg-sand-50 dark:bg-sand-950 px-6 md:grid">
        <div />
        <Link href="/terms" className="text-sm font-semibold text-olive-600 dark:text-olive-500 transition-colors hover:text-olive-800 dark:hover:text-olive-400">
          /Terms
        </Link>
        <div className="flex items-center justify-end">
          <HeaderSocials />
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl px-4 pt-6 pb-8 sm:px-6 sm:pt-12">
        <p className="mb-6 text-sm font-semibold md:hidden">
          <span className="text-olive-600 dark:text-olive-500">/Terms</span>
        </p>

        <h1 className="text-3xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-4xl">
          Terms &amp; Conditions
        </h1>
        <p className="mt-3 text-sm text-sand-600 dark:text-sand-500">
          Last updated: 2026-05-10. These terms govern your use of AI Canvas.
        </p>

        {/* ── 1. Creator ───────────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">1. Creator</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            AI Canvas (the &ldquo;Service&rdquo;) is the work of a single
            individual (the &ldquo;Creator&rdquo;), reachable at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-olive-600 dark:text-olive-400 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            . References below to &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;the Creator&rdquo; mean that person. References to
            &ldquo;you&rdquo; mean any person who visits or uses AI Canvas.
          </p>
        </section>

        {/* ── 2. The Service ───────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">2. The Service</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            AI Canvas is an open-source registry of animated React components,
            offered through a free tier and an optional paid Premium tier. It
            also publishes design-system templates and an MCP integration that
            exposes the registry to AI coding tools. Browsing is always free, and
            every free component publishes its full AI remix prompt. Premium
            components and blocks publish part of their prompt; the rest is part
            of Premium. Installing free components is free with a free
            account; the closed-source premium components, blocks, design
            systems and templates are part of Premium.
          </p>
        </section>

        {/* ── 2b. Premium subscription ─────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            2b. Premium subscription
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Premium is billed at $8.99 per month or $49.99 per year through
            Paddle.com, our reseller and Merchant of Record. Paddle is the
            seller of record for these transactions and handles payment and
            applicable taxes; your purchase is also subject to Paddle&apos;s
            terms. A subscription requires an account and renews automatically
            at the end of each billing period until cancelled.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            You can cancel at any time from the customer portal linked in your
            account settings; cancellation takes effect at the end of the
            current period and you keep access until then. Because Premium is
            digital content supplied immediately, by starting it you consent to
            immediate performance and acknowledge that your EU/UK 14-day right
            of withdrawal ends once access begins, except where the law provides
            otherwise.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Premium Components, design systems, and templates are closed-source
            and are licensed, not sold, under the separate{' '}
            <Link href="/premium-license" className="text-olive-600 dark:text-olive-400 hover:underline">
              AI Canvas Premium License
            </Link>
            , not under MIT. A paid subscription provides ongoing access,
            updates, and new Premium Components; the licence to Premium
            Components you have already installed is perpetual and survives
            cancellation, so you may keep using and shipping them in your
            projects, except where your payment is reversed or charged back or
            the licence is terminated for breach. See &sect; 7 below.
          </p>
        </section>

        {/* ── 3. Eligibility & user account ────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            3. Eligibility &amp; user account
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            You may create an account using a valid email address and a
            password, or by signing in with Google OAuth. You are responsible
            for keeping your credentials confidential and for any activity that
            takes place under your account. We may suspend or terminate
            accounts used for abuse, fraud, or to violate these terms.
          </p>
        </section>

        {/* ── 4. Component licensing ───────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            4. Component licensing
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Free components published in the public AI Canvas registry and
            source repository are released under the MIT License, as set out in
            the LICENSE file of that repository. You are free to copy them,
            modify them, distribute them, and ship them in your own projects,
            commercial or non-commercial, subject only to the MIT License. This
            applies whether you are on the Free or Premium plan.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            The MIT License does not cover Premium Components. AI Canvas Premium
            Components, design systems, and templates are proprietary, are not
            part of the public registry or repository, and are not
            redistributable. They are licensed separately under the{' '}
            <Link href="/premium-license" className="text-olive-600 dark:text-olive-400 hover:underline">
              AI Canvas Premium License
            </Link>{' '}
            (see &sect; 2b and &sect; 7). The website chrome itself (page
            layout, navigation, branding, non-component code) is the
            Creator&apos;s copyright.
          </p>
        </section>

        {/* ── 4b. Trademarks & independence ────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            4b. Trademarks &amp; independence
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            AI Canvas is an independent project. It is not partnered with,
            sponsored by, endorsed by, or an official integration of the
            third-party tools, platforms, and brands referenced on the site,
            including Claude Code, Lovable, V0, and shadcn. All product names,
            logos, and trademarks are the property of their respective owners and
            are used here only nominatively, to describe compatibility and
            interoperability.
          </p>
        </section>

        {/* ── 5. Acceptable use ────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">5. Acceptable use</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            You agree not to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-sand-600 dark:text-sand-400">
            <li>
              Attempt to circumvent authentication, rate limits, or any
              technical access controls.
            </li>
            <li>
              Scrape, mirror, or republish the registry endpoints under{' '}
              <code className="rounded bg-sand-100 dark:bg-sand-900 px-1 py-0.5 text-xs text-sand-700 dark:text-sand-300">/r/</code>{' '}
              in a way that materially impairs the service for others.
            </li>
            <li>
              Use the service to build, distribute, or operate anything
              illegal, infringing, defamatory, or harmful to third parties.
            </li>
            <li>
              Submit false information about yourself when creating an account.
            </li>
          </ul>
        </section>

        {/* ── 6. Marketing communications ──────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            6. Marketing communications
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            By creating an account you agree that we may send you occasional
            emails about AI Canvas itself: new components, design-system
            updates, MCP releases, and other product news directly related to
            the Service. We do not send marketing for third-party products and
            we do not share your email with third-party advertisers.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            You can opt out at any time by:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-sand-600 dark:text-sand-400">
            <li>Toggling &ldquo;Marketing emails&rdquo; off in your account settings, or</li>
            <li>Clicking the unsubscribe link at the bottom of any marketing email we send.</li>
          </ul>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Opting out does not affect transactional emails (sign-up
            confirmation, magic links, password reset). Those are
            necessary to provide the account service. The legal basis for this
            processing is § 7 (3) UWG (existing-customer exception, as
            interpreted by the ECJ in Case C-654/23).
          </p>
        </section>

        {/* ── 7. Disclaimer of warranties ──────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            7. Disclaimer of warranties
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            AI Canvas is provided on an &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; basis, without warranties of any kind, either
            express or implied, including without limitation warranties of
            merchantability, fitness for a particular purpose,
            non-infringement, or availability. We do not warrant that the
            service will be uninterrupted or error-free, or that components
            published here are free of bugs, free of security issues, or
            suitable for production use without further review.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            You evaluate, test, and ship the components at your own risk. You
            are responsible for deciding whether a component fits your
            project, testing it in your context, complying with the licence
            that governs it (the MIT License for free components, the AI Canvas
            Premium License for Premium Components), and securing the
            application you build with it. AI Canvas does not review or audit
            how its components are used downstream and is not a party to
            anything you build, ship, or sell with them.
          </p>
        </section>

        {/* ── 7b. Premium components ───────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            7b. Premium components
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            AI Canvas Premium Components, design systems, and templates are NOT
            released under the MIT License and are not part of the public
            registry or repository. They are proprietary works, made available
            only to subscribers with an active Premium subscription, and are
            licensed solely under the{' '}
            <Link href="/premium-license" className="text-olive-600 dark:text-olive-400 hover:underline">
              AI Canvas Premium License
            </Link>
            , which forms part of these terms by reference. By subscribing to or
            installing any Premium Component, you agree to that License. In
            particular, you may not redistribute, resell, sublicense, or
            publicly publish the source of any Premium Component, nor use Premium
            Components to build a competing component library, template, theme,
            starter kit, or builder. The licence to Premium Components you have
            already installed is perpetual and survives cancellation and refund,
            except where your payment is reversed or charged back or the licence
            is terminated for breach.
          </p>
        </section>

        {/* ── 8. Limitation of liability ───────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            8. Limitation of liability
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            To the maximum extent permitted by law, the Creator is not liable
            for indirect, incidental, special, consequential, or punitive
            damages, or any loss of profits, revenue, or data, arising out of
            or in connection with your use of AI Canvas. Nothing in these
            terms limits liability that cannot lawfully be limited, in
            particular, liability for intent or gross negligence, or liability
            under the German Product Liability Act
            (Produkthaftungsgesetz) where applicable.
          </p>
        </section>

        {/* ── 9. Account termination ───────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            9. Account termination
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            You can delete your account at any time from{' '}
            <code className="rounded bg-sand-100 dark:bg-sand-900 px-1 py-0.5 text-xs text-sand-700 dark:text-sand-300">
              /account/settings
            </code>
            . Deletion is immediate and removes your account row, saved
            components, install history, and preferences. We may terminate or
            suspend accounts that breach these terms; in such cases we will
            inform you by email where reasonably possible.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Beyond breach-based termination, we may also terminate any account
            at our reasonable discretion with at least 14 days&apos; notice by
            email. For example, if an account no longer fits the
            purpose of the Service. In serious cases (abuse, fraud, security
            risk, repeated breach) we may terminate immediately. In either
            case you can export your data before the account is closed.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            We may also modify, suspend, or discontinue all or part of the
            Service at any time, including individual features,
            components, or the registry itself. Where a change materially
            affects existing accounts we will give reasonable notice, but we
            do not commit to keeping any particular feature or to operating
            AI Canvas for any minimum period.
          </p>
        </section>

        {/* ── 10. Changes ──────────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">10. Changes to these terms</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            We may update these terms when the service materially changes
            (new features, new processors, new legal requirements). The
            &ldquo;Last updated&rdquo; date at the top of this page reflects
            the most recent revision. For changes that materially affect
            existing accounts we will notify you by email or by an in-product
            notice before the change takes effect. Your continued use of AI
            Canvas after a change to these terms means you accept the new
            version. If you do not, your remedy is to delete your
            account.
          </p>
        </section>

        {/* ── 11. Severability ─────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">11. Severability</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            If any provision of these terms is found to be invalid or
            unenforceable, the remaining provisions stay in full effect. The
            invalid provision is replaced by a valid one that comes closest
            to its purpose. This protects the rest of the agreement from
            falling if one clause is later held void.
          </p>
        </section>

        {/* ── 12. Contact ──────────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">12. Contact</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Questions about these terms? Email{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-olive-600 dark:text-olive-400 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}
