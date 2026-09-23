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
// One row, because the bar is 56px tall. It is a real cell in the bar rather
// than something floated over it: the bar gives the crumb and this pill equal
// shares, so the pill lands centred AND the crumb truncates instead of being
// painted over. Floating it was tried first and it covered the crumb on any
// laptop under about 1600px, which is most of them.
//
// Under 1220px the countdown drops and the offer keeps its words. That width
// is where the full line stops fitting beside a long crumb, and the price is
// the part worth keeping.
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
    // The bar is shared chrome and never unmounts, so the cleanup below only
    // runs when the whole app goes. Once the offer has closed there is nothing
    // left to count: stop the timer from inside it, or every tab left open
    // past the deadline re-renders a component that returns null, once a
    // second, forever.
    let id: ReturnType<typeof setInterval> | undefined
    const tick = () => {
      const ms = OFFER_ENDS.getTime() - Date.now()
      setLeft(ms)
      if (ms <= 0 && id !== undefined) clearInterval(id)
    }
    tick()
    id = setInterval(tick, 1000)
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
      <span className="hidden items-center gap-1.5 min-[1220px]:inline-flex">
        <span className="opacity-60">·</span>
        <span className="tabular-nums">{remaining(left)} left</span>
      </span>
    </span>
  )

  return (
    <div className="hidden shrink-0 items-center px-4 lg:flex">
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
          className={`whitespace-nowrap ${buttonClasses({ variant: 'accent', size: 'xs', pill: true })}`}
        >
          {row}
        </Link>
      )}
    </div>
  )
}
