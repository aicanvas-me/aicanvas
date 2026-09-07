'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClockClockwise, Flask, Gear, Heart, User } from '@phosphor-icons/react'
import type { ComponentType } from 'react'

// Tabs mirror the dropdown menu entries (TopAuthPill + UserMenu) — same
// order, same icons — so the surfaces feel like a single navigation system
// just rendered two ways.
type IconComponent = ComponentType<{ size?: number; weight?: 'regular' | 'bold' | 'fill' }>

const TABS: { href: string; label: string; Icon: IconComponent }[] = [
  { href: '/account/saved', label: 'Saved', Icon: Heart },
  { href: '/account/lab', label: 'Made in Lab', Icon: Flask },
  { href: '/account/history', label: 'Activity', Icon: ClockClockwise },
  { href: '/account/settings', label: 'Settings', Icon: Gear },
  { href: '/account', label: 'Profile', Icon: User },
]

export function AccountTabs() {
  const pathname = usePathname()
  return (
    // Five tabs split the full row evenly (flex-1). No horizontal scroll —
    // labels collapse to icon-only below `sm:` so all five always fit on
    // mobile; on desktop the label rides alongside.
    <nav className="border-b border-sand-200 dark:border-sand-800">
      <div className="flex">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-2 py-2.5 text-sm font-semibold transition-colors sm:px-4 ${
                active
                  ? 'text-sand-900 dark:text-sand-50'
                  : 'text-sand-600 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-50'
              }`}
            >
              <Icon size={16} weight="regular" />
              <span className="sr-only sm:not-sr-only">{label}</span>
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-olive-500" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
