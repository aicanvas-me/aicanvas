'use client'

import { Bolt } from '@/app/_icons'
import { premiumEnabled } from '../../../lib/flags'

/**
 * Small accent "Premium" pill for design systems and templates.
 * The accent fill pairs with text-accent-foreground, never a raw white or black.
 * Renders nothing while the premium flag is off.
 */
export function PremiumBadge({ className = '', label = 'Premium' }: { className?: string; label?: string }) {
  if (!premiumEnabled()) return null

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground ${className}`}
    >
      <Bolt size={11} />
      {label}
    </span>
  )
}
