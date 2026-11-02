// Tells the two Andromeda systems apart at a glance, in the sidebar rail and on
// each overview eyebrow. Pro wears the premium cyan, Legacy names its license in
// the free orange, and the rail's "New" takes the new purple. A label, never a
// control: it has no hover state of its own.
// `label` overrides the short word where there is room to spell it out;
// `className` lets a tight row (the sidebar rail) run it narrower.
const TONE = {
  pro: 'bg-premium/10 text-premium ring-premium/30',
  mit: 'bg-free/10 text-free ring-free/30',
  new: 'bg-new/10 text-new ring-new/30',
}

export function SystemTierChip({ tier, label, className = '' }: { tier: 'pro' | 'mit' | 'new'; label?: string; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-px text-xxs font-semibold uppercase tracking-wider ring-1 ring-inset ${className} ${TONE[tier]}`}
    >
      {label ?? (tier === 'pro' ? 'Premium' : tier === 'mit' ? 'MIT' : 'New')}
    </span>
  )
}
