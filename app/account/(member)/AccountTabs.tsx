'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { ClockClockwise, Gear, Heart, User } from '@phosphor-icons/react'
import type { ComponentType } from 'react'

// Tabs mirror the dropdown menu entries (TopAuthPill + UserMenu) — same
// order, same icons — so the surfaces feel like a single navigation system
// just rendered two ways.
type IconComponent = ComponentType<{ size?: number; weight?: 'regular' | 'bold' | 'fill'; className?: string }>

const TABS: { href: string; label: string; Icon: IconComponent }[] = [
  { href: '/account/saved', label: 'Saved', Icon: Heart },
  { href: '/account/history', label: 'Activity', Icon: ClockClockwise },
  { href: '/account/settings', label: 'Settings', Icon: Gear },
  { href: '/account', label: 'Profile', Icon: User },
]

export function AccountTabs() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  return (
    // The segmented switch the pricing page uses: one raised pill travels to
    // the current section, so the eye follows the move instead of watching
    // one tab blink off and another blink on. On a phone the row spans the
    // column and drops the icons, so the four words always fit without a
    // horizontal scroll; from `sm:` it sits centred with icon and label.
    <nav className="flex justify-center">
      <div className="flex w-full rounded-xl border border-sand-200 bg-sand-100 p-1 sm:inline-flex sm:w-auto dark:border-sand-800 dark:bg-sand-900">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 sm:flex-none sm:px-5 ${
                active
                  ? 'text-sand-900 dark:text-sand-50'
                  : 'text-sand-600 hover:text-sand-800 dark:text-sand-400 dark:hover:text-sand-200'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="account-tab-pill"
                  className="absolute inset-0 rounded-lg bg-sand-50 shadow-sm dark:bg-sand-800"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }
                  }
                />
              )}
              <Icon size={16} weight="regular" className="relative hidden sm:block" />
              <span className="relative">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
