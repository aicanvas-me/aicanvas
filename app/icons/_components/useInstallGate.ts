'use client'

import { usePaywallModal } from '@/app/components/billing/PaywallModalProvider'
import { usePremiumStatus } from '@/app/components/billing/usePremiumStatus'
import type { IconStyle } from '../_lib/types'

// Line installs for everyone, no account. A paid style without Premium gets a
// placeholder file from /r, not an error, so its install actions open the
// upgrade box instead of copying a command that installs a stub.
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
