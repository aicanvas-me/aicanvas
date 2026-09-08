'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CaretDown } from '@phosphor-icons/react'
import { useSession } from './SessionProvider'
import { createClient } from '../../lib/supabase/client'
import { AccountMenuItems } from './AccountMenuItems'
import { EmailAvatar, photoFromUser } from './EmailAvatar'
import { usePaywallModal } from '../billing/PaywallModalProvider'
import { usePremiumStatus } from '../billing/usePremiumStatus'

export function UserMenu() {
  const { user } = useSession()
  const { open: openPaywall } = usePaywallModal()
  const status = usePremiumStatus()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  if (!user) return null

  const email = user.email ?? 'Account'

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-sand-700 transition-colors hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-800/60 dark:hover:text-sand-100"
      >
        <EmailAvatar email={email} photoUrl={photoFromUser(user)} className="h-6 w-6 text-xs" />
        <span className="flex-1 truncate text-left">{email}</span>
        <CaretDown size={12} weight="regular" className={`shrink-0 transition-transform ${open ? '-rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 overflow-hidden rounded-lg border border-sand-200 bg-sand-100 shadow-lg dark:border-sand-700 dark:bg-sand-900">
          <AccountMenuItems
            showUpgrade={status === 'not-premium'}
            onUpgrade={() => { setOpen(false); openPaywall({ reason: 'upgrade' }) }}
            onNavigate={() => setOpen(false)}
            onSignOut={signOut}
          />
        </div>
      )}
    </div>
  )
}
