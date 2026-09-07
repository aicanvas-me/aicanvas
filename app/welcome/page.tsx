import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Info } from '@phosphor-icons/react/dist/ssr'
import { HeaderSocials } from '../components/HeaderSocials'
import { SiteFooter } from '../components/SiteFooter'
import { buttonClasses } from '../components/buttonClasses'
import { StackedCards } from '../home/islands'
import { getSessionEntitlement } from '../lib/entitlement'
import { createClient } from '../lib/supabase/server'
import { ClaimForm } from './ClaimForm'
import { PremiumQuickstart } from './PremiumQuickstart'

export const metadata: Metadata = {
  title: 'Welcome to Premium',
  // Post-checkout claim page — not a destination we want indexed.
  robots: { index: false, follow: false },
}

// Same visual language as the homepage hero: the tactile card stack, but every
// card says thank you — this page only exists because someone just paid.
const THANKS_CARDS = ['Thank you', 'Merci', 'Danke', 'Gracias', 'Grazie', 'ありがとう', '谢谢', 'Tack', '♥']

// ─── /welcome ─────────────────────────────────────────────────────────────────
// THE post-purchase page — every confirmed Paddle checkout lands here (signed-in
// fast-path and anonymous pending-claim alike; see app/lib/paddle/client.ts).
// State-aware, three views:
//   • no session      → the claim form: the webhook provisioned a passwordless
//     account under the checkout email; enter it, get a one-time sign-in link.
//     Deliberately NO OAuth here — a Google login under a different address
//     creates a fresh free account and shows a paying buyer the paywall.
//   • session, premium → advantage first (every install command carries your
//     token), browse CTAs, then the quiet terminal/MCP helper card.
//   • session, free    → mismatch view: this account holds no Premium; claim
//     the checkout-email account instead (or see plans).
// Claiming is self-service, so a lost/delayed claim email is never a lockout.

