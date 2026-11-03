import { createClient } from '../../lib/supabase/server'
import { CARD } from '../../components/PageKit'
import { AvatarSection } from './AvatarSection'
import { SignOutButton } from './SignOutButton'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const joined = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">
      <div className={`${CARD} p-6 sm:p-8`}>
        <h2 className="text-lg font-bold tracking-tight text-sand-900 dark:text-sand-50">Profile</h2>
        <dl className="mt-5">
          <div className="flex items-center justify-between gap-4 border-b border-sand-200 pb-4 dark:border-sand-800">
            <dt className="text-sm text-sand-600 dark:text-sand-400">Email</dt>
            <dd className="min-w-0 truncate text-sm font-medium text-sand-900 dark:text-sand-50">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 pt-4">
            <dt className="text-sm text-sand-600 dark:text-sand-400">Joined</dt>
            <dd className="text-sm font-medium text-sand-900 dark:text-sand-50">{joined}</dd>
          </div>
        </dl>
      </div>

      <AvatarSection />

      <div className={`${CARD} p-6 sm:p-8`}>
        <h2 className="text-lg font-bold tracking-tight text-sand-900 dark:text-sand-50">Session</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
          Sign out on this device. Your saved components and history stay safe.
        </p>
        <div className="mt-5">
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
