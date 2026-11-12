'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckoutSplit } from './CheckoutSplit'
import { getPaddle, PRICES, type BillingCycle } from '../../lib/paddle/client'
import { useSession } from '../auth/SessionProvider'
import { track } from '../../lib/analytics'
import { checkoutComingSoon } from '../../../lib/flags'

/**
 * Opens the split checkout for the chosen cycle, or the one-time Lifetime. No account is required up
 * front: signed-out users check out anonymously (Paddle collects the email),
 * and the webhook provisions the account from that email, then emails a
 * magic-link claim. Signed-in users pass customData.user_id so the webhook +
 * activation endpoint attribute the sale to the existing account.
 */
export function UpgradeButton({
  cycle,
  children,
  className,
}: {
  cycle: BillingCycle
  children: React.ReactNode
  className?: string
}) {
  const { user } = useSession()

  // Checkout is only possible once the Paddle env is configured. When the flag
  // is on (or env is not configured), the CTA renders as a dormant "Coming soon"
  // button rather than opening a broken/erroring overlay.
  const configured = Boolean(PRICES[cycle] && process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN)
  const comingSoon = checkoutComingSoon() || !configured

  const [open, setOpen] = useState(false)
  const [promo, setPromo] = useState<string>()
  const close = useCallback(() => setOpen(false), [])
  const ref = useRef<HTMLButtonElement>(null)

  // Paddle.js loads as a buy button nears the screen, so checkout skips that wait
  useEffect(() => {
    const el = ref.current
    if (comingSoon || !el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        getPaddle()
        observer.disconnect()
      },
      { rootMargin: '400px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [comingSoon])

  function onClick() {
    if (comingSoon) return
    if (cycle === 'lifetime') track('Lifetime Click', {})
    else track('Subscribe Click', { cycle })
    // A ?promo=CODE in the URL is passed as discountCode and applied silently.
    // Paddle ignores an unknown code and opens at full price, so no validation here.
    //
    // Signed-in: attribute the sale to the account up front (user_id + email).
    // Signed-out: open anonymously, Paddle collects the email itself and the
    // webhook keys the new/linked account off it (no user_id to pass).
    // Lifetime never takes a promo code.
    setPromo(cycle === 'lifetime' ? undefined : new URLSearchParams(window.location.search).get('promo')?.trim() || undefined)
    setOpen(true)
  }

  return (
    <>
      <button
        ref={ref}
        type="button"
        className={className}
        onClick={onClick}
        disabled={comingSoon}
        aria-disabled={comingSoon}
        title={comingSoon ? 'Available soon' : undefined}
      >
        {comingSoon ? 'Coming soon' : children}
      </button>
      {open && (
        <CheckoutSplit cycle={cycle} email={user?.email} userId={user?.id} discountCode={promo} onClose={close} />
      )}
    </>
  )
}
