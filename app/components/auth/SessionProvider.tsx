'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '../../lib/supabase/client'
import type { AiPlatform, PackageManager } from '../../lib/supabase/types'

type Preferences = {
  package_manager: PackageManager | null
  ai_platform: AiPlatform | null
  newsletter_opt_in: boolean
}

// newsletter_opt_in mirrors newsletter_subscribers.status === 'subscribed'
// (migration 0015): explicit opt-in, so it's only true once the user turns
// the toggle on in /account/settings.
const EMPTY_PREFS: Preferences = {
  package_manager: null,
  ai_platform: null,
  newsletter_opt_in: false,
}

type SessionContextValue = {
  user: User | null
  savedSlugs: Set<string>
  preferences: Preferences
  loading: boolean
  refreshSaved: () => Promise<void>
  toggleSaved: (slug: string, system: string | null) => Promise<void>
  updatePreferences: (next: Partial<Preferences>) => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({
  children,
  initialUser,
}: {
  children: ReactNode
  initialUser: User | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set())
  const [preferences, setPreferences] = useState<Preferences>(EMPTY_PREFS)
  const [loading, setLoading] = useState(false)

  const refreshSaved = useCallback(async () => {
    if (!user) {
      setSavedSlugs(new Set())
      setPreferences(EMPTY_PREFS)
      return
    }
    setLoading(true)
    try {
      const [savedRes, prefsRes] = await Promise.all([
        fetch('/api/saved', { method: 'GET' }),
        fetch('/api/preferences', { method: 'GET' }),
      ])
      if (savedRes.ok) {
        const { slugs } = await savedRes.json()
        setSavedSlugs(new Set(slugs))
      }
      if (prefsRes.ok) {
        const { preferences: prefs } = await prefsRes.json()
        if (prefs) setPreferences({
          package_manager: prefs.package_manager ?? null,
          ai_platform: prefs.ai_platform ?? null,
          newsletter_opt_in: prefs.newsletter_opt_in ?? false,
        })
      }
    } catch {
      // Network failure — leave the prior state in place.
    } finally {
      setLoading(false)
    }
  }, [user])

  const updatePreferences = useCallback(async (next: Partial<Preferences>) => {
    if (!user) return
    const prev = preferences
    setPreferences({ ...prev, ...next }) // optimistic
    try {
      // Send only the changed fields so we never clobber values that haven't
      // loaded into local state yet (e.g. a fast click before GET resolves).
      // The server route mirrors this and only writes fields it received.
      const res = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(next),
      })
      // fetch resolves on HTTP 4xx/5xx — roll back the optimistic state on
      // those too, or the UI shows a change the server rejected.
      if (!res.ok) setPreferences(prev)
    } catch {
      setPreferences(prev)
    }
  }, [user, preferences])

  const toggleSaved = useCallback(async (slug: string, system: string | null) => {
    if (!user) return
    const isSaved = savedSlugs.has(slug)
    setSavedSlugs((prev) => {
      const next = new Set(prev)
      if (isSaved) next.delete(slug)
      else next.add(slug)
      return next
    })
    try {
      await fetch('/api/saved', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug, system }),
      })
    } catch {
      // Roll back the optimistic update on network failure.
      setSavedSlugs((prev) => {
        const next = new Set(prev)
        if (isSaved) next.add(slug)
        else next.delete(slug)
        return next
      })
    }
  }, [user, savedSlugs])

  useEffect(() => {
    void refreshSaved()
  }, [refreshSaved])

  useEffect(() => {
    const supabase = createClient()
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const next = session?.user ?? null
      // A token refresh delivers the same user as a new object; keep the old
      // reference so everything keyed on `user` does not refetch every hour.
      setUser((prev) => (event !== 'USER_UPDATED' && prev?.id === next?.id ? prev : next))
    })
    return () => data.subscription.unsubscribe()
  }, [])

  return (
    <SessionContext.Provider
      value={{ user, savedSlugs, preferences, loading, refreshSaved, toggleSaved, updatePreferences }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within <SessionProvider>')
  return ctx
}
