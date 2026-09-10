'use client'

import Link from 'next/link'
import { PresetThumb } from './PresetThumb'
import { summarizeParticleConfig, type SerializedParticleConfig } from './serialize'

// One card on the Made-in-Lab tab. Lives in a client component because the
// thumbnail is interactive (mounts a WebGL canvas via IntersectionObserver).
// The whole card is wrapped in a Link so clicking anywhere navigates to
// the matching lab tool.

type Props = {
  href: string
  name: string
  tool: string
  createdAt: string
  config: SerializedParticleConfig
}

export function LabPresetCard({ href, name, tool, createdAt, config }: Props) {
  const summary = tool === '60k-particles' ? summarizeParticleConfig(config) : ''

  return (
    <Link
      href={href}
      className="block h-full rounded-xl border border-sand-300 bg-sand-50 p-3 transition-colors hover:border-sand-400 dark:border-sand-800 dark:bg-sand-900 dark:hover:border-sand-700"
    >
      {tool === '60k-particles' ? (
        <PresetThumb serialized={config} />
      ) : (
        <div
          className="h-[120px] w-full rounded-md"
          style={{ background: config.backgroundColor }}
        />
      )}

      <div className="px-2 pb-1 pt-3">
        <h3 className="mb-1 truncate text-base font-semibold text-sand-900 dark:text-sand-50" title={name}>
          {name}
        </h3>
        <p className="mb-2 text-xs text-sand-500">
          Saved {new Date(createdAt).toLocaleDateString()}
        </p>
        <p className="text-xs text-sand-600 dark:text-sand-400">{summary}</p>
      </div>
    </Link>
  )
}
