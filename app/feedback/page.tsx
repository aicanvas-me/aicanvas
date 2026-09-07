'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Bug,
  ChatCircleText,
  CheckCircle,
  CreditCard,
  DotsThreeCircle,
} from '@phosphor-icons/react'
import { Button } from '../components/Button'
import { SiteFooter } from '../components/SiteFooter'
import { HeaderSocials } from '../components/HeaderSocials'

// ─── /feedback ────────────────────────────────────────────────────────────────
// The category-first feedback form. Sibling of /contact, deliberately a separate
// page with a different job:
//
//   /contact   "I need a human to answer me"  → email required, reply expected
//   /feedback  "here is one thing to improve" → email OPTIONAL, no reply promised
//
// Making email optional is the whole point. It is the single biggest lever on
// completion for feedback (vs contact), because leaving an address reads as a
// commitment to a conversation the person may not want.
//
// Posts to /api/feedback, which prefixes the email subject with the category
// ([Bug], [Billing], …) so Gmail filters do the triage. There is no database:
// the inbox IS the backlog until it stops being readable.
//
// Deep links preset the form: /feedback?type=bug&from=scroll-wipe-gallery
//
// Follows the site theme like every other long-form page. It used to be dark
// only, which cost nothing back when the site had no light mode to follow, and
// it also pinned the scroll parent dark from JS. Both are gone. The footer lives
// INSIDE <main> so its edges line up with content.

const INPUT_CLASS =
  'w-full rounded-lg border border-sand-300 bg-sand-50 px-3 py-2 text-base text-sand-900 outline-none transition-colors placeholder:text-sand-600 focus:border-olive-500 focus:ring-2 focus:ring-olive-500/20 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-50 md:text-sm'
const LABEL_CLASS =
  'mb-1 block text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400'

type CategoryId = 'general' | 'bug' | 'billing' | 'other'

const CATEGORIES: { id: CategoryId; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'General feedback', icon: <ChatCircleText weight="regular" size={18} /> },
  { id: 'bug', label: 'Found a bug', icon: <Bug weight="regular" size={18} /> },
  { id: 'billing', label: 'Payment or subscription', icon: <CreditCard weight="regular" size={18} /> },
  { id: 'other', label: 'Something else', icon: <DotsThreeCircle weight="regular" size={18} /> },
]

// Rating rail, red → amber → olive. Same visual language as the mood-tracker
// standalone (colored rail, white puck with an accent ring) but built on a
// native range input, so drag, touch, arrow keys, Home/End and the screen-reader
// slider semantics all come from the platform instead of pointer handlers.
const RAIL = 'linear-gradient(90deg, #B4553A 0%, #C08A3E 35%, #C8B44A 65%, #A8B94D 100%)'

// The ring takes the rail's own color at the current stop, so the puck reads as
// picking up whatever it is sitting on. Eleven fixed samples of RAIL rather than
// a gradient interpolator: there are exactly eleven positions, so a lookup is
// both shorter and exact. Regenerate this alongside any change to RAIL.
const RING = [
  '#B4553A', '#B7643B', '#BB733C', '#BE823D', '#C19140', '#C49F44',
  '#C7AD48', '#C3B54A', '#BAB64B', '#B1B84C', '#A8B94D',
]

// Dark core + olive ring, so the puck reads as a hole punched in the rail rather
// than a light dot floating over a dark page. The shadow is two layers: a tight
// contact shadow that seats it on the rail, plus a wider soft one that lifts it.
//
// Every class below must stay a COMPLETE literal string. Tailwind scans source
// text for finished class names, so composing one with a template literal
// (shadow-[${VAR}]) silently generates no CSS at all.
// The ring color arrives as --thumb-ring, set inline on the input: custom
// properties inherit into pseudo-elements, which is the only way to drive a
// ::-webkit-slider-thumb from React state.
const THUMB = [
  '[&::-webkit-slider-thumb]:h-6',
  '[&::-webkit-slider-thumb]:w-6',
  '[&::-webkit-slider-thumb]:appearance-none',
  '[&::-webkit-slider-thumb]:rounded-full',
  '[&::-webkit-slider-thumb]:border-4',
  '[&::-webkit-slider-thumb]:border-[color:var(--thumb-ring)]',
  '[&::-webkit-slider-thumb]:bg-sand-950',
  '[&::-webkit-slider-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.9),0_8px_18px_rgba(0,0,0,0.75)]',
  '[&::-moz-range-thumb]:h-6',
  '[&::-moz-range-thumb]:w-6',
  '[&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:border-4',
  '[&::-moz-range-thumb]:border-[color:var(--thumb-ring)]',
  '[&::-moz-range-thumb]:bg-sand-950',
  '[&::-moz-range-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.9),0_8px_18px_rgba(0,0,0,0.75)]',
].join(' ')

