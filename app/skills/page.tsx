import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight } from '@/app/_icons/icons/arrow-right'
import { Puzzle } from '@/app/_icons/icons/puzzle'
import { Wind } from '@/app/_icons/icons/wind'
import { Shapes } from '@/app/_icons/icons/shapes'
import { Eye } from '@/app/_icons/icons/eye'
import { VolumeHigh } from '@/app/_icons/icons/volume-high'
import { buttonClasses } from '../components/buttonClasses'
import { FaqRows } from '../components/FaqRows'
import { CtaBand, EYEBROW, PageHero, PageShell, PILL, SectionHead } from '../components/PageKit'
import { StageLight } from '../components/StageLight'
import { Reveal } from '../home/Reveal'
import { SITE_URL } from '../lib/config'
import { pageMetadata } from '../lib/page-metadata'
import { faqJsonLd } from '../lib/faq'
import { ENTRIES, SKILLS_FAQ, type SkillPoint } from './_lib/entries'
import { TILE_FILMS } from './_lib/media'
import { FilmStage } from './FilmStage'
import { FilmTile } from './FilmTile'
import { InstallPanel } from './InstallPanel'
import { EntryCard, WORKS_CHIP } from './EntryCard'

export const metadata: Metadata = pageMetadata({
  title: 'AI Agent Skills and Plugins: whoosh, Videos Written in Code',
  social: 'AI Canvas skills and plugins for AI agents',
  description:
    'Skills and plugins for Claude Code, Codex, Cursor and other AI agents. Start with whoosh: your agent writes a film in code and renders an mp4.',
  url: `${SITE_URL}/skills`,
})

const FEATURED = ENTRIES.find((e) => e.featured)!
const OTHERS = ENTRIES.filter((e) => !e.featured)

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: FEATURED.name,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Cross-platform',
  description: FEATURED.body,
  url: `${SITE_URL}/skills#${FEATURED.slug}`,
  publisher: { '@type': 'Organization', name: 'AI Canvas', url: SITE_URL },
}

const POINT_ICON: Record<NonNullable<SkillPoint['icon']>, ReactNode> = {
  wind: <Wind size={18} />,
  shapes: <Shapes size={18} />,
  eye: <Eye size={18} />,
  sound: <VolumeHigh size={18} />,
}

const SPECS = [
  { n: '4K', label: 'max resolution' },
  { n: '60', label: 'frames per second' },
  { n: '3', label: 'formats: 16:9, 9:16, 1:1' },
  { n: '96', label: 'sound effects, all CC0' },
]

export default function SkillsPage() {
  const [physics, relay, lull] = TILE_FILMS
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
          sub="Each one gives your AI agent an ability it did not have yesterday. Install it with one command, then ask for what you want. First up is whoosh, which turns a sentence into a finished video."
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
                  <span className={PILL}>{FEATURED.kind}</span>
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
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {FEATURED.points.map((p) => (
                    <div key={p.title}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-inset border border-sand-300 bg-sand-50 text-sand-700 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-200">
                        {p.icon && POINT_ICON[p.icon]}
                      </div>
                      <h3 className="mt-3 text-base font-bold text-sand-900 dark:text-sand-50">{p.title}</h3>
                      <p className="mt-1 text-[15px] leading-relaxed text-sand-600 dark:text-sand-400">{p.body}</p>
                    </div>
                  ))}
                </div>
                <p className={`mt-8 ${EYEBROW}`}>Works with</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {FEATURED.worksWith.map((w) => (
                    <span key={w} className={WORKS_CHIP}>
                      {w}
                    </span>
                  ))}
                  {FEATURED.worksWithNote && (
                    <span className="text-xs font-semibold text-sand-600 dark:text-sand-400">{FEATURED.worksWithNote}</span>
                  )}
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
            title="Four films ship inside the skill"
            sub="Each one is a single film.js your agent can read and learn from. The reel above is the first. Relay and Lull are made-up products."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-[1.58fr_1fr]">
            <div className="grid gap-4">
              <Reveal>
                <FilmTile {...physics} className="aspect-video" />
              </Reveal>
              <Reveal delay={0.08}>
                <FilmTile {...relay} className="aspect-video" />
              </Reveal>
            </div>
            <Reveal delay={0.16} className="mx-auto w-full max-w-xs lg:max-w-none">
              <FilmTile {...lull} className="aspect-[9/16] lg:aspect-auto lg:h-full" />
            </Reveal>
          </div>
        </section>

        <section id="next" aria-labelledby="skills-next" className="mx-auto mt-20 max-w-6xl scroll-mt-24 sm:mt-32">
          <SectionHead
            id="skills-next"
            eyebrow="Coming next"
            title="More on the way"
            sub="Skills and plugins land here as they are released."
          />
          <div
            className={`mt-10 grid gap-4 ${
              OTHERS.length >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : OTHERS.length === 2 ? 'md:grid-cols-2' : 'mx-auto max-w-4xl'
            }`}
          >
            {OTHERS.map((e, i) => (
              <Reveal key={e.slug} delay={(i % 3) * 0.08} className="h-full">
                <EntryCard entry={e} />
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

        <CtaBand eyebrow="Keep building" title="Your agent can build the interface too.">
          <Link href="/components" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
            Browse components
            <ArrowRight size={14} />
          </Link>
          <Link href="/mcp" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
            Connect the MCP
          </Link>
        </CtaBand>
      </PageShell>
    </>
  )
}
