'use client'

import { useAuthModal } from '@/app/components/auth/AuthModalProvider'
import { useSession } from '@/app/components/auth/SessionProvider'
import { usePaywallModal } from '@/app/components/billing/PaywallModalProvider'
import { usePremiumStatus } from '@/app/components/billing/usePremiumStatus'
import type { IconStyle } from '../_lib/types'

// The component page's install rules, for icons. /r answers a viewer it will
// not serve with a placeholder file, not an error, so the install actions open
// the sign-up box (Line, signed out) or the upgrade box (a paid style without
// Premium) instead of copying a command that installs a stub.
export function useInstallGate(style: IconStyle, freeAccountGate: boolean) {
  const { user } = useSession()
  const premiumStatus = usePremiumStatus()
  const { open: openAuthModal } = useAuthModal()
  const { open: openPaywallModal } = usePaywallModal()
  const paid = style !== 'line'
  // 'unknown' (still loading) does not gate, so a subscriber's click is never swallowed.
  const needsPremium = paid && premiumStatus === 'not-premium'
  const needsAccount = !paid && freeAccountGate && !user
  // Text on screen is stricter than the action: dots until Premium is confirmed.
  const masked = paid && premiumStatus !== 'premium'

  const askForPremium = () => openPaywallModal({ reason: 'premium-only' })

  /** True when the click opened the sign-up or upgrade box instead. */
  const blocked = () => {
    if (needsPremium) {
      askForPremium()
      return true
    }
    if (needsAccount) {
      openAuthModal({
        mode: 'gate',
        next: `${window.location.pathname}${window.location.search}`,
        title: 'Grab this free icon.',
        subtitle: 'Sign in or create a free account to install with one command. Free and unlimited.',
      })
      return true
    }
    return false
  }

  return { blocked, askForPremium, masked, needsAccount }
}
