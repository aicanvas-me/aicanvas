'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TriangleAlert } from '@/app/_icons/icons/triangle-alert'
import { createClient } from '../../../lib/supabase/client'
import { Button } from '../../../components/Button'

// ─── DeleteAccountSection ─────────────────────────────────────────────────────
// GDPR Art. 17 right-to-erasure surface inside /account/settings.
//
// Two-step confirmation: first click reveals an inline "Are you sure?" prompt
// with explicit "Delete forever" + "Cancel" buttons. The actual delete calls
// the public.delete_my_account() Postgres function (security definer) which
// removes the auth.users row; ON DELETE CASCADE drops saved_components,
// install_history, and user_preferences automatically.
//
// We do not need the Supabase service-role key on the client thanks to the
// SQL function — the regular publishable key + an authenticated session are
// enough for the user to call rpc('delete_my_account').

export function DeleteAccountSection() {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    const supabase = createClient()

    const { error: rpcError } = await supabase.rpc('delete_my_account')
    if (rpcError) {
      setError(rpcError.message)
      setDeleting(false)
      return
    }

    // Best-effort sign-out to clear the local session cookie. The server-side
    // session is already invalid because auth.users no longer holds the row,
    // so failure here is harmless — we just want to clear cookies.
    try {
      await supabase.auth.signOut()
    } catch {
      // ignore
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="rounded-section border border-red-500/30 bg-red-500/5 p-6 sm:p-8 dark:border-red-500/20">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 text-red-700 dark:text-red-400">
          <TriangleAlert size={20} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold tracking-tight text-sand-900 dark:text-sand-50">Danger zone</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-sand-600 dark:text-sand-400">
            Permanently delete your AI Canvas account, your saved components,
            install history, and preferences. This cannot be undone.
          </p>

          {!confirming ? (
            <Button
              variant="destructive"
              tone="outline"
              size="sm"
              onClick={() => setConfirming(true)}
              className="mt-5"
            >
              Delete my account
            </Button>
          ) : (
            <div className="mt-5 space-y-3">
              <p className="text-sm font-semibold text-sand-900 dark:text-sand-50">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="destructive"
                  tone="solid"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : 'Delete forever'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setConfirming(false)
                    setError(null)
                  }}
                  disabled={deleting}
                >
                  Cancel
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
