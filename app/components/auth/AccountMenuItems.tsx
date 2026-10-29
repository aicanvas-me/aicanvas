import Link from 'next/link'
import { ClockClockwise, Gear, Heart, Lightning, SignOut, User } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

const LINKS: { href: string; label: string; icon: ReactNode }[] = [
  { href: '/account/saved', label: 'Saved', icon: <Heart size={14} weight="regular" /> },
  { href: '/account/history', label: 'Activity', icon: <ClockClockwise size={14} weight="regular" /> },
  { href: '/account/settings', label: 'Settings', icon: <Gear size={14} weight="regular" /> },
  { href: '/account', label: 'Profile', icon: <User size={14} weight="regular" /> },
]

const ROW =
  'flex w-full items-center gap-2 rounded-control px-3 py-2 text-sm transition-colors hover:bg-sand-50 dark:hover:bg-sand-800'
const LINK_CLASS = `${ROW} text-sand-700 dark:text-sand-300`
function Rule() {
  return <div aria-hidden className="mx-1.5 my-1 h-px bg-sand-200 dark:bg-sand-700" />
}

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
    <div className="flex flex-col gap-0.5 p-1.5">
      {showUpgrade && (
        <button
          type="button"
          onClick={onUpgrade}
          className={`${ROW} font-semibold text-accent`}
        >
          <Lightning size={14} weight="regular" />
          Upgrade to Premium
        </button>
      )}
      {showUpgrade && <Rule />}
      {LINKS.map(({ href, label, icon }) => (
        <Link key={href} href={href} onClick={onNavigate} className={LINK_CLASS}>
          {icon}
          {label}
        </Link>
      ))}
      <Rule />
      <button
        type="button"
        onClick={onSignOut}
        className={LINK_CLASS}
      >
        <SignOut size={14} weight="regular" />
        Sign out
      </button>
    </div>
  )
}