// Selectable chip. Wraps a visually hidden native radio so keyboard support,
// arrow-key roving and form semantics come free instead of being reimplemented
// with role="radio" and a keydown handler.
//
// Layout utilities (gap, padding, direction) stay at the call site: the two chip
// rows want different ones, and this repo has no twMerge helper, so overlapping
// utilities in one string would resolve by CSS order rather than by intent.
const CHIP_BASE =
  'flex cursor-pointer items-center rounded-lg border px-3 text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-olive-500/40'

function chipTone(selected: boolean): string {
  return selected
    ? 'border-olive-500 bg-olive-500/10 text-sand-900 dark:text-sand-50'
    : 'border-sand-300 bg-sand-200 text-sand-700 hover:border-sand-400 hover:text-sand-900 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-300 dark:hover:border-sand-700 dark:hover:text-sand-100'
}

export default function FeedbackPage() {
  const [category, setCategory] = useState<CategoryId>('general')
  // The rating is optional, but a range input always holds a value. `rated`
  // tracks whether it was actually touched, so an untouched slider sends
  // nothing instead of silently reporting a 5.
  const [score, setScore] = useState(5)
  const [rated, setRated] = useState(false)
  const [message, setMessage] = useState('')
  const [where, setWhere] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot — must stay empty
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Deep-link presets, read from window rather than useSearchParams so the page
  // needs no Suspense boundary and keeps static rendering.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get('type')
    if (type && CATEGORIES.some((c) => c.id === type)) setCategory(type as CategoryId)
    const from = params.get('from')
    if (from) setWhere(from.slice(0, 200))
  }, [])

  // "How is it going" is tone-deaf to someone who was charged twice.
  const showScore = category !== 'billing'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          score: showScore && rated ? score : null,
          message,
          where,
          email,
          website,
          // Attached silently. Asking a person for their browser version is
          // friction and they get it wrong anyway.
          context: {
            referrer: document.referrer || '',
            viewport: `${window.innerWidth}x${window.innerHeight}`,
          },
        }),
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
          href="/feedback"
          className="text-sm font-semibold text-olive-600 transition-colors hover:text-olive-800 dark:text-olive-500 dark:hover:text-olive-400"
        >
          /Feedback
        </Link>
        <div className="flex items-center justify-end">
          <HeaderSocials />
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pt-6 pb-8 sm:px-6 sm:pt-12">
        <div className="flex-1">
          <p className="mb-6 text-sm font-semibold md:hidden">
            <span className="text-olive-600 dark:text-olive-500">/Feedback</span>
          </p>

          <h1 className="text-center text-3xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-4xl">
            Feedback
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-sand-600 dark:text-sand-400">
            One thing we should fix, build, or stop doing. Pick a category and
            say it in a sentence. We read every one, and this is what decides
            what we work on next.
          </p>

          {sent ? (
            <div className="mx-auto mt-8 w-full max-w-xl rounded-2xl border border-olive-500/30 bg-olive-500/10 p-6">
              <div className="flex items-start gap-3">
                <CheckCircle weight="regular" size={22} className="mt-0.5 shrink-0 text-olive-600 dark:text-olive-400" />
                <div>
                  <h2 className="text-base font-bold text-sand-900 dark:text-sand-50">Got it, thank you</h2>
                  <p className="mt-1 text-sm leading-relaxed text-sand-700 dark:text-sand-300">
                    We read every single one. If it needs an answer we&apos;ll
                    write to <strong className="text-sand-900 dark:text-sand-100">{email}</strong>.
                  </p>
                  <Link
                    href="/components"
                    className="mt-4 inline-block text-sm font-semibold text-olive-600 transition-colors hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-300"
                  >
                    Back to components
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 w-full max-w-xl space-y-5 rounded-2xl border border-sand-200 bg-sand-100 p-6 dark:border-sand-800 dark:bg-sand-900 sm:p-8"
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

              <fieldset>
                <legend className={LABEL_CLASS}>What&apos;s this about?</legend>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {CATEGORIES.map((c) => (
                    <label key={c.id} className={`${CHIP_BASE} gap-2 py-2.5 ${chipTone(category === c.id)}`}>
                      <input
                        type="radio"
                        name="category"
                        value={c.id}
                        checked={category === c.id}
                        onChange={() => setCategory(c.id)}
                        className="sr-only"
                      />
                      <span className="shrink-0">{c.icon}</span>
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {showScore && (
                <div>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="score" className={LABEL_CLASS}>
                      How has AI Canvas been so far?
                    </label>
                    <span
                      className={`text-xs font-semibold tabular-nums ${rated ? 'text-olive-600 dark:text-olive-400' : 'text-sand-600 dark:text-sand-500'}`}
                    >
                      {rated ? `${score} / 10` : 'optional'}
                    </span>
                  </div>

                  {/* Alignment rule: track height == thumb height == input
                      height (all h-6), then the input and the rail are each
                      centred on the box. WebKit aligns the thumb's TOP to the
                      track's top rather than centring it, so any track taller
                      than the thumb pushes the puck above the rail. Keeping the
                      three equal makes top-aligned and centred the same thing,
                      which is why there is no margin offset here to drift. */}
                  <div className="relative mt-2 h-9 w-full rounded-full has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-olive-500/40">
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full transition-opacity ${rated ? 'opacity-100' : 'opacity-40'}`}
                      style={{ background: RAIL }}
                    />
                    <input
                      id="score"
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={score}
                      onChange={(e) => {
                        setScore(Number(e.target.value))
                        setRated(true)
                      }}
                      aria-valuetext={rated ? `${score} out of 10` : 'not rated'}
                      style={{ '--thumb-ring': RING[score] } as React.CSSProperties}
                      className={`absolute inset-x-0 top-1/2 m-0 h-6 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent outline-none [&::-webkit-slider-runnable-track]:h-6 [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:h-6 [&::-moz-range-track]:bg-transparent ${THUMB} ${rated ? '' : 'opacity-70'}`}
                    />
                  </div>

                  <div className="mt-1 flex justify-between text-xs text-sand-600 dark:text-sand-500">
                    <span>Rough</span>
                    <span>Great</span>
                  </div>
                </div>
              )}

              {category === 'bug' && (
                <div>
                  <label htmlFor="where" className={LABEL_CLASS}>
                    Where did it happen?
                  </label>
                  <input
                    id="where"
                    type="text"
                    maxLength={200}
                    placeholder="Component name or page URL"
                    value={where}
                    onChange={(e) => setWhere(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
              )}

              <div>
                <label htmlFor="message" className={LABEL_CLASS}>
                  {category === 'bug'
                    ? 'What happened, and what did you expect?'
                    : category === 'billing'
                      ? 'What went wrong?'
                      : 'Your feedback'}{' '}
                  {/* Decorative: the required state itself comes from the input's
                      `required` attribute, which is what assistive tech reads. */}
                  <span aria-hidden="true" className="text-olive-600 dark:text-olive-400">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  // No autoFocus: it would scroll the category chips out of view
                  // on load and pop the mobile keyboard before the first choice.
                  maxLength={5000}
                  rows={6}
                  placeholder={
                    category === 'bug'
                      ? 'I clicked the copy button and nothing happened. I expected the code on my clipboard.'
                      : 'Say it however you like. One sentence is plenty.'
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${INPUT_CLASS} min-h-[140px] resize-y`}
                />
              </div>

              <div>
                <label htmlFor="email" className={LABEL_CLASS}>
                  {category === 'billing' ? 'Email used at checkout' : 'Email'}{' '}
                  <span aria-hidden="true" className="text-olive-600 dark:text-olive-400">*</span>
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

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" size="md" fullWidth disabled={submitting}>
                {submitting ? 'Sending…' : 'Send feedback'}
              </Button>

              {/* The attached page/screen/browser details are spelled out in the
                  Feedback form section of /privacy rather than on the form, so
                  this link is the point-of-collection notice. Keep it. */}
              <div className="space-y-1.5 text-center">
                <p className="text-xs leading-relaxed text-sand-600 dark:text-sand-400">
                  Good or bad, we read and appreciate every message. Honest
                  feedback is what keeps pushing AI Canvas forward.
                </p>
                {/* Only true while the route uses the address for reply_to and
                    nothing else: no Brevo call, no list. If the form is ever
                    wired to the newsletter, this line has to change. */}
                <p className="text-xs leading-relaxed text-sand-600 dark:text-sand-500">
                  We only use your email to reply.{' '}
                  <Link href="/privacy" className="underline underline-offset-2 hover:text-sand-900 dark:hover:text-sand-300">
                    Privacy policy
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>

        <SiteFooter />
      </main>
    </div>
  )
}
