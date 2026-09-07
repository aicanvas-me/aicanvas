'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle } from '@phosphor-icons/react'
import { Button } from '../components/Button'
import { SiteFooter } from '../components/SiteFooter'
import { HeaderSocials } from '../components/HeaderSocials'

// ─── /contact ─────────────────────────────────────────────────────────────────
// The public contact form. Posts {name, email, message} to /api/contact, which
// sends a branded email from contact@aicanvas.me to the project inbox with
// reply_to set to the visitor. Replaces the old mailto: links in the nav.
//
// Follows the site theme like every other long-form page. It used to be dark
// only, which cost nothing back when the site had no light mode to follow, and
// it also pinned the scroll parent dark from JS. Both are gone.
//
// Layout: the page is a flex column so the footer is pushed to the bottom when
// the content is short (e.g. the success state). The footer lives INSIDE <main>
// so it shares the same max-width + horizontal padding as the content and their
// left/right edges line up (matching /privacy and /terms).

const INPUT_CLASS =
  'w-full rounded-lg border border-sand-300 bg-sand-50 px-3 py-2 text-base text-sand-900 outline-none transition-colors placeholder:text-sand-600 focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-50 md:text-sm'
const LABEL_CLASS =
  'mb-1 block text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400'

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
    <div className="flex min-h-full flex-col bg-sand-50 dark:bg-sand-950">
      <header className="sticky top-0 z-50 hidden h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-sand-200 bg-sand-50 px-6 dark:border-sand-800 dark:bg-sand-950 md:grid">
        <div />
        <Link
          href="/contact"
          className="text-sm font-semibold text-olive-600 transition-colors hover:text-olive-800 dark:text-olive-500 dark:hover:text-olive-400"
        >
          /Contact
        </Link>
        <div className="flex items-center justify-end">
          <HeaderSocials />
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pt-6 pb-8 sm:px-6 sm:pt-12">
        <div className="flex-1">
          <p className="mb-6 text-sm font-semibold md:hidden">
            <span className="text-olive-600 dark:text-olive-500">/Contact</span>
          </p>

          <h1 className="text-center text-3xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-4xl">
            Contact
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-sand-600 dark:text-sand-400">
            Have a question, spotted a bug, or want a component built? Send a
            message and it lands straight in our inbox. We read every one and
            reply by email, usually within a day or two.
          </p>

          {sent ? (
            <div className="mx-auto mt-8 w-full max-w-xl rounded-2xl border border-olive-500/30 bg-olive-500/10 p-6">
              <div className="flex items-start gap-3">
                <CheckCircle weight="regular" size={22} className="mt-0.5 shrink-0 text-olive-600 dark:text-olive-400" />
                <div>
                  <h2 className="text-base font-bold text-sand-900 dark:text-sand-50">Message sent</h2>
                  <p className="mt-1 text-sm leading-relaxed text-sand-700 dark:text-sand-300">
                    Thanks, {name || 'there'}. Your message is on its way and we&apos;ll
                    reply to <strong className="text-sand-900 dark:text-sand-100">{email}</strong>. No
                    account or follow-up needed on your end.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 w-full max-w-xl space-y-4 rounded-2xl border border-sand-200 bg-sand-100 p-6 dark:border-sand-800 dark:bg-sand-900 sm:p-8"
            >
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

              <div>
                {/* All four fields are required. The asterisk is decorative:
                    the required state assistive tech announces comes from each
                    input's `required` attribute. Matches /feedback. */}
                <label htmlFor="name" className={LABEL_CLASS}>
                  Name <span aria-hidden="true" className="text-olive-600 dark:text-olive-400">*</span>
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
                  Email <span aria-hidden="true" className="text-olive-600 dark:text-olive-400">*</span>
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

              <div>
                <label htmlFor="subject" className={LABEL_CLASS}>
                  Subject <span aria-hidden="true" className="text-olive-600 dark:text-olive-400">*</span>
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
                  Message <span aria-hidden="true" className="text-olive-600 dark:text-olive-400">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  maxLength={5000}
                  rows={6}
                  placeholder="What's on your mind?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${INPUT_CLASS} min-h-[140px] resize-y`}
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" size="md" fullWidth disabled={submitting}>
                {submitting ? 'Sending…' : 'Send message'}
              </Button>

              {/* Matches /feedback. Only true while the route uses the address
                  for reply_to and nothing else: no Brevo call, no list. */}
              <p className="text-center text-xs leading-relaxed text-sand-600 dark:text-sand-500">
                We only use your email to reply.{' '}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-sand-900 dark:hover:text-sand-300">
                  Privacy policy
                </Link>
              </p>
            </form>
          )}
        </div>

        <SiteFooter />
      </main>
    </div>
  )
}
