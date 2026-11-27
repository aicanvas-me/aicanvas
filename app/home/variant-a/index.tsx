// Variant A of the whoosh and icon sections (Opus). Two mirrored splits: whoosh
// says what it is on the left and proves it with three of its own films on the
// right; the icons put a working tuner on the left and the facts on the right.

import type { ReactElement } from 'react'
import Link from 'next/link'
import { ArrowRight } from '@/app/_icons/icons/arrow-right'
import { Bolt } from '@/app/_icons/icons/bolt'
import { BoltDuotone } from '@/app/_icons/icons/bolt-duotone'
import { BoltSolid } from '@/app/_icons/icons/bolt-solid'
import { BoltSolidDuotone } from '@/app/_icons/icons/bolt-solid-duotone'
import { buttonClasses } from '../../components/buttonClasses'
import { PremiumBadge } from '../../components/billing/PremiumBadge'
import { StageLight } from '../../components/StageLight'
import { FilmTile } from '../../skills/FilmTile'
import { TILE_FILMS } from '../../skills/_lib/media'
import { WHOOSH } from '../../skills/_lib/entries'
import { Reveal } from '../Reveal'
import type { VariantProps } from '../variant-types'
import { IconTuner } from './IconTuner'

const EYEBROW =
  'text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400'
const H2 =
  'text-balance text-3xl font-bold tracking-tight text-sand-900 sm:text-4xl dark:text-sand-50'
const SUB = 'text-base leading-relaxed text-sand-600 dark:text-sand-400'
const STRONG = 'text-sand-900 dark:text-sand-50'
const PANEL =
  'relative overflow-hidden rounded-section bg-sand-100 dark:bg-sand-900'

const film = (id: string) => TILE_FILMS.find((f) => f.id === id)!

// The three films closest to what a visitor here just built: a launch, an app
// demo, and a phone ad in the tall format.
const BENTO = {
  launch: film('product-launch'),
  demo: film('app-demo'),
  tall: film('mobile-app-ad'),
}

// What happens after the prompt, in the skill's own order.
const FLOW = [
  {
    title: 'You describe it',
    body: 'One prompt. It asks seven short questions, each with a default.',
  },
  {
    title: 'You approve a draft',
    body: 'A quick low-res cut with sound comes first, so changes are cheap.',
  },
  {
    title: 'It renders the final',
    body: 'HD or 4K at 60 fps, on your own machine.',
  },
]

function NewChip() {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-new/30 bg-new/10 px-2.5 text-[11px] font-semibold text-new">
      <span className="size-1.5 rounded-full bg-new" />
      New
    </span>
  )
}

