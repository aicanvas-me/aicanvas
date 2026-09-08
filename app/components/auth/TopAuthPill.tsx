'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { CaretUpDown, SignIn } from '@phosphor-icons/react'
import { useSession } from './SessionProvider'
import { useAuthModal } from './AuthModalProvider'
import { createClient } from '../../lib/supabase/client'
import { Button } from '../Button'
import { AccountMenuItems } from './AccountMenuItems'
import { EmailAvatar, photoFromUser } from './EmailAvatar'
import { usePaywallModal } from '../billing/PaywallModalProvider'
import { usePremiumStatus } from '../billing/usePremiumStatus'

/**
 * Compact auth control for chrome that doesn't include the global sidebar
 * (e.g. design-system topbar). Replaces UserMenu in cramped spaces.
 */
export function TopAuthPill() {
  const { user } = useSession()
  const router = useRouter()
  const { open: openAuthModal } = useAuthModal()
  const { open: openPaywall } = usePaywallModal()
  const status = usePremiumStatus()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  if (!user) {
    return (
      <Button variant="outline" size="xs" onClick={() => openAuthModal()}>
        <SignIn size={13} weight="regular" />
        Sign in
      </Button>
    )
  }

  const email = user.email ?? 'Account'

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="relative" ref={ref}>
        {/* Avatar only, and no button chrome around it: the photo is already a
            solid shape, so a border and a background would only draw a box
            around a box. The up/down caret next to it is what says the thing
            opens a menu. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={`Account menu for ${email}`}
          aria-expanded={open}
          className="group flex cursor-pointer items-center gap-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40"
        >
          <EmailAvatar email={email} photoUrl={photoFromUser(user)} className="h-7 w-7 text-xs" />
          <CaretUpDown
            size={12}
            weight="regular"
            className="text-sand-500 transition-colors group-hover:text-sand-700 dark:text-sand-400 dark:group-hover:text-sand-200"
          />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 w-48 overflow-hidden rounded-lg border border-sand-200 bg-sand-100 shadow-lg dark:border-sand-700 dark:bg-sand-900">
            <div className="border-b border-sand-200 px-3 py-2 text-xs text-sand-600 dark:border-sand-800 dark:text-sand-400">
              <span className="block truncate">{email}</span>
            </div>
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
