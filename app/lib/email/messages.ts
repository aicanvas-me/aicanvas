// ─── email/messages ───────────────────────────────────────────────────────────
// App-sent lifecycle emails (NOT Supabase auth templates). Each returns the
// rendered HTML using the shared adaptive shell so they match every other email.
// Senders/triggers live in the routes that call these (auth callback, cancel-
// confirm, renewal-thanks cron) along with their send-once guards.

import { emailShell, emailText, escapeHtml } from './shell'

/** A thank-you sent about two days before a subscription renews. The cron in
 *  app/api/cron/renewal-thanks decides who gets it and guards against a
 *  second send for the same renewal. No calendar date on purpose: a UTC date
 *  can be a day off in the reader's own timezone, "the next few days" never is. */
export function renewalThanksEmail(opts: { plan: 'monthly' | 'annual' }): { subject: string; html: string } {
  const p = (text: string, kind: 'secondary' | 'muted' = 'secondary', margin = '0 0 16px 0') =>
    `<p ${emailText(kind, `margin:${margin};font-size:${kind === 'muted' ? 13 : 15}px;line-height:1.6;`)}>${text}</p>`
  const html = emailShell({
    title: 'A quick thank you from AI Canvas',
    heading: 'You make this <span class="ac-accent" style="color:#0369A1;">possible</span>.',
    bodyHtml: p('AI Canvas is built by one person, and every Premium member is the reason it keeps going. So before your plan renews, I just wanted to say thank you.', 'secondary', '0'),
    button: { label: 'See what your support built lately', url: 'https://aicanvas.me' },
    afterHtml:
      p('What should I build next? Hit reply and tell me. Your answer goes straight into the plan.') +
      p('Thanks for being here,<br />Alex', 'secondary', '0 0 24px 0') +
      p(`Your ${opts.plan} plan renews in the next few days. Nothing to do on your side.`, 'muted', '0'),
    footerNoteHtml: `Manage or cancel your plan anytime from your <a href="https://aicanvas.me/account/settings" ${emailText('muted', 'text-decoration:underline;')}>account settings</a>. Rather not get notes like this? Switch off Product updates there, free and anytime.`,
  })
  return { subject: 'A quick thank you from AI Canvas', html }
}

/** Onboarding email, sent once after a brand-new account's first confirmation.
 *  The "send only for accounts created after launch, once" guard lives in the
 *  auth callback so existing users never receive it. */
export function welcomeEmail(): { subject: string; html: string } {
  const html = emailShell({
    title: 'Welcome to AI Canvas',
    heading: 'Welcome, hero.',
    bodyHtml: `<p ${emailText('secondary', 'margin:0;font-size:15px;line-height:1.6;')}>Your account is live. Grab any free component with its full source code and remix it with your AI coding agent. Everything ships ready to paste into your project.</p>`,
    button: { label: 'Start building', url: 'https://aicanvas.me' },
    footerNoteHtml: 'You are getting this because an AI Canvas account was just created with this address.',
  })
  return { subject: 'Welcome to AI Canvas', html }
}

/** Sent ONCE when a subscription goes active (the upgrade moment), in the
 *  site's superhero voice. The send-once guard (welcome_claimed_at on the
 *  subscription row, one conditional UPDATE) lives in the Paddle webhook, and
 *  it's non-fatal there so it can never block subscription activation. */
export function welcomeToPremiumEmail(): { subject: string; html: string } {
  const html = emailShell({
    title: 'You just got superpowers',
    heading: 'You just got <span class="ac-accent" style="color:#0369A1;">superpowers</span>.',
    bodyHtml: `<p ${emailText('secondary', 'margin:0;font-size:15px;line-height:1.6;')}>Premium is live on your account. Every design system drops in with one command, and every premium component and template is yours, including every new one the moment it ships. Go build something only you could.</p>`,
    button: { label: 'Use your powers', url: 'https://aicanvas.me/components' },
    footerNoteHtml: 'Manage or cancel your plan anytime from your account settings.',
  })
  return { subject: 'You just got superpowers', html }
}

