// The annual offer, in one place.
//
// Two surfaces quote it now: the pill in the top bar on the home page and the
// Premium card on /pricing. The numbers used to live inside PremiumCards
// alone, which was safe while the card was the only thing that said them out
// loud. A second surface makes drift possible, so the figures and the closing
// date live here and both surfaces read them.

export const MONTHLY_PRICE = 8.99
export const YEARLY_PRICE = 49.99

/** Twelve monthly payments: what a year costs without the annual plan. A real
 *  alternative price rather than an invented "was", which is what makes the
 *  struck figure on both surfaces a true comparison. */
export const YEARLY_ANCHOR = Number((MONTHLY_PRICE * 12).toFixed(2))

/** Rounded for display: 49.99 against 107.88 is 53.7%, shown as 54%. */
export const YEARLY_SAVING_PCT = Math.round((1 - YEARLY_PRICE / YEARLY_ANCHOR) * 100)

/** The annual price expressed per month, the hook on the Premium card. */
export const YEARLY_PER_MONTH = YEARLY_PRICE / 12

/** When the founding offer closes, in Berlin time, where the shop is.
 *
 *  The banner counts down to this instant and takes itself off the bar once it
 *  passes, so the bar can never show a timer at zero or a sale that has ended.
 *  Moving the date means moving the offer with it: a countdown that resets to
 *  the same price is the one thing this file cannot keep honest. */
export const OFFER_ENDS = new Date('2026-10-01T00:00:00+02:00')

/** Prices are quoted to the cent everywhere on the site. */
export const usd = (n: number) => `$${n.toFixed(2)}`
