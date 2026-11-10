import { Scale } from '@/app/_icons/icons/scale'
import { CONTACT_EMAIL } from '../lib/config'
import { PageHero, PageShell } from '../components/PageKit'
import { LegalArticle } from '../components/LegalArticle'

// ─── /privacy ─────────────────────────────────────────────────────────────────
// Datenschutzerklärung, the Art. 13 GDPR notice, held to what Art. 13 asks for:
// controller, purposes with legal basis, recipients, transfers, retention,
// rights. Recipients are named by type and country; only Paddle and Google are
// named, because the visitor meets them directly.
//
// A server component: the policy is static text, and LegalArticle is the one
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
const CODE =
  'rounded-chip border border-sand-200 bg-sand-100 px-1.5 py-0.5 font-mono text-[0.8125rem] text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300'
// A set-apart block: the controller's address, and the right to object.
const BOX =
  'mt-4 rounded-card border border-sand-200 bg-sand-100 px-5 py-4 leading-relaxed text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300'

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHero
        size="md"
        pill="Legal"
        pillIcon={<Scale size={12} className="text-accent" aria-hidden />}
        title="Privacy Policy"
        sub={
          <span className="block text-balance">
            Last updated: 2026-11-10. This policy describes how AI Canvas processes
            personal data, in line with the EU General Data Protection Regulation
            (GDPR / DSGVO) and the German Bundesdatenschutzgesetz (BDSG).
          </span>
        }
      />

      <LegalArticle>

        {/* ── 1. Controller ─────────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>1. Controller</h2>
          {/* Art. 13(1)(a) GDPR requires the controller's IDENTITY here, not a
              role label, and a link to the Impressum does not substitute for
              it — the privacy policy must carry the name on its own. */}
          <p className={BODY}>
            The controller responsible for the processing of personal data on
            this site is:
          </p>
          <p className={`inline-block ${BOX}`}>
            AI Canvas, Inhaber Alexandru-Daniel Tatu
            <br />
            c/o flexdienst – #21685
            <br />
            Kurt-Schumacher-Straße 74
            <br />
            67663 Kaiserslautern
            <br />
            Deutschland
            <br />
            <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

        {/* ── 2. What we process and why ────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>2. What we process and why</h2>
          <ul className={`mt-4 ${LIST}`}>
            <li>
              <strong className={STRONG}>Your account.</strong>{' '}
              Your email address and your password, which we store only as a
              hash. If you sign in with Google, we receive your Google account
              identifier, email address, name, and profile picture instead of
              a password. If you buy Premium without an account, we create one
              from the email address you gave at checkout. Legal basis: Art. 6
              (1)(b) GDPR, providing the account.
            </li>
            <li>
              <strong className={STRONG}>Using your account.</strong>{' '}
              The components you save, the install commands you copy, your
              preferences, any tool presets you save, your install token (a key
              that begins with <code className={CODE}>aic_</code> and
              identifies your account to the CLI and the AI Canvas MCP), and a
              record of what we delivered to your account and when. If you
              connect an AI agent to your account, we keep its name, when it
              connected and was last used, and the country it connected from,
              and we email you when a new agent connects. Legal basis: Art. 6
              (1)(b) GDPR, and Art. 6 (1)(f) GDPR for the delivery record and
              the agent details: our legitimate interest in supporting members,
              improving the Service, and protecting accounts.
            </li>
            <li>
              <strong className={STRONG}>Purchases.</strong>{' '}
              Premium is sold by Paddle (Paddle.com Market Ltd and Paddle,
              Inc.), our reseller and Merchant of Record. Paddle collects your
              payment and billing details as an independent controller under{' '}
              <a
                href="https://www.paddle.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className={LINK}
              >
                its own privacy policy
              </a>
              ; we never receive your card number. From Paddle we receive and
              store your plan, its status and renewal date, Paddle&apos;s
              identifiers, and billing events such as a payment, a
              cancellation, a refund, or a chargeback. Legal basis: Art. 6
              (1)(b) GDPR; Art. 6 (1)(c) GDPR for records we must keep under
              commercial and tax law; Art. 6 (1)(f) GDPR for our billing log:
              our legitimate interest in answering billing questions and
              keeping access correct.
            </li>
            <li>
              <strong className={STRONG}>Newsletter.</strong>{' '}
              A new account includes our product newsletter. We use your email
              address (and, for Google sign-ins, your name) to send it until
              you unsubscribe, and we keep your subscription status. Legal
              basis: § 7 (3) UWG. It covers AI Canvas&apos;s own products only.
              You can object at any time, at no cost, through the link in any
              newsletter or the toggle in{' '}
              <code className={CODE}>/account/settings</code>.
            </li>
            <li>
              <strong className={STRONG}>Messages you send us.</strong>{' '}
              What you enter in the contact form, the feedback form, or the
              cancellation form. Feedback also carries the page you came from
              and your browser details, so that a bug can be reproduced. Legal
              basis: Art. 6 (1)(f) GDPR, our legitimate interest in answering
              you and maintaining the Service, and Art. 6 (1)(b) GDPR where it
              concerns your contract.
            </li>
            <li>
              <strong className={STRONG}>Server logs and statistics.</strong>{' '}
              Our hosting provider records your IP address, browser type, and
              the time of each request in short-lived server logs. We also
              count how the site is used, without cookies and without an
              identifier for you. Legal basis: Art. 6 (1)(f) GDPR, our
              legitimate interest in operating, securing, and understanding
              the Service.
            </li>
            <li>
              <strong className={STRONG}>Content from other servers.</strong>{' '}
              Some pages load images, fonts, and map data from the servers of
              specialised providers, the cancellation form loads a bot check,
              and the checkout loads Paddle&apos;s payment frame when you start
              a purchase. Your browser connects to these providers directly,
              so they receive your IP address and browser type. Legal basis:
              Art. 6 (1)(f) GDPR, our legitimate interest in delivering the
              site quickly and protecting it from abuse; Art. 6 (1)(b) GDPR
              for the checkout.
            </li>
          </ul>
          <p className={BODY}>
            An email address is needed for an account; you can browse the site
            without one. There is no legal duty to give us any data.
          </p>
        </section>

        {/* ── 3. Who receives your data ─────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>3. Who receives your data</h2>
          <ul className={`mt-4 ${LIST}`}>
            <li>our hosting and site-statistics provider (USA);</li>
            <li>
              our database and sign-in provider (USA; the data is stored in the
              EU);
            </li>
            <li>our email delivery provider (USA);</li>
            <li>our newsletter provider (EU);</li>
            <li>
              image and content delivery networks, and a bot-check provider
              (USA and other countries);
            </li>
            <li>
              <strong className={STRONG}>Paddle</strong>{' '}(UK and USA), when
              you buy Premium;
            </li>
            <li>
              <strong className={STRONG}>Google</strong>{' '}(Ireland and USA),
              only if you choose to sign in with Google.
            </li>
          </ul>
          <p className={BODY}>
            Where data goes to a country outside the EU, the transfer rests on
            an adequacy decision of the European Commission (for the USA, the
            EU-US Data Privacy Framework) or on the EU Standard Contractual
            Clauses. You can ask us for a copy of the safeguards.
          </p>
        </section>

        {/* ── 4. How long we keep it ────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>4. How long we keep it</h2>
          <ul className={`mt-4 ${LIST}`}>
            <li>
              <strong className={STRONG}>Account data</strong>{' '}for as long
              as your account exists. You can delete your account in{' '}
              <code className={CODE}>/account/settings</code>; the data stored
              with it is deleted then.
            </li>
            <li>
              <strong className={STRONG}>Messages</strong>{' '}for as long as
              we need them to deal with your request.
            </li>
            <li>
              <strong className={STRONG}>Server logs</strong>{' '}for the short
              period set by our hosting provider.
            </li>
            <li>
              <strong className={STRONG}>Billing records</strong>{' '}for the
              retention periods of German commercial and tax law, also after
              you delete your account.
            </li>
            <li>
              <strong className={STRONG}>A newsletter unsubscribe</strong>{' '}
              for as long as needed to make sure the address is not mailed
              again.
            </li>
          </ul>
        </section>

        {/* ── 5. Cookies and local storage ──────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>5. Cookies and local storage</h2>
          <p className={BODY}>
            We set only cookies and local storage that are strictly necessary
            (§ 25 (2) TDDDG): to keep you signed in, to remember the light or
            dark theme you chose, and to keep your place and your work on the
            site. We use no advertising or tracking cookies. Paddle&apos;s
            payment frame may set its own cookies under Paddle&apos;s policy.
          </p>
        </section>

        {/* ── 6. Your rights ────────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>6. Your rights</h2>
          <p className={BODY}>
            Under the GDPR you have the right to:
          </p>
          <ul className={`mt-4 ${LIST}`}>
            <li>Access the personal data we hold about you (Art. 15)</li>
            <li>Have inaccurate data corrected (Art. 16)</li>
            <li>Have your data deleted (Art. 17)</li>
            <li>Have processing restricted (Art. 18)</li>
            <li>Receive your data in a portable format (Art. 20)</li>
            <li>
              Lodge a complaint with a data protection supervisory authority
              (Art. 77)
            </li>
          </ul>
          <p className={BODY}>
            To use any of these rights, email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
              {CONTACT_EMAIL}
            </a>
            . If we have reasonable doubts about who is asking, we may ask for
            proof that the data is yours. We may refuse, or charge a reasonable
            fee for, requests that are manifestly unfounded or excessive
            (Art. 12 (5) GDPR).
          </p>
          <p className={BOX}>
            <strong className={STRONG}>Right to object (Art. 21 GDPR).</strong>{' '}
            Where we process your data on the basis of a legitimate interest
            (Art. 6 (1)(f) GDPR), you may object at any time on grounds
            relating to your particular situation. You may object to the
            newsletter at any time without giving a reason. An email to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
              {CONTACT_EMAIL}
            </a>{' '}
            is enough.
          </p>
        </section>

        {/* ── 7. Changes ────────────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>7. Changes</h2>
          <p className={BODY}>
            We update this policy when our processing changes. The &ldquo;Last
            updated&rdquo; date at the top of this page shows the current
            version.
          </p>
        </section>

      </LegalArticle>
    </PageShell>
  )
}
