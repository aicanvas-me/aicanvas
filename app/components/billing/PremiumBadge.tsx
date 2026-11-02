'use client'

import { Bolt } from '@/app/_icons/icons/bolt'
import { premiumEnabled } from '../../../lib/flags'

/**
 * Small "Premium" pill for design systems and templates, in the premium orange
 * tint (same recipe as SystemTierChip). Renders nothing while the premium flag is off.
 */
export function PremiumBadge({ className = '', label = 'Premium' }: { className?: string; label?: string }) {
  if (!premiumEnabled()) return null

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-premium/10 px-2 py-0.5 text-[11px] font-semibold text-premium ring-1 ring-inset ring-premium/30 ${className}`}
    >
      <Bolt size={11} />
      {label}
    </span>
  )
}
