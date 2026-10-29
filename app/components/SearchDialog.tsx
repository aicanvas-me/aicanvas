'use client'

// The site search dialog, opened from the top bar's Search button or with
// ⌘K / Ctrl+K. It is loaded on demand (SiteSearch.tsx lazy-imports it), so the
// metadata it searches never weighs on a page that does not open it.
//
// Everything is listed before a word is typed, grouped by what it is, and the
// tabs narrow it to one kind. Each row carries its page path, so two templates
// with one name (Pro and Legacy) stay apart. Matching runs per word over the
// name and the description, so a short description of what you need finds
// things too: filler words are dropped, a plural matches its singular, and a
// query of several words needs half of them, not all. Groups are ordered by their
// best hit once there is a query.
//
// The input is a combobox and the only focus stop: the arrow keys move the
// active row, Enter opens it, Tab and Shift+Tab switch the tab, Escape closes.

import { useEffect, useId, useMemo, useRef, useState, type ComponentType } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowElbowDownLeft,
  ArrowUp,
  FileText,
  FolderSimple,
  Layout,
  MagnifyingGlass,
  Shapes,
  SquaresFour,
  Stack,
  type IconProps,
} from '@phosphor-icons/react'
import { COMPONENT_META } from '../lib/component-meta.generated'
import { CATEGORIES } from '../lib/categories'
import {
  ANDROMEDA_COMPONENT_META as LEGACY_COMPONENTS,
  ANDROMEDA_TEMPLATE_META as LEGACY_TEMPLATES,
} from '../_lib/andromeda/andromeda-meta'
import {
  ANDROMEDA_COMPONENT_META as PRO_COMPONENTS,
  ANDROMEDA_TEMPLATE_META as PRO_TEMPLATES,
} from '../_lib/andromeda-pro/andromeda-meta'
import { premiumEnabled } from '../../lib/flags'
import { wordVariants } from '../lib/search-match'
import { DOCS_NAV } from '../docs/_lib/nav'
import iconsJson from '../icons/_data/icons.generated.json'
import { ICON_CATEGORY_LABELS, ICON_COUNT, type IconCategorySlug } from '../icons/_lib/categories'
import type { IconMeta } from '../icons/_lib/types'

// Typed so an empty generated file (a checkout without icon data) still compiles.
const ICONS = iconsJson as IconMeta[]

type Tab = 'all' | 'systems' | 'templates' | 'components' | 'icons' | 'pages'
// What it costs to install: Andromeda Pro is all paid, a
// standalone is paid when badged Premium, and Andromeda Legacy and the
// other standalones are free. Categories and pages carry no tier.
type Tier = 'pro' | 'premium' | 'free'
type Item = {
  id: string
  name: string
  href: string
  keywords: string
  icon: ComponentType<IconProps>
  tier?: Tier
}
// `idle` is what a group lists before a word is typed, for a group too long
// to show whole (the icon set lists its page, not 821 rows).
type Group = { label: string; tab: Exclude<Tab, 'all'>; items: Item[]; idle?: Item[] }

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'systems', label: 'Design systems' },
  { id: 'templates', label: 'Templates' },
  { id: 'components', label: 'Components & blocks' },
  { id: 'icons', label: 'Icons' },
  { id: 'pages', label: 'Pages' },
]

const PRO = '/design-systems/andromeda-pro'
const LEGACY = '/design-systems/andromeda'

const page = (name: string, href: string, keywords = ''): Item => ({ id: `page:${href}`, name, href, keywords, icon: FileText })

const ICONS_PAGE: Item = { ...page('Icons', '/icons', `all ${ICON_COUNT} icon set svg line duotone solid`), icon: Shapes }

