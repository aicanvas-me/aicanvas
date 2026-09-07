'use client'

import Link from 'next/link'
import { CONTACT_EMAIL } from '../lib/config'
import { SiteFooter } from '../components/SiteFooter'
import { HeaderSocials } from '../components/HeaderSocials'

// ─── /premium-license ─────────────────────────────────────────────────────────
// The AI Canvas Premium License (a EULA). Versioned v1.0 on its own URL, mirroring
// the convention used by paid component vendors (Tailwind Plus, CoreUI PRO, MUI).
// The public Terms (§ 2b, § 4, § 7b) reference this page by link. It governs the
// closed-source Premium Components, design systems, and templates only. The free
// public registry stays MIT (LICENSE file). Operator details live in /impressum.

export default function PremiumLicensePage() {
  return (
    <div className="min-h-full bg-sand-50 dark:bg-sand-950">
      <header className="sticky top-0 z-50 hidden h-14 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-sand-200 dark:border-sand-800 bg-sand-50 dark:bg-sand-950 px-6 md:grid">
        <div />
        <Link href="/premium-license" className="text-sm font-semibold text-olive-600 dark:text-olive-500 transition-colors hover:text-olive-800 dark:hover:text-olive-400">
          /Premium License
        </Link>
        <div className="flex items-center justify-end">
          <HeaderSocials />
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl px-4 pt-6 pb-8 sm:px-6 sm:pt-12">
        <p className="mb-6 text-sm font-semibold md:hidden">
          <span className="text-olive-600 dark:text-olive-500">/Premium License</span>
        </p>

        <h1 className="text-3xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-4xl">
          AI Canvas Premium License
        </h1>
        <p className="mt-3 text-sm text-sand-600 dark:text-sand-500">
          Version 1.0. Effective date: [effective date]. This License governs the
          AI Canvas Premium Components only. It is separate from, and no
          replacement for, the MIT License that covers the free, open-source AI
          Canvas registry.
        </p>
        <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
          By installing or using any Premium Component, you agree to this License.
          A paid subscription is purchased and accepted through Paddle, our
          reseller and Merchant of Record, and this License applies to the
          Premium Components delivered to you.
        </p>

        {/* ── 1. Definitions ───────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">1. Definitions</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-sand-600 dark:text-sand-400">
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Provider, we, us:</strong>{' '}the
              Munich-based sole trader who operates aicanvas.me, identified in the{' '}
              <Link href="/impressum" className="text-olive-600 dark:text-olive-400 hover:underline">
                Impressum
              </Link>
              .
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Premium Components:</strong>{' '}the
              closed-source components, design systems, templates, and their
              accompanying source code, assets, and documentation that we make
              available only to subscribers and that are delivered through the
              Premium install channel (CLI or MCP). The public, MIT-licensed
              registry components are not Premium Components. We use the single
              term &ldquo;Premium Components&rdquo; throughout this License to
              cover all of them.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Subscription:</strong>{' '}your
              active, paid AI Canvas Premium plan.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">You, Licensee:</strong>{' '}the
              individual or entity that holds the Subscription.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Installed Component:</strong>{' '}a
              specific Premium Component, in the version delivered to you, that
              you actually installed or downloaded through the Premium install
              channel while your Subscription was active and while the payment
              for that period had not been reversed.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">End Product:</strong>{' '}an
              application, website, or client project you build that incorporates
              one or more Premium Components, where the Premium Components are a
              part of, and not the point of, the End Product.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">End User:</strong>{' '}a user of an
              End Product. A customer of your End Product is an End User, not a
              sublicensee of the Premium Components.
            </li>
          </ul>
        </section>

        {/* ── 2. Two distinct rights ───────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            2. Subscription access and component licence are two distinct rights
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            <strong className="text-sand-700 dark:text-sand-200">Access right (lasts only while you
            pay).</strong>{' '}
            While your Subscription is active we give you access to the full
            Premium catalogue, to updates and bug fixes for Premium Components,
            and to Premium Components we add after you subscribe. This access
            right ends automatically when your Subscription ends for any reason.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            <strong className="text-sand-700 dark:text-sand-200">Component licence (perpetual, per
            Section 3).</strong>{' '}
            Separately, each time you install a Premium Component while your
            Subscription is active, you receive the licence in Section 3 to that
            Installed Component. That licence does not end just because your
            Subscription ends, subject to Sections 4 and 7.
          </p>
        </section>

        {/* ── 3. Grant ─────────────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">3. Grant</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Subject to your compliance with this License, we grant you, for each
            Installed Component, a perpetual (except as provided in Section 7),
            worldwide, non-exclusive, non-transferable, royalty-free licence to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-sand-600 dark:text-sand-400">
            <li>
              use, copy, and modify the Installed Component and create derivative
              works of it; and
            </li>
            <li>
              incorporate the Installed Component and your derivatives into your
              own End Products and into End Products you build for your clients,
              and to deploy, sell, and distribute those End Products to an
              unlimited number of End Users, including End Products that are
              themselves open source, in each case within the limits of Section
              4.
            </li>
          </ul>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            You may keep using and shipping every End Product you built with an
            Installed Component for as long as you like. There is no per-seat,
            per-deployment, or per-End-User royalty.
          </p>
        </section>

        {/* ── 4. Restrictions ──────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">4. Restrictions</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            You may not:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-sand-600 dark:text-sand-400">
            <li>
              redistribute, resell, sublicense, rent, lend, or otherwise make
              available the Premium Components or their source code, or
              derivatives of them, on their own or separately from a genuine End
              Product, whether as code or as design assets;
            </li>
            <li>
              publish or post the source of any Premium Component publicly,
              including in a public Git repository, gist, or package, in a form
              from which the Premium Component can be identified and separated
              for reuse;
            </li>
            <li>
              use the Premium Components, in original or modified form, to build
              or contribute to a competing product. A competing product is a
              product whose value derives from making the Premium Components
              themselves available to third parties, such as a UI kit, component
              library, design system, theme, or template marketplace that
              re-offers the Premium Components. A genuine End Product you build
              for yourself or for a client is not a competing product, even if
              it is sold or open source;
            </li>
            <li>
              share your Subscription credentials or install token with anyone
              outside your own use, or use them to install on behalf of a third
              party as a way of giving that third party the Premium Components; or
            </li>
            <li>
              remove or obscure any copyright, licence, or attribution notice in
              the Premium Components.
            </li>
          </ul>
        </section>

        {/* ── 5. Client and open-source End Products ───────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            5. Client and open-source End Products
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Section 3 lets you ship Premium Components inside End Products you
            build for clients and inside End Products that are themselves open
            source. You may do so even though the End Product&apos;s own source
            is delivered to a client or published openly, provided the Premium
            Components are not published or handed over in a source-identifiable,
            separable form that lets them be lifted out and reused on their own.
            In plain terms: shipping a Premium Component as an integrated part of
            a real End Product is fine; publishing the Premium Component itself as
            a standalone, reusable file or package is not.
          </p>
        </section>

        {/* ── 6. Ownership and intellectual property ───────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            6. Ownership and intellectual property
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            The Premium Components are licensed, not sold. We and our licensors
            keep all right, title, and interest in and to the Premium Components,
            including all intellectual-property rights. You own the original code
            you write and the End Products you build. By building them, you do
            not acquire any rights in the underlying Premium Components beyond the
            licence granted here.
          </p>
        </section>

        {/* ── 7. Term, termination, and survival ───────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            7. Term, termination, and survival
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            <strong className="text-sand-700 dark:text-sand-200">7.1 Cancellation or
            non-renewal.</strong>{' '}
            If you cancel, do not renew, or your Subscription otherwise ends,
            your access right under Section 2 ends: you lose access to the
            Premium catalogue, to new components, and to updates and new versions
            of components you previously installed. You also lose access to the
            full remix prompt of Premium Components and blocks, which is part of
            the Subscription and not part of the perpetual licence in Section 3;
            the public part of each prompt remains readable to everyone. Losing
            prompt access does not affect any Installed Component: nothing is
            removed from your machine or your repository, and you are not obliged
            to remove anything you already built.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            <strong className="text-sand-700 dark:text-sand-200">7.2 What survives.</strong>{' '}
            Except on termination for breach under Section 7.3, and except where
            payment is reversed or charged back under Section 7.4, the perpetual
            licence in Section 3 to every Premium Component you installed while
            your Subscription was active survives cancellation, non-renewal, and
            refund. You may keep using and keep shipping those Installed
            Components, and the End Products that contain them, indefinitely. A
            refund returns your fee; it does not revoke the Section 3 licence to
            anything you had already installed, and you are not required to remove
            or stop shipping End Products you already built.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            <strong className="text-sand-700 dark:text-sand-200">7.3 Termination for
            breach.</strong>{' '}
            If you materially breach Section 4 or Section 5, for example by
            redistributing or publicly publishing the source of a Premium
            Component, or by using the Premium Components in a competing product,
            we may terminate this License for good cause, including the perpetual
            licence in Section 3. On such termination you must stop all use and
            distribution of the Premium Components and delete your copies. This is
            in addition to any other remedies.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            <strong className="text-sand-700 dark:text-sand-200">7.4 Chargeback or payment
            reversal.</strong>{' '}
            No perpetual licence under Section 3 arises, and any such licence is
            forfeited, for any order whose payment is later reversed, charged
            back, or otherwise undone. For the purposes of this License, your
            Subscription is not &ldquo;active&rdquo; during any period whose
            payment is reversed, so components installed in reliance on that
            payment do not survive under Section 7.2.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            <strong className="text-sand-700 dark:text-sand-200">7.5 Survival of clauses.</strong>{' '}
            Sections 4, 5, 6, 8, 9, and 10 survive any termination of this
            License.
          </p>
        </section>

        {/* ── 8. Warranties and statutory rights ───────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            8. Warranties and statutory rights
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Where you are a consumer, your statutory rights for digital products
            under §§ 327 ff. of the German Civil Code (BGB), including the rights
            to conformity and to updates, apply for the period during which we
            make the Premium Components available to you under your Subscription.
            Nothing in this License limits or excludes those rights.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Beyond those mandatory statutory rights, and to the extent the law
            allows us to do so, the Premium Components are provided as they are.
            We do not separately warrant that the Premium Components are
            error-free, will be uninterrupted, or will meet your specific
            requirements. This does not reduce the statutory conformity and
            update obligations described above.
          </p>
        </section>

        {/* ── 9. Liability ─────────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">9. Liability</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            We are liable without limitation for: damages caused by intent or
            gross negligence; injury to life, body, or health; liability under
            the German Product Liability Act (Produkthaftungsgesetz); and any
            matter we have given a guarantee for or fraudulently concealed.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            For damage caused by simple negligence, we are liable only where we
            breach an essential contractual obligation, meaning an obligation
            whose fulfilment makes the proper performance of this License
            possible in the first place and on whose observance you may regularly
            rely. In that case our liability is limited to the foreseeable,
            contract-typical damage.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Any further liability for simple negligence is excluded. The limits
            in this Section do not apply to the cases of unlimited liability
            above, and they do not shorten any statutory limitation period where
            liability cannot be limited.
          </p>
        </section>

        {/* ── 10. Relationship to the MIT free library ─────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            10. Relationship to the MIT free library
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            The public AI Canvas registry is open source under the MIT License
            and you may use it on those terms. This License does not narrow your
            MIT rights to those free components. The MIT License does not apply to
            Premium Components, and its permissions, including the right to
            redistribute and sublicense, are not extended to Premium Components
            just because both are installed through the same CLI or MCP tooling.
            If a delivered file carries an MIT header, MIT governs that file; if
            it carries a Premium notice or is delivered as a Premium Component,
            this License governs it.
          </p>
        </section>

        {/* ── 11. Versioning ───────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">11. Versioning</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            This is AI Canvas Premium License version 1.0. The version in force
            for a given Installed Component is the version current when you
            installed it. A later version will not retroactively reduce the
            perpetual licence you already hold to that Installed Component.
          </p>
        </section>

        {/* ── 12. Governing law ────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">12. Governing law</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            This License is governed by the law of the Federal Republic of
            Germany, excluding the UN Convention on Contracts for the
            International Sale of Goods (CISG). If you are a consumer, the
            mandatory consumer-protection rules of your country of habitual
            residence remain unaffected.
          </p>
        </section>

        {/* ── 13. Severability ─────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">13. Severability</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            If any provision of this License is or becomes invalid, the remaining
            provisions stay in full effect. The invalid provision falls away and
            the applicable statutory law applies in its place.
          </p>
        </section>

        {/* ── 14. Contact ──────────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">14. Contact</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Questions about this License? Email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-olive-600 dark:text-olive-400 hover:underline">
              {CONTACT_EMAIL}
            </a>
            . See also our{' '}
            <Link href="/terms" className="text-olive-600 dark:text-olive-400 hover:underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/refund" className="text-olive-600 dark:text-olive-400 hover:underline">
              Refund &amp; Cancellation Policy
            </Link>
            .
          </p>
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}
