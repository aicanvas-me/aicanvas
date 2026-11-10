import Link from 'next/link'
import { Scale } from '@/app/_icons/icons/scale'
import { CONTACT_EMAIL } from '../lib/config'
import { PageHero, PageShell } from '../components/PageKit'
import { LegalArticle } from '../components/LegalArticle'

// ─── /premium-license ─────────────────────────────────────────────────────────
// The AI Canvas Premium License (a EULA). Versioned v1.1 on its own URL, mirroring
// the convention used by paid component vendors (Tailwind Plus, CoreUI PRO, MUI).
// The public Terms (§ 2b, § 4, § 7b) reference this page by link. It governs the
// closed-source Premium Components, design systems, and templates, and the free
// Line icons (§ 11). The free public registry stays MIT (LICENSE file). Operator
// details live in /impressum.
//
// A server component: the licence is static text, and LegalArticle is the one
// client piece (its "On this page" list).

const SECTION = 'mt-12 first:mt-0'
const HEADING = 'text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50'
const BODY = 'mt-4 leading-relaxed text-sand-600 dark:text-sand-400'
const LINK =
  'font-medium text-accent underline-offset-4 hover:text-accent/70 hover:underline'
// A bulleted clause list; the bullets stay quieter than the words.
const LIST =
  'list-disc space-y-3 pl-5 leading-relaxed text-sand-600 marker:text-sand-400 dark:text-sand-400 dark:marker:text-sand-600'
// The term a clause or list item opens with.
const STRONG = 'font-semibold text-sand-900 dark:text-sand-200'

