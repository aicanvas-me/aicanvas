'use client'

import { useEffect, useState } from 'react'
import { useSession } from '../components/auth/SessionProvider'

// The signed-in user's registry token, refetched on focus so a token rotated
// in another tab is not left stale here. null without a session, and never
// another account's token after a sign-out and sign-in in the same tab.
export function useInstallToken(): string | null {
  const { user } = useSession()
  const [entry, setEntry] = useState<{ userId: string; token: string | null } | null>(null)
  useEffect(() => {
    if (!user) return
    const userId = user.id
    let cancelled = false
    const refresh = () =>
      fetch('/api/me/token')
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) setEntry({ userId, token: d?.token ?? null })
        })
        .catch(() => {})
    refresh()
    window.addEventListener('focus', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('focus', refresh)
    }
  }, [user])
  return user && entry?.userId === user.id ? entry.token : null
}