const GROUPS: Group[] = [
  {
    label: 'Design systems',
    tab: 'systems',
    items: [
      { id: 'ds:pro', name: 'Andromeda Pro', href: PRO, keywords: 'design system light dark', icon: Stack, tier: 'pro' },
      { id: 'ds:legacy', name: 'Andromeda Legacy', href: LEGACY, keywords: 'design system mit', icon: Stack, tier: 'free' },
    ],
  },
  {
    label: 'Andromeda Pro components',
    tab: 'systems',
    items: PRO_COMPONENTS.map((c) => ({
      id: `pro:${c.slug}`,
      name: c.name,
      href: `${PRO}/${c.slug}`,
      keywords: c.description,
      icon: SquaresFour,
      tier: 'pro' as const,
    })),
  },
  {
    label: 'Templates',
    tab: 'templates',
    items: [
      ...PRO_TEMPLATES.map((t) => ({ ...t, base: PRO, tier: 'pro' as const })),
      ...LEGACY_TEMPLATES.map((t) => ({ ...t, base: LEGACY, tier: 'free' as const })),
    ].map((t) => ({
      id: `${t.base}:t:${t.folder}`,
      name: t.name,
      href: `${t.base}/templates/${t.folder}`,
      keywords: `template page ${t.description}`,
      icon: Layout,
      tier: t.tier,
    })),
  },
  {
    label: 'Components & blocks',
    tab: 'components',
    items: COMPONENT_META.map((c) => ({
      id: `std:${c.slug}`,
      name: c.name,
      href: `/components/${c.slug}`,
      keywords: `${c.tags.map((t) => t.label).join(' ')} ${c.description}`,
      icon: SquaresFour,
      tier: c.badge === 'Premium' ? ('premium' as const) : ('free' as const),
    })),
  },
  {
    label: 'Andromeda Legacy components',
    tab: 'systems',
    items: LEGACY_COMPONENTS.map((c) => ({
      id: `legacy:${c.slug}`,
      name: c.name,
      href: `${LEGACY}/${c.slug}`,
      keywords: c.description,
      icon: SquaresFour,
      tier: 'free' as const,
    })),
  },
  {
    label: 'Categories',
    tab: 'components',
    items: CATEGORIES.map((c) => ({
      id: `cat:${c.slug}`,
      name: c.label,
      href: `/components/category/${c.slug}`,
      keywords: `category ${c.description}`,
      icon: FolderSimple,
    })),
  },
  {
    label: 'Icons',
    tab: 'icons',
    idle: [ICONS_PAGE],
    items: [
      ICONS_PAGE,
      ...ICONS.map((i) => ({
        id: `icon:${i.name}`,
        name: i.name,
        href: `/icons/${i.name}`,
        keywords: `${ICON_CATEGORY_LABELS[i.category as IconCategorySlug]} ${i.tags.join(' ')}`,
        icon: Shapes,
      })),
    ],
  },
  {
    label: 'Pages',
    tab: 'pages',
    items: [
      page('All components & blocks', '/components'),
      page('Andromeda Pro AI Brain', `${PRO}/brain`, 'brain rules design skill agent'),
      page('Andromeda Legacy AI Brain', `${LEGACY}/brain`, 'brain rules design skill agent mit'),
      ...DOCS_NAV.flatMap((s) => s.pages).map((d) =>
        page(d.href === '/docs' ? 'Docs' : `Docs: ${d.title}`, d.href, `docs documentation guide ${d.description}`),
      ),
      page('Sign in to your account', '/account/sign-in', 'log in account'),
      page('MCP server', '/mcp'),
      page('Pricing', '/pricing'),
      page('About', '/about'),
      page('FAQ', '/faq'),
      page('Contact', '/contact'),
      page('Feedback', '/feedback'),
    ],
  },
]

const FILLER = new Set(
  'a an and any are as at be by can for from get i in into is it me my need of on or show some something that the this to use want with you your'.split(' '),
)

function toWords(query: string): string[] {
  const raw = query.toLowerCase().split(/[^a-z0-9&]+/).filter(Boolean)
  const kept = raw.filter((w) => !FILLER.has(w))
  // A plural matches its singular: "charts" finds "Chart".
  return (kept.length ? kept : raw).map((w) => (w.length > 3 ? w.replace(/s$/, '') : w))
}

// A name hit outranks a description hit, and a name that starts with the word
// ranks highest. A query of two or more words needs half of them, since a
// description of a need rarely uses our exact words; every matched word adds
// 10, so the rows that match the most words always come first.
function score(item: Item, words: string[]): number {
  const name = item.name.toLowerCase()
  const keywords = item.keywords.toLowerCase()
  let total = 0
  let matched = 0
  for (const w of words) {
    // A synonym counts like the word itself: "login" finds Sign In.
    let s = 0
    for (const v of wordVariants(w)) {
      if (name.startsWith(v)) s = Math.max(s, 6)
      else if (name.includes(` ${v}`)) s = Math.max(s, 5)
      else if (name.includes(v)) s = Math.max(s, 3)
      else if (keywords.includes(v)) s = Math.max(s, 1)
    }
    if (s) {
      matched++
      total += s
    }
  }
  // A one-word query that IS the name ("icons" for Icons) ranks above a name
  // that only starts with it (Icon Button).
  if (words.length === 1 && name.replace(/s$/, '') === words[0]) total += 4
  const need = Math.ceil(words.length / 2)
  return matched >= need ? total + matched * 10 : 0
}

