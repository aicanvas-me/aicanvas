import { createClient } from '../../lib/supabase/server'
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
      <div className="rounded-xl border border-sand-200 bg-sand-100 p-6 dark:border-sand-800 dark:bg-sand-900">
        <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">Profile</h2>
        <dl className="mt-4 space-y-3">
          <div className="flex justify-between border-b border-sand-200 pb-3 dark:border-sand-800">
            <dt className="text-sm text-sand-600 dark:text-sand-400">Email</dt>
            <dd className="text-sm font-medium text-sand-900 dark:text-sand-50">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-sand-600 dark:text-sand-400">Joined</dt>
            <dd className="text-sm font-medium text-sand-900 dark:text-sand-50">{joined}</dd>
          </div>
        </dl>
      </div>

      <AvatarSection />

      <div className="rounded-xl border border-sand-200 bg-sand-100 p-6 dark:border-sand-800 dark:bg-sand-900">
        <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">Session</h2>
        <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">
          Sign out on this device. Your saved components and history stay safe.
        </p>
        <div className="mt-4">
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
