import Link from 'next/link'
import { BookOpenText, ChatCircleText, EnvelopeSimple, Info, PiggyBank, Question } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

// The Model Context Protocol's own mark, drawn from the official asset rather
// than approximated: a row that names someone else's protocol should carry
// their mark, not a stand-in for it. Stroked in currentColor so it takes the
// row's colour in both themes, and the weight lands at 6.1% of the box, which
// is near enough to Phosphor's regular that it reads as one set with the rows
// above and below it.
function McpMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 180"
      fill="none"
      stroke="currentColor"
      strokeWidth={11.0667}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M23.5996 85.2532L86.2021 22.6507C94.8457 14.0071 108.86 14.0071 117.503 22.6507C126.147 31.2942 126.147 45.3083 117.503 53.9519L70.2254 101.23" />
      <path d="M70.8789 100.578L117.504 53.952C126.148 45.3083 140.163 45.3083 148.806 53.952L149.132 54.278C157.776 62.9216 157.776 76.9357 149.132 85.5792L92.5139 142.198C89.6327 145.079 89.6327 149.75 92.5139 152.631L104.14 164.257" />
      <path d="M101.853 38.3013L55.553 84.6011C46.9094 93.2447 46.9094 107.258 55.553 115.902C64.1966 124.546 78.2106 124.546 86.8543 115.902L133.154 69.6025" />
    </svg>
  )
}

type NavItem = {
  label: string
  href: string
  icon: ReactNode
  // No match rule means the row never highlights.
  match?: 'exact' | 'prefix'
}

// Lab is not listed. It is off the site: its routes redirect away (see
// next.config.ts) and nothing links to it.
//
// Two groups. The site's sections open the drawer, as tiles under the search,
// so a phone reaches Docs, MCP and Pricing in one tap instead of scrolling past
// the whole catalog. The info pages close it, as rows, the way a footer would.
const SECTIONS: NavItem[] = [
  { label: 'Docs', href: '/docs', icon: <BookOpenText weight="regular" size={18} />, match: 'prefix' },
  { label: 'MCP', href: '/mcp', icon: <McpMark size={18} />, match: 'exact' },
  { label: 'Pricing', href: '/pricing', icon: <PiggyBank weight="regular" size={18} />, match: 'exact' },
]
const INFO: NavItem[] = [
  { label: 'About', href: '/about', icon: <Info weight="regular" size={16} />, match: 'exact' },
  { label: 'FAQ', href: '/faq', icon: <Question weight="regular" size={16} />, match: 'exact' },
  { label: 'Contact', href: '/contact', icon: <EnvelopeSimple weight="regular" size={16} /> },
  { label: 'Feedback', href: '/feedback', icon: <ChatCircleText weight="regular" size={16} /> },
]

const ACTIVE = 'bg-sand-200/60 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
const IDLE =
  'text-sand-700 hover:bg-sand-200/50 hover:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-800/60 dark:hover:text-sand-100'

const isActive = (pathname: string | null, { href, match }: NavItem) =>
  match === 'prefix' ? !!pathname?.startsWith(href) : match === 'exact' ? pathname === href : false

/** The mobile drawer's site sections (Docs, MCP, Pricing) as three tiles. The
 *  desktop bar carries the same pages in its nav. */
export function SectionTiles({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {SECTIONS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          aria-current={isActive(pathname, item) ? 'page' : undefined}
          className={`flex flex-col items-center gap-1.5 rounded-card border px-2 py-3 text-xs font-semibold transition-colors ${
            isActive(pathname, item)
              ? `border-sand-300 dark:border-sand-700 ${ACTIVE}`
              : `border-sand-200 dark:border-sand-800 ${IDLE}`
          }`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </div>
  )
}

/** The mobile drawer's info pages (About, FAQ, Contact, Feedback) as rows. The
 *  desktop bar carries them in its More menu. */
export function SecondaryNav({
  pathname,
  onNavigate,
}: {
  pathname: string | null
  onNavigate?: () => void
}) {
  return (
    <>
      {INFO.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`mb-1 flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-sm font-semibold transition-colors ${
            isActive(pathname, item) ? ACTIVE : IDLE
          }`}
        >
          <span>{item.icon}</span>
          <span className="flex-1">{item.label}</span>
        </Link>
      ))}
    </>
  )
}
