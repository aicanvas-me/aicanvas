'use client'

import Link from 'next/link'
import { CONTACT_EMAIL } from '../lib/config'
import { SiteFooter } from '../components/SiteFooter'
import { HeaderSocials } from '../components/HeaderSocials'

// ─── /privacy ─────────────────────────────────────────────────────────────────
// Datenschutzerklärung — Art. 13 GDPR notice. Trimmed to the strict minimum:
// every section here is required by Art. 13 GDPR, BDSG, or § 25 TDDDG.
// Best-practice but non-mandatory items (SSL/TLS statement, data-categories
// enumeration, dedicated hosting/email subsections, AI usage disclosure) were
// intentionally left out for cleanliness.
//
// Controller info and supervisory authority live in /impressum and below.

export default function PrivacyPage() {
  return (
    <div className="min-h-full bg-sand-50 dark:bg-sand-950">
      <header className="sticky top-0 z-50 hidden h-14 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-sand-200 dark:border-sand-800 bg-sand-50 dark:bg-sand-950 px-6 md:grid">
        <div />
        <Link href="/privacy" className="text-sm font-semibold text-olive-600 dark:text-olive-500 transition-colors hover:text-olive-800 dark:hover:text-olive-400">
          /Privacy
        </Link>
        <div className="flex items-center justify-end">
          <HeaderSocials />
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl px-4 pt-6 pb-8 sm:px-6 sm:pt-12">
        <p className="mb-6 text-sm font-semibold md:hidden">
          <span className="text-olive-600 dark:text-olive-500">/Privacy</span>
        </p>

        <h1 className="text-3xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-sand-600 dark:text-sand-500">
          Last updated: 2026-08-16. This policy describes how AI Canvas processes
          personal data, in line with the EU General Data Protection Regulation
          (GDPR / DSGVO) and the German Bundesdatenschutzgesetz (BDSG).
        </p>

        {/* ── 1. Controller ─────────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">1. Controller</h2>
          {/* Art. 13(1)(a) GDPR requires the controller's IDENTITY here, not a
              role label, and a link to the Impressum does not substitute for
              it — the privacy policy must carry the name on its own. */}
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            The controller responsible for the processing of personal data on
            this site is:
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            AI Canvas, Inhaber Alexandru Daniel Tatu
            <br />
            c/o flexdienst – #21685
            <br />
            Kurt-Schumacher-Straße 76
            <br />
            67663 Kaiserslautern
            <br />
            Deutschland
            <br />
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-olive-600 dark:text-olive-400 hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

        {/* ── 1b. Payments and the install token ────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            1b. Payments and the install token
          </h2>

          <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-sand-700 dark:text-sand-300">
            Payments via Paddle (independent controller)
          </h3>
          <p className="mt-2 leading-relaxed text-sand-600 dark:text-sand-400">
            Premium purchases are processed by Paddle (Paddle.com Market Ltd, and
            Paddle, Inc.) as our reseller and Merchant of Record. For your
            purchase, Paddle is the seller of record and acts as an independent
            data controller for the personal data it collects and holds, such as
            your card and billing details. We and Paddle each act as independent
            controllers for the data each of us holds: Paddle controls the
            payment and billing data you enter at its checkout under{' '}
            <a
              href="https://www.paddle.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-olive-600 dark:text-olive-400 hover:underline"
            >
              its own privacy policy
            </a>
            , and we control the limited subscription metadata Paddle sends back
            to us (Section 2). Because Paddle is in the UK and the USA, your data
            may be processed outside the EU under Paddle&apos;s own safeguards.
          </p>

          <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-sand-700 dark:text-sand-300">
            Per-user install token
          </h3>
          <p className="mt-2 leading-relaxed text-sand-600 dark:text-sand-400">
            When you have an account we issue a per-user install token (a key that
            begins with{' '}
            <code className="rounded bg-sand-100 dark:bg-sand-900 px-1 py-0.5 text-xs text-sand-700 dark:text-sand-300">aic_</code>
            ). The CLI and the AI Canvas MCP send this token when you install a
            component so we can recognise your account and unlock any Premium
            content you are entitled to. The token is tied to your identity, so we
            treat it as personal data. We process it to authenticate your installs
            and to keep installs secure against abuse. The lawful basis is Art. 6
            (1)(b) GDPR (performance of the contract for your account and any
            Premium subscription) and Art. 6 (1)(f) GDPR (our legitimate interest
            in securing installs and preventing token abuse). We retain the token
            while your account is active and delete or invalidate it when you
            delete your account or when the token is revoked or regenerated.
          </p>
        </section>

        {/* ── 2. What we collect and why ────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">2. What we collect</h2>

          <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-sand-700 dark:text-sand-300">
            Account data
          </h3>
          <p className="mt-2 leading-relaxed text-sand-600 dark:text-sand-400">
            When you create an account we store your email address and a salted,
            bcrypt-hashed version of your password. If you sign in with Google we
            store the Google account identifier, email, and name returned by
            Google&apos;s OAuth flow instead of a password. We never see or store
            your Google password. Account data lives in our authentication
            database operated by Supabase (see Section 5). If you buy Premium
            without an account, we create one for you from the email address you
            enter at Paddle checkout, so your purchase has an account to attach
            to; you claim it by signing in with that email.
          </p>

          <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-sand-700 dark:text-sand-300">
            Usage data tied to your account
          </h3>
          <p className="mt-2 leading-relaxed text-sand-600 dark:text-sand-400">
            While signed in, we record which components you save (saved
            components), which CLI install commands you copy (install history,
            including the package manager you used), and your interface
            preferences (preferred package manager, preferred AI platform). This
            data is private to you, protected by row-level security, and only
            used to power features such as your saved list, your install history
            tab, and pre-selected defaults in the install drawer. If you save a
            preset in a Lab tool, we store its name and the tool settings it
            contains, including any image you uploaded into the tool, so the
            preset can be restored later. Presets are private to your account
            and deleted with it.
          </p>

          <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-sand-700 dark:text-sand-300">
            Subscription &amp; billing data
          </h3>
          <p className="mt-2 leading-relaxed text-sand-600 dark:text-sand-400">
            When you take out a Premium subscription, payment is handled by our
            payment provider and Merchant of Record, Paddle (Section 5). You enter
            your card and billing details at Paddle&apos;s checkout; those details
            are held by Paddle under its own privacy policy, and we never receive
            or store your card number. From Paddle&apos;s notifications we store a
            small amount of subscription metadata on your account: your
            subscription status, the plan (monthly or yearly), the current renewal
            date, and the customer and subscription identifiers Paddle assigns. We
            use it to unlock your Premium access, show your current plan, and let
            you cancel. If you cancel through the cancellation form, we also
            process the details you submit there in order to end your subscription.
          </p>

          <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-sand-700 dark:text-sand-300">
            Contact form
          </h3>
          <p className="mt-2 leading-relaxed text-sand-600 dark:text-sand-400">
            When you write to us through the contact form we receive the name,
            email address, subject, and message you submit. We use them solely to
            read and answer your enquiry. The message is delivered to our inbox by
            Resend (see Section 5) with your email set as the reply-to address.
          </p>

          <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-sand-700 dark:text-sand-300">
            Feedback form
          </h3>
          <p className="mt-2 leading-relaxed text-sand-600 dark:text-sand-400">
            When you send feedback we receive the category you picked, the
            optional rating, your message, your email address, and, for bug
            reports, the page or component you named. We use them to read your
            feedback and, where an answer is needed, to reply to you.
          </p>
          <p className="mt-2 leading-relaxed text-sand-600 dark:text-sand-400">
            So that bug reports are actually reproducible, we attach three
            technical details to the message: the page you came from, your
            browser window size, and your browser&apos;s user-agent string. If you
            are signed in, the email address on your account is attached as well,
            so we can tell whether a report comes from a subscriber. Feedback is
            delivered to our inbox by Resend (see Section 5) and is not written to
            a database. The legal basis is our legitimate interest in maintaining
            and improving the service (Art. 6 (1)(f) GDPR), and, for payment
            issues, performance of our contract with you (Art. 6 (1)(b) GDPR).
          </p>

          <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-sand-700 dark:text-sand-300">
            Technical data (everyone)
          </h3>
          <p className="mt-2 leading-relaxed text-sand-600 dark:text-sand-400">
            Our hosting provider Vercel records standard server logs containing IP
            address, user-agent string, and timestamp for each request. These
            logs are short-lived and used to detect abuse and operate the
            service. Vercel Web Analytics produces aggregated, cookieless traffic
            statistics. Visitors are identified only by a per-day hash of the
            request and the hash is discarded after 24 hours. No personal
            identifier is created and no cross-site tracking is possible. We
            also measure site usage ourselves, without cookies: our own server
            collects page views (path, referrer, country and region), clicks on
            key buttons (for example copying an install command), searches on
            the site (the typed query and its result count), script errors in
            your browser, and errors raised on our own server while handling a
            request (the affected route, the error message and an error id),
            and stores them as anonymous events in our analytics tool. Every
            such event carries at most a country and region. Nothing is stored
            on or read from your device for this, no visitor identifier is
            created, and your IP address never reaches the analytics store.
          </p>

          <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-sand-700 dark:text-sand-300">
            Anonymous registry hits
          </h3>
          <p className="mt-2 leading-relaxed text-sand-600 dark:text-sand-400">
            Requests to the public component registry endpoints (paths under{' '}
            <code className="rounded bg-sand-100 dark:bg-sand-900 px-1 py-0.5 text-xs text-sand-700 dark:text-sand-300">/r/</code>
            ) are made by the shadcn CLI and the AI Canvas MCP. If you are signed
            in, the command you copied carries your account API token so the pull
            unlocks any premium content you are entitled to. We count these
            requests as anonymous events (component name, requesting tool and its
            user-agent string, country and region) to see which components are
            used. The count contains no account data and no per-user identifier;
            requests are grouped under a shared bucket derived from the tool&apos;s
            user-agent string, which many users share. Requests from a signed-in
            browser session may read your session cookie solely to check what
            your account is entitled to; anonymous CLI and MCP requests carry no
            cookies. Signup abuse is limited through email confirmation.
          </p>

          <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-sand-700 dark:text-sand-300">
            Marketing communications preference
          </h3>
          <p className="mt-2 leading-relaxed text-sand-600 dark:text-sand-400">
            Accounts receive our occasional product newsletter until they
            unsubscribe. We store your subscription status (subscribed, not
            yet decided, or unsubscribed) plus the timestamp of your last
            change. Unsubscribing, via the link in any newsletter or the
            toggle in{' '}
            <code className="rounded bg-sand-100 dark:bg-sand-900 px-1 py-0.5 text-xs text-sand-700 dark:text-sand-300">
              /account/settings
            </code>
            , takes effect immediately and is permanent: an unsubscribed
            address is never mailed again. Transactional emails (sign-up
            confirmation, magic links, password reset) are separate. They are
            necessary to provide the account service.
          </p>

          <h3 className="mt-5 text-sm font-bold uppercase tracking-wider text-sand-700 dark:text-sand-300">
            Children
          </h3>
          <p className="mt-2 leading-relaxed text-sand-600 dark:text-sand-400">
            AI Canvas is a developer tool aimed at adults. We do not knowingly
            collect personal data from children under 16. If you believe a
            child under 16 has created an account or otherwise provided
            personal data to AI Canvas, email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-olive-600 dark:text-olive-400 hover:underline">
              {CONTACT_EMAIL}
            </a>{' '}
            and we will delete the account and the data.
          </p>
        </section>

        {/* ── 3. Legal basis ─────────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">3. Legal basis</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-sand-600 dark:text-sand-400">
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Account &amp; usage data:</strong>{' '}
              Art. 6 (1)(b) GDPR. Processing is necessary to provide the AI
              Canvas account service you signed up for.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Server logs &amp; anonymous analytics:</strong>{' '}
              Art. 6 (1)(f) GDPR. Legitimate interest in operating, securing,
              and understanding usage of the service. We balance this against
              your interests by using only cookieless, anonymous event counting
              with no visitor identifier and no cross-site tracking.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Anonymous registry
              hits:</strong>{' '}
              Art. 6 (1)(f) GDPR. Legitimate interest in operating the service.
              Anonymous requests are counted as anonymous events with no
              per-user identifier, as described in Section 2. Signed-in pulls
              are tied to your account.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Contact form:</strong>{' '}
              Art. 6 (1)(f) GDPR: legitimate interest in answering an enquiry you
              chose to send us. We process only the name, email, subject, and
              message you provide, and keep them no longer than needed to deal
              with the matter.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Marketing communications:</strong>{' '}
              § 7 (3) UWG (existing-customer exception under German competition
              law, as interpreted by the ECJ in Case C-654/23). Marketing is
              limited to AI Canvas&apos;s own products and services. You can
              object at any time at no cost via account settings or the
              unsubscribe link in any email; an objection ends this processing
              immediately.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Subscription &amp; billing:</strong>{' '}
              Art. 6 (1)(b) GDPR. Processing your subscription metadata is
              necessary to perform the Premium contract you entered into. Keeping
              billing and accounting records for the statutory period rests on
              Art. 6 (1)(c) GDPR (compliance with our retention duties under
              German commercial and tax law).
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Bot protection on the cancellation
              form:</strong>{' '}
              Art. 6 (1)(f) GDPR. Legitimate interest in protecting the login-free
              cancellation form from automated abuse. The check (Cloudflare
              Turnstile, Section 5) is cookieless and runs only on that page.
            </li>
          </ul>
        </section>

        {/* ── 4. Required data and automated decisions ───────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            4. Required data and automated decisions
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Providing your email and password (or a Google account, if you sign
            in with Google) is necessary to create and use an AI Canvas account.
            If you do not provide them, you cannot create an account, but
            browsing the site and copying component source remain fully usable
            without signing in. Installing components through the CLI requires
            a free account. There is no statutory obligation to provide any
            data.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            We do not use automated decision-making, including profiling, in the
            sense of Art. 22 GDPR. No decisions affecting you are made
            automatically based on your data.
          </p>
        </section>

        {/* ── 5. Processors ──────────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">5. Processors</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            We use the following service providers to operate AI Canvas. Each is
            bound by a Data Processing Agreement (DPA) and processes data only on
            our instructions. Where data leaves the EU, transfers are protected
            by the EU Standard Contractual Clauses.
          </p>
          <ul className="mt-4 space-y-3 leading-relaxed text-sand-600 dark:text-sand-400">
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Vercel Inc.</strong>{' '}(USA):
              hosting, request logs, cookieless Web Analytics, performance
              measurement (Speed Insights). Edge serving from Frankfurt where
              possible.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Supabase Inc.</strong>{' '}(USA):
              authentication and account database. It also generates the account
              emails (sign-up confirmation, magic links, password reset), which
              are delivered via Resend (below). EU-region project where available.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Resend (Resend, Inc.)</strong>{' '}(USA):
              delivers our outbound email: the account emails above and any
              message you send through the contact form. Mail is sent via Amazon
              SES in the EU region (Ireland) and authenticated with SPF/DKIM; we
              use no open- or click-tracking.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Google Ireland Ltd.</strong>{' '}(EU) /{' '}
              Google LLC (USA): only if you choose &ldquo;Sign in with Google.&rdquo;
              Google authenticates you and returns your email, name, and profile
              identifier to us. Google&apos;s own privacy policy applies to their
              processing.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">ImageKit (Raw Engineering Inc.)</strong>:{' '}
              delivers component preview screenshots from its image CDN. Your
              browser loads these images directly, so ImageKit technically
              receives your IP address and browser type, like any image host.
              We send it no account data; it serves only public image URLs.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Brevo (Sendinblue GmbH)</strong>{' '}(EU,
              Germany): our newsletter platform. It stores the email address
              (and, for Google sign-ins, the name) of newsletter recipients and
              delivers the newsletter. Unsubscribes are synced back to us
              automatically.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Paddle.com Market Ltd</strong>{' '}(UK) /{' '}
              Paddle, Inc. (USA): our payment provider and Merchant of Record for
              Premium subscriptions. Paddle handles checkout, payment processing,
              billing, sales tax and VAT, and refunds, and processes the billing
              and payment details you enter at checkout under its own privacy
              policy. Legal basis: Art. 6(1)(b) GDPR (performance of the contract).
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Cloudflare, Inc.</strong>{' '}(USA):
              provides the cookieless bot-protection check (Turnstile) on the
              login-free cancellation form. To assess whether a request is
              automated, Cloudflare receives the visitor&apos;s IP address and
              browser interaction signals for that form. It sets no cookies on our
              site. Legal basis: Art. 6 (1)(f) GDPR.
            </li>
          </ul>
        </section>

        {/* ── 6. Retention ───────────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">6. Retention</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-sand-600 dark:text-sand-400">
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Account data</strong>{' '}is kept for
              as long as your account exists. When you delete your account, your
              account row, saved components, install history, and preferences
              are removed via cascade.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Contact messages</strong>{' '}are kept
              only as long as needed to handle your enquiry and any follow-up,
              then deleted.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Server logs</strong>{' '}are kept for
              the period set by Vercel&apos;s default log retention (typically a few
              weeks).
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Anonymous analytics events</strong>{' '}
              are not tied to your identity and are kept indefinitely.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Billing and accounting records</strong>{' '}
              that we must keep under German commercial and tax law (HGB § 257,
              AO § 147) are retained for the statutory period, generally six to ten
              years depending on the record type, even after you delete your
              account. During that period we restrict their processing to what the
              law requires. As Merchant of Record, Paddle issues and retains the
              invoices for your purchases under its own obligations.
            </li>
          </ul>
        </section>

        {/* ── 7. Your rights ─────────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">7. Your rights</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Under GDPR you have the right to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-sand-600 dark:text-sand-400">
            <li>Access the personal data we hold about you (Art. 15)</li>
            <li>Request correction of inaccurate data (Art. 16)</li>
            <li>Request deletion of your data (Art. 17, &ldquo;right to be forgotten&rdquo;)</li>
            <li>Restrict or object to processing (Art. 18, 21)</li>
            <li>Receive your data in a portable, machine-readable format (Art. 20)</li>
            <li>Withdraw consent at any time, where processing is based on consent</li>
          </ul>
          <p className="mt-4 leading-relaxed text-sand-600 dark:text-sand-400">
            To exercise any of these rights, email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-olive-600 dark:text-olive-400 hover:underline">
              {CONTACT_EMAIL}
            </a>
            . We respond within 30 days. Before acting on a rights request we
            may ask for reasonable proof that you are the person the data
            belongs to. This is to protect you from someone else
            requesting your data under false pretences.
          </p>
        </section>

        {/* ── 8. Cookies and local storage ───────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            8. Cookies and local storage
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            AI Canvas sets only strictly necessary cookies on its own site. We use
            no tracking or advertising cookies and set nothing on your device that
            requires consent under § 25 (2) TDDDG, so there is no cookie banner.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-sand-600 dark:text-sand-400">
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Authentication session cookie</strong>{' '}
              (set by Supabase): keeps you signed in. Removed on sign-out or
              expiry.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Theme preference cookie</strong>{' '}
              (set by us): remembers whether you chose the light or the dark
              version of the site, so pages load in the theme you picked instead
              of flashing the other one first. It holds the word light or dark
              and nothing else, and it is written only when you use the theme
              switch.
            </li>
            <li>
              <strong className="text-sand-700 dark:text-sand-200">Lab work-in-progress snapshot</strong>{' '}
              (localStorage): if you use a Lab tool while signed out and hit an
              action that needs an account, your current tool settings are
              briefly saved on your device so nothing is lost while you sign in,
              then removed.
            </li>
          </ul>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            All three are exempt from the consent requirement of § 25 (2) TDDDG /
            TTDSG because they are strictly necessary to deliver the
            functionality you actively requested.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Two third-party features deliberately avoid setting cookies on our
            site: the bot-protection check on the cancellation form (Cloudflare
            Turnstile) is cookieless, and the Premium checkout opens only when you
            click to upgrade. That checkout runs inside Paddle&apos;s payment
            overlay, and any cookies there are set by Paddle under its own cookie
            and privacy policy, not by us.
          </p>
        </section>

        {/* ── 9. Right to lodge a complaint ──────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            9. Right to lodge a complaint
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            You have the right to lodge a complaint with a data protection
            supervisory authority. For the Creator, that&apos;s the Bayerisches
            Landesamt für Datenschutzaufsicht (BayLDA).
          </p>
        </section>

        {/* ── 10. Changes ────────────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">10. Changes</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            We update this policy when our processing changes. The &ldquo;Last
            updated&rdquo; date at the top of this page reflects the most recent
            revision. For significant changes affecting signed-in users we will
            notify you by email.
          </p>
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}
