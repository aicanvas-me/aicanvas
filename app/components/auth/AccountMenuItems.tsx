import Link from 'next/link'
import { History } from '@/app/_icons/icons/history'
import { Gear } from '@/app/_icons/icons/gear'
import { Heart } from '@/app/_icons/icons/heart'
import { Bolt } from '@/app/_icons/icons/bolt'
import { Plug } from '@/app/_icons/icons/plug'
import { LogOut } from '@/app/_icons/icons/log-out'
import { User } from '@/app/_icons/icons/user'
import type { ReactNode } from 'react'
import { useSession } from './SessionProvider'

const LINKS: { href: string; label: string; icon: ReactNode }[] = [
  { href: '/account/saved', label: 'Saved', icon: <Heart size={14} /> },
  { href: '/account/history', label: 'Activity', icon: <History size={14} /> },
  { href: '/account/settings', label: 'Settings', icon: <Gear size={14} /> },
  { href: '/account', label: 'Profile', icon: <User size={14} /> },
]

// After Activity, only while the hosted MCP sign-in is on, matching the account tabs.
const CONNECT_LINK = { href: '/account/connect', label: 'Connect', icon: <Plug size={14} /> }

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
  const { showConnect } = useSession()
  const links = showConnect ? [...LINKS.slice(0, 2), CONNECT_LINK, ...LINKS.slice(2)] : LINKS
  return (
    <div className="flex flex-col gap-0.5 p-1.5">
      {showUpgrade && (
        <button
          type="button"
          onClick={onUpgrade}
          className={`${ROW} whitespace-nowrap font-semibold text-accent`}
        >
          <Bolt size={14} />
          Upgrade to Premium
        </button>
      )}
      {showUpgrade && <Rule />}
      {links.map(({ href, label, icon }) => (
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
        <LogOut size={14} />
        Sign out
      </button>
    </div>
  )
}