export default async function WelcomePage() {
  // Fail SOFT to the claim view: this page must render for a buyer even when
  // the session or subscription read hiccups — the claim form works either way.
  let tier: 'anonymous' | 'free' | 'premium' = 'anonymous'
  let email: string | null = null
  let token: string | null = null
  try {
    const ent = await getSessionEntitlement()
    if (ent.userId) {
      tier = ent.tier === 'premium' ? 'premium' : 'free'
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      email = user?.email ?? null
      // Same RLS-scoped read settings uses; resilient — a missing row just
      // renders the settings pointer instead of the token.
      const { data: keyRow } = await supabase
        .from('user_api_keys')
        .select('token')
        .eq('user_id', ent.userId)
        .maybeSingle()
      token = (keyRow?.token ?? null) as string | null
    }
  } catch {
    /* anonymous view */
  }

  return (
    // Scoped dark: this page is a dark set piece with no light rendering, so
    // it opts out of the site theme the way pinned-dark.ts documents.
    <div className="dark min-h-full bg-sand-950">
      <header className="sticky top-0 z-30 hidden h-14 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-sand-800 bg-sand-950 px-6 md:grid">
        <div />
        <Link href="/welcome" className="text-sm font-semibold text-olive-500 transition-colors hover:text-olive-400">
          /Welcome
        </Link>
        <div className="flex items-center justify-end">
          <HeaderSocials />
        </div>
      </header>

      <main className="relative mx-auto w-full min-w-0 max-w-4xl px-4 pt-6 pb-16 sm:px-6 sm:pt-12">
        <section className="flex flex-col items-center text-center">
          <StackedCards cards={THANKS_CARDS} />

          {tier !== 'free' && (
            <span className="aic-hero-rise mb-5 inline-flex items-center rounded-full border border-sand-700 bg-sand-900 px-3 py-1 text-xs font-semibold text-sand-300" style={{ animationDelay: '0.1s' }}>
              Thank you for supporting AI Canvas
            </span>
          )}

          {tier === 'premium' ? (
            <>
              <h1 className="aic-hero-slide text-balance text-2xl font-extrabold tracking-tight text-sand-50 sm:text-4xl" style={{ animationDelay: '0.18s' }}>
                You&rsquo;re <span className="text-olive-500">Premium</span>.
              </h1>
              <p className="aic-hero-rise mt-4 max-w-2xl text-base leading-relaxed text-sand-400" style={{ animationDelay: '0.26s' }}>
                Premium is live on{' '}
                {email ? (
                  <strong className="font-semibold text-sand-50">{email}</strong>
                ) : (
                  <>your account</>
                )}
                .{' '}
                {token
                  ? 'Every install command on this site now carries your personal token. Copy any of them, paste in your terminal, it just works.'
                  : 'Everything is unlocked.'}
              </p>
              <div className="aic-hero-rise mt-7 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '0.34s' }}>
                <Link href="/design-systems/andromeda" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
                  Browse Andromeda
                  <ArrowRight weight="regular" size={14} />
                </Link>
                <Link
                  href="/components"
                  className="flex items-center gap-1.5 rounded-xl border border-sand-700 px-5 py-2.5 text-sm font-semibold text-sand-300 transition-colors hover:border-sand-600 hover:text-sand-100"
                >
                  All components
                </Link>
              </div>
              {token && (
                <p className="aic-hero-rise mx-auto mt-6 flex w-full max-w-2xl items-start justify-center gap-2 text-left text-xs leading-relaxed text-sand-500" style={{ animationDelay: '0.4s' }}>
                  <Info weight="regular" size={16} className="mt-0.5 shrink-0 text-olive-400" />
                  <span>
                    Copy install commands while signed in with this account. That is
                    what bakes your personal token into them.
                  </span>
                </p>
              )}
              <PremiumQuickstart token={token} />
            </>
          ) : tier === 'free' ? (
            <>
              <h1 className="aic-hero-slide text-balance text-2xl font-extrabold tracking-tight text-sand-50 sm:text-4xl" style={{ animationDelay: '0.18s' }}>
                Almost there.
              </h1>
              <p className="aic-hero-rise mt-4 max-w-2xl text-base leading-relaxed text-sand-400" style={{ animationDelay: '0.26s' }}>
                You&rsquo;re signed in{email ? (
                  <> as <strong className="font-semibold text-sand-50">{email}</strong></>
                ) : null}, and Premium isn&rsquo;t active on this account. Paid with
                a different email at checkout? Enter that address below and
                we&rsquo;ll send a sign-in link to your Premium account.
              </p>
              <ClaimForm />
              <p className="mx-auto mt-6 flex max-w-xl items-start gap-2 text-left text-xs leading-relaxed text-sand-500">
                <Info weight="regular" size={16} className="mt-0.5 shrink-0 text-olive-400" />
                Install commands only carry your personal token while you are
                signed in with your Premium account.
              </p>
              <p className="mt-4 text-sm text-sand-500">
                No purchase yet?{' '}
                <Link href="/pricing" className="font-medium text-olive-400 transition-colors hover:text-olive-300">
                  See Premium plans
                </Link>
                {' '}&middot; Subscribed with this email?{' '}
                <Link href="/account/settings" className="font-medium text-olive-400 transition-colors hover:text-olive-300">
                  Check billing
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="aic-hero-slide text-balance text-2xl font-extrabold tracking-tight text-sand-50 sm:text-4xl" style={{ animationDelay: '0.18s' }}>
                Payment received. You&rsquo;re <span className="text-olive-500">Premium</span>.
              </h1>
              <p className="aic-hero-rise mt-4 max-w-2xl text-base leading-relaxed text-sand-400" style={{ animationDelay: '0.26s' }}>
                Your account is ready under the email you used at checkout. Enter
                that email and we&rsquo;ll send you a one-time sign-in link. No
                password needed.
              </p>
              <ClaimForm />
              <p className="mt-6 flex items-center justify-center gap-2 text-sm text-sand-500">
                <Info weight="regular" size={16} className="shrink-0 text-olive-400" />
                You can come back to this page and claim any time.
              </p>
            </>
          )}
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}
