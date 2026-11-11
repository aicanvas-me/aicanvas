import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from '@/app/_icons/icons/arrow-right'
import { Bolt } from '@/app/_icons/icons/bolt'
import { Info } from '@/app/_icons/icons/info'
import { PageHero, PageShell } from '../components/PageKit'
import { buttonClasses } from '../components/buttonClasses'
import { StackedCards } from '../home/islands'
import { getPremiumForUser } from '../../lib/identity/premium'
import { createAdminClient } from '../lib/supabase/admin'
import { createClient } from '../lib/supabase/server'
import { ClaimForm } from './ClaimForm'
import { LinkSentCard } from './LinkSentCard'
import { PremiumQuickstart } from './PremiumQuickstart'
import { ConnectAgentCard } from '../mcp/ConnectAgentCard'
import { hostedMcpOAuthEnabled } from '../../lib/flags'

export const metadata: Metadata = {
  title: 'Welcome to Premium',
  // Post-checkout claim page — not a destination we want indexed.
  robots: { index: false, follow: false },
}

// Same visual language as the homepage hero: the tactile card stack, but every
// card says thank you — this page only exists because someone just paid.
const THANKS_CARDS = ['Thank you', 'Merci', 'Danke', 'Gracias', 'Grazie', 'ありがとう', '谢谢', 'Tack', '♥']

// The claim surface: the pricing card's anatomy (the form on the card, a note
// in the inset well under it), narrowed to the width of one email field. It
// rises in right after the hero so the one thing to do here arrives with it.
function ClaimCard({ note }: { note: ReactNode }) {
  return (
    <div
      className="aic-hero-rise mx-auto mt-10 w-full max-w-md rounded-3xl border border-sand-800 bg-sand-900 p-2 text-left"
      style={{ animationDelay: '0.42s' }}
    >
      <div className="px-4 pt-4 pb-5 sm:px-5 sm:pt-5">
        <ClaimForm />
      </div>
      <div className="flex items-start gap-2.5 rounded-2xl bg-sand-950 px-4 py-4 text-sm leading-relaxed text-sand-400 sm:px-5">
        <Info size={16} className="mt-0.5 shrink-0 text-accent" />
        <span>{note}</span>
      </div>
    </div>
  )
}

// THE post-purchase page: every confirmed Paddle checkout lands here, signed-in
// fast-path and anonymous pending-claim alike. Three views: no session gets the
// "check your inbox" view (the webhook provisioned a passwordless account under
// the checkout email and mails it a sign-in link), a premium session gets the
// token-carrying install commands, a free session gets the mismatch view.
// Deliberately NO OAuth here: a Google login under a different address creates
// a fresh free account and shows a paying buyer the paywall. A new link is
// self-service, so a lost or delayed email is never a lockout.

