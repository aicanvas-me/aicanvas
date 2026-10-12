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
// long query needs most of its words, not all. Groups are ordered by their
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

type Tab = 'all' | 'systems' | 'templates' | 'components' | 'pages'
type Item = {
  id: string
  name: string
  href: string
  keywords: string
  icon: ComponentType<IconProps>
  premium?: boolean
}
type Group = { label: string; tab: Exclude<Tab, 'all'>; items: Item[] }

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'systems', label: 'Design systems' },
  { id: 'templates', label: 'Templates' },
  { id: 'components', label: 'Components & blocks' },
  { id: 'pages', label: 'Pages' },
]

const PRO = '/design-systems/andromeda-pro'
const LEGACY = '/design-systems/andromeda'

const page = (name: string, href: string): Item => ({ id: `page:${href}`, name, href, keywords: '', icon: FileText })

const GROUPS: Group[] = [
  {
    label: 'Design systems',
    tab: 'systems',
    items: [
      { id: 'ds:pro', name: 'Andromeda Pro', href: PRO, keywords: 'design system light dark', icon: Stack },
      { id: 'ds:legacy', name: 'Andromeda Legacy', href: LEGACY, keywords: 'design system mit free', icon: Stack },
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
    })),
  },
  {
    label: 'Templates',
    tab: 'templates',
    items: [
      ...PRO_TEMPLATES.map((t) => ({ ...t, base: PRO })),
      ...LEGACY_TEMPLATES.map((t) => ({ ...t, base: LEGACY })),
    ].map((t) => ({
      id: `${t.base}:t:${t.folder}`,
      name: t.name,
      href: `${t.base}/templates/${t.folder}`,
      keywords: `template page ${t.description}`,
      icon: Layout,
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
      premium: c.badge === 'Premium',
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
    label: 'Pages',
    tab: 'pages',
    items: [
      page('All components & blocks', '/components'),
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
// ranks highest. Up to two words must all match; a longer query needs 60% of
// them, since a description of a need rarely uses our exact words.
function score(item: Item, words: string[]): number {
  const name = item.name.toLowerCase()
  const keywords = item.keywords.toLowerCase()
  let total = 0
  let matched = 0
  for (const w of words) {
    let s = 0
    if (name.startsWith(w)) s = 6
    else if (name.includes(` ${w}`)) s = 5
    else if (name.includes(w)) s = 3
    else if (keywords.includes(w)) s = 1
    if (s) {
      matched++
      total += s
    }
  }
  const need = words.length <= 2 ? words.length : Math.ceil(words.length * 0.6)
  return matched >= need ? total + matched * 10 : 0
}

function search(tab: Tab, query: string): Group[] {
  const groups = GROUPS.filter((g) => tab === 'all' || g.tab === tab)
  const words = toWords(query)
  if (words.length === 0) return groups
  return groups
    .map((g) => {
      const ranked = g.items
        .map((item, i) => ({ item, i, s: score(item, words) }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s || a.i - b.i)
      return { group: { ...g, items: ranked.map((r) => r.item) }, best: ranked[0]?.s ?? 0 }
    })
    .filter((r) => r.best > 0)
    .sort((a, b) => b.best - a.best)
    .map((r) => r.group)
}

const KEY_BASE =
  'inline-flex h-5 items-center justify-center rounded border border-sand-200 text-sand-600 dark:border-sand-800 dark:text-sand-400'
const KEY = `${KEY_BASE} w-5`

export default function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const results = useMemo(() => search(tab, query), [tab, query])
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
        className="relative flex h-[min(36rem,76vh)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-sand-200 bg-sand-50 shadow-[0_2px_4px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.16)] dark:border-sand-800 dark:bg-sand-950 dark:shadow-[0_2px_4px_rgba(0,0,0,0.4),0_16px_40px_rgba(0,0,0,0.6)]"
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
              className={`h-7 shrink-0 rounded-md px-2.5 text-xs font-semibold transition-colors ${
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
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 ${
                        selected ? 'bg-sand-100 dark:bg-sand-900' : ''
                      }`}
                    >
                      <Icon weight="regular" size={16} aria-hidden className="shrink-0 text-sand-600 dark:text-sand-400" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-sand-900 dark:text-sand-50">{item.name}</div>
                        <div className="truncate font-mono text-xs text-sand-600 dark:text-sand-400">{item.href}</div>
                      </div>
                      {item.premium && (
                        <span className="shrink-0 text-xs font-medium text-sand-600 dark:text-sand-400">Premium</span>
                      )}
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
