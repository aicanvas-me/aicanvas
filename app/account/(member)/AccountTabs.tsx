'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { History } from '@/app/_icons/icons/history'
import type { SiteIcon } from '@/app/_icons'
import { Gear } from '@/app/_icons/icons/gear'
import { Heart } from '@/app/_icons/icons/heart'
import { Plug } from '@/app/_icons/icons/plug'
import { User } from '@/app/_icons/icons/user'

// Tabs mirror the dropdown menu entries (TopAuthPill + UserMenu) — same
// order, same icons — so the surfaces feel like a single navigation system
// just rendered two ways.

const TABS: { href: string; label: string; Icon: SiteIcon }[] = [
  { href: '/account/saved', label: 'Saved', Icon: Heart },
  { href: '/account/history', label: 'Activity', Icon: History },
  { href: '/account/settings', label: 'Settings', Icon: Gear },
  { href: '/account', label: 'Profile', Icon: User },
]

// After Activity, only while the hosted MCP sign-in is on; the flag is server-side, so the layout passes it.
const CONNECT_TAB: (typeof TABS)[number] = { href: '/account/connect', label: 'Connect', Icon: Plug }

export function AccountTabs({ showConnect = false }: { showConnect?: boolean }) {
  const pathname = usePathname()
  const tabs = showConnect ? [...TABS.slice(0, 2), CONNECT_TAB, ...TABS.slice(2)] : TABS
  const reduceMotion = useReducedMotion()
  return (
    // The segmented switch the pricing page uses: one raised pill travels to
    // the current section, so the eye follows the move instead of watching
    // one tab blink off and another blink on. On a phone the row spans the
    // column and drops the icons, so every word always fits without a
    // horizontal scroll; from `sm:` it sits centred with icon and label.
    <nav className="flex justify-center">
      <div className="flex w-full rounded-control border border-sand-200 bg-sand-100 p-1 sm:inline-flex sm:w-auto dark:border-sand-800 dark:bg-sand-900">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-control px-2.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:flex-none sm:px-5 ${
                active
                  ? 'text-sand-900 dark:text-sand-50'
                  : 'text-sand-600 hover:text-sand-800 dark:text-sand-400 dark:hover:text-sand-200'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="account-tab-pill"
                  className="absolute inset-0 rounded-control bg-sand-50 shadow-sm dark:bg-sand-800"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }
                  }
                />
              )}
              <Icon size={16} className="relative hidden sm:block" />
              <span className="relative">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
