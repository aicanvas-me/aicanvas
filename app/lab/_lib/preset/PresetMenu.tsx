'use client'

import { useEffect, useRef, useState } from 'react'
import { CaretDown, PencilSimple, Trash, FolderOpen } from '@phosphor-icons/react'
import { Button } from '../../../components/Button'

// "My presets" dropdown for in-tool preset switching. Lists the user's
// saved presets for the current tool, with per-row actions to rename and
// delete. Closes on outside click. The trigger always renders — when the
// user has no presets (or is signed out) the menu opens to an empty state.

export type PresetSummary = {
  id: string
  name: string
  updated_at: string
}

type Props = {
  presets: PresetSummary[]
  loading: boolean
  signedIn: boolean
  onLoad: (id: string) => void
  onRename: (id: string, currentName: string) => void
  onDelete: (id: string) => void
}

export function PresetMenu({ presets, loading, signedIn, onLoad, onRename, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        size="xs"
        fullWidth
        onClick={() => setOpen((v) => !v)}
        className="relative"
      >
        <FolderOpen size={12} weight="regular" />
        My presets
        {signedIn && presets.length > 0 && (
          <span className="text-sand-500">({presets.length})</span>
        )}
        <CaretDown
          size={12}
          weight="regular"
          className={`absolute right-3 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </Button>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-72 overflow-y-auto rounded-md border border-sand-300 bg-sand-100 shadow-lg dark:border-sand-700 dark:bg-sand-900">
          {!signedIn && (
            <p className="px-3 py-3 text-xs text-sand-500">
              Sign in to save and reload your tunes.
            </p>
          )}
          {signedIn && loading && (
            <p className="px-3 py-3 text-xs text-sand-500">Loading…</p>
          )}
          {signedIn && !loading && presets.length === 0 && (
            <p className="px-3 py-3 text-xs text-sand-500">
              No presets yet. Tune your particles, then hit Save preset.
            </p>
          )}
          {signedIn && presets.length > 0 && (
            <ul className="py-1">
              {presets.map((p) => (
                <PresetRow
                  key={p.id}
                  preset={p}
                  onLoad={() => {
                    onLoad(p.id)
                    setOpen(false)
                  }}
                  onRename={() => {
                    onRename(p.id, p.name)
                    setOpen(false)
                  }}
                  onDelete={() => {
                    onDelete(p.id)
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function PresetRow({
  preset,
  onLoad,
  onRename,
  onDelete,
}: {
  preset: PresetSummary
  onLoad: () => void
  onRename: () => void
  onDelete: () => void
}) {
  return (
    <li className="flex items-center gap-1 px-1">
      <button
        type="button"
        onClick={onLoad}
        className="flex-1 truncate rounded px-2 py-1.5 text-left text-sm text-sand-800 hover:bg-sand-50 dark:text-sand-100 dark:hover:bg-sand-800"
        title={preset.name}
      >
        {preset.name}
      </button>
      <button
        type="button"
        onClick={onRename}
        aria-label={`Rename ${preset.name}`}
        title="Rename"
        className="rounded p-1.5 text-sand-500 transition-colors hover:bg-sand-50 hover:text-sand-900 dark:hover:bg-sand-800 dark:hover:text-sand-100"
      >
        <PencilSimple size={14} weight="regular" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${preset.name}`}
        title="Delete"
        className="rounded p-1.5 text-sand-500 transition-colors hover:bg-red-500/10 hover:text-red-500"
      >
        <Trash size={14} weight="regular" />
      </button>
    </li>
  )
}
