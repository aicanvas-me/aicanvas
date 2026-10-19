'use client'

// The top bar content of every page that draws the bar, the catalog routes
// included, the way ui.shadcn.com does it: the logo on the left, and in the
// centre the two systems, the component categories, Icons, MCP, and a More
// menu that opens on Pricing and the info pages. The section you are in reads
// in the primary text colour and carries aria-current: a page link on that
// page, a menu button anywhere inside its section.
//
// Each menu is a disclosure: a button with aria-expanded and a list of plain
// links. Escape and a click outside close it, and focus goes back to the
// button on Escape. The links render in the server HTML only while open, so
// the categories stay crawlable through the sidebar on every other page and
// through /components.

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CaretDown } from '@phosphor-icons/react'
import { CATEGORIES } from '../lib/categories'

type NavLink = { label: string; href: string }

const DESIGN_SYSTEMS: NavLink[] = [
  { label: 'Andromeda Pro', href: '/design-systems/andromeda-pro' },
  { label: 'Andromeda Legacy', href: '/design-systems/andromeda' },
]

const COMPONENT_LINKS: NavLink[] = [
  { label: 'All components & blocks', href: '/components' },
  ...CATEGORIES.map((c) => ({ label: c.label, href: `/components/category/${c.slug}` })),
]

const MORE: NavLink[] = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
  { label: 'Feedback', href: '/feedback' },
]

// Plain text links in a muted tone that steps up to the primary text on hover,
// while a menu is open, and on the page you are on; no pill behind them.
const ITEM =
  'inline-flex h-8 items-center gap-1 rounded-lg px-2 text-sm font-medium text-sand-600 transition-colors hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 aria-expanded:text-sand-900 aria-[current=page]:text-sand-900 aria-[current=true]:text-sand-900 data-[active]:text-sand-900 dark:text-sand-400 dark:hover:text-sand-50 dark:aria-expanded:text-sand-50 dark:aria-[current=page]:text-sand-50 dark:aria-[current=true]:text-sand-50 dark:data-[active]:text-sand-50 xl:px-3'

const isOn = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`)

function Menu({
  label,
  links,
  columns = 1,
  section,
}: {
  label: string
  links: NavLink[]
  columns?: 1 | 2
  // The route prefix the menu stands for. Without one, the menu is current
  // only while you are on one of its own links.
  section?: string
}) {
  const pathname = usePathname() ?? '/'
  const active = section ? isOn(pathname, section) : links.some((l) => isOn(pathname, l.href))
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    function onPointer(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        aria-current={active ? 'true' : undefined}
        data-active={active ? '' : undefined}
        className={ITEM}
      >
        {label}
        <CaretDown
          weight="regular"
          aria-hidden
          className={`size-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ul
          id={listId}
          className={`absolute left-0 top-full z-40 mt-1.5 grid gap-0.5 rounded-xl border border-sand-200 bg-sand-50 p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.12)] dark:border-sand-800 dark:bg-sand-950 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.5)] ${
            columns === 2 ? 'w-[26rem] grid-cols-2' : 'w-56 grid-cols-1'
          }`}
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === l.href ? 'page' : undefined}
                className="block rounded-lg px-2.5 py-2 text-sm text-sand-700 transition-colors hover:bg-sand-100 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 aria-[current=page]:bg-sand-100 aria-[current=page]:font-semibold aria-[current=page]:text-sand-900 dark:text-sand-300 dark:hover:bg-sand-900 dark:hover:text-sand-50 dark:aria-[current=page]:bg-sand-900 dark:aria-[current=page]:text-sand-50"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function HomeLogo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2 justify-self-start font-bold text-sand-900 dark:text-sand-50">
      <img src="/ai-canvas-icon.svg" alt="" width={20} height={17} className="shrink-0" />
      AI Canvas
    </Link>
  )
}

// The centre of the bar. The More menu waits for lg: below lg the bar has no
// room for it, and its pages stay one tap away in the mobile drawer and the
// footer. /icons is linked ahead of the page that will live there.
export function HomeNav() {
  const pathname = usePathname() ?? '/'
  return (
    <nav aria-label="Main" className="flex items-center xl:gap-2">
      <Menu label="Design systems" links={DESIGN_SYSTEMS} section="/design-systems" />
      <Menu label="Components & blocks" links={COMPONENT_LINKS} columns={2} section="/components" />
      <Link href="/icons" prefetch={false} aria-current={isOn(pathname, '/icons') ? 'page' : undefined} className={ITEM}>
        Icons
      </Link>
      <Link href="/mcp" aria-current={pathname === '/mcp' ? 'page' : undefined} className={ITEM}>
        MCP
      </Link>
      <div className="hidden lg:block">
        <Menu label="More" links={MORE} />
      </div>
    </nav>
  )
}
