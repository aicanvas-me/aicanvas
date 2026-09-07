import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import type { SavedComponent } from '../../../lib/supabase/types'
import { COMPONENTS } from '../../../lib/component-registry'
import { getAndromedaComponentMeta } from '../../../_lib/andromeda/andromeda-meta'
import { optimizeImageKitUrl } from '../../../lib/imagekit'
import { buttonClasses } from '../../../components/buttonClasses'
import { SavedList, type SavedRow } from './SavedList'

export default async function SavedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Try the full select; fall back to the pre-migration shape so existing
  // saves still surface during the brief window after deploying the code
  // and before applying migration 0002 (which adds the `collection` column).
  let raw: Pick<SavedComponent, 'slug' | 'system' | 'collection' | 'saved_at'>[] = []
  const full = await supabase
    .from('saved_components')
    .select('slug, system, collection, saved_at')
    .order('saved_at', { ascending: false })
  if (full.error) {
    const legacy = await supabase
      .from('saved_components')
      .select('slug, system, saved_at')
      .order('saved_at', { ascending: false })
    raw = (legacy.data ?? []).map((r: { slug: string; system: string | null; saved_at: string }) => ({ ...r, collection: null }))
  } else {
    raw = (full.data ?? []) as Pick<SavedComponent, 'slug' | 'system' | 'collection' | 'saved_at'>[]
  }

  if (raw.length === 0) {
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

  // Enrich each row with a name + thumbnail so SavedList can render the card
  // without a second client-side lookup. Andromeda system components aren't
  // in COMPONENTS (only the free `andromeda-button` standalone is) — those
  // are looked up in the Andromeda metadata instead. Design-system templates
  // are in neither and fall through to the bare slug.
  const bySlug = new Map(COMPONENTS.map((c) => [c.slug, c]))
  const rows: SavedRow[] = raw.map((r) => {
    const entry = bySlug.get(r.slug)
    const andromedaEntry = !entry && r.system === 'andromeda' ? getAndromedaComponentMeta(r.slug) : undefined
    return {
      ...r,
      name: entry?.name ?? andromedaEntry?.name ?? r.slug,
      image: entry?.image
        ? optimizeImageKitUrl(entry.image, 'thumb')
        : andromedaEntry?.image
          ? optimizeImageKitUrl(andromedaEntry.image, 'thumb')
          : null,
    }
  })

  return <SavedList initial={rows} />
}
