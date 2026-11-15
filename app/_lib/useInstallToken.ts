'use client'

import { useEffect, useState } from 'react'
import { useSession } from '../components/auth/SessionProvider'

// Stands in for a signed-in user's token while it loads; copyText swaps the real one in.
export const PENDING_INSTALL_TOKEN = 'aic_pending_install_token'

let latest: Promise<string | null> | null = null
let known: { userId: string; token: string | null } | null = null

// The signed-in user's registry token, refetched on focus so a token rotated
// in another tab is not left stale here. null without a session, and never
// another account's token after a sign-out and sign-in in the same tab.
export function useInstallToken(): string | null {
  const { user } = useSession()
  const [entry, setEntry] = useState(known)
  useEffect(() => {
    if (!user) return
    const userId = user.id
    let cancelled = false
    const refresh = () => {
      const token = fetch('/api/me/token')
        .then((r) => r.json())
        .then((d) => (d?.token ?? null) as string | null, () => null)
      latest = token
      void token.then((t) => {
        known = { userId, token: t }
        if (!cancelled) setEntry(known)
      })
    }
    refresh()
    window.addEventListener('focus', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('focus', refresh)
    }
  }, [user])
  if (!user) return null
  return entry?.userId === user.id ? entry.token : PENDING_INSTALL_TOKEN
}

// Waits for the token, then fills it in. No token: the caller's tokenless text,
// or the plain @aicanvas command for the registry URL form.
export async function resolveInstallToken(text: string, noTokenText?: string): Promise<string> {
  const token = await (latest ?? null)
  if (token) return text.replaceAll(PENDING_INSTALL_TOKEN, token)
  if (noTokenText !== undefined) return noTokenText
  return text.replace(/"https:\/\/aicanvas\.me\/r\/([^"?]+)\.json\?token=aic_pending_install_token"/g, '@aicanvas/$1')
}
