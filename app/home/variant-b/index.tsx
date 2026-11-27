import Link from 'next/link'
import type { VariantProps } from '../variant-types'
import { Reveal } from '../Reveal'
import { StageLight } from '@/app/components/StageLight'
import { PremiumBadge } from '@/app/components/billing/PremiumBadge'
import { buttonClasses } from '@/app/components/buttonClasses'
import { ArrowRight } from '@/app/_icons/icons/arrow-right'
import { WHOOSH } from '@/app/skills/_lib/entries'
import { FilmWall } from './FilmWall'
import { IconWorkbench } from './IconWorkbench'
import styles from './variant.module.css'

const EYEBROW = 'text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400'
const H2 = 'text-balance text-3xl font-bold tracking-tight text-sand-900 sm:text-4xl dark:text-sand-50'
const SUB = 'text-base leading-relaxed text-sand-600 dark:text-sand-400'
const CTA = `${buttonClasses({ variant: 'outline', size: 'lg' })} ${styles.cta}`

function NewMark() {
  return <span className="inline-flex items-center gap-1.5 text-xs font-semibold normal-case tracking-normal text-sand-900 dark:text-sand-50"><span aria-hidden className="size-1.5 rounded-full bg-new" />New</span>
}

export function WhooshSection(props: VariantProps) {
  // This section shares the homepage contract but needs no icon data.
  void props
  return (
    <section id="vb-whoosh-section" aria-labelledby="vb-whoosh" className="mx-auto mt-20 max-w-6xl sm:mt-32">
      <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.25fr] lg:gap-12">
        <Reveal>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-bold tracking-[-0.06em] text-sand-900 dark:text-sand-50">whoosh<span className="text-new">.</span></span>
            <span aria-hidden className="h-4 w-px bg-sand-200 dark:bg-sand-800" />
            <NewMark />
            <PremiumBadge />
          </div>
          <p className={EYEBROW}>Our first agent skill. Your next launch.</p>
          <h2 id="vb-whoosh" className={`mt-3 ${H2}`}>You built it.<br />Now make it move.</h2>
          <p className={`mt-5 ${SUB}`}>Turn your product into a launch video, app demo or reel. whoosh teaches Claude Code and Codex to make motion graphics from your brief.</p>
          <ol className="mt-6 space-y-3 text-sm text-sand-700 dark:text-sand-300">
            {['Describe the video you want.', 'Review a draft with sound.', 'Approve it. Get your final mp4.'].map((step, index) => (
              <li key={step} className="flex items-center gap-3"><span className="font-mono text-xs text-sand-600 dark:text-sand-400">0{index + 1}</span>{step}</li>
            ))}
          </ol>
          <div className="mt-7"><Link href="/skills/whoosh" className={CTA}>Make your first video<ArrowRight size={16} /></Link></div>
          <p className="mt-3 text-xs leading-relaxed text-sand-600 dark:text-sand-400">Included with Premium. Renders on your machine.<br />{WHOOSH.requirements}</p>
        </Reveal>
        <Reveal delay={0.08} className="min-w-0">
          <div className={`relative overflow-hidden rounded-[24px] bg-sand-100 p-2.5 sm:p-3 dark:bg-sand-900 ${styles.filmStage}`}>
            <StageLight />
            <div className="relative">
              <div className="flex items-center justify-between gap-3 px-2 pb-3 pt-1 text-[10px] font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">
                <span>Made with whoosh</span><span>One skill. Many formats.</span>
              </div>
              <FilmWall />
              <div className="flex flex-wrap justify-between gap-2 px-2 pb-1 pt-3 text-[11px] text-sand-600 dark:text-sand-400"><span>57 motion recipes</span><span>3D + physics</span><span>Up to 4K · 60 fps</span></div>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-3 px-2 text-xs leading-relaxed text-sand-600 dark:text-sand-400"><span aria-hidden className="pt-0.5 font-mono">↳</span><p>From a brief to a film. These are real whoosh examples, playing silently.</p></div>
        </Reveal>
      </div>
    </section>
  )
}

export function IconsSection(props: VariantProps) {
  const count = props.iconCount > 0 ? props.iconCount : 820
  return (
    <section id="vb-icons-section" aria-labelledby="vb-icons" className="mx-auto mt-20 max-w-6xl sm:mt-32">
      <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.85fr] lg:gap-12">
        <Reveal className="min-w-0" delay={0.04}>
          <IconWorkbench icons={props.lineIcons} />
        </Reveal>
        <Reveal>
          <div className={`flex items-center gap-3 ${EYEBROW}`}><span>The AI Canvas icon set</span><NewMark /></div>
          <h2 id="vb-icons" className={`mt-3 ${H2}`}>Small details.<br />Entirely your style.</h2>
          <p className={`mt-5 ${SUB}`}>{count.toLocaleString('en-US')} icons. 25 categories. One precise 24 px grid. Tune the size, weight and colour until every icon feels at home in your interface.</p>
          <div className="mt-6 space-y-4 text-sm">
            <p className="flex items-start gap-3 text-sand-700 dark:text-sand-300"><span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-free" /><span><strong className="font-semibold text-sand-900 dark:text-sand-50">Start with Line. It’s free.</strong><br />No account needed.</span></p>
            <div className="flex items-start gap-3 text-sand-700 dark:text-sand-300"><span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-premium" /><div><p className="flex flex-wrap items-center gap-2 font-semibold text-sand-900 dark:text-sand-50">Go further with four styles.<PremiumBadge /></p><p>Line, Duotone, Solid and Solid duotone.</p></div></div>
          </div>
          <div className="mt-7"><Link href="/icons" className={CTA}>Find your icons<ArrowRight size={16} /></Link></div>
          <p className="mt-3 text-xs leading-relaxed text-sand-600 dark:text-sand-400">Install one icon or the set. Or ask your agent<br className="hidden xl:block" /> through the AI Canvas MCP.</p>
        </Reveal>
      </div>
    </section>
  )
}
