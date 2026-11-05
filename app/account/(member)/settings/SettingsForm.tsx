'use client'

import { useState } from 'react'
import { Check } from '@/app/_icons/icons/check'
import { useSession } from '../../../components/auth/SessionProvider'
import { Toggle } from '../../../components/Toggle'
import { CARD } from '../../../components/PageKit'
import type { PackageManager } from '../../../lib/supabase/types'

const PACKAGE_MANAGERS: PackageManager[] = ['pnpm', 'npm', 'yarn', 'bun']

// The ai_platform preference (and its Supabase column) still exists in the
// backend but is no longer collected: components ship ONE platform-agnostic
// Remix prompt, so there is no multi-platform drawer left to sort.
type Initial = {
  package_manager: PackageManager | null
  newsletter_opt_in: boolean
}

// Two preferences with autosave-on-click. The visible state of the control
// (active pill, on/off switch) is its own confirmation; no separate "Saved"
// tick is rendered.
export function SettingsForm({ initial }: { initial: Initial }) {
  const { updatePreferences } = useSession()
  const [pkg, setPkg] = useState<PackageManager | null>(initial.package_manager)
  const [newsletter, setNewsletter] = useState<boolean>(initial.newsletter_opt_in)

  async function selectPkg(value: PackageManager | null) {
    setPkg(value)
    await updatePreferences({ package_manager: value })
  }

  async function selectNewsletter(value: boolean) {
    setNewsletter(value)
    await updatePreferences({ newsletter_opt_in: value })
  }

  return (
    <div className="space-y-6">
      <Field
        label="Preferred package manager"
        description="The CLI install drawer opens with this selected."
        value={pkg}
        options={PACKAGE_MANAGERS}
        onSelect={selectPkg}
      />

      <BooleanField
        label="Product updates"
        description="Occasional emails about AI Canvas: new components, design-system releases, MCP changes. Transactional emails (sign-up confirmation, magic links, password reset) are unaffected."
        value={newsletter}
        onSelect={selectNewsletter}
      />
    </div>
  )
}

// Pill button — active state shows an inline check before the label.
function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-control border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? 'border-accent bg-accent/15 text-accent'
          : 'border-sand-200 bg-sand-100 text-sand-700 hover:border-sand-300 hover:text-sand-900 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-300 dark:hover:border-sand-600 dark:hover:text-sand-100'
      }`}
    >
      {active && <Check size={12} />}
      {children}
    </button>
  )
}

// Each field is its own card surface so the preferences don't read as one
// undifferentiated block — title + description sit on the site's card
// (sand-100, sand-900 dark) with the same padding as every account card.
function Field<T extends string>({
  label,
  description,
  value,
  options,
  onSelect,
}: {
  label: string
  description: string
  value: T | null
  options: readonly T[]
  onSelect: (value: T | null) => Promise<void>
}) {
  async function handle(opt: T) {
    const active = value === opt
    await onSelect(active ? null : opt)
  }

  return (
    <div className={`${CARD} p-6 sm:p-8`}>
      <h2 className="text-lg font-bold tracking-tight text-sand-900 dark:text-sand-50">{label}</h2>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-sand-600 dark:text-sand-400">{description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {options.map((opt) => (
          <Pill key={opt} active={value === opt} onClick={() => handle(opt)}>
            {opt}
          </Pill>
        ))}
      </div>
    </div>
  )
}

// Boolean variant of Field — a single switch, strict on/off (no null state).
// The toggle's own colour communicates state. It sits level with the title on
// the right, the way a settings switch reads, instead of alone on a row of its
// own under the description.
function BooleanField({
  label,
  description,
  value,
  onSelect,
}: {
  label: string
  description: string
  value: boolean
  onSelect: (value: boolean) => Promise<void>
}) {
  return (
    <div className={`${CARD} flex items-start justify-between gap-6 p-6 sm:p-8`}>
      <div className="min-w-0">
        <h2 className="text-lg font-bold tracking-tight text-sand-900 dark:text-sand-50">{label}</h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-sand-600 dark:text-sand-400">{description}</p>
      </div>
      <div className="shrink-0 pt-0.5">
        <Toggle checked={value} onCheckedChange={onSelect} aria-label={label} />
      </div>
    </div>
  )
}
