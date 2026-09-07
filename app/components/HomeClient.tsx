'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { MagnifyingGlass, Sparkle, Ghost, Question } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { ComponentCard } from './ComponentCard'
import { HeaderSocials } from './HeaderSocials'
import { track } from '../lib/analytics'
import { Breadcrumbs } from './Breadcrumbs'
import { SiteFooter } from './SiteFooter'
import { INITIAL_LOAD, LOAD_MORE_SIZE } from './LoadMore'
import { LoadMore } from './LoadMore'
import type { ComponentMeta } from '../lib/component-registry'
import { searchTokens, matchesQuery, effectiveTokens } from '../lib/search-match'
import { ANDROMEDA_COMPONENT_META, ANDROMEDA_TEMPLATE_META } from '../_lib/andromeda/andromeda-meta'

// ─── Fuzzy "Did you mean?" helpers ───────────────────────────────────────────

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  if (Math.abs(a.length - b.length) > 4) return 99
  const m = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) m[i][0] = i
  for (let j = 0; j <= b.length; j++) m[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      m[i][j] = a[i - 1] === b[j - 1]
        ? m[i - 1][j - 1]
        : 1 + Math.min(m[i - 1][j], m[i][j - 1], m[i - 1][j - 1])
    }
  }
  return m[a.length][b.length]
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'your', 'you', 'are',
  'but', 'not', 'out', 'now', 'its', 'one', 'two', 'all', 'any', 'can', 'has', 'have',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s\-—,.;:/()[\]{}"'`]+/)
    .map((w) => w.replace(/[^\w]/g, ''))
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w))
}

function buildVocabulary(components: ComponentMeta[]): string[] {
  const words = new Set<string>()
  for (const c of components) {
    for (const w of tokenize(c.name)) words.add(w)
    for (const t of c.tags) for (const w of tokenize(t.label)) words.add(w)
    for (const w of tokenize(c.description)) words.add(w)
  }
  return Array.from(words)
}

function findSuggestions(query: string, vocab: string[], max = 3): string[] {
  const q = query.toLowerCase().trim()
  if (q.length < 3) return []
  const threshold = q.length <= 4 ? 1 : q.length <= 7 ? 2 : 3
  const scored: Array<{ w: string; d: number }> = []
  for (const w of vocab) {
    const d = levenshtein(q, w)
    if (d > 0 && d <= threshold) scored.push({ w, d })
  }
  scored.sort((a, b) => a.d - b.d || a.w.length - b.w.length)
  const out: string[] = []
  for (const { w } of scored) {
    if (!out.includes(w)) out.push(w)
    if (out.length >= max) break
  }
  return out
}

// Category keywords folded into each group's searchable text, so the type words
// themselves match: "template(s)"/"dashboard(s)" surface every template,
// "andromeda"/"component(s)"/"design system(s)" surface the components. Not
// shown anywhere — matching only.
const COMPONENT_KW = 'andromeda components design systems'
const TEMPLATE_KW = 'andromeda templates dashboards design systems'
const ANDROMEDA_TEXT = ANDROMEDA_COMPONENT_META.map(
  (c) => `${c.name} ${c.description} ${COMPONENT_KW}`,
)
const TEMPLATE_TEXT = ANDROMEDA_TEMPLATE_META.map(
  (t) => `${t.name} ${t.description} ${TEMPLATE_KW}`,
)

// ─── HomeClient ───────────────────────────────────────────────────────────────

