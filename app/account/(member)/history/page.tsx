import Link from 'next/link'
import { History } from '@/app/_icons'
import { createClient } from '../../../lib/supabase/server'
import type { InstallHistoryRow } from '../../../lib/supabase/types'
import { COMPONENTS } from '../../../lib/component-registry'
import { getAndromedaComponentMeta } from '../../../_lib/andromeda/andromeda-meta'
import { getAndromedaComponentMeta as getAndromedaProComponentMeta } from '../../../_lib/andromeda-pro/andromeda-meta'
import { itemHref, resolveRetiredSlug } from '../itemHref'
import { optimizeImageKitUrl } from '../../../lib/imagekit'
import { CARD } from '../../../components/PageKit'

// ─── Activity page ──────────────────────────────────────────────────────────
// Mirrors the visual rhythm of /account/saved — individual row cards with a
// small gap, thumbnail at the start, component name + subtitle, relative
// timestamp on the right. The underlying route is still /account/history
// (label was renamed to "Activity" in AccountTabs; the URL stays for now).

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Shared column rhythm — same on the header strip and every row card so the
// labels line up with their values. Each row card is its own grid, so we
// can't let any column be `auto` (it'd size to its own row's content and
// throw off the header alignment) — all column widths are fixed or fr-based
// off a fixed budget. Thumb column matches w-14; the When column is sized
// to fit the longest realistic date ("May 11, 2026"). Below `sm:` the System
// and Manager columns fold into a line under the name (ROW_META), which gives
// the name the width a phone does not have for five columns.
const ROW_GRID =
  'grid grid-cols-[3.5rem_minmax(0,1fr)_6rem] items-center gap-3 sm:grid-cols-[3.5rem_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_8rem] sm:gap-4'
const ROW_META = 'hidden truncate text-sm text-sand-600 sm:block dark:text-sand-400'

function ActivityThumbnail({ src }: { src: string | null }) {
  return (
    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-inset bg-sand-950 ring-1 ring-sand-200 dark:ring-sand-800">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      ) : null}
    </div>
  )
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('install_history')
    .select('*')
    .order('copied_at', { ascending: false })
    .limit(100)

  const rows = (data as InstallHistoryRow[] | null) ?? []

  if (rows.length === 0) {
    return (
      <div className={`${CARD} px-6 py-14 text-center sm:py-16`}>
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-card border border-sand-200 bg-sand-50 text-sand-600 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-400">
          <History size={22} />
        </div>
        <p className="mx-auto max-w-md text-balance text-sm leading-relaxed text-sand-600 dark:text-sand-400">
          No install history yet. Copy a CLI command from any component and it&apos;ll show up here.
        </p>
      </div>
    )
  }

  // Enrich each row with a name + thumbnail (same pattern as saved/page.tsx).
  // Andromeda system components aren't in COMPONENTS — those resolve via the
  // Andromeda metadata instead (the retired `andromeda-button` standalone slug
  // is aliased to the Legacy Button by resolveRetiredSlug). Design-system
  // templates are in neither and fall through to the bare slug + neutral
  // placeholder thumbnail.
  const bySlug = new Map(COMPONENTS.map((c) => [c.slug, c]))

  return (
    <div>
      {/* Header strip — column labels above the row cards, sharing the same
          grid template so each label sits over its column of values. The
          transparent border mirrors the row card's 1px border so the inner
          content sits at the same x-position in both. */}
      <div
        className={`${ROW_GRID} border border-transparent px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-sand-600 sm:px-4 dark:text-sand-400`}
      >
        {/* Component label spans the thumbnail column + name column so it
            sits at the far left, above where the thumbnail starts. */}
        <div className="col-span-2">Component</div>
        <div className="hidden sm:block">System</div>
        <div className="hidden sm:block">Manager</div>
        <div className="text-right">When</div>
      </div>

      <ul className="space-y-2">
        {rows.map((row) => {
          const entry = bySlug.get(row.slug)
          const resolved = resolveRetiredSlug(row)
          const andromedaEntry = entry
            ? undefined
            : resolved.system === 'andromeda'
              ? getAndromedaComponentMeta(resolved.slug)
              : resolved.system === 'andromeda-pro'
                ? getAndromedaProComponentMeta(resolved.slug)
                : undefined
          const name = entry?.name ?? andromedaEntry?.name ?? row.slug
          const image = entry?.image
            ? optimizeImageKitUrl(entry.image, 'thumb')
            : andromedaEntry?.image
              ? optimizeImageKitUrl(andromedaEntry.image, 'thumb')
              : null
          return (
            <li key={row.id}>
              <Link
                href={itemHref(row)}
                className={`${ROW_GRID} group rounded-card border border-sand-200 bg-sand-100 px-3 py-3 transition-colors hover:border-sand-300 sm:px-4 dark:border-sand-800 dark:bg-sand-900 dark:hover:border-sand-700`}
                aria-label={`Open ${name}`}
              >
                <ActivityThumbnail src={image} />
                <div className="min-w-0">
                  <div className="truncate font-semibold text-sand-900 transition-colors group-hover:text-accent dark:text-sand-50">{name}</div>
                  <div className="mt-0.5 truncate text-xs text-sand-600 sm:hidden dark:text-sand-400">
                    {[row.system, row.pkg_manager].filter(Boolean).join(' · ') || '—'}
                  </div>
                </div>
                <div className={ROW_META}>
                  {row.system ?? '—'}
                </div>
                <div className={ROW_META}>
                  {row.pkg_manager ?? '—'}
                </div>
                <time
                  dateTime={row.copied_at}
                  className="shrink-0 whitespace-nowrap text-right text-xs font-medium text-sand-600 dark:text-sand-400"
                >
                  {formatTimestamp(row.copied_at)}
                </time>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
