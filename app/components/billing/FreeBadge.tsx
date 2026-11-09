import { BadgeCheck } from '@/app/_icons/icons/badge-check'

/** The "Free" pill beside a free item's title, the counterpart of the Premium one. */
export function FreeBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-free/10 px-3 py-1 text-sm font-semibold text-free ring-1 ring-inset ring-free/30">
      <BadgeCheck size={14} />
      Free
    </span>
  )
}
