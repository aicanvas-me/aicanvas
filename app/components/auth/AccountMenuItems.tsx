import Link from 'next/link'
import { ClockClockwise, Flask, Gear, Heart, Lightning, SignOut, User } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

const LINKS: { href: string; label: string; icon: ReactNode }[] = [
  { href: '/account/saved', label: 'Saved', icon: <Heart size={14} weight="regular" /> },
  { href: '/account/lab', label: 'Made in Lab', icon: <Flask size={14} weight="regular" /> },
  { href: '/account/history', label: 'Activity', icon: <ClockClockwise size={14} weight="regular" /> },
  { href: '/account/settings', label: 'Settings', icon: <Gear size={14} weight="regular" /> },
  { href: '/account', label: 'Profile', icon: <User size={14} weight="regular" /> },
]

const LINK_CLASS =
  'flex items-center gap-2 px-3 py-2 text-sm text-sand-700 transition-colors hover:bg-sand-50 dark:text-sand-300 dark:hover:bg-sand-800'

/** The signed-in dropdown body, shared by the sidebar UserMenu and the compact
 *  TopAuthPill so the two menus cannot drift. */
export function AccountMenuItems({
  showUpgrade,
  onUpgrade,
  onNavigate,
  onSignOut,
}: {
  showUpgrade: boolean
  onUpgrade: () => void
  onNavigate: () => void
  onSignOut: () => void
}) {
  return (
    <>
      {showUpgrade && (
        <button
          type="button"
          onClick={onUpgrade}
          className="flex w-full items-center gap-2 border-b border-sand-200 px-3 py-2 text-sm font-semibold text-olive-600 transition-colors hover:bg-sand-50 dark:border-sand-700 dark:text-olive-500 dark:hover:bg-sand-800"
        >
          <Lightning size={14} weight="regular" />
          Upgrade to Premium
        </button>
      )}
      {LINKS.map(({ href, label, icon }) => (
        <Link key={href} href={href} onClick={onNavigate} className={LINK_CLASS}>
          {icon}
          {label}
        </Link>
      ))}
      <button
        type="button"
        onClick={onSignOut}
        className="flex w-full items-center gap-2 border-t border-sand-200 px-3 py-2 text-sm text-sand-700 transition-colors hover:bg-sand-50 dark:border-sand-700 dark:text-sand-300 dark:hover:bg-sand-800"
      >
        <SignOut size={14} weight="regular" />
        Sign out
      </button>
    </>
  )
}
