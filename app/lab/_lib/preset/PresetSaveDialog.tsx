'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from '@phosphor-icons/react'
import { Button } from '../../../components/Button'

// Lightweight name-input dialog. Styled to match the AuthModal (centered,
// backdrop blur, X close) so the lab feels visually coherent with the rest
// of the site. Used in two modes:
//   - "save"   → create a new preset (default copy)
//   - "rename" → rename an existing preset (caller passes title/description/cta)

type Props = {
  isOpen: boolean
  defaultName: string
  onSave: (name: string) => Promise<void> | void
  onCancel: () => void
  title?: string
  description?: string
  submitLabel?: string
  submittingLabel?: string
}

export function PresetSaveDialog({
  isOpen,
  defaultName,
  onSave,
  onCancel,
  title = 'Save preset',
  description = 'Name this tune so you can load it back any time.',
  submitLabel = 'Save preset',
  submittingLabel = 'Saving…',
}: Props) {
  const [name, setName] = useState(defaultName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setName(defaultName)
      setError(null)
      setSaving(false)
      // Focus + select on open so users can just type to replace the placeholder.
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }, [isOpen, defaultName])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Give your preset a name')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(trimmed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save preset')
      setSaving(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-sand-950/80 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-sand-300 bg-sand-50 p-8 shadow-2xl dark:border-sand-800 dark:bg-sand-900">
        <Button
          variant="icon"
          size="md"
          onClick={onCancel}
          aria-label="Close"
          className="absolute right-3 top-3"
        >
          <X weight="regular" size={18} />
        </Button>

        <h2 className="text-xl font-bold text-sand-900 dark:text-sand-50">{title}</h2>
        <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">{description}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="preset-name"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-sand-500"
            >
              Preset name
            </label>
            <input
              ref={inputRef}
              id="preset-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="e.g. Brand Blue Particles"
              className="w-full rounded-md border border-sand-300 bg-sand-100 px-3 py-2.5 text-base text-sand-900 placeholder:text-sand-400 focus:border-olive-500 focus:outline-none focus:ring-1 focus:ring-olive-500 md:text-sm dark:border-sand-700 dark:bg-sand-800 dark:text-sand-50"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500" role="alert">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="md" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={saving}>
              {saving ? submittingLabel : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
