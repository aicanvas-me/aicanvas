'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CaretDown, Check, Plus, PushPinSlash, X } from '@phosphor-icons/react'
import { Button, buttonClasses } from '../../../components/Button'
import { andromedaPageSlug } from '../../../_lib/andromeda/andromeda-meta'

export type SavedRow = {
  slug: string
  system: string | null
  collection: string | null
  saved_at: string
  // Enriched server-side from the component registry so the client doesn't
  // need to ship the full COMPONENTS array. `name` falls back to the slug,
  // `image` is null when the component isn't in the registry (e.g. some
  // design-system templates) — the card renders a neutral fallback then.
  name: string
  image: string | null
}

function hrefFor(row: SavedRow) {
  return row.system === 'andromeda'
    ? `/design-systems/andromeda/${andromedaPageSlug(row.slug)}`
    : `/components/${row.slug}`
}

export function SavedList({ initial }: { initial: SavedRow[] }) {
  const [rows, setRows] = useState<SavedRow[]>(initial)
  const [filter, setFilter] = useState<string | null>(null) // null = All
  // Newly-named folders that have no items yet. In-memory only — they
  // disappear on navigation/refresh until we add a Supabase user_collections
  // table. See trade-off note in the chat thread.
  const [ghostCollections, setGhostCollections] = useState<string[]>([])

  const collections = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of rows) {
      if (row.collection) counts.set(row.collection, (counts.get(row.collection) ?? 0) + 1)
    }
    for (const name of ghostCollections) {
      if (!counts.has(name)) counts.set(name, 0)
    }
    const names = [...counts.keys()].sort()
    return { names, counts }
  }, [rows, ghostCollections])

  function createCollection(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    setGhostCollections((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
    setFilter(trimmed)
  }

  const visible = useMemo(() => {
    if (filter === null) return rows
    return rows.filter((r) => r.collection === filter)
  }, [rows, filter])

  async function setCollection(slug: string, value: string | null) {
    setRows((prev) => prev.map((r) => (r.slug === slug ? { ...r, collection: value } : r)))
    try {
      await fetch('/api/saved', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug, collection: value }),
      })
    } catch {
      // Roll back on failure
      setRows(initial)
    }
  }

  async function deleteCollection(name: string) {
    // Clears the collection tag on every item in this folder (collection: null).
    // Items keep their saved status; the folder itself disappears because
    // folders are derived from the rows. Items continue to show under "All".
    const previous = rows
    const affectedSlugs = previous.filter((r) => r.collection === name).map((r) => r.slug)
    setRows((prev) => prev.map((r) => (r.collection === name ? { ...r, collection: null } : r)))
    if (filter === name) setFilter(null)
    if (affectedSlugs.length === 0) return // ghost / empty — nothing to PATCH
    try {
      const results = await Promise.all(
        affectedSlugs.map((slug) =>
          fetch('/api/saved', {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ slug, collection: null }),
          }),
        ),
      )
      if (results.some((r) => !r.ok)) throw new Error('partial delete failure')
    } catch {
      setRows(previous)
    }
  }

  async function unsave(slug: string) {
    // Optimistic remove — drop the row immediately, restore from `initial`
    // if the request fails so the user sees their state preserved.
    const previous = rows
    setRows((prev) => prev.filter((r) => r.slug !== slug))
    try {
      const res = await fetch('/api/saved', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (!res.ok) throw new Error('delete failed')
    } catch {
      setRows(previous)
    }
  }

  return (
    <div className="space-y-6">
      <FolderTabs
        names={collections.names}
        counts={collections.counts}
        totalCount={rows.length}
        hasAnySaves={rows.length > 0}
        active={filter}
        onChange={setFilter}
        onDelete={deleteCollection}
        onCreate={createCollection}
      />

      {/* Empty state — rendered client-side too so unsaving the last row
          immediately reveals the "you haven't saved anything yet" panel
          instead of leaving the user staring at an empty container. The
          identical server-side empty state in /saved/page.tsx covers the
          first paint when there are no saves at all. */}
      {rows.length === 0 ? (
        <EmptyState />
      ) : visible.length === 0 ? (
        <FilteredEmptyState onReset={() => setFilter(null)} />
      ) : (
        <ul className="space-y-2">
          {visible.map((row) => (
            <li
              key={row.slug}
              className="flex items-center gap-4 rounded-xl border border-sand-200 bg-sand-100 px-3 py-3 transition-colors hover:border-sand-300 dark:border-sand-800 dark:bg-sand-900 dark:hover:border-sand-700"
            >
              <Link
                href={hrefFor(row)}
                className="group flex min-w-0 flex-1 items-center gap-4"
                aria-label={`Open ${row.name}`}
              >
                <SavedThumbnail src={row.image} alt="" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-sand-900 transition-colors group-hover:text-olive-500 dark:text-sand-50 dark:group-hover:text-olive-400">
                    {row.name}
                  </div>
                  {row.system && (
                    <div className="mt-0.5 truncate text-xs text-sand-600 dark:text-sand-400">
                      {row.system} system
                    </div>
                  )}
                </div>
              </Link>
              <CollectionPicker
                value={row.collection}
                allNames={collections.names}
                onChange={(value) => setCollection(row.slug, value)}
              />
              <Button
                variant="icon"
                size="sm"
                onClick={() => unsave(row.slug)}
                aria-label={`Remove ${row.name} from saved`}
                title="Remove from saved"
                className="shrink-0"
              >
                <PushPinSlash size={16} weight="regular" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Client-side "you haven't saved anything yet" state — matches the server-side
// empty state in /saved/page.tsx so the user sees the same panel whether they
// arrive with zero saves or unsave their last item in this session.
function EmptyState() {
  return (
    <div className="rounded-xl border border-sand-200 bg-sand-100 p-12 text-center dark:border-sand-800 dark:bg-sand-900">
      <p className="text-sm text-sand-600 dark:text-sand-400">
        You haven&apos;t saved anything yet.
      </p>
      <Link
        href="/components"
        className={`mt-4 ${buttonClasses({ variant: 'primary', size: 'sm' })}`}
      >
        Browse components
      </Link>
    </div>
  )
}

// Component preview thumbnail at the start of each row. Fixed 56×40 box on
// sand-950 so previews with transparent backgrounds (the site convention) sit
// on the same deep surface they're authored against. Falls back to a muted
// placeholder for rows the registry has no image for.
function SavedThumbnail({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-sand-950 ring-1 ring-sand-200 dark:ring-sand-800">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      ) : null}
    </div>
  )
}

function FilteredEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-sand-200 bg-transparent p-10 text-center dark:border-sand-800">
      <p className="text-sm text-sand-600 dark:text-sand-400">
        This collection is empty.
      </p>
      <p className="mt-2 text-xs text-sand-600 dark:text-sand-500">
        Save more components, or move an existing save in from its per-row dropdown.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/components"
          className={buttonClasses({ variant: 'primary', size: 'sm' })}
        >
          Browse components
        </Link>
        <Button variant="outline" size="sm" onClick={onReset}>
          Show all
        </Button>
      </div>
    </div>
  )
}

// Folder-graphic tabs. Each folder is a 64×56 SVG (olive paper when the tab
// is active, sand paper when idle) with the collection name + item count
// underneath. Collections are created exclusively by assigning saves via the
// per-row CollectionPicker dropdown — a folder only exists once it has at
// least one item in it. Items without a collection don't get a pseudo-folder
// — they live under "All" alongside everything else. User-created folders
// show a hover-revealed × badge that opens a confirm banner; "All" is not
// deletable.
function FolderTabs({
  names,
  counts,
  totalCount,
  hasAnySaves,
  active,
  onChange,
  onDelete,
  onCreate,
}: {
  names: string[]
  counts: Map<string, number>
  totalCount: number
  hasAnySaves: boolean
  active: string | null
  onChange: (value: string | null) => void
  onDelete: (name: string) => void
  onCreate: (name: string) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState('')
  const confirmCount = confirmDelete ? counts.get(confirmDelete) ?? 0 : 0

  function commit() {
    const trimmed = draft.trim()
    if (!trimmed) {
      setCreating(false)
      return
    }
    onCreate(trimmed)
    setDraft('')
    setCreating(false)
  }

  return (
    <div className="space-y-3">
      {confirmDelete && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-sand-900 dark:text-sand-50">
            Delete <strong className="font-semibold">&ldquo;{confirmDelete}&rdquo;</strong>?
            {confirmCount > 0 && (
              <span className="text-sand-600 dark:text-sand-400">
                {' '}
                {confirmCount === 1 ? '1 item' : `${confirmCount} items`} will stay saved under All.
              </span>
            )}
          </p>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              tone="solid"
              size="sm"
              onClick={() => { onDelete(confirmDelete); setConfirmDelete(null) }}
            >
              Delete folder
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-start gap-x-3 gap-y-4">
        <Folder
          label="All"
          count={totalCount}
          active={active === null}
          onClick={() => onChange(null)}
        />
        {names.map((name) => (
          <Folder
            key={name}
            label={name}
            count={counts.get(name) ?? 0}
            active={active === name}
            onClick={() => onChange(name)}
            onDelete={() => { setConfirmDelete(name); setCreating(false) }}
          />
        ))}
        {creating ? (
          <form
            onSubmit={(e) => { e.preventDefault(); commit() }}
            className="flex h-[72px] w-[160px] flex-col items-stretch justify-center gap-1"
          >
            <input
              type="text"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => { if (e.key === 'Escape') { setDraft(''); setCreating(false) } }}
              placeholder="Folder name…"
              maxLength={40}
              className="w-full rounded-md border border-olive-500 bg-sand-100 px-2 py-1 text-base text-sand-900 outline-none md:text-xs dark:bg-sand-900 dark:text-sand-50"
            />
            <p className="text-center text-[10px] text-sand-600 dark:text-sand-500">Enter to create · Esc to cancel</p>
          </form>
        ) : (
          hasAnySaves && (
            <button
              type="button"
              onClick={() => { setCreating(true); setConfirmDelete(null) }}
              aria-label="Create new folder"
              title="Create new folder"
              className="mt-[14px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-sand-700 text-sand-700 transition-colors hover:border-olive-500 hover:text-olive-500 dark:border-sand-50 dark:text-sand-50 dark:hover:border-olive-400 dark:hover:text-olive-400"
            >
              <Plus size={14} weight="regular" />
            </button>
          )
        )}
      </div>
    </div>
  )
}

// Picks the folder graphic for a given count + selection state. Empty folders
// share one neutral graphic (the design has no "empty + active" variant —
// selection on an empty folder is signalled by the label colour instead).
function folderAsset(count: number, active: boolean): string {
  if (count === 0) return '/account/folders/folder-empty.svg'
  const variant = count === 1 ? 'one' : 'multi'
  const state = active ? 'active' : 'inactive'
  return `/account/folders/folder-${variant}-${state}.svg`
}

// Single folder tab. Native viewBox is 56×49 (≈1.14:1), rendered at 64×56.
// When `onDelete` is supplied, a small × badge appears on hover/focus in the
// folder graphic's top-right corner — clicking it opens the parent's confirm
// banner (it does NOT bubble to the folder-select click).
function Folder({
  label,
  count,
  active,
  onClick,
  onDelete,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  onDelete?: () => void
}) {
  return (
    <div className="group relative flex min-w-[88px] flex-col items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className="flex flex-col items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-olive-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sand-200 dark:focus-visible:ring-offset-sand-950"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={folderAsset(count, active)}
          alt=""
          width={64}
          height={56}
          className={`h-14 w-16 transition-transform group-hover:-translate-y-0.5 ${active ? '' : 'opacity-90 group-hover:opacity-100'}`}
        />
        <div className="flex items-end justify-center gap-0.5 whitespace-nowrap">
          <span
            className={`text-xs font-medium leading-none ${
              active
                ? 'text-sand-900 dark:text-sand-50'
                : 'text-sand-700 dark:text-sand-200'
            }`}
          >
            {label}
          </span>
          <span className="text-[10px] leading-none text-sand-600 dark:text-sand-500">({count})</span>
        </div>
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          aria-label={`Delete ${label} folder`}
          title={`Delete ${label}`}
          className="absolute right-2 top-0 flex h-5 w-5 items-center justify-center rounded-full border border-sand-200 bg-sand-100 text-sand-700 opacity-0 shadow-sm transition-all hover:border-red-400 hover:bg-red-500 hover:text-white focus-visible:opacity-100 group-hover:opacity-100 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-200 dark:hover:border-red-500 dark:hover:bg-red-600"
        >
          <X size={10} weight="bold" />
        </button>
      )}
    </div>
  )
}

function CollectionPicker({
  value,
  allNames,
  onChange,
}: {
  value: string | null
  allNames: string[]
  onChange: (value: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')

  function commit(name: string | null) {
    onChange(name)
    setOpen(false)
    setDraft('')
  }

  function commitDraft() {
    const trimmed = draft.trim()
    if (trimmed) commit(trimmed)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
          value
            ? 'border-olive-500/40 bg-olive-500/10 text-olive-600 dark:text-olive-400'
            : 'border-dashed border-sand-200 bg-transparent text-sand-600 hover:border-sand-300 hover:text-sand-700 dark:border-sand-700 dark:text-sand-500 dark:hover:border-sand-600 dark:hover:text-sand-300'
        }`}
      >
        {value ?? 'Add to collection'}
        <CaretDown size={10} weight="regular" className={`transition-transform ${open ? '-rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop closes the popover on outside click */}
          <button
            type="button"
            aria-label="Close collection picker"
            onClick={() => { setOpen(false); setDraft('') }}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute right-0 top-full z-40 mt-1 w-56 overflow-hidden rounded-lg border border-sand-200 bg-sand-100 shadow-lg dark:border-sand-700 dark:bg-sand-900">
            {value && (
              <button
                type="button"
                onClick={() => commit(null)}
                className="flex w-full items-center gap-2 border-b border-sand-200 px-3 py-2 text-xs font-medium text-sand-600 transition-colors hover:bg-sand-50 dark:border-sand-800 dark:text-sand-400 dark:hover:bg-sand-800"
              >
                <X size={12} weight="regular" />
                Remove from collection
              </button>
            )}
            <ul className="max-h-48 overflow-y-auto">
              {allNames.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => commit(name)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs font-medium transition-colors hover:bg-sand-50 dark:hover:bg-sand-800 ${
                      value === name
                        ? 'text-olive-600 dark:text-olive-400'
                        : 'text-sand-700 dark:text-sand-300'
                    }`}
                  >
                    {name}
                    {value === name && <Check size={12} weight="bold" />}
                  </button>
                </li>
              ))}
            </ul>
            <form
              onSubmit={(e) => { e.preventDefault(); commitDraft() }}
              className="flex items-center gap-1.5 border-t border-sand-200 bg-sand-100 px-2 py-2 dark:border-sand-800 dark:bg-sand-950"
            >
              <input
                type="text"
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="New collection…"
                className="flex-1 rounded-md border border-sand-200 bg-white px-2 py-1 text-base text-sand-900 outline-none focus:border-olive-500 md:text-xs dark:border-sand-700 dark:bg-sand-900 dark:text-sand-50"
                maxLength={40}
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                aria-label="Create collection"
                className="rounded-md bg-olive-500 p-1 text-sand-950 transition-colors hover:bg-olive-400 disabled:opacity-30"
              >
                <Plus size={12} weight="bold" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
