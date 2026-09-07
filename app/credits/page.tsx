'use client'

import Link from 'next/link'
import { SiteFooter } from '../components/SiteFooter'
import { HeaderSocials } from '../components/HeaderSocials'

// ─── /credits ───────────────────────────────────────────────────────────────
// Attributions for third-party creative assets used on AI Canvas (3D models,
// typefaces). Some licenses (CC BY) require this credit; others (OFL fonts) are
// listed as a courtesy. Keeps required attribution off the visual itself.

const extLink = 'text-olive-600 hover:underline dark:text-olive-400'

export default function CreditsPage() {
  return (
    <div className="min-h-full bg-sand-50 dark:bg-sand-950">
      <header className="sticky top-0 z-50 hidden h-14 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-sand-200 bg-sand-50 px-6 dark:border-sand-800 dark:bg-sand-950 md:grid">
        <div />
        <Link href="/credits" className="text-sm font-semibold text-olive-600 transition-colors hover:text-olive-800 dark:text-olive-500 dark:hover:text-olive-400">
          /Credits
        </Link>
        <div className="flex items-center justify-end">
          <HeaderSocials />
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl px-4 pt-6 pb-8 sm:px-6 sm:pt-12">
        <p className="mb-6 text-sm font-semibold md:hidden">
          <span className="text-olive-600 dark:text-olive-500">/Credits</span>
        </p>

        <h1 className="text-3xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-4xl">
          Credits
        </h1>
        <p className="mt-3 text-base leading-relaxed text-sand-600 dark:text-sand-400">
          AI Canvas runs on its own code, and a few third-party creative assets
          help bring it to life. Their authors and licenses are credited here.
        </p>

        {/* ── 3D models ── */}
        <section className="mt-12">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">3D models</h2>
          <ul className="mt-3 space-y-3 leading-relaxed text-sand-600 dark:text-sand-400">
            <li>
              <span className="text-sand-900 dark:text-sand-200">&ldquo;Brain&rdquo;</span> by Poly
              by Google, licensed{' '}
              <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer" className={extLink}>
                CC BY 3.0
              </a>
              , via{' '}
              <a href="https://poly.pizza/m/5mPRPZkI3qt" target="_blank" rel="noopener noreferrer" className={extLink}>
                Poly Pizza
              </a>
              . Used in the Andromeda Brain visual.
            </li>
          </ul>
        </section>

        {/* ── Icons ── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">Icons</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-sand-600 dark:text-sand-400">
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
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">Typefaces</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Our fonts are used under the SIL Open Font License.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-sand-600 dark:text-sand-400">
            <li>
              <span className="text-sand-900 dark:text-sand-200">Manrope</span> by Mikhail Sharanda
              and Mirko Velimirović.
            </li>
            <li>
              <span className="text-sand-900 dark:text-sand-200">Geist Mono</span> by Vercel.
            </li>
          </ul>
        </section>

        {/* ── Photography ── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">Photography</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Some photography across AI Canvas is sourced from{' '}
            <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer" className={extLink}>Unsplash</a>
            , used under the Unsplash License. Attribution is not required by
            that license; we credit it here as a courtesy to the photographers.
          </p>
        </section>

        {/* ── Images & brand marks ── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">Images and brand marks</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            Interface icons are credited above. Payment network marks (Visa,
            Mastercard, American Express, PayPal, UnionPay) and third-party
            product names and logos are trademarks of their respective owners,
            shown only to indicate accepted payment methods or compatibility.
            Any other third-party imagery is credited where it appears.
          </p>
        </section>

        {/* ── Built with ── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">Built with</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
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
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">Open-source components</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
            The free AI Canvas component library is released under the MIT
            License. See the{' '}
            <Link href="/terms" className={extLink}>Terms</Link> for the full
            licensing detail.
          </p>
        </section>

        {/* ── Code inside components ── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">Code inside components</h2>
          <p className="mt-3 leading-relaxed text-sand-600 dark:text-sand-400">
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
              <span className="text-sand-900 dark:text-sand-200">Fluid Simulation Hero</span>{' '}
              component, whose Navier-Stokes solver passes (advect, divergence,
              curl, vorticity confinement, Jacobi pressure, gradient subtract)
              are adapted from it.
            </li>
          </ul>
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}
