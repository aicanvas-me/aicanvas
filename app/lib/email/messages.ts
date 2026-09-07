// ─── email/messages ───────────────────────────────────────────────────────────
// App-sent lifecycle emails (NOT Supabase auth templates). Each returns the
// rendered HTML using the shared adaptive shell so they match every other email.
// Senders/triggers live in the routes that call these (auth callback, cancel-
// confirm) along with their send-once guards.

import { emailShell, emailText } from './shell'

/** Onboarding email, sent once after a brand-new account's first confirmation.
 *  The "send only for accounts created after launch, once" guard lives in the
 *  auth callback so existing users never receive it. */
export function welcomeEmail(): { subject: string; html: string } {
  const html = emailShell({
    title: 'Welcome to AI Canvas',
    heading: 'Welcome, hero.',
    bodyHtml: `<p ${emailText('secondary', 'margin:0;font-size:15px;line-height:1.6;')}>Your account is live. Grab any free component with its full source code and remix it with your AI coding agent. Everything ships ready to paste into your project.</p>`,
    button: { label: 'Start building', url: 'https://aicanvas.me' },
  })
  return { subject: 'Welcome to AI Canvas', html }
}

/** Sent ONCE when a subscription goes active (the upgrade moment), in the
 *  site's superhero voice. The send-once guard (premium_welcome_sent in
 *  user_metadata) lives in the Paddle webhook, and it's non-fatal there so it
 *  can never block subscription activation. */
export function welcomeToPremiumEmail(): { subject: string; html: string } {
  const html = emailShell({
    title: 'You just got superpowers',
    heading: 'You just got <span class="ac-accent" style="color:#869631;">superpowers</span>.',
    bodyHtml: `<p ${emailText('secondary', 'margin:0;font-size:15px;line-height:1.6;')}>Premium is live on your account. Every design system drops in with one command, and every premium component and template is yours, including every new one the moment it ships. Go build something only you could.</p>`,
    button: { label: 'Use your powers', url: 'https://aicanvas.me/components' },
    footerNoteHtml: 'Manage or cancel your plan anytime from your account settings.',
  })
  return { subject: 'You just got superpowers', html }
}

/** Sent ONCE when an ANONYMOUS checkout provisions a fresh account (the buyer
 *  paid without signing in first). Points to self-service sign-in rather than a
 *  one-time magic-link token: the buyer requests a fresh OTP themselves, so
 *  there is no single-slot token a concurrent webhook delivery could invalidate,
 *  and a lost/delayed email is not a lockout (they can sign in any time with the
 *  email they paid with). The send-once guard (premium_welcome_sent in
 *  user_metadata) lives in the Paddle webhook, shared with the welcome email so
 *  a buyer never gets both. */
export function claimPremiumAccountEmail(): { subject: string; html: string } {
  const html = emailShell({
    title: 'Access your Premium account',
    heading: 'You just got <span class="ac-accent" style="color:#869631;">superpowers</span>.',
    bodyHtml: `<p ${emailText('secondary', 'margin:0;font-size:15px;line-height:1.6;')}>Your payment went through and Premium is live on your account. Sign in with the email you used at checkout to get in, no password needed. Every design system, premium component, and template is yours, including every new one the moment it ships.</p>`,
    button: { label: 'Claim your Premium account', url: 'https://aicanvas.me/welcome' },
    footerNoteHtml: 'The claim page asks for this email address and sends you a one-time sign-in link. You can set a password later in your account settings. If you did not purchase AI Canvas Premium, you can ignore this email and contact support to have the account removed.',
  })
  return { subject: 'Access your AI Canvas Premium account', html }
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
