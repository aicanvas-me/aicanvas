import Link from 'next/link'
import { Handshake } from '@/app/_icons/icons/handshake'
import { PageHero, PageShell } from '../components/PageKit'
import { LegalArticle } from '../components/LegalArticle'

// ─── /credits ───────────────────────────────────────────────────────────────
// Attributions for third-party creative assets used on AI Canvas (3D models,
// typefaces). Some licenses (CC BY) require this credit; others (OFL fonts) are
// listed as a courtesy. Keeps required attribution off the visual itself.
//
// A server component: the credits are static text, and LegalArticle is the one
// client piece (its "On this page" list).

const extLink =
  'font-medium text-accent underline-offset-4 hover:text-accent/70 hover:underline'

const SECTION = 'mt-12 first:mt-0'
const HEADING = 'text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50'
const BODY = 'mt-4 leading-relaxed text-sand-600 dark:text-sand-400'
// A bulleted credit list; the bullets stay quieter than the words.
const BULLETS =
  'list-disc space-y-2 pl-5 leading-relaxed text-sand-600 marker:text-sand-400 dark:text-sand-400 dark:marker:text-sand-600'
// A credit named in full, as a work title or a typeface.
const NAME = 'font-medium text-sand-900 dark:text-sand-200'

export default function CreditsPage() {
  return (
    <PageShell>
      <PageHero
        size="md"
        pill="Credits"
        pillIcon={<Handshake size={12} className="text-accent" aria-hidden />}
        title="Credits"
        sub={
          <span className="block text-balance">
            AI Canvas runs on its own code, and a few third-party creative assets
            help bring it to life. Their authors and licenses are credited here.
          </span>
        }
      />

      <LegalArticle>
        {/* ── 3D models ── */}
        <section className={SECTION}>
          <h2 className={HEADING}>3D models</h2>
          <ul className="mt-4 space-y-3 leading-relaxed text-sand-600 dark:text-sand-400">
            <li>
              <span className={NAME}>&ldquo;Brain&rdquo;</span> by Poly
              by Google, licensed{' '}
              <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer" className={extLink}>
                CC BY 3.0
              </a>
              , via{' '}
              <a href="https://poly.pizza/m/5mPRPZkI3qt" target="_blank" rel="noopener noreferrer" className={extLink}>
                Poly Pizza
              </a>
              . Used in the Andromeda AI Brain visual.
            </li>
          </ul>
        </section>

        {/* ── Icons ── */}
        <section className={SECTION}>
          <h2 className={HEADING}>Icons</h2>
          <ul className={`mt-4 ${BULLETS}`}>
            <li>
              <a href="https://phosphoricons.com" target="_blank" rel="noopener noreferrer" className={extLink}>Phosphor Icons</a>{' '}
              by Helena Zhang and Tobias Fried, licensed{' '}
              <a href="https://github.com/phosphor-icons/core/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className={extLink}>MIT</a>.
            </li>
            <li>
              <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer" className={extLink}>Lucide</a>, licensed{' '}
              <a href="https://lucide.dev/license" target="_blank" rel="noopener noreferrer" className={extLink}>ISC</a>{' '}
              (a fork of Feather by Cole Bemis).
            </li>
          </ul>
        </section>

        {/* ── Typefaces ── */}
        <section className={SECTION}>
          <h2 className={HEADING}>Typefaces</h2>
          <p className={BODY}>
            Our fonts are used under the SIL Open Font License.
          </p>
          <ul className={`mt-3 ${BULLETS}`}>
            <li>
              <span className={NAME}>Manrope</span> by Mikhail Sharanda
              and Mirko Velimirović.
            </li>
            <li>
              <span className={NAME}>Geist Mono</span> by Vercel.
            </li>
          </ul>
        </section>

        {/* ── Photography ── */}
        <section className={SECTION}>
          <h2 className={HEADING}>Photography</h2>
          <p className={BODY}>
            Some photography across AI Canvas is sourced from{' '}
            <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer" className={extLink}>Unsplash</a>
            , used under the Unsplash License. Attribution is not required by
            that license; we credit it here as a courtesy to the photographers.
          </p>
        </section>

        {/* ── Images & brand marks ── */}
        <section className={SECTION}>
          <h2 className={HEADING}>Images and brand marks</h2>
          <p className={BODY}>
            Interface icons are credited above. Payment network marks (Visa,
            Mastercard, American Express, PayPal, UnionPay) and third-party
            product names and logos are trademarks of their respective owners,
            shown only to indicate accepted payment methods or compatibility.
            Any other third-party imagery is credited where it appears.
          </p>
        </section>

        {/* ── Built with ── */}
        <section className={SECTION}>
          <h2 className={HEADING}>Built with</h2>
          <p className={BODY}>
            AI Canvas is built on open-source software, including{' '}
            <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className={extLink}>Next.js</a>,{' '}
            <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className={extLink}>React</a>,{' '}
            <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" className={extLink}>Tailwind CSS</a>,{' '}
            <a href="https://www.framer.com/motion/" target="_blank" rel="noopener noreferrer" className={extLink}>Framer Motion</a>, and{' '}
            <a href="https://threejs.org" target="_blank" rel="noopener noreferrer" className={extLink}>Three.js</a>{' '}
            with{' '}
            <a href="https://github.com/pmndrs/react-three-fiber" target="_blank" rel="noopener noreferrer" className={extLink}>React Three Fiber</a>{' '}
            and drei, all MIT-licensed.
          </p>
        </section>

        {/* ── Open-source components ── */}
        <section className={SECTION}>
          <h2 className={HEADING}>Open-source components</h2>
          <p className={BODY}>
            The free AI Canvas component library is released under the MIT
            License. See the{' '}
            <Link href="/terms" className={extLink}>Terms</Link> for the full
            licensing detail.
          </p>
        </section>

        {/* ── Code inside components ── */}
        <section className={SECTION}>
          <h2 className={HEADING}>Code inside components</h2>
          <p className={BODY}>
            Everything above is about assets used to build this site. A few
            components we distribute also adapt open-source code from other
            authors. Their original licenses travel with the component source
            and are credited here.
          </p>
          <ul className="mt-3 space-y-3 leading-relaxed text-sand-600 dark:text-sand-400">
            <li>
              <a href="https://github.com/PavelDoGreat/WebGL-Fluid-Simulation" target="_blank" rel="noopener noreferrer" className={extLink}>WebGL-Fluid-Simulation</a>{' '}
              by Pavel Dobryakov, licensed{' '}
              <a href="https://github.com/PavelDoGreat/WebGL-Fluid-Simulation/blob/master/LICENSE" target="_blank" rel="noopener noreferrer" className={extLink}>MIT</a>
              , Copyright 2017 Pavel Dobryakov. Used in the{' '}
              <span className={NAME}>Fluid Simulation Hero</span>{' '}
              component, whose Navier-Stokes solver passes (advect, divergence,
              curl, vorticity confinement, Jacobi pressure, gradient subtract)
              are adapted from it.
            </li>
          </ul>
        </section>
      </LegalArticle>
    </PageShell>
  )
}
