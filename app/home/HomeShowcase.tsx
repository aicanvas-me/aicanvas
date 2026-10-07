// The homepage's Andromeda showcase: six finished Pro screens, the non-dashboard
// ones first so the page reads "any app", not "dashboard kit". Server component:
// the posters are the same light/dark pair the Pro overview's template cards
// use, switched by the `dark:` variant so the first byte is already right. The
// toggle is the site's own ThemeToggle, so flipping it here flips the site.

import Link from 'next/link'
import { buttonClasses } from '../components/buttonClasses'
import { ThemeToggle } from '../components/ThemeToggle'
import { Reveal } from './Reveal'
import { TEMPLATES } from '../design-systems/andromeda-pro/overview-b/overview-data'

const SHOWCASE_SLUGS = [
  'andromeda-pro-fintech-landing',
  'andromeda-pro-ai-chat',
  'andromeda-pro-sign-in',
  'andromeda-pro-mission-control',
  'andromeda-pro-city-operations',
  'andromeda-pro-signal-room',
]

const tiles = SHOWCASE_SLUGS.map((slug) => TEMPLATES.find((t) => t.slug === slug)).filter(
  (t) => t !== undefined,
)

export function HomeShowcase({ components, templates }: { components: number; templates: number }) {
  return (
    <section aria-labelledby="home-showcase" className="mt-16 sm:mt-24">
      <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-sand-600">Andromeda</p>
          <h2 id="home-showcase" className="mt-1 text-xl font-bold text-sand-900 dark:text-sand-50">
            Every screen your app needs, already designed.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-sand-600 dark:text-sand-400">
            Landing pages, sign in, AI chat, dashboards and control rooms. {components} components and{' '}
            {templates} templates, in light and dark.
          </p>
        </div>
        <ThemeToggle size="md" />
      </Reveal>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t, i) => (
          <Reveal key={t.slug} y={12} delay={i * 0.05}>
            <Link
              href={`/design-systems/andromeda-pro/templates/${t.folder}`}
              className="group flex flex-col rounded-2xl border border-sand-200 bg-sand-100 p-2.5 transition-colors hover:border-sand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:border-sand-800 dark:bg-sand-900 dark:hover:border-sand-700"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-sand-900">
                {/* Not lazy, for the same reason as the Pro overview's cards: a
                    lazy image hidden by `dark:` never fetches, so the tile would
                    go blank the first time the visitor flips the theme. */}
                {t.image ? (
                  <img
                    src={t.image}
                    alt={`${t.name} template`}
                    decoding="async"
                    className={`absolute inset-0 h-full w-full object-cover object-[left_top] transition-transform duration-200 ease-out motion-safe:group-hover:scale-[1.02] ${
                      t.imageLight ? 'hidden dark:block' : ''
                    }`}
                  />
                ) : null}
                {t.imageLight ? (
                  <img
                    src={t.imageLight}
                    alt={`${t.name} template`}
                    decoding="async"
                    className={`absolute inset-0 h-full w-full object-cover object-[left_top] transition-transform duration-200 ease-out motion-safe:group-hover:scale-[1.02] ${
                      t.image ? 'dark:hidden' : ''
                    }`}
                  />
                ) : null}
              </div>
              <span className="mt-2.5 px-1 pb-0.5 text-sm font-semibold text-sand-900 dark:text-sand-50">
                {t.name}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-6 flex justify-center">
        <Link href="/design-systems/andromeda-pro" className={buttonClasses({ variant: 'outline', size: 'md' })}>
          Explore Andromeda Pro
        </Link>
      </Reveal>
    </section>
  )
}