function search(tab: Tab, query: string): Group[] {
  const groups = GROUPS.filter((g) => tab === 'all' || g.tab === tab)
  const all = toWords(query)
  // "pro" stays a search word when it is the whole query's subject alongside
  // others ("andromeda pro"); only on its own or next to plain words is it a tier.
  const tierWord = all.find((w) => w in TIER_FILTER && !(w === 'pro' && all.includes('andromeda')))
  const want = tierWord ? TIER_FILTER[tierWord] : undefined
  const words = all.filter((w) => w !== tierWord)
  if (!want && words.length === 0) return groups.map((g) => (g.idle ? { ...g, items: g.idle } : g))
  return groups
    .map((g) => {
      const ranked = g.items
        .filter((item) => !want || inTier(item, want))
        .map((item, i) => ({ item, i, s: words.length ? score(item, words) : 1 }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s || a.i - b.i)
      return { group: { ...g, items: ranked.map((r) => r.item) }, best: ranked[0]?.s ?? 0 }
    })
    .filter((r) => r.best > 0)
    .sort((a, b) => b.best - a.best)
    .map((r) => r.group)
}

// A tier word in the query is a filter, not a search word: "free button"
// means buttons that are free, and "premium" alone lists everything paid.
const TIER_FILTER: Record<string, 'free' | 'paid'> = { free: 'free', mit: 'free', premium: 'paid', paid: 'paid', pro: 'paid' }
const inTier = (item: Item, want: 'free' | 'paid') => (want === 'free' ? item.tier === 'free' : item.tier === 'pro' || item.tier === 'premium')

// Same chip shape as SystemTierChip, with the tier colours the component grid
// already uses: Pro and premium take the accent, free is neutral.
const TIER_CHIP: Record<Tier, string> = {
  pro: 'bg-accent/10 text-accent ring-accent/40',
  premium: 'bg-accent/10 text-accent ring-accent/40',
  free: 'text-sand-600 ring-sand-300 dark:text-sand-400 dark:ring-sand-700',
}

function TierChip({ tier }: { tier: Tier }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-px text-xxs font-semibold uppercase tracking-wider ring-1 ring-inset ${TIER_CHIP[tier]}`}
    >
      {tier === 'free' ? 'Free' : 'Premium'}
    </span>
  )
}

const KEY_BASE =
  'inline-flex h-5 items-center justify-center rounded-tag border border-sand-200 text-sand-600 dark:border-sand-800 dark:text-sand-400'
const KEY = `${KEY_BASE} w-5`

export default function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  // With premium switched off nothing is for sale, so no row claims a tier.
  const showTiers = premiumEnabled()

  const results = useMemo(() => {
    const found = search(tab, query)
    const q = query.trim()
    // Once there is a query, the first row hands it to the components grid,
    // which filters every standalone by it (the sidebar box used to do this
    // as you typed).
    if (!q || (tab !== 'all' && tab !== 'components')) return found
    const grid: Item = {
      id: 'grid',
      name: `Show all results for “${q}” in the components grid`,
      href: `/components?q=${encodeURIComponent(q)}`,
      keywords: '',
      icon: MagnifyingGlass,
    }
    return [{ label: 'Components grid', tab: 'components' as const, items: [grid] }, ...found]
  }, [tab, query])
  const flat = useMemo(() => results.flatMap((g) => g.items), [results])
  const current = flat[Math.min(active, flat.length - 1)]

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Keep the active row in view while the arrow keys walk the list.
  useEffect(() => {
    if (!current) return
    listRef.current?.querySelector(`[data-id="${CSS.escape(current.id)}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [current])

  function reset() {
    setActive(0)
    listRef.current?.scrollTo({ top: 0 })
  }

  function pickTab(next: Tab) {
    setTab(next)
    reset()
    inputRef.current?.focus()
  }

  function go(item: Item) {
    onClose()
    router.push(item.href)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const n = flat.length
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (n ? (Math.min(a, n - 1) + 1) % n : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (n ? (Math.min(a, n - 1) - 1 + n) % n : 0))
    } else if (e.key === 'Enter' && current) {
      e.preventDefault()
      go(current)
    } else if (e.key === 'Tab') {
      // The input is the dialog's only focus stop, so Tab switches the filter
      // tab instead of walking out into the page behind.
      e.preventDefault()
      const i = TABS.findIndex((t) => t.id === tab)
      pickTab(TABS[(i + (e.shiftKey ? -1 : 1) + TABS.length) % TABS.length].id)
    }
  }

  let row = -1

  // Portalled to <body>: the top bar is sticky with its own z-index, so a
  // dialog rendered inside it would sit under any page layer above z-10. The
  // body itself never scrolls (the page scrolls in its own column), so the
  // page behind needs no scroll lock.
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-center px-4 pt-[12vh]" onKeyDown={onKeyDown}>
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-sand-950/40 backdrop-blur-sm dark:bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="relative flex h-[min(36rem,76vh)] w-full max-w-xl flex-col overflow-hidden rounded-section border border-sand-200 bg-sand-50 shadow-[0_2px_4px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.16)] dark:border-sand-800 dark:bg-sand-950 dark:shadow-[0_2px_4px_rgba(0,0,0,0.4),0_16px_40px_rgba(0,0,0,0.6)]"
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-sand-200 px-4 dark:border-sand-800">
          <MagnifyingGlass weight="regular" size={16} aria-hidden className="shrink-0 text-sand-600 dark:text-sand-400" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={current ? `${listId}-${current.id}` : undefined}
            aria-autocomplete="list"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              reset()
            }}
            placeholder="Search or describe what you need…"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-sand-900 outline-none placeholder:text-sand-600 dark:text-sand-50 dark:placeholder:text-sand-400"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={onClose}
            className="shrink-0 text-xs font-medium text-sand-600 transition-colors hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-50"
          >
            Esc
          </button>
        </div>

        <div role="tablist" aria-label="Filter results" className="flex shrink-0 gap-1 overflow-x-auto px-3 pt-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              tabIndex={-1}
              aria-selected={tab === t.id}
              onClick={() => pickTab(t.id)}
              className={`h-7 shrink-0 rounded-full px-3 text-xs font-semibold transition-colors ${
                tab === t.id
                  ? 'bg-sand-200 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                  : 'text-sand-600 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div ref={listRef} id={listId} role="listbox" aria-label="Results" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
          {flat.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-sand-600 dark:text-sand-400">
              Nothing matches &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            results.map((g) => (
              <div key={g.label} role="group" aria-label={g.label} className="pb-1">
                <div className="px-3 pb-1.5 pt-3 text-xs font-semibold text-sand-600 dark:text-sand-400">{g.label}</div>
                {g.items.map((item) => {
                  const index = ++row
                  const selected = item.id === current?.id
                  const Icon = item.icon
                  return (
                    <div
                      key={item.id}
                      id={`${listId}-${item.id}`}
                      data-id={item.id}
                      role="option"
                      aria-selected={selected}
                      onPointerMove={() => setActive(index)}
                      onClick={() => go(item)}
                      className={`flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 ${
                        selected ? 'bg-sand-100 dark:bg-sand-900' : ''
                      }`}
                    >
                      <Icon weight="regular" size={16} aria-hidden className="shrink-0 text-sand-600 dark:text-sand-400" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-sand-900 dark:text-sand-50">{item.name}</div>
                        <div className="truncate font-mono text-xs text-sand-600 dark:text-sand-400">{item.href}</div>
                      </div>
                      {showTiers && item.tier && <TierChip tier={item.tier} />}
                      {selected && (
                        <ArrowElbowDownLeft weight="regular" size={14} aria-hidden className="shrink-0 text-sand-600 dark:text-sand-400" />
                      )}
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4 border-t border-sand-200 px-4 py-2.5 text-xs text-sand-600 dark:border-sand-800 dark:text-sand-400">
          <span className="flex items-center gap-1.5">
            <span className={KEY}><ArrowUp weight="regular" size={11} aria-hidden /></span>
            <span className={KEY}><ArrowDown weight="regular" size={11} aria-hidden /></span>
            Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <span className={KEY}><ArrowElbowDownLeft weight="regular" size={11} aria-hidden /></span>
            Open
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <span className={`${KEY_BASE} px-1 font-medium`}>Tab</span>
            Filter
          </span>
          <span className="ml-auto tabular-nums" aria-live="polite">
            {flat.length} {flat.length === 1 ? 'result' : 'results'}
          </span>
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}
