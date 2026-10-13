import { Scales } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { CONTACT_EMAIL } from '../lib/config'
import { PageHero, PageShell } from '../components/PageKit'
import { LegalArticle } from '../components/LegalArticle'

// ─── /impressum ───────────────────────────────────────────────────────────────
// § 5 DDG imprint. Bilingual: German (authoritative) first, English alongside
// in a muted tone. Order: Haftung -> Urheberrecht -> Diensteanbieter -> Kontakt
// -> Verantwortlicher (§ 18 MStV) -> Verbraucherstreitbeilegung.
//
// A server component: the imprint is static text, and LegalArticle is the one
// client piece (its "On this page" list).

const SECTION = 'mt-12 first:mt-0'
const HEADING = 'text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50'
// German, the authoritative text.
const DE = 'mt-4 leading-relaxed text-sand-600 dark:text-sand-400'
// English, the companion: a step quieter, set in from a hairline rule so the
// pair reads as one clause in two languages.
const EN =
  'mt-3 border-l-2 border-sand-200 pl-4 leading-relaxed text-sand-600 dark:border-sand-800 dark:text-sand-500'
const LINK =
  'font-medium text-olive-600 underline-offset-4 hover:text-olive-800 hover:underline dark:text-olive-400 dark:hover:text-olive-300'

