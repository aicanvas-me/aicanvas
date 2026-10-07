// Three tiles under "how your agent builds": where it runs, who owns the code,
// and the two themes. Server component, static HTML only.
//
// The framework row is honest on purpose: only the setups we have installed
// and built into from the live registry are lit. The rest install through
// shadcn too and stay dimmed until a test run covers them.
// ponytail: framework marks are name chips, not brand logos; swap in real SVG
// marks once their files are added to /public.

import { Reveal } from './Reveal'
import { TEMPLATES } from '../design-systems/andromeda-pro/overview-b/overview-data'

const FRAMEWORKS: { name: string; tested: boolean }[] = [
  { name: 'Next.js', tested: true },
  { name: 'Vite', tested: true },
  { name: 'Astro', tested: false },
  { name: 'React Router', tested: false },
  { name: 'TanStack Start', tested: false },
  { name: 'Laravel', tested: false },
]

const THEME_POSTER = TEMPLATES.find((t) => t.slug === 'andromeda-pro-sign-in')

const TILE =
  'relative flex h-full flex-col overflow-hidden rounded-2xl border border-sand-200 bg-sand-100 p-5 dark:border-sand-800 dark:bg-sand-900'

function TileHead({ title, line }: { title: string; line: string }) {
  return (
    <>
      <h3 className="text-base font-bold text-sand-900 dark:text-sand-50">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-sand-600 dark:text-sand-400">{line}</p>
    </>
  )
}

export function FeatureGrid() {
  return (
    <section aria-label="Where it works" className="mt-16 sm:mt-24">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* ── Frameworks, full width ── */}
        <Reveal className="sm:col-span-2">
          <div className={TILE}>
            <TileHead
              title="Works in your React stack"
              line="Tested in Next.js and Vite. Installs through shadcn, so Astro, React Router, TanStack Start and Laravel are next on our test list."
            />
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-2.5 py-2">
              <li className="flex h-11 items-center rounded-full border border-dashed border-sand-400 px-4 font-mono text-sm font-semibold text-sand-900 dark:border-sand-600 dark:text-sand-50">
                shadcn
              </li>
              {FRAMEWORKS.map(({ name, tested }) => (
                <li
                  key={name}
                  className={`flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold ${
                    tested
                      ? 'border-sand-300 bg-sand-50 text-sand-900 dark:border-sand-700 dark:bg-sand-950 dark:text-sand-50'
                      : 'border-sand-200 text-sand-600 opacity-60 dark:border-sand-800 dark:text-sand-400'
                  }`}
                >
                  {tested && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-olive-500" />}
                  {name}
                  <span className="sr-only">{tested ? ', tested' : ', not tested yet'}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* ── The code is yours ── */}
        <Reveal delay={0.06}>
          <div className={TILE}>
            <TileHead title="The code is yours" line="Every file lands in your project, ready to edit." />
            <div className="mt-5 rounded-xl border border-sand-200 bg-sand-50 p-4 font-mono text-xs leading-6 text-sand-700 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-300">
              <div aria-hidden className="mb-2 flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sand-300 dark:bg-sand-700" />
                <span className="h-2 w-2 rounded-full bg-sand-300 dark:bg-sand-700" />
                <span className="h-2 w-2 rounded-full bg-sand-300 dark:bg-sand-700" />
              </div>
              <p className="text-sand-900 dark:text-sand-50">
                <span className="text-sand-500">$ </span>npx shadcn@latest add @aicanvas/andromeda
              </p>
              <p><span className="text-olive-600 dark:text-olive-400">✓</span> Checking registry.</p>
              <p><span className="text-olive-600 dark:text-olive-400">✓</span> Installing dependencies.</p>
              <p><span className="text-olive-600 dark:text-olive-400">✓</span> Created files.</p>
              <p className="pl-4 text-sand-600 dark:text-sand-400">components/…</p>
            </div>
          </div>
        </Reveal>

        {/* ── Light and dark ── */}
        <Reveal delay={0.12}>
          <div className={TILE}>
            <TileHead
              title="Light and dark, every screen"
              line="Every component and template ships both themes from one set of tokens."
            />
            {/* The same screen in both themes, split down the middle. */}
            <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-xl border border-sand-200 dark:border-sand-800">
              {THEME_POSTER?.image && (
                <img
                  src={THEME_POSTER.image}
                  alt=""
                  aria-hidden
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-[left_top]"
                />
              )}
              {THEME_POSTER?.imageLight && (
                <img
                  src={THEME_POSTER.imageLight}
                  alt=""
                  aria-hidden
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-[left_top] [clip-path:inset(0_0_0_50%)]"
                />
              )}
              <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-olive-500" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
