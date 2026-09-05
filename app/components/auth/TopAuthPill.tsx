'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { CaretUpDown, ClockClockwise, Flask, Gear, Heart, Lightning, SignIn, SignOut, User } from '@phosphor-icons/react'
import { useSession } from './SessionProvider'
import { useAuthModal } from './AuthModalProvider'
import { createClient } from '../../lib/supabase/client'
import { Button } from '../Button'
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
            around a box. A rounded rectangle rather than a circle, to sit with
            the square icon buttons in the same bar. The up/down caret next to
            it is what says the thing opens a menu. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={`Account menu for ${email}`}
          aria-expanded={open}
          className="group flex cursor-pointer items-center gap-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40"
        >
          <EmailAvatar email={email} photoUrl={photoFromUser(user)} className="h-6 w-6 rounded-md text-xs" />
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
            {/* Mirrors the account tabs (Saved · Made in Lab · Activity ·
                Settings · Profile) so the dropdown is a quick teleport into
                any account view. */}
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
