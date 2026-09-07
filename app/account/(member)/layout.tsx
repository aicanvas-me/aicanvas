import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { Lightning } from '@phosphor-icons/react/dist/ssr'
import { createClient } from '../../lib/supabase/server'
import { premiumEnabled } from '../../../lib/flags'
import { isPremiumNow, type SubStatus } from '../../../lib/identity/tier'
import { EmailAvatar, photoFromUser } from '../../components/auth/EmailAvatar'
import { AccountTabs } from './AccountTabs'
import { AccountTopBar } from './AccountTopBar'

export default async function MemberLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/account/sign-in?next=/account')

  const email = user.email ?? 'Account'

  // Real tier badge (flag-gated). RLS restricts this read to the owner's row.
  let showTier = false
  let isPremium = false
  if (premiumEnabled()) {
    showTier = true
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('status, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle()
    isPremium = sub
      ? isPremiumNow(sub.status as SubStatus, sub.current_period_end ?? null)
      : false
  }

  return (
    <>
      <AccountTopBar />
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-center gap-4 sm:mb-8">
          <EmailAvatar email={email} photoUrl={photoFromUser(user)} className="h-12 w-12 shrink-0 text-xl sm:h-16 sm:w-16 sm:text-2xl" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-sand-900 dark:text-sand-50 sm:text-3xl">Your account</h1>
              {showTier && (
                isPremium ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-olive-500 px-2 py-0.5 text-[11px] font-semibold text-sand-950">
                    <Lightning weight="regular" size={11} />
                    Premium
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-sand-200 px-2 py-0.5 text-[11px] font-semibold text-sand-600 dark:border-sand-700 dark:text-sand-400">
                    Free
                  </span>
                )
              )}
            </div>
            <p className="mt-1 truncate text-sm text-sand-600 dark:text-sand-400">{email}</p>
          </div>
        </div>
        <AccountTabs />
        <div className="mt-6 sm:mt-8">{children}</div>
      </div>
    </>
  )
}
