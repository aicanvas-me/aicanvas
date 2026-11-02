import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { Bolt } from '@/app/_icons/icons/bolt'
import { createClient } from '../../lib/supabase/server'
import { premiumEnabled } from '../../../lib/flags'
import { isPremiumNow, type SubStatus } from '../../../lib/identity/tier'
import { EmailAvatar, photoFromUser } from '../../components/auth/EmailAvatar'
import { PageShell } from '../../components/PageKit'
import { AccountTabs } from './AccountTabs'

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

  // The site's page shell and the homepage's centred hero stack: avatar, the
  // title with the tier beside it, the address under it, then the section
  // switch. This layout stays mounted across the tabs, so the entrance plays
  // once on the way in, not on every tab.
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-4xl">
        <header className="flex flex-col items-center text-center">
          <div className="aic-hero-rise" style={{ animationDelay: '0.1s' }}>
            <EmailAvatar
              email={email}
              photoUrl={photoFromUser(user)}
              className="h-16 w-16 text-2xl sm:h-20 sm:w-20 sm:text-3xl"
            />
          </div>
          <div
            className="aic-hero-slide mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
            style={{ animationDelay: '0.18s' }}
          >
            <h1 className="text-balance text-3xl font-extrabold tracking-tight text-sand-900 sm:text-[2.75rem] sm:leading-[1.1] dark:text-sand-50">
              Your account
            </h1>
            {showTier && (
              isPremium ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-premium/10 px-3 py-1 text-xs font-semibold text-premium ring-1 ring-inset ring-premium/30">
                  <Bolt size={12} />
                  Premium
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-free/10 px-3 py-1 text-xs font-semibold text-free ring-1 ring-inset ring-free/30">Free</span>
              )
            )}
          </div>
          <p
            className="aic-hero-rise mt-3 max-w-full truncate text-base text-sand-600 dark:text-sand-400"
            style={{ animationDelay: '0.26s' }}
          >
            {email}
          </p>
        </header>
        <div className="aic-hero-rise mt-8 sm:mt-10" style={{ animationDelay: '0.34s' }}>
          <AccountTabs />
        </div>
        {/* The bottom padding stands in for the closing band other pages end
            on, so the last card does not run into the footer rule. */}
        <div className="mt-8 pb-12 sm:mt-12 sm:pb-20">{children}</div>
      </div>
    </PageShell>
  )
}
