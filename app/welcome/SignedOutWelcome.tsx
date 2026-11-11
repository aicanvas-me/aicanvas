'use client'

import Link from 'next/link'
import { PageHero } from '../components/PageKit'
import { StackedCards } from '../home/islands'
import { useCheckoutHandoff } from '../lib/checkout-handoff'
import { LinkSentCard } from './LinkSentCard'
import { ClaimCard, THANKS_CARDS, THANKS_PILL } from './parts'

// Signed out. "You're Premium" is only for the tab that just finished a
// checkout; anyone else who lands here gets the new-link form and a way to the
// plans. Empty until the tab is read, so the hero never swaps mid-rise.
export function SignedOutWelcome() {
  const handoff = useCheckoutHandoff()
  if (handoff === undefined) return <div className="min-h-[60vh]" />

  if (handoff) {
    return (
      <>
        <div className="-mt-4">
          <StackedCards cards={THANKS_CARDS} />
        </div>
        <div className="pb-12 sm:pb-20">
          <PageHero
            pill={THANKS_PILL}
            title={
              <>
                You&rsquo;re <span className="text-accent">Premium</span>. Check your inbox.
              </>
            }
            sub={
              <span className="block text-pretty sm:text-balance">
                We&rsquo;re emailing you a one-time sign-in link. Open it and
                you&rsquo;re in, no password needed.
              </span>
            }
          />
          <LinkSentCard handoff={handoff} />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="-mt-4">
        <StackedCards />
      </div>
      <div className="pb-12 sm:pb-20">
        <PageHero
          title="Bought AI Canvas Premium?"
          sub={
            <span className="block text-pretty sm:text-balance">
              Your sign-in link is in your inbox. Need a new one? Enter the email
              you paid with.
            </span>
          }
        />
        <ClaimCard note="The link works once, within 1 hour. Nothing after a minute? Check spam." />
        <p className="mt-8 text-center text-sm leading-relaxed text-sand-600 dark:text-sand-400">
          Not a member yet?{' '}
          <Link href="/pricing" className="font-semibold text-accent transition-colors hover:text-accent/70">
            See Premium plans
          </Link>
        </p>
      </div>
    </>
  )
}
