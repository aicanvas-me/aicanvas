'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'

// "Not you?": signs this browser out (other devices stay signed in) and comes back to the
// same request through the sign-in page, so the right account can answer it.
export function SwitchAccount({ next }: { next: string }) {
  const [busy, setBusy] = useState(false)

  async function switchAccount() {
    setBusy(true)
    await createClient().auth.signOut({ scope: 'local' })
    window.location.assign(`/account/sign-in?next=${encodeURIComponent(next)}`)
  }

  return (
    <button
      type="button"
      onClick={switchAccount}
      disabled={busy}
      className="font-semibold text-olive-600 transition-colors hover:text-olive-800 disabled:opacity-50 dark:text-olive-400 dark:hover:text-olive-300"
    >
      {busy ? 'Signing out…' : 'Switch account'}
    </button>
  )
}
