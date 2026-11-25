import type { Metadata } from 'next'
import { ArrowRight } from '@/app/_icons/icons/arrow-right'
import { Puzzle } from '@/app/_icons/icons/puzzle'
import { buttonClasses } from '../../components/buttonClasses'
import { FaqRows } from '../../components/FaqRows'
import { CtaBand, PageHero, PageShell, SectionHead } from '../../components/PageKit'
import { StageLight } from '../../components/StageLight'
import { Reveal } from '../../home/Reveal'
import { SITE_URL } from '../../lib/config'
import { pageMetadata } from '../../lib/page-metadata'
import { faqJsonLd } from '../../lib/faq'
import { CRAFTS, ENTRIES, SKILLS_FAQ } from '../_lib/entries'
import { HERO_FILM, TILE_FILMS } from '../_lib/media'
import { FilmStage } from '../FilmStage'
import { FilmTile } from '../FilmTile'
import { InstallPanel } from '../InstallPanel'
import { Process } from '../Process'
import { WorkWays } from '../WorkWays'
import { EntryCard, KindPill, WorksWith } from '../EntryCard'
import { PremiumBadge } from '../../components/billing/PremiumBadge'

export const metadata: Metadata = pageMetadata({
  title: 'AI Agent Skills and Plugins: whoosh, Videos Written in Code',
  social: 'AI Canvas skills and plugins for AI agents',
  description:
    'Skills and plugins for Claude Code, Codex and other AI agents. Start with whoosh: your agent writes a motion-graphics film in code and renders an mp4.',
  url: `${SITE_URL}/skills/whoosh`,
})

const FEATURED = ENTRIES.find((e) => e.featured)!
const OTHERS = ENTRIES.filter((e) => !e.featured)
// With one entry coming, its hook and body head the section instead of a generic line.
const SOLO = OTHERS.length === 1 ? OTHERS[0] : null

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: FEATURED.name,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Cross-platform',
  description: FEATURED.body,
  url: `${SITE_URL}/skills/${FEATURED.slug}`,
  publisher: { '@type': 'Organization', name: 'AI Canvas', url: SITE_URL },
}

const SPECS = [
  { n: '3D', label: 'three.js and physics built in' },
  { n: '57', label: 'motion recipes inside' },
  { n: '4K', label: 'max resolution' },
  { n: '60', label: 'frames per second' },
]

