import Link from 'next/link'
import { Flask } from '@phosphor-icons/react/dist/ssr'
import { createClient } from '../../../lib/supabase/server'
import type { SerializedParticleConfig } from '../../../lab/_lib/preset/serialize'
import { LabPresetCard } from '../../../lab/_lib/preset/LabPresetCard'
import { buttonClasses } from '../../../components/buttonClasses'

// Made in Lab — lists the signed-in user's saved presets grouped by tool.
// Each card links back to the matching /lab/<tool>?preset=<id> page where
// the tool hydrates from the preset on mount.

type PresetRow = {
  id: string
  tool: string
  name: string
  config: SerializedParticleConfig
  created_at: string
  updated_at: string
}

const TOOL_NAMES: Record<string, string> = {
  '60k-particles': '60K Particles',
  'mesh-gradient': 'Mesh Gradient',
  'noise-field': 'Noise Field',
}

const TOOL_HREFS: Record<string, string> = {
  '60k-particles': '/lab/60k-particles',
  'mesh-gradient': '/lab/mesh-gradient',
  'noise-field': '/lab/noise-field',
}

export default async function MadeInLabPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('lab_presets')
    .select('id, tool, name, config, created_at, updated_at')
    .order('created_at', { ascending: false })

  const presets: PresetRow[] = error ? [] : ((data as PresetRow[]) ?? [])

  if (presets.length === 0) {
    return <EmptyState />
  }

  // Group by tool, preserving the created_at desc order within each group.
  const grouped = new Map<string, PresetRow[]>()
  for (const p of presets) {
    const list = grouped.get(p.tool) ?? []
    list.push(p)
    grouped.set(p.tool, list)
  }

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).map(([tool, rows]) => (
        <section key={tool}>
          <header className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">
              {TOOL_NAMES[tool] ?? tool}
            </h2>
            <span className="text-xs text-sand-600 dark:text-sand-500">{rows.length} preset{rows.length === 1 ? '' : 's'}</span>
          </header>
          <ul className="grid gap-3 sm:grid-cols-2">
            {rows.map((p) => (
              <li key={p.id}>
                <LabPresetCard
                  href={TOOL_HREFS[p.tool] ?? '/lab'}
                  name={p.name}
                  tool={p.tool}
                  createdAt={p.created_at}
                  config={p.config}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-sand-200 bg-sand-100/40 p-10 text-center dark:border-sand-800 dark:bg-sand-900/40">
      <Flask size={40} weight="regular" className="mx-auto text-sand-600 dark:text-sand-400" />
      <h2 className="mt-4 text-lg font-bold text-sand-900 dark:text-sand-50">Nothing saved yet</h2>
      <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">
        Experiment in a lab tool, save what you like. This page becomes your collection.
      </p>
      <div className="mt-5">
        <Link
          href="/lab"
          className={buttonClasses({ variant: 'primary', size: 'sm' })}
        >
          Open LAB
        </Link>
      </div>
    </div>
  )
}
