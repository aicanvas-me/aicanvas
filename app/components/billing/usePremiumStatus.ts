'use client'

import { useEffect, useState } from 'react'
import { useSession } from '../auth/SessionProvider'

export type PremiumStatus = 'unknown' | 'premium' | 'not-premium'

export interface PremiumDetails {
  status: PremiumStatus
  /** The account holds Lifetime (false while unknown or signed out). */
  lifetime: boolean
}

/**
 * Client-side premium status via /api/me/entitlement (session-scoped), with the
 * Lifetime flag. status is 'unknown' while loading or on a backend error so
 * callers can avoid flashing the wrong CTA; signed-out derives to 'not-premium'
 * at render.
 */
export function usePremiumDetails(): PremiumDetails {
  const { user } = useSession()
  const [fetched, setFetched] = useState<PremiumDetails>({ status: 'unknown', lifetime: false })

  useEffect(() => {
    if (!user) return
    let cancelled = false
    fetch('/api/me/entitlement')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        if (!cancelled) {
          setFetched({ status: d?.tier === 'premium' ? 'premium' : 'not-premium', lifetime: d?.lifetime === true })
        }
      })
      .catch(() => { if (!cancelled) setFetched({ status: 'unknown', lifetime: false }) })
    return () => { cancelled = true }
  }, [user])

  return user ? fetched : { status: 'not-premium', lifetime: false }
}

/** The premium status alone, for callers that do not care how it was bought. */
export function usePremiumStatus(): PremiumStatus {
  return usePremiumDetails().status
}
