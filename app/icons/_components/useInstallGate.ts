'use client'

import { usePaywallModal } from '@/app/components/billing/PaywallModalProvider'
import { usePremiumStatus } from '@/app/components/billing/usePremiumStatus'
import type { IconStyle } from '../_lib/types'

// Paid styles without Premium open the upgrade box; /r would install a placeholder.
export function useInstallGate(style: IconStyle) {
  const premiumStatus = usePremiumStatus()
  const { open: openPaywallModal } = usePaywallModal()
  const paid = style !== 'line'
  // 'unknown' (still loading) does not gate, so a subscriber's click is never swallowed.
  const needsPremium = paid && premiumStatus === 'not-premium'
  // Text on screen is stricter than the action: dots until Premium is confirmed.
  const masked = paid && premiumStatus !== 'premium'

  const askForPremium = () => openPaywallModal({ reason: 'premium-only' })

  /** True when the click opened the upgrade box instead. */
  const blocked = () => {
    if (needsPremium) askForPremium()
    return needsPremium
  }

  return { blocked, askForPremium, masked }
}
