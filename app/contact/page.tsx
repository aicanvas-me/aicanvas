'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, EnvelopeSimple } from '@phosphor-icons/react'
import { Button } from '../components/Button'
import { CARD, EYEBROW, PageHero, PageShell } from '../components/PageKit'

// ─── /contact ─────────────────────────────────────────────────────────────────
// The public contact form. Posts {name, email, message} to /api/contact, which
// sends a branded email from contact@aicanvas.me to the project inbox with
// reply_to set to the visitor. Replaces the old mailto: links in the nav.
//
// Layout: the shared page shell (homepage column, footer, wordmark) with the
// hero centred over one form card. A client page because of the form state;
// the shell and hero render the same here as on the server pages. Kept in step
// with /feedback, so the two forms read as siblings.

// Inputs sit one step lighter than the card in light and one step darker in
// dark, so a field reads as a well in the surface in both themes. The focus
// border is the accent, which stays dark enough on sand-50 to mark focus on
// its own.
const INPUT_CLASS =
  'block w-full rounded-control border border-sand-300 bg-sand-50 px-4 py-2.5 text-base text-sand-900 outline-none transition-[border-color,box-shadow] placeholder:text-sand-600 hover:border-sand-400 focus:border-accent focus:ring-4 focus:ring-accent/15 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-50 dark:placeholder:text-sand-500 dark:hover:border-sand-700 dark:focus:ring-accent/20 md:text-sm'
const LABEL_CLASS = `mb-2 block ${EYEBROW}`
// The form card: the v3 surface, centred under the hero, rising in on the
// hero's stagger so the page arrives as one sequence.
const CARD_CLASS = `aic-hero-rise relative mx-auto mt-12 w-full max-w-2xl overflow-hidden sm:mt-14 ${CARD}`

// A thin accent light on the card's top edge, the same mark the "Still have a
// question?" card carries on the pages that link here.
function CardLight() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px w-40 bg-gradient-to-r from-transparent via-accent to-transparent"
    />
  )
}

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('') // honeypot — must stay empty
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, website }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.')
        return
      }
      setSent(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell>
      <PageHero
        pill="Get in touch"
        pillIcon={<EnvelopeSimple weight="regular" size={12} className="text-accent" aria-hidden />}
        title="Contact"
        size="md"
        sub={
          // Balanced, so the centred lines break evenly instead of leaving
          // a short last line under the column.
          <span className="block text-balance">
            Have a question, spotted a bug, or want a component built? Send a
            message and it lands straight in our inbox. We read every one and
            reply by email, usually within a day or two.
          </span>
        }
      />

      <div className="pb-12 sm:pb-20">
        {sent ? (
          <div
            className={`${CARD_CLASS} px-6 py-12 text-center sm:px-12 sm:py-14`}
            style={{ animationDelay: '0.05s' }}
          >
            <CardLight />
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-success/30 bg-success/10">
              <CheckCircle weight="regular" size={24} className="text-success" />
            </span>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-sand-900 dark:text-sand-50">Message sent</h2>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-sand-700 dark:text-sand-300">
              Thanks, {name || 'there'}. Your message is on its way and we&apos;ll
              reply to <strong className="font-semibold text-sand-900 dark:text-sand-50">{email}</strong>. No
              account or follow-up needed on your end.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className={`${CARD_CLASS} space-y-6 p-6 sm:p-10`}
            style={{ animationDelay: '0.42s' }}
          >
            <CardLight />

            {/* Honeypot: off-screen, hidden from humans and assistive tech. */}
            <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {/* Name and email share a row from sm up: two short answers
                side by side keep the card compact and the message field
                the clear centre of the form. */}
            <div className="grid gap-6 sm:grid-cols-2 sm:gap-5">
              <div>
                {/* All four fields are required. The asterisk is decorative:
                    the required state assistive tech announces comes from each
                    input's `required` attribute. Matches /feedback. */}
                <label htmlFor="name" className={LABEL_CLASS}>
                  Name <span aria-hidden="true" className="text-accent">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  autoFocus
                  autoComplete="name"
                  maxLength={100}
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="email" className={LABEL_CLASS}>
                  Email <span aria-hidden="true" className="text-accent">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  maxLength={200}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className={LABEL_CLASS}>
                Subject <span aria-hidden="true" className="text-accent">*</span>
              </label>
              <input
                id="subject"
                type="text"
                required
                maxLength={200}
                placeholder="What's this about?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor="message" className={LABEL_CLASS}>
                Message <span aria-hidden="true" className="text-accent">*</span>
              </label>
              <textarea
                id="message"
                required
                maxLength={5000}
                rows={6}
                placeholder="What's on your mind?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${INPUT_CLASS} min-h-[160px] resize-y leading-relaxed`}
              />
            </div>

            {error && (
              <div className="rounded-control border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="space-y-4 pt-1">
              <Button type="submit" variant="primary" size="lg" fullWidth disabled={submitting}>
                {submitting ? 'Sending…' : 'Send message'}
              </Button>

              {/* Matches /feedback. Only true while the route uses the address
                  for reply_to and nothing else: no Brevo call, no list. */}
              <p className="text-center text-xs leading-relaxed text-sand-600 dark:text-sand-400">
                We only use your email to reply.{' '}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-sand-900 dark:hover:text-sand-200">
                  Privacy policy
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </PageShell>
  )
}