export default async function WelcomePage() {
  // Fail SOFT to the signed-out view: this page must render for a buyer even
  // when the session or subscription read hiccups; its new-link form works
  // either way.
  let tier: 'anonymous' | 'free' | 'premium' = 'anonymous'
  let lifetime = false
  let email: string | null = null
  let token: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // The same premium resolution getSessionEntitlement runs, plus Lifetime.
      const state = await getPremiumForUser(createAdminClient(), user.id)
      tier = state.premium ? 'premium' : 'free'
      lifetime = state.lifetime === true
      email = user.email ?? null
      // Same RLS-scoped read settings uses; resilient — a missing row just
      // renders the settings pointer instead of the token.
      const { data: keyRow } = await supabase
        .from('user_api_keys')
        .select('token')
        .eq('user_id', user.id)
        .maybeSingle()
      token = (keyRow?.token ?? null) as string | null
    }
  } catch {
    /* anonymous view */
  }

  // The free view is a mismatch, not a purchase, so it does not say thanks.
  const pill = tier !== 'free' ? 'Thank you for supporting AI Canvas' : undefined

  return (
    // Scoped dark: this page is a dark set piece with no light rendering, so
    // it opts out of the site theme the way pinned-dark.ts documents.
    // `contents` keeps the wrapper out of layout, so the shell's min-h-full
    // still measures the page slot and the wordmark sits at the bottom of a
    // short view; the class still scopes every dark: rule below it.
    <div className="dark contents">
      <PageShell>
        {/* The homepage opens a step higher than the shell; the stack takes
            that step back so the hero sits where it does on the homepage. */}
        <div className="-mt-4">
          <StackedCards cards={THANKS_CARDS} />
        </div>

        {/* pb: no closing band here, so the views keep their own air above the
            footer rule instead of sitting on it. */}
        <div className="pb-12 sm:pb-20">
          {tier === 'premium' ? (
            <>
              <PageHero
                pill={pill}
                title={
                  <>
                    You&rsquo;re <span className="text-accent">Premium</span>
                    {lifetime ? ' for life' : ''}.
                  </>
                }
                sub={
                  // The plan line is a Premium chip on its own row; the token
                  // sentence is balanced so its last word never sits alone.
                  <>
                    <span className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-premium/10 px-3.5 py-1.5 text-sm ring-1 ring-inset ring-premium/30">
                      <Bolt size={14} className="shrink-0 text-premium" />
                      <span className="shrink-0 font-semibold text-premium">{lifetime ? 'Lifetime' : 'Premium'}</span>
                      <span className="shrink-0 text-sand-300">is live on</span>
                      <strong className="min-w-0 truncate font-semibold text-sand-50">{email ?? 'your account'}</strong>
                    </span>
                    <span className="block text-pretty sm:text-balance">
                      {token
                        ? 'Every install command on this site now carries your personal token. Copy any of them, paste in your terminal, it just works.'
                        : 'Everything is unlocked.'}
                    </span>
                  </>
                }
              >
                <Link href="/design-systems/andromeda-pro" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
                  Explore Andromeda Pro
                  <ArrowRight size={14} />
                </Link>
                <Link href="/account" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
                  View your account
                </Link>
              </PageHero>
              {hostedMcpOAuthEnabled() ? (
                <div className="mx-auto mt-16 w-full max-w-3xl text-left sm:mt-24">
                  <ConnectAgentCard />
                </div>
              ) : (
                <>
                {token && (
                  <p
                    className="aic-hero-rise mx-auto mt-6 flex w-full max-w-xl items-start justify-center gap-2 text-left text-sm leading-relaxed text-sand-400"
                    style={{ animationDelay: '0.4s' }}
                  >
                    <Info size={16} className="mt-0.5 shrink-0 text-accent" />
                    <span className="text-balance">
                      Copy install commands while signed in with this account. That is
                      what bakes your personal token into them.
                    </span>
                  </p>
                )}
                <PremiumQuickstart token={token} />
                </>
              )}
            </>
          ) : tier === 'free' ? (
            <>
              <PageHero
                title="Almost there."
                sub={
                  <span className="block text-pretty sm:text-balance">
                    You&rsquo;re signed in{email ? (
                      <> as <strong className="font-semibold text-sand-50">{email}</strong></>
                    ) : null}, and Premium isn&rsquo;t active on this account. Paid with
                    a different email at checkout? Enter that address below and
                    we&rsquo;ll send a sign-in link to your Premium account.
                  </span>
                }
              />
              <ClaimCard
                note={
                  <>
                    Install commands only carry your personal token while you are
                    signed in with your Premium account.
                  </>
                }
              />
              <p className="mt-8 text-center text-sm leading-relaxed text-sand-400">
                No purchase yet?{' '}
                <Link href="/pricing" className="font-semibold text-accent transition-colors hover:text-accent/70">
                  See Premium plans
                </Link>
                {' '}&middot; Paid with this email?{' '}
                <Link href="/account/settings" className="font-semibold text-accent transition-colors hover:text-accent/70">
                  Check billing
                </Link>
              </p>
            </>
          ) : (
            <>
              <PageHero
                pill={pill}
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
              <LinkSentCard />
            </>
          )}
        </div>
      </PageShell>
    </div>
  )
}
