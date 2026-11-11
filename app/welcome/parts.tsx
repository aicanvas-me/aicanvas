import type { ReactNode } from 'react'
import { Info } from '@/app/_icons/icons/info'
import { ClaimForm } from './ClaimForm'

// Same visual language as the homepage hero: the tactile card stack, but every
// card says thank you. Only a buyer sees it; everyone else gets the hello stack.
export const THANKS_CARDS = ['Thank you', 'Merci', 'Danke', 'Gracias', 'Grazie', 'ありがとう', '谢谢', 'Tack', '♥']
export const THANKS_PILL = 'Thank you for supporting AI Canvas'

// The claim surface: the pricing card's anatomy (the form on the card, a note
// in the inset well under it), narrowed to the width of one email field. It
// rises in right after the hero so the one thing to do here arrives with it.
export function ClaimCard({ note }: { note: ReactNode }) {
  return (
    <div
      className="aic-hero-rise mx-auto mt-10 w-full max-w-md rounded-3xl border border-sand-200 bg-sand-100 p-2 text-left dark:border-sand-800 dark:bg-sand-900"
      style={{ animationDelay: '0.42s' }}
    >
      <div className="px-4 pt-4 pb-5 sm:px-5 sm:pt-5">
        <ClaimForm />
      </div>
      <div className="flex items-start gap-2.5 rounded-2xl bg-sand-50/70 px-4 py-4 text-sm leading-relaxed text-sand-600 sm:px-5 dark:bg-sand-950 dark:text-sand-400">
        <Info size={16} className="mt-0.5 shrink-0 text-accent" />
        <span>{note}</span>
      </div>
    </div>
  )
}
