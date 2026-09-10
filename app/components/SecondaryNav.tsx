import Link from 'next/link'
import { ChatCircleText, EnvelopeSimple, Flask, Info, PiggyBank, Plug, Question } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

type NavItem = {
  label: string
  href: string
  icon: ReactNode
  // No match rule means the row never highlights.
  match?: 'exact' | 'prefix'
}

const ITEMS: NavItem[] = [
  { label: 'Lab', href: '/lab', icon: <Flask weight="regular" size={16} />, match: 'prefix' },
  { label: 'Get MCP', href: '/mcp', icon: <Plug weight="regular" size={16} />, match: 'exact' },
  { label: 'Pricing', href: '/pricing', icon: <PiggyBank weight="regular" size={16} />, match: 'exact' },
  { label: 'About', href: '/about', icon: <Info weight="regular" size={16} />, match: 'exact' },
  { label: 'FAQ', href: '/faq', icon: <Question weight="regular" size={16} />, match: 'exact' },
  { label: 'Contact', href: '/contact', icon: <EnvelopeSimple weight="regular" size={16} /> },
  { label: 'Feedback', href: '/feedback', icon: <ChatCircleText weight="regular" size={16} /> },
]

const ACTIVE = 'bg-sand-200/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
const IDLE =
  'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'

/** The pinned nav rows, shared by the desktop rail and the mobile drawer. */
export function SecondaryNav({
  pathname,
  variant,
  onNavigate,
}: {
  pathname: string | null
  variant: 'rail' | 'drawer'
  onNavigate?: () => void
}) {
  const drawer = variant === 'drawer'
  return (
    <>
      {ITEMS.map(({ label, href, icon, match }) => {
        const active =
          match === 'prefix' ? pathname?.startsWith(href) : match === 'exact' ? pathname === href : false
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`${drawer ? 'mb-1 ' : ''}flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold transition-colors ${
              active ? ACTIVE : IDLE
            }`}
          >
            {drawer ? <span>{icon}</span> : icon}
            <span className={drawer ? 'flex-1' : undefined}>{label}</span>
          </Link>
        )
      })}
    </>
  )
}
