/** Pure flag reader. Pass the raw env value; defaults to off. */
export function isPremiumEnabled(raw: string | undefined): boolean {
  return raw === 'true'
}

/** Master switch and kill switch for all premium UI. NEXT_PUBLIC_ so client
 *  components can branch on it; the value is inlined at build time. */
export function premiumEnabled(): boolean {
  return isPremiumEnabled(process.env.NEXT_PUBLIC_PREMIUM_ENABLED)
}

/** Pure reader for the checkout coming-soon flag; defaults to off. */
function isCheckoutComingSoon(raw: string | undefined): boolean {
  return raw === 'true'
}

/** Renders the upgrade CTA as a disabled "Coming soon" button even when Paddle
 *  is configured. NEXT_PUBLIC_ so the client button can branch. */
export function checkoutComingSoon(): boolean {
  return isCheckoutComingSoon(process.env.NEXT_PUBLIC_CHECKOUT_COMING_SOON)
}
