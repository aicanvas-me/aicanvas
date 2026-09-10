'use client'

import Link from 'next/link'
import { CONTACT_EMAIL } from '../lib/config'
import { SiteFooter } from '../components/SiteFooter'
import { HeaderSocials } from '../components/HeaderSocials'

// ─── /impressum ───────────────────────────────────────────────────────────────
// § 5 DDG imprint. Bilingual: German (authoritative) first, English alongside
// in a muted tone. Order: Haftung -> Urheberrecht -> Diensteanbieter -> Kontakt
// -> Verantwortlicher (§ 18 MStV) -> Verbraucherstreitbeilegung.

export default function ImpressumPage() {
  return (
    <div className="min-h-full bg-sand-50 dark:bg-sand-950">
      <header className="sticky top-0 z-50 hidden h-14 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-sand-200 dark:border-sand-800 bg-sand-50 dark:bg-sand-950 px-6 md:grid">
        <div />
        <Link href="/impressum" className="text-sm font-semibold text-olive-600 dark:text-olive-500 transition-colors hover:text-olive-800 dark:hover:text-olive-400">
          /Impressum
        </Link>
        <div className="flex items-center justify-end">
          <HeaderSocials />
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl px-4 pt-6 pb-8 sm:px-6 sm:pt-12">
        <p className="mb-6 text-sm font-semibold md:hidden">
          <span className="text-olive-600 dark:text-olive-500">/Impressum</span>
        </p>

        <h1 className="text-3xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-4xl">
          Impressum
        </h1>
        <p className="mt-3 text-sm text-sand-600 dark:text-sand-500">
          Angaben gemäß § 5 DDG. / Information pursuant to § 5 DDG (German
          Digital Services Act).
        </p>
        <p className="mt-2 text-sm text-sand-600 dark:text-sand-500">
          Bei Abweichungen ist die deutsche Fassung maßgeblich. / In case of
          discrepancies, the German version prevails.
        </p>

        {/* ── Haftung für Inhalte / Liability for content ────────────────── */}
        <section className="mt-12">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            Haftung für Inhalte / Liability for content
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte
            auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
            §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht
            verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
            überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
            Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der
            Nutzung von Informationen nach den allgemeinen Gesetzen bleiben
            hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
            Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
            Bekanntwerden entsprechender Rechtsverletzungen werden wir diese
            Inhalte umgehend entfernen.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-500">
            As a service provider we are responsible for our own content on these
            pages in accordance with general legislation pursuant to § 7 (1) DDG.
            Pursuant to §§ 8 to 10 DDG we are not obliged to monitor transmitted
            or stored third-party information or to investigate circumstances that
            indicate illegal activity. Obligations to remove or block the use of
            information under general law remain unaffected. Liability in this
            respect is, however, only possible from the time we become aware of a
            specific infringement. Upon notification of a corresponding
            infringement we will remove the content immediately.
          </p>
        </section>

        {/* ── Haftung für Links / Liability for external links ───────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            Haftung für Links / Liability for external links
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
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
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-500">
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
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">Urheberrecht / Copyright</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Die kostenlosen Komponenten und Blöcke im AI Canvas Registry stehen
            unter der MIT-Lizenz. Sie dürfen sie frei kopieren, ändern und
            einsetzen. Premium-Inhalte (Komponenten, Blöcke, Templates und
            Design-Systeme) stehen nicht unter der MIT-Lizenz, sondern
            unterliegen der{' '}
            <Link href="/premium-license" className="text-olive-600 dark:text-olive-400 hover:underline">
              AI Canvas Premium License
            </Link>
            . Die Website selbst (Layout, Texte, Branding) ist das Werk des
            Betreibers und urheberrechtlich geschützt. Auf dieser Seite
            verwendete Inhalte Dritter (Icons, Schriften, eingebundene
            Bibliotheken) sind als solche gekennzeichnet und bleiben Eigentum des
            jeweiligen Rechteinhabers.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-500">
            Free components and blocks published in the AI Canvas registry are
            released under the MIT licence. You are free to copy them, modify
            them, and ship them. Premium content (components, blocks, templates
            and design systems) is not MIT licensed and is governed by the{' '}
            <Link href="/premium-license" className="text-olive-600 dark:text-olive-400 hover:underline">
              AI Canvas Premium License
            </Link>
            . The website itself (page layout, written copy, branding) is the
            Creator&apos;s work and copyright. Third-party content used on this
            site (icons, fonts, embedded libraries) is identified as such and
            remains the property of its respective rights holder.
          </p>
        </section>

        {/* ── Diensteanbieter / Service provider ─────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            Diensteanbieter / Service provider
          </h2>
          {/* Ladungsfähige Anschrift via flexdienst (c/o). Lines 2-5 are fixed
              by the provider and must be reproduced verbatim, or post is not
              accepted. Only line 1 (the legal name) is ours to set. */}
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
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Wirtschafts-Identifikationsnummer gemäß § 139c AO: DE463630238
          </p>
          <p className="mt-1 leading-relaxed text-sand-600 dark:text-sand-500">
            Business identification number pursuant to § 139c of the German
            Fiscal Code (AO): DE463630238
          </p>
        </section>

        {/* ── Kontakt / Contact ──────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">Kontakt / Contact</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            E-Mail / Email:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-olive-600 dark:text-olive-400 hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

        {/* ── Verantwortlich für den Inhalt / Responsible for content ─────── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            Verantwortlich für den Inhalt / Responsible for content
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:
            AI Canvas, Inhaber Alexandru Daniel Tatu (Anschrift wie oben).
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-500">
            Responsible for the editorial content pursuant to § 18 (2) MStV:
            AI Canvas, Inhaber Alexandru Daniel Tatu (address as above).
          </p>
        </section>

        {/* ── Verbraucherstreitbeilegung / Consumer dispute resolution ───── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
            Verbraucherstreitbeilegung / Consumer dispute resolution
          </h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Wir sind nicht verpflichtet und nicht bereit, an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle im
            Sinne des § 36 VSBG teilzunehmen. Als Einzelunternehmer ohne
            Beschäftigte sind wir von dieser Informationspflicht ohnehin
            ausgenommen. Die EU-Plattform zur Online-Streitbeilegung (OS) wurde
            von der Europäischen Kommission zum 20. Juli 2025 eingestellt und
            steht nicht mehr zur Verfügung; bitte wenden Sie sich bei Anliegen
            direkt per E-Mail an uns.
          </p>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-500">
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

        <SiteFooter />
      </main>
    </div>
  )
}
