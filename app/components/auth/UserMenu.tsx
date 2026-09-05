'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CaretDown, ClockClockwise, Lightning, Flask, Gear, Heart, SignOut, User } from '@phosphor-icons/react'
import { useSession } from './SessionProvider'
import { createClient } from '../../lib/supabase/client'
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
          {status === 'not-premium' && (
            <button
              type="button"
              onClick={() => { setOpen(false); openPaywall({ reason: 'upgrade' }) }}
              className="flex w-full items-center gap-2 border-b border-sand-200 px-3 py-2 text-sm font-semibold text-olive-600 transition-colors hover:bg-sand-50 dark:border-sand-700 dark:text-olive-500 dark:hover:bg-sand-800"
            >
              <Lightning size={14} weight="regular" />
              Upgrade to Premium
            </button>
          )}
          <Link
            href="/account/saved"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-sand-700 transition-colors hover:bg-sand-50 dark:text-sand-300 dark:hover:bg-sand-800"
          >
            <Heart size={14} weight="regular" />
            Saved
          </Link>
          <Link
            href="/account/lab"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-sand-700 transition-colors hover:bg-sand-50 dark:text-sand-300 dark:hover:bg-sand-800"
          >
            <Flask size={14} weight="regular" />
            Made in Lab
          </Link>
          <Link
            href="/account/history"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-sand-700 transition-colors hover:bg-sand-50 dark:text-sand-300 dark:hover:bg-sand-800"
          >
            <ClockClockwise size={14} weight="regular" />
            Activity
          </Link>
          <Link
            href="/account/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-sand-700 transition-colors hover:bg-sand-50 dark:text-sand-300 dark:hover:bg-sand-800"
          >
            <Gear size={14} weight="regular" />
            Settings
          </Link>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-sand-700 transition-colors hover:bg-sand-50 dark:text-sand-300 dark:hover:bg-sand-800"
          >
            <User size={14} weight="regular" />
            Profile
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-2 border-t border-sand-200 px-3 py-2 text-sm text-sand-700 transition-colors hover:bg-sand-50 dark:border-sand-700 dark:text-sand-300 dark:hover:bg-sand-800"
          >
            <SignOut size={14} weight="regular" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
