'use client'

import { useState } from 'react'
import { CheckCircle } from '@phosphor-icons/react'
import { buttonClasses } from '../buttonClasses'
import { track } from '../../lib/analytics'

// Business is not built. Rather than a dead "coming soon" button, the card asks
// for an address and, optionally, a team size — the one number that decides
// whether ten seats is the right bracket at all. It posts to /api/contact,
// which is already validated, rate limited, honeypotted and wired to Resend, so
// every signup lands in the inbox as a replyable email with no new backend,
// no table and no migration.
export function BusinessWaitlist({ plan, featured }: { plan: string; featured?: boolean }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [size, setSize] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)

  if (state === 'done') {
    return (
      <div role="status" className="mt-6 flex items-start gap-3 rounded-xl border border-olive-500/40 bg-olive-500/5 px-4 py-3 text-sm leading-relaxed text-sand-700 dark:text-sand-200">
        <CheckCircle weight="regular" size={18} className="mt-0.5 shrink-0 text-olive-600 dark:text-olive-400" />
        <span>You are on the list. We will email you before Business opens.</span>
      </div>
    )
  }

  if (!open) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setOpen(true)
            track('Business Waitlist', { plan, step: 'open' })
          }}
          className={`mt-6 ${buttonClasses({
            variant: featured ? 'primary' : 'outline',
            size: 'lg',
            fullWidth: true,
          })}`}
        >
          Join the waiting list
        </button>
        <p className="mt-2 text-center text-xs text-sand-600 dark:text-sand-500">
          Not open yet. Nothing to pay today.
        </p>
      </>
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setState('sending')
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // A fixed name, not the address: /api/contact caps name shorter than
        // email, so a long address would fail as a missing name.
        name: 'Business waitlist',
        email,
        website,
        subject: `Business waiting list (${plan})`,
        message: `Wants the Business plan, ${plan} card.\nTeam size: ${size.trim() || 'not given'}`,
      }),
    }).catch(() => null)

    if (!res?.ok) {
      const detail = res ? await res.json().catch(() => null) : null
      setError(detail?.error ?? 'Could not save that right now. Please try again shortly.')
      setState('idle')
      return
    }
    track('Business Waitlist', { plan, step: 'submit' })
    setState('done')
  }

  const field =
    'w-full rounded-lg border border-sand-300 bg-sand-50 px-3 py-2 text-base text-sand-900 placeholder:text-sand-600 focus:border-olive-500 focus:outline-none dark:border-sand-700 dark:bg-sand-950 dark:text-sand-50 dark:placeholder:text-sand-500 md:text-sm'

  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      <input
        type="email"
        required
        // The button that opened the form is gone, so focus lands here instead
        // of falling back to the page.
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        aria-label="Your work email"
        className={field}
      />
      <input
        type="text"
        value={size}
        onChange={(e) => setSize(e.target.value)}
        placeholder="How many people? (optional)"
        aria-label="How many people are on your team"
        className={field}
      />
      {/* Honeypot: humans never see this; bots fill everything. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        aria-hidden
      />
      {error && <p role="alert" className="text-sm text-sand-700 dark:text-sand-300">{error}</p>}
      <button
        type="submit"
        disabled={state === 'sending'}
        className={buttonClasses({
          variant: featured ? 'primary' : 'outline',
          size: 'lg',
          fullWidth: true,
        })}
      >
        {state === 'sending' ? 'Adding you…' : 'Join the waiting list'}
      </button>
      <p className="text-center text-xs text-sand-600 dark:text-sand-500">
        Not open yet. Nothing to pay today.
      </p>
    </form>
  )
}
