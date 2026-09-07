'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CaretRight, ArrowRight } from '@phosphor-icons/react'
import { buttonClasses } from '../components/Button'
import { SiteFooter } from '../components/SiteFooter'
import { HeaderSocials } from '../components/HeaderSocials'

export type FaqItem = {
  q: string
  a: string
  // Optional in-answer link. `a` stays plain text (it powers the FAQPage
  // JSON-LD), and the first occurrence of `link.label` inside `a` is rendered
  // as an anchor. Add a link without ever breaking the structured data.
  link?: { label: string; href: string }
  // Same idea for the question. Rendered by FaqAccordion only (external
  // anchor, new tab); FaqView ignores it.
  qLink?: { label: string; href: string }
}
export type FaqCategory = {
  category: string
  slug: string
  blurb: string
  items: FaqItem[]
}

// Renders an answer, turning the first occurrence of link.label into a link.
function AnswerText({ item }: { item: FaqItem }) {
  const { a, link } = item
  if (!link || !a.includes(link.label)) return <>{a}</>
  const idx = a.indexOf(link.label)
  return (
    <>
      {a.slice(0, idx)}
      <Link
        href={link.href}
        className="font-medium text-olive-600 underline decoration-olive-400/40 underline-offset-2 transition-colors hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-300"
      >
        {link.label}
      </Link>
      {a.slice(idx + link.label.length)}
    </>
  )
}

export function FaqView({ categories }: { categories: FaqCategory[] }) {
  // Multiple panels may stay open at once: this is a reference page, so a
  // reader comparing two answers should not have the first snap shut. The
  // first question opens by default to telegraph the interaction. The initial
  // value is identical on server and client, so there is no hydration mismatch.
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(categories[0] ? [`${categories[0].slug}-0`] : []),
  )

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <div className="min-h-full bg-sand-50 dark:bg-sand-950">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-50 hidden h-14 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-sand-200 bg-sand-50 px-6 dark:border-sand-800 dark:bg-sand-950 md:grid">
        <div />
        <Link
          href="/components"
          className="text-sm font-semibold text-olive-600 transition-colors hover:text-olive-800 dark:text-olive-500 dark:hover:text-olive-400"
        >
          /FAQ
        </Link>
        <div className="flex items-center justify-end">
          <HeaderSocials />
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl px-4 pt-6 pb-8 sm:px-6 sm:pt-12">
        {/* Mobile breadcrumb */}
        <p className="mb-6 text-sm font-semibold md:hidden">
          <span className="text-olive-600 dark:text-olive-500">/FAQ</span>
        </p>

        {/* ── Hero ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sand-600">
            FAQ
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-4xl">
            Questions, answered.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-sand-600 dark:text-sand-400">
            Everything worth knowing before you ship your first component. Start
            free, install with one command, and upgrade only when AI Canvas is
            already paying off.
          </p>
        </div>

        {/* ── Category jump nav ── */}
        <nav aria-label="FAQ categories" className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <a
              key={c.slug}
              href={`#${c.slug}`}
              className="rounded-full border border-sand-200 bg-sand-100/50 px-3 py-1.5 text-sm font-medium text-sand-700 transition-colors hover:border-sand-300 hover:text-sand-900 dark:border-sand-800 dark:bg-sand-900/50 dark:text-sand-300 dark:hover:border-sand-700 dark:hover:text-sand-50"
            >
              {c.category}
            </a>
          ))}
        </nav>

        {/* ── Sections ── */}
        <div className="mt-4">
          {categories.map((c) => (
            <section key={c.slug} id={c.slug} className="mt-12 scroll-mt-20">
              <h2 className="text-xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
                {c.category}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-sand-600 dark:text-sand-400">
                {c.blurb}
              </p>
              <div className="mt-5 space-y-2.5">
                {c.items.map((it, i) => {
                  const key = `${c.slug}-${i}`
                  const isOpen = open.has(key)
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-30px' }}
                      transition={{ duration: 0.3 }}
                      className={`rounded-xl border transition-colors ${
                        isOpen
                          ? 'border-sand-300 bg-sand-100 dark:border-sand-700 dark:bg-sand-900'
                          : 'border-sand-200 bg-sand-100/50 hover:border-sand-300 dark:border-sand-800 dark:bg-sand-900/50 dark:hover:border-sand-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                      >
                        <span
                          className={`w-7 shrink-0 text-sm font-bold tabular-nums ${
                            isOpen ? 'text-olive-600 dark:text-olive-500' : 'text-sand-600'
                          }`}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 className="flex-1 text-base font-semibold text-sand-900 dark:text-sand-50">
                          {it.q}
                        </h3>
                        <CaretRight
                          weight="regular"
                          size={16}
                          className={`shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-90 text-olive-600 dark:text-olive-500' : 'text-sand-600'
                          }`}
                        />
                      </button>
                      {/* Answer stays in the DOM (SEO); grid-rows trick animates the collapse */}
                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="px-4 pb-4 pl-14 pr-8 text-base leading-relaxed text-sand-600 dark:text-sand-400">
                            <AnswerText item={it} />
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {/* ── Final CTA ── */}
        <section className="mt-16">
          <div className="relative overflow-hidden rounded-2xl border border-olive-500/20 bg-gradient-to-br from-olive-500/8 via-transparent to-transparent p-8 text-center ring-1 ring-inset ring-olive-500/10">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-64 rounded-full bg-olive-500/10 blur-3xl" />
            </div>
            <p className="relative text-xs font-semibold uppercase tracking-wider text-sand-600">
              Still curious?
            </p>
            <h2 className="relative mt-2 text-xl font-bold text-sand-900 dark:text-sand-50">
              Start free, build now.
            </h2>
            <p className="relative mx-auto mt-2 max-w-xl text-base text-sand-600 dark:text-sand-500">
              Browse the registry, install with one command, and remix the free
              library with AI at no cost. Go Premium for the premium components
              and blocks, their full prompts, and complete design systems.
            </p>
            <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/components"
                className={buttonClasses({ variant: 'primary', size: 'lg' })}
              >
                Browse Components
                <ArrowRight weight="regular" size={14} />
              </Link>
              <Link
                href="/pricing"
                className={buttonClasses({ variant: 'outline', size: 'lg' })}
              >
                See Pricing
              </Link>
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}
