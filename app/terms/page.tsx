import Link from 'next/link'
import { Scale } from '@/app/_icons/icons/scale'
import { CONTACT_EMAIL } from '../lib/config'
import { PageHero, PageShell } from '../components/PageKit'
import { LegalArticle } from '../components/LegalArticle'

// ─── /terms ───────────────────────────────────────────────────────────────────
// Terms & Conditions for AI Canvas. Operator details live in /impressum to
// avoid duplication.
//
// A server component: the terms are static text, and LegalArticle is the one
// client piece (its "On this page" list).

const SECTION = 'mt-12 first:mt-0'
const HEADING = 'text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50'
const BODY = 'mt-4 leading-relaxed text-sand-600 dark:text-sand-400'
const LINK =
  'font-medium text-accent underline-offset-4 hover:text-accent/70 hover:underline'
// A bulleted clause list; the bullets stay quieter than the words.
const LIST =
  'list-disc space-y-3 pl-5 leading-relaxed text-sand-600 marker:text-sand-400 dark:text-sand-400 dark:marker:text-sand-600'
const CODE =
  'rounded-chip border border-sand-200 bg-sand-100 px-1.5 py-0.5 font-mono text-[0.8125rem] text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300'

export default function TermsPage() {
  return (
    <PageShell>
      <PageHero
        size="md"
        pill="Legal"
        pillIcon={<Scale size={12} className="text-accent" aria-hidden />}
        title="Terms & Conditions"
        sub={
          <span className="block text-balance">
            Last updated: 2026-11-12. These terms govern your use of AI Canvas.
          </span>
        }
      />

      <LegalArticle>

        {/* ── 1. Creator ───────────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>1. Creator</h2>
          <p className={BODY}>
            AI Canvas (the &ldquo;Service&rdquo;) is the work of a single
            individual (the &ldquo;Creator&rdquo;), reachable at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={LINK}
            >
              {CONTACT_EMAIL}
            </a>
            . References below to &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;the Creator&rdquo; mean that person. References to
            &ldquo;you&rdquo; mean any person who visits or uses AI Canvas.
          </p>
        </section>

        {/* ── 2. The Service ───────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>2. The Service</h2>
          <p className={BODY}>
            AI Canvas is an open-source registry of design systems that AI
            agents build with and standalone React components that fit any of
            them, offered through a free tier and an optional paid Premium tier. It
            also publishes design-system templates and an MCP integration that
            exposes the registry to AI coding tools. Browsing is always free, and
            every free component publishes its full AI remix prompt. Premium
            components and blocks publish part of their prompt; the rest is part
            of Premium. Installing free components is free with a free
            account; the proprietary premium components, blocks, design
            systems and templates are part of Premium.
          </p>
        </section>

        {/* ── 2b. Premium subscription ─────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>
            2b. Premium subscription and Lifetime
          </h2>
          <p className={BODY}>
            Premium is sold as a subscription at $8.99 per month, or as
            Lifetime for a one-time payment of $125.
            Payment runs through Paddle.com, our reseller and Merchant of
            Record. Paddle is the seller of record for these transactions and
            handles payment and applicable taxes; your purchase is also subject
            to Paddle&apos;s terms. A subscription requires an account and
            renews automatically at the end of each billing period until
            cancelled. Lifetime also requires an account, is paid once, never
            renews, and lasts as long as AI Canvas exists, as set out in the
            AI Canvas Premium License. A subscription or Lifetime is for one
            person.
          </p>
          <p className={BODY}>
            You can cancel a subscription at any time in the Paddle customer
            portal linked in your account settings; cancellation takes effect at the
            end of the current period and you keep access until then. Lifetime
            has nothing to cancel. If you buy Lifetime while a subscription is
            active, we cancel that subscription for the end of its current
            period, so you are not charged for it again. Purchases are
            non-refundable, except where the law requires a refund; the{' '}
            <Link href="/refund" className={LINK}>
              Refund &amp; Cancellation Policy
            </Link>{' '}
            sets out the details, including the statutory right of withdrawal
            for consumers in the EU and the UK.
          </p>
          <p className={BODY}>
            Premium Components, design systems, and templates are proprietary
            and are licensed, not sold, under the separate{' '}
            <Link href="/premium-license" className={LINK}>
              AI Canvas Premium License
            </Link>
            , not under MIT. A paid subscription or Lifetime provides ongoing
            access, updates, and new Premium Components; the licence to Premium
            Components you have already installed is perpetual and survives
            cancellation, so you may keep using and shipping them in your
            projects. It ends where the payment for them is refunded in full,
            withdrawn, reversed, or charged back, or where the licence is
            terminated for breach. See &sect; 7b below.
          </p>
        </section>

        {/* ── 3. Eligibility & user account ────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>
            3. Eligibility &amp; user account
          </h2>
          <p className={BODY}>
            You may create an account using a valid email address and a
            password, or by signing in with Google OAuth. You are responsible
            for keeping your credentials confidential and for any activity that
            takes place under your account. That includes what an AI agent does
            after you connect it to your account: it acts as you. We may suspend
            or terminate accounts used for abuse, fraud, or to violate these
            terms.
          </p>
        </section>

        {/* ── 4. Component licensing ───────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>
            4. Component licensing
          </h2>
          <p className={BODY}>
            Free components published in the public AI Canvas registry and
            source repository are released under the MIT License, as set out in
            the LICENSE file of that repository. You are free to copy them,
            modify them, distribute them, and ship them in your own projects,
            commercial or non-commercial, subject only to the MIT License. This
            applies whether you are on the Free or Premium plan.
          </p>
          <p className={BODY}>
            The MIT License does not cover Premium Components. AI Canvas Premium
            Components, design systems, and templates are proprietary, are not
            part of the public registry or repository, and are not
            redistributable. They are licensed separately under the{' '}
            <Link href="/premium-license" className={LINK}>
              AI Canvas Premium License
            </Link>{' '}
            (see &sect; 2b and &sect; 7b). The website chrome itself (page
            layout, navigation, branding, non-component code) is the
            Creator&apos;s copyright.
          </p>
        </section>

        {/* ── 4b. Trademarks & independence ────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>
            4b. Trademarks &amp; independence
          </h2>
          <p className={BODY}>
            AI Canvas is an independent project. Unless we expressly say
            otherwise, it is not partnered with, sponsored by, endorsed by, or
            an official integration of the third-party tools, platforms, and
            brands referenced on the site. All product names, logos, and
            trademarks are the property of their respective owners and are used
            here only nominatively, to describe compatibility and
            interoperability.
          </p>
        </section>

        {/* ── 5. Acceptable use ────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>5. Acceptable use</h2>
          <p className={BODY}>
            You agree not to:
          </p>
          <ul className={`mt-4 ${LIST}`}>
            <li>
              Attempt to circumvent authentication, rate limits, or any
              technical access controls.
            </li>
            <li>
              Scrape, mirror, or republish the registry endpoints under{' '}
              <code className={CODE}>/r/</code>{' '}
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
        <section className={SECTION}>
          <h2 className={HEADING}>
            6. Marketing communications
          </h2>
          <p className={BODY}>
            A new account includes our product newsletter: occasional emails
            about AI Canvas itself, such as new components, design-system
            updates, MCP releases, and other product news directly related to
            the Service. We do not send marketing for third-party products and
            we do not share your email with third-party advertisers.
          </p>
          <p className={BODY}>
            You can object at any time, at no cost, by:
          </p>
          <ul className={`mt-4 ${LIST}`}>
            <li>Toggling &ldquo;Product updates&rdquo; off in your account settings, or</li>
            <li>Clicking the unsubscribe link at the bottom of any newsletter we send.</li>
          </ul>
          <p className={BODY}>
            Opting out does not affect transactional emails (sign-up
            confirmation, magic links, password reset). Those are
            necessary to provide the account service. The legal basis for this
            processing is § 7 (3) UWG (existing-customer exception, as
            interpreted by the ECJ in Case C-654/23) and Art. 6 (1)(f) GDPR.
          </p>
        </section>

        {/* ── 7. Warranties ────────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>
            7. Warranties
          </h2>
          <p className={BODY}>
            Where you are a consumer, your statutory rights apply, including
            the rights for digital products under §§ 327 ff. of the German
            Civil Code (BGB). Nothing in these terms limits or excludes them.
          </p>
          <p className={BODY}>
            Beyond those mandatory rights, and to the extent the law allows,
            AI Canvas is provided as it is. We do not separately warrant that
            the Service will be uninterrupted or error-free, or that components
            published here are free of bugs or security issues, or suitable for
            production use without your own review. Our prompts, design-system
            rules, and MCP tools guide AI tools made by other companies; what
            those tools produce depends on them, and we do not promise a
            particular result.
          </p>
          <p className={BODY}>
            You are responsible for deciding whether a component fits your
            project, testing it in your context, complying with the licence
            that governs it (the MIT License for free components, the AI Canvas
            Premium License for Premium Components), and securing the
            application you build with it. AI Canvas does not review or audit
            how its components are used downstream and is not a party to
            anything you build, ship, or sell with them.
          </p>
        </section>

        {/* ── 7b. Premium components ───────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>
            7b. Premium components
          </h2>
          <p className={BODY}>
            AI Canvas Premium Components, design systems, and templates are NOT
            released under the MIT License and are not part of the public
            registry or repository. They are proprietary works, made available
            only to holders of an active Premium subscription or Lifetime, and
            are licensed solely under the{' '}
            <Link href="/premium-license" className={LINK}>
              AI Canvas Premium License
            </Link>
            , which forms part of these terms by reference. By subscribing to
            Premium, buying Lifetime, or installing any Premium Component, you
            agree to that License. In
            particular, you may not redistribute, resell, sublicense, or
            publicly publish the source of any Premium Component, nor use Premium
            Components to build a competing component library, template, theme,
            starter kit, or builder. The licence to Premium Components you have
            already installed is perpetual and survives cancellation. It ends
            where the payment for them is refunded in full, withdrawn,
            reversed, or charged back, or where the licence is terminated for
            breach.
          </p>
        </section>

        {/* ── 8. Liability ─────────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>
            8. Liability
          </h2>
          <p className={BODY}>
            We are liable without limitation for: damages caused by intent or
            gross negligence; injury to life, body, or health; liability under
            the German Product Liability Act (Produkthaftungsgesetz); and any
            matter we have given a guarantee for or fraudulently concealed.
          </p>
          <p className={BODY}>
            For damage caused by simple negligence, we are liable only where we
            breach an essential contractual obligation, meaning an obligation
            whose fulfilment makes the proper performance of the contract
            possible in the first place and on whose observance you may
            regularly rely. In that case our liability is limited to the
            foreseeable, contract-typical damage.
          </p>
          <p className={BODY}>
            Any further liability for simple negligence is excluded. The limits
            in this section do not apply to the cases of unlimited liability
            above, and they do not shorten any statutory limitation period
            where liability cannot be limited.
          </p>
        </section>

        {/* ── 9. Account termination ───────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>
            9. Account termination
          </h2>
          <p className={BODY}>
            You can delete your account at any time from{' '}
            <code className={CODE}>
              /account/settings
            </code>
            . Deletion removes your account and the data stored with it, except
            records we must keep by law. Deleting your account does not cancel
            a running subscription, so cancel it first. Lifetime is tied to
            your account and is deleted with it; we are not obliged to restore
            it.
          </p>
          <p className={BODY}>
            We may suspend or terminate accounts that breach these terms, and
            in serious cases (abuse, fraud, security risk, repeated breach) we
            may do so immediately; we will inform you by email where reasonably
            possible. A free account we may also close at our reasonable
            discretion with at least 14 days&apos; notice by email. A paid
            subscription we may otherwise end only for the end of the period
            already paid. When Lifetime ends is set out in the AI Canvas Premium
            License. Before an account is closed you can ask us by email for a
            copy of your data.
          </p>
          <p className={BODY}>
            We may also modify, suspend, or discontinue all or part of the
            Service, including individual features, components, or the registry
            itself. Where a change materially affects existing accounts we will
            give reasonable notice, but we do not commit to keeping any
            particular feature or to operating AI Canvas for any minimum
            period. If we ever discontinue AI Canvas as a whole, we will give
            at least 30 days&apos; notice by email, and the licence to Premium
            Components you have already installed continues.
          </p>
        </section>

        {/* ── 10. Changes ──────────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>10. Changes to these terms</h2>
          <p className={BODY}>
            We may update these terms when the Service, the law, or our
            providers change. The &ldquo;Last updated&rdquo; date at the top of
            this page shows the current version. If a change matters for
            existing accounts, we email you the new text at least 30 days
            before it takes effect. If you do not object within those 30 days,
            the new version applies to you from that date; the email says so
            again. If you object, the previous version keeps applying to you,
            and you can delete your account at any time.
          </p>
          <p className={BODY}>
            A change never reduces what you have already paid for or the
            licence to Premium Components you have already installed. A change
            to the price of a running subscription needs your explicit
            agreement.
          </p>
        </section>

        {/* ── 11. Severability ─────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>11. Severability</h2>
          <p className={BODY}>
            If any provision of these terms is or becomes invalid, the
            remaining provisions stay in full effect. The invalid provision
            falls away and the applicable statutory law applies in its place.
          </p>
        </section>

        {/* ── 12. Governing law ────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>12. Governing law</h2>
          <p className={BODY}>
            These terms are governed by the law of the Federal Republic of
            Germany, excluding the UN Convention on Contracts for the
            International Sale of Goods (CISG). If you are a consumer, the
            mandatory consumer-protection rules of your country of habitual
            residence remain unaffected. If you are a merchant or a legal
            entity under public law, the exclusive place of jurisdiction is our
            place of business.
          </p>
        </section>

        {/* ── 13. Contact ──────────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>13. Contact</h2>
          <p className={BODY}>
            Questions about these terms? Email{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={LINK}
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

      </LegalArticle>
    </PageShell>
  )
}
