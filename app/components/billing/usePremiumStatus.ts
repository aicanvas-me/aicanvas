'use client'

import { useEffect, useState } from 'react'
import { useSession } from '../auth/SessionProvider'

export type PremiumStatus = 'unknown' | 'premium' | 'not-premium'

/**
 * Client-side premium status via /api/me/entitlement (session-scoped). Returns
 * 'unknown' while loading or on a backend error so callers can avoid flashing
 * the wrong CTA; signed-out derives to 'not-premium' at render.
 */
export function usePremiumStatus(): PremiumStatus {
  const { user } = useSession()
  const [fetched, setFetched] = useState<PremiumStatus>('unknown')

  useEffect(() => {
    if (!user) return
    let cancelled = false
    fetch('/api/me/entitlement')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => { if (!cancelled) setFetched(d?.tier === 'premium' ? 'premium' : 'not-premium') })
      .catch(() => { if (!cancelled) setFetched('unknown') })
    return () => { cancelled = true }
  }, [user])

  return user ? fetched : 'not-premium'
}