// The claim emails' sign-in parts. With a link, the email IS the way in, so the
// buyer gets one AI Canvas email after paying; without one (minting failed) the
// button falls back to /welcome, which mails a fresh link on request.
const WELCOME_LINK = `<a href="https://aicanvas.me/welcome" ${emailText('muted', 'text-decoration:underline;')}>aicanvas.me/welcome</a>`
function signInParts(signInUrl: string | null) {
  return signInUrl
    ? {
        button: { label: 'Sign in to AI Canvas', url: escapeHtml(signInUrl) },
        note: `This button works once, within 1 hour. After that, get a new link at ${WELCOME_LINK}.`,
      }
    : {
        button: { label: 'Sign in to AI Canvas', url: 'https://aicanvas.me/welcome' },
        note: `${WELCOME_LINK} emails you a one-time sign-in link.`,
      }
}

/** Who the account is: "we created it" only for an account the checkout made
 *  that was never signed into; anyone else already had it. */
export type ClaimAccount = { email: string; created: boolean }
function accountLine(a: ClaimAccount, forGood: boolean): string {
  const who = `<strong ${emailText('primary')}>${escapeHtml(a.email)}</strong>`
  return a.created
    ? `We created your AI Canvas account for ${who}, with Premium on it${forGood ? ' for good' : ''}.`
    : `Premium is now on your AI Canvas account, ${who}.`
}

/** Sent ONCE when a signed-out checkout activates a subscription. It carries a
 *  one-time sign-in link minted AFTER the send-once claim (welcome_claimed_at on
 *  the subscription row, in the Paddle webhook, shared with the welcome email so
 *  a buyer never gets both), so no second delivery can replace it. */
export function claimPremiumAccountEmail(opts: { signInUrl: string | null; account: ClaimAccount }): { subject: string; html: string } {
  const s = signInParts(opts.signInUrl)
  const html = emailShell({
    title: 'Sign in to your Premium account',
    heading: 'You just got <span class="ac-accent" style="color:#0369A1;">superpowers</span>.',
    bodyHtml: `<p ${emailText('secondary', 'margin:0;font-size:15px;line-height:1.6;')}>Your payment went through. ${accountLine(opts.account, false)}</p>`,
    button: s.button,
    footerNoteHtml: `${s.note} Didn&rsquo;t buy AI Canvas Premium? Ignore this email.`,
  })
  return { subject: 'Sign in to your AI Canvas Premium account', html }
}

/** Closes the loop after the cancellation-confirm link actually cancels the
 *  Paddle subscription. Only sent when a real cancel was executed this request
 *  (see app/api/billing/cancel-confirm), so a replayed link can't re-send. */
export function cancellationConfirmedEmail(opts: { endsAt: Date | null }): { subject: string; html: string } {
  const ends = opts.endsAt
    ? opts.endsAt.toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
    : 'the end of your current billing period'
  const bodyHtml = `<p ${emailText('secondary', 'margin:0;font-size:15px;line-height:1.6;')}>Your AI Canvas Premium cancellation is confirmed. You keep full access until <strong ${emailText('primary')}>${ends}</strong>, and you won't be charged again.</p>`
  const html = emailShell({
    title: 'Your cancellation is confirmed',
    heading: 'Your cancellation is confirmed',
    bodyHtml,
  })
  return { subject: 'Your cancellation is confirmed', html }
}

/** Sent each time a person allows an AI agent on the hosted MCP's consent screen. It is
 *  the one alert that reaches someone after a look-alike agent tricked them into Allow,
 *  so it says where the agent finished signing in and flags a country that differs from
 *  the browser's. Countries are display names (or null when unknown). */
