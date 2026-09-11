// Tells the two Andromeda systems apart at a glance, in the sidebar rail and on
// each overview eyebrow. Pro carries the cyan accent; Legacy names its license
// in neutral. A label, never a control: it has no hover state of its own.
export function SystemTierChip({ tier }: { tier: 'pro' | 'mit' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded px-1.5 py-px text-xxs font-semibold uppercase tracking-wider ring-1 ring-inset ${
        tier === 'pro'
          ? 'bg-cyan-500/10 text-cyan-600 ring-cyan-500/40 dark:text-cyan-400'
          : 'text-sand-600 ring-sand-300 dark:text-sand-400 dark:ring-sand-700'
      }`}
    >
      {tier === 'pro' ? 'Pro' : 'MIT'}
    </span>
  )
}
