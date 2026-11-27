// The current design of the whoosh and icon sections, as first built: a
// centred bridge line over the reel and its copy, then the Line spread over the
// four styles. Kept whole so it can be compared with the variants.

import type { ReactElement } from 'react'
import Link from 'next/link'
import { ArrowRight } from '@/app/_icons/icons/arrow-right'
import { buttonClasses } from '../../components/buttonClasses'
import { PremiumBadge } from '../../components/billing/PremiumBadge'
import { HomeReel } from '../HomeReel'
import { IconSpecimen } from '../IconSpecimen'
import { Reveal } from '../Reveal'
import type { VariantProps } from '../variant-types'

const EYEBROW =
  'text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400'
const H2 =
  'text-balance text-3xl font-bold tracking-tight text-sand-900 sm:text-4xl dark:text-sand-50'
const SUB = 'text-base leading-relaxed text-sand-600 dark:text-sand-400'

// The section needs none of the shared data; the type keeps every variant interchangeable.
export const WhooshSection: (props: VariantProps) => ReactElement = () => (
    <section
      aria-labelledby="v3-whoosh"
      className="mx-auto mt-20 max-w-6xl sm:mt-32"
    >
      <Reveal className="mx-auto mb-10 max-w-2xl text-center">
        <p className="text-balance text-2xl font-bold tracking-tight text-sand-900 sm:text-3xl dark:text-sand-50">
          Built it? Give it a launch.
        </p>
      </Reveal>
      <div className="grid items-center gap-8 lg:grid-cols-5 lg:gap-12">
        <Reveal className="lg:col-span-3">
          <HomeReel />
        </Reveal>
        <Reveal className="lg:col-span-2">
          <p className={`flex flex-wrap items-center gap-2 ${EYEBROW}`}>
            whoosh
            <span aria-hidden>·</span>
            Agent skill
            <PremiumBadge />
          </p>
          <h2 id="v3-whoosh" className={`mt-2 ${H2}`}>
            Describe it. Your agent makes the video.
          </h2>
          <p className={`mt-4 ${SUB}`}>
            Turn the interface you built into a launch video, a product demo or
            a reel. whoosh gives Claude Code and Codex a way to make one: your
            prompt becomes a draft with sound you approve, then a finished mp4
            at up to 4K.
          </p>
          <p className={`mt-3 text-sm ${SUB}`}>
            Renders on your own machine. Needs Node and ffmpeg.
          </p>
          <div className="mt-6">
            <Link
              href="/skills/whoosh"
              className={buttonClasses({ variant: 'outline', size: 'lg' })}
            >
              Watch examples and install
              <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
)

export function IconsSection({ iconCount, lineIcons }: VariantProps) {
  return (
    <section aria-labelledby="v3-icons" className="mt-20 sm:mt-32">
      <Reveal className="mx-auto mb-10 max-w-2xl text-center">
        <p className={EYEBROW}>The icon set</p>
        <h2 id="v3-icons" className={`mt-2 ${H2}`}>
          One icon family. Four ways to finish your interface.
        </h2>
        <p className={`mx-auto mt-3 max-w-xl ${SUB}`}>
          {iconCount > 0 ? `${iconCount} icons` : 'Every icon'}, one file each,
          so you install one or the whole set. Start with Line, free with no
          account. Duotone, Solid and Solid duotone come with Premium.
        </p>
      </Reveal>
      <IconSpecimen icons={lineIcons} />
      <div className="mt-8 flex justify-center">
        <Link
          href="/icons"
          prefetch={false}
          className={buttonClasses({ variant: 'outline', size: 'lg' })}
        >
          Explore the icons
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  )
}
