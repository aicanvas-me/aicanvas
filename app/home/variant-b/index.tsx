import Link from 'next/link'
import type { VariantProps } from '../variant-types'
import { Reveal } from '../Reveal'
import { StageLight } from '@/app/components/StageLight'
import { PremiumBadge } from '@/app/components/billing/PremiumBadge'
import { buttonClasses } from '@/app/components/buttonClasses'
import { ArrowRight } from '@/app/_icons/icons/arrow-right'
import { CircleCheck } from '@/app/_icons/icons/circle-check'
import { WHOOSH } from '@/app/skills/_lib/entries'
import { FilmWall } from './FilmWall'
import { IconWorkbench } from './IconWorkbench'
import styles from './variant.module.css'

const EYEBROW = 'text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400'
const H2 = 'text-balance text-3xl font-bold tracking-tight text-sand-900 sm:text-4xl dark:text-sand-50'
const SUB = 'text-base leading-relaxed text-sand-600 dark:text-sand-400'
const CTA = `${buttonClasses({ variant: 'primary', size: 'lg' })} motion-reduce:transition-none motion-reduce:active:scale-100`

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
          <h2 id="vb-whoosh" className={`mt-3 ${H2}`}>Your agent makes your video now.</h2>
          <p className={`mt-5 ${SUB}`}>Describe the launch video, app demo or reel you want. whoosh teaches Claude Code and Codex to build it as motion graphics and hand you a finished mp4.</p>
          <ul className="mt-6 space-y-3 text-sm leading-relaxed text-sand-700 dark:text-sand-300">
            {['Real motion blur, physics and 3D.', 'Up to 4K at 60 fps, with sound effects.', 'Your agent shows you a draft first, then renders the final.'].map(point => (
              <li key={point} className="flex items-start gap-3"><CircleCheck size={18} className="mt-0.5 shrink-0 text-accent" />{point}</li>
            ))}
          </ul>
          <div className="mt-7"><Link href="/skills/whoosh" className={CTA}>Make your first video<ArrowRight size={16} /></Link></div>        </Reveal>
        <Reveal delay={0.08} className="min-w-0">
          <div className={`relative overflow-hidden rounded-section bg-sand-100 p-2.5 sm:p-3 dark:bg-sand-900 ${styles.filmStage}`}>
            <StageLight />
            <div className="relative">
              <div className="px-3 pb-4 pt-3 sm:px-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">Start with a sentence</p>
                <blockquote className="mt-2 text-sm leading-relaxed text-sand-900 sm:text-base dark:text-sand-50">“{WHOOSH.tryPrompt}”</blockquote>              </div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-t border-sand-200 px-2 pt-3 text-[11px] font-semibold text-sand-600 dark:border-sand-800 dark:text-sand-400">
                <span><span aria-hidden className="mr-2">↓</span>Your brief becomes a film</span><span>Made with whoosh</span>
              </div>
              <FilmWall />
              <div className="flex flex-wrap justify-between gap-2 px-2 pb-1 pt-3 text-[11px] text-sand-600 dark:text-sand-400"><span>57 motion recipes</span><span>3D + physics</span><span>Up to 4K · 60 fps</span></div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function IconsSection(props: VariantProps) {
  return (
    <section id="vb-icons-section" aria-labelledby="vb-icons" className="mx-auto mt-20 max-w-6xl sm:mt-32">
      <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.85fr] lg:gap-12">
        <Reveal className="min-w-0" delay={0.04}>
          <IconWorkbench icons={props.lineIcons} />
        </Reveal>
        <Reveal>
          <div className={`flex items-center gap-3 ${EYEBROW}`}><span>The AI Canvas icon set</span><NewMark /></div>
          <h2 id="vb-icons" className={`mt-3 ${H2}`}>Small details.<br />Entirely your style.</h2>
          <p className={`mt-5 ${SUB}`}>{props.iconCount > 0 ? `${props.iconCount.toLocaleString('en-US')} icons. ` : 'A complete icon family. '}25 categories. One precise 24 px grid. Tune the size, weight and colour until every icon feels at home in your interface.</p>
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