// The section needs none of the shared data; the type keeps every variant interchangeable.
export const WhooshSection: (props: VariantProps) => ReactElement = () => (
    <section
      aria-labelledby="va-whoosh"
      className="mx-auto mt-20 max-w-6xl sm:mt-32"
    >
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-5">
          <div className="flex flex-wrap items-center gap-2">
            <NewChip />
            <PremiumBadge />
            <span className={EYEBROW}>
              Agent skill for Claude Code and Codex
            </span>
          </div>
          <h2 id="va-whoosh" className={`mt-4 ${H2} sm:text-5xl`}>
            Your agent makes the video.
          </h2>
          <p className={`mt-4 ${SUB}`}>
            whoosh turns your agent into a motion designer. Ask for a launch
            video, a product promo or an app demo: it writes the film in code
            and renders the mp4 for you. Every film on the right was made this
            way.
          </p>

          <ol className="mt-7 flex flex-col gap-4">
            {FLOW.map((step, i) => (
              <li key={step.title} className="flex gap-3.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-sand-300 font-mono text-[11px] text-sand-700 dark:border-sand-700 dark:text-sand-300">
                  {i + 1}
                </span>
                <span className="text-[15px] leading-snug text-sand-600 dark:text-sand-400">
                  <span className={`font-semibold ${STRONG}`}>
                    {step.title}.
                  </span>{' '}
                  {step.body}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/skills/whoosh"
              className={buttonClasses({ variant: 'primary', size: 'lg' })}
            >
              Get whoosh
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/skills/whoosh#skills-films"
              className={buttonClasses({ variant: 'outline', size: 'lg' })}
            >
              Watch all {TILE_FILMS.length} films
            </Link>
          </div>
          <p className="mt-4 text-sm text-sand-600 dark:text-sand-400">
            {WHOOSH.requirements}
          </p>
        </Reveal>

        <Reveal className="lg:col-span-7" delay={0.08}>
          <div className={`${PANEL} p-2.5 sm:p-3`}>
            <StageLight />
            <div className="relative">
              {/* The prompt behind the films, the skill's own example. */}
              <div className="mb-2.5 flex items-center gap-2.5 rounded-card border border-sand-200 bg-sand-50 px-3.5 py-2.5 sm:mb-3 dark:border-sand-800 dark:bg-sand-950">
                <span className="shrink-0 font-mono text-[11px] font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">
                  Prompt
                </span>
                <span className="font-mono text-[13px] text-sand-900 sm:truncate dark:text-sand-50">
                  {WHOOSH.tryPrompt}
                </span>
              </div>
              <div className="grid grid-cols-[1.58fr_1fr] gap-2.5 sm:gap-3">
                <div className="flex flex-col gap-2.5 sm:gap-3">
                  <FilmTile
                    src={BENTO.launch.src}
                    poster={BENTO.launch.poster}
                    label={BENTO.launch.label}
                    className="aspect-video"
                  />
                  <FilmTile
                    src={BENTO.demo.src}
                    poster={BENTO.demo.poster}
                    label={BENTO.demo.label}
                    className="aspect-video"
                  />
                </div>
                <FilmTile
                  src={BENTO.tall.src}
                  poster={BENTO.tall.poster}
                  label={BENTO.tall.label}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
)

// The four styles, one subject, so the paid difference is one glance.
const STYLES = [
  { name: 'Line', premium: false, Glyph: Bolt },
  { name: 'Duotone', premium: true, Glyph: BoltDuotone },
  { name: 'Solid', premium: true, Glyph: BoltSolid },
  { name: 'Solid duotone', premium: true, Glyph: BoltSolidDuotone },
]

export function IconsSection({ iconCount, lineIcons }: VariantProps) {
  const count = iconCount > 0 ? iconCount : null
  return (
    <section
      aria-labelledby="va-icons"
      className="mx-auto mt-20 max-w-6xl sm:mt-32"
    >
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-7">
          <div className={PANEL}>
            <StageLight />
            <div className="relative">
              {lineIcons.length > 0 ? (
                <IconTuner icons={lineIcons} />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center text-sm text-sand-600 dark:text-sand-400">
                  Icons load from the icon set.
                </div>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal className="lg:col-span-5" delay={0.08}>
          <p className={EYEBROW}>The icon set</p>
          <h2 id="va-icons" className={`mt-3 ${H2} sm:text-5xl`}>
            Icons you tune, not just pick.
          </h2>
          <p className={`mt-4 ${SUB}`}>
            {count ? `${count} icons` : 'Every icon'} on one 24 px grid. Size,
            weight and colour are props, so every icon matches your interface
            instead of the other way round. Try the controls.
          </p>

          <ul className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {STYLES.map(({ name, premium, Glyph }) => (
              <li
                key={name}
                className="flex flex-col items-start gap-3 rounded-card border border-sand-200 p-3 dark:border-sand-800"
              >
                <Glyph size={22} className={STRONG} />
                <span className="text-[12px] font-semibold leading-tight text-sand-900 dark:text-sand-50">
                  {name}
                </span>
                <span
                  className={`text-[11px] font-semibold ${premium ? 'text-premium' : 'text-free'}`}
                >
                  {premium ? 'Premium' : 'Free'}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-sm text-sand-600 dark:text-sand-400">
            Line installs free with no account. Install one icon or the set, or
            ask your agent through the AI Canvas MCP.
          </p>

          <div className="mt-7">
            <Link
              href="/icons"
              prefetch={false}
              className={buttonClasses({ variant: 'outline', size: 'lg' })}
            >
              Explore {count ? `all ${count} icons` : 'the icons'}
              <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
