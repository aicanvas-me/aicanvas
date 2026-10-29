// Tells the two Andromeda systems apart at a glance, in the sidebar rail and on
// each overview eyebrow. Pro carries the cyan accent; Legacy names its license
// in neutral. Light text is cyan-700: at this 10px size cyan-600 read 3.7:1
// on the light page, under the 4.5:1 small text needs. A label, never a control: it has no hover state of its own.
// `label` overrides the short word where there is room to spell it out;
// `className` lets a tight row (the sidebar rail) run it narrower.
export function SystemTierChip({ tier, label, className = '' }: { tier: 'pro' | 'mit'; label?: string; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded px-1.5 py-px text-xxs font-semibold uppercase tracking-wider ring-1 ring-inset ${className} ${
        tier === 'pro'
          ? 'bg-cyan-500/10 text-cyan-700 ring-cyan-500/40 dark:text-cyan-400'
          : 'text-sand-600 ring-sand-300 dark:text-sand-400 dark:ring-sand-700'
      }`}
    >
      {label ?? (tier === 'pro' ? 'Premium' : 'MIT')}
    </span>
  )
}
