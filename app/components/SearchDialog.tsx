'use client'

// The site search dialog, opened from the top bar's Search button or with
// ⌘K / Ctrl+K. It is loaded on demand (SiteSearch.tsx lazy-imports it), so the
// metadata it searches never weighs on a page that does not open it.
//
// One input, results grouped by what they are: the two design systems and
// their components and templates, the standalone components and blocks, the
// categories, and the info pages. Matching is plain substring per word over the
// name and a few keywords, ranked name-first. The input is a combobox: the
// arrow keys move the active row, Enter opens it, Escape closes the dialog.

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MagnifyingGlass } from '@phosphor-icons/react'
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

type Item = { id: string; name: string; meta: string; href: string; keywords: string }
type Group = { label: string; items: Item[] }

const PAGES: Item[] = [
  { name: 'All components & blocks', href: '/components', meta: 'Page' },
  { name: 'MCP server', href: '/mcp', meta: 'Page' },
  { name: 'Pricing', href: '/pricing', meta: 'Page' },
  { name: 'About', href: '/about', meta: 'Page' },
  { name: 'FAQ', href: '/faq', meta: 'Page' },
  { name: 'Contact', href: '/contact', meta: 'Page' },
  { name: 'Feedback', href: '/feedback', meta: 'Page' },
].map((p) => ({ ...p, id: `page:${p.href}`, keywords: '' }))

const SYSTEMS: Item[] = [
  {
    id: 'ds:pro',
    name: 'Andromeda Pro',
    meta: 'Design system',
    href: '/design-systems/andromeda-pro',
    keywords: 'design system premium light dark',
  },
  {
    id: 'ds:legacy',
    name: 'Andromeda Legacy',
    meta: 'Design system, free',
    href: '/design-systems/andromeda',
    keywords: 'design system mit free',
  },
]

function buildGroups(): Group[] {
  const system = (label: string, base: string, components: typeof PRO_COMPONENTS, templates: typeof PRO_TEMPLATES) => ({
    label,
    items: [
      ...templates.map((t) => ({
        id: `${base}:t:${t.folder}`,
        name: t.name,
        meta: 'Template',
        href: `${base}/templates/${t.folder}`,
        keywords: `template ${t.description}`,
      })),
      ...components.map((c) => ({
        id: `${base}:c:${c.slug}`,
        name: c.name,
        meta: 'Component',
        href: `${base}/${c.slug}`,
        keywords: `component ${c.description}`,
      })),
    ],
  })

  return [
    { label: 'Design systems', items: SYSTEMS },
    system('Andromeda Pro', '/design-systems/andromeda-pro', PRO_COMPONENTS, PRO_TEMPLATES),
    {
      label: 'Components & blocks',
      items: COMPONENT_META.map((c) => {
        const category = c.tags.find((t) => t.accent)?.label ?? c.tags[0]?.label ?? 'Component'
        return {
          id: `std:${c.slug}`,
          name: c.name,
          meta: c.badge === 'Premium' ? `${category}, Premium` : category,
          href: `/components/${c.slug}`,
          keywords: `${c.tags.map((t) => t.label).join(' ')} ${c.description}`,
        }
      }),
    },
    system('Andromeda Legacy', '/design-systems/andromeda', LEGACY_COMPONENTS, LEGACY_TEMPLATES),
    {
      label: 'Categories',
      items: CATEGORIES.map((c) => ({
        id: `cat:${c.slug}`,
        name: c.label,
        meta: 'Category',
        href: `/components/category/${c.slug}`,
        keywords: 'category',
      })),
    },
    { label: 'Pages', items: PAGES },
  ]
}

const GROUPS = buildGroups()
const PER_GROUP = 6

// Every word must appear somewhere; a hit in the name outranks a hit in the
// keywords, and a name that starts with the word ranks highest.
function score(item: Item, words: string[]): number {
  const name = item.name.toLowerCase()
  const keywords = item.keywords.toLowerCase()
  let total = 0
  for (const w of words) {
    if (name.startsWith(w)) total += 4
    else if (name.includes(` ${w}`)) total += 3
    else if (name.includes(w)) total += 2
    else if (keywords.includes(w)) total += 1
    else return 0
  }
  return total
}

function search(groups: Group[], query: string): Group[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return groups.filter((g) => g.label === 'Design systems' || g.label === 'Pages')
  return groups
    .map((g) => ({
      label: g.label,
      items: g.items
        .map((item, i) => ({ item, i, s: score(item, words) }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s || a.i - b.i)
        .slice(0, PER_GROUP)
        .map((r) => r.item),
    }))
    .filter((g) => g.items.length > 0)
}

export default function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const results = useMemo(() => search(GROUPS, query), [query])
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

  function go(item: Item) {
    onClose()
    router.push(item.href)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (flat.length ? (Math.min(a, flat.length - 1) + 1) % flat.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (flat.length ? (Math.min(a, flat.length - 1) - 1 + flat.length) % flat.length : 0))
    } else if (e.key === 'Enter' && current) {
      e.preventDefault()
      go(current)
    } else if (e.key === 'Tab') {
      // The input is the dialog's only focus stop; the rows are reached with
      // the arrow keys, so Tab must not walk out into the page behind.
      e.preventDefault()
    }
  }

  // Portalled to <body>: the top bar is sticky with its own z-index, so a
  // dialog rendered inside it would sit under any page layer above z-10. The
  // body itself never scrolls (the page scrolls in its own column), so the
  // page behind needs no scroll lock.
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-center px-4 pt-[12vh]" onKeyDown={onKeyDown}>
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-sand-950/40 dark:bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="relative flex h-fit max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-sand-200 bg-sand-50 shadow-[0_2px_4px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.16)] dark:border-sand-800 dark:bg-sand-950 dark:shadow-[0_2px_4px_rgba(0,0,0,0.4),0_16px_40px_rgba(0,0,0,0.6)]"
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3 border-b border-sand-200 px-4 dark:border-sand-800">
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
              setActive(0)
            }}
            placeholder="Search design systems, components, pages…"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-sand-900 outline-none placeholder:text-sand-600 dark:text-sand-50 dark:placeholder:text-sand-400"
          />
          <kbd className="shrink-0 rounded border border-sand-200 px-1.5 py-0.5 font-sans text-[11px] font-medium text-sand-600 dark:border-sand-800 dark:text-sand-400">
            Esc
          </kbd>
        </div>

        <div ref={listRef} id={listId} role="listbox" aria-label="Results" className="overflow-y-auto overscroll-contain p-2">
          {flat.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-sand-600 dark:text-sand-400">
              Nothing matches &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            results.map((g) => (
              <div key={g.label} role="group" aria-label={g.label} className="pb-1">
                <div className="px-3 pb-1 pt-2 text-xs font-semibold text-sand-600 dark:text-sand-400">{g.label}</div>
                {g.items.map((item) => {
                  const selected = item.id === current?.id
                  return (
                    <div
                      key={item.id}
                      id={`${listId}-${item.id}`}
                      data-id={item.id}
                      role="option"
                      aria-selected={selected}
                      onPointerMove={() => setActive(flat.indexOf(item))}
                      onClick={() => go(item)}
                      className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm ${
                        selected ? 'bg-sand-100 dark:bg-sand-900' : ''
                      }`}
                    >
                      <span className="truncate font-medium text-sand-900 dark:text-sand-50">{item.name}</span>
                      <span className="shrink-0 text-xs text-sand-600 dark:text-sand-400">{item.meta}</span>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}
