'use client'

import { useMemo, useSyncExternalStore } from 'react'

// A signed-out buyer's checkout email, handed from the Paddle callback to
// /welcome so the page can say where the sign-in link went. Session storage
// only: it stays in this tab, never in a URL, and is ignored after the link's
// 1 hour.
const KEY = 'aic-checkout'
const MAX_AGE_MS = 60 * 60 * 1000

export type CheckoutHandoff = { email: string | null; lifetime: boolean }

export function rememberCheckout(handoff: CheckoutHandoff): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...handoff, at: Date.now() }))
  } catch {
    /* storage off: /welcome falls back to asking for the email */
  }
}

// The stored string while it is fresh, else null. A string, so React's snapshot
// comparison stays stable between reads.
function readFresh(): string | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    const at = raw ? JSON.parse(raw)?.at : null
    return typeof at === 'number' && Date.now() - at <= MAX_AGE_MS ? raw : null
  } catch {
    return null
  }
}

/** The browser that paid was signed in, so no one needs the address any more. */
export function forgetCheckout(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* storage off: nothing was kept */
  }
}

const noSubscribe = () => () => {}

/** undefined until the browser has been read (server render, hydration), then
 *  the handoff or null. */
export function useCheckoutHandoff(): CheckoutHandoff | null | undefined {
  const raw = useSyncExternalStore(noSubscribe, readFresh, () => undefined)
  return useMemo(() => {
    if (raw === undefined) return undefined
    if (raw === null) return null
    const v = JSON.parse(raw)
    return { email: typeof v.email === 'string' && v.email ? v.email : null, lifetime: v.lifetime === true }
  }, [raw])
}