export default function SkillsPage() {
  // Each 9:16 film stands beside two wide ones, sides alternating; the rest run below.
  const talls = TILE_FILMS.filter((f) => f.tall)
  const wide = TILE_FILMS.filter((f) => !f.tall)
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(SKILLS_FAQ)) }} />
      <style>{`
        @keyframes skillsStage { from { opacity: 0; transform: translateY(24px) scale(.97) } to { opacity: 1; transform: none } }
        .skills-stage { animation: skillsStage .7s cubic-bezier(.22,1,.36,1) .4s both }
        @media (prefers-reduced-motion: reduce) { .skills-stage { animation: none } }
      `}</style>
      <PageShell>
        <PageHero
          pill="Skills & plugins"
          pillIcon={<Puzzle size={12} className="text-accent" aria-hidden />}
          title="Teach your agent a new trick."
          accent="New abilities, one command away."
          sub="Each one teaches your AI agent a job it could not do yesterday. Install it with one command, then just ask. First up is whoosh: one sentence in, a finished video out."
        >
          <a href={`#${FEATURED.slug}-install`} className={buttonClasses({ variant: 'primary', size: 'lg' })}>
            Install whoosh
            <ArrowRight size={14} />
          </a>
          <a href="#next" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
            See what is next
          </a>
        </PageHero>

        {/* Not in a Reveal: a resting transform would pin the fixed copy toast inside the panel. */}
        <section
          id={FEATURED.slug}
          aria-labelledby="whoosh-name"
          className="skills-stage relative mx-auto mt-12 max-w-6xl overflow-hidden rounded-section p-3 sm:mt-16 sm:p-5"
        >
          <StageLight />
          <div className="relative">
            <FilmStage />

            <Reveal y={12} className="mt-8 grid grid-cols-2 gap-y-6 sm:mt-10 sm:grid-cols-4">
              {SPECS.map((s) => (
                <div key={s.n} className="text-center">
                  <p className="text-4xl font-extrabold tracking-tight text-sand-900 sm:text-5xl dark:text-sand-50">{s.n}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">
                    {s.label}
                  </p>
                </div>
              ))}
            </Reveal>

            <div className="mt-10 grid gap-10 px-2 pb-4 sm:mt-14 sm:px-5 sm:pb-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <KindPill kind={FEATURED.kind} />
                  <PremiumBadge className="py-1 text-xs" />
                </div>
                <h2
                  id="whoosh-name"
                  className="mt-4 text-5xl font-extrabold tracking-tight text-sand-900 sm:text-7xl dark:text-sand-50"
                >
                  {FEATURED.name}
                </h2>
                <p className="mt-3 text-xl font-bold tracking-tight text-sand-900 sm:text-2xl dark:text-sand-50">
                  {FEATURED.hook}
                </p>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-sand-600 dark:text-sand-400">{FEATURED.body}</p>
                <div className="mt-8">
                  <WorksWith entry={FEATURED} />
                </div>
              </div>
              <div>
                <InstallPanel entry={FEATURED} id={`${FEATURED.slug}-install`} />
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="skills-films" className="mx-auto mt-20 max-w-6xl sm:mt-32">
          <SectionHead
            id="skills-films"
            eyebrow="Made with whoosh"
            title="What your agent can make with whoosh"
            sub="Every film here is one film.js an AI agent wrote, rendered straight from code: no editing, no compositing, no timeline."
          />
          {talls.map((tall, t) => (
            <div
              key={tall.id}
              className={`${t ? 'mt-4' : 'mt-10'} grid gap-4 ${t % 2 ? 'lg:grid-cols-[1fr_1.58fr]' : 'lg:grid-cols-[1.58fr_1fr]'}`}
            >
              <div className={`grid gap-4 ${t % 2 ? 'lg:order-2' : ''}`}>
                {wide.slice(t * 2, t * 2 + 2).map((f, i) => (
                  <Reveal key={f.id} delay={i * 0.08}>
                    <FilmTile src={f.src} poster={f.poster} label={f.label} className="aspect-video" />
                  </Reveal>
                ))}
              </div>
              <Reveal delay={0.16} className="mx-auto w-full max-w-xs lg:max-w-none">
                <FilmTile
                  src={tall.src}
                  poster={tall.poster}
                  label={tall.label}
                  className="aspect-[9/16] lg:aspect-auto lg:h-full"
                />
              </Reveal>
            </div>
          ))}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {wide.slice(talls.length * 2).map((f, i, all) => (
              <Reveal key={f.id} delay={(i % 2) * 0.08} className={i === all.length - 1 && all.length % 2 ? 'sm:col-span-2' : undefined}>
                <FilmTile src={f.src} poster={f.poster} label={f.label} className="aspect-video" />
              </Reveal>
            ))}
          </div>
        </section>

        <section aria-labelledby="skills-ways" className="mx-auto mt-20 max-w-6xl sm:mt-32">
          <SectionHead
            id="skills-ways"
            eyebrow="Working with whoosh"
            title="Start from whatever you have"
            sub="A sentence, a film you like, your live product, your brand files. Your agent reads each one differently, and you can mix them."
          />
          <WorkWays />
        </section>

        <section aria-labelledby="skills-process" className="mx-auto mt-20 max-w-6xl sm:mt-32">
          <SectionHead
            id="skills-process"
            eyebrow="The process"
            title="Your agent asks, plans, and shows you a draft first"
            sub="Six steps, in the same order every time. It asks once, waits for your answers, and saves the long render for your yes."
          />
          <Process />
        </section>

        <section aria-labelledby="skills-craft" className="mx-auto mt-20 max-w-6xl sm:mt-32">
          <SectionHead
            id="skills-craft"
            eyebrow="Inside the skill"
            title="Your agent learns the craft"
            sub="57 copy-ready motion recipes in seven families, plus the direction a motion designer works by. Your agent reads the ones a film needs and writes the scenes itself."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {CRAFTS.filter((c) => c.clip).map((c, i) => (
              <Reveal key={c.title} delay={(i % 2) * 0.08} className="h-full">
                <article className="flex h-full flex-col overflow-hidden rounded-card border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900">
                  <FilmTile
                    src={HERO_FILM.mobile}
                    label={c.title}
                    clip={c.clip}
                    framed={false}
                    className="aspect-video"
                  />
                  <div className="p-5 sm:p-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-lg font-bold text-sand-900 dark:text-sand-50">{c.title}</h3>
                      <span className="shrink-0 font-mono text-[11px] tracking-wide text-sand-600 dark:text-sand-400">{c.count}</span>
                    </div>
                    <p className="mt-2 text-[15px] leading-relaxed text-sand-600 dark:text-sand-400">{c.body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CRAFTS.filter((c) => !c.clip).map((c, i) => (
              <Reveal key={c.title} delay={(i % 4) * 0.06} className="h-full">
                <article className="h-full rounded-card border border-sand-200 bg-sand-100 p-5 dark:border-sand-800 dark:bg-sand-900">
                  <span className="font-mono text-[11px] tracking-wide text-sand-600 dark:text-sand-400">{c.count}</span>
                  <h3 className="mt-2 text-base font-bold text-sand-900 dark:text-sand-50">{c.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-sand-600 dark:text-sand-400">{c.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <CtaBand eyebrow="Ready when you are" title="Your next video is one sentence away.">
          <a href={`#${FEATURED.slug}-install`} className={buttonClasses({ variant: 'primary', size: 'lg' })}>
            Install whoosh
            <ArrowRight size={14} />
          </a>
        </CtaBand>

        <section id="next" aria-labelledby="skills-next" className="mx-auto mt-20 max-w-6xl scroll-mt-24 sm:mt-32">
          <SectionHead
            id="skills-next"
            eyebrow="Coming next"
            title={SOLO ? SOLO.hook : 'More on the way'}
            sub={SOLO ? SOLO.body : 'Skills and plugins land here as they are released.'}
          />
          <div
            className={`mt-10 grid gap-4 ${
              OTHERS.length >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : OTHERS.length === 2 ? 'md:grid-cols-2' : 'mx-auto max-w-5xl'
            }`}
          >
            {OTHERS.map((e, i) => (
              <Reveal key={e.slug} delay={(i % 3) * 0.08} className="h-full">
                <EntryCard entry={e} intro={!SOLO} />
              </Reveal>
            ))}
          </div>
        </section>

        <section aria-labelledby="skills-faq" className="mx-auto mt-20 max-w-4xl sm:mt-32">
          <SectionHead id="skills-faq" eyebrow="Questions" title="Skills and plugins, explained" />
          <div className="mt-8">
            <FaqRows items={SKILLS_FAQ} idPrefix="skills-faq-row" />
          </div>
        </section>

      </PageShell>
    </>
  )
}