export function HomeClient({
  components,
  categoryLabel,
  heading,
}: {
  components: ComponentMeta[]
  /** Category name shown in the breadcrumb. Passed by /components/category/[slug];
   *  the legacy /components?category=X URL falls back to the query param. */
  categoryLabel?: string
  /** Optional H1 + intro rendered above the grid. Passed by the category and
   *  collection pages so each listing page carries crawlable on-page copy;
   *  the plain /components index omits it. */
  heading?: { h1: string; intro: string }
}) {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const query         = searchParams.get('q') ?? ''
  const category      = categoryLabel ?? searchParams.get('category') ?? ''

  const q = query.trim().toLowerCase()

  // One searchable string per component: name, description and tag labels, so a
  // query word can match any of them. See app/lib/search-match.ts for why the
  // query is matched word by word rather than as one phrase.
  const gridText = useMemo(
    () =>
      components.map(
        (c) => `${c.name} ${c.description} ${c.tags.map((t) => t.label).join(' ')}`,
      ),
    [components],
  )
  // Everything this page can match, so a query that finds nothing relaxes
  // against the same set the grid and the extra group are filtered from.
  const corpus = useMemo(
    () => (category ? gridText : [...gridText, ...ANDROMEDA_TEXT, ...TEMPLATE_TEXT]),
    [gridText, category],
  )
  const tokens = useMemo(() => effectiveTokens(searchTokens(q), corpus), [q, corpus])

  const filtered = q
    ? components.filter((_, i) => matchesQuery(gridText[i], tokens))
    : components

  // ── Beyond the standalone catalog ──────────────────────────────────────────
  // The grid dataset (COMPONENT_META) deliberately excludes Andromeda components
  // and templates so the catalog/categories stay clean. Search still reaches
  // them: on the plain /components search (not a scoped category/collection), an
  // active query also scans those two meta sources and they render as their own
  // group below the grid, reusing ComponentCard so the aesthetic matches. They
  // link out to their own pages. Andromeda components are Free; templates Premium.
  const extras =
    q && !category
      ? [
          ...ANDROMEDA_COMPONENT_META.filter((_, i) =>
            matchesQuery(ANDROMEDA_TEXT[i], tokens),
          ).map((c) => ({
            key: `andromeda-${c.slug}`,
            name: c.name,
            description: c.description,
            image: c.image,
            href: `/design-systems/andromeda/${c.slug}`,
            badge: 'Free',
            cta: 'View Component',
          })),
          ...ANDROMEDA_TEMPLATE_META.filter((_, i) =>
            matchesQuery(TEMPLATE_TEXT[i], tokens),
          ).map((t) => ({
            key: `template-${t.folder}`,
            name: t.name,
            description: t.description,
            image: t.image,
            href: `/design-systems/andromeda/templates/${t.folder}`,
            badge: 'Premium template',
            cta: 'View template',
          })),
        ]
      : []

  // Empty state only when BOTH the grid and the extra group have nothing, so an
  // Andromeda-only match isn't shown as "no results".
  const showEmpty = filtered.length === 0 && extras.length === 0
  // Total across both groups — drives the "N results" header during a search.
  const totalResults = filtered.length + extras.length

  // ── Load more ──────────────────────────────────────────────────────────────
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD)
  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length
  const remaining = filtered.length - visibleCount

  // Reset visible count when search query changes
  useEffect(() => {
    setVisibleCount(INITIAL_LOAD)
  }, [q])

  // Log settled searches (1.5s after the last keystroke) with their result
  // count — zero-result queries are the roadmap signal. Anonymous, capped.
  // The mount-time query is skipped: a reload or shared ?q= link is not a
  // typed search and would inflate per-query counts.
  const initialQ = useRef(q)
  useEffect(() => {
    if (!q || q === initialQ.current) return
    const timer = setTimeout(() => {
      track('Search', { query: q.slice(0, 100), results: totalResults })
    }, 1500)
    return () => clearTimeout(timer)
  }, [q, totalResults])

  function handleLoadMore() {
    setVisibleCount((v) => Math.min(v + LOAD_MORE_SIZE, filtered.length))
  }

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    const qs = params.toString()
    router.replace(qs ? `/components?${qs}` : '/components', { scroll: false })
  }

  // ── "Did you mean?" ────────────────────────────────────────────────────────
  // Only computed when the search has zero hits. Vocabulary is memoized once
  // per components set; suggestions re-run per query. Both are cheap.
  const vocabulary = useMemo(() => buildVocabulary(components), [components])
  const suggestions = useMemo(() => {
    if (!q || !showEmpty) return []
    return findSuggestions(q, vocabulary, 3)
  }, [q, showEmpty, vocabulary])

  const applySuggestion = (word: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('q', word)
    router.replace(`/components?${params.toString()}`, { scroll: false })
  }

  // ── Empty-state icon + phrase cycler ───────────────────────────────────────
  // Synced: each icon has its own matching line, flipping together every 1.5s.
  // Only ticks when the empty state is actually on screen.
  const EMPTY_BEATS = [
    { Icon: MagnifyingGlass, phrase: 'hmm…' },
    { Icon: Ghost,           phrase: 'nothing here…' },
    { Icon: Question,        phrase: "where'd it go?" },
  ]
  const [emptyIdx, setEmptyIdx] = useState(0)
  useEffect(() => {
    if (!showEmpty) return
    const id = setInterval(() => {
      setEmptyIdx((i) => (i + 1) % EMPTY_BEATS.length)
    }, 1500)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEmpty])
  const EmptyIcon = EMPTY_BEATS[emptyIdx].Icon
  const emptyPhrase = EMPTY_BEATS[emptyIdx].phrase

  return (
    <div className="flex min-h-full flex-col bg-sand-50 dark:bg-sand-950">

      {/* ── Top bar (desktop only — mobile uses MobileNav) ── */}
      <div className="sticky top-0 z-10 hidden h-14 shrink-0 items-center justify-between gap-4 border-b border-sand-200 bg-sand-50 px-6 dark:border-sand-800 dark:bg-sand-950 md:flex">
        {q && !category ? (
          <p className="min-w-0 truncate text-sm font-semibold text-sand-600 dark:text-sand-400">
            {totalResults} {totalResults === 1 ? 'result' : 'results'}
            <span className="text-sand-600 dark:text-sand-500"> for </span>
            <span className="text-sand-900 dark:text-sand-50">&ldquo;{query}&rdquo;</span>
          </p>
        ) : (
          <Breadcrumbs
            crumbs={
              // Root crumb names the whole grid: it lists components AND blocks,
              // matching the sidebar's "Components & Blocks" entry.
              category
                ? [{ label: 'Components & Blocks', href: '/components' }, { label: category }]
                : [{ label: 'Components & Blocks', href: '/components' }]
            }
          />
        )}
        <HeaderSocials />
      </div>

      {/* ── Grid ── */}
      <div className="flex flex-1 flex-col bg-sand-50 px-4 pt-4 dark:bg-sand-950 md:px-6 md:pt-6">
        {/* Mobile breadcrumb — shown above cards on small screens */}
        <p className="mb-4 text-sm font-semibold md:hidden">
          {q && !category ? (
            <span className="text-sand-600 dark:text-sand-400">
              {totalResults} {totalResults === 1 ? 'result' : 'results'} for{' '}
              <span className="text-sand-900 dark:text-sand-50">&ldquo;{query}&rdquo;</span>
            </span>
          ) : (
            <>
              <Link href="/components" className="text-sand-900 transition-colors hover:text-sand-600 dark:text-sand-50 dark:hover:text-sand-400">Components &amp; Blocks</Link>
              {category && <span className="text-olive-600 dark:text-olive-500">/{category}</span>}
            </>
          )}
        </p>
        {heading && (
          <header className="mx-auto mb-6 w-full max-w-[1800px]">
            <h1 className="text-2xl font-bold tracking-tight text-sand-900 dark:text-sand-50 sm:text-3xl">
              {heading.h1}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-sand-600 dark:text-sand-400 sm:text-base">
              {heading.intro}
            </p>
          </header>
        )}
        {filtered.length > 0 && (
          <>
            {/* Group title — only during a search, so the two result groups
                ("Components & blocks" + "Design systems & templates") read as a
                consistent pair. Browsing shows no title (the top bar names it). */}
            {q && !category && (
              <h2 className="mx-auto mb-4 w-full max-w-[1800px] text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-500">
                Components &amp; blocks
              </h2>
            )}
            <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visible.map((entry, i) => (
                <motion.div
                  key={entry.slug}
                  initial={i >= visibleCount - LOAD_MORE_SIZE ? { opacity: 0, y: 16 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i >= visibleCount - LOAD_MORE_SIZE ? (i % LOAD_MORE_SIZE) * 0.03 : 0 }}
                >
                  <ComponentCard
                    name={entry.name}
                    description={entry.description}
                    tags={entry.tags}
                    image={entry.image}
                    // Every standalone is labeled: Premium keeps its badge,
                    // everything else is explicitly Free (the listing copy
                    // makes no free/paid claims - the badge does).
                    badge={entry.badge === 'Premium' ? 'Premium' : 'Free'}
                    href={`/components/${entry.slug}`}
                    slug={entry.slug}
                    position={i}
                    source="index"
                  />
                </motion.div>
              ))}
            </div>
            <LoadMore
              hasMore={hasMore}
              remaining={remaining}
              onLoadMore={handleLoadMore}
            />
          </>
        )}

        {/* ── Design systems & templates — search matches beyond the standalone
            catalog. Same ComponentCard shell as the grid; links out to each
            item's own page. ── */}
        {extras.length > 0 && (
          <div className="mx-auto mt-10 w-full max-w-[1800px]">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-500">
              Design systems &amp; templates
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {extras.map((e, i) => (
                <motion.div
                  key={e.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: (i % LOAD_MORE_SIZE) * 0.03 }}
                >
                  <ComponentCard
                    name={e.name}
                    description={e.description}
                    tags={[]}
                    image={e.image}
                    badge={e.badge}
                    cta={e.cta}
                    href={e.href}
                    slug={e.key}
                    position={i}
                    source="index"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {showEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 text-center"
          >
            {/* Icon — cycles through MagnifyingGlass → Ghost → Question every
                1.5s with a flip-crossfade, synced with the phrase below. */}
            <div className="mb-1 flex h-16 w-16 items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={`icon-${emptyIdx}`}
                  initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-center"
                >
                  <EmptyIcon weight="thin" size={48} className="text-olive-600 dark:text-olive-500" />
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Cycling phrase — fixed height keeps layout below from jumping.
                Generous bottom margin creates the rest point between the
                playful intro and the informative answer below. */}
            <div className="mb-14 flex h-6 items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`phrase-${emptyIdx}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="text-sm leading-relaxed text-sand-600 dark:text-sand-400"
                >
                  {emptyPhrase}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Heading — bumped up a notch vs the default so the rhythm change
                from muted phrase → strong heading does the distinction work. */}
            <h2 className="text-2xl font-bold tracking-tight text-sand-900 dark:text-sand-50 sm:text-3xl">
              No results for &ldquo;{query}&rdquo;
            </h2>

            {/* "Did you mean?" chips */}
            {suggestions.length > 0 && (
              <div className="mt-6 w-full">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-600">
                  Did you mean
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {suggestions.map((word) => (
                    <button
                      key={word}
                      onClick={() => applySuggestion(word)}
                      className="group flex items-center gap-1.5 rounded-full border border-olive-500/30 bg-olive-500/10 px-3.5 py-1.5 text-sm font-semibold text-olive-600 transition-all hover:border-olive-500/60 hover:bg-olive-500/20 active:scale-95 dark:text-olive-400"
                    >
                      <Sparkle weight="regular" size={13} className="opacity-60 transition-opacity group-hover:opacity-100" />
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Secondary CTA — only when we have nothing better to offer. If
                the Did-you-mean chips are up, they ARE the escape hatch. */}
            {suggestions.length === 0 && (
              <button
                onClick={clearSearch}
                className="mt-8 rounded-lg border border-sand-200 bg-sand-100 px-4 py-2 text-sm font-semibold text-sand-700 transition-colors hover:border-sand-300 hover:text-sand-900 active:scale-95 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-300 dark:hover:border-sand-600 dark:hover:text-sand-100"
              >
                Browse all components
              </button>
            )}
          </motion.div>
        )}
      </div>

      <div className="mx-auto w-full max-w-[1800px] px-4 pb-8 md:px-6">
        <SiteFooter />
      </div>
    </div>
  )
}
