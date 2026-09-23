'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock } from '@phosphor-icons/react'
import { buttonClasses } from '../buttonClasses'
import { usePremiumStatus } from './usePremiumStatus'
import { track } from '../../lib/analytics'
import { OFFER_ENDS, YEARLY_ANCHOR, YEARLY_PRICE, usd } from '../../lib/offer'
import type { OfferPillMode } from '../top-bar-crumbs'
import { checkoutComingSoon, premiumEnabled } from '../../../lib/flags'

// The founding-offer pill that sits in the middle of the site top bar.
//
// It rides the bar rather than any one page, so it follows people through the
// site instead of being seen once on the way in. Which routes get it, and
// whether it is a control there, is decided by offerPillMode in
// top-bar-crumbs.ts, next to the rest of the bar's route rules.
//
// One row, because the bar is 56px tall, and absolutely centred on the bar
// rather than placed between the crumb and the user pill: those two are
// different widths, so a flex middle would sit off-centre and the two ends
// would have to give up the positions they hold on every other page. Absolute
// keeps the change to this route and leaves the rest of the chrome untouched.
//
// The wrapper takes no pointer events, so nothing here can swallow a click
// meant for the crumb or the sign-in button; only the pill itself is clickable.
//
// It leads to /pricing rather than straight into the Paddle overlay. A bar
// that is present on first paint should not be able to throw a payment sheet
// over the page from a single click: the offer is made here and decided there.
//
// On /pricing itself it is a label, not a control: same chip, no link, and no
// hover or focus skin, because something that cannot be clicked must not look
// as though it can.

const DAY = 86_400

function remaining(ms: number): string {
  const total = Math.floor(ms / 1000)
  const days = Math.floor(total / DAY)
  const hh = String(Math.floor((total % DAY) / 3600)).padStart(2, '0')
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const ss = String(total % 60).padStart(2, '0')
  return days > 0 ? `${days}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`
}

/** 1 October, spelled the way the pill's accessible name reads it. */
const ENDS_LABEL = OFFER_ENDS.toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Berlin',
})

/** The soft-olive chip without the states a control earns. Mirrors the
 *  `accent` button at size xs; the hover, focus and press skins are exactly
 *  what is left out. */
const STATIC_PILL =
  'inline-flex items-center justify-center gap-1.5 rounded-full border border-olive-600/40 bg-olive-500/10 px-3 py-1.5 text-xs font-semibold text-olive-600 dark:border-olive-500/25 dark:text-olive-400'

export function OfferBanner({ mode }: { mode: OfferPillMode }) {
  const premium = usePremiumStatus()

  // The countdown cannot be server-rendered: the server's clock and the
  // visitor's already disagree by the time the HTML lands, and React would
  // throw the whole bar out over the mismatch. Null until mounted, then real.
  const [left, setLeft] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setLeft(OFFER_ENDS.getTime() - Date.now())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Nothing to sell: premium off, checkout dormant, or the visitor already pays
  // for the thing the pill is offering them.
  //
  // Only a settled 'not-premium' shows it. 'unknown' means the entitlement
  // answer is still in flight, or that the call failed and it will stay unknown
  // for the life of the page: reading that as "not a subscriber" would
  // advertise the annual plan to someone already paying for it. A signed-out
  // visitor settles on 'not-premium' with no request at all, so the common case
  // waits for nothing.
  if (!premiumEnabled() || checkoutComingSoon()) return null
  if (premium !== 'not-premium') return null
  if (left === null || left <= 0) return null

  const offer = `Founding Members offer: ${usd(YEARLY_PRICE)} per year instead of ${usd(YEARLY_ANCHOR)}, ends ${ENDS_LABEL}`

  // The visible line is decoration for a screen reader either way: a figure
  // that changes every second would otherwise be announced every second. The
  // offer reaches assistive tech as the link's name, or as text beside the
  // static chip.
  const row = (
    <span aria-hidden className="inline-flex items-center gap-1.5">
      <Clock weight="regular" size={16} />
      Founding Members
      <span className="opacity-60">·</span>
      <span className="line-through opacity-70">{usd(YEARLY_ANCHOR)}</span>
      now {usd(YEARLY_PRICE)} per year
      <span className="opacity-60">·</span>
      <span className="tabular-nums">{remaining(left)} left</span>
    </span>
  )

  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-center lg:flex">
      {mode === 'static' ? (
        <span className={`whitespace-nowrap ${STATIC_PILL}`}>
          <span className="sr-only">{offer}</span>
          {row}
        </span>
      ) : (
        <Link
          href="/pricing"
          onClick={() => track('Offer Banner Click', {})}
          aria-label={`${offer}. See pricing`}
          className={`pointer-events-auto whitespace-nowrap ${buttonClasses({ variant: 'accent', size: 'xs', pill: true })}`}
        >
          {row}
        </Link>
      )}
    </div>
  )
}