export default function PremiumLicensePage() {
  return (
    <PageShell>
      <PageHero
        size="md"
        pill="Legal"
        pillIcon={<Scale size={12} className="text-accent" aria-hidden />}
        title="AI Canvas Premium License"
        sub={
          <span className="block text-balance">
            Version 1.1. Effective date: 2026-11-10. This License governs the
            AI Canvas Premium Components and, under Section 11, the Line icons.
            It is separate from, and no replacement for, the MIT License that
            covers the free, open-source AI Canvas registry.
          </span>
        }
      />

      <LegalArticle>
        {/* The acceptance clause opens the licence, before the numbered sections. */}
        <p className="mb-12 leading-relaxed text-sand-600 dark:text-sand-400">
          By installing or using any Premium Component, you agree to this License.
          A paid subscription or Lifetime is purchased and accepted through
          Paddle, our reseller and Merchant of Record, and this License applies
          to the Premium Components delivered to you.
        </p>

        {/* ── 1. Definitions ───────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>1. Definitions</h2>
          <ul className={`mt-4 ${LIST}`}>
            <li>
              <strong className={STRONG}>Provider, we, us:</strong>{' '}the
              Munich-based sole trader who operates aicanvas.me, identified in the{' '}
              <Link href="/impressum" className={LINK}>
                Impressum
              </Link>
              .
            </li>
            <li>
              <strong className={STRONG}>Premium Components:</strong>{' '}the
              closed-source components, blocks, design systems, and templates,
              the Duotone, Solid, and Solid duotone icon styles, the
              design-system rule files written for AI agents, the full remix
              prompts (Section 7.1), and their accompanying source code,
              assets, and documentation that we make available only to
              subscribers and that are delivered through the Premium install
              channel (CLI, MCP, or download). The public, MIT-licensed
              registry components are not Premium Components. We use the single
              term &ldquo;Premium Components&rdquo; throughout this License to
              cover all of them.
            </li>
            <li>
              <strong className={STRONG}>Subscription:</strong>{' '}your
              active, paid AI Canvas Premium plan: a recurring plan, or Lifetime.
            </li>
            <li>
              <strong className={STRONG}>Lifetime:</strong>{' '}AI Canvas
              Premium bought with one payment and no renewal, as set out in
              Section 2. Lifetime stays active until it ends under Section 2.
            </li>
            <li>
              <strong className={STRONG}>You, Licensee:</strong>{' '}the
              person who holds the Subscription, or the individual or entity
              that uses the Line Icons under Section 11. A Subscription is for
              one person. Where a company buys it, it covers the one developer
              the company names, and each further developer who installs needs
              a Subscription of their own.
            </li>
            <li>
              <strong className={STRONG}>Installed Component:</strong>{' '}a
              specific Premium Component, in the version delivered to you, that
              you actually installed or downloaded through the Premium install
              channel while your Subscription was active and while the payment
              for that period, or for Lifetime, had not been refunded in full,
              withdrawn, or reversed.
            </li>
            <li>
              <strong className={STRONG}>End Product:</strong>{' '}an
              application, website, or client project you build that incorporates
              one or more Premium Components, where the Premium Components are a
              part of, and not the point of, the End Product.
            </li>
            <li>
              <strong className={STRONG}>End User:</strong>{' '}a user of an
              End Product. A customer of your End Product is an End User, not a
              sublicensee of the Premium Components.
            </li>
          </ul>
        </section>

        {/* ── 2. Two distinct rights ───────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>
            2. Subscription access and component licence are two distinct rights
          </h2>
          <p className={BODY}>
            <strong className={STRONG}>Access right (lasts only while your
            Subscription is active).</strong>{' '}
            While your Subscription is active we give you access to the full
            Premium catalogue, to updates and bug fixes for Premium Components,
            and to Premium Components we add after you subscribe. This access
            right ends automatically when your Subscription ends for any reason.
          </p>
          <p id="lifetime" className={`${BODY} scroll-mt-10`}>
            <strong className={STRONG}>Lifetime (one payment, no
            renewal).</strong>{' '}
            Lifetime gives you the access right above for as long as AI Canvas
            exists, for one payment and with nothing to renew, including every
            Premium Component we release later. If AI Canvas continues under
            another name, Lifetime continues with it. Lifetime covers AI Canvas
            Premium as delivered through the Premium install channel; products
            or services we sell separately are not part of it. Lifetime is
            personal to you and cannot be transferred, sold, or shared. It ends
            early only if its payment is refunded in full, withdrawn, reversed,
            or charged back (Section 7.4), if this License is terminated for
            breach (Section 7.3), if your account is closed under Section 9 of
            the Terms for abuse, fraud, or another serious breach, or if you
            delete your account: Lifetime is deleted with the account and we
            are not obliged to restore it. A partial refund does not end it. If
            we ever
            discontinue AI Canvas, we give at least 30 days&apos; notice by
            email, and the licence to your Installed Components continues.
          </p>
          <p className={BODY}>
            <strong className={STRONG}>Component licence (perpetual, per
            Section 3).</strong>{' '}
            Separately, each time you install a Premium Component while your
            Subscription is active, you receive the licence in Section 3 to that
            Installed Component. That licence does not end just because your
            Subscription ends, subject to Sections 4 and 7.
          </p>
        </section>

        {/* ── 3. Grant ─────────────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>3. Grant</h2>
          <p className={BODY}>
            Subject to your compliance with this License, we grant you, for each
            Installed Component, a perpetual (except as provided in Section 7),
            worldwide, non-exclusive, non-transferable, royalty-free licence to:
          </p>
          <ul className={`mt-4 ${LIST}`}>
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
          <p className={BODY}>
            You may keep using and shipping every End Product you built with an
            Installed Component for as long as you like, and the people who
            work with you on an End Product may work with the Installed
            Components inside it. There is no per-deployment or per-End-User
            royalty.
          </p>
        </section>

        {/* ── 4. Restrictions ──────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>4. Restrictions</h2>
          <p className={BODY}>
            You may not:
          </p>
          <ul className={`mt-4 ${LIST}`}>
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
              else, or use them to install for another person or company as a
              way of giving them the Premium Components;
            </li>
            <li>
              use the Premium Components to train or fine-tune a
              machine-learning model, or to build a dataset. Using an AI coding
              tool to work on your own End Product is allowed; or
            </li>
            <li>
              remove or obscure any copyright, licence, or attribution notice in
              the Premium Components.
            </li>
          </ul>
        </section>

        {/* ── 5. Client and open-source End Products ───────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>
            5. Client and open-source End Products
          </h2>
          <p className={BODY}>
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
        <section className={SECTION}>
          <h2 className={HEADING}>
            6. Ownership and intellectual property
          </h2>
          <p className={BODY}>
            The Premium Components are licensed, not sold. We and our licensors
            keep all right, title, and interest in and to the Premium Components,
            including all intellectual-property rights. You own the original code
            you write and the End Products you build. By building them, you do
            not acquire any rights in the underlying Premium Components beyond the
            licence granted here.
          </p>
        </section>

        {/* ── 7. Term, termination, and survival ───────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>
            7. Term, termination, and survival
          </h2>
          <p className={BODY}>
            <strong className={STRONG}>7.1 Cancellation or
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
          <p className={BODY}>
            <strong className={STRONG}>7.2 What survives.</strong>{' '}
            Except on termination for breach under Section 7.3, and except where
            payment is refunded in full, withdrawn, reversed, or charged back
            under Section 7.4, the perpetual licence in Section 3 to every
            Premium Component you installed while your Subscription was active
            survives cancellation and non-renewal. You may keep using and keep
            shipping those Installed Components, and the End Products that
            contain them, indefinitely. A partial refund does not affect it.
          </p>
          <p className={BODY}>
            <strong className={STRONG}>7.3 Termination for
            breach.</strong>{' '}
            If you materially breach Section 4 or Section 5, for example by
            redistributing or publicly publishing the source of a Premium
            Component, or by using the Premium Components in a competing product,
            we may terminate this License for good cause, including the perpetual
            licence in Section 3. On such termination you must stop all use and
            distribution of the Premium Components and delete your copies. This is
            in addition to any other remedies.
          </p>
          <p className={BODY}>
            <strong className={STRONG}>7.4 Full refund, withdrawal, chargeback,
            or payment reversal.</strong>{' '}
            No perpetual licence under Section 3 arises, and any such licence
            ends, for any order whose payment is later refunded in full,
            withdrawn under a statutory right of withdrawal, reversed, charged
            back, or otherwise undone. For the purposes of this License, your
            Subscription is not &ldquo;active&rdquo; during any period whose
            payment is undone in one of these ways, and Lifetime whose payment
            is undone counts as never active, so components installed in
            reliance on that payment do not survive under Section 7.2: you must
            stop using and distributing them. Components installed in periods
            that stay paid are not affected, and a partial refund changes
            nothing.
          </p>
          <p className={BODY}>
            <strong className={STRONG}>7.5 Survival of clauses.</strong>{' '}
            Sections 4, 5, 6, 8, 9, 10, and 11 survive any termination of this
            License.
          </p>
        </section>

        {/* ── 8. Warranties and statutory rights ───────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>
            8. Warranties and statutory rights
          </h2>
          <p className={BODY}>
            Where you are a consumer, your statutory rights for digital products
            under §§ 327 ff. of the German Civil Code (BGB), including the rights
            to conformity and to updates, apply for the period during which we
            make the Premium Components available to you under your Subscription.
            Nothing in this License limits or excludes those rights.
          </p>
          <p className={BODY}>
            Beyond those mandatory statutory rights, and to the extent the law
            allows us to do so, the Premium Components are provided as they are.
            We do not separately warrant that the Premium Components are
            error-free, will be uninterrupted, or will meet your specific
            requirements. This does not reduce the statutory conformity and
            update obligations described above.
          </p>
        </section>

        {/* ── 9. Liability ─────────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>9. Liability</h2>
          <p className={BODY}>
            We are liable without limitation for: damages caused by intent or
            gross negligence; injury to life, body, or health; liability under
            the German Product Liability Act (Produkthaftungsgesetz); and any
            matter we have given a guarantee for or fraudulently concealed.
          </p>
          <p className={BODY}>
            For damage caused by simple negligence, we are liable only where we
            breach an essential contractual obligation, meaning an obligation
            whose fulfilment makes the proper performance of this License
            possible in the first place and on whose observance you may regularly
            rely. In that case our liability is limited to the foreseeable,
            contract-typical damage.
          </p>
          <p className={BODY}>
            Any further liability for simple negligence is excluded. The limits
            in this Section do not apply to the cases of unlimited liability
            above, and they do not shorten any statutory limitation period where
            liability cannot be limited.
          </p>
        </section>

        {/* ── 10. Relationship to the MIT free library ─────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>
            10. Relationship to the MIT free library
          </h2>
          <p className={BODY}>
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

        {/* ── 11. Line icons ───────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>11. Line icons</h2>
          <p className={BODY}>
            The Line style of the AI Canvas icons (the &ldquo;Line
            Icons&rdquo;, together with the shared icon runtime they need) is
            licensed free of charge under this License to
            anyone, with or without a Subscription. Sections 3 to 6 apply to
            each Line Icon you install, copy, or download as if it were an
            Installed Component, except that the Line Icons an End Product uses
            may be published as part of that End Product&apos;s source,
            open-source End Products included. You may not redistribute or
            resell the Line Icons as a set or kit, or use them to build a
            competing icon library.
          </p>
          <p className={BODY}>
            <strong className={STRONG}>Credit without a
            Subscription.</strong>{' '}
            Keep the one-line AI Canvas notice that each delivered Line Icon
            file carries, and when you publish the source of an End Product,
            name AI Canvas in its credits or licence file. No visible credit in
            the End Product is required. If you hold a Subscription, neither the
            notice nor the credit is required. An End Product you shipped while
            you held a Subscription needs nothing added after it ends; Line
            Icons you install, copy, or download without a Subscription follow
            this paragraph.
          </p>
          <p className={BODY}>
            The Line Icons are not licensed under the MIT License, including
            where they are installed with, imported by, or shipped inside an
            MIT-licensed free component: MIT covers that component&apos;s own
            code, and this License covers the Line Icons it uses.
          </p>
        </section>

        {/* ── 12. Versioning ───────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>12. Versioning</h2>
          <p className={BODY}>
            This is AI Canvas Premium License version 1.1. Compared with version
            1.0 of 2026-07-01 it adds Lifetime (Section 2) and the Line Icons
            (Section 11), makes a Subscription personal to one developer and
            names more of what counts as a Premium Component (Section 1), adds
            the machine-learning restriction (Section 4), lets the people who
            work with you on an End Product work with the Installed Components
            inside it (Section 3), ends the licence to components installed
            under a payment that is refunded in full or withdrawn (Sections 7.2
            and 7.4), and names the court for business customers (Section 13).
            It applies to Subscriptions
            and Lifetime bought from its effective date; a Subscription started
            earlier stays under version 1.0 until we have told its holder about
            version 1.1 by email with 30 days&apos; notice. The version in
            force for a given Installed Component is the version that applied
            to your Subscription when you installed it. A later
            version will not retroactively reduce the perpetual licence you
            already hold to that Installed Component.
          </p>
        </section>

        {/* ── 13. Governing law ────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>13. Governing law</h2>
          <p className={BODY}>
            This License is governed by the law of the Federal Republic of
            Germany, excluding the UN Convention on Contracts for the
            International Sale of Goods (CISG). If you are a consumer, the
            mandatory consumer-protection rules of your country of habitual
            residence remain unaffected. If you are a merchant or a legal entity
            under public law, the exclusive place of jurisdiction is our place
            of business.
          </p>
        </section>

        {/* ── 14. Severability ─────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>14. Severability</h2>
          <p className={BODY}>
            If any provision of this License is or becomes invalid, the remaining
            provisions stay in full effect. The invalid provision falls away and
            the applicable statutory law applies in its place.
          </p>
        </section>

        {/* ── 15. Contact ──────────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>15. Contact</h2>
          <p className={BODY}>
            Questions about this License? Email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
              {CONTACT_EMAIL}
            </a>
            . See also our{' '}
            <Link href="/terms" className={LINK}>
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/refund" className={LINK}>
              Refund &amp; Cancellation Policy
            </Link>
            .
          </p>
        </section>

      </LegalArticle>
    </PageShell>
  )
}