export function agentConnectedEmail(opts: {
  agentName: string
  agentCountry: string | null
  browserCountry: string | null
}): { subject: string; html: string } {
  const p = (text: string, kind: 'secondary' | 'muted' = 'secondary', margin = '0 0 16px 0') =>
    `<p ${emailText(kind, `margin:${margin};font-size:${kind === 'muted' ? 13 : 15}px;line-height:1.6;`)}>${text}</p>`
  const name = escapeHtml(opts.agentName)
  const where = opts.agentCountry ? ` It signed in from ${escapeHtml(opts.agentCountry)}.` : ''
  const mismatch =
    opts.agentCountry && opts.browserCountry && opts.agentCountry !== opts.browserCountry
      ? p(
          `It finished signing in from ${escapeHtml(opts.agentCountry)} while your browser was in ${escapeHtml(opts.browserCountry)}. If that is unexpected, disconnect it and change your API key.`,
        )
      : ''
  const html = emailShell({
    title: 'An AI agent connected to your AI Canvas account',
    heading: 'An AI agent connected to your account',
    bodyHtml:
      p(`It can now search AI Canvas and install what your plan includes. It calls itself &ldquo;${name}&rdquo;.${where}`) +
      mismatch +
      p('Not you? Disconnect it in your settings and change your API key there.', 'secondary', '0'),
    button: { label: 'See connected AI agents', url: 'https://aicanvas.me/account/settings#ai-agents' },
    footerNoteHtml: 'You are getting this because an AI agent was allowed to use this AI Canvas account.',
  })
  return { subject: 'An AI agent connected to your AI Canvas account', html }
}

/** Sent ONCE per Lifetime purchase, after the grant. The send-once guard
 *  (welcome_claimed_at on the user_lifetime_access row, one conditional UPDATE)
 *  lives in lib/identity/lifetime.ts. A buyer who checked out signed out gets
 *  the claim variant, which carries the one-time sign-in link. When the
 *  buyer's old subscription is set to cancel, the email says when it stops, so
 *  there is no separate cancel email. */
export function lifetimeEmail(opts: {
  /** The signed-out buyer's account, for the claim variant; null otherwise. */
  claim: ClaimAccount | null
  signInUrl?: string | null
  planStops: { plan: 'monthly' | 'annual' | null; effectiveAt: string | null } | null
}): { subject: string; html: string } {
  const p = (text: string, kind: 'secondary' | 'muted' = 'secondary', margin = '0 0 16px 0') =>
    `<p ${emailText(kind, `margin:${margin};font-size:${kind === 'muted' ? 13 : 15}px;line-height:1.6;`)}>${text}</p>`
  const s = signInParts(opts.signInUrl ?? null)
  const lead = opts.claim
    ? `Your Lifetime payment went through. ${accountLine(opts.claim, true)}`
    : 'Your Lifetime payment went through and Premium is live on your account for good. Every design system, premium component and template is yours, including every new one the moment it ships. One payment, nothing to renew.'
  let stops = ''
  if (opts.planStops) {
    const plan = opts.planStops.plan === 'annual' ? 'yearly' : opts.planStops.plan === 'monthly' ? 'monthly' : 'subscription'
    const d = opts.planStops.effectiveAt ? new Date(opts.planStops.effectiveAt) : null
    const when = d && !isNaN(d.getTime())
      ? d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
      : 'the end of its current billing period'
    stops = p(`Your ${plan} plan stops on <strong ${emailText('primary')}>${when}</strong>, nothing more will be charged.`)
  }
  const html = emailShell({
    title: 'Premium is yours for life',
    heading: 'Premium is yours <span class="ac-accent" style="color:#0369A1;">for life</span>.',
    bodyHtml: p(lead, 'secondary', stops ? '0 0 16px 0' : '0') + stops,
    button: opts.claim ? s.button : { label: 'Use your powers', url: 'https://aicanvas.me/components' },
    footerNoteHtml: opts.claim
      ? `${s.note} Didn&rsquo;t buy AI Canvas Lifetime? Ignore this email.`
      : 'Lifetime has no renewal and nothing to cancel.',
  })
  return {
    subject: opts.claim ? 'Sign in to your AI Canvas Lifetime account' : 'Premium is yours for life',
    html,
  }
}
