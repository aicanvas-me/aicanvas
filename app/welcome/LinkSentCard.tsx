'use client'

import { Info } from '@/app/_icons/icons/info'
import { Mail } from '@/app/_icons/icons/mail'
import { useCheckoutHandoff } from '../lib/checkout-handoff'
import { ClaimForm } from './ClaimForm'

// The signed-out view's card: where the sign-in link went, what the email is
// called, and a new link when it does not show up. The address comes from this
// tab's checkout; on another device or tab the buyer types it instead.
export function LinkSentCard() {
  const handoff = useCheckoutHandoff()
  // Empty until the tab is read, so the card never swaps its content mid-rise.
  if (handoff === undefined) return null
  const email = handoff?.email ?? null
  const subject = handoff
    ? `Sign in to your AI Canvas ${handoff.lifetime ? 'Lifetime' : 'Premium'} account`
    : null

  return (
    <div
      className="aic-hero-rise mx-auto mt-10 w-full max-w-md rounded-3xl border border-sand-800 bg-sand-900 p-2 text-left"
      style={{ animationDelay: '0.42s' }}
    >
      <div className="px-4 pt-4 pb-5 sm:px-5 sm:pt-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sand-800 text-sand-50">
            <Mail size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-sand-400">Sign-in link on its way to</p>
            <p className="break-words font-semibold text-sand-50">{email ?? 'the email you used at checkout'}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-sand-300">
          {subject ? (
            <>
              Look for <strong className="font-semibold text-sand-50">&ldquo;{subject}&rdquo;</strong> from AI Canvas.
            </>
          ) : (
            'Look for the email from AI Canvas with a Sign in button.'
          )}{' '}
          The link works once, for 1 hour.
        </p>
        <p className="mt-5 mb-3 text-sm text-sand-400">
          {email
            ? 'Nothing after a minute? Check spam, or get a new link.'
            : 'Nothing after a minute? Enter the email you paid with for a new link.'}
        </p>
        <ClaimForm presetEmail={email ?? undefined} submitLabel="Send a new link" />
      </div>
      <div className="flex items-start gap-2.5 rounded-2xl bg-sand-950 px-4 py-4 text-sm leading-relaxed text-sand-400 sm:px-5">
        <Info size={16} className="mt-0.5 shrink-0 text-accent" />
        <span>Your receipt comes in a separate email from Paddle, our payment provider.</span>
      </div>
    </div>
  )
}