export default function ImpressumPage() {
  return (
    <PageShell>
      <PageHero
        size="md"
        pill="Legal"
        pillIcon={<Scales weight="regular" size={12} className="text-olive-600 dark:text-olive-400" aria-hidden />}
        title="Impressum"
        sub={
          // Each line wraps at its slash, so the German sits over its English
          // instead of a break landing mid-sentence.
          <>
            <span className="block">
              <span className="inline-block text-balance">Angaben gemäß § 5 DDG. /</span>{' '}
              <span className="inline-block text-balance">Information pursuant to § 5 DDG (German Digital Services Act).</span>
            </span>
            <span className="mt-3 block text-sm sm:text-base">
              <span className="inline-block text-balance">Bei Abweichungen ist die deutsche Fassung maßgeblich. /</span>{' '}
              <span className="inline-block text-balance">In case of discrepancies, the German version prevails.</span>
            </span>
          </>
        }
      />

      <LegalArticle>
        {/* ── Haftung für Inhalte / Liability for content ────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>Haftung für Inhalte / Liability for content</h2>
          <p className={DE}>
            Für die eigenen Inhalte auf diesen Seiten sind wir nach den
            allgemeinen Gesetzen verantwortlich. Die Regelungen der Artikel 4 bis
            8 der Verordnung (EU) 2022/2065 (Gesetz über digitale Dienste) in
            Verbindung mit § 7 DDG bleiben unberührt. Bei Bekanntwerden einer
            konkreten Rechtsverletzung werden wir die betreffenden Inhalte
            umgehend entfernen; Hinweise nehmen wir unter der unten genannten
            E-Mail-Adresse entgegen.
          </p>
          <p className={EN}>
            We are responsible for our own content on these pages under general
            law. The provisions of Articles 4 to 8 of Regulation (EU) 2022/2065
            (Digital Services Act) in conjunction with § 7 DDG remain unaffected.
            Upon becoming aware of a specific infringement we will remove the
            content concerned immediately; notices can be sent to the email
            address given below.
          </p>
        </section>

        {/* ── Haftung für Links / Liability for external links ───────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>Haftung für Links / Liability for external links</h2>
          <p className={DE}>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren
            Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
            fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
            verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
            Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
            Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige
            Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine
            permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne
            konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
            Bekanntwerden von Rechtsverletzungen werden wir derartige Links
            umgehend entfernen.
          </p>
          <p className={EN}>
            Our site contains links to external websites of third parties, on
            whose content we have no influence. We therefore cannot assume any
            liability for these external contents. The respective provider or
            operator of the linked pages is always responsible for their content.
            The linked pages were checked for possible legal violations at the
            time of linking. Illegal contents were not recognisable at the time of
            linking. A permanent control of the content of the linked pages is,
            however, not reasonable without concrete evidence of an infringement.
            Upon notification of legal violations, we will remove such links
            immediately.
          </p>
        </section>

        {/* ── Urheberrecht / Copyright ───────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>Urheberrecht / Copyright</h2>
          <p className={DE}>
            Die kostenlosen Komponenten und Blöcke im AI Canvas Registry stehen
            unter der MIT-Lizenz. Sie dürfen sie frei kopieren, ändern und
            einsetzen. Premium-Inhalte (Komponenten, Blöcke, Templates und
            Design-Systeme) stehen nicht unter der MIT-Lizenz, sondern
            unterliegen der{' '}
            <Link href="/premium-license" className={LINK}>
              AI Canvas Premium License
            </Link>
            . Die Website selbst (Layout, Texte, Branding) ist das Werk des
            Betreibers und urheberrechtlich geschützt. Auf dieser Seite
            verwendete Inhalte Dritter (Icons, Schriften, eingebundene
            Bibliotheken) sind als solche gekennzeichnet und bleiben Eigentum des
            jeweiligen Rechteinhabers.
          </p>
          <p className={EN}>
            Free components and blocks published in the AI Canvas registry are
            released under the MIT licence. You are free to copy them, modify
            them, and ship them. Premium content (components, blocks, templates
            and design systems) is not MIT licensed and is governed by the{' '}
            <Link href="/premium-license" className={LINK}>
              AI Canvas Premium License
            </Link>
            . The website itself (page layout, written copy, branding) is the
            Creator&apos;s work and copyright. Third-party content used on this
            site (icons, fonts, embedded libraries) is identified as such and
            remains the property of its respective rights holder.
          </p>
        </section>

        {/* ── Diensteanbieter / Service provider ─────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>Diensteanbieter / Service provider</h2>
          {/* Ladungsfähige Anschrift via flexdienst (c/o). Lines 2-5 are fixed
              by the provider and must be reproduced verbatim, or post is not
              accepted. Only line 1 (the legal name) is ours to set. */}
          <p className="mt-4 inline-block rounded-2xl border border-sand-200 bg-sand-100 px-5 py-4 leading-relaxed text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300">
            AI Canvas, Inhaber Alexandru-Daniel Tatu
            <br />
            c/o flexdienst – #21685
            <br />
            Kurt-Schumacher-Straße 74
            <br />
            67663 Kaiserslautern
            <br />
            Deutschland
          </p>
          {/* The number never breaks at its hyphen. */}
          <p className={DE}>
            Wirtschafts-Identifikationsnummer gemäß § 139c AO: <span className="whitespace-nowrap">DE463630238-00001</span>
          </p>
          <p className={EN}>
            Business identification number pursuant to § 139c of the German
            Fiscal Code (AO): <span className="whitespace-nowrap">DE463630238-00001</span>
          </p>
        </section>

        {/* ── Kontakt / Contact ──────────────────────────────────────────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>Kontakt / Contact</h2>
          <p className={DE}>
            E-Mail / Email:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-2 leading-relaxed text-sand-600 dark:text-sand-400">
            Kontaktformular / Contact form:{' '}
            <a href="/contact" className={LINK}>
              aicanvas.me/contact
            </a>
          </p>
        </section>

        {/* ── Verantwortlich für den Inhalt / Responsible for content ─────── */}
        <section className={SECTION}>
          <h2 className={HEADING}>Verantwortlich für den Inhalt / Responsible for content</h2>
          <p className={DE}>
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:
            AI Canvas, Inhaber Alexandru-Daniel Tatu (Anschrift wie oben).
          </p>
          <p className={EN}>
            Responsible for the editorial content pursuant to § 18 (2) MStV:
            AI Canvas, Inhaber Alexandru-Daniel Tatu (address as above).
          </p>
        </section>

        {/* ── Verbraucherstreitbeilegung / Consumer dispute resolution ───── */}
        <section className={SECTION}>
          <h2 className={HEADING}>Verbraucherstreitbeilegung / Consumer dispute resolution</h2>
          <p className={DE}>
            Wir sind nicht verpflichtet und nicht bereit, an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle im
            Sinne des § 36 VSBG teilzunehmen. Als Einzelunternehmer ohne
            Beschäftigte sind wir von dieser Informationspflicht ohnehin
            ausgenommen. Die EU-Plattform zur Online-Streitbeilegung (OS) wurde
            von der Europäischen Kommission zum 20. Juli 2025 eingestellt und
            steht nicht mehr zur Verfügung; bitte wenden Sie sich bei Anliegen
            direkt per E-Mail an uns.
          </p>
          <p className={EN}>
            We are not obliged and not willing to participate in
            dispute-resolution proceedings before a consumer arbitration board
            (Verbraucherschlichtungsstelle) within the meaning of § 36 VSBG. As a
            sole trader with no employees, we are in any event exempt from this
            information duty. The EU Online Dispute Resolution (ODR) platform was
            discontinued by the European Commission on 20 July 2025 and is no
            longer available; for any concern, please contact us directly by
            email.
          </p>
        </section>
      </LegalArticle>
    </PageShell>
  )
}
