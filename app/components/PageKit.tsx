// The page kit for every page without the sidebar (app/lib/railless.ts): the
// homepage v3 look, taken apart so pricing, MCP, the info pages, the legal
// pages and the account all read as one site. Same column, same hero, same
// section heading, same closing band, same footer and wordmark as /v3.
//
// Server-safe: no hooks here, so a server page renders it as static HTML and a
// client page simply bundles it. Reveal is the one client piece it pulls in.

import type { ReactNode } from 'react'
import { SiteFooter } from './SiteFooter'
import { Wordmark } from './Wordmark'
import { Reveal } from '../home/Reveal'

// The homepage v3 type ladder, shared so a section heading reads the same on
// every page.
export const EYEBROW = 'text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400'
export const H2 = 'text-balance text-3xl font-bold tracking-tight text-sand-900 sm:text-4xl dark:text-sand-50'
export const SUB = 'text-base leading-relaxed text-sand-600 dark:text-sand-400'
// The small rounded label above a hero or a section title.
export const PILL =
  'inline-flex items-center gap-1.5 rounded-full border border-sand-300 bg-sand-100 px-3 py-1 text-xs font-semibold text-sand-700 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-300'
// A bordered surface, the v3 card.
export const CARD = 'rounded-3xl border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900'

// The page itself: the 7xl column the homepage uses, the footer, and the AI
// CANVAS wordmark signing it off. It does not own the scroll (no
// data-owns-scroll): the root column scrolls, so Back restores the position
// (ScrollMemory) and in-page anchors land under the bar (md:scroll-pt-14).
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-sand-50 dark:bg-sand-950">
      <main className="relative mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 pt-10 pb-8 sm:px-6 sm:pt-16">
        {children}
        <SiteFooter />
      </main>
      <Wordmark />
    </div>
  )
}

// The hero: the homepage's centred stack. The pill rises in, the heading only
// slides (it is the LCP element, so it paints opaque from the first frame),
// then the line under it and the actions. CSS animations, so it renders from
// the server HTML with no script to wait for. `accent` is the olive second
// line, a step smaller than the heading, as on the homepage. `size="md"` is
// the quieter heading for reference pages (policies, credits).
export function PageHero({
  pill,
  pillIcon,
  title,
  accent,
  sub,
  size = 'lg',
  children,
}: {
  pill?: ReactNode
  pillIcon?: ReactNode
  title: ReactNode
  accent?: ReactNode
  sub?: ReactNode
  size?: 'lg' | 'md'
  children?: ReactNode
}) {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center text-center">
      {pill && (
        <span className={`aic-hero-rise mb-5 ${PILL}`} style={{ animationDelay: '0.1s' }}>
          {pillIcon}
          {pill}
        </span>
      )}
      <h1
        className={`aic-hero-slide text-balance font-extrabold tracking-tight text-sand-900 dark:text-sand-50 ${
          size === 'lg' ? 'text-3xl sm:text-5xl' : 'text-3xl sm:text-[2.75rem] sm:leading-[1.1]'
        }`}
        style={{ animationDelay: '0.18s' }}
      >
        {title}
        {accent && (
          <>
            <br />
            <span
              className={`mt-3 inline-block text-olive-600 dark:text-olive-500 ${
                size === 'lg' ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-3xl'
              }`}
            >
              {accent}
            </span>
          </>
        )}
      </h1>
      {sub && (
        <div
          className="aic-hero-rise mt-5 max-w-2xl text-base leading-relaxed text-sand-600 sm:text-lg dark:text-sand-400"
          style={{ animationDelay: '0.26s' }}
        >
          {sub}
        </div>
      )}
      {children && (
        <div
          className="aic-hero-rise mt-8 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: '0.34s' }}
        >
          {children}
        </div>
      )}
    </section>
  )
}

// A section's heading: eyebrow, title, one line under it. Centred by default,
// the way every homepage section opens; `align="left"` for a heading that sits
// over a left-aligned column.
export function SectionHead({
  eyebrow,
  title,
  sub,
  id,
  align = 'center',
  className = '',
}: {
  eyebrow?: ReactNode
  title: ReactNode
  sub?: ReactNode
  id?: string
  align?: 'center' | 'left'
  className?: string
}) {
  const center = align === 'center'
  return (
    <Reveal className={`${center ? 'mx-auto text-center' : ''} max-w-2xl ${className}`}>
      {eyebrow && <p className={EYEBROW}>{eyebrow}</p>}
      <h2 id={id} className={`${eyebrow ? 'mt-2' : ''} ${H2}`}>
        {title}
      </h2>
      {sub && <p className={`${center ? 'mx-auto' : ''} mt-3 max-w-xl ${SUB}`}>{sub}</p>}
    </Reveal>
  )
}

// The closing band: the homepage's final call to action, an olive wash with
// one soft light behind the words. Actions go in as children.
export function CtaBand({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  sub?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="mx-auto mt-20 max-w-4xl sm:mt-32">
      <Reveal
        y={12}
        className="relative overflow-hidden rounded-3xl border border-olive-500/20 bg-gradient-to-br from-olive-500/8 via-transparent to-transparent px-6 py-12 text-center ring-1 ring-inset ring-olive-500/10 sm:py-16"
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-40 w-64 rounded-full bg-olive-500/10 blur-3xl" />
        </div>
        {eyebrow && <p className={`relative ${EYEBROW}`}>{eyebrow}</p>}
        <h2 className={`relative ${eyebrow ? 'mt-2' : ''} ${H2}`}>{title}</h2>
        {sub && <p className={`relative mx-auto mt-3 max-w-xl ${SUB}`}>{sub}</p>}
        {children && <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">{children}</div>}
      </Reveal>
    </section>
  )
}
